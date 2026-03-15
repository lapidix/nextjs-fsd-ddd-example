export interface AddCommentCommand {
  body: string;
  postId: string;
  userId: string;
}

export interface UpdateCommentCommand {
  id: string;
  body: string;
  userId: string;
}

export interface DeleteCommentCommand {
  id: string;
  userId: string;
}

export interface LikeCommentCommand {
  id: string;
  userId: string;
}

export interface UnlikeCommentCommand {
  id: string;
  userId: string;
}
