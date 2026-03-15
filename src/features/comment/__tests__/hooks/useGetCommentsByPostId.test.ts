import { CommentDto } from "@/entities/comment";

import { QueryWrapper } from "@/shared/libs/__tests__";
import { BaseError } from "@/shared/libs/errors";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createUseGetCommentsByPostId } from "../../hooks/useGetCommentsByPostId";

/**
 * useGetCommentsByPostId Hook Tests
 * Verify React Query hook functionality using Given-When-Then pattern
 */
describe("useGetCommentsByPostId Hook", () => {
  let mockCommentUseCase: {
    getAllComments: ReturnType<typeof vi.fn>;
    getCommentById: ReturnType<typeof vi.fn>;
    addComment: ReturnType<typeof vi.fn>;
    updateComment: ReturnType<typeof vi.fn>;
    deleteComment: ReturnType<typeof vi.fn>;
    likeComment: ReturnType<typeof vi.fn>;
    unlikeComment: ReturnType<typeof vi.fn>;
  };
  let useGetCommentsByPostId: ReturnType<typeof createUseGetCommentsByPostId>;
  let mockCommentsData: CommentDto[];

  beforeEach(() => {
    // Given: Set up mock use case and test data
    mockCommentUseCase = {
      getAllComments: vi.fn(),
      getCommentById: vi.fn(),
      addComment: vi.fn(),
      updateComment: vi.fn(),
      deleteComment: vi.fn(),
      likeComment: vi.fn(),
      unlikeComment: vi.fn(),
    };

    mockCommentsData = [
      {
        id: "comment-1",
        postId: "post-1",
        user: {
          id: "user-1",
          username: "testuser",
          profileImage: "https://example.com/avatar.jpg",
        },
        body: "Test comment",
        likes: 5,
        createdAt: 1640995200000,
        updatedAt: 1640995200000,
      },
    ];

    useGetCommentsByPostId = createUseGetCommentsByPostId(mockCommentUseCase);
  });

  describe("Success Cases", () => {
    it("should successfully fetch comments by post ID", async () => {
      // Given: Valid post ID and mock data
      const postId = "post-1";
      mockCommentUseCase.getAllComments.mockResolvedValue(mockCommentsData);

      // When: Hook is called with valid post ID
      const { result } = renderHook(() => useGetCommentsByPostId(postId), {
        wrapper: QueryWrapper,
      });

      // Then: Comments should be fetched successfully
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockCommentsData);
      expect(mockCommentUseCase.getAllComments).toHaveBeenCalledWith({ postId });
    });

    it("should not execute query when post ID is empty", () => {
      // Given: Empty post ID
      const emptyPostId = "";

      // When: Hook is called with empty post ID
      const { result } = renderHook(() => useGetCommentsByPostId(emptyPostId), {
        wrapper: QueryWrapper,
      });

      // Then: Query should not be executed
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isFetching).toBe(false);
      expect(mockCommentUseCase.getAllComments).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should handle BaseError correctly", async () => {
      // Given: Valid post ID and BaseError from use case
      const postId = "post-1";
      const baseError = new BaseError("Comments not found", "NOT_FOUND");
      mockCommentUseCase.getAllComments.mockRejectedValue(baseError);

      // When: Hook is called and use case throws BaseError
      const { result } = renderHook(() => useGetCommentsByPostId(postId), {
        wrapper: QueryWrapper,
      });

      // Then: BaseError should be propagated correctly
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(baseError);
    });

    it("should wrap generic errors in BaseError", async () => {
      // Given: Valid post ID and generic error from use case
      const postId = "post-1";
      const unknownError = new Error("Network error");
      mockCommentUseCase.getAllComments.mockRejectedValue(unknownError);

      // When: Hook is called and use case throws generic error
      const { result } = renderHook(() => useGetCommentsByPostId(postId), {
        wrapper: QueryWrapper,
      });

      // Then: Generic error should be wrapped in BaseError
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(BaseError);
      expect(result.current.error?.message).toBe(
        `Failed to fetch comments for post ${postId}`
      );
    });
  });

  describe("Loading State", () => {
    it("should manage initial loading state correctly", async () => {
      // Given: Valid post ID and delayed response from use case
      const postId = "post-1";
      mockCommentUseCase.getAllComments.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockCommentsData), 100)
          )
      );

      // When: Hook is called with delayed response
      const { result } = renderHook(() => useGetCommentsByPostId(postId), {
        wrapper: QueryWrapper,
      });

      // Then: Loading state should be managed correctly
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });
});
