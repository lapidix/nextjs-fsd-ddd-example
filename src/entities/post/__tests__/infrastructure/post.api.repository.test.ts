import { BaseHttpClient } from "@/shared/libs/http";
import { Pagination } from "@/shared/types";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Post } from "../../core";
import { PostDto } from "../../infrastructure/dto";
import { PostApiRepository } from "../../infrastructure/repository";
import { UserReference } from "../../types";

/**
 * Post API Repository Tests
 * Verify Post API repository core functionality using Given-When-Then pattern
 */
describe("Post API Repository", () => {
  let postApiRepository: PostApiRepository;
  let mockApiClient: BaseHttpClient;
  let validPostDto: PostDto;
  let validUserReference: UserReference;

  beforeEach(() => {
    // Given: Set up mock API client and repository
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
    } as unknown as BaseHttpClient;

    postApiRepository = new PostApiRepository(mockApiClient);

    // Set up valid test data
    validUserReference = {
      id: "user-123",
      username: "testuser",
      profileImage: "https://example.com/avatar.jpg",
    };

    validPostDto = {
      id: "post-123",
      user: validUserReference,
      title: "Test Post Title",
      body: "This is a test post body content.",
      image: "https://example.com/post-image.jpg",
      likes: 5,
      totalComments: 3,
      createdAt: 1640995200000,
      updatedAt: 1640995200000,
    };
  });

  describe("getAll", () => {
    it("should return array of Post domain objects when API call succeeds", async () => {
      // Given: Mock API client returns paginated post data
      const mockPaginationResponse: Pagination<PostDto> = {
        data: [validPostDto],
        pagination: { total: 1, skip: 0, limit: 10 },
      };
      const mockResponse = {
        data: mockPaginationResponse,
        status: 200,
        statusText: "OK",
        ok: true,
      };
      vi.mocked(mockApiClient.get).mockResolvedValue(mockResponse);

      // When: Get all posts
      const result = await postApiRepository.getAll(10, 0);

      // Then: Should return array of Post domain objects
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Post);
      expect(result[0].id).toBe(validPostDto.id);
      expect(result[0].title).toBe(validPostDto.title);
      expect(result[0].user).toEqual(validPostDto.user);
      expect(mockApiClient.get).toHaveBeenCalledWith("/posts?limit=10&skip=0");
    });

    it("should return empty array when API returns no data", async () => {
      // Given: Mock API client returns empty data
      const mockPaginationResponse: Pagination<PostDto> = {
        data: [],
        pagination: { total: 0, skip: 0, limit: 10 },
      };
      const mockResponse = {
        data: mockPaginationResponse,
        status: 200,
        statusText: "OK",
        ok: true,
      };
      vi.mocked(mockApiClient.get).mockResolvedValue(mockResponse);

      // When: Get all posts
      const result = await postApiRepository.getAll(10, 0);

      // Then: Should return empty array
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should return empty array when API call fails", async () => {
      // Given: Mock API client throws error
      const apiError = new Error("API Error");
      vi.mocked(mockApiClient.get).mockRejectedValue(apiError);

      // When: Get all posts
      const result = await postApiRepository.getAll(10, 0);

      // Then: Should return empty array
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe("getById", () => {
    it("should return Post domain object when API call succeeds", async () => {
      // Given: Mock API client returns valid post data
      const mockResponse = {
        data: validPostDto,
        status: 200,
        statusText: "OK",
        ok: true,
      };
      vi.mocked(mockApiClient.get).mockResolvedValue(mockResponse);

      // When: Get post by ID
      const result = await postApiRepository.getById("post-123");

      // Then: Should return Post domain object
      expect(result).toBeInstanceOf(Post);
      expect(result.id).toBe(validPostDto.id);
      expect(result.title).toBe(validPostDto.title);
      expect(result.user).toEqual(validPostDto.user);
      expect(mockApiClient.get).toHaveBeenCalledWith("/posts/post-123");
    });

    it("should throw error when post is not found", async () => {
      // Given: Mock API client returns null data
      const mockResponse = {
        data: null,
        status: 404,
        statusText: "Not Found",
        ok: false,
      };
      vi.mocked(mockApiClient.get).mockResolvedValue(mockResponse);

      // When & Then: Should throw error for not found post
      await expect(postApiRepository.getById("non-existent")).rejects.toThrow(
        "Post with ID non-existent not found"
      );
    });

    it("should throw error when API call fails", async () => {
      // Given: Mock API client throws error
      const apiError = new Error("API Error");
      vi.mocked(mockApiClient.get).mockRejectedValue(apiError);

      // When & Then: Should throw the API error
      await expect(postApiRepository.getById("post-123")).rejects.toThrow(
        "API Error"
      );
    });
  });

  describe("create", () => {
    it("should return Post domain object when creation succeeds", async () => {
      // Given: Mock API client returns created post data
      const mockResponse = {
        data: validPostDto,
        status: 201,
        statusText: "Created",
        ok: true,
      };
      vi.mocked(mockApiClient.post).mockResolvedValue(mockResponse);

      const newPost = new Post(
        "",
        validUserReference,
        "New Post Title",
        "New Post Body",
        "https://example.com/image.jpg",
        0,
        0,
        Date.now(),
        Date.now()
      );

      // When: Create post
      const result = await postApiRepository.create(newPost);

      // Then: Should return Post domain object
      expect(result).toBeInstanceOf(Post);
      expect(result?.id).toBe(validPostDto.id);
      expect(mockApiClient.post).toHaveBeenCalledWith("/posts/add", {
        title: "New Post Title",
        body: "New Post Body",
        userId: validUserReference.id,
      });
    });

    it("should return null when creation fails", async () => {
      // Given: Mock API client returns null data
      const mockResponse = {
        data: null,
        status: 400,
        statusText: "Bad Request",
        ok: false,
      };
      vi.mocked(mockApiClient.post).mockResolvedValue(mockResponse);

      const newPost = new Post(
        "",
        validUserReference,
        "Failed Post",
        "Failed Body",
        "",
        0,
        0,
        Date.now(),
        Date.now()
      );

      // When: Create post
      const result = await postApiRepository.create(newPost);

      // Then: Should return null
      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("should return updated Post domain object when update succeeds", async () => {
      // Given: Mock API client returns updated post data
      const updatedPostDto = {
        ...validPostDto,
        title: "Updated Title",
        body: "Updated Body",
        updatedAt: Date.now(),
      };
      const mockResponse = {
        data: updatedPostDto,
        status: 200,
        statusText: "OK",
        ok: true,
      };
      vi.mocked(mockApiClient.put).mockResolvedValue(mockResponse);

      const existingPost = new Post(
        validPostDto.id,
        validUserReference,
        "Updated Title",
        "Updated Body",
        validPostDto.image,
        validPostDto.likes,
        validPostDto.totalComments,
        validPostDto.createdAt,
        Date.now()
      );

      // When: Update post
      const result = await postApiRepository.update(existingPost);

      // Then: Should return updated Post domain object
      expect(result).toBeInstanceOf(Post);
      expect(result?.title).toBe("Updated Title");
      expect(result?.body).toBe("Updated Body");
      expect(mockApiClient.put).toHaveBeenCalledWith(
        `/posts/${validPostDto.id}`,
        {
          title: "Updated Title",
          body: "Updated Body",
        }
      );
    });

    it("should return null when update fails", async () => {
      // Given: Mock API client returns null data
      const mockResponse = {
        data: null,
        status: 400,
        statusText: "Bad Request",
        ok: false,
      };
      vi.mocked(mockApiClient.put).mockResolvedValue(mockResponse);

      const existingPost = new Post(
        validPostDto.id,
        validUserReference,
        "Failed Update",
        "Failed Body",
        validPostDto.image,
        validPostDto.likes,
        validPostDto.totalComments,
        validPostDto.createdAt,
        Date.now()
      );

      // When: Update post
      const result = await postApiRepository.update(existingPost);

      // Then: Should return null
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should return true when deletion succeeds", async () => {
      // Given: Mock API client returns successful response
      const mockResponse = {
        data: { success: true },
        ok: true,
        status: 200,
        statusText: "OK",
      };
      vi.mocked(mockApiClient.delete).mockResolvedValue(mockResponse);

      // When: Delete post
      const result = await postApiRepository.delete("post-123");

      // Then: Should return true
      expect(result).toBe(true);
      expect(mockApiClient.delete).toHaveBeenCalledWith("/posts/post-123");
    });

    it("should return false when deletion fails", async () => {
      // Given: Mock API client throws error
      const apiError = new Error("Delete API Error");
      vi.mocked(mockApiClient.delete).mockRejectedValue(apiError);

      // When: Delete post
      const result = await postApiRepository.delete("post-123");

      // Then: Should return false
      expect(result).toBe(false);
    });
  });

  describe("like", () => {
    it("should return true when like succeeds", async () => {
      // Given: Mock API client returns successful response
      const mockResponse = {
        data: { success: true },
        ok: true,
        status: 200,
        statusText: "OK",
      };
      vi.mocked(mockApiClient.patch).mockResolvedValue(mockResponse);

      // When: Like post
      const result = await postApiRepository.like("post-123", "user-456");

      // Then: Should return true
      expect(result).toBe(true);
      expect(mockApiClient.patch).toHaveBeenCalledWith("/posts/post-123/like", {
        userId: "user-456",
      });
    });

    it("should return false when like fails", async () => {
      // Given: Mock API client throws error
      const apiError = new Error("Like API Error");
      vi.mocked(mockApiClient.patch).mockRejectedValue(apiError);

      // When: Like post
      const result = await postApiRepository.like("post-123", "user-456");

      // Then: Should return false
      expect(result).toBe(false);
    });
  });

  describe("unlike", () => {
    it("should return true when unlike succeeds", async () => {
      // Given: Mock API client returns successful response
      const mockResponse = {
        data: { success: true },
        ok: true,
        status: 200,
        statusText: "OK",
      };
      vi.mocked(mockApiClient.patch).mockResolvedValue(mockResponse);

      // When: Unlike post
      const result = await postApiRepository.unlike("post-123", "user-456");

      // Then: Should return true
      expect(result).toBe(true);
      expect(mockApiClient.patch).toHaveBeenCalledWith(
        "/posts/post-123/unlike",
        {
          userId: "user-456",
        }
      );
    });

    it("should return false when unlike fails", async () => {
      // Given: Mock API client throws error
      const apiError = new Error("Unlike API Error");
      vi.mocked(mockApiClient.patch).mockRejectedValue(apiError);

      // When: Unlike post
      const result = await postApiRepository.unlike("post-123", "user-456");

      // Then: Should return false
      expect(result).toBe(false);
    });
  });
});
