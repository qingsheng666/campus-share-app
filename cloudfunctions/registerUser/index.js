// 云函数：注册/更新用户信息
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const {
    user_id,
    phone,
    school_id,
    school_name,
    grade,
    nickname,
    avatar,
    hobbies,
    openid
  } = event

  // 必填项校验
  if (!school_id || !school_name || !grade || !nickname || !avatar) {
    return {
      code: -1,
      message: '请填写完整信息'
    }
  }

  if (nickname.length < 2 || nickname.length > 20) {
    return {
      code: -2,
      message: '昵称长度需要在2-20个字符之间'
    }
  }

  try {
    const now = new Date()
    const wxContext = cloud.getWXContext()

    // 查询是否已存在用户
    let query = {}
    if (user_id) {
      query._id = user_id
    } else if (openid) {
      query._openid = openid
    } else if (wxContext.OPENID) {
      query._openid = wxContext.OPENID
    }

    let userRes = { data: [] }
    if (Object.keys(query).length > 0) {
      userRes = await db.collection('users').where(query).get()
    }

    const userData = {
      school_id,
      school_name,
      grade,
      nickname,
      avatar,
      hobbies: hobbies || [],
      update_time: now
    }

    // 如果有手机号，加密存储（使用云开发字段加密）
    if (phone) {
      // 实际项目中使用云数据库字段加密
      userData.phone = phone // 生产环境需配置字段加密
    }

    let userId = null

    if (userRes.data.length > 0) {
      // 更新已有用户
      const existingUser = userRes.data[0]
      userId = existingUser._id
      await db.collection('users').doc(userId).update(userData)
    } else {
      // 新建用户
      userData._openid = openid || wxContext.OPENID || phone
      userData.create_time = now
      userData.member_expire_time = null // 默认无会员

      const addRes = await db.collection('users').add(userData)
      userId = addRes._id
    }

    // 返回用户信息（过滤敏感字段）
    return {
      code: 0,
      message: '保存成功',
      data: {
        _id: userId,
        school_id,
        school_name,
        grade,
        nickname,
        avatar,
        hobbies: hobbies || []
      }
    }
  } catch (err) {
    console.error('保存用户信息失败:', err)
    return {
      code: -3,
      message: err.message || '保存失败'
    }
  }
}
