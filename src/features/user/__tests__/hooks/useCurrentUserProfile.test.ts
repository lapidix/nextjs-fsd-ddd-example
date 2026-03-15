import { QueryWrapper } from "@/shared/libs/__tests__";
import { BaseError } from "@/shared/libs/errors";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createUseCurrentUserProfile } from "../../hooks/useCurrentUserProfile";
import { mockUserProfileData } from "../fixtures";

/**
 * useCurrentUserProfile Hook Tests
 * Verify React Query hook for current user profile using Given-When-Then pattern
 */
describe("useCurrentUserProfile Hook", () => {
  let mockUserUseCase: {
    getUserProfile: ReturnType<typeof vi.fn>;
    getCurrentUserProfile: ReturnType<typeof vi.fn>;
  };
  let useCurrentUserProfile: ReturnType<typeof createUseCurrentUserProfile>;

  beforeEach(() => {
    mockUserUseCase = {
      getUserProfile: vi.fn(),
      getCurrentUserProfile: vi.fn(),
    };
    useCurrentUserProfile = createUseCurrentUserProfile(mockUserUseCase);
  });

  describe("Success Cases", () => {
    it("should successfully fetch current user profile", async () => {
      mockUserUseCase.getCurrentUserProfile.mockResolvedValue(
        mockUserProfileData
      );

      const { result } = renderHook(() => useCurrentUserProfile(), {
        wrapper: QueryWrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockUserProfileData);
      expect(mockUserUseCase.getCurrentUserProfile).toHaveBeenCalledWith();
    });
  });

  describe("Error Handling", () => {
    it("should handle BaseError correctly", async () => {
      const baseError = new BaseError("Current user not found", "NOT_FOUND");
      mockUserUseCase.getCurrentUserProfile.mockRejectedValue(baseError);

      const { result } = renderHook(() => useCurrentUserProfile(), {
        wrapper: QueryWrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(baseError);
    });

    it("should wrap generic errors in BaseError", async () => {
      const unknownError = new Error("Network error");
      mockUserUseCase.getCurrentUserProfile.mockRejectedValue(unknownError);

      const { result } = renderHook(() => useCurrentUserProfile(), {
        wrapper: QueryWrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(BaseError);
      expect(result.current.error?.message).toBe(
        "Failed to fetch current user profile"
      );
    });
  });

  describe("Loading State", () => {
    it("should manage initial loading state correctly", async () => {
      mockUserUseCase.getCurrentUserProfile.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockUserProfileData), 100)
          )
      );

      const { result } = renderHook(() => useCurrentUserProfile(), {
        wrapper: QueryWrapper,
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });
});
