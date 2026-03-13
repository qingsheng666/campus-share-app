// 发布评论云函数
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { post_id, content, parent_id = '0', reply_user_id, user_id } = event
  const { OPENID } = cloud.getWXContext()

  const userId = user_id || OPENID

  if (!post_id || !content) {
    return {
      code: 400,
      message: '缺少必要参数'
    }
  }

  if (!userId) {
    return {
      code: 401,
      message: '请先登录'
    }
  }

  try {
    // 检查用户是否是会员
    let isMember = false
    try {
      const userRes = await db.collection('users').doc(userId).get()
      if (userRes.data) {
        const user = userRes.data
        if (user.member_expire_time) {
          isMember = new Date(user.member_expire_time) > new Date()
        }
      }
    } catch (e) {
      console.log('检查会员状态失败', e)
    }

    if (!isMember) {
      return {
        code: 403,
        message: '请先开通会员'
      }
    }

    // 内容安全审核
    try {
      await cloud.openapi.security.msgSecCheck({
        content: content
      })
    } catch (err) {
      console.log('内容审核未通过:', err)
      return {
        code: 400,
        message: '内容包含违规信息，请修改后再发布'
      }
    }

    // 检查帖子是否存在
    const postRes = await db.collection('post').doc(post_id).get()
    if (!postRes.data) {
      return {
        code: 404,
        message: '帖子不存在'
      }
    }

    // 创建评论
    const now = new Date()
    const commentData = {
      post_id: post_id,
      user_id: userId,
      content: content,
      parent_id: parent_id,
      reply_user_id: reply_user_id,
      like_count: 0,
      create_time: now,
      status: 0
    }

    const result = await db.collection('comment').add({
      data: commentData
    })

    // 更新帖子评论数
    await db.collection('post').doc(post_id).update({
      data: {
        comment_count: _.inc(1),
        update_time: now
      }
    })

    return {
      code: 0,
      message: '评论成功',
      data: {
        comment_id: result._id
      }
    }
  } catch (error) {
    console.error('发布评论失败:', error)

    if (error.errCode === 87014) {
      return {
        code: 400,
        message: '内容包含违规信息，请修改后再发布'
      }
    }

    return {
      code: 500,
      message: '发布失败，请重试',
      error: error.message
    }
  }
}
