<template>
  <view class="post-container">
    <!-- 选择分类 -->
    <view class="section">
      <view class="section-title">选择分类</view>
      <view class="category-list">
        <view
          v-for="(cat, index) in categories"
          :key="index"
          class="category-item"
          :class="{ active: currentCategory === index }"
          @click="currentCategory = index"
        >
          <text class="cat-icon">{{ cat.icon }}</text>
          <text>{{ cat.name }}</text>
        </view>
      </view>
    </view>

    <!-- 输入标题 -->
    <view class="section">
      <view class="section-title">标题</view>
      <u-input
        v-model="formData.title"
        placeholder="请输入标题（30字以内）"
        maxlength="30"
        :border="false"
        customStyle="font-size: 32rpx"
      />
      <view class="char-count">{{ formData.title.length }}/30</view>
    </view>

    <!-- 输入内容 -->
    <view class="section">
      <view class="section-title">内容</view>
      <u-textarea
        v-model="formData.content"
        placeholder="分享你的想法..."
        maxlength="500"
        :autoHeight="true"
        :border="false"
        customStyle="font-size: 28rpx"
      />
      <view class="char-count">{{ formData.content.length }}/500</view>
    </view>

    <!-- 添加图片 -->
    <view class="section">
      <view class="section-title">图片</view>
      <view class="image-list">
        <view
          v-for="(img, index) in formData.images"
          :key="index"
          class="image-item"
        >
          <image :src="img" class="image-preview"></image>
          <view class="image-delete" @click="deleteImage(index)">
            <u-icon name="close" size="14" color="#fff"></u-icon>
          </view>
        </view>
        <view
          v-if="formData.images.length < 9"
          class="image-add"
          @click="chooseImage"
        >
          <u-icon name="camera" size="32" color="#ccc"></u-icon>
          <text>添加图片</text>
        </view>
      </view>
    </view>

    <!-- 学校信息 -->
    <view class="section">
      <view class="section-title">发布到</view>
      <view class="school-info">
        <u-icon name="home" size="18" color="#2979FF"></u-icon>
        <text>{{ userStore.userInfo?.school || '请先选择学校' }}</text>
      </view>
    </view>

    <!-- 匿名选项 -->
    <view class="section">
      <view class="section-title">其他设置</view>
      <view class="setting-item">
        <text>匿名发布</text>
        <u-switch v-model="formData.anonymous" activeColor="#2979FF"></u-switch>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="footer">
      <u-button
        text="发布"
        type="primary"
        size="large"
        :loading="loading"
        :disabled="!canPost"
        @click="handlePost"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const currentCategory = ref(0)
const categories = [
  { name: '全部', icon: '📝' },
  { name: '表白墙', icon: '💕' },
  { name: '树洞', icon: '🌲' },
  { name: '互助', icon: '🤝' },
  { name: '二手', icon: '📦' },
  { name: '租房', icon: '🏠' },
  { name: '求职', icon: '💼' }
]

const formData = ref({
  title: '',
  content: '',
  images: [] as string[],
  anonymous: false
})

const loading = ref(false)

const canPost = computed(() => {
  return formData.value.title.trim().length > 0 &&
    formData.value.content.trim().length > 0 &&
    userStore.isLoggedIn
})

// 选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: 9 - formData.value.images.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      formData.value.images.push(...res.tempFilePaths)
    }
  })
}

// 删除图片
const deleteImage = (index: number) => {
  formData.value.images.splice(index, 1)
}

// 发布
const handlePost = async () => {
  if (!canPost.value) return

  if (!userStore.isLoggedIn) {
    uni.navigateTo({
      url: '/pages/login/index'
    })
    return
  }

  loading.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 1500))

    uni.showToast({
      title: '发布成功',
      icon: 'success'
    })

    formData.value = {
      title: '',
      content: '',
      images: [],
      anonymous: false
    }

    setTimeout(() => {
      uni.switchTab({
        url: '/pages/index/index'
      })
    }, 1000)
  } catch (error) {
    uni.showToast({
      title: '发布失败，请重试',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.post-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 200rpx;
}

.section {
  background: #fff;
  margin-bottom: 24rpx;
  padding: 32rpx;

  .section-title {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    margin-bottom: 24rpx;
  }
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;

  .category-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
    width: 120rpx;
    padding: 20rpx 0;
    background: #f8f9fa;
    border-radius: 16rpx;
    font-size: 24rpx;
    color: #666;

    .cat-icon {
      font-size: 36rpx;
    }

    &.active {
      background: #E3F2FD;
      color: #2979FF;
    }
  }
}

.char-count {
  text-align: right;
  font-size: 24rpx;
  color: #ccc;
  margin-top: 8rpx;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;

  .image-item {
    position: relative;
    width: 200rpx;
    height: 200rpx;

    .image-preview {
      width: 100%;
      height: 100%;
      border-radius: 12rpx;
      object-fit: cover;
    }

    .image-delete {
      position: absolute;
      top: -12rpx;
      right: -12rpx;
      width: 40rpx;
      height: 40rpx;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .image-add {
    width: 200rpx;
    height: 200rpx;
    border: 2rpx dashed #ddd;
    border-radius: 12rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    color: #ccc;
    font-size: 24rpx;
  }
}

.school-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 28rpx;
  color: #666;
  background: #f8f9fa;
  padding: 24rpx;
  border-radius: 12rpx;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 28rpx;
  color: #666;
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
  }
}
</style>
