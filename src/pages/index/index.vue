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
          <image :src="post.avatar" class="avatar"></image>
          <view class="user-info">
            <text class="nickname">{{ post.nickname }}</text>
            <text class="time">{{ post.time }}</text>
          </view>
          <text class="tag">{{ post.school }}</text>
        </view>

        <view class="post-content">
          <text class="post-title">{{ post.title }}</text>
          <text class="post-desc">{{ post.content }}</text>
        </view>

        <view v-if="post.images && post.images.length > 0" class="post-images">
          <image
            v-for="(img, idx) in post.images.slice(0, 3)"
            :key="idx"
            :src="img"
            class="post-image"
            :class="{ single: post.images.length === 1 }"
          ></image>
          <view v-if="post.images.length > 3" class="more-images">
            +{{ post.images.length - 3 }}
          </view>
        </view>

        <view class="post-footer">
          <view class="footer-item">
            <u-icon name="eye" size="14" color="#999"></u-icon>
            <text>{{ post.viewCount }}</text>
          </view>
          <view class="footer-item" @click.stop="handleLike(post)">
            <u-icon :name="post.isLiked ? 'heart-fill' : 'heart'" size="14" :color="post.isLiked ? '#ff5252' : '#999'"></u-icon>
            <text>{{ post.likeCount }}</text>
          </view>
          <view class="footer-item">
            <u-icon name="chatbubble" size="14" color="#999"></u-icon>
            <text>{{ post.commentCount }}</text>
          </view>
          <view class="footer-item">
            <u-icon name="share" size="14" color="#999"></u-icon>
          </view>
        </view>
      </view>

      <view v-if="loading" class="loading-more">
        <u-loading mode="circle" size="24"></u-loading>
        <text>加载中...</text>
      </view>
    </scroll-view>

    <!-- 发布按钮 -->
    <view class="fab-btn" @click="goPost">
      <u-icon name="plus" size="28" color="#fff"></u-icon>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const currentTab = ref(0)
const tabs = ['全部', '表白墙', '树洞', '互助', '二手', '租房', '求职']
const postList = ref<any[]>([])
const refreshing = ref(false)
const loading = ref(false)

// 模拟数据
const mockPosts = [
  {
    _id: '1',
    avatar: 'https://via.placeholder.com/100',
    nickname: '小明同学',
    school: '北京大学',
    time: '2小时前',
    title: '求推荐学校附近好吃的火锅店！',
    content: '最近想吃火锅，有没有同学推荐一下学校附近好吃的火锅店呀～最好是性价比高一点的，适合学生党！',
    images: ['https://via.placeholder.com/200', 'https://via.placeholder.com/200'],
    viewCount: 328,
    likeCount: 45,
    commentCount: 23,
    isLiked: false
  },
  {
    _id: '2',
    avatar: 'https://via.placeholder.com/100',
    nickname: '学霸小李',
    school: '北京大学',
    time: '5小时前',
    title: '出高等数学上下册笔记',
    content: '整理了一份高数笔记，有需要的同学可以联系我～附赠习题集答案，价格可谈！',
    images: [],
    viewCount: 156,
    likeCount: 28,
    commentCount: 12,
    isLiked: true
  },
  {
    _id: '3',
    avatar: 'https://via.placeholder.com/100',
    nickname: '开心果',
    school: '北京大学',
    time: '昨天',
    title: '今天的日落也太美了吧！',
    content: '在图书馆天台看到的日落，分享给大家～ 最近学习压力大，偶尔也要放松一下呀',
    images: ['https://via.placeholder.com/400'],
    viewCount: 892,
    likeCount: 234,
    commentCount: 67,
    isLiked: false
  }
]

onMounted(() => {
  loadPosts()
})

// 加载帖子
const loadPosts = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    postList.value = [...mockPosts]
  } finally {
    loading.value = false
  }
}

// 刷新
const onRefresh = async () => {
  refreshing.value = true
  try {
    await loadPosts()
  } finally {
    refreshing.value = false
  }
}

// 加载更多
const loadMore = () => {
  console.log('加载更多')
}

// 切换标签
const switchTab = (index: number) => {
  currentTab.value = index
  postList.value = []
  loadPosts()
}

// 点赞
const handleLike = (post: any) => {
  post.isLiked = !post.isLiked
  post.likeCount += post.isLiked ? 1 : -1
}

// 跳转详情
const goDetail = (id: string) => {
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
  uni.switchTab({
    url: '/pages/post/index'
  })
}

// 搜索
const handleSearch = () => {
  console.log('搜索')
}
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

  .tag {
    font-size: 22rpx;
    color: #2979FF;
    background: #E3F2FD;
    padding: 8rpx 16rpx;
    border-radius: 8rpx;
  }
}

.post-content {
  margin-bottom: 24rpx;

  .post-title {
    display: block;
    font-size: 32rpx;
    color: #333;
    font-weight: 500;
    margin-bottom: 12rpx;
  }

  .post-desc {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.post-images {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;

  .post-image {
    width: 200rpx;
    height: 200rpx;
    border-radius: 12rpx;
    object-fit: cover;

    &.single {
      width: 400rpx;
      height: 400rpx;
    }
  }

  .more-images {
    width: 200rpx;
    height: 200rpx;
    border-radius: 12rpx;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 36rpx;
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

.loading-more {
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
