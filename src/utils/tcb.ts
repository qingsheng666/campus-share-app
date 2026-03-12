import cloud from '@cloudbase/js-sdk'

// 腾讯云开发环境ID，请在此处替换为你的实际环境ID
const TCB_ENV_ID = 'campus-4gtohna7154aa61e'

let tcbApp: any = null

/**
 * 初始化腾讯云开发
 */
export function initTcb() {
  if (tcbApp) {
    return tcbApp
  }

  try {
    tcbApp = cloud.init({
      env: TCB_ENV_ID
    })
    console.log('腾讯云开发初始化成功')
    return tcbApp
  } catch (error) {
    console.error('腾讯云开发初始化失败:', error)
    return null
  }
}

/**
 * 获取TCB实例
 */
export function getTcbApp() {
  if (!tcbApp) {
    return initTcb()
  }
  return tcbApp
}

/**
 * 获取数据库实例
 */
export function getDb() {
  const app = getTcbApp()
  if (!app) {
    throw new Error('TCB未初始化')
  }
  return app.database()
}

/**
 * 获取云函数调用实例
 */
export function getCloudFunction() {
  const app = getTcbApp()
  if (!app) {
    throw new Error('TCB未初始化')
  }
  return app.callFunction
}

/**
 * 获取存储实例
 */
export function getStorage() {
  const app = getTcbApp()
  if (!app) {
    throw new Error('TCB未初始化')
  }
  return app.uploadFile
}
