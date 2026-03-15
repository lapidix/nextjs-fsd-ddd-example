import { CommentMapper, CommentRepository } from "@/entities/comment";
import { PostFactory, PostMapper, PostRepository } from "@/entities/post";
import { UserRepository } from "@/entities/user";
import { BaseError } from "@/shared/libs/errors";
import type {
  AddPostCommand,
  DeletePostCommand,
  LikePostCommand,
  UnlikePostCommand,
  UpdatePostCommand,
} from "../commands";
import type { GetPostByIdQuery, GetPostsQuery } from "../queries";
import type { PostDetailResult, PostListResult, PostResult } from "../results";
import type { PostUseCase } from "../usecase/post.usecase";

export const PostService = (
  postRepository: PostRepository,
  commentRepository: CommentRepository,
  userRepository: UserRepository
): PostUseCase => ({
  getAllPosts: async (query: GetPostsQuery = {}): Promise<PostListResult> => {
    const q = query ?? {};
    const limit = q.limit ?? 10;
    const skip = q.skip ?? 0;
    try {
      const posts = await postRepository.getAll(limit, skip);
      return {
        data: PostMapper.toDtoList(posts),
        pagination: {
          limit,
          skip,
          total: posts.length,
        },
      };
    } catch (error) {
      console.error("Error fetching post list:", error);
      if (error instanceof BaseError) {
        throw error;
      }
      throw new BaseError(`Failed to fetch post list`, "FetchError");
    }
  },

  searchPosts: async (query: GetPostsQuery): Promise<PostListResult> => {
    const limit = query.limit ?? 10;
    const skip = query.skip ?? 0;
    const searchQuery = query.query;
    try {
      const posts = await postRepository.search(searchQuery ?? "");
      return {
        data: PostMapper.toDtoList(posts),
        pagination: {
          limit,
          skip,
          total: posts.length,
        },
      };
    } catch (error) {
      console.error(`Error searching posts with query ${searchQuery}:`, error);
      if (error instanceof BaseError) {
        throw error;
      }
      throw new BaseError(
        `Failed to search posts with query "${searchQuery}"`,
        "SearchError"
      );
    }
  },

  getPostById: async (query: GetPostByIdQuery): Promise<PostDetailResult> => {
    const { id } = query;
    try {
      const post = await postRepository.getById(id);

      if (!post) {
        throw BaseError.notFound("Post", id);
      }
      const comments = await commentRepository.getByPostId(id);

      return {
        ...PostMapper.toDto(post),
        comments: CommentMapper.toDtoList(comments),
      };
    } catch (error) {
      console.error(`Error fetching post with ID ${id}:`, error);
      if (error instanceof BaseError) {
        throw error;
      }
      throw BaseError.notFound("Post", id);
    }
  },

  addPost: async (command: AddPostCommand): Promise<PostResult> => {
    const { title, body, userId, image } = command;
    try {
      const user = await userRepository.getUserProfile(userId);
      if (!user) {
        throw BaseError.notFound("User", userId);
      }

      const newPost = PostFactory.createNew(
        title,
        body,
        {
          id: userId,
          username: user.username,
          profileImage: user.profileImage || "",
        },
        image
      );
      const createdPost = await postRepository.create(newPost);

      if (!createdPost) {
        throw BaseError.createFailed("Post");
      }

      return PostMapper.toDto(createdPost);
    } catch (error) {
      console.error(`Error creating new post with title "${title}":`, error);
      if (error instanceof BaseError) {
        throw error;
      }
      throw BaseError.createFailed("Post");
    }
  },

  updatePost: async (command: UpdatePostCommand): Promise<PostResult> => {
    const { id, title, body } = command;
    try {
      const existingPost = await postRepository.getById(id);
      if (!existingPost) {
        throw BaseError.notFound("Post", id);
      }

      existingPost.updateTitle(title);
      existingPost.updateBody(body);

      const updatedPost = await postRepository.update(existingPost);
      if (!updatedPost) {
        throw BaseError.updateFailed("Post", id);
      }

      return PostMapper.toDto(updatedPost);
    } catch (error) {
      console.error(`Error updating post with ID ${id}:`, error);
      if (error instanceof BaseError) {
        throw error;
      }
      throw BaseError.updateFailed("Post", id);
    }
  },

  deletePost: async (command: DeletePostCommand): Promise<boolean> => {
    const { id } = command;
    try {
      const existingPost = await postRepository.getById(id);
      if (!existingPost) {
        throw BaseError.notFound("Post", id);
      }

      return await postRepository.delete(id);
    } catch (error) {
      console.error(`Error deleting post with ID ${id}:`, error);
      if (error instanceof BaseError) {
        throw error;
      }
      throw BaseError.deleteFailed("Post", id);
    }
  },

  likePost: async (command: LikePostCommand): Promise<boolean> => {
    const { id, userId } = command;
    try {
      const existingPost = await postRepository.getById(id);
      if (!existingPost) {
        throw BaseError.notFound("Post", id);
      }

      const user = await userRepository.getUserProfile(userId);
      if (!user) {
        throw BaseError.notFound("User", userId);
      }

      return await postRepository.like(id, userId);
    } catch (error) {
      console.error(
        `Error liking post with ID ${id} by user ${userId}:`,
        error
      );
      if (error instanceof BaseError) {
        throw error;
      }
      throw BaseError.updateFailed("Post", id);
    }
  },

  unlikePost: async (command: UnlikePostCommand): Promise<boolean> => {
    const { id, userId } = command;
    try {
      const existingPost = await postRepository.getById(id);
      if (!existingPost) {
        throw BaseError.notFound("Post", id);
      }

      const user = await userRepository.getUserProfile(userId);
      if (!user) {
        throw BaseError.notFound("User", userId);
      }

      return await postRepository.unlike(id, userId);
    } catch (error) {
      console.error(
        `Error unliking post with ID ${id} by user ${userId}:`,
        error
      );
      if (error instanceof BaseError) {
        throw error;
      }
      throw BaseError.updateFailed("Post", id);
    }
  },
});
