<template>
  <view class="register-container">
    <!-- 头像上传 -->
    <view class="avatar-section">
      <view class="avatar-wrapper" @click="chooseAvatar">
        <image v-if="formData.avatar" :src="formData.avatar" class="avatar"></image>
        <view v-else class="avatar-placeholder">
          <u-icon name="camera" size="40" color="#ccc"></u-icon>
          <text class="placeholder-text">点击上传头像</text>
        </view>
      </view>
    </view>

    <!-- 表单区 -->
    <view class="form-area">
      <!-- 昵称 -->
      <view class="form-item">
        <text class="label">昵称 <text class="required">*</text></text>
        <u-input
          v-model="formData.nickname"
          placeholder="请输入昵称（2-20个字符）"
          maxlength="20"
          :clearable="true"
        />
      </view>

      <!-- 选择学校 -->
      <view class="form-item">
        <text class="label">所在学校 <text class="required">*</text></text>
        <view class="picker-wrapper" @click="showSchoolPicker = true">
          <text v-if="selectedUniversity" class="selected-text">{{ selectedUniversity.name }}</text>
          <text v-else class="placeholder">请选择学校</text>
          <u-icon name="arrow-right" size="16" color="#ccc"></u-icon>
        </view>
      </view>

      <!-- 选择年级 -->
      <view class="form-item">
        <text class="label">大学阶段 <text class="required">*</text></text>
        <view class="grade-grid">
          <view
            v-for="(g, idx) in grades"
            :key="idx"
            class="grade-item"
            :class="{ active: formData.grade === g }"
            @click="formData.grade = g"
          >
            {{ g }}
          </view>
        </view>
      </view>

      <!-- 兴趣爱好 -->
      <view class="form-item">
        <text class="label">兴趣爱好（可选）</text>
        <view class="hobby-grid">
          <view
            v-for="(h, idx) in hobbies"
            :key="idx"
            class="hobby-item"
            :class="{ active: formData.hobbies.includes(h) }"
            @click="toggleHobby(h)"
          >
            {{ h }}
          </view>
        </view>
      </view>
    </view>

    <!-- 隐私协议 -->
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

    <!-- 底部按钮 -->
    <view class="footer">
      <u-button
        text="完成"
        type="primary"
        size="large"
        :loading="loading"
        :disabled="!canSubmit"
        @click="handleSubmit"
      />
    </view>

    <!-- 学校选择器 -->
    <u-action-sheet
      :show="showSchoolPicker"
      :actions="schoolActions"
      title="选择学校"
      closeText="取消"
      @close="showSchoolPicker = false"
      @select="onSchoolSelect"
    >
      <template #default>
        <view class="school-search">
          <u-input
            v-model="schoolSearch"
            placeholder="搜索学校名称..."
            :clearable="true"
          />
        </view>
        <scroll-view scroll-y="true" class="school-list">
          <view
            v-for="uni in filteredUniversities"
            :key="uni.id"
            class="school-item"
            @click="selectUniversity(uni)"
          >
            <text class="school-name">{{ uni.name }}</text>
            <text class="school-province">{{ uni.province }}</text>
          </view>
        </scroll-view>
      </template>
    </u-action-sheet>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { authApi } from '@/api'
import { universities, searchUniversities } from '@/data/universities'

const userStore = useUserStore()

const formData = ref({
  nickname: '',
  avatar: '',
  grade: '' as Grade,
  hobbies: [] as string[]
})

const selectedUniversity = ref<University | null>(null)
const schoolSearch = ref('')
const showSchoolPicker = ref(false)
const agree = ref(false)
const loading = ref(false)

const grades: Grade[] = ['大一', '大二', '大三', '大四', '研一', '研二', '研三', '其他']
const hobbies: Hobby[] = ['学习', '运动', '美食', '娱乐', '求职', '摄影', '音乐', '旅行', '游戏', '阅读']

const schoolActions = ref([{ name: '' }]) // 占位，用自定义模板

const filteredUniversities = computed(() => {
  if (!schoolSearch.value.trim()) return universities
  return searchUniversities(schoolSearch.value)
})

const canSubmit = computed(() => {
  return formData.value.nickname.length >= 2 &&
    formData.value.nickname.length <= 20 &&
    formData.value.avatar &&
    selectedUniversity.value &&
    formData.value.grade &&
    agree.value
})

// 选择头像
const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      formData.value.avatar = res.tempFilePaths[0]
    }
  })
}

// 切换兴趣爱好
const toggleHobby = (hobby: string) => {
  const idx = formData.value.hobbies.indexOf(hobby)
  if (idx > -1) {
    formData.value.hobbies.splice(idx, 1)
  } else {
    formData.value.hobbies.push(hobby)
  }
}

// 选择学校
const selectUniversity = (uni: University) => {
  selectedUniversity.value = uni
  showSchoolPicker.value = false
}

const onSchoolSelect = () => {}

// 提交
const handleSubmit = async () => {
  if (!canSubmit.value) return

  loading.value = true

  try {
    const openid = uni.getStorageSync('openid')

    const res = await authApi.registerUser({
      openid,
      phone: uni.getStorageSync('phone') || '',
      school_id: selectedUniversity.value!.id,
      school_name: selectedUniversity.value!.name,
      grade: formData.value.grade,
      nickname: formData.value.nickname,
      avatar: formData.value.avatar,
      hobbies: formData.value.hobbies
    })

    if (res.code === 0 && res.data) {
      const token = uni.getStorageSync('token')

      // 更新用户状态
      userStore.setLoginInfo(token, {
        _id: res.data._id,
        nickname: res.data.nickname,
        avatar: res.data.avatar,
        school_id: res.data.school_id,
        school_name: res.data.school_name,
        grade: res.data.grade,
        hobbies: res.data.hobbies
      })

      uni.showToast({
        title: '注册成功',
        icon: 'success'
      })

      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }, 1000)
    } else {
      uni.showToast({
        title: res.message || '保存失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.showToast({
      title: '保存失败，请重试',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 查看协议
const viewAgreement = (type: 'user' | 'privacy') => {
  uni.showToast({
    title: type === 'user' ? '用户协议' : '隐私政策',
    icon: 'none'
  })
}
</script>

<style lang="scss" scoped>
.register-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 200rpx;
}

.avatar-section {
  background: #fff;
  padding: 60rpx 32rpx;
  display: flex;
  justify-content: center;
  margin-bottom: 16rpx;

  .avatar-wrapper {
    width: 200rpx;
    height: 200rpx;
    border-radius: 50%;
    overflow: hidden;
    position: relative;

    .avatar {
      width: 100%;
      height: 100%;
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      background: #f5f7fa;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8rpx;
      border: 2rpx dashed #ddd;

      .placeholder-text {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}

.form-area {
  background: #fff;
  padding: 0 32rpx;

  .form-item {
    padding: 32rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 24rpx;

      .required {
        color: #ff4d4f;
      }
    }
  }
}

.picker-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f5f7fa;
  border-radius: 12rpx;
  padding: 24rpx;

  .selected-text {
    font-size: 30rpx;
    color: #333;
  }

  .placeholder {
    font-size: 30rpx;
    color: #999;
  }
}

.grade-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;

  .grade-item {
    width: calc(25% - 12rpx);
    padding: 20rpx 0;
    text-align: center;
    font-size: 26rpx;
    color: #666;
    background: #f5f7fa;
    border-radius: 12rpx;

    &.active {
      color: #2979FF;
      background: #E3F2FD;
    }
  }
}

.hobby-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;

  .hobby-item {
    padding: 16rpx 32rpx;
    font-size: 26rpx;
    color: #666;
    background: #f5f7fa;
    border-radius: 40rpx;

    &.active {
      color: #2979FF;
      background: #E3F2FD;
    }
  }
}

.agreement {
  padding: 32rpx;

  .agreement-text {
    font-size: 24rpx;
    color: #999;
  }

  .link {
    color: #2979FF;
  }
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);

  :deep(.u-button) {
    border-radius: 48rpx;
    height: 88rpx;
    font-size: 32rpx;
  }
}

.school-search {
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.school-list {
  max-height: 600rpx;

  .school-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx;
    border-bottom: 1rpx solid #f5f5f5;

    .school-name {
      font-size: 30rpx;
      color: #333;
    }

    .school-province {
      font-size: 24rpx;
      color: #999;
    }
  }
}
</style>
