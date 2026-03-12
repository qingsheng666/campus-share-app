import { defineStore } from 'pinia'
import { ref } from 'vue'

interface UserInfo {
  _id?: string
  nickname: string
  avatar: string
  gender?: number
  school?: string
  major?: string
  grade?: string
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>('')
  const userInfo = ref<UserInfo | null>(null)
  const isLoggedIn = ref<boolean>(false)

  /**
   * 检查登录状态
   */
  const checkLoginStatus = () => {
    const storedToken = uni.getStorageSync('token')
    const storedUserInfo = uni.getStorageSync('userInfo')

    if (storedToken && storedUserInfo) {
      token.value = storedToken
      userInfo.value = storedUserInfo
      isLoggedIn.value = true
    }
  }

  /**
   * 设置登录信息
   */
  const setLoginInfo = (newToken: string, info: UserInfo) => {
    token.value = newToken
    userInfo.value = info
    isLoggedIn.value = true

    uni.setStorageSync('token', newToken)
    uni.setStorageSync('userInfo', info)
  }

  /**
   * 退出登录
   */
  const logout = () => {
    token.value = ''
    userInfo.value = null
    isLoggedIn.value = false

    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')

    uni.reLaunch({
      url: '/pages/login/index'
    })
  }

  /**
   * 更新用户信息
   */
  const updateUserInfo = (info: Partial<UserInfo>) => {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...info }
      uni.setStorageSync('userInfo', userInfo.value)
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    checkLoginStatus,
    setLoginInfo,
    logout,
    updateUserInfo
  }
})
