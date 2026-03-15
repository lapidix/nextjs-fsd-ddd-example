import { ApiClient } from "@/shared/api";
import { Comment, CommentRepository } from "../../core";
import { CommentMapper } from "../../mapper";
import { CommentAdapter } from "../api";
import { CommentDto } from "../dto";

export class CommentApiRepository implements CommentRepository {
  private api: ReturnType<typeof CommentAdapter>;

  constructor(apiClient: ApiClient) {
    this.api = CommentAdapter(apiClient);
  }

  async getByPostId(postId: string): Promise<Comment[]> {
    try {
      const response = await this.api.listByPost(postId);
      if (!response || !response.data || !response.data.length) return [];

      const commentDtos: CommentDto[] = response.data.map((apiComment) => ({
        id: apiComment.id,
        body: apiComment.body || "",
        postId: postId,
        user: apiComment.user || {
          id: "0",
          username: "Unknown",
          profileImage: "",
        },
        likes: apiComment.likes || 0,
        createdAt: apiComment.createdAt || Date.now(),
        updatedAt: apiComment.updatedAt || Date.now(),
      }));

      return CommentMapper.toDomainList(commentDtos);
    } catch (error) {
      console.error(`Error fetching comments for post ID ${postId}:`, error);
      throw new Error(`Failed to fetch comments for post ID ${postId}`);
    }
  }

  async create(comment: Comment): Promise<Comment> {
    try {
      const result = await this.api.create(
        comment.body,
        comment.postId,
        comment.user.id
      );
      if (!result) {
        throw new Error(`Failed to create comment with ID ${comment.id}`);
      }
      return CommentMapper.toDomain(result);
    } catch (error) {
      console.error(`Error creating comment:`, error);
      throw new Error("Failed to create comment");
    }
  }

  async update(comment: Comment): Promise<Comment> {
    try {
      const result = await this.api.update(comment.id, comment.body);
      if (!result) {
        throw new Error(`Failed to update comment with ID ${comment.id}`);
      }
      return CommentMapper.toDomain(result);
    } catch (error) {
      console.error(`Error updating comment with ID ${comment.id}:`, error);
      throw new Error("Failed to update comment");
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.api.remove(id);
      return result;
    } catch (error) {
      console.error(`Error deleting comment with ID ${id}:`, error);
      return false;
    }
  }

  async getById(id: string): Promise<Comment> {
    try {
      const comment = await this.api.getById(id);

      if (!comment) {
        throw new Error(`Comment with ID ${id} not found`);
      }

      const commentDto: CommentDto = {
        id: comment.id,
        body: comment.body,
        postId: comment.postId,
        user: comment.user,
        likes: comment.likes || 0,
        createdAt: comment.createdAt || Date.now(),
        updatedAt: comment.updatedAt || Date.now(),
      };

      return CommentMapper.toDomain(commentDto);
    } catch (error) {
      console.error(`Error fetching comment with ID ${id}:`, error);
      throw error;
    }
  }

  async save(comment: Comment): Promise<Comment> {
    try {
      if (comment.id) {
        return await this.update(comment);
      } else {
        return await this.create(comment);
      }
    } catch (error) {
      console.error(`Error saving comment:`, error);
      throw error;
    }
  }

  async like(id: string, userId: string): Promise<boolean> {
    try {
      const result = await this.api.likeComment(id, userId);
      return result;
    } catch (error) {
      console.error(`Error liking comment with ID ${id}:`, error);
      return false;
    }
  }

  async unlike(id: string, userId: string): Promise<boolean> {
    try {
      const result = await this.api.unlikeComment(id, userId);
      return result;
    } catch (error) {
      console.error(`Error unliking comment with ID ${id}:`, error);
      return false;
    }
  }
}
