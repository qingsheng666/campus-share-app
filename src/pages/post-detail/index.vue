<template>
  <view class="detail-container">
    <!-- 帖子内容 -->
    <view class="post-section" v-if="post">
      <view class="post-header">
        <image :src="post.avatar || '/static/default-avatar.png'" class="avatar"></image>
        <view class="user-info">
          <text class="nickname">{{ post.nickname }}</text>
          <text class="time">{{ post.time }}</text>
        </view>
      </view>

      <view class="post-content">
        <text class="post-text">{{ post.content }}</text>
      </view>

      <view v-if="post.images && post.images.length > 0" class="post-images">
        <view
          v-for="(img, idx) in post.images"
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
        </view>
      </view>

      <view class="post-footer">
        <view class="footer-item" @click="handleLikePost">
          <u-icon
            :name="post.is_liked ? 'heart-fill' : 'heart'"
            size="16"
            :color="post.is_liked ? '#ff4d4f' : '#999'"
          ></u-icon>
          <text :class="{ 'liked-text': post.is_liked }">{{ post.like_count }}</text>
        </view>
        <view class="footer-item">
          <u-icon name="chatbubble" size="16" color="#999"></u-icon>
          <text>{{ post.comment_count }}</text>
        </view>
      </view>
    </view>

    <!-- 评论区标题 -->
    <view class="comments-header">
      <text class="comments-title">全部评论</text>
      <text class="comments-count">{{ commentList.length }}条</text>
    </view>

    <!-- 评论列表 -->
    <scroll-view
      scroll-y="true"
      class="comments-list"
      @scrolltolower="loadMoreComments"
      refresher-enabled="true"
      :refresher-triggered="refreshingComments"
      @refresherrefresh="onRefreshComments"
    >
      <view v-if="commentList.length === 0 && !loadingComments" class="empty-comments">
        <text class="empty-icon">💬</text>
        <text class="empty-text">暂无评论，来说点什么吧~</text>
      </view>

      <view
        v-for="comment in commentList"
        :key="comment._id"
        class="comment-item"
      >
        <!-- 一级评论 -->
        <view class="comment-main">
          <image :src="comment.avatar || '/static/default-avatar.png'" class="comment-avatar"></image>
          <view class="comment-content-wrapper">
            <view class="comment-header">
              <text class="comment-nickname">{{ comment.nickname }}</text>
              <text class="comment-time">{{ comment.time }}</text>
            </view>

            <view class="comment-text">
              <text v-if="comment.reply_nickname" class="reply-tag">
                回复 {{ comment.reply_nickname }}:
              </text>
              {{ comment.content }}
            </view>

            <view class="comment-actions">
              <view class="action-btn" @click="handleReply(comment)">
                <u-icon name="chatbubble" size="14" color="#999"></u-icon>
                <text>回复</text>
              </view>
              <view class="action-btn" @click="handleLikeComment(comment)">
                <u-icon
                  :name="comment.is_liked ? 'heart-fill' : 'heart'"
                  size="14"
                  :color="comment.is_liked ? '#ff4d4f' : '#999'"
                ></u-icon>
                <text :class="{ 'liked-text': comment.is_liked }">{{ comment.like_count }}</text>
              </view>
            </view>

            <!-- 二级回复列表 -->
            <view v-if="comment.replies && comment.replies.length > 0" class="replies-section">
              <view
                v-for="reply in comment.replies"
                :key="reply._id"
                class="reply-item"
              >
                <view class="reply-header">
                  <text class="reply-nickname">{{ reply.nickname }}</text>
                  <text v-if="reply.reply_nickname" class="reply-to">
                    回复 {{ reply.reply_nickname }}
                  </text>
                </view>
                <text class="reply-text">{{ reply.content }}</text>
                <view class="reply-footer">
                  <text class="reply-time">{{ reply.time }}</text>
                  <view class="reply-actions">
                    <view class="action-btn" @click="handleReply(reply)">
                      <text>回复</text>
                    </view>
                    <view class="action-btn" @click="handleLikeComment(reply)">
                      <u-icon
                        :name="reply.is_liked ? 'heart-fill' : 'heart'"
                        size="12"
                        :color="reply.is_liked ? '#ff4d4f' : '#999'"
                      ></u-icon>
                      <text :class="{ 'liked-text': reply.is_liked }">{{ reply.like_count }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-if="loadingComments" class="loading-more">
        <u-loading mode="circle" size="20"></u-loading>
        <text>加载中...</text>
      </view>

      <view v-if="!hasMoreComments && commentList.length > 0" class="no-more">
        <text>没有更多了</text>
      </view>
    </scroll-view>

    <!-- 底部评论输入区 -->
    <view class="input-bar">
      <view class="input-wrapper" @click="focusInput">
        <text class="input-placeholder" v-if="!replyTarget">
          说点什么...
        </text>
        <text class="input-placeholder replying" v-else>
          回复 {{ replyTarget.nickname }}
        </text>
      </view>
      <u-button
        type="primary"
        size="small"
        :disabled="!canComment"
        @click="handleSendComment"
      >
        发送
      </u-button>
    </view>

    <!-- 评论弹窗 -->
    <u-popup v-model:show="showCommentPopup" mode="bottom" round="24">
      <view class="comment-popup">
        <view class="popup-header">
          <text v-if="!replyTarget">发表评论</text>
          <text v-else>回复 {{ replyTarget.nickname }}</text>
          <u-icon name="close" size="20" @click="showCommentPopup = false"></u-icon>
        </view>
        <view class="popup-content">
          <u-textarea
            v-model="commentInput"
            placeholder="输入评论内容..."
            maxlength="500"
            :autoHeight="true"
            :border="false"
            :showWordLimit="true"
            customStyle="min-height: 200rpx; font-size: 30rpx;"
          />
        </view>
        <view class="popup-footer">
          <u-button
            type="primary"
            size="large"
            :loading="sendingComment"
            :disabled="!commentInput.trim()"
            @click="submitComment"
          >
            发送
          </u-button>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { postApi, commentApi } from '@/api'

const userStore = useUserStore()

const postId = ref('')
const post = ref<Post | null>(null)
const loadingPost = ref(false)

const commentList = ref<Comment[]>([])
const loadingComments = ref(false)
const refreshingComments = ref(false)
const hasMoreComments = ref(true)
const lastCommentTime = ref<Date | null>(null)

const showCommentPopup = ref(false)
const commentInput = ref('')
const replyTarget = ref<Comment | null>(null)
const sendingComment = ref(false)

// 检查是否可以评论
const canComment = computed(() => {
  return userStore.isLoggedIn && userStore.isMember
})

// 加载帖子详情
const loadPostDetail = async () => {
  if (!postId.value) return

  loadingPost.value = true
  try {
    const res = await postApi.getPostDetail({
      post_id: postId.value,
      current_user_id: userStore.userInfo?._id
    })

    if (res.code === 0 && res.data) {
      post.value = {
        ...res.data.post,
        nickname: res.data.post.nickname || res.data.user?.nickname,
        avatar: res.data.post.avatar || res.data.user?.avatar
      }
    }
  } catch (error) {
    console.error('加载帖子详情失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loadingPost.value = false
  }
}

// 加载评论列表
const loadComments = async (isRefresh = false) => {
  if (!postId.value) return

  loadingComments.value = true
  try {
    const res = await commentApi.getComments({
      post_id: postId.value,
      pageSize: 20,
      lastCreateTime: isRefresh ? null : lastCommentTime.value,
      current_user_id: userStore.userInfo?._id
    })

    if (res.code === 0 && res.data) {
      if (isRefresh) {
        commentList.value = res.data.list
      } else {
        commentList.value = [...commentList.value, ...res.data.list]
      }
      hasMoreComments.value = res.data.hasMore
      lastCommentTime.value = res.data.lastCreateTime || null
    }
  } catch (error) {
    console.error('加载评论失败:', error)
  } finally {
    loadingComments.value = false
  }
}

// 刷新评论
const onRefreshComments = async () => {
  refreshingComments.value = true
  try {
    await loadComments(true)
  } finally {
    refreshingComments.value = false
  }
}

// 加载更多评论
const loadMoreComments = () => {
  if (loadingComments.value || !hasMoreComments.value) return
  loadComments(false)
}

// 点赞帖子
const handleLikePost = async () => {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({
      url: '/pages/login/index'
    })
    return
  }

  if (!post.value) return

  try {
    const res = await postApi.likePost({
      post_id: post.value._id!,
      action: 'toggle',
      user_id: userStore.userInfo?._id
    })

    if (res.code === 0 && res.data) {
      post.value.is_liked = res.data.is_liked
      post.value.like_count = res.data.like_count
    }
  } catch (error) {
    console.error('点赞失败:', error)
  }
}

// 点赞评论
const handleLikeComment = async (comment: Comment) => {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({
      url: '/pages/login/index'
    })
    return
  }

  try {
    const res = await commentApi.likeComment({
      comment_id: comment._id!,
      action: 'toggle',
      user_id: userStore.userInfo?._id
    })

    if (res.code === 0 && res.data) {
      comment.is_liked = res.data.is_liked
      comment.like_count = res.data.like_count
    }
  } catch (error) {
    console.error('点赞失败:', error)
  }
}

// 点击回复
const handleReply = (comment: Comment) => {
  if (!checkCanComment()) return

  replyTarget.value = comment
  commentInput.value = ''
  showCommentPopup.value = true
}

// 点击输入框
const focusInput = () => {
  if (!checkCanComment()) return

  replyTarget.value = null
  commentInput.value = ''
  showCommentPopup.value = true
}

// 检查是否可以评论
const checkCanComment = (): boolean => {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({
      url: '/pages/login/index'
    })
    return false
  }

  if (!userStore.isMember) {
    uni.showToast({
      title: '请先开通会员',
      icon: 'none'
    })
    return false
  }

  return true
}

// 点击发送按钮
const handleSendComment = () => {
  focusInput()
}

// 提交评论
const submitComment = async () => {
  if (!commentInput.value.trim()) return

  sendingComment.value = true
  try {
    const res = await commentApi.createComment({
      post_id: postId.value,
      content: commentInput.value,
      parent_id: replyTarget.value ? replyTarget.value._id : '0',
      reply_user_id: replyTarget.value ? replyTarget.value.user_id : undefined,
      user_id: userStore.userInfo?._id
    })

    if (res.code === 0) {
      uni.showToast({
        title: '评论成功',
        icon: 'success'
      })

      // 刷新评论
      showCommentPopup.value = false
      commentInput.value = ''
      replyTarget.value = null

      // 更新帖子评论数
      if (post.value) {
        post.value.comment_count = (post.value.comment_count || 0) + 1
      }

      await loadComments(true)
    } else {
      uni.showToast({
        title: res.message || '评论失败',
        icon: 'none'
      })
    }
  } catch (error: any) {
    console.error('评论失败:', error)
    let errMsg = '评论失败，请重试'
    if (error.message && error.message.includes('违规')) {
      errMsg = '内容包含违规信息，请修改后再发布'
    }
    uni.showToast({
      title: errMsg,
      icon: 'none',
      duration: 2500
    })
  } finally {
    sendingComment.value = false
  }
}

// 预览图片
const previewImage = (images: string[], current: number) => {
  uni.previewImage({
    urls: images,
    current
  })
}

onLoad((options) => {
  if (options.id) {
    postId.value = options.id
  }
})

onMounted(() => {
  userStore.checkLoginStatus()
  loadPostDetail()
  loadComments(true)
})
</script>

<style lang="scss" scoped>
.detail-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.post-section {
  background: #fff;
  padding: 32rpx;
  margin-bottom: 16rpx;
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
    font-size: 32rpx;
    color: #333;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
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
}

.post-footer {
  display: flex;
  align-items: center;
  gap: 48rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;

  .footer-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 26rpx;
    color: #999;

    .liked-text {
      color: #ff4d4f;
    }
  }
}

.comments-header {
  background: #fff;
  padding: 24rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;

  .comments-title {
    font-size: 30rpx;
    color: #333;
    font-weight: 500;
  }

  .comments-count {
    font-size: 26rpx;
    color: #999;
  }
}

.comments-list {
  flex: 1;
  padding: 0 32rpx;
  padding-bottom: 24rpx;
}

.comment-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.comment-main {
  display: flex;
  gap: 20rpx;

  .comment-avatar {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    background: #f0f0f0;
    flex-shrink: 0;
  }

  .comment-content-wrapper {
    flex: 1;
  }

  .comment-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12rpx;

    .comment-nickname {
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
    }

    .comment-time {
      font-size: 24rpx;
      color: #999;
    }
  }

  .comment-text {
    font-size: 28rpx;
    color: #333;
    line-height: 1.6;
    margin-bottom: 16rpx;
    word-break: break-word;

    .reply-tag {
      color: #2979FF;
    }
  }

  .comment-actions {
    display: flex;
    gap: 32rpx;

    .action-btn {
      display: flex;
      align-items: center;
      gap: 6rpx;
      font-size: 24rpx;
      color: #999;
    }
  }
}

.replies-section {
  margin-top: 24rpx;
  padding-left: 0;

  .reply-item {
    background: #f8f9fa;
    border-radius: 12rpx;
    padding: 24rpx;
    margin-bottom: 12rpx;

    .reply-header {
      margin-bottom: 8rpx;

      .reply-nickname {
        font-size: 26rpx;
        color: #2979FF;
        font-weight: 500;
      }

      .reply-to {
        font-size: 24rpx;
        color: #999;
        margin-left: 8rpx;
      }
    }

    .reply-text {
      font-size: 26rpx;
      color: #333;
      line-height: 1.6;
      margin-bottom: 12rpx;
      word-break: break-word;
    }

    .reply-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .reply-time {
        font-size: 22rpx;
        color: #999;
      }

      .reply-actions {
        display: flex;
        gap: 24rpx;

        .action-btn {
          font-size: 22rpx;
          color: #999;
          display: flex;
          align-items: center;
          gap: 4rpx;

          .liked-text {
            color: #ff4d4f;
          }
        }
      }
    }
  }
}

.empty-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160rpx 0;

  .empty-icon {
    font-size: 100rpx;
    margin-bottom: 24rpx;
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
  gap: 12rpx;
  padding: 32rpx;
  font-size: 24rpx;
  color: #999;
}

.input-bar {
  background: #fff;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  gap: 20rpx;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);

  .input-wrapper {
    flex: 1;
    background: #f5f7fa;
    border-radius: 40rpx;
    padding: 20rpx 32rpx;

    .input-placeholder {
      font-size: 28rpx;
      color: #999;

      &.replying {
        color: #2979FF;
      }
    }
  }

  :deep(.u-button) {
    border-radius: 40rpx;
    padding: 0 32rpx;
  }
}

.comment-popup {
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));

  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 32rpx;
    font-weight: 500;
    color: #333;
    margin-bottom: 32rpx;
  }

  .popup-content {
    min-height: 300rpx;
  }

  .popup-footer {
    margin-top: 32rpx;

    :deep(.u-button) {
      border-radius: 48rpx;
      height: 88rpx;
    }
  }
}
</style>
