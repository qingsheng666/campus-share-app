<template>
  <view class="mine-container">
    <!-- 未登录状态 -->
    <view v-if="!userStore.isLoggedIn" class="not-login">
      <view class="login-prompt" @click="goLogin">
        <view class="avatar-placeholder">
          <u-icon name="account" size="48" color="#ccc"></u-icon>
        </view>
        <view class="login-text">
          <text class="login-title">点击登录</text>
          <text class="login-desc">登录后查看更多内容</text>
        </view>
        <u-icon name="arrow-right" size="18" color="#ccc"></u-icon>
      </view>
    </view>

    <!-- 已登录状态 -->
    <view v-else class="user-header">
      <image :src="userStore.userInfo?.avatar || ''" class="avatar"></image>
      <view class="user-info">
        <text class="nickname">{{ userStore.userInfo?.nickname }}</text>
        <text class="school">{{ userStore.userInfo?.school }}</text>
      </view>
      <view class="edit-btn" @click="goEdit">
        <u-icon name="edit-pen" size="16" color="#2979FF"></u-icon>
        <text>编辑</text>
      </view>
    </view>

    <!-- 数据统计 -->
    <view v-if="userStore.isLoggedIn" class="stats-card">
      <view class="stat-item">
        <text class="stat-num">{{ stats.posts }}</text>
        <text class="stat-label">帖子</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-num">{{ stats.followers }}</text>
        <text class="stat-label">粉丝</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-num">{{ stats.following }}</text>
        <text class="stat-label">关注</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-num">{{ stats.likes }}</text>
        <text class="stat-label">获赞</text>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-list">
      <view
        v-for="(group, groupIdx) in menuGroups"
        :key="groupIdx"
        class="menu-group"
      >
        <view
          v-for="(item, itemIdx) in group"
          :key="itemIdx"
          class="menu-item"
          @click="handleMenuClick(item)"
        >
          <view class="menu-left">
            <text class="menu-icon">{{ item.icon }}</text>
            <text>{{ item.name }}</text>
          </view>
          <view class="menu-right">
            <text v-if="item.badge" class="menu-badge">{{ item.badge }}</text>
            <u-icon name="arrow-right" size="14" color="#ccc"></u-icon>
          </view>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view v-if="userStore.isLoggedIn" class="logout-area">
      <u-button
        text="退出登录"
        type="error"
        plain
        size="large"
        @click="handleLogout"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const stats = ref({
  posts: 12,
  followers: 256,
  following: 88,
  likes: 1024
})

const menuGroups = ref([
  [
    { name: '我的帖子', icon: '📝', path: '' },
    { name: '我的收藏', icon: '⭐', path: '' },
    { name: '浏览历史', icon: '👀', path: '' }
  ],
  [
    { name: '消息通知', icon: '🔔', path: '', badge: '3' },
    { name: '意见反馈', icon: '💬', path: '' },
    { name: '帮助中心', icon: '❓', path: '' }
  ],
  [
    { name: '设置', icon: '⚙️', path: '' },
    { name: '关于我们', icon: 'ℹ️', path: '' }
  ]
])

const goLogin = () => {
  uni.navigateTo({
    url: '/pages/login/index'
  })
}

const goEdit = () => {
  console.log('编辑资料')
}

const handleMenuClick = (item: any) => {
  console.log('点击菜单:', item.name)
}

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.mine-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 48rpx;
}

.not-login {
  background: #fff;
  padding: 48rpx 32rpx;

  .login-prompt {
    display: flex;
    align-items: center;
    gap: 24rpx;

    .avatar-placeholder {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      background: #f5f7fa;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .login-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8rpx;

      .login-title {
        font-size: 32rpx;
        color: #333;
        font-weight: 500;
      }

      .login-desc {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}

.user-header {
  background: linear-gradient(135deg, #2979FF 0%, #448AFF 100%);
  padding: 80rpx 32rpx 48rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;

  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    border: 4rpx solid rgba(255, 255, 255, 0.3);
  }

  .user-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;

    .nickname {
      font-size: 36rpx;
      color: #fff;
      font-weight: 500;
    }

    .school {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.9);
    }
  }

  .edit-btn {
    display: flex;
    align-items: center;
    gap: 8rpx;
    background: rgba(255, 255, 255, 0.2);
    padding: 16rpx 24rpx;
    border-radius: 40rpx;
    font-size: 24rpx;
    color: #fff;
  }
}

.stats-card {
  background: #fff;
  margin: -32rpx 32rpx 32rpx;
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.05);

  .stat-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;

    .stat-num {
      font-size: 36rpx;
      color: #333;
      font-weight: bold;
    }

    .stat-label {
      font-size: 24rpx;
      color: #999;
    }
  }

  .stat-divider {
    width: 1rpx;
    height: 60rpx;
    background: #eee;
  }
}

.menu-list {
  padding: 0 32rpx;

  .menu-group {
    background: #fff;
    border-radius: 20rpx;
    margin-bottom: 24rpx;
    overflow: hidden;

    .menu-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 32rpx;
      border-bottom: 1rpx solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .menu-left {
        display: flex;
        align-items: center;
        gap: 16rpx;
        font-size: 28rpx;
        color: #333;

        .menu-icon {
          font-size: 32rpx;
        }
      }

      .menu-right {
        display: flex;
        align-items: center;
        gap: 12rpx;

        .menu-badge {
          background: #ff5252;
          color: #fff;
          font-size: 20rpx;
          padding: 4rpx 12rpx;
          border-radius: 20rpx;
        }
      }
    }
  }
}

.logout-area {
  padding: 48rpx 32rpx;

  :deep(.u-button) {
    border-radius: 48rpx;
  }
}
</style>
