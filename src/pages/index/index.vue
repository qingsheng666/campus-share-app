<template>
  <view class="index-container">
    <!-- 顶部搜索栏 -->
    <view class="search-bar" @click="handleSearch">
      <u-icon name="search" size="18" color="#999"></u-icon>
      <text class="search-placeholder">搜索本校内容...</text>
    </view>

    <!-- 分类标签 -->
    <view class="tabs">
      <scroll-view scroll-x="true" class="tab-scroll" show-scrollbar="false">
        <view class="tab-list">
          <view
            v-for="(tab, index) in tabs"
            :key="index"
            class="tab-item"
            :class="{ active: currentTab === index }"
            @click="switchTab(index)"
          >
            {{ tab }}
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 帖子列表 -->
    <scroll-view
      scroll-y="true"
      class="post-list"
      @scrolltolower="loadMore"
      refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="postList.length === 0 && !loading" class="empty-state">
        <text class="empty-icon">📝</text>
        <text class="empty-text">暂无内容，快去发布第一条帖子吧~</text>
      </view>

      <view
        v-for="post in postList"
        :key="post._id"
        class="post-card"
        @click="goDetail(post._id)"
      >
        <view class="post-header">
          <image :src="post.avatar || '/static/default-avatar.png'" class="avatar"></image>
          <view class="user-info">
            <text class="nickname">{{ post.nickname }}</text>
            <text class="time">{{ post.time }}</text>
          </view>
        </view>

        <view class="post-content" @click.stop>
          <text
            class="post-text"
            :class="{ expanded: post._showAll }"
            @click.stop="toggleContent(post)"
          >
            {{ post.content }}
          </text>
          <text
            v-if="shouldShowExpandBtn(post)"
            class="expand-btn"
            @click.stop="toggleContent(post)"
          >
            {{ post._showAll ? '收起' : '展开' }}
          </text>
        </view>

        <view v-if="post.images && post.images.length > 0" class="post-images" @click.stop>
          <view
            v-for="(img, idx) in post.images.slice(0, 9)"
            :key="idx"
            class="image-wrapper"
            :class="{
              'single-image': post.images.length === 1,
              'double-image': post.images.length === 2,
              'triple-image': post.images.length >= 3
            }"
            @click="previewImage(post.images, idx)"
          >
            <image :src="img" class="post-image" mode="aspectFill"></image>
            <view
              v-if="idx === 2 && post.images.length > 3"
              class="more-overlay"
            >
              <text class="more-text">+{{ post.images.length - 3 }}</text>
            </view>
          </view>
        </view>

        <view class="post-footer">
          <view class="footer-item" @click.stop="handleLike(post)">
            <u-icon
              :name="post.is_liked ? 'heart-fill' : 'heart'"
              size="16"
              :color="post.is_liked ? '#ff4d4f' : '#999'"
            ></u-icon>
            <text :class="{ 'liked-text': post.is_liked }">{{ post.like_count }}</text>
          </view>
          <view class="footer-item" @click.stop="goDetail(post._id)">
            <u-icon name="chatbubble" size="16" color="#999"></u-icon>
            <text>{{ post.comment_count }}</text>
          </view>
          <view class="footer-item">
            <u-icon name="share" size="16" color="#999"></u-icon>
          </view>
        </view>
      </view>

      <view v-if="loading" class="loading-more">
        <u-loading mode="circle" size="24"></u-loading>
        <text>加载中...</text>
      </view>

      <view v-if="!hasMore && postList.length > 0" class="no-more">
        <text>没有更多了</text>
      </view>
    </scroll-view>

    <!-- 发布按钮 -->
    <view class="fab-btn" @click="goPost">
      <u-icon name="plus" size="28" color="#fff"></u-icon>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onShow, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { postApi } from '@/api'

const userStore = useUserStore()

const currentTab = ref(0)
const tabs = ['本校', '关注', '推荐']
const postList = ref<Post[]>([])
const refreshing = ref(false)
const loading = ref(false)
const hasMore = ref(true)
const lastCreateTime = ref<Date | null>(null)
const pageSize = 20

// 判断内容是否需要展开按钮
const shouldShowExpandBtn = (post: Post) => {
  return post.content && post.content.length > 120
}

// 切换内容展开/收起
const toggleContent = (post: Post) => {
  post._showAll = !post._showAll
}

// 加载帖子
const loadPosts = async (isRefresh = false) => {
  if (!userStore.schoolId) {
    console.warn('缺少 school_id')
    return
  }

  loading.value = true

  try {
    const res = await postApi.getSchoolPosts({
      school_id: userStore.schoolId,
      pageSize,
      lastCreateTime: isRefresh ? null : lastCreateTime.value,
      current_user_id: userStore.userInfo?._id
    })

    if (res.code === 0 && res.data) {
      if (isRefresh) {
        postList.value = res.data.list.map(p => ({ ...p, _showAll: false }))
      } else {
        const newPosts = res.data.list.map(p => ({ ...p, _showAll: false }))
        postList.value = [...postList.value, ...newPosts]
      }

      hasMore.value = res.data.hasMore
      lastCreateTime.value = res.data.lastCreateTime || null
    }
  } catch (error) {
    console.error('加载帖子失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 刷新
const onRefresh = async () => {
  refreshing.value = true
  try {
    await loadPosts(true)
  } finally {
    refreshing.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (loading.value || !hasMore.value) return
  loadPosts(false)
}

// 切换标签
const switchTab = (index: number) => {
  currentTab.value = index
  postList.value = []
  loadPosts(true)
}

// 点赞
const handleLike = async (post: Post) => {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({
      url: '/pages/login/index'
    })
    return
  }

  try {
    const res = await postApi.likePost({
      post_id: post._id!,
      action: 'toggle',
      user_id: userStore.userInfo?._id
    })

    if (res.code === 0 && res.data) {
      post.is_liked = res.data.is_liked
      post.like_count = res.data.like_count
    }
  } catch (error) {
    console.error('点赞失败:', error)
  }
}

// 预览图片
const previewImage = (images: string[], current: number) => {
  uni.previewImage({
    urls: images,
    current
  })
}

// 跳转详情
const goDetail = (id?: string) => {
  console.log('跳转详情:', id)
}

// 跳转发布
const goPost = () => {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({
      url: '/pages/login/index'
    })
    return
  }

  if (!userStore.isMember) {
    uni.showToast({
      title: '请先开通会员',
      icon: 'none'
    })
    return
  }

  uni.navigateTo({
    url: '/pages/post/index'
  })
}

// 搜索
const handleSearch = () => {
  console.log('搜索')
}

onMounted(() => {
  userStore.checkLoginStatus()
})

onShow(() => {
  if (userStore.schoolId) {
    loadPosts(true)
  }
})
</script>

<style lang="scss" scoped>
.index-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.search-bar {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 24rpx 32rpx;
  gap: 16rpx;

  .search-placeholder {
    font-size: 28rpx;
    color: #999;
  }
}

.tabs {
  background: #fff;
  border-bottom: 1rpx solid #eee;

  .tab-scroll {
    white-space: nowrap;
  }

  .tab-list {
    display: inline-flex;
    padding: 0 32rpx;
  }

  .tab-item {
    display: inline-block;
    padding: 24rpx 32rpx;
    font-size: 28rpx;
    color: #666;
    position: relative;

    &.active {
      color: #2979FF;
      font-weight: bold;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 48rpx;
        height: 4rpx;
        background: #2979FF;
        border-radius: 2rpx;
      }
    }
  }
}

.post-list {
  flex: 1;
  padding: 24rpx;
}

.post-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;

  .avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 20rpx;
    background: #f0f0f0;
  }

  .user-info {
    flex: 1;
    display: flex;
    flex-direction: column;

    .nickname {
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
    }

    .time {
      font-size: 24rpx;
      color: #999;
      margin-top: 4rpx;
    }
  }
}

.post-content {
  margin-bottom: 24rpx;

  .post-text {
    font-size: 30rpx;
    color: #333;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    white-space: pre-wrap;
    word-break: break-word;

    &.expanded {
      display: block;
      -webkit-line-clamp: unset;
    }
  }

  .expand-btn {
    font-size: 28rpx;
    color: #2979FF;
    margin-top: 8rpx;
    display: inline-block;
  }
}

.post-images {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 24rpx;

  .image-wrapper {
    position: relative;
    overflow: hidden;
    border-radius: 16rpx;
    background: #f0f0f0;

    &.single-image {
      width: 100%;
      max-height: 600rpx;
      aspect-ratio: 4/3;
    }

    &.double-image {
      width: calc(50% - 6rpx);
      aspect-ratio: 1;
    }

    &.triple-image {
      width: calc(33.333% - 8rpx);
      aspect-ratio: 1;
    }
  }

  .post-image {
    width: 100%;
    height: 100%;
  }

  .more-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;

    .more-text {
      font-size: 40rpx;
      color: #fff;
      font-weight: 500;
    }
  }
}

.post-footer {
  display: flex;
  align-items: center;
  gap: 48rpx;

  .footer-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 24rpx;
    color: #999;

    .liked-text {
      color: #ff4d4f;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rpx 0;

  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 32rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}

.loading-more,
.no-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 32rpx;
  font-size: 24rpx;
  color: #999;
}

.fab-btn {
  position: fixed;
  right: 48rpx;
  bottom: 160rpx;
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #2979FF 0%, #448AFF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(41, 121, 255, 0.4);
}
</style>
