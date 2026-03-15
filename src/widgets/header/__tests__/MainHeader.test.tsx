/* eslint-disable @next/next/no-img-element */
import { FullWrapper } from "@/shared/libs/__tests__";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MainHeader } from "../main-header";

// Mock the useCurrentUserProfile hook
const mockUseCurrentUserProfile = vi.fn();
vi.mock("@/features/user", () => ({
  useCurrentUserProfile: () => mockUseCurrentUserProfile(),
}));

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
 * MainHeader Widget Tests
 * Verify core MainHeader functionality using Given-When-Then pattern
 */
describe("MainHeader Widget", () => {
  const mockUserProfile = {
    id: "user-123",
    username: "testuser",
    email: "test@example.com",
    profileImage: "https://example.com/profile.jpg",
    age: 25,
  };

  beforeEach(() => {
    // Given: Reset all mocks before each test
    vi.clearAllMocks();
  });

  describe("Core Functionality", () => {
    it("should render MainHeader with all essential elements when user is authenticated", () => {
      // Given: User profile data is available
      mockUseCurrentUserProfile.mockReturnValue({
        data: mockUserProfile,
        isLoading: false,
        error: null,
      });

      // When: Render MainHeader component
      render(
        <FullWrapper>
          <MainHeader />
        </FullWrapper>
      );

      // Then: All essential elements should be rendered
      expect(screen.getByText("MomentHub")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
      expect(screen.getAllByRole("button")).toHaveLength(2); // Message and notification buttons
      expect(screen.getByRole("img", { name: /profile/i })).toBeInTheDocument();
    });

    it("should display user profile image correctly when user has profile image", () => {
      // Given: User profile with profile image
      mockUseCurrentUserProfile.mockReturnValue({
        data: mockUserProfile,
        isLoading: false,
        error: null,
      });

      // When: Render MainHeader component
      render(
        <FullWrapper>
          <MainHeader />
        </FullWrapper>
      );

      // Then: User avatar should display correct profile image
      const userAvatar = screen.getByRole("img", { name: /profile/i });
      expect(userAvatar).toHaveAttribute("src", mockUserProfile.profileImage);
    });
  });

  describe("Authentication States", () => {
    it("should not render when user is not authenticated", () => {
      // Given: User profile data is not available
      mockUseCurrentUserProfile.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      // When: Render MainHeader component
      const { container } = render(
        <FullWrapper>
          <MainHeader />
        </FullWrapper>
      );

      // Then: MainHeader should not render any content
      expect(container.firstChild).toBeNull();
    });

    it("should not render during loading state", () => {
      // Given: User profile is loading
      mockUseCurrentUserProfile.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      // When: Render MainHeader component
      const { container } = render(
        <FullWrapper>
          <MainHeader />
        </FullWrapper>
      );

      // Then: MainHeader should not render during loading
      expect(container.firstChild).toBeNull();
    });

    it("should not render when there is an error", () => {
      // Given: User profile has error
      mockUseCurrentUserProfile.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error("Failed to fetch user profile"),
      });

      // When: Render MainHeader component
      const { container } = render(
        <FullWrapper>
          <MainHeader />
        </FullWrapper>
      );

      // Then: MainHeader should not render when error occurs
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Edge Cases", () => {
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

      // When: Render MainHeader component
      render(
        <FullWrapper>
          <MainHeader />
        </FullWrapper>
      );

      // Then: Component should render essential elements without errors
      expect(screen.getByText("MomentHub")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
    });

    it("should handle different user profile data variations", () => {
      // Given: Various user profile scenarios
      const userVariations = [
        { ...mockUserProfile, username: "shortname" },
        { ...mockUserProfile, username: "verylongusernamethatmightoverflow" },
        { ...mockUserProfile, profileImage: "" },
      ];

      userVariations.forEach((user) => {
        mockUseCurrentUserProfile.mockReturnValue({
          data: user,
          isLoading: false,
          error: null,
        });

        const { unmount } = render(
          <FullWrapper>
            <MainHeader />
          </FullWrapper>
        );

        // Then: Component should render successfully for all variations
        expect(screen.getByText("MomentHub")).toBeInTheDocument();

        unmount();
      });
    });
  });

  describe("Hook Integration", () => {
    it("should call useUserProfile hook when component mounts", () => {
      // Given: User profile data is available
      mockUseCurrentUserProfile.mockReturnValue({
        data: mockUserProfile,
        isLoading: false,
        error: null,
      });

      // When: Render MainHeader component
      render(
        <FullWrapper>
          <MainHeader />
        </FullWrapper>
      );

      // Then: useUserProfile hook should be called
      expect(mockUseCurrentUserProfile).toHaveBeenCalledTimes(1);
    });
  });
});
