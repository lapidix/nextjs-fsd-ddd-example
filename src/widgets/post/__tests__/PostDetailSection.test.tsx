/* eslint-disable @next/next/no-img-element */
import type { CommentDto } from "@/entities/comment";
import type { UserDto } from "@/entities/user";
import { mockPostDetailData } from "@/features/post/__tests__";
import { FullWrapper } from "@/shared/libs/__tests__";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PostDetailSection } from "../post-detail-section";

// Mock the hooks
const mockUseCurrentUserProfile = vi.fn();
const mockUseGetPostById = vi.fn();

vi.mock("@/features/user", () => ({
  useCurrentUserProfile: () => mockUseCurrentUserProfile(),
}));

vi.mock("@/features/post", () => ({
  useGetPostById: (postId: string) => mockUseGetPostById(postId),
}));

// Mock the components
vi.mock("@/entities/user", () => ({
  UserIdentifier: ({ user }: { user: UserDto }) => (
    <div data-testid="user-identifier">
      <span>{user.username}</span>
      <img src={user.profileImage} alt={`${user.username} profile`} />
    </div>
  ),
}));

vi.mock("@/features/comment", () => ({
  CommentForm: ({ userProfileImage }: { userProfileImage: string }) => (
    <div data-testid="comment-form">
      <img src={userProfileImage} alt="User profile for comment" />
      <textarea placeholder="Write a comment..." />
    </div>
  ),
  CommentView: ({ comment }: { comment: CommentDto }) => (
    <div data-testid={`comment-${comment.id}`}>
      <span>{comment.user.username}</span>
      <p>{comment.body}</p>
      <span>Likes: {comment.likes}</span>
    </div>
  ),
}));

vi.mock("@/shared/libs/date", () => ({
  formatDate: (timestamp: number) => new Date(timestamp).toLocaleDateString(),
}));

vi.mock("@/shared/ui", () => ({
  CommentIcon: ({ className }: { className?: string }) => (
    <svg className={className} data-testid="comment-icon" />
  ),
  Divider: () => <hr data-testid="divider" />,
  LikeIcon: ({ className }: { className?: string }) => (
    <svg className={className} data-testid="like-icon" />
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
 * PostDetailSection Widget Tests
 * Verify core PostDetailSection functionality using Given-When-Then pattern
 */
describe("PostDetailSection Widget", () => {
  const mockUserProfile = {
    id: "user-123",
    username: "testuser",
    email: "test@example.com",
    profileImage: "https://example.com/profile.jpg",
    age: 25,
  };

  const testPostId = "post-1";

  beforeEach(() => {
    // Given: Reset all mocks before each test
    vi.clearAllMocks();
  });

  describe("Core Functionality", () => {
    it("should render PostDetailSection with all essential elements when data is available", () => {
      // Given: User profile and post data are available
      mockUseCurrentUserProfile.mockReturnValue({
        data: mockUserProfile,
        isLoading: false,
        error: null,
      });

      mockUseGetPostById.mockReturnValue({
        data: mockPostDetailData,
        isLoading: false,
        error: null,
      });

      // When: Render PostDetailSection component
      render(
        <FullWrapper>
          <PostDetailSection postId={testPostId} />
        </FullWrapper>
      );

      // Then: All essential elements should be rendered
      expect(screen.getByTestId("user-identifier")).toBeInTheDocument();
      expect(
        screen.getByRole("img", {
          name: `Post by ${mockPostDetailData.user.username}`,
        })
      ).toBeInTheDocument();
      expect(screen.getByText(mockPostDetailData.body)).toBeInTheDocument();
      expect(
        screen.getByText(mockPostDetailData.likes.toLocaleString())
      ).toBeInTheDocument();
      expect(
        screen.getByText(`${mockPostDetailData.comments.length} Comments`)
      ).toBeInTheDocument();
      expect(screen.getByTestId("comment-form")).toBeInTheDocument();
    });

    it("should display post image with correct attributes when post data is available", () => {
      // Given: User profile and post data are available
      mockUseCurrentUserProfile.mockReturnValue({
        data: mockUserProfile,
        isLoading: false,
        error: null,
      });

      mockUseGetPostById.mockReturnValue({
        data: mockPostDetailData,
        isLoading: false,
        error: null,
      });

      // When: Render PostDetailSection component
      render(
        <FullWrapper>
          <PostDetailSection postId={testPostId} />
        </FullWrapper>
      );

      // Then: Post image should have correct attributes
      const postImage = screen.getByRole("img", {
        name: `Post by ${mockPostDetailData.user.username}`,
      });
      expect(postImage).toHaveAttribute("src", mockPostDetailData.image);
      expect(postImage).toHaveAttribute(
        "alt",
        `Post by ${mockPostDetailData.user.username}`
      );
    });

    it("should render all comments when post has multiple comments", () => {
      // Given: User profile and post data with multiple comments are available
      mockUseCurrentUserProfile.mockReturnValue({
        data: mockUserProfile,
        isLoading: false,
        error: null,
      });

      mockUseGetPostById.mockReturnValue({
        data: mockPostDetailData,
        isLoading: false,
        error: null,
      });

      // When: Render PostDetailSection component
      render(
        <FullWrapper>
          <PostDetailSection postId={testPostId} />
        </FullWrapper>
      );

      // Then: All comments should be rendered
      mockPostDetailData.comments.forEach((comment) => {
        expect(screen.getByTestId(`comment-${comment.id}`)).toBeInTheDocument();
        expect(screen.getByText(comment.user.username)).toBeInTheDocument();
        expect(screen.getByText(comment.body)).toBeInTheDocument();
      });
    });
  });

  describe("Authentication States", () => {
    it("should not render when user profile is not available", () => {
      // Given: User profile is not available
      mockUseCurrentUserProfile.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      mockUseGetPostById.mockReturnValue({
        data: mockPostDetailData,
        isLoading: false,
        error: null,
      });

      // When: Render PostDetailSection component
      const { container } = render(
        <FullWrapper>
          <PostDetailSection postId={testPostId} />
        </FullWrapper>
      );

      // Then: Component should not render any content
      expect(container.firstChild).toBeNull();
    });

    it("should not render when post data is not available", () => {
      // Given: Post data is not available
      mockUseCurrentUserProfile.mockReturnValue({
        data: mockUserProfile,
        isLoading: false,
        error: null,
      });

      mockUseGetPostById.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      // When: Render PostDetailSection component
      const { container } = render(
        <FullWrapper>
          <PostDetailSection postId={testPostId} />
        </FullWrapper>
      );

      // Then: Component should not render any content
      expect(container.firstChild).toBeNull();
    });

    it("should not render during loading states", () => {
      // Given: Data is loading
      mockUseCurrentUserProfile.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      mockUseGetPostById.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      // When: Render PostDetailSection component
      const { container } = render(
        <FullWrapper>
          <PostDetailSection postId={testPostId} />
        </FullWrapper>
      );

      // Then: Component should not render during loading
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Hook Integration", () => {
    it("should call useGetPostById hook with correct postId when component is mounted", () => {
      // Given: User profile and post data are available
      mockUseCurrentUserProfile.mockReturnValue({
        data: mockUserProfile,
        isLoading: false,
        error: null,
      });

      mockUseGetPostById.mockReturnValue({
        data: mockPostDetailData,
        isLoading: false,
        error: null,
      });

      // When: Render PostDetailSection component
      render(
        <FullWrapper>
          <PostDetailSection postId={testPostId} />
        </FullWrapper>
      );

      // Then: useGetPostById hook should be called with correct postId
      expect(mockUseGetPostById).toHaveBeenCalledWith(testPostId);
    });

    it("should call useGetPostById with different postId when postId prop changes", () => {
      // Given: Initial render with first postId
      mockUseCurrentUserProfile.mockReturnValue({
        data: mockUserProfile,
        isLoading: false,
        error: null,
      });

      mockUseGetPostById.mockReturnValue({
        data: mockPostDetailData,
        isLoading: false,
        error: null,
      });

      const { rerender } = render(
        <FullWrapper>
          <PostDetailSection postId="post-1" />
        </FullWrapper>
      );

      expect(mockUseGetPostById).toHaveBeenCalledWith("post-1");

      // When: Re-render with different postId
      rerender(
        <FullWrapper>
          <PostDetailSection postId="post-2" />
        </FullWrapper>
      );

      // Then: useGetPostById should be called with new postId
      expect(mockUseGetPostById).toHaveBeenCalledWith("post-2");
    });
  });

  describe("Edge Cases", () => {
    it("should handle post with empty body when post content is missing", () => {
      // Given: Post data with empty body
      const emptyBodyPost = {
        ...mockPostDetailData,
        body: "",
      };

      mockUseCurrentUserProfile.mockReturnValue({
        data: mockUserProfile,
        isLoading: false,
        error: null,
      });

      mockUseGetPostById.mockReturnValue({
        data: emptyBodyPost,
        isLoading: false,
        error: null,
      });

      // When: Render PostDetailSection component
      render(
        <FullWrapper>
          <PostDetailSection postId={testPostId} />
        </FullWrapper>
      );

      // Then: Component should render other elements without errors
      expect(screen.getByTestId("user-identifier")).toBeInTheDocument();
      expect(screen.getByTestId("comment-form")).toBeInTheDocument();
    });

    it("should handle zero engagement correctly when post has no likes or comments", () => {
      // Given: Post data with zero engagement
      const zeroEngagementPost = {
        ...mockPostDetailData,
        likes: 0,
        comments: [],
      };

      mockUseCurrentUserProfile.mockReturnValue({
        data: mockUserProfile,
        isLoading: false,
        error: null,
      });

      mockUseGetPostById.mockReturnValue({
        data: zeroEngagementPost,
        isLoading: false,
        error: null,
      });

      // When: Render PostDetailSection component
      render(
        <FullWrapper>
          <PostDetailSection postId={testPostId} />
        </FullWrapper>
      );

      // Then: Zero values should be displayed correctly
      const likesCount = screen.getByTestId("post-detail-likes-count");
      const commentsCount = screen.getByTestId("post-detail-comments-count");
      const commentsHeader = screen.getByTestId("comments-header");

      expect(likesCount).toHaveTextContent("0");
      expect(commentsCount).toHaveTextContent("0");
      expect(commentsHeader).toHaveTextContent("0 Comments");
    });

    it("should handle user profile with missing profile image", () => {
      // Given: User profile without profile image
      const userWithoutImage = {
        ...mockUserProfile,
        profileImage: "",
      };

      mockUseCurrentUserProfile.mockReturnValue({
        data: userWithoutImage,
        isLoading: false,
        error: null,
      });

      mockUseGetPostById.mockReturnValue({
        data: mockPostDetailData,
        isLoading: false,
        error: null,
      });

      // When: Render PostDetailSection component
      render(
        <FullWrapper>
          <PostDetailSection postId={testPostId} />
        </FullWrapper>
      );

      // Then: Component should render without errors
      expect(screen.getByTestId("user-identifier")).toBeInTheDocument();
      expect(screen.getByTestId("comment-form")).toBeInTheDocument();
    });
  });
});
