import { BaseHttpClient } from "@/shared/libs/http";
import { Pagination } from "@/shared/types";
import { CommentDto } from "../dto/comment.dto";

export const CommentAdapter = (httpClient: BaseHttpClient) => ({
  listByPost: async (postId: string): Promise<Pagination<CommentDto>> => {
    const response = await httpClient.get<Pagination<CommentDto>>(
      `/posts/${postId}/comments`
    );
    return response.data;
  },

  getById: async (id: string): Promise<CommentDto> => {
    try {
      const response = await httpClient.get<CommentDto>(`/comments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching comment with ID ${id}:`, error);
      throw error;
    }
  },

  create: async (
    body: string,
    postId: string,
    userId: string
  ): Promise<CommentDto> => {
    try {
      const response = await httpClient.post<CommentDto>(`/comments/add`, {
        body,
        postId,
        userId,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  },

  update: async (id: string, body: string): Promise<CommentDto> => {
    try {
      const response = await httpClient.put<CommentDto>(`/comments/${id}`, {
        body,
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating comment with ID ${id}:`, error);
      throw error;
    }
  },

  remove: async (id: string): Promise<boolean> => {
    try {
      const response = await httpClient.delete<{ success: boolean }>(
        `/comments/${id}`
      );
      return response.data.success;
    } catch (error) {
      console.error("Error deleting comment:", error);
      return false;
    }
  },

  likeComment: async (id: string, userId: string): Promise<boolean> => {
    try {
      const response = await httpClient.patch<{ success: boolean }>(
        `/comments/${id}/like`,
        { userId }
      );
      return response.data.success;
    } catch (error) {
      console.error("Error liking comment:", error);
      return false;
    }
  },

  unlikeComment: async (id: string, userId: string): Promise<boolean> => {
    try {
      const response = await httpClient.patch<{ success: boolean }>(
        `/comments/${id}/unlike`,
        { userId }
      );
      return response.data.success;
    } catch (error) {
      console.error("Error unliking comment:", error);
      return false;
    }
  },
});
