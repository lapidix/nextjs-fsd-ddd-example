import { CommentApiRepository } from "@/entities/comment";
import { UserApiRepository } from "@/entities/user";
import { baseHttpClient } from "@/shared/libs/http";
import { CommentService } from "./comment.service";

export const createCommentService = () => {
  const commentRepository = new CommentApiRepository(baseHttpClient);
  const userRepository = new UserApiRepository(baseHttpClient);
  return CommentService(commentRepository, userRepository);
};
