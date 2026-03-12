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
      <image :src="userStore.userInfo?.avatar || '/static/default-avatar.png'" class="avatar"></image>
      <view class="user-info">
        <text class="nickname">{{ userStore.userInfo?.nickname }}</text>
        <text class="school">{{ userStore.userInfo?.school_name || userStore.userInfo?.school }}</text>
        <view v-if="memberExpireText" class="member-tag">
          <text class="member-icon">👑</text>
          <text class="member-text">{{ memberExpireText }}</text>
        </view>
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

    <!-- 退出登录/注销账号 -->
    <view v-if="userStore.isLoggedIn" class="logout-area">
      <u-button
        text="退出登录"
        type="error"
        plain
        size="large"
        @click="handleLogout"
      />
      <view class="delete-account" @click="handleDeleteAccount">
        <text>注销账号</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { authApi } from '@/api'

const userStore = useUserStore()

const stats = ref({
  posts: 0,
  followers: 0,
  following: 0,
  likes: 0
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

// 会员到期时间显示
const memberExpireText = computed(() => {
  if (!userStore.userInfo?.member_expire_time) return ''
  try {
    const expireTime = new Date(userStore.userInfo.member_expire_time)
    const now = new Date()
    if (expireTime < now) return ''

    const diff = expireTime.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

    if (days <= 7) {
      return `会员还剩${days}天`
    } else if (days <= 30) {
      return `会员还剩${days}天`
    } else {
      const month = expireTime.getMonth() + 1
      const day = expireTime.getDate()
      return `会员至${month}月${day}日`
    }
  } catch {
    return ''
  }
})

onMounted(() => {
  userStore.checkLoginStatus()
  loadUserInfo()
})

// 加载用户信息
const loadUserInfo = async () => {
  if (!userStore.isLoggedIn) return
  try {
    const openid = uni.getStorageSync('openid')
    const res = await authApi.getUserInfo({ openid })
    if (res.code === 0 && res.data) {
      userStore.updateUserInfo(res.data)
    }
  } catch (e) {
    console.error('加载用户信息失败', e)
  }
}

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

// 退出登录
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

// 注销账号
const handleDeleteAccount = () => {
  uni.showModal({
    title: '重要提示',
    content: '注销账号后，您的所有帖子、评论、个人信息将被永久删除，无法恢复。确定要注销吗？',
    confirmText: '确定注销',
    confirmColor: '#ff4d4f',
    success: (res) => {
      if (res.confirm) {
        // 二次确认
        uni.showModal({
          title: '最终确认',
          content: '此操作不可撤销！真的要注销账号吗？',
          confirmText: '确认',
          confirmColor: '#ff4d4f',
          success: async (res2) => {
            if (res2.confirm) {
              await doDeleteAccount()
            }
          }
        })
      }
    }
  })
}

// 执行注销
const doDeleteAccount = async () => {
  uni.showLoading({ title: '注销中...' })
  try {
    const openid = uni.getStorageSync('openid')
    const res = await authApi.deleteAccount({
      openid,
      confirm: true
    })

    if (res.code === 0) {
      uni.hideLoading()
      uni.showToast({
        title: '注销成功',
        icon: 'success'
      })
      setTimeout(() => {
        userStore.logout()
      }, 1500)
    } else {
      uni.hideLoading()
      uni.showToast({
        title: res.message || '注销失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '注销失败，请重试',
      icon: 'none'
    })
  }
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
    background: rgba(255, 255, 255, 0.2);
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

    .member-tag {
      display: inline-flex;
      align-items: center;
      gap: 6rpx;
      background: rgba(255, 215, 0, 0.2);
      padding: 8rpx 16rpx;
      border-radius: 20rpx;
      margin-top: 4rpx;
      width: fit-content;

      .member-icon {
        font-size: 24rpx;
      }

      .member-text {
        font-size: 22rpx;
        color: #ffd700;
      }
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
  display: flex;
  flex-direction: column;
  gap: 24rpx;

  :deep(.u-button) {
    border-radius: 48rpx;
  }

  .delete-account {
    text-align: center;
    padding: 24rpx;

    text {
      font-size: 26rpx;
      color: #999;
    }
  }
}
</style>
