// 云函数：发布帖子
// 包含：会员检查、腾讯云内容安全审核、数据库存储

const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 违规内容类型
const RISK_TYPES = [
  'Porn', // 涉黄
  'Illegal', // 违法
  'Polity', // 涉政
  'Abuse', // 辱骂
  'Terror', // 暴恐
  'Ad', // 广告
  'Spam', // 垃圾内容
  'Fraud', // 诈骗
  'Sensitive' // 敏感内容
]

// 检查用户会员状态
async function checkMemberStatus(userId) {
  if (!userId) return false

  const userRes = await db.collection('users').doc(userId).get()
  const user = userRes.data

  if (!user) return false

  // 检查会员有效期
  if (user.member_expire_time) {
    const expireTime = new Date(user.member_expire_time)
    const now = new Date()
    return expireTime > now
  }

  return false
}

// 文字内容安全审核
async function moderateText(content) {
  if (!content || !content.trim()) {
    return { pass: true }
  }

  try {
    // 调用腾讯云内容安全 API - 文本审核
    // 这里使用微信云开发的内容安全能力
    const result = await cloud.openapi.security.msgSecCheck({
      content: content
    })

    return {
      pass: result.errCode === 0,
      errMsg: result.errMsg
    }
  } catch (error) {
    console.error('Text moderation error:', error)

    // 如果审核接口调用失败，做一个简单的本地关键词过滤
    const sensitiveWords = ['广告', '加微信', 'vx:', '联系方式', '电话', '代考', '答案', '作弊']
    const hasSensitive = sensitiveWords.some(word => content.includes(word))

    if (hasSensitive) {
      return {
        pass: false,
        errMsg: '内容包含违规信息，请修改后再发布'
      }
    }

    // 保守策略：审核失败时放行，但标记需要人工复核
    return {
      pass: true,
      needReview: true
    }
  }
}

// 图片内容安全审核
async function moderateImages(images) {
  if (!images || images.length === 0) {
    return { pass: true }
  }

  try {
    for (const imageUrl of images) {
      // 调用腾讯云内容安全 API - 图片审核
      await cloud.openapi.security.imgSecCheck({
        mediaUrl: imageUrl
      })
    }

    return { pass: true }
  } catch (error) {
    console.error('Image moderation error:', error)
    return {
      pass: false,
      errMsg: '图片包含违规内容，请更换图片后再发布'
    }
  }
}

exports.main = async (event, context) => {
  const { content, images = [] } = event

  // 验证参数
  if (!content || content.trim().length === 0) {
    return {
      code: -1,
      message: '请输入内容'
    }
  }

  if (content.length > 1000) {
    return {
      code: -2,
      message: '内容最多1000字'
    }
  }

  if (images.length > 9) {
    return {
      code: -3,
      message: '最多上传9张图片'
    }
  }

  const wxContext = cloud.getWXContext()
  const user_id = wxContext.OPENID || wxContext.UNIONID || event.user_id

  if (!user_id) {
    return {
      code: -4,
      message: '无法获取用户信息，请先登录'
    }
  }

  try {
    // 1. 检查会员状态
    const isMember = await checkMemberStatus(user_id)
    if (!isMember) {
      return {
        code: -5,
        message: '请先开通会员'
      }
    }

    // 2. 获取用户信息（包含 school_id）
    const userRes = await db.collection('users').doc(user_id).get()
    const user = userRes.data

    if (!user) {
      return {
        code: -6,
        message: '用户不存在'
      }
    }

    if (!user.school_id) {
      return {
        code: -7,
        message: '请先完善学校信息'
      }
    }

    // 3. 内容安全审核 - 文字
    const textCheck = await moderateText(content)
    if (!textCheck.pass) {
      return {
        code: -8,
        message: textCheck.errMsg || '内容包含违规信息，请修改后再发布'
      }
    }

    // 4. 内容安全审核 - 图片
    if (images.length > 0) {
      const imageCheck = await moderateImages(images)
      if (!imageCheck.pass) {
        return {
          code: -9,
          message: imageCheck.errMsg || '图片包含违规内容，请更换图片后再发布'
        }
      }
    }

    // 5. 保存到数据库
    const postData = {
      user_id,
      school_id: user.school_id,
      content: content.trim(),
      images: images || [],
      like_count: 0,
      comment_count: 0,
      create_time: new Date(),
      update_time: new Date(),
      status: textCheck.needReview ? 1 : 0 // 需要人工审核标记为1，否则0
    }

    const result = await db.collection('post').add(postData)

    return {
      code: 0,
      message: '发布成功',
      data: {
        post_id: result._id,
        ...postData
      }
    }

  } catch (error) {
    console.error('createPost error:', error)
    return {
      code: -10,
      message: '发布失败，请重试',
      error: error.message
    }
  }
}
