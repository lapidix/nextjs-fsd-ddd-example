import { CommentApiRepository } from "@/entities/comment";
import { PostApiRepository } from "@/entities/post";
import { UserApiRepository } from "@/entities/user";
import { baseHttpClient } from "@/shared/libs/http";
import { PostService } from "./post.service";

export const createPostService = () => {
  const postRepository = new PostApiRepository(baseHttpClient);
  const userRepository = new UserApiRepository(baseHttpClient);
  const commentRepository = new CommentApiRepository(baseHttpClient);
  return PostService(postRepository, commentRepository, userRepository);
};
