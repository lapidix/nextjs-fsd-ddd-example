/**
 * Post Hook Test Fixtures
 * Mock data for post-related hook tests
 */

import { CommentDto } from "@/entities/comment";
import { PostDto } from "@/entities/post";
import { PostDetailResult, PostListResult } from "../../results";

export const mockComments: CommentDto[] = [
  {
    id: "comment-1",
    postId: "post-1",
    user: {
      id: "user-2",
      username: "commenter",
      profileImage: "https://example.com/commenter.jpg",
    },
    body: "Test comment",
    likes: 3,
    createdAt: 1640995300000,
    updatedAt: 1640995300000,
  },
  {
    id: "comment-2",
    postId: "post-1",
    user: {
      id: "user-3",
      username: "another_user",
      profileImage: "https://example.com/another.jpg",
    },
    body: "Another test comment",
    likes: 1,
    createdAt: 1640995400000,
    updatedAt: 1640995400000,
  },
];

export const mockPostDetailData: PostDetailResult = {
  id: "post-1",
  title: "Test Post",
  body: "This is a test post",
  user: {
    id: "user-1",
    username: "testuser",
    profileImage: "https://example.com/avatar.jpg",
  },
  image: "https://example.com/post-image.jpg",
  likes: 10,
  totalComments: 2,
  createdAt: 1640995200000,
  updatedAt: 1640995200000,
  comments: mockComments,
};

export const mockPostsArray: PostDto[] = [
  {
    id: "post-1",
    title: "First Test Post",
    body: "This is the first test post",
    user: {
      id: "user-1",
      username: "testuser",
      profileImage: "https://example.com/avatar.jpg",
    },
    image: "https://example.com/post-1.jpg",
    likes: 10,
    totalComments: 2,
    createdAt: 1640995200000,
    updatedAt: 1640995200000,
  },
  {
    id: "post-2",
    title: "Second Test Post",
    body: "This is the second test post",
    user: {
      id: "user-2",
      username: "anotheruser",
      profileImage: "https://example.com/avatar2.jpg",
    },
    image: "https://example.com/post-2.jpg",
    likes: 5,
    totalComments: 1,
    createdAt: 1640995300000,
    updatedAt: 1640995300000,
  },
];

export const mockPostsData: PostListResult = {
  data: mockPostsArray,
  pagination: {
    limit: 10,
    skip: 0,
    total: mockPostsArray.length,
  },
};
