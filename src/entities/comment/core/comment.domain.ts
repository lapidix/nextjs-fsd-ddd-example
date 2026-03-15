import { CommentEntity, UserReference } from "../types";
import { CommentBody, UserReferenceVO } from "../value-objects";

export class Comment implements CommentEntity {
  private readonly _id: string;
  private readonly _postId: string;
  private readonly _user: UserReferenceVO;
  private _body: CommentBody;
  private _likes: number;
  private _createdAt: number;
  private _updatedAt: number;
  constructor(
    id: string,
    body: string,
    user: UserReference,
    postId: string,
    likes: number = 0,
    createdAt: number,
    updatedAt: number
  ) {
    this._id = id;
    this._body = new CommentBody(body);
    this._user = new UserReferenceVO(user);
    this._postId = postId;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._likes = likes;
  }

  updateBody(newBody: string): void {
    this._body = new CommentBody(newBody);
    this._updatedAt = Date.now();
  }

  like(userId: string): void {
    console.log(`User ${userId} liked the comment`);
    this._likes += 1;
  }

  unlike(userId: string): void {
    console.log(`User ${userId} unliked the comment`);
    if (this._likes > 0) {
      this._likes -= 1;
    }
  }

  get id(): string {
    return this._id;
  }

  get postId(): string {
    return this._postId;
  }

  get body(): string {
    return this._body.text;
  }

  get user(): UserReference {
    return this._user.toDTO();
  }

  get createdAt(): number {
    return this._createdAt;
  }

  get updatedAt(): number {
    return this._updatedAt;
  }

  get likes(): number {
    return this._likes;
  }
}
