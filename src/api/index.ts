import { getDb, getCloudFunction } from '@/utils/tcb'

const db = getDb()
const _ = db.command

/**
 * 调用云函数
 */
async function callCloudFunction<T = any>(name: string, data: any = {}): Promise<CloudResponse<T>> {
  const callFunction = getCloudFunction()
  const result = await callFunction({
    name,
    data
  })
  return result.result
}

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
  },

  /**
   * 检查用户是否是会员
   */
  checkIsMember(user: User | null): boolean {
    if (!user?.member_expire_time) return false
    const expireTime = new Date(user.member_expire_time)
    return expireTime > new Date()
  }
}

/**
 * 帖子相关API（云函数版）
 */
export const postApi = {
  /**
   * 获取本校帖子列表
   * @param school_id 学校ID
   * @param page 页码
   * @param pageSize 每页数量
   * @param lastCreateTime 上次加载的最后一条创建时间（用于分页）
   */
  async getSchoolPosts(params: {
    school_id: string
    page?: number
    pageSize?: number
    lastCreateTime?: Date
    current_user_id?: string
  }): Promise<CloudResponse<GetPostsResponse>> {
    return await callCloudFunction<GetPostsResponse>('getSchoolPosts', params)
  },

  /**
   * 点赞/取消点赞帖子
   * @param post_id 帖子ID
   * @param action 操作: toggle(切换)/like(点赞)/unlike(取消点赞)
   */
  async likePost(params: {
    post_id: string
    action?: 'toggle' | 'like' | 'unlike'
    user_id?: string
  }): Promise<CloudResponse<LikeResponse>> {
    return await callCloudFunction<LikeResponse>('likePost', params)
  },

  /**
   * 发布帖子
   * @param content 内容
   * @param images 图片数组
   */
  async createPost(params: {
    content: string
    images?: string[]
    user_id?: string
  }): Promise<CloudResponse<{ post_id: string }>> {
    return await callCloudFunction('createPost', params)
  },

  /**
   * 获取帖子列表（旧版，兼容用）
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
