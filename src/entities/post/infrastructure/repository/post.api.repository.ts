import { BaseHttpClient } from "@/shared/libs/http";
import { PostRepository } from "../../core";
import { Post } from "../../core/post.domain";
import { PostMapper } from "../../mapper";
import { PostAdapter } from "../api";

export class PostApiRepository implements PostRepository {
  private api: ReturnType<typeof PostAdapter>;

  constructor(httpClient: BaseHttpClient) {
    this.api = PostAdapter(httpClient);
  }

  async getAll(limit: number, skip: number): Promise<Post[]> {
    try {
      const response = await this.api.list(limit, skip);
      if (!response || !response.data || !response.data.length) return [];

      return PostMapper.toDomainList(response.data);
    } catch (error) {
      console.error(`Error fetching post list:`, error);
      return [];
    }
  }

  async getById(id: string): Promise<Post> {
    try {
      const postDto = await this.api.getById(id);
      if (!postDto) {
        throw new Error(`Post with ID ${id} not found`);
      }

      return PostMapper.toDomain(postDto);
    } catch (error) {
      console.error(`Error fetching post with ID ${id}:`, error);
      throw error;
    }
  }

  async search(query: string): Promise<Post[]> {
    try {
      const response = await this.api.search(query);
      if (!response || !response.data || !response.data.length) return [];

      return PostMapper.toDomainList(response.data);
    } catch (error) {
      console.error(`Error searching for '${query}':`, error);
      return [];
    }
  }

  async create(post: Post): Promise<Post | null> {
    try {
      const result = await this.api.create(post.title, post.body, post.user.id);
      if (!result) {
        console.error(`Failed to create post`);
        return null;
      }
      return PostMapper.toDomain(result);
    } catch (error) {
      console.error(`Error creating post:`, error);
      return null;
    }
  }

  async update(post: Post): Promise<Post | null> {
    try {
      const result = await this.api.update(post.id, post.title, post.body);
      if (!result) {
        console.error(`Failed to update post with ID ${post.id}`);
        return null;
      }
      return PostMapper.toDomain(result);
    } catch (error) {
      console.error(`Error updating post with ID ${post.id}:`, error);
      return null;
    }
  }

  async save(post: Post): Promise<Post> {
    try {
      if (post.id) {
        const result = await this.update(post);
        if (!result) {
          throw new Error(`Failed to update post with ID ${post.id}`);
        }
        return result;
      } else {
        const result = await this.create(post);
        if (!result) {
          throw new Error(`Failed to create new post`);
        }
        return result;
      }
    } catch (error) {
      console.error(`Error saving post:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.api.remove(id);
      return result;
    } catch (error) {
      console.error(`Error deleting post with ID ${id}:`, error);
      return false;
    }
  }

  async like(id: string, userId: string): Promise<boolean> {
    try {
      const result = await this.api.likePost(id, userId);
      return result;
    } catch (error) {
      console.error(`Error liking post with ID ${id}:`, error);
      return false;
    }
  }

  async unlike(id: string, userId: string): Promise<boolean> {
    try {
      const result = await this.api.unlikePost(id, userId);
      return result;
    } catch (error) {
      console.error(`Error unliking post with ID ${id}:`, error);
      return false;
    }
  }
}
