import { QueryWrapper } from "@/shared/libs/__tests__";
import { BaseError } from "@/shared/libs/errors";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createUseUserProfile } from "../../hooks/useUserProfile";
import { mockUserProfileData } from "../fixtures";

/**
 * useUserProfile Hook Tests
 * Verify React Query hook functionality using Given-When-Then pattern
 */
describe("useUserProfile Hook", () => {
  let mockUserUseCase: {
    getUserProfile: ReturnType<typeof vi.fn>;
    getCurrentUserProfile: ReturnType<typeof vi.fn>;
  };
  let useUserProfile: ReturnType<typeof createUseUserProfile>;

  beforeEach(() => {
    // Given: Set up mock use case and test data
    mockUserUseCase = {
      getUserProfile: vi.fn(),
      getCurrentUserProfile: vi.fn(),
    };

    useUserProfile = createUseUserProfile(mockUserUseCase);
  });

  describe("Success Cases", () => {
    it("should successfully fetch user profile information", async () => {
      // Given: Valid user profile data from use case
      mockUserUseCase.getUserProfile.mockResolvedValue(mockUserProfileData);

      // When: Hook is called with userId to fetch user profile
      const { result } = renderHook(
        () => useUserProfile(mockUserProfileData.id),
        { wrapper: QueryWrapper }
      );

      // Then: User profile should be fetched successfully
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockUserProfileData);
      expect(mockUserUseCase.getUserProfile).toHaveBeenCalledWith({
        userId: mockUserProfileData.id,
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle BaseError correctly", async () => {
      // Given: BaseError from use case
      const baseError = new BaseError("User not found", "NOT_FOUND");
      mockUserUseCase.getUserProfile.mockRejectedValue(baseError);

      // When: Hook is called with userId and use case throws BaseError
      const { result } = renderHook(
        () => useUserProfile(mockUserProfileData.id),
        { wrapper: QueryWrapper }
      );

      // Then: BaseError should be propagated correctly
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(baseError);
    });

    it("should wrap generic errors in BaseError", async () => {
      // Given: Generic error from use case
      const unknownError = new Error("Network error");
      mockUserUseCase.getUserProfile.mockRejectedValue(unknownError);

      // When: Hook is called with userId and use case throws generic error
      const { result } = renderHook(
        () => useUserProfile(mockUserProfileData.id),
        { wrapper: QueryWrapper }
      );

      // Then: Generic error should be wrapped in BaseError
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(BaseError);
      expect(result.current.error?.message).toBe(
        "Failed to fetch user profile"
      );
    });
  });

  describe("Loading State", () => {
    it("should manage initial loading state correctly", async () => {
      // Given: Delayed response from use case
      mockUserUseCase.getUserProfile.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockUserProfileData), 100)
          )
      );

      // When: Hook is called with userId and delayed response
      const { result } = renderHook(
        () => useUserProfile(mockUserProfileData.id),
        { wrapper: QueryWrapper }
      );

      // Then: Loading state should be managed correctly
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });
});
