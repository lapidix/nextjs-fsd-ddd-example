import { PostDto } from "@/entities/post";

import { QueryWrapper } from "@/shared/libs/__tests__";
import { BaseError } from "@/shared/libs/errors";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createUseGetPosts } from "../../hooks/useGetPosts";
import type { GetPostsQuery } from "../../queries";
import type { PostListResult } from "../../results";

/**
 * useGetPosts Hook Tests
 * Verify React Query hook functionality using Given-When-Then pattern
 */
describe("useGetPosts Hook", () => {
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
  let useGetPosts: ReturnType<typeof createUseGetPosts>;
  let mockPostsData: PostListResult;

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

    const mockSinglePost: PostDto = {
      id: "post-1",
      user: {
        id: "user-1",
        username: "testuser",
        profileImage: "https://example.com/avatar.jpg",
      },
      title: "Test Post",
      body: "This is a test post content",
      image: "https://example.com/post-image.jpg",
      likes: 10,
      totalComments: 5,
      createdAt: 1640995200000,
      updatedAt: 1640995200000,
    };

    mockPostsData = {
      data: [mockSinglePost],
      pagination: {
        limit: 10,
        skip: 0,
        total: 1,
      },
    };

    useGetPosts = createUseGetPosts(mockPostUseCase);
  });

  describe("Success Cases", () => {
    it("should successfully fetch posts with default options", async () => {
      // Given: Default options and mock posts data
      mockPostUseCase.getAllPosts.mockResolvedValue(mockPostsData);

      // When: Hook is called with default options
      const { result } = renderHook(() => useGetPosts(), {
        wrapper: QueryWrapper,
      });

      // Then: Posts should be fetched successfully
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPostsData);
      expect(mockPostUseCase.getAllPosts).toHaveBeenCalledWith({
        limit: 10,
        skip: 0,
      });
    });

    it("should fetch posts with custom limit and skip", async () => {
      // Given: Custom options and mock posts data
      const options: GetPostsQuery = { limit: 5, skip: 10 };
      mockPostUseCase.getAllPosts.mockResolvedValue(mockPostsData);

      // When: Hook is called with custom options
      const { result } = renderHook(() => useGetPosts(options), {
        wrapper: QueryWrapper,
      });

      // Then: Posts should be fetched with custom parameters
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPostsData);
      expect(mockPostUseCase.getAllPosts).toHaveBeenCalledWith({
        limit: 5,
        skip: 10,
      });
    });

    it("should search posts when query is provided and valid", async () => {
      // Given: Search query and mock search results
      const options: GetPostsQuery = { query: "test search" };
      mockPostUseCase.searchPosts.mockResolvedValue(mockPostsData);

      // When: Hook is called with search query
      const { result } = renderHook(() => useGetPosts(options), {
        wrapper: QueryWrapper,
      });

      // Then: Search should be performed successfully
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPostsData);
      expect(mockPostUseCase.searchPosts).toHaveBeenCalledWith({
        limit: 10,
        skip: 0,
        query: "test search",
      });
    });

    it("should not search when query is too short", async () => {
      // Given: Short query (less than 2 characters)
      const options: GetPostsQuery = { query: "a" };
      mockPostUseCase.getAllPosts.mockResolvedValue(mockPostsData);

      // When: Hook is called with short query
      const { result } = renderHook(() => useGetPosts(options), {
        wrapper: QueryWrapper,
      });

      // Then: Regular fetch should be performed instead of search
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPostUseCase.getAllPosts).toHaveBeenCalledWith({
        limit: 10,
        skip: 0,
        query: "a",
      });
      expect(mockPostUseCase.searchPosts).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should handle BaseError correctly", async () => {
      // Given: BaseError from use case
      const baseError = new BaseError("Posts not found", "NOT_FOUND");
      mockPostUseCase.getAllPosts.mockRejectedValue(baseError);

      // When: Hook is called and use case throws BaseError
      const { result } = renderHook(() => useGetPosts(), {
        wrapper: QueryWrapper,
      });

      // Then: BaseError should be propagated correctly
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(baseError);
    });

    it("should wrap generic errors in BaseError for regular fetch", async () => {
      // Given: Generic error from getAllPosts
      const unknownError = new Error("Network error");
      mockPostUseCase.getAllPosts.mockRejectedValue(unknownError);

      // When: Hook is called and getAllPosts throws generic error
      const { result } = renderHook(() => useGetPosts(), {
        wrapper: QueryWrapper,
      });

      // Then: Generic error should be wrapped in BaseError
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(BaseError);
      expect(result.current.error?.message).toBe("Failed to fetch posts");
    });

    it("should wrap generic errors in BaseError for search", async () => {
      // Given: Search query and generic error from searchPosts
      const options: GetPostsQuery = { query: "test search" };
      const unknownError = new Error("Search service error");
      mockPostUseCase.searchPosts.mockRejectedValue(unknownError);

      // When: Hook is called for search and searchPosts throws generic error
      const { result } = renderHook(() => useGetPosts(options), {
        wrapper: QueryWrapper,
      });

      // Then: Generic error should be wrapped in BaseError with search context
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(BaseError);
      expect(result.current.error?.message).toBe(
        'Failed to fetch posts with query "test search"'
      );
    });
  });

  describe("Loading State", () => {
    it("should manage initial loading state correctly", async () => {
      // Given: Delayed response from use case
      mockPostUseCase.getAllPosts.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockPostsData), 100)
          )
      );

      // When: Hook is called with delayed response
      const { result } = renderHook(() => useGetPosts(), {
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
