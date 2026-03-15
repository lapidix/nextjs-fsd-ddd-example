import type { GetPostsQuery, GetPostByIdQuery } from "../queries";
import type {
  AddPostCommand,
  UpdatePostCommand,
  DeletePostCommand,
  LikePostCommand,
  UnlikePostCommand,
} from "../commands";
import type {
  PostListResult,
  PostDetailResult,
  PostResult,
} from "../results";

export interface PostUseCase {
  getAllPosts: (query: GetPostsQuery) => Promise<PostListResult>;
  searchPosts: (query: GetPostsQuery) => Promise<PostListResult>;
  getPostById: (query: GetPostByIdQuery) => Promise<PostDetailResult>;
  addPost: (command: AddPostCommand) => Promise<PostResult>;
  updatePost: (command: UpdatePostCommand) => Promise<PostResult>;
  deletePost: (command: DeletePostCommand) => Promise<boolean>;
  likePost: (command: LikePostCommand) => Promise<boolean>;
  unlikePost: (command: UnlikePostCommand) => Promise<boolean>;
}
