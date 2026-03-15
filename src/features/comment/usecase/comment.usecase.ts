import type { GetCommentsByPostIdQuery, GetCommentByIdQuery } from "../queries";
import type {
  AddCommentCommand,
  UpdateCommentCommand,
  DeleteCommentCommand,
  LikeCommentCommand,
  UnlikeCommentCommand,
} from "../commands";
import type { CommentListResult, CommentResult } from "../results";

export interface CommentUseCase {
  getAllComments: (
    query: GetCommentsByPostIdQuery
  ) => Promise<CommentListResult>;
  getCommentById: (query: GetCommentByIdQuery) => Promise<CommentResult>;
  addComment: (command: AddCommentCommand) => Promise<CommentResult>;
  updateComment: (command: UpdateCommentCommand) => Promise<CommentResult>;
  deleteComment: (command: DeleteCommentCommand) => Promise<boolean>;
  likeComment: (command: LikeCommentCommand) => Promise<boolean>;
  unlikeComment: (command: UnlikeCommentCommand) => Promise<boolean>;
}
