<template>
  <view class="login-container">
    <view class="logo-area">
      <view class="logo">🎓</view>
      <text class="app-name">校园分享</text>
      <text class="slogan">连接每一个校园故事</text>
    </view>

    <view class="form-area">
      <view class="form-item">
        <u-input
          v-model="phone"
          placeholder="请输入手机号"
          type="number"
          maxlength="11"
          :clearable="true"
        >
          <template #prefix>
            <text class="prefix-icon">📱</text>
          </template>
        </u-input>
      </view>

      <view class="form-item">
        <u-input
          v-model="code"
          placeholder="请输入验证码"
          type="number"
          maxlength="6"
          :clearable="true"
        >
          <template #prefix>
            <text class="prefix-icon">🔐</text>
          </template>
          <template #suffix>
            <u-button
              :text="countdown > 0 ? `${countdown}s` : '获取验证码'"
              type="primary"
              size="small"
              :disabled="countdown > 0 || !phoneValid"
              :loading="sendingCode"
              @click="sendCode"
            />
          </template>
        </u-input>
      </view>

      <view class="btn-area">
        <u-button
          text="登录"
          type="primary"
          size="large"
          :loading="loggingIn"
          :disabled="!canLogin"
          @click="handleLogin"
        />
      </view>

      <view class="agreement">
        <u-checkbox
          v-model="agree"
          shape="circle"
          size="14"
          active-color="#2979FF"
        >
          <text class="agreement-text">
            我已阅读并同意
            <text class="link" @click.stop="viewAgreement('user')">《用户协议》</text>
            和
            <text class="link" @click.stop="viewAgreement('privacy')">《隐私政策》</text>
          </text>
        </u-checkbox>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { authApi } from '@/api'

const userStore = useUserStore()

const phone = ref('')
const code = ref('')
const agree = ref(false)
const loggingIn = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)

// 检查本地登录态
onMounted(() => {
  userStore.checkLoginStatus()
  if (userStore.isLoggedIn) {
    uni.switchTab({
      url: '/pages/index/index'
    })
  }
})

const phoneValid = computed(() => {
  return /^1[3-9]\d{9}$/.test(phone.value)
})

const canLogin = computed(() => {
  return phoneValid.value && code.value.length === 6 && agree.value
})

// 发送验证码
const sendCode = async () => {
  if (!phoneValid.value) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    })
    return
  }

  sendingCode.value = true

  try {
    const res = await authApi.sendSms(phone.value)

    if (res.code === 0) {
      // 生产环境不显示验证码，这里仅用于演示
      if (res.data?.verify_code) {
        uni.showToast({
          title: `验证码: ${res.data.verify_code}`,
          icon: 'none',
          duration: 3000
        })
      } else {
        uni.showToast({
          title: '验证码已发送',
          icon: 'success'
        })
      }

      // 倒计时
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    } else {
      uni.showToast({
        title: res.message || '发送失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.showToast({
      title: '发送失败，请重试',
      icon: 'none'
    })
  } finally {
    sendingCode.value = false
  }
}

// 登录
const handleLogin = async () => {
  if (!canLogin.value) return

  loggingIn.value = true

  try {
    const res = await authApi.login({
      phone: phone.value,
      code: code.value
    })

    if (res.code === 0 && res.data) {
      const { token, openid, is_new_user, user_info } = res.data

      // 保存登录信息
      uni.setStorageSync('token', token)
      uni.setStorageSync('openid', openid)

      if (is_new_user) {
        // 新用户，跳转到信息填写页
        uni.showToast({
          title: '请完善个人信息',
          icon: 'none'
        })

        setTimeout(() => {
          uni.redirectTo({
            url: '/pages/register/index'
          })
        }, 1000)
      } else if (user_info) {
        // 老用户，更新用户信息并跳转首页
        userStore.setLoginInfo(token, {
          _id: user_info._id,
          nickname: user_info.nickname,
          avatar: user_info.avatar,
          school_id: user_info.school_id,
          school_name: user_info.school_name,
          grade: user_info.grade,
          hobbies: user_info.hobbies,
          member_expire_time: user_info.member_expire_time
        })

        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })

        setTimeout(() => {
          uni.switchTab({
            url: '/pages/index/index'
          })
        }, 1000)
      }
    } else {
      uni.showToast({
        title: res.message || '登录失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.showToast({
      title: '登录失败，请重试',
      icon: 'none'
    })
  } finally {
    loggingIn.value = false
  }
}

// 查看协议
const viewAgreement = (type: 'user' | 'privacy') => {
  uni.showToast({
    title: type === 'user' ? '用户协议' : '隐私政策',
    icon: 'none'
  })
  // 实际项目可以跳转到协议页面
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #2979FF 0%, #E3F2FD 100%);
  padding: 0 64rpx;
  display: flex;
  flex-direction: column;
}

.logo-area {
  padding-top: 200rpx;
  padding-bottom: 100rpx;
  text-align: center;

  .logo {
    font-size: 120rpx;
    margin-bottom: 32rpx;
  }

  .app-name {
    display: block;
    font-size: 48rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 16rpx;
  }

  .slogan {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.9);
  }
}

.form-area {
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.form-item {
  margin-bottom: 32rpx;

  :deep(.u-input) {
    background: #f5f7fa;
    border-radius: 16rpx;
    padding: 24rpx 32rpx;
  }
}

.prefix-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.btn-area {
  margin-top: 48rpx;

  :deep(.u-button) {
    border-radius: 50rpx;
    height: 96rpx;
    font-size: 32rpx;
  }
}

.agreement {
  margin-top: 32rpx;

  .agreement-text {
    font-size: 24rpx;
    color: #999;
  }

  .link {
    color: #2979FF;
  }
}
</style>
