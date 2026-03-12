import { getDb } from '@/utils/tcb'

const db = getDb()
const _ = db.command

/**
 * 用户相关API
 */
export const userApi = {
  /**
   * 获取用户信息
   */
  async getUserInfo(userId: string) {
    const res = await db.collection('users').doc(userId).get()
    return res.data
  },

  /**
   * 更新用户信息
   */
  async updateUserInfo(userId: string, data: any) {
    const res = await db.collection('users').doc(userId).update({
      ...data,
      updateTime: new Date()
    })
    return res
  }
}

/**
 * 帖子相关API
 */
export const postApi = {
  /**
   * 获取帖子列表
   */
  async getPostList(params: {
    school?: string
    page?: number
    pageSize?: number
    sortBy?: 'createTime' | 'likeCount'
  }) {
    const { school, page = 1, pageSize = 20, sortBy = 'createTime' } = params

    let query = db.collection('posts')

    if (school) {
      query = query.where({
        school
      })
    }

    const res = await query
      .orderBy(sortBy, 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    return res.data
  },

  /**
   * 获取热榜帖子
   */
  async getHotPosts(days: number = 7) {
    const now = new Date()
    const startTime = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    const res = await db.collection('posts')
      .where({
        createTime: _.gte(startTime)
      })
      .orderBy('likeCount', 'desc')
      .limit(50)
      .get()

    return res.data
  },

  /**
   * 发布帖子
   */
  async createPost(data: any) {
    const res = await db.collection('posts').add({
      ...data,
      createTime: new Date(),
      updateTime: new Date(),
      likeCount: 0,
      commentCount: 0,
      viewCount: 0
    })
    return res
  },

  /**
   * 点赞帖子
   */
  async likePost(postId: string) {
    const res = await db.collection('posts').doc(postId).update({
      likeCount: _.inc(1)
    })
    return res
  }
}

/**
 * 评论相关API
 */
export const commentApi = {
  /**
   * 获取评论列表
   */
  async getComments(postId: string) {
    const res = await db.collection('comments')
      .where({
        postId
      })
      .orderBy('createTime', 'desc')
      .get()

    return res.data
  },

  /**
   * 发表评论
   */
  async createComment(data: any) {
    const res = await db.collection('comments').add({
      ...data,
      createTime: new Date()
    })
    return res
  }
}
