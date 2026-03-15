import { BaseHttpClient } from "@/shared/libs/http";
import { Pagination } from "@/shared/types";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Comment } from "../../core/comment.domain";
import { CommentDto } from "../../infrastructure/dto";
import { CommentApiRepository } from "../../infrastructure/repository/comment.api.repository";
import { UserReference } from "../../types";
import { CommentFixtures } from "../fixtures/comment.fixtures";

/**
 * Comment API Repository Tests
 * Verify Comment API repository core functionality using Given-When-Then pattern
 */
describe("Comment API Repository", () => {
  let commentApiRepository: CommentApiRepository;
  let mockApiClient: BaseHttpClient;
  let validCommentDto: Required<CommentDto>;
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

    commentApiRepository = new CommentApiRepository(mockApiClient);

    // Set up valid test data
    const commentData = CommentFixtures.valid.basic;
    validUserReference = {
      id: commentData.user.id,
      username: commentData.user.username,
      profileImage: commentData.user.profileImage,
    };

    validCommentDto = {
      id: commentData.id,
      body: commentData.body,
      postId: commentData.postId,
      user: validUserReference,
      likes: commentData.likes,
      createdAt: commentData.createdAt,
      updatedAt: commentData.updatedAt,
    };
  });

  describe("getByPostId", () => {
    it("should return Comment domain objects when API call succeeds", async () => {
      // Given: Mock API client returns paginated comment data
      const mockPaginationResponse: Pagination<CommentDto> = {
        data: [validCommentDto],
        pagination: {
          total: 1,
          skip: 0,
          limit: 10,
        },
      };
      const mockResponse = {
        data: mockPaginationResponse,
        status: 200,
        statusText: "OK",
        ok: true,
      };
      vi.mocked(mockApiClient.get).mockResolvedValue(mockResponse);

      // When: Get comments by post ID
      const result = await commentApiRepository.getByPostId("post-123");

      // Then: Should return Comment domain objects and call correct endpoint
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Comment);
      expect(result[0].id).toBe(validCommentDto.id);
      expect(result[0].body).toBe(validCommentDto.body);
      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/posts/post-123/comments"
      );
    });

    it("should return empty array when no comments found", async () => {
      // Given: Mock API client returns empty data
      const mockPaginationResponse: Pagination<CommentDto> = {
        data: [],
        pagination: {
          total: 0,
          skip: 0,
          limit: 10,
        },
      };
      const mockResponse = {
        data: mockPaginationResponse,
        status: 200,
        statusText: "OK",
        ok: true,
      };
      vi.mocked(mockApiClient.get).mockResolvedValue(mockResponse);

      // When: Get comments by post ID
      const result = await commentApiRepository.getByPostId("post-123");

      // Then: Should return empty array
      expect(result).toEqual([]);
    });

    it("should throw an error when API call fails", async () => {
      // Given: Mock API client throws error
      const apiError = new Error("API Error");
      vi.mocked(mockApiClient.get).mockRejectedValue(apiError);

      // When & Then: Should throw an error
      await expect(
        commentApiRepository.getByPostId("post-123")
      ).rejects.toThrow("Failed to fetch comments");
    });
  });

  describe("getById", () => {
    it("should return Comment domain object when found", async () => {
      // Given: Mock API client returns valid comment data
      const mockResponse = {
        data: validCommentDto,
        status: 200,
        statusText: "OK",
        ok: true,
      };
      vi.mocked(mockApiClient.get).mockResolvedValue(mockResponse);

      // When: Get comment by ID
      const result = await commentApiRepository.getById("comment-123");

      // Then: Should return Comment domain object and call correct endpoint
      expect(result).toBeInstanceOf(Comment);
      expect(result.id).toBe(validCommentDto.id);
      expect(result.body).toBe(validCommentDto.body);
      expect(mockApiClient.get).toHaveBeenCalledWith("/comments/comment-123");
    });

    it("should throw error when comment not found", async () => {
      // Given: Mock API client returns null data
      const mockResponse = {
        data: null,
        status: 404,
        statusText: "Not Found",
        ok: false,
      };
      vi.mocked(mockApiClient.get).mockResolvedValue(mockResponse);

      // When & Then: Should throw error for not found comment
      await expect(
        commentApiRepository.getById("non-existent")
      ).rejects.toThrow("Comment with ID non-existent not found");
    });

    it("should throw error when API call fails", async () => {
      // Given: Mock API client throws non-404 error
      const apiError = new Error("API Error");
      vi.mocked(mockApiClient.get).mockRejectedValue(apiError);

      // When & Then: Should throw the original API error (not 404)
      await expect(commentApiRepository.getById("comment-123")).rejects.toThrow(
        "API Error"
      );
    });
  });

  describe("create", () => {
    it("should return Comment domain object when creation succeeds", async () => {
      // Given: Mock API client returns created comment data
      const mockResponse = {
        data: validCommentDto,
        status: 201,
        statusText: "Created",
        ok: true,
      };
      vi.mocked(mockApiClient.post).mockResolvedValue(mockResponse);

      const newComment = new Comment(
        "",
        "New comment body",
        validUserReference,
        "post-123",
        0,
        Date.now(),
        Date.now()
      );

      // When: Create comment
      const result = await commentApiRepository.create(newComment);

      // Then: Should return Comment domain object and call correct endpoint
      expect(result).toBeInstanceOf(Comment);
      expect(result.id).toBe(validCommentDto.id);
      expect(mockApiClient.post).toHaveBeenCalledWith("/comments/add", {
        body: "New comment body",
        postId: "post-123",
        userId: validUserReference.id,
      });
    });

    it("should throw error when creation fails", async () => {
      // Given: Mock API client returns null data
      const mockResponse = {
        data: null,
        status: 400,
        statusText: "Bad Request",
        ok: false,
      };
      vi.mocked(mockApiClient.post).mockResolvedValue(mockResponse);

      const newComment = new Comment(
        "",
        "Failed comment",
        validUserReference,
        "post-123",
        0,
        Date.now(),
        Date.now()
      );

      // When & Then: Should throw error
      await expect(commentApiRepository.create(newComment)).rejects.toThrow(
        "Failed to create comment"
      );
    });
  });

  describe("update", () => {
    it("should return updated Comment domain object when update succeeds", async () => {
      // Given: Mock API client returns updated comment data
      const updatedCommentDto = {
        ...validCommentDto,
        body: "Updated comment body",
        updatedAt: Date.now(),
      };
      const mockResponse = {
        data: updatedCommentDto,
        status: 200,
        statusText: "OK",
        ok: true,
      };
      vi.mocked(mockApiClient.put).mockResolvedValue(mockResponse);

      const existingComment = new Comment(
        validCommentDto.id,
        "Updated comment body",
        validUserReference,
        validCommentDto.postId,
        validCommentDto.likes,
        validCommentDto.createdAt,
        Date.now()
      );

      // When: Update comment
      const result = await commentApiRepository.update(existingComment);

      // Then: Should return updated Comment domain object and call correct endpoint
      expect(result).toBeInstanceOf(Comment);
      expect(result.body).toBe("Updated comment body");
      expect(mockApiClient.put).toHaveBeenCalledWith(
        `/comments/${validCommentDto.id}`,
        { body: "Updated comment body" }
      );
    });

    it("should throw error when update fails", async () => {
      // Given: Mock API client returns null data
      const mockResponse = {
        data: null,
        status: 400,
        statusText: "Bad Request",
        ok: false,
      };
      vi.mocked(mockApiClient.put).mockResolvedValue(mockResponse);

      const existingComment = new Comment(
        validCommentDto.id,
        "Failed update",
        validUserReference,
        validCommentDto.postId,
        validCommentDto.likes,
        validCommentDto.createdAt,
        Date.now()
      );

      // When & Then: Should throw error
      await expect(
        commentApiRepository.update(existingComment)
      ).rejects.toThrow("Failed to update comment");
    });
  });

  describe("save", () => {
    it("should create new comment when comment has no ID", async () => {
      // Given: Mock API client returns created comment data
      const createdCommentDto = { ...validCommentDto, id: "new-comment-id" };
      const mockResponse = {
        data: createdCommentDto,
        status: 201,
        statusText: "Created",
        ok: true,
      };
      vi.mocked(mockApiClient.post).mockResolvedValue(mockResponse);

      const newComment = new Comment(
        "",
        "New comment",
        validUserReference,
        "post-123",
        0,
        Date.now(),
        Date.now()
      );

      // When: Save comment
      const result = await commentApiRepository.save(newComment);

      // Then: Should create new comment
      expect(result).toBeInstanceOf(Comment);
      expect(result.id).toBe("new-comment-id");
      expect(mockApiClient.post).toHaveBeenCalledWith("/comments/add", {
        body: "New comment",
        postId: "post-123",
        userId: validUserReference.id,
      });
    });

    it("should update existing comment when comment has ID", async () => {
      // Given: Mock API client returns updated comment data
      const updatedCommentDto = {
        ...validCommentDto,
        body: "Updated via save",
      };
      const mockResponse = {
        data: updatedCommentDto,
        status: 200,
        statusText: "OK",
        ok: true,
      };
      vi.mocked(mockApiClient.put).mockResolvedValue(mockResponse);

      const existingComment = new Comment(
        validCommentDto.id,
        "Updated via save",
        validUserReference,
        validCommentDto.postId,
        validCommentDto.likes,
        validCommentDto.createdAt,
        Date.now()
      );

      // When: Save comment
      const result = await commentApiRepository.save(existingComment);

      // Then: Should update existing comment
      expect(result).toBeInstanceOf(Comment);
      expect(result.body).toBe("Updated via save");
      expect(mockApiClient.put).toHaveBeenCalledWith(
        `/comments/${validCommentDto.id}`,
        { body: "Updated via save" }
      );
    });
  });

  describe("delete", () => {
    it("should return true when deletion succeeds", async () => {
      // Given: Mock API client returns successful response
      const mockResponse = {
        data: { success: true },
        status: 200,
        statusText: "OK",
        ok: true,
      };
      vi.mocked(mockApiClient.delete).mockResolvedValue(mockResponse);

      // When: Delete comment
      const result = await commentApiRepository.delete("comment-123");

      // Then: Should return true and call correct endpoint
      expect(result).toBe(true);
      expect(mockApiClient.delete).toHaveBeenCalledWith(
        "/comments/comment-123"
      );
    });

    it("should return false when deletion fails", async () => {
      // Given: Mock API client throws error
      const apiError = new Error("Delete API Error");
      vi.mocked(mockApiClient.delete).mockRejectedValue(apiError);

      // When: Delete comment
      const result = await commentApiRepository.delete("comment-123");

      // Then: Should return false
      expect(result).toBe(false);
    });
  });

  describe("like", () => {
    it("should return true when like succeeds", async () => {
      // Given: Mock API client returns successful response
      const mockResponse = {
        data: { success: true },
        status: 200,
        statusText: "OK",
        ok: true,
      };
      vi.mocked(mockApiClient.patch).mockResolvedValue(mockResponse);

      // When: Like comment
      const result = await commentApiRepository.like("comment-123", "user-456");

      // Then: Should return true and call correct endpoint
      expect(result).toBe(true);
      expect(mockApiClient.patch).toHaveBeenCalledWith(
        "/comments/comment-123/like",
        { userId: "user-456" }
      );
    });

    it("should return false when like fails", async () => {
      // Given: Mock API client throws error
      const apiError = new Error("Like API Error");
      vi.mocked(mockApiClient.patch).mockRejectedValue(apiError);

      // When: Like comment
      const result = await commentApiRepository.like("comment-123", "user-456");

      // Then: Should return false
      expect(result).toBe(false);
    });
  });

  describe("unlike", () => {
    it("should return true when unlike succeeds", async () => {
      // Given: Mock API client returns successful response
      const mockResponse = {
        data: { success: true },
        status: 200,
        statusText: "OK",
        ok: true,
      };
      vi.mocked(mockApiClient.patch).mockResolvedValue(mockResponse);

      // When: Unlike comment
      const result = await commentApiRepository.unlike(
        "comment-123",
        "user-456"
      );

      // Then: Should return true and call correct endpoint
      expect(result).toBe(true);
      expect(mockApiClient.patch).toHaveBeenCalledWith(
        "/comments/comment-123/unlike",
        { userId: "user-456" }
      );
    });

    it("should return false when unlike fails", async () => {
      // Given: Mock API client throws error
      const apiError = new Error("Unlike API Error");
      vi.mocked(mockApiClient.patch).mockRejectedValue(apiError);

      // When: Unlike comment
      const result = await commentApiRepository.unlike(
        "comment-123",
        "user-456"
      );

      // Then: Should return false
      expect(result).toBe(false);
    });
  });
});
