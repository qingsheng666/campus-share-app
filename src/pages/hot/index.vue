<template>
  <view class="hot-container">
    <!-- 顶部切换 -->
    <view class="header-tabs">
      <view
        v-for="(tab, index) in tabs"
        :key="index"
        class="header-tab"
        :class="{ active: currentTab === index }"
        @click="switchTab(index)"
      >
        {{ tab }}
      </view>
    </view>

    <!-- 列表 -->
    <scroll-view
      scroll-y="true"
      class="hot-list"
      refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view
        v-for="(item, index) in hotList"
        :key="item._id"
        class="hot-item"
        @click="goDetail(item._id)"
      >
        <view class="rank" :class="'rank-' + Math.min(index + 1, 3)">
          {{ index + 1 }}
        </view>

        <view class="item-content">
          <view class="item-title">
            <text v-if="item.isHot" class="hot-tag">🔥</text>
            <text v-if="item.isNew" class="new-tag">🆕</text>
            {{ item.title }}
          </view>
          <view class="item-info">
            <text>{{ item.school }}</text>
            <text>·</text>
            <text>{{ item.time }}</text>
            <text class="heat">🔥 {{ item.heat }}</text>
          </view>
        </view>

        <u-icon name="arrow-right" size="14" color="#ccc"></u-icon>
      </view>

      <view v-if="hotList.length === 0 && !loading" class="empty-state">
        <text class="empty-icon">📊</text>
        <text class="empty-text">暂无热榜数据</text>
      </view>

      <view v-if="loading" class="loading">
        <u-loading mode="circle" size="24"></u-loading>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const currentTab = ref(0)
const tabs = ['实时', '今日', '本周']
const hotList = ref<any[]>([])
const refreshing = ref(false)
const loading = ref(false)

const mockHotList = [
  {
    _id: '1',
    title: '震惊！某高校图书馆居然发生这种事...',
    school: '北京大学',
    time: '10分钟前',
    heat: '12.5w',
    isHot: true,
    isNew: true
  },
  {
    _id: '2',
    title: '2024年春季学期选课指南来了！',
    school: '清华大学',
    time: '30分钟前',
    heat: '8.9w',
    isHot: true,
    isNew: false
  },
  {
    _id: '3',
    title: '学校门口新开的奶茶店也太好喝了吧',
    school: '复旦大学',
    time: '1小时前',
    heat: '6.7w',
    isHot: false,
    isNew: true
  },
  {
    _id: '4',
    title: '求问：计算机专业如何找实习？',
    school: '浙江大学',
    time: '2小时前',
    heat: '5.2w',
    isHot: false,
    isNew: false
  },
  {
    _id: '5',
    title: '有人一起组队参加ACM竞赛吗？',
    school: '上海交通大学',
    time: '3小时前',
    heat: '4.8w',
    isHot: false,
    isNew: false
  },
  {
    _id: '6',
    title: '学校附近健身房推荐',
    school: '南京大学',
    time: '4小时前',
    heat: '3.6w',
    isHot: false,
    isNew: false
  },
  {
    _id: '7',
    title: '深夜树洞：最近压力好大',
    school: '中山大学',
    time: '5小时前',
    heat: '3.2w',
    isHot: false,
    isNew: false
  },
  {
    _id: '8',
    title: '出二手iPad Pro 2021',
    school: '武汉大学',
    time: '6小时前',
    heat: '2.9w',
    isHot: false,
    isNew: false
  }
]

onMounted(() => {
  loadHotList()
})

const loadHotList = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    hotList.value = [...mockHotList]
  } finally {
    loading.value = false
  }
}

const onRefresh = async () => {
  refreshing.value = true
  try {
    await loadHotList()
  } finally {
    refreshing.value = false
  }
}

const switchTab = (index: number) => {
  currentTab.value = index
  hotList.value = []
  loadHotList()
}

const goDetail = (id: string) => {
  console.log('跳转详情:', id)
}
</script>

<style lang="scss" scoped>
.hot-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.header-tabs {
  display: flex;
  background: #fff;
  padding: 0 32rpx;
  border-bottom: 1rpx solid #eee;

  .header-tab {
    flex: 1;
    text-align: center;
    padding: 32rpx 0;
    font-size: 30rpx;
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
        width: 56rpx;
        height: 6rpx;
        background: #2979FF;
        border-radius: 3rpx;
      }
    }
  }
}

.hot-list {
  flex: 1;
  padding: 24rpx;
}

.hot-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.rank {
  width: 56rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  color: #999;
  margin-right: 24rpx;

  &.rank-1 {
    color: #FF6B6B;
  }

  &.rank-2 {
    color: #FF9F43;
  }

  &.rank-3 {
    color: #FFC107;
  }
}

.item-content {
  flex: 1;
  margin-right: 16rpx;

  .item-title {
    font-size: 30rpx;
    color: #333;
    line-height: 1.5;
    margin-bottom: 12rpx;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;

    .hot-tag,
    .new-tag {
      margin-right: 8rpx;
    }
  }

  .item-info {
    font-size: 24rpx;
    color: #999;

    .heat {
      margin-left: auto;
      color: #FF6B6B;
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

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
}
</style>
