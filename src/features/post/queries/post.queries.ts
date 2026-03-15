export interface GetPostsQuery {
  limit?: number;
  skip?: number;
  query?: string;
}

export interface GetPostByIdQuery {
  id: string;
}
