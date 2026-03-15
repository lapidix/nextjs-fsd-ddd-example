import type { CommentDto } from "@/entities/comment";
import type { PostDto } from "@/entities/post";
import type { Pagination } from "@/shared/types";

export type PostListResult = Pagination<PostDto>;

export type PostDetailResult = PostDto & {
  comments: CommentDto[];
};

export type PostResult = PostDto;
