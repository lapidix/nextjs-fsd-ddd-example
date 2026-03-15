import { BaseHttpClient } from "@/shared/libs/http/base.http";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { User } from "../../core";
import { UserProfileDto } from "../../infrastructure/dto";
import { UserApiRepository } from "../../infrastructure/repository";

/**
 * User API Repository Tests
 * Verify all User API repository functionality using Given-When-Then pattern
 */
describe("User API Repository", () => {
  let userApiRepository: UserApiRepository;
  let mockApiClient: BaseHttpClient;

  beforeEach(() => {
    // Given: Set up mock API client and repository
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as BaseHttpClient;

    userApiRepository = new UserApiRepository(mockApiClient);
  });

  describe("getUserProfile", () => {
    it("should return User domain object when API call succeeds", async () => {
      // Given: Mock API client returns valid user profile data
      const validUserProfileDto: UserProfileDto = {
        id: "user-123",
        username: "testuser",
        profileImage: "https://example.com/avatar.jpg",
        age: 25,
        email: "test@example.com",
      };
      const mockResponse = {
        data: validUserProfileDto,
        status: 200,
        statusText: "OK",
        ok: true,
      };
      vi.mocked(mockApiClient.get).mockResolvedValue(mockResponse);

      // When: Get user profile by userId
      const result = await userApiRepository.getUserProfile(
        validUserProfileDto.id
      );

      // Then: Should return User domain object and call API with userId
      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(validUserProfileDto.id);
      expect(result.username).toBe(validUserProfileDto.username);
      expect(result.profileImage).toBe(validUserProfileDto.profileImage);
      expect(result.age).toBe(validUserProfileDto.age);
      expect(result.email).toBe(validUserProfileDto.email);
      expect(mockApiClient.get).toHaveBeenCalledWith(
        `/users/${validUserProfileDto.id}`
      );
    });

    it("should handle user profile with missing optional fields", async () => {
      // Given: Mock API client returns user profile with missing optional fields
      const incompleteProfileDto: UserProfileDto = {
        id: "user-incomplete",
        username: "incomplete_user",
        profileImage: "https://example.com/avatar.jpg",
        // age and email are missing
      };
      const mockResponse = {
        data: incompleteProfileDto,
        status: 200,
        statusText: "OK",
        ok: true,
      };
      vi.mocked(mockApiClient.get).mockResolvedValue(mockResponse);

      // When: Get user profile by userId
      const result = await userApiRepository.getUserProfile(
        incompleteProfileDto.id
      );

      // Then: Should return User with default values for missing fields
      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe("user-incomplete");
      expect(result.username).toBe("incomplete_user");
      expect(result.age).toBe(0); // Default value
      expect(result.email).toBe(""); // Default value
    });

    it("should handle user profile with null optional fields", async () => {
      // Given: Mock API client returns user profile with null optional fields
      const profileDtoWithNulls: UserProfileDto = {
        id: "user-nulls",
        username: "user_with_nulls",
        profileImage: "",
        age: null as unknown as number,
        email: null as unknown as string,
      };
      const mockResponse = {
        data: profileDtoWithNulls,
        status: 200,
        statusText: "OK",
        ok: true,
      };
      vi.mocked(mockApiClient.get).mockResolvedValue(mockResponse);

      // When: Get user profile by userId
      const result = await userApiRepository.getUserProfile(
        profileDtoWithNulls.id
      );

      // Then: Should return User with default values for null fields
      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe("user-nulls");
      expect(result.username).toBe("user_with_nulls");
      expect(result.age).toBe(0); // Default value for null
      expect(result.email).toBe(""); // Default value for null
    });

    it("should throw error when API call fails", async () => {
      // Given: Mock API client throws error
      const apiError = new Error("API Error");
      vi.mocked(mockApiClient.get).mockRejectedValue(apiError);
      const userId = "user-123";

      // When & Then: Should call API with userId and throw the API error
      await expect(userApiRepository.getUserProfile(userId)).rejects.toThrow(
        "API Error"
      );
      expect(mockApiClient.get).toHaveBeenCalledWith(`/users/${userId}`);
    });
  });

  describe("getCurrentUserProfile", () => {
    it("should return User domain object when GET /users/me succeeds", async () => {
      // Given: Mock API client returns valid user profile for current user
      const validUserProfileDto: UserProfileDto = {
        id: "user-1",
        username: "astute lee",
        profileImage: "https://picsum.photos/seed/523/100/100",
        age: 28,
        email: "user@example.com",
      };
      const mockResponse = {
        data: validUserProfileDto,
        status: 200,
        statusText: "OK",
        ok: true,
      };
      vi.mocked(mockApiClient.get).mockResolvedValue(mockResponse);

      // When: Get current user profile
      const result = await userApiRepository.getCurrentUserProfile();

      // Then: Should return User domain object and call GET /users/me
      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(validUserProfileDto.id);
      expect(result.username).toBe(validUserProfileDto.username);
      expect(result.profileImage).toBe(validUserProfileDto.profileImage);
      expect(result.age).toBe(validUserProfileDto.age);
      expect(result.email).toBe(validUserProfileDto.email);
      expect(mockApiClient.get).toHaveBeenCalledWith("/users/me");
    });

    it("should throw when GET /users/me fails", async () => {
      // Given: Mock API client throws error
      const apiError = new Error("Unauthorized");
      vi.mocked(mockApiClient.get).mockRejectedValue(apiError);

      // When & Then: Should call GET /users/me and throw
      await expect(userApiRepository.getCurrentUserProfile()).rejects.toThrow(
        "Unauthorized"
      );
      expect(mockApiClient.get).toHaveBeenCalledWith("/users/me");
    });
  });
});
