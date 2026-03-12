// 云函数：验证码登录
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { phone, code, openid } = event

  if (!phone || !code) {
    return {
      code: -1,
      message: '缺少必要参数'
    }
  }

  try {
    // 1. 验证验证码
    const now = Date.now()
    const codeRes = await db.collection('sms_codes')
      .where({
        phone,
        code,
        used: false,
        expire_time: _.gt(new Date())
      })
      .get()

    if (codeRes.data.length === 0) {
      return {
        code: -2,
        message: '验证码错误或已过期'
      }
    }

    // 标记验证码已使用
    const codeDoc = codeRes.data[0]
    await db.collection('sms_codes').doc(codeDoc._id).update({
      used: true,
      use_time: new Date()
    })

    // 2. 查询用户是否存在
    // 注意：这里假设手机号已加密存储，需要用加密字段查询
    const userRes = await db.collection('users')
      .where({
        _openid: openid || codeDoc.phone
      })
      .get()

    let isNewUser = false
    let userInfo = null

    if (userRes.data.length === 0) {
      // 新用户，只返回需要填写信息
      isNewUser = true
    } else {
      // 老用户，返回用户信息（过滤敏感字段）
      const user = userRes.data[0]
      userInfo = {
        _id: user._id,
        nickname: user.nickname,
        avatar: user.avatar,
        school_id: user.school_id,
        school_name: user.school_name,
        grade: user.grade,
        hobbies: user.hobbies,
        member_expire_time: user.member_expire_time
      }
    }

    // 3. 生成token（简单实现，实际可用JWT）
    const token = Buffer.from(`${phone}:${now}`).toString('base64')

    return {
      code: 0,
      message: '登录成功',
      data: {
        token,
        openid: openid || phone,
        is_new_user: isNewUser,
        user_info: userInfo
      }
    }
  } catch (err) {
    console.error('登录失败:', err)
    return {
      code: -3,
      message: err.message || '登录失败'
    }
  }
}
