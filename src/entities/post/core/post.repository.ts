import { Post } from "./post.domain";

export interface PostRepository {
  getAll(limit?: number, skip?: number): Promise<Post[]>;
  getById(id: string): Promise<Post>;
  search(query: string): Promise<Post[]>;
  create(post: Post): Promise<Post | null>;
  update(post: Post): Promise<Post | null>;
  save(post: Post): Promise<Post>;
  delete(id: string): Promise<boolean>;
  like(id: string, userId: string): Promise<boolean>;
  unlike(id: string, userId: string): Promise<boolean>;
}
