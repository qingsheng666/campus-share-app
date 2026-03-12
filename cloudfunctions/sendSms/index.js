// 云函数：发送短信验证码
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const EXPIRY_TIME = 5 * 60 * 1000 // 5分钟有效期
const SEND_INTERVAL = 60 * 1000 // 1分钟发送间隔

exports.main = async (event, context) => {
  const { phone } = event

  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    return {
      code: -1,
      message: '手机号格式不正确'
    }
  }

  try {
    // 检查发送频率
    const now = Date.now()
    const recordRes = await db.collection('sms_codes')
      .where({
        phone,
        create_time: _.gt(new Date(now - SEND_INTERVAL))
      })
      .get()

    if (recordRes.data.length > 0) {
      return {
        code: -2,
        message: '发送太频繁，请1分钟后再试'
      }
    }

    // 生成6位验证码
    const code = String(Math.floor(Math.random() * 900000 + 100000))

    // 调用腾讯云短信服务（这里用云开发的短信接口）
    // 实际项目需要配置短信模板
    // const smsRes = await cloud.openapi.cloudbase.sendSms({
    //   envId: cloud.DYNAMIC_CURRENT_ENV,
    //   phoneNumberList: [phone],
    //   templateId: '你的模板ID',
    //   templateParamList: [code, '5']
    // })

    // 为了演示，这里暂存验证码到数据库（实际生产用短信发送）
    console.log(`发送验证码 ${code} 到 ${phone}`)

    // 清理过期验证码
    await db.collection('sms_codes')
      .where({
        phone
      })
      .remove()

    // 保存新验证码
    await db.collection('sms_codes').add({
      phone,
      code,
      create_time: new Date(),
      expire_time: new Date(now + EXPIRY_TIME),
      used: false
    })

    return {
      code: 0,
      message: '发送成功',
      data: {
        // 生产环境不要返回验证码，这里仅用于演示
        verify_code: code
      }
    }
  } catch (err) {
    console.error('发送失败:', err)
    return {
      code: -3,
      message: err.message || '发送失败'
    }
  }
}
