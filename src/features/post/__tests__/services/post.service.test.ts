import { CommentMapper, CommentRepository } from "@/entities/comment";
import {
  CommentFixtures,
  CommentRepositoryMocks,
  MockCommentRepository,
} from "@/entities/comment/__tests__";
import { PostMapper, PostRepository } from "@/entities/post";
import {
  MockPostRepository,
  PostFixtures,
  PostRepositoryMocks,
} from "@/entities/post/__tests__";
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
import { PostService } from "../../services/post.service";

/**
 * Post Service Tests
 * Verify all Post service functionality using Given-When-Then pattern
 */
describe("Post Service", () => {
  let mockPostRepository: MockPostRepository;
  let mockCommentRepository: MockCommentRepository;
  let mockUserRepository: MockUserRepository;
  let postService: ReturnType<typeof PostService>;

  beforeEach(() => {
    // Given: Set up mock repositories using test utils
    mockPostRepository = PostRepositoryMocks.create();
    mockCommentRepository = CommentRepositoryMocks.create();
    mockUserRepository = UserRepositoryMocks.create();

    // Reset all mocks using shared utility
    MockHelpers.resetAll(
      mockPostRepository,
      mockCommentRepository,
      mockUserRepository
    );

    postService = PostService(
      mockPostRepository as unknown as PostRepository,
      mockCommentRepository as unknown as CommentRepository,
      mockUserRepository as unknown as UserRepository
    );
  });

  describe("getAllPosts", () => {
    it("should return paginated post list when repository returns valid data", async () => {
      // Given: Repository returns valid posts
      const mockPosts = PostFixtures.multiple;
      mockPostRepository.getAll.mockResolvedValue(mockPosts);

      // When: Get all posts
      const result = await postService.getAllPosts({ limit: 10, skip: 0 });

      // Then: Should return paginated post list
      expect(result).toEqual({
        data: PostMapper.toDtoList(mockPosts),
        pagination: {
          limit: 10,
          skip: 0,
          total: mockPosts.length,
        },
      });
      expect(mockPostRepository.getAll).toHaveBeenCalledWith(10, 0);
    });

    it("should use default pagination when no parameters provided", async () => {
      // Given: Repository returns valid posts
      const mockPosts = PostFixtures.multiple;
      mockPostRepository.getAll.mockResolvedValue(mockPosts);

      // When: Get all posts without parameters
      const result = await postService.getAllPosts({});

      // Then: Should use default pagination
      expect(result.pagination).toEqual({
        limit: 10,
        skip: 0,
        total: mockPosts.length,
      });
      expect(mockPostRepository.getAll).toHaveBeenCalledWith(10, 0);
    });

    it("should handle empty post list", async () => {
      // Given: Repository returns empty array
      mockPostRepository.getAll.mockResolvedValue([]);

      // When: Get all posts
      const result = await postService.getAllPosts({});

      // Then: Should return empty paginated result
      expect(result).toEqual({
        data: [],
        pagination: {
          limit: 10,
          skip: 0,
          total: 0,
        },
      });
    });

    it("should re-throw BaseError when repository throws BaseError", async () => {
      // Given: Repository throws BaseError
      const baseError = BaseError.notFound("Post", "all");
      mockPostRepository.getAll.mockRejectedValue(baseError);

      // When: Get all posts
      // Then: Should re-throw the same BaseError
      await expect(postService.getAllPosts({})).rejects.toThrow(baseError);
    });

    it("should wrap generic error in BaseError", async () => {
      // Given: Repository throws generic error
      const genericError = new Error("Database connection failed");
      mockPostRepository.getAll.mockRejectedValue(genericError);

      // When: Get all posts
      // Then: Should wrap error in BaseError
      await expect(postService.getAllPosts({})).rejects.toThrow(BaseError);
      await expect(postService.getAllPosts({})).rejects.toThrow(
        "Failed to fetch post list"
      );
    });
  });

  describe("searchPosts", () => {
    it("should return search results when repository returns matching posts", async () => {
      // Given: Repository returns matching posts
      const mockPosts = [PostFixtures.valid.basic];
      const searchQuery = "test";
      mockPostRepository.search.mockResolvedValue(mockPosts);

      // When: Search posts
      const result = await postService.searchPosts({ limit: 10, skip: 0, query: searchQuery });

      // Then: Should return search results
      expect(result).toEqual({
        data: PostMapper.toDtoList(mockPosts),
        pagination: {
          limit: 10,
          skip: 0,
          total: mockPosts.length,
        },
      });
      expect(mockPostRepository.search).toHaveBeenCalledWith(searchQuery);
    });

    it("should handle empty search results", async () => {
      // Given: Repository returns empty array for search
      mockPostRepository.search.mockResolvedValue([]);

      // When: Search posts
      const result = await postService.searchPosts({
        limit: 10,
        skip: 0,
        query: "nonexistent",
      });

      // Then: Should return empty search results
      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it("should wrap search error in BaseError with query information", async () => {
      // Given: Repository throws error during search
      const searchQuery = "test query";
      const searchError = new Error("Search failed");
      mockPostRepository.search.mockRejectedValue(searchError);

      // When: Search posts
      // Then: Should wrap error with query information
      await expect(postService.searchPosts({ limit: 10, skip: 0, query: searchQuery })).rejects.toThrow(
        BaseError
      );
      await expect(postService.searchPosts({ limit: 10, skip: 0, query: searchQuery })).rejects.toThrow(
        `Failed to search posts with query "${searchQuery}"`
      );
    });
  });

  describe("getPostById", () => {
    it("should return post with comments when post exists", async () => {
      // Given: Repository returns valid post and comments
      const mockPost = PostFixtures.valid.basic;
      const mockComments = CommentFixtures.multiple;
      mockPostRepository.getById.mockResolvedValue(mockPost);
      mockCommentRepository.getByPostId.mockResolvedValue(mockComments);

      // When: Get post by ID
      const result = await postService.getPostById({
        id: mockPost.id });

      // Then: Should return post with comments
      expect(result).toEqual({
        ...PostMapper.toDto(mockPost),
        comments: CommentMapper.toDtoList(mockComments),
      });
      expect(mockPostRepository.getById).toHaveBeenCalledWith(mockPost.id);
      expect(mockCommentRepository.getByPostId).toHaveBeenCalledWith(
        mockPost.id
      );
    });

    it("should throw NotFoundError when post does not exist", async () => {
      // Given: Repository returns null for post
      const postId = "nonexistent-post";
      mockPostRepository.getById.mockResolvedValue(null);

      // When: Get post by ID
      // Then: Should throw NotFoundError
      await expect(postService.getPostById({
        id: postId })).rejects.toThrow(BaseError);
      await expect(postService.getPostById({
        id: postId })).rejects.toThrow(
        `Post with ID ${postId} not found`
      );
    });

    it("should handle post with no comments", async () => {
      // Given: Repository returns post with no comments
      const mockPost = PostFixtures.valid.basic;
      mockPostRepository.getById.mockResolvedValue(mockPost);
      mockCommentRepository.getByPostId.mockResolvedValue([]);

      // When: Get post by ID
      const result = await postService.getPostById({
        id: mockPost.id });

      // Then: Should return post with empty comments array
      expect(result.comments).toEqual([]);
    });

    it("should wrap generic error as NotFoundError", async () => {
      // Given: Repository throws generic error
      const postId = "error-post";
      const genericError = new Error("Database error");
      mockPostRepository.getById.mockRejectedValue(genericError);

      // When: Get post by ID
      // Then: Should wrap as NotFoundError
      await expect(postService.getPostById({
        id: postId })).rejects.toThrow(BaseError);
      await expect(postService.getPostById({
        id: postId })).rejects.toThrow(
        `Post with ID ${postId} not found`
      );
    });
  });

  describe("addPost", () => {
    it("should create new post when user exists", async () => {
      // Given: User exists and repository creates post successfully
      const mockUser = UserFixtures.valid.basic;
      const title = "New Post Title";
      const body = "New post body content";
      const userId = mockUser.id;
      const image = "https://example.com/image.jpg";

      mockUserRepository.getUserProfile.mockResolvedValue(mockUser);

      const mockCreatedPost = PostFixtures.valid.basic;
      mockPostRepository.create.mockResolvedValue(mockCreatedPost);

      // When: Add new post
      const result = await postService.addPost({
        title,
        body,
        userId,
        image,
      });

      // Then: Should create and return new post
      expect(result).toEqual(PostMapper.toDto(mockCreatedPost));
      expect(mockUserRepository.getUserProfile).toHaveBeenCalled();
      expect(mockPostRepository.create).toHaveBeenCalled();
    });

    it("should create post without image when image not provided", async () => {
      // Given: User exists and no image provided
      const mockUser = UserFixtures.valid.basic;
      const title = "New Post Title";
      const body = "New post body content";
      const userId = mockUser.id;

      mockUserRepository.getUserProfile.mockResolvedValue(mockUser);

      const mockCreatedPost = PostFixtures.valid.withoutImage;
      mockPostRepository.create.mockResolvedValue(mockCreatedPost);

      // When: Add new post without image
      const result = await postService.addPost({ title, body, userId });

      // Then: Should create post without image
      expect(result).toEqual(PostMapper.toDto(mockCreatedPost));
    });

    it("should throw NotFoundError when user does not exist", async () => {
      // Given: User does not exist
      const userId = "nonexistent-user";
      mockUserRepository.getUserProfile.mockResolvedValue(null);

      // When: Add new post
      // Then: Should throw NotFoundError for user
      await expect(
        postService.addPost({
        title: "Title",
        body: "Body",
        userId,
      })
      ).rejects.toThrow(BaseError);
      await expect(
        postService.addPost({
        title: "Title",
        body: "Body",
        userId,
      })
      ).rejects.toThrow(`User with ID ${userId} not found`);
    });

    it("should throw CreateFailedError when repository fails to create post", async () => {
      // Given: User exists but repository fails to create post
      const mockUser = UserFixtures.valid.basic;
      mockUserRepository.getUserProfile.mockResolvedValue(mockUser);
      mockPostRepository.create.mockResolvedValue(null);

      // When: Add new post
      // Then: Should throw CreateFailedError
      await expect(
        postService.addPost({
        title: "Title",
        body: "Body",
        userId: mockUser.id,
      })
      ).rejects.toThrow(BaseError);
      await expect(
        postService.addPost({
        title: "Title",
        body: "Body",
        userId: mockUser.id,
      })
      ).rejects.toThrow("Failed to create post");
    });

    it("should wrap generic error as CreateFailedError", async () => {
      // Given: Generic error occurs during post creation
      const mockUser = UserFixtures.valid.basic;
      mockUserRepository.getUserProfile.mockResolvedValue(mockUser);
      const genericError = new Error("Database error");
      mockPostRepository.create.mockRejectedValue(genericError);

      // When: Add new post
      // Then: Should wrap as CreateFailedError
      await expect(
        postService.addPost({
        title: "Title",
        body: "Body",
        userId: mockUser.id,
      })
      ).rejects.toThrow(BaseError);
      await expect(
        postService.addPost({
        title: "Title",
        body: "Body",
        userId: mockUser.id,
      })
      ).rejects.toThrow("Failed to create post");
    });
  });

  describe("updatePost", () => {
    it("should update post when post exists", async () => {
      // Given: Post exists and can be updated
      const mockPostData = PostFixtures.valid.basic;
      const newTitle = "Updated Title";
      const newBody = "Updated body content";

      // Create a mock Post domain object with update methods
      const mockPost = {
        ...mockPostData,
        updateTitle: vi.fn(),
        updateBody: vi.fn(),
      };

      mockPostRepository.getById.mockResolvedValue(mockPost);

      const updatedPost = { ...mockPostData, title: newTitle, body: newBody };
      mockPostRepository.update.mockResolvedValue(updatedPost);

      // When: Update post
      const result = await postService.updatePost({
        id: mockPost.id,
        title: newTitle,
        body: newBody,
      });

      // Then: Should update and return post
      expect(result).toEqual(PostMapper.toDto(updatedPost));
      expect(mockPostRepository.getById).toHaveBeenCalledWith(mockPost.id);
      expect(mockPost.updateTitle).toHaveBeenCalledWith(newTitle);
      expect(mockPost.updateBody).toHaveBeenCalledWith(newBody);
      expect(mockPostRepository.update).toHaveBeenCalledWith(mockPost);
    });

    it("should throw NotFoundError when post does not exist", async () => {
      // Given: Post does not exist
      const postId = "nonexistent-post";
      mockPostRepository.getById.mockResolvedValue(null);

      // When: Update post
      // Then: Should throw NotFoundError
      await expect(
        postService.updatePost({
        id: postId,
        title: "Title",
        body: "Body",
      })
      ).rejects.toThrow(BaseError);
      await expect(
        postService.updatePost({
        id: postId,
        title: "Title",
        body: "Body",
      })
      ).rejects.toThrow(`Post with ID ${postId} not found`);
    });

    it("should throw UpdateFailedError when repository fails to update", async () => {
      // Given: Post exists but repository fails to update
      const mockPost = PostFixtures.valid.basic;
      mockPostRepository.getById.mockResolvedValue(mockPost);
      mockPostRepository.update.mockResolvedValue(null);

      // When: Update post
      // Then: Should throw UpdateFailedError
      await expect(
        postService.updatePost({
        id: mockPost.id,
        title: "Title",
        body: "Body",
      })
      ).rejects.toThrow(BaseError);
      await expect(
        postService.updatePost({
        id: mockPost.id,
        title: "Title",
        body: "Body",
      })
      ).rejects.toThrow(`Failed to update post with ID ${mockPost.id}`);
    });

    it("should wrap generic error as UpdateFailedError", async () => {
      // Given: Generic error occurs during update
      const mockPost = PostFixtures.valid.basic;
      mockPostRepository.getById.mockResolvedValue(mockPost);
      const genericError = new Error("Database error");
      mockPostRepository.update.mockRejectedValue(genericError);

      // When: Update post
      // Then: Should wrap as UpdateFailedError
      await expect(
        postService.updatePost({
        id: mockPost.id,
        title: "Title",
        body: "Body",
      })
      ).rejects.toThrow(BaseError);
      await expect(
        postService.updatePost({
        id: mockPost.id,
        title: "Title",
        body: "Body",
      })
      ).rejects.toThrow(`Failed to update post with ID ${mockPost.id}`);
    });
  });

  describe("deletePost", () => {
    it("should delete post when post exists", async () => {
      // Given: Post exists and can be deleted
      const mockPost = PostFixtures.valid.basic;
      mockPostRepository.getById.mockResolvedValue(mockPost);
      mockPostRepository.delete.mockResolvedValue(true);

      // When: Delete post
      const result = await postService.deletePost({ id: mockPost.id });

      // Then: Should delete post successfully
      expect(result).toBe(true);
      expect(mockPostRepository.getById).toHaveBeenCalledWith(mockPost.id);
      expect(mockPostRepository.delete).toHaveBeenCalledWith(mockPost.id);
    });

    it("should throw NotFoundError when post does not exist", async () => {
      // Given: Post does not exist
      const postId = "nonexistent-post";
      mockPostRepository.getById.mockResolvedValue(null);

      // When: Delete post
      // Then: Should throw NotFoundError
      await expect(postService.deletePost({ id: postId })).rejects.toThrow(BaseError);
      await expect(postService.deletePost({ id: postId })).rejects.toThrow(
        `Post with ID ${postId} not found`
      );
    });

    it("should wrap generic error as DeleteFailedError", async () => {
      // Given: Generic error occurs during deletion
      const mockPost = PostFixtures.valid.basic;
      mockPostRepository.getById.mockResolvedValue(mockPost);
      const genericError = new Error("Database error");
      mockPostRepository.delete.mockRejectedValue(genericError);

      // When: Delete post
      // Then: Should wrap as DeleteFailedError
      await expect(postService.deletePost({ id: mockPost.id })).rejects.toThrow(
        BaseError
      );
      await expect(postService.deletePost({ id: mockPost.id })).rejects.toThrow(
        `Failed to delete post with ID ${mockPost.id}`
      );
    });
  });

  describe("likePost", () => {
    it("should like post when post and user exist", async () => {
      // Given: Post and user exist
      const mockPost = PostFixtures.valid.basic;
      const mockUser = UserFixtures.valid.basic;
      mockPostRepository.getById.mockResolvedValue(mockPost);
      mockUserRepository.getUserProfile.mockResolvedValue(mockUser);
      mockPostRepository.like.mockResolvedValue(true);

      // When: Like post
      const result = await postService.likePost({
        id: mockPost.id,
        userId: mockUser.id,
      });

      // Then: Should like post successfully
      expect(result).toBe(true);
      expect(mockPostRepository.getById).toHaveBeenCalledWith(mockPost.id);
      expect(mockUserRepository.getUserProfile).toHaveBeenCalled();
      expect(mockPostRepository.like).toHaveBeenCalledWith(
        mockPost.id,
        mockUser.id
      );
    });

    it("should throw NotFoundError when post does not exist", async () => {
      // Given: Post does not exist
      const postId = "nonexistent-post";
      const userId = "user-123";
      mockPostRepository.getById.mockResolvedValue(null);

      // When: Like post
      // Then: Should throw NotFoundError for post
      await expect(postService.likePost({ id: postId, userId })).rejects.toThrow(
        BaseError
      );
      await expect(postService.likePost({ id: postId, userId })).rejects.toThrow(
        `Post with ID ${postId} not found`
      );
    });

    it("should throw NotFoundError when user does not exist", async () => {
      // Given: Post exists but user does not exist
      const mockPost = PostFixtures.valid.basic;
      const userId = "nonexistent-user";
      mockPostRepository.getById.mockResolvedValue(mockPost);
      mockUserRepository.getUserProfile.mockResolvedValue(null);

      // When: Like post
      // Then: Should throw NotFoundError for user
      await expect(postService.likePost({ id: mockPost.id, userId })).rejects.toThrow(
        BaseError
      );
      await expect(postService.likePost({ id: mockPost.id, userId })).rejects.toThrow(
        `User with ID ${userId} not found`
      );
    });

    it("should wrap generic error as UpdateFailedError", async () => {
      // Given: Generic error occurs during like operation
      const mockPost = PostFixtures.valid.basic;
      const mockUser = UserFixtures.valid.basic;
      mockPostRepository.getById.mockResolvedValue(mockPost);
      mockUserRepository.getUserProfile.mockResolvedValue(mockUser);
      const genericError = new Error("Database error");
      mockPostRepository.like.mockRejectedValue(genericError);

      // When: Like post
      // Then: Should wrap as UpdateFailedError
      await expect(
        postService.likePost({
        id: mockPost.id,
        userId: mockUser.id,
      })
      ).rejects.toThrow(BaseError);
      await expect(
        postService.likePost({
        id: mockPost.id,
        userId: mockUser.id,
      })
      ).rejects.toThrow(`Failed to update post with ID ${mockPost.id}`);
    });
  });

  describe("unlikePost", () => {
    it("should unlike post when post and user exist", async () => {
      // Given: Post and user exist
      const mockPost = PostFixtures.valid.basic;
      const mockUser = UserFixtures.valid.basic;
      mockPostRepository.getById.mockResolvedValue(mockPost);
      mockUserRepository.getUserProfile.mockResolvedValue(mockUser);
      mockPostRepository.unlike.mockResolvedValue(true);

      // When: Unlike post
      const result = await postService.unlikePost({
        id: mockPost.id,
        userId: mockUser.id,
      });

      // Then: Should unlike post successfully
      expect(result).toBe(true);
      expect(mockPostRepository.getById).toHaveBeenCalledWith(mockPost.id);
      expect(mockUserRepository.getUserProfile).toHaveBeenCalled();
      expect(mockPostRepository.unlike).toHaveBeenCalledWith(
        mockPost.id,
        mockUser.id
      );
    });

    it("should throw NotFoundError when post does not exist", async () => {
      // Given: Post does not exist
      const postId = "nonexistent-post";
      const userId = "user-123";
      mockPostRepository.getById.mockResolvedValue(null);

      // When: Unlike post
      // Then: Should throw NotFoundError for post
      await expect(postService.unlikePost({ id: postId, userId })).rejects.toThrow(
        BaseError
      );
      await expect(postService.unlikePost({ id: postId, userId })).rejects.toThrow(
        `Post with ID ${postId} not found`
      );
    });

    it("should throw NotFoundError when user does not exist", async () => {
      // Given: Post exists but user does not exist
      const mockPost = PostFixtures.valid.basic;
      const userId = "nonexistent-user";
      mockPostRepository.getById.mockResolvedValue(mockPost);
      mockUserRepository.getUserProfile.mockResolvedValue(null);

      // When: Unlike post
      // Then: Should throw NotFoundError for user
      await expect(postService.unlikePost({ id: mockPost.id, userId })).rejects.toThrow(
        BaseError
      );
      await expect(postService.unlikePost({ id: mockPost.id, userId })).rejects.toThrow(
        `User with ID ${userId} not found`
      );
    });

    it("should wrap generic error as UpdateFailedError", async () => {
      // Given: Generic error occurs during unlike operation
      const mockPost = PostFixtures.valid.basic;
      const mockUser = UserFixtures.valid.basic;
      mockPostRepository.getById.mockResolvedValue(mockPost);
      mockUserRepository.getUserProfile.mockResolvedValue(mockUser);
      const genericError = new Error("Database error");
      mockPostRepository.unlike.mockRejectedValue(genericError);

      // When: Unlike post
      // Then: Should wrap as UpdateFailedError
      await expect(
        postService.unlikePost({
        id: mockPost.id,
        userId: mockUser.id,
      })
      ).rejects.toThrow(BaseError);
      await expect(
        postService.unlikePost({
        id: mockPost.id,
        userId: mockUser.id,
      })
      ).rejects.toThrow(`Failed to update post with ID ${mockPost.id}`);
    });
  });

  describe("Error Handling", () => {
    it("should log error when repository throws error", async () => {
      // Given: Console.error is mocked and repository throws error
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const error = new Error("Repository error");
      mockPostRepository.getAll.mockRejectedValue(error);

      // When: Get all posts
      try {
        await postService.getAllPosts({});
      } catch {
        // Expected to throw
      }

      // Then: Should log the error
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching post list:",
        error
      );

      consoleSpy.mockRestore();
    });

    it("should log error with context information", async () => {
      // Given: Console.error is mocked and repository throws error
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const postId = "test-post-id";
      const error = new Error("Repository error");
      mockPostRepository.getById.mockRejectedValue(error);

      // When: Get post by ID
      try {
        await postService.getPostById({
        id: postId });
      } catch {
        // Expected to throw
      }

      // Then: Should log the error with context
      expect(consoleSpy).toHaveBeenCalledWith(
        `Error fetching post with ID ${postId}:`,
        error
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Service Contract", () => {
    it("should implement PostUseCase interface correctly", () => {
      // Given: PostService instance
      const service = postService;

      // When: Check service methods
      // Then: Should have all required methods
      expect(typeof service.getAllPosts).toBe("function");
      expect(typeof service.searchPosts).toBe("function");
      expect(typeof service.getPostById).toBe("function");
      expect(typeof service.addPost).toBe("function");
      expect(typeof service.updatePost).toBe("function");
      expect(typeof service.deletePost).toBe("function");
      expect(typeof service.likePost).toBe("function");
      expect(typeof service.unlikePost).toBe("function");
    });

    it("should return Promise from all async methods", () => {
      // Given: Mock repositories return valid data
      mockPostRepository.getAll.mockResolvedValue([]);
      mockPostRepository.getById.mockResolvedValue(PostFixtures.valid.basic);
      mockCommentRepository.getByPostId.mockResolvedValue([]);

      // When: Call async methods
      const getAllResult = postService.getAllPosts({});
      const getByIdResult = postService.getPostById({
        id: "test-id" });

      // Then: Should return Promises
      expect(getAllResult).toBeInstanceOf(Promise);
      expect(getByIdResult).toBeInstanceOf(Promise);
    });
  });

  describe("Advanced Test Scenarios with Shared Utilities", () => {
    it("should handle dynamic post data generation", async () => {
      // Given: Dynamically generated test data using TestDataHelpers
      const userId = TestDataHelpers.generateId("user");
      const postTitle = `Test Post ${TestDataHelpers.generateId("title")}`;
      const postBody = `Post content ${TestDataHelpers.generateId("content")}`;
      const mockUser = {
        ...UserFixtures.valid.basic,
        id: userId,
        username: TestDataHelpers.generateUsername(),
        email: TestDataHelpers.generateEmail(),
      };
      const mockPost = {
        ...PostFixtures.valid.basic,
        id: TestDataHelpers.generateId("post"),
        title: postTitle,
        body: postBody,
        user: {
          id: userId,
          username: mockUser.username,
          profileImage: mockUser.profileImage || "",
        },
        createdAt: TestDataHelpers.generateTimestamp(-7200000), // 2시간 전
        updatedAt: TestDataHelpers.generateTimestamp(-3600000), // 1시간 전
      };

      mockUserRepository.getUserProfile.mockResolvedValue(mockUser);
      mockPostRepository.create.mockResolvedValue(mockPost);

      // When: Add post with dynamic data
      const result = await postService.addPost({
        title: postTitle,
        body: postBody,
        userId,
      });

      // Then: Should handle dynamic data correctly
      expect(result).toEqual(PostMapper.toDto(mockPost));
      expect(mockUserRepository.getUserProfile).toHaveBeenCalled();
      expect(mockPostRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: postTitle,
          body: postBody,
          user: expect.objectContaining({
            id: userId,
            username: mockUser.username,
          }),
        })
      );
    });

    it("should handle delayed repository responses with AsyncTestHelpers", async () => {
      // Given: Repository with delayed response
      const mockPosts = PostFixtures.multiple;
      const delayedResponse = AsyncTestHelpers.wrapPromise(mockPosts, 150);
      mockPostRepository.getAll.mockImplementation(() => delayedResponse);

      // When: Get all posts
      const result = await postService.getAllPosts({ limit: 10, skip: 0 });

      // Then: Should handle delayed response correctly
      expect(result).toEqual({
        data: PostMapper.toDtoList(mockPosts),
        pagination: {
          limit: 10,
          skip: 0,
          total: mockPosts.length,
        },
      });
    });

    it("should handle bulk post operations", async () => {
      // Given: Multiple posts generated using TestDataHelpers
      const postCount = 10;
      const mockPosts = TestDataHelpers.createArray(postCount, (index) => ({
        ...PostFixtures.valid.basic,
        id: TestDataHelpers.generateId("post"),
        title: `Post ${index + 1} - ${TestDataHelpers.generateId("title")}`,
        body: `Content for post ${index + 1}`,
        createdAt: TestDataHelpers.generateTimestamp(-index * 3600000),
        updatedAt: TestDataHelpers.generateTimestamp(-index * 1800000),
      }));

      mockPostRepository.getAll.mockResolvedValue(mockPosts);

      // When: Get all posts
      const result = await postService.getAllPosts({
        limit: 20,
        skip: 0,
      });

      // Then: Should return all generated posts
      expect(result.data).toHaveLength(postCount);
      expect(result.data).toEqual(PostMapper.toDtoList(mockPosts));
      expect(result.pagination.total).toBe(postCount);
    });

    it("should verify complex mock interactions using MockHelpers", async () => {
      // Given: Post service with multiple mock repositories
      const postId = TestDataHelpers.generateId("post");
      const mockPost = PostFixtures.valid.basic;
      const mockComments = CommentFixtures.multiple;

      mockPostRepository.getById.mockResolvedValue(mockPost);
      mockCommentRepository.getByPostId.mockResolvedValue(mockComments);

      // When: Perform multiple operations
      await postService.getPostById({
        id: postId });
      await postService.getPostById({
        id: postId });

      // Then: Verify mock state using MockHelpers
      MockHelpers.verifyMockState(
        mockPostRepository as unknown as Record<string, unknown>,
        {
          getById: 2,
        }
      );
      MockHelpers.verifyMockState(
        mockCommentRepository as unknown as Record<string, unknown>,
        {
          getByPostId: 2,
        }
      );
    });

    it("should handle concurrent post operations", async () => {
      // Given: Multiple concurrent post operations
      const postIds = TestDataHelpers.createArray(5, (index) =>
        TestDataHelpers.generateId(`post-${index}`)
      );
      const mockPostsWithComments = postIds.map((postId) => ({
        post: {
          ...PostFixtures.valid.basic,
          id: postId,
          title: `Post ${postId}`,
        },
        comments: TestDataHelpers.createArray(3, (index) => ({
          ...CommentFixtures.valid.basic,
          id: TestDataHelpers.generateId("comment"),
          postId,
          body: `Comment ${index + 1} for ${postId}`,
        })),
      }));

      // Setup mocks for each post
      postIds.forEach((postId, index) => {
        mockPostRepository.getById.mockImplementationOnce(() =>
          AsyncTestHelpers.wrapPromise(mockPostsWithComments[index].post, 30)
        );
        mockCommentRepository.getByPostId.mockImplementationOnce(() =>
          AsyncTestHelpers.wrapPromise(
            mockPostsWithComments[index].comments,
            20
          )
        );
      });

      // When: Execute concurrent operations
      const promises = postIds.map((postId) => postService.getPostById({
        id: postId }));
      const results = await Promise.all(promises);

      // Then: Should handle all concurrent operations correctly
      expect(results).toHaveLength(5);
      results.forEach((result, index) => {
        expect(result.id).toBe(postIds[index]);
        expect(result.comments).toHaveLength(3);
      });
    });

    it("should handle error scenarios with proper error wrapping", async () => {
      // Given: Repository that throws delayed errors
      const postId = TestDataHelpers.generateId("post");
      const networkError = new Error("Network connection failed");
      const delayedError = AsyncTestHelpers.wrapError(networkError, 100);

      mockPostRepository.getById.mockImplementation(() => delayedError);

      // When: Get post by ID
      // Then: Should handle delayed error and wrap it properly
      await expect(postService.getPostById({
        id: postId })).rejects.toThrow(BaseError);
    });
  });
});
