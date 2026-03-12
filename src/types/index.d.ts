// 通用类型声明

declare global {
  /**
   * 分页查询参数
   */
  interface PageParams {
    page?: number
    pageSize?: number
  }

  /**
   * 分页返回结果
   */
  interface PageResult<T> {
    data: T[]
    total: number
    page: number
    pageSize: number
  }

  /**
   * 用户信息
   */
  interface User {
    _id?: string
    phone?: string
    nickname: string
    avatar: string
    gender?: number
    school?: string
    school_id?: string
    major?: string
    grade?: string
    member_expire_time?: Date | string
    createTime?: Date
    updateTime?: Date
  }

  /**
   * 帖子信息（数据库字段）
   */
  interface PostDB {
    _id?: string
    user_id: string
    school_id: string
    content: string
    images?: string[]
    like_count?: number
    comment_count?: number
    create_time?: Date
    update_time?: Date
    status?: number // 0=审核通过 1=违规下架
  }

  /**
   * 帖子信息（前端展示）
   */
  interface Post {
    _id?: string
    user_id: string
    school_id: string
    content: string
    images?: string[]
    like_count?: number
    comment_count?: number
    create_time?: Date
    // 扩展字段（用于展示）
    nickname?: string
    avatar?: string
    is_liked?: boolean
    time?: string
  }

  /**
   * 评论信息
   */
  interface Comment {
    _id?: string
    postId: string
    userId: string
    content: string
    createTime?: Date
    // 扩展字段
    nickname?: string
    avatar?: string
    time?: string
  }

  /**
   * 云函数通用返回
   */
  interface CloudResponse<T = any> {
    code: number
    message: string
    data?: T
    error?: string
  }

  /**
   * 获取帖子列表返回
   */
  interface GetPostsResponse {
    list: Post[]
    hasMore: boolean
    lastCreateTime?: Date
  }

  /**
   * 点赞返回
   */
  interface LikeResponse {
    is_liked: boolean
    like_count: number
  }
}

export {}
