<template>
  <view class="post-container">
    <!-- 内容输入区 -->
    <view class="content-section">
      <u-textarea
        v-model="formData.content"
        placeholder="分享你的想法..."
        maxlength="1000"
        :autoHeight="true"
        :border="false"
        :showWordLimit="true"
        customStyle="font-size: 32rpx; min-height: 300rpx;"
      />
    </view>

    <!-- 添加图片 -->
    <view class="images-section">
      <view class="image-list">
        <view
          v-for="(img, index) in formData.images"
          :key="index"
          class="image-item"
        >
          <image :src="img" class="image-preview" mode="aspectFill" @click="previewImage(index)"></image>
          <view class="image-delete" @click="deleteImage(index)">
            <u-icon name="close" size="16" color="#fff"></u-icon>
          </view>
        </view>
        <view
          v-if="formData.images.length < 9"
          class="image-add"
          @click="chooseImage"
        >
          <u-icon name="camera" size="36" color="#ccc"></u-icon>
          <text class="add-text">{{ formData.images.length }}/9</text>
        </view>
      </view>
    </view>

    <!-- 学校信息 -->
    <view class="info-section">
      <view class="info-item">
        <u-icon name="home" size="20" color="#2979FF"></u-icon>
        <text class="info-text">{{ userStore.userInfo?.school || '请先选择学校' }}</text>
      </view>
    </view>

    <!-- 提示信息 -->
    <view class="tips-section">
      <text class="tips-text">请遵守社区规范，发布健康向上的内容</text>
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
      >
        <template #default>
          <text v-if="!loading">发布</text>
          <text v-else>审核中...</text>
        </template>
      </u-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { postApi } from '@/api'

const userStore = useUserStore()

const formData = ref({
  content: '',
  images: [] as string[]
})

const loading = ref(false)

// 检查是否可以发布
const canPost = computed(() => {
  return formData.value.content.trim().length > 0 &&
    formData.value.content.length <= 1000 &&
    userStore.isLoggedIn &&
    userStore.isMember &&
    !loading.value
})

// 检查会员状态
onMounted(() => {
  userStore.checkLoginStatus()

  if (!userStore.isLoggedIn) {
    uni.showModal({
      title: '提示',
      content: '请先登录',
      showCancel: false,
      success: () => {
        uni.navigateBack()
      }
    })
    return
  }

  if (!userStore.isMember) {
    uni.showModal({
      title: '提示',
      content: '请先开通会员',
      showCancel: false,
      success: () => {
        uni.navigateBack()
      }
    })
  }
})

// 选择图片
const chooseImage = () => {
  const remainCount = 9 - formData.value.images.length

  uni.chooseImage({
    count: remainCount,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      // 检查图片大小，超过2M的提示
      const tempFiles = res.tempFiles || []
      const validFiles: string[] = []

      for (const file of tempFiles) {
        if (file.size && file.size > 2 * 1024 * 1024) {
          uni.showToast({
            title: '图片不能超过2M',
            icon: 'none'
          })
        } else {
          validFiles.push(file.path)
        }
      }

      formData.value.images.push(...validFiles)
    }
  })
}

// 删除图片
const deleteImage = (index: number) => {
  formData.value.images.splice(index, 1)
}

// 预览图片
const previewImage = (index: number) => {
  uni.previewImage({
    urls: formData.value.images,
    current: index
  })
}

// 发布
const handlePost = async () => {
  if (!canPost.value) {
    if (!userStore.isMember) {
      uni.showToast({
        title: '请先开通会员',
        icon: 'none'
      })
    }
    return
  }

  loading.value = true

  try {
    // 这里先上传图片到云存储，然后调用云函数
    // 为简化演示，我们直接调用云函数（图片上传逻辑需要根据实际云存储实现）

    const res = await postApi.createPost({
      content: formData.value.content,
      images: formData.value.images,
      user_id: userStore.userInfo?._id
    })

    if (res.code === 0) {
      uni.showToast({
        title: '发布成功',
        icon: 'success'
      })

      // 清空表单
      formData.value = {
        content: '',
        images: []
      }

      // 返回首页并刷新
      setTimeout(() => {
        uni.navigateBack()
      }, 1000)
    } else {
      uni.showToast({
        title: res.message || '发布失败',
        icon: 'none',
        duration: 2000
      })
    }
  } catch (error: any) {
    console.error('发布失败:', error)

    let errMsg = '发布失败，请重试'
    if (error.message && error.message.includes('违规')) {
      errMsg = '内容包含违规信息，请修改后再发布'
    } else if (error.message && error.message.includes('会员')) {
      errMsg = '请先开通会员'
    }

    uni.showToast({
      title: errMsg,
      icon: 'none',
      duration: 2500
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

.content-section {
  background: #fff;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.images-section {
  background: #fff;
  padding: 32rpx;
  margin-bottom: 16rpx;

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
        border-radius: 16rpx;
      }

      .image-delete {
        position: absolute;
        top: -12rpx;
        right: -12rpx;
        width: 44rpx;
        height: 44rpx;
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
      border-radius: 16rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8rpx;
      color: #ccc;

      .add-text {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}

.info-section {
  background: #fff;
  padding: 32rpx;
  margin-bottom: 16rpx;

  .info-item {
    display: flex;
    align-items: center;
    gap: 12rpx;
    font-size: 28rpx;
    color: #666;
    background: #f8f9fa;
    padding: 24rpx;
    border-radius: 16rpx;

    .info-text {
      color: #333;
    }
  }
}

.tips-section {
  padding: 0 32rpx;
  margin-top: 24rpx;

  .tips-text {
    font-size: 24rpx;
    color: #999;
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
</style>
