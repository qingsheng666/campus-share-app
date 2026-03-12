// 云函数：获取用户信息
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { user_id, openid } = event

  try {
    let query = {}
    if (user_id) {
      query._id = user_id
    } else if (openid) {
      query._openid = openid
    } else {
      const wxContext = cloud.getWXContext()
      if (wxContext.OPENID) {
        query._openid = wxContext.OPENID
      } else {
        return {
          code: -1,
          message: '缺少用户标识'
        }
      }
    }

    const userRes = await db.collection('users').where(query).get()

    if (userRes.data.length === 0) {
      return {
        code: -2,
        message: '用户不存在'
      }
    }

    const user = userRes.data[0]

    // 检查会员是否过期，转换格式
    let memberExpireTime = user.member_expire_time
    if (memberExpireTime && memberExpireTime.toDate) {
      memberExpireTime = memberExpireTime.toDate()
    }

    // 返回用户信息（过滤敏感字段）
    return {
      code: 0,
      message: '获取成功',
      data: {
        _id: user._id,
        nickname: user.nickname,
        avatar: user.avatar,
        school_id: user.school_id,
        school_name: user.school_name,
        grade: user.grade,
        hobbies: user.hobbies || [],
        member_expire_time: memberExpireTime
      }
    }
  } catch (err) {
    console.error('获取用户信息失败:', err)
    return {
      code: -3,
      message: err.message || '获取失败'
    }
  }
}
