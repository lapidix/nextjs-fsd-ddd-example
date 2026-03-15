import { CommentMapper, CommentRepository } from "@/entities/comment";
import {
  CommentFixtures,
  CommentRepositoryMocks,
  MockCommentRepository,
} from "@/entities/comment/__tests__";
import { UserRepository } from "@/entities/user";
import {
  MockUserRepository,
  UserFixtures,
  UserRepositoryMocks,
} from "@/entities/user/__tests__";
import {
  AsyncTestHelpers,
  MockHelpers,
  TestDataHelpers,
} from "@/shared/libs/__tests__";
import { BaseError } from "@/shared/libs/errors";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CommentService } from "../../services/comment.service";

/**
 * Comment Service Tests
 * Verify all Comment service functionality using Given-When-Then pattern
 */
describe("Comment Service", () => {
  let mockCommentRepository: MockCommentRepository;
  let mockUserRepository: MockUserRepository;
  let commentService: ReturnType<typeof CommentService>;

  beforeEach(() => {
    // Given: Set up mock repositories using test utils
    mockCommentRepository = CommentRepositoryMocks.create();
    mockUserRepository = UserRepositoryMocks.create();

    // Reset all mocks using shared utility
    MockHelpers.resetAll(mockCommentRepository, mockUserRepository);

    commentService = CommentService(
      mockCommentRepository as unknown as CommentRepository,
      mockUserRepository as unknown as UserRepository
    );
  });

  describe("getAllComments", () => {
    it("should return comment list when repository returns valid data", async () => {
      // Given: Repository returns valid comments for a post
      const postId = "post-123";
      const mockComments = CommentFixtures.multiple;
      mockCommentRepository.getByPostId.mockResolvedValue(mockComments);

      // When: Get all comments for post
      const result = await commentService.getAllComments({ postId });

      // Then: Should return mapped comment list
      expect(result).toEqual(
        mockComments.map((comment) => CommentMapper.toDto(comment))
      );
      expect(mockCommentRepository.getByPostId).toHaveBeenCalledWith(postId);
    });

    it("should return empty array when no comments exist for post", async () => {
      // Given: Repository returns empty array
      const postId = "post-456";
      mockCommentRepository.getByPostId.mockResolvedValue([]);

      // When: Get all comments for post
      const result = await commentService.getAllComments({ postId });

      // Then: Should return empty array
      expect(result).toEqual([]);
      expect(mockCommentRepository.getByPostId).toHaveBeenCalledWith(postId);
    });

    it("should re-throw BaseError when repository throws BaseError", async () => {
      // Given: Repository throws BaseError
      const postId = "post-123";
      const baseError = BaseError.notFound("Post", postId);
      mockCommentRepository.getByPostId.mockRejectedValue(baseError);

      // When: Get all comments for post
      // Then: Should re-throw the same BaseError
      await expect(
        commentService.getAllComments({ postId })
      ).rejects.toThrow(
        baseError
      );
    });

    it("should wrap generic error in Error", async () => {
      // Given: Repository throws generic error
      const postId = "post-123";
      const genericError = new Error("Database connection failed");
      mockCommentRepository.getByPostId.mockRejectedValue(genericError);

      // When: Get all comments for post
      // Then: Should wrap error with post ID information
      await expect(
        commentService.getAllComments({ postId })
      ).rejects.toThrow(
        `Failed to fetch comments for post ID ${postId}`
      );
    });
  });

  describe("getCommentById", () => {
    it("should return comment when repository returns valid data", async () => {
      // Given: Repository returns valid comment
      const mockComment = CommentFixtures.valid.basic;
      mockCommentRepository.getById.mockResolvedValue(mockComment);

      // When: Get comment by ID
      const result = await commentService.getCommentById({ id: mockComment.id });

      // Then: Should return mapped comment
      expect(result).toEqual(CommentMapper.toDto(mockComment));
      expect(mockCommentRepository.getById).toHaveBeenCalledWith(
        mockComment.id
      );
    });

    it("should throw BaseError when comment not found", async () => {
      // Given: Repository throws error for non-existent comment
      const commentId = "non-existent-comment";
      const notFoundError = new Error("Comment not found");
      mockCommentRepository.getById.mockRejectedValue(notFoundError);

      // When: Get comment by ID
      // Then: Should throw BaseError.notFound
      await expect(
        commentService.getCommentById({ id: commentId })
      ).rejects.toThrow(BaseError);
      await expect(
        commentService.getCommentById({ id: commentId })
      ).rejects.toThrow("Comment");
    });

    it("should re-throw BaseError when repository throws BaseError", async () => {
      // Given: Repository throws BaseError
      const commentId = "comment-123";
      const baseError = BaseError.unauthorized("Comment", commentId, "read");
      mockCommentRepository.getById.mockRejectedValue(baseError);

      // When: Get comment by ID
      // Then: Should re-throw the same BaseError
      await expect(
        commentService.getCommentById({ id: commentId })
      ).rejects.toThrow(baseError);
    });
  });

  describe("addComment", () => {
    it("should create and return new comment when valid data provided", async () => {
      // Given: Valid comment data and user profile
      const body = "This is a new comment";
      const postId = "post-123";
      const userId = "user-123";
      const mockUser = UserFixtures.valid.basic;
      const mockComment = CommentFixtures.valid.basic;

      mockUserRepository.getUserProfile.mockResolvedValue(mockUser);
      mockCommentRepository.create.mockResolvedValue(mockComment);

      // When: Add new comment
      const result = await commentService.addComment({
        body,
        postId,
        userId,
      });

      // Then: Should create and return new comment
      expect(result).toEqual(CommentMapper.toDto(mockComment));
      expect(mockUserRepository.getUserProfile).toHaveBeenCalled();
      expect(mockCommentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          body,
          postId,
          user: expect.objectContaining({
            id: userId,
            username: mockUser.username,
            profileImage: mockUser.profileImage,
          }),
        })
      );
    });

    it("should handle user without profile image", async () => {
      // Given: User without profile image
      const body = "Comment from user without image";
      const postId = "post-123";
      const userId = "user-456";
      const mockUser = { ...UserFixtures.valid.basic, profileImage: "" };
      const mockComment = CommentFixtures.valid.withoutUserImage;

      mockUserRepository.getUserProfile.mockResolvedValue(mockUser);
      mockCommentRepository.create.mockResolvedValue(mockComment);

      // When: Add new comment
      const result = await commentService.addComment({
        body,
        postId,
        userId,
      });

      // Then: Should create comment with empty profile image
      expect(result).toEqual(CommentMapper.toDto(mockComment));
      expect(mockCommentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            profileImage: "",
          }),
        })
      );
    });

    it("should throw BaseError when comment creation fails", async () => {
      // Given: Repository fails to create comment
      const body = "Failed comment";
      const postId = "post-123";
      const userId = "user-123";
      const mockUser = UserFixtures.valid.basic;

      mockUserRepository.getUserProfile.mockResolvedValue(mockUser);
      mockCommentRepository.create.mockResolvedValue(null);

      // When: Add new comment
      // Then: Should throw BaseError.createFailed
      await expect(
        commentService.addComment({ body, postId, userId })
      ).rejects.toThrow(BaseError);
      await expect(
        commentService.addComment({ body, postId, userId })
      ).rejects.toThrow("Failed to create comment");
    });

    it("should re-throw BaseError when repository throws BaseError", async () => {
      // Given: Repository throws BaseError
      const body = "Error comment";
      const postId = "post-123";
      const userId = "user-123";
      const mockUser = UserFixtures.valid.basic;
      const baseError = BaseError.createFailed("Comment");

      mockUserRepository.getUserProfile.mockResolvedValue(mockUser);
      mockCommentRepository.create.mockRejectedValue(baseError);

      // When: Add new comment
      // Then: Should re-throw the same BaseError
      await expect(
        commentService.addComment({ body, postId, userId })
      ).rejects.toThrow(baseError);
    });

    it("should wrap generic error in BaseError.createFailed", async () => {
      // Given: Repository throws generic error
      const body = "Generic error comment";
      const postId = "post-123";
      const userId = "user-123";
      const mockUser = UserFixtures.valid.basic;
      const genericError = new Error("Database error");

      mockUserRepository.getUserProfile.mockResolvedValue(mockUser);
      mockCommentRepository.create.mockRejectedValue(genericError);

      // When: Add new comment
      // Then: Should wrap error in BaseError.createFailed
      await expect(
        commentService.addComment({ body, postId, userId })
      ).rejects.toThrow(BaseError);
      await expect(
        commentService.addComment({ body, postId, userId })
      ).rejects.toThrow("Failed to create comment");
    });
  });

  describe("updateComment", () => {
    it("should update and return comment when user is owner", async () => {
      // Given: Existing comment owned by user
      const commentId = "comment-123";
      const newBody = "Updated comment body";
      const userId = "user-123";
      const mockComment = {
        ...CommentFixtures.valid.basic,
        id: commentId,
        user: { ...CommentFixtures.valid.basic.user, id: userId },
        updateBody: vi.fn(),
      };
      const updatedComment = { ...mockComment, body: newBody };

      mockCommentRepository.getById.mockResolvedValue(mockComment);
      mockCommentRepository.update.mockResolvedValue(updatedComment);

      // When: Update comment
      const result = await commentService.updateComment({
        id: commentId,
        body: newBody,
        userId,
      });

      // Then: Should update and return comment
      expect(result).toEqual(CommentMapper.toDto(updatedComment));
      expect(mockCommentRepository.getById).toHaveBeenCalledWith(commentId);
      expect(mockComment.updateBody).toHaveBeenCalledWith(newBody);
      expect(mockCommentRepository.update).toHaveBeenCalledWith(mockComment);
    });

    it("should throw BaseError.notFound when comment does not exist", async () => {
      // Given: Comment does not exist
      const commentId = "non-existent-comment";
      const newBody = "Updated body";
      const userId = "user-123";

      mockCommentRepository.getById.mockResolvedValue(null);

      // When: Update comment
      // Then: Should throw BaseError.notFound
      await expect(
        commentService.updateComment({
        id: commentId,
        body: newBody,
        userId,
      })
      ).rejects.toThrow(BaseError);
      await expect(
        commentService.updateComment({
        id: commentId,
        body: newBody,
        userId,
      })
      ).rejects.toThrow("Comment");
    });

    it("should throw BaseError.unauthorized when user is not owner", async () => {
      // Given: Comment owned by different user
      const commentId = "comment-123";
      const newBody = "Updated body";
      const userId = "user-456";
      const mockComment = {
        ...CommentFixtures.valid.basic,
        id: commentId,
        user: { ...CommentFixtures.valid.basic.user, id: "user-123" },
      };

      mockCommentRepository.getById.mockResolvedValue(mockComment);

      // When: Update comment
      // Then: Should throw BaseError.unauthorized
      await expect(
        commentService.updateComment({
        id: commentId,
        body: newBody,
        userId,
      })
      ).rejects.toThrow(BaseError);
      await expect(
        commentService.updateComment({
        id: commentId,
        body: newBody,
        userId,
      })
      ).rejects.toThrow("You don't have permission to edit");
    });

    it("should throw BaseError.updateFailed when repository update fails", async () => {
      // Given: Repository fails to update comment
      const commentId = "comment-123";
      const newBody = "Updated body";
      const userId = "user-123";
      const mockComment = {
        ...CommentFixtures.valid.basic,
        id: commentId,
        user: { ...CommentFixtures.valid.basic.user, id: userId },
        updateBody: vi.fn(),
      };

      mockCommentRepository.getById.mockResolvedValue(mockComment);
      mockCommentRepository.update.mockResolvedValue(null);

      // When: Update comment
      // Then: Should throw BaseError.updateFailed
      await expect(
        commentService.updateComment({
        id: commentId,
        body: newBody,
        userId,
      })
      ).rejects.toThrow(BaseError);
      await expect(
        commentService.updateComment({
        id: commentId,
        body: newBody,
        userId,
      })
      ).rejects.toThrow("Failed to update comment with ID");
    });

    it("should re-throw BaseError when repository throws BaseError", async () => {
      // Given: Repository throws BaseError
      const commentId = "comment-123";
      const newBody = "Updated body";
      const userId = "user-123";
      const baseError = BaseError.updateFailed("Comment", commentId);

      mockCommentRepository.getById.mockRejectedValue(baseError);

      // When: Update comment
      // Then: Should re-throw the same BaseError
      await expect(
        commentService.updateComment({
        id: commentId,
        body: newBody,
        userId,
      })
      ).rejects.toThrow(baseError);
    });
  });

  describe("deleteComment", () => {
    it("should delete comment when user is owner", async () => {
      // Given: Existing comment owned by user
      const commentId = "comment-123";
      const userId = "user-123";
      const mockComment = {
        ...CommentFixtures.valid.basic,
        id: commentId,
        user: { ...CommentFixtures.valid.basic.user, id: userId },
      };

      mockCommentRepository.getById.mockResolvedValue(mockComment);
      mockCommentRepository.delete.mockResolvedValue(true);

      // When: Delete comment
      const result = await commentService.deleteComment({
        id: commentId,
        userId,
      });

      // Then: Should delete comment and return true
      expect(result).toBe(true);
      expect(mockCommentRepository.getById).toHaveBeenCalledWith(commentId);
      expect(mockCommentRepository.delete).toHaveBeenCalledWith(commentId);
    });

    it("should throw BaseError.notFound when comment does not exist", async () => {
      // Given: Comment does not exist
      const commentId = "non-existent-comment";
      const userId = "user-123";

      mockCommentRepository.getById.mockResolvedValue(null);

      // When: Delete comment
      // Then: Should throw BaseError.notFound
      await expect(
        commentService.deleteComment({ id: commentId, userId })
      ).rejects.toThrow(BaseError);
      await expect(
        commentService.deleteComment({ id: commentId, userId })
      ).rejects.toThrow("Comment");
    });

    it("should throw BaseError.unauthorized when user is not owner", async () => {
      // Given: Comment owned by different user
      const commentId = "comment-123";
      const userId = "user-456";
      const mockComment = {
        ...CommentFixtures.valid.basic,
        id: commentId,
        user: { ...CommentFixtures.valid.basic.user, id: "user-123" },
      };

      mockCommentRepository.getById.mockResolvedValue(mockComment);

      // When: Delete comment
      // Then: Should throw BaseError.unauthorized
      await expect(
        commentService.deleteComment({ id: commentId, userId })
      ).rejects.toThrow(BaseError);
      await expect(
        commentService.deleteComment({ id: commentId, userId })
      ).rejects.toThrow("You don't have permission to delete");
    });

    it("should throw BaseError.deleteFailed when repository delete fails", async () => {
      // Given: Repository fails to delete comment
      const commentId = "comment-123";
      const userId = "user-123";
      const mockComment = {
        ...CommentFixtures.valid.basic,
        id: commentId,
        user: { ...CommentFixtures.valid.basic.user, id: userId },
      };

      mockCommentRepository.getById.mockResolvedValue(mockComment);
      mockCommentRepository.delete.mockResolvedValue(false);

      // When: Delete comment
      // Then: Should throw BaseError.deleteFailed
      await expect(
        commentService.deleteComment({ id: commentId, userId })
      ).rejects.toThrow(BaseError);
      await expect(
        commentService.deleteComment({ id: commentId, userId })
      ).rejects.toThrow("Failed to delete comment with ID");
    });

    it("should re-throw BaseError when repository throws BaseError", async () => {
      // Given: Repository throws BaseError
      const commentId = "comment-123";
      const userId = "user-123";
      const baseError = BaseError.deleteFailed("Comment", commentId);

      mockCommentRepository.getById.mockRejectedValue(baseError);

      // When: Delete comment
      // Then: Should re-throw the same BaseError
      await expect(
        commentService.deleteComment({ id: commentId, userId })
      ).rejects.toThrow(baseError);
    });
  });

  describe("likeComment", () => {
    it("should like comment and return true when successful", async () => {
      // Given: Repository successfully likes comment
      const commentId = "comment-123";
      const userId = "user-456";

      mockCommentRepository.like.mockResolvedValue(true);

      // When: Like comment
      const result = await commentService.likeComment({
        id: commentId,
        userId,
      });

      // Then: Should return true
      expect(result).toBe(true);
      expect(mockCommentRepository.like).toHaveBeenCalledWith(
        commentId,
        userId
      );
    });

    it("should return false when like operation fails", async () => {
      // Given: Repository fails to like comment
      const commentId = "comment-123";
      const userId = "user-456";

      mockCommentRepository.like.mockResolvedValue(false);

      // When: Like comment
      const result = await commentService.likeComment({
        id: commentId,
        userId,
      });

      // Then: Should return false
      expect(result).toBe(false);
      expect(mockCommentRepository.like).toHaveBeenCalledWith(
        commentId,
        userId
      );
    });

    it("should re-throw BaseError when repository throws BaseError", async () => {
      // Given: Repository throws BaseError
      const commentId = "comment-123";
      const userId = "user-456";
      const baseError = BaseError.notFound("Comment", commentId);

      mockCommentRepository.like.mockRejectedValue(baseError);

      // When: Like comment
      // Then: Should re-throw the same BaseError
      await expect(
        commentService.likeComment({ id: commentId, userId })
      ).rejects.toThrow(baseError);
    });

    it("should wrap generic error in BaseError.updateFailed", async () => {
      // Given: Repository throws generic error
      const commentId = "comment-123";
      const userId = "user-456";
      const genericError = new Error("Database error");

      mockCommentRepository.like.mockRejectedValue(genericError);

      // When: Like comment
      // Then: Should wrap error in BaseError.updateFailed
      await expect(
        commentService.likeComment({ id: commentId, userId })
      ).rejects.toThrow(BaseError);
      await expect(
        commentService.likeComment({ id: commentId, userId })
      ).rejects.toThrow("Failed to update comment with ID");
    });
  });

  describe("unlikeComment", () => {
    it("should unlike comment and return true when successful", async () => {
      // Given: Repository successfully unlikes comment
      const commentId = "comment-123";
      const userId = "user-456";

      mockCommentRepository.unlike.mockResolvedValue(true);

      // When: Unlike comment
      const result = await commentService.unlikeComment({
        id: commentId,
        userId,
      });

      // Then: Should return true
      expect(result).toBe(true);
      expect(mockCommentRepository.unlike).toHaveBeenCalledWith(
        commentId,
        userId
      );
    });

    it("should return false when unlike operation fails", async () => {
      // Given: Repository fails to unlike comment
      const commentId = "comment-123";
      const userId = "user-456";

      mockCommentRepository.unlike.mockResolvedValue(false);

      // When: Unlike comment
      const result = await commentService.unlikeComment({
        id: commentId,
        userId,
      });

      // Then: Should return false
      expect(result).toBe(false);
      expect(mockCommentRepository.unlike).toHaveBeenCalledWith(
        commentId,
        userId
      );
    });

    it("should re-throw BaseError when repository throws BaseError", async () => {
      // Given: Repository throws BaseError
      const commentId = "comment-123";
      const userId = "user-456";
      const baseError = BaseError.notFound("Comment", commentId);

      mockCommentRepository.unlike.mockRejectedValue(baseError);

      // When: Unlike comment
      // Then: Should re-throw the same BaseError
      await expect(
        commentService.unlikeComment({ id: commentId, userId })
      ).rejects.toThrow(baseError);
    });

    it("should wrap generic error in BaseError.updateFailed", async () => {
      // Given: Repository throws generic error
      const commentId = "comment-123";
      const userId = "user-456";
      const genericError = new Error("Network error");

      mockCommentRepository.unlike.mockRejectedValue(genericError);

      // When: Unlike comment
      // Then: Should wrap error in BaseError.updateFailed
      await expect(
        commentService.unlikeComment({ id: commentId, userId })
      ).rejects.toThrow(BaseError);
      await expect(
        commentService.unlikeComment({ id: commentId, userId })
      ).rejects.toThrow("Failed to update comment with ID");
    });
  });

  describe("Error Handling", () => {
    it("should handle repository connection errors gracefully", async () => {
      // Given: Repository connection error
      const connectionError = new Error("Connection timeout");
      mockCommentRepository.getByPostId.mockRejectedValue(connectionError);

      // When: Get comments for post
      // Then: Should handle error gracefully
      await expect(
        commentService.getAllComments({ postId: "post-123" })
      ).rejects.toThrow(
        "Failed to fetch comments for post ID post-123"
      );
    });

    it("should handle delayed repository responses", async () => {
      // Given: Repository with delayed response using AsyncTestHelpers
      const postId = "post-123";
      const mockComments = CommentFixtures.multiple;
      const delayedResponse = AsyncTestHelpers.wrapPromise(mockComments, 100);
      mockCommentRepository.getByPostId.mockImplementation(
        () => delayedResponse
      );

      // When: Get comments for post
      const result = await commentService.getAllComments({ postId });

      // Then: Should handle delayed response correctly
      expect(result).toEqual(
        mockComments.map((comment) => CommentMapper.toDto(comment))
      );
      expect(mockCommentRepository.getByPostId).toHaveBeenCalledWith(postId);
    });

    it("should handle delayed repository errors", async () => {
      // Given: Repository with delayed error using AsyncTestHelpers
      const postId = "post-456";
      const delayedError = new Error("Delayed database error");
      const delayedErrorResponse = AsyncTestHelpers.wrapError(delayedError, 50);
      mockCommentRepository.getByPostId.mockImplementation(
        () => delayedErrorResponse
      );

      // When: Get comments for post
      // Then: Should handle delayed error correctly
      await expect(
        commentService.getAllComments({ postId })
      ).rejects.toThrow(
        `Failed to fetch comments for post ID ${postId}`
      );
    });

    it("should handle concurrent operations correctly", async () => {
      // Given: Multiple concurrent operations
      const commentId = "comment-123";
      const userId = "user-123";
      const mockComment = CommentFixtures.valid.basic;

      mockCommentRepository.getById.mockResolvedValue(mockComment);
      mockCommentRepository.like.mockResolvedValue(true);
      mockCommentRepository.unlike.mockResolvedValue(true);

      // When: Perform concurrent like and unlike operations
      const likePromise = commentService.likeComment({ id: commentId, userId });
      const unlikePromise = commentService.unlikeComment({ id: commentId, userId });

      const [likeResult, unlikeResult] = await Promise.all([
        likePromise,
        unlikePromise,
      ]);

      // Then: Should handle both operations correctly
      expect(likeResult).toBe(true);
      expect(unlikeResult).toBe(true);
    });

    it("should handle malformed comment data gracefully", async () => {
      // Given: Repository returns malformed comment data
      const malformedComment = {
        ...CommentFixtures.valid.basic,
        user: null,
      };
      mockCommentRepository.getById.mockResolvedValue(malformedComment);

      // When: Get comment by ID
      // Then: Should handle malformed data gracefully
      const result = await commentService.getCommentById({
        id: "comment-123",
      });
      expect(result).toBeDefined();
    });
  });

  describe("Integration Scenarios", () => {
    it("should handle complete comment lifecycle", async () => {
      // Given: Complete comment lifecycle scenario
      const postId = "post-123";
      const userId = "user-123";
      const body = "Test comment";
      const updatedBody = "Updated test comment";
      const mockUser = UserFixtures.valid.basic;
      const mockComment = {
        ...CommentFixtures.valid.basic,
        updateBody: vi.fn(),
      };
      const updatedComment = { ...mockComment, body: updatedBody };

      // Setup mocks for complete lifecycle
      mockUserRepository.getUserProfile.mockResolvedValue(mockUser);
      mockCommentRepository.create.mockResolvedValue(mockComment);
      mockCommentRepository.getById.mockResolvedValue(mockComment);
      mockCommentRepository.update.mockResolvedValue(updatedComment);
      mockCommentRepository.delete.mockResolvedValue(true);

      // When: Execute complete lifecycle
      // 1. Create comment
      const createdComment = await commentService.addComment({
        body,
        postId,
        userId,
      });

      // 2. Update comment
      const updatedCommentResult = await commentService.updateComment({
        id: mockComment.id,
        body: updatedBody,
        userId,
      });

      // 3. Delete comment
      const deleteResult = await commentService.deleteComment({
        id: mockComment.id,
        userId,
      });

      // Then: Should handle complete lifecycle correctly
      expect(createdComment).toEqual(CommentMapper.toDto(mockComment));
      expect(updatedCommentResult).toEqual(CommentMapper.toDto(updatedComment));
      expect(deleteResult).toBe(true);
    });

    it("should handle multiple comments for same post", async () => {
      // Given: Multiple comments for same post
      const postId = "post-123";
      const mockComments = CommentFixtures.multiple;

      mockCommentRepository.getByPostId.mockResolvedValue(mockComments);

      // When: Get all comments for post
      const result = await commentService.getAllComments({ postId });

      // Then: Should return all comments for post
      expect(result).toHaveLength(mockComments.length);
      expect(result).toEqual(CommentMapper.toDtoList(mockComments));
    });

    it("should handle comment operations with different users", async () => {
      // Given: Comment operations with different users
      const commentId = "comment-123";
      const ownerId = "user-123";
      const otherUserId = "user-456";
      const mockComment = {
        ...CommentFixtures.valid.basic,
        id: commentId,
        user: { ...CommentFixtures.valid.basic.user, id: ownerId },
      };

      mockCommentRepository.getById.mockResolvedValue(mockComment);
      mockCommentRepository.like.mockResolvedValue(true);

      // When: Owner and other user perform different operations
      const likeByOtherUser = await commentService.likeComment({
        id: commentId,
        userId: otherUserId,
      });

      // Then: Should handle operations correctly based on user permissions
      expect(likeByOtherUser).toBe(true);

      // When: Other user tries to update comment
      // Then: Should throw unauthorized error
      await expect(
        commentService.updateComment({
          id: commentId,
          body: "Updated",
          userId: otherUserId,
        })
      ).rejects.toThrow(BaseError);
    });
  });

  describe("Advanced Test Scenarios with Shared Utilities", () => {
    it("should handle dynamic test data generation", async () => {
      // Given: Dynamically generated test data using TestDataHelpers
      const postId = TestDataHelpers.generateId("post");
      const userId = TestDataHelpers.generateId("user");
      const commentBody = `Test comment ${TestDataHelpers.generateId(
        "content"
      )}`;
      const mockUser = {
        ...UserFixtures.valid.basic,
        id: userId,
        username: TestDataHelpers.generateUsername(),
        email: TestDataHelpers.generateEmail(),
      };
      const mockComment = {
        ...CommentFixtures.valid.basic,
        id: TestDataHelpers.generateId("comment"),
        postId,
        body: commentBody,
        user: {
          id: userId,
          username: mockUser.username,
          profileImage: mockUser.profileImage || "",
        },
        createdAt: TestDataHelpers.generateTimestamp(-3600000),
        updatedAt: TestDataHelpers.generateTimestamp(-1800000),
      };

      mockUserRepository.getUserProfile.mockResolvedValue(mockUser);
      mockCommentRepository.create.mockResolvedValue(mockComment);

      // When: Add comment with dynamic data
      const result = await commentService.addComment({
        body: commentBody,
        postId,
        userId,
      });

      // Then: Should handle dynamic data correctly
      expect(result).toEqual(CommentMapper.toDto(mockComment));
      expect(mockUserRepository.getUserProfile).toHaveBeenCalled();
      expect(mockCommentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          body: commentBody,
          postId,
          user: expect.objectContaining({
            id: userId,
            username: mockUser.username,
          }),
        })
      );
    });

    it("should handle bulk comment operations with TestDataHelpers", async () => {
      // Given: Multiple comments generated using TestDataHelpers
      const postId = TestDataHelpers.generateId("post");
      const commentCount = 5;
      const mockComments = TestDataHelpers.createArray(
        commentCount,
        (index) => ({
          ...CommentFixtures.valid.basic,
          id: TestDataHelpers.generateId("comment"),
          postId,
          body: `Comment ${index + 1} - ${TestDataHelpers.generateId(
            "content"
          )}`,
          createdAt: TestDataHelpers.generateTimestamp(-index * 3600000),
          updatedAt: TestDataHelpers.generateTimestamp(-index * 3600000),
        })
      );

      mockCommentRepository.getByPostId.mockResolvedValue(mockComments);

      // When: Get all comments for post
      const result = await commentService.getAllComments({ postId });

      // Then: Should return all generated comments
      expect(result).toHaveLength(commentCount);
      expect(result).toEqual(CommentMapper.toDtoList(mockComments));
      expect(mockCommentRepository.getByPostId).toHaveBeenCalledWith(postId);
    });

    it("should verify mock state using MockHelpers", async () => {
      // Given: Comment service with mock repositories
      const postId = TestDataHelpers.generateId("post");
      const mockComments = CommentFixtures.multiple;
      mockCommentRepository.getByPostId.mockResolvedValue(mockComments);

      // When: Perform multiple operations
      await commentService.getAllComments({ postId });
      await commentService.getAllComments({ postId });

      // Then: Verify mock state using MockHelpers
      MockHelpers.verifyMockState(
        mockCommentRepository as unknown as Record<string, unknown>,
        {
          getByPostId: 2,
        }
      );
    });

    it("should handle concurrent comment operations", async () => {
      // Given: Multiple concurrent comment operations
      const postIds = TestDataHelpers.createArray(3, (index) =>
        TestDataHelpers.generateId(`post-${index}`)
      );
      const mockCommentsPerPost = postIds.map((postId) =>
        TestDataHelpers.createArray(2, (index) => ({
          ...CommentFixtures.valid.basic,
          id: TestDataHelpers.generateId("comment"),
          postId,
          body: `Comment ${index + 1} for ${postId}`,
        }))
      );

      // Setup mocks for each post
      postIds.forEach((postId, index) => {
        mockCommentRepository.getByPostId.mockImplementationOnce(() =>
          AsyncTestHelpers.wrapPromise(mockCommentsPerPost[index], 50)
        );
      });

      // When: Execute concurrent operations
      const promises = postIds.map((postId) =>
        commentService.getAllComments({ postId })
      );
      const results = await Promise.all(promises);

      // Then: Should handle all concurrent operations correctly
      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result).toHaveLength(2);
        expect(result).toEqual(
          mockCommentsPerPost[index].map((comment) =>
            CommentMapper.toDto(comment)
          )
        );
      });
    });
  });
});
