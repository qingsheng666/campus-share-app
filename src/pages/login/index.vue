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
              @click="sendCode"
            />
          </template>
        </u-input>
      </view>

      <view class="form-item">
        <u-input
          v-model="school"
          placeholder="请选择/输入学校"
          :clearable="true"
          @click="showSchoolPicker = true"
          readonly
        >
          <template #prefix>
            <text class="prefix-icon">🏫</text>
          </template>
        </u-input>
      </view>

      <view class="btn-area">
        <u-button
          text="登录 / 注册"
          type="primary"
          size="large"
          :loading="loading"
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
            <text class="link">《用户协议》</text>
            和
            <text class="link">《隐私政策》</text>
          </text>
        </u-checkbox>
      </view>
    </view>

    <!-- 学校选择器 -->
    <u-picker
      :show="showSchoolPicker"
      :columns="schoolColumns"
      keyName="name"
      @confirm="onSchoolConfirm"
      @cancel="showSchoolPicker = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const phone = ref('')
const code = ref('')
const school = ref('')
const agree = ref(false)
const loading = ref(false)
const countdown = ref(0)
const showSchoolPicker = ref(false)

// 模拟学校数据
const schoolList = [
  { name: '北京大学' },
  { name: '清华大学' },
  { name: '复旦大学' },
  { name: '上海交通大学' },
  { name: '浙江大学' },
  { name: '南京大学' },
  { name: '中山大学' },
  { name: '华中科技大学' },
  { name: '武汉大学' },
  { name: '西安交通大学' }
]

const schoolColumns = ref([schoolList])

const phoneValid = computed(() => {
  return /^1[3-9]\d{9}$/.test(phone.value)
})

const canLogin = computed(() => {
  return phoneValid.value && code.value.length === 6 && school.value && agree.value
})

// 发送验证码
const sendCode = () => {
  if (!phoneValid.value) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    })
    return
  }

  uni.showToast({
    title: '验证码已发送',
    icon: 'success'
  })

  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 选择学校
const onSchoolConfirm = (e: any) => {
  school.value = e.value[0].name
  showSchoolPicker.value = false
}

// 登录
const handleLogin = async () => {
  if (!canLogin.value) return

  loading.value = true

  try {
    // 模拟登录，实际项目中调用TCB云函数或数据库
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 设置用户信息
    userStore.setLoginInfo('mock_token_' + Date.now(), {
      nickname: '同学' + phone.value.slice(-4),
      avatar: 'https://via.placeholder.com/100',
      school: school.value
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
  } catch (error) {
    uni.showToast({
      title: '登录失败，请重试',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
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
