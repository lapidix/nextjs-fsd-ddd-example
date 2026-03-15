import { PostEntity, UserReference } from "../types";

export class Post implements PostEntity {
  private _id: string;
  private _user: UserReference;
  private _title: string;
  private _body: string;
  private _image: string;
  private _likes: number;
  private _totalComments: number;
  private _createdAt: number;
  private _updatedAt: number;

  constructor(
    id: string,
    user: UserReference,
    title: string,
    body: string,
    image: string,
    likes: number,
    totalComments: number,
    createdAt: number,
    updatedAt: number
  ) {
    this._id = id;
    this._user = user;
    this._title = title;
    this._body = body;
    this._image = image;
    this._likes = likes;
    this._totalComments = totalComments;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string {
    return this._id;
  }

  get user(): UserReference {
    return this._user;
  }

  get title(): string {
    return this._title;
  }

  get body(): string {
    return this._body;
  }

  get image(): string {
    return this._image;
  }

  get likes(): number {
    return this._likes;
  }

  get createdAt(): number {
    return this._createdAt;
  }

  get updatedAt(): number {
    return this._updatedAt;
  }

  get totalComments(): number {
    return this._totalComments;
  }

  updateTitle(newTitle: string): void {
    this._title = newTitle;
    this._updatedAt = new Date().getTime();
  }

  updateBody(newBody: string): void {
    this._body = newBody;
    this._updatedAt = new Date().getTime();
  }

  like(): void {
    this._likes += 1;
  }

  unlike(): void {
    if (this._likes > 0) {
      this._likes -= 1;
    }
  }
}
