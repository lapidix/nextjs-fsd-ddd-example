export interface AddPostCommand {
  title: string;
  body: string;
  userId: string;
  image?: string;
}

export interface UpdatePostCommand {
  id: string;
  title: string;
  body: string;
}

export interface DeletePostCommand {
  id: string;
}

export interface LikePostCommand {
  id: string;
  userId: string;
}

export interface UnlikePostCommand {
  id: string;
  userId: string;
}
