import {
  CommentFactory,
  CommentMapper,
  CommentRepository,
} from "@/entities/comment";
import { UserRepository } from "@/entities/user";
import { BaseError } from "@/shared/libs/errors";
import type {
  AddCommentCommand,
  DeleteCommentCommand,
  LikeCommentCommand,
  UnlikeCommentCommand,
  UpdateCommentCommand,
} from "../commands";
import type { GetCommentByIdQuery, GetCommentsByPostIdQuery } from "../queries";
import type { CommentListResult, CommentResult } from "../results";
import type { CommentUseCase } from "../usecase";

export const CommentService = (
  commentRepository: CommentRepository,
  userRepository: UserRepository
): CommentUseCase => ({
  getAllComments: async (
    query: GetCommentsByPostIdQuery
  ): Promise<CommentListResult> => {
    const { postId } = query;
    try {
      const domainComments = await commentRepository.getByPostId(postId);
      return domainComments.map((comment) =>
        CommentMapper.toDto(comment)
      ) as CommentListResult;
    } catch (error) {
      console.error(`Error fetching comments for post ID ${postId}:`, error);
      if (error instanceof BaseError) {
        throw error;
      }
      throw new Error(`Failed to fetch comments for post ID ${postId}`);
    }
  },

  getCommentById: async (
    query: GetCommentByIdQuery
  ): Promise<CommentResult> => {
    const { id } = query;
    try {
      const comment = await commentRepository.getById(id);
      return CommentMapper.toDto(comment) as CommentResult;
    } catch (error) {
      console.error(`Error fetching comment with ID ${id}:`, error);
      if (error instanceof BaseError) {
        throw error;
      }
      throw BaseError.notFound("Comment", id);
    }
  },

  addComment: async (command: AddCommentCommand): Promise<CommentResult> => {
    const { body, postId, userId } = command;
    try {
      const user = await userRepository.getUserProfile(userId);

      const newComment = CommentFactory.createNew(body, postId, {
        id: userId,
        username: user.username,
        profileImage: user.profileImage || "",
      });

      const savedComment = await commentRepository.create(newComment);

      if (!savedComment) throw BaseError.createFailed("Comment");

      return CommentMapper.toDto(savedComment) as CommentResult;
    } catch (error) {
      console.error(`Error creating comment:`, error);
      if (error instanceof BaseError) {
        throw error;
      }
      throw BaseError.createFailed("Comment");
    }
  },

  updateComment: async (
    command: UpdateCommentCommand
  ): Promise<CommentResult> => {
    const { id, body, userId } = command;
    try {
      const existingComment = await commentRepository.getById(id);
      if (!existingComment) {
        throw BaseError.notFound("Comment", id);
      }

      if (existingComment.user.id !== userId) {
        throw BaseError.unauthorized("Comment", id, "edit");
      }

      existingComment.updateBody(body);

      const updatedComment = await commentRepository.update(existingComment);
      if (!updatedComment) {
        throw BaseError.updateFailed("Comment", id);
      }

      return CommentMapper.toDto(updatedComment) as CommentResult;
    } catch (error) {
      console.error(`Error updating comment with ID ${id}:`, error);
      if (error instanceof BaseError) {
        throw error;
      }
      throw BaseError.updateFailed("Comment", id);
    }
  },

  deleteComment: async (command: DeleteCommentCommand): Promise<boolean> => {
    const { id, userId } = command;
    try {
      const existingComment = await commentRepository.getById(id);
      if (!existingComment) {
        throw BaseError.notFound("Comment", id);
      }

      if (existingComment.user.id !== userId) {
        throw BaseError.unauthorized("Comment", id, "delete");
      }

      const result = await commentRepository.delete(id);
      if (!result) {
        throw BaseError.deleteFailed("Comment", id);
      }

      return result;
    } catch (error) {
      console.error(`Error deleting comment with ID ${id}:`, error);
      if (error instanceof BaseError) {
        throw error;
      }
      throw BaseError.deleteFailed("Comment", id);
    }
  },

  likeComment: async (command: LikeCommentCommand): Promise<boolean> => {
    const { id, userId } = command;
    try {
      return await commentRepository.like(id, userId);
    } catch (error) {
      console.error(`Error liking comment with ID ${id}:`, error);
      if (error instanceof BaseError) {
        throw error;
      }
      throw BaseError.updateFailed("Comment", id);
    }
  },

  unlikeComment: async (command: UnlikeCommentCommand): Promise<boolean> => {
    const { id, userId } = command;
    try {
      return await commentRepository.unlike(id, userId);
    } catch (error) {
      console.error(`Error unliking comment with ID ${id}:`, error);
      if (error instanceof BaseError) {
        throw error;
      }
      throw BaseError.updateFailed("Comment", id);
    }
  },
});
