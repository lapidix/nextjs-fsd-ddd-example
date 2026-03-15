import { QueryWrapper } from "@/shared/libs/__tests__";
import { BaseError } from "@/shared/libs/errors";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createUseGetPostById } from "../../hooks/useGetPostById";
import { mockPostDetailData } from "../fixtures";

/**
 * useGetPostById Hook Tests
 * Verify React Query hook functionality using Given-When-Then pattern
 */
describe("useGetPostById Hook", () => {
  let mockPostUseCase: {
    getAllPosts: ReturnType<typeof vi.fn>;
    searchPosts: ReturnType<typeof vi.fn>;
    getPostById: ReturnType<typeof vi.fn>;
    addPost: ReturnType<typeof vi.fn>;
    updatePost: ReturnType<typeof vi.fn>;
    deletePost: ReturnType<typeof vi.fn>;
    likePost: ReturnType<typeof vi.fn>;
    unlikePost: ReturnType<typeof vi.fn>;
  };
  let useGetPostById: ReturnType<typeof createUseGetPostById>;

  beforeEach(() => {
    // Given: Set up mock use case and test data
    mockPostUseCase = {
      getAllPosts: vi.fn(),
      searchPosts: vi.fn(),
      getPostById: vi.fn(),
      addPost: vi.fn(),
      updatePost: vi.fn(),
      deletePost: vi.fn(),
      likePost: vi.fn(),
      unlikePost: vi.fn(),
    };

    useGetPostById = createUseGetPostById(mockPostUseCase);
  });

  describe("Success Cases", () => {
    it("should successfully fetch post details by ID", async () => {
      // Given: Valid post ID and mock data
      const postId = "post-1";
      mockPostUseCase.getPostById.mockResolvedValue(mockPostDetailData);

      // When: Hook is called with valid post ID
      const { result } = renderHook(() => useGetPostById(postId), {
        wrapper: QueryWrapper,
      });

      // Then: Post details should be fetched successfully
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toEqual(mockPostDetailData);
        expect(mockPostUseCase.getPostById).toHaveBeenCalledWith({ id: postId });
      });
    });

    it("should return post with comments included", async () => {
      // Given: Post with comments
      const postId = "post-1";
      mockPostUseCase.getPostById.mockResolvedValue(mockPostDetailData);

      // When: Hook is called for post with comments
      const { result } = renderHook(() => useGetPostById(postId), {
        wrapper: QueryWrapper,
      });

      // Then: Post should include comment data
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data?.comments).toHaveLength(2);
        expect(result.current.data?.totalComments).toBe(2);
      });
    });

    it("should not execute query when enabled is false", async () => {
      // Given: Valid post ID but enabled set to false
      const postId = "post-1";
      mockPostUseCase.getPostById.mockResolvedValue(mockPostDetailData);

      // When: Hook is called with enabled=false
      const { result } = renderHook(() => useGetPostById(postId, false), {
        wrapper: QueryWrapper,
      });

      // Then: Query should not be executed
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isFetching).toBe(false);
        expect(mockPostUseCase.getPostById).not.toHaveBeenCalled();
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle BaseError correctly", async () => {
      // Given: Valid post ID and BaseError from use case
      const postId = "non-existent-post";
      const baseError = new BaseError("Post not found", "NOT_FOUND");
      mockPostUseCase.getPostById.mockRejectedValue(baseError);

      // When: Hook is called and use case throws BaseError
      const { result } = renderHook(() => useGetPostById(postId), {
        wrapper: QueryWrapper,
      });

      // Then: BaseError should be propagated correctly
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toEqual(baseError);
      });
    });

    it("should wrap generic errors in BaseError", async () => {
      // Given: Valid post ID and generic error from use case
      const postId = "post-1";
      const unknownError = new Error("Network error");
      mockPostUseCase.getPostById.mockRejectedValue(unknownError);

      // When: Hook is called and use case throws generic error
      const { result } = renderHook(() => useGetPostById(postId), {
        wrapper: QueryWrapper,
      });

      // Then: Generic error should be wrapped in BaseError
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toBeInstanceOf(BaseError);
        expect(result.current.error?.message).toBe(
          `Failed to fetch post with ID ${postId}`
        );
      });
    });
  });

  describe("Loading State", () => {
    it("should manage loading state correctly", async () => {
      // Given: Valid post ID and delayed response from use case
      const postId = "post-1";
      mockPostUseCase.getPostById.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockPostDetailData), 100)
          )
      );

      // When: Hook is called with delayed response
      const { result } = renderHook(() => useGetPostById(postId), {
        wrapper: QueryWrapper,
      });

      // Then: Loading state should be managed correctly
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.isLoading).toBe(false);
      });
    });
  });
});
