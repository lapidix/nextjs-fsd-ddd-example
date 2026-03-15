/* eslint-disable @next/next/no-img-element */
import type { PostDto } from "@/entities/post";
import { FullWrapper } from "@/shared/libs/__tests__";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockPostsData } from "@/features/post/__tests__";
import { PostListSection } from "../post-list-section";

// Mock the useGetPosts hook
const mockUseGetPosts = vi.fn();

vi.mock("@/features/post", () => ({
  useGetPosts: () => mockUseGetPosts(),
  PostCard: ({ post }: { post: PostDto }) => (
    <div data-testid={`post-card-${post.id}`} data-post-id={post.id}>
      <h3>{post.title}</h3>
      <p>{post.body}</p>
      <span>Likes: {post.likes}</span>
      <span>Comments: {post.totalComments}</span>
    </div>
  ),
}));

// Mock Next.js Image component with minimal typing for tests
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => <img src={src} alt={alt} {...props} />,
}));

/**
 * PostListSection Widget Tests
 * Verify core PostListSection widget functionality using Given-When-Then pattern
 */
describe("PostListSection Widget", () => {
  beforeEach(() => {
    // Given: Reset all mocks before each test
    vi.clearAllMocks();
  });

  describe("Core Functionality", () => {
    it("should render all posts when posts data is available", () => {
      // Given: Posts data is available from hook
      mockUseGetPosts.mockReturnValue({
        data: mockPostsData,
        isLoading: false,
        error: null,
      });

      // When: Render PostListSection component
      render(
        <FullWrapper>
          <PostListSection />
        </FullWrapper>
      );

      // Then: All posts should be rendered
      const postCards = screen.getAllByTestId(/post-card-/);
      expect(postCards).toHaveLength(mockPostsData.data.length);

      // Verify each post content is displayed
      mockPostsData.data.forEach((post) => {
        expect(screen.getByText(post.title)).toBeInTheDocument();
        expect(screen.getByText(post.body)).toBeInTheDocument();
        expect(screen.getByText(`Likes: ${post.likes}`)).toBeInTheDocument();
        expect(
          screen.getByText(`Comments: ${post.totalComments}`)
        ).toBeInTheDocument();
      });
    });

    it("should render posts in correct order", () => {
      // Given: Posts data is available from hook
      mockUseGetPosts.mockReturnValue({
        data: mockPostsData,
        isLoading: false,
        error: null,
      });

      // When: Render PostListSection component
      render(
        <FullWrapper>
          <PostListSection />
        </FullWrapper>
      );

      // Then: Posts should be rendered in the same order as data
      const postCards = screen.getAllByTestId(/post-card-/);
      postCards.forEach((card, index) => {
        const expectedPostId = mockPostsData.data[index].id;
        expect(card).toHaveAttribute("data-post-id", expectedPostId);
      });
    });

    it("should render empty grid when posts array is empty", () => {
      // Given: Empty posts data
      const emptyPostsData = {
        data: [],
        pagination: {
          limit: 10,
          skip: 0,
          total: 0,
        },
      };

      mockUseGetPosts.mockReturnValue({
        data: emptyPostsData,
        isLoading: false,
        error: null,
      });

      // When: Render PostListSection component
      render(
        <FullWrapper>
          <PostListSection />
        </FullWrapper>
      );

      // Then: No post cards should be rendered
      const postCards = screen.queryAllByTestId(/post-card-/);
      expect(postCards).toHaveLength(0);
    });
  });

  describe("Loading and Error States", () => {
    it("should not render when posts data is null", () => {
      // Given: Posts data is null
      mockUseGetPosts.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      // When: Render PostListSection component
      const { container } = render(
        <FullWrapper>
          <PostListSection />
        </FullWrapper>
      );

      // Then: Component should not render any content
      expect(container.firstChild).toBeNull();
    });

    it("should not render when posts data is loading", () => {
      // Given: Posts data is in loading state
      mockUseGetPosts.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      // When: Render PostListSection component
      const { container } = render(
        <FullWrapper>
          <PostListSection />
        </FullWrapper>
      );

      // Then: Component should not render any content during loading
      expect(container.firstChild).toBeNull();
    });

    it("should not render when posts data has error", () => {
      // Given: Posts data has error state
      mockUseGetPosts.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error("Failed to fetch posts"),
      });

      // When: Render PostListSection component
      const { container } = render(
        <FullWrapper>
          <PostListSection />
        </FullWrapper>
      );

      // Then: Component should not render any content when error occurs
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Hook Integration", () => {
    it("should call useGetPosts hook when component is mounted", () => {
      // Given: Posts data is available
      mockUseGetPosts.mockReturnValue({
        data: mockPostsData,
        isLoading: false,
        error: null,
      });

      // When: Render PostListSection component
      render(
        <FullWrapper>
          <PostListSection />
        </FullWrapper>
      );

      // Then: useGetPosts hook should be called
      expect(mockUseGetPosts).toHaveBeenCalledTimes(1);
    });

    it("should re-render when hook data changes", () => {
      // Given: Initial posts data
      mockUseGetPosts.mockReturnValue({
        data: mockPostsData,
        isLoading: false,
        error: null,
      });

      const { rerender } = render(
        <FullWrapper>
          <PostListSection />
        </FullWrapper>
      );

      const initialPostCards = screen.getAllByTestId(/post-card-/);
      expect(initialPostCards).toHaveLength(mockPostsData.data.length);

      // When: Hook data changes to single post
      const updatedPostsData = {
        ...mockPostsData,
        data: [mockPostsData.data[0]],
      };

      mockUseGetPosts.mockReturnValue({
        data: updatedPostsData,
        isLoading: false,
        error: null,
      });

      rerender(
        <FullWrapper>
          <PostListSection />
        </FullWrapper>
      );

      // Then: Component should re-render with updated data
      const updatedPostCards = screen.getAllByTestId(/post-card-/);
      expect(updatedPostCards).toHaveLength(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle posts with empty content", () => {
      // Given: Posts with empty content
      const emptyContentPostsData = {
        data: [
          {
            ...mockPostsData.data[0],
            title: "",
            body: "",
            likes: 0,
            totalComments: 0,
          },
        ],
        pagination: {
          limit: 10,
          skip: 0,
          total: 1,
        },
      };

      mockUseGetPosts.mockReturnValue({
        data: emptyContentPostsData,
        isLoading: false,
        error: null,
      });

      // When: Render PostListSection component
      render(
        <FullWrapper>
          <PostListSection />
        </FullWrapper>
      );

      // Then: Component should handle empty content gracefully
      const postCards = screen.getAllByTestId(/post-card-/);
      expect(postCards).toHaveLength(1);
      expect(screen.getByText("Likes: 0")).toBeInTheDocument();
      expect(screen.getByText("Comments: 0")).toBeInTheDocument();
    });

    it("should handle single post data", () => {
      // Given: Single post data
      const singlePostData = {
        data: [mockPostsData.data[0]],
        pagination: {
          limit: 10,
          skip: 0,
          total: 1,
        },
      };

      mockUseGetPosts.mockReturnValue({
        data: singlePostData,
        isLoading: false,
        error: null,
      });

      // When: Render PostListSection component
      render(
        <FullWrapper>
          <PostListSection />
        </FullWrapper>
      );

      // Then: Single post should be rendered
      const postCards = screen.getAllByTestId(/post-card-/);
      expect(postCards).toHaveLength(1);
      expect(postCards[0]).toHaveAttribute(
        "data-post-id",
        singlePostData.data[0].id
      );
    });
  });

  describe("Accessibility", () => {
    it("should render posts with proper semantic structure", () => {
      // Given: Posts data is available
      mockUseGetPosts.mockReturnValue({
        data: mockPostsData,
        isLoading: false,
        error: null,
      });

      // When: Render PostListSection component
      render(
        <FullWrapper>
          <PostListSection />
        </FullWrapper>
      );

      // Then: Each post should have proper heading structure
      mockPostsData.data.forEach((post) => {
        const postTitle = screen.getByRole("heading", { name: post.title });
        expect(postTitle).toBeInTheDocument();
      });
    });
  });
});
