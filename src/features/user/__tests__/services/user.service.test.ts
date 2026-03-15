import { User, UserProfileDto, UserRepository } from "@/entities/user";
import { UserFixtures } from "@/entities/user/__tests__/fixtures";
import {
  MockUserRepository,
  UserRepositoryMocks,
} from "@/entities/user/__tests__/mocks";
import { BaseError } from "@/shared/libs/errors";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserService } from "../../services/user.service";

const TEST_USER_ID_NOT_FOUND = "user-not-found";
const TEST_USER_ID_ERROR = "user-123";

/**
 * User Service Tests
 * Verify UserService implementation using Given-When-Then pattern (id-based)
 */
describe("UserService", () => {
  let mockUserRepository: MockUserRepository;
  let userService: ReturnType<typeof UserService>;
  let validUserProfileDto: UserProfileDto;

  beforeEach(() => {
    mockUserRepository = UserRepositoryMocks.create();
    vi.clearAllMocks();
    userService = UserService(mockUserRepository as unknown as UserRepository);

    const userData = UserFixtures.valid.basic;
    validUserProfileDto = {
      id: userData.id,
      username: userData.username,
      profileImage: userData.profileImage,
      age: userData.age,
      email: userData.email,
    };
  });

  describe("getUserProfile", () => {
    it("should return user profile when repository returns valid data", async () => {
      // Given: Repository returns User (domain)
      const user = new User(
        validUserProfileDto.id,
        validUserProfileDto.username,
        validUserProfileDto.profileImage ?? "",
        validUserProfileDto.age ?? 0,
        validUserProfileDto.email ?? ""
      );
      mockUserRepository.getUserProfile.mockResolvedValue(user);

      // When: Get user profile with userId
      const result = await userService.getUserProfile({ userId: user.id });

      // Then: Should return mapped profile and call repository with userId
      expect(result).toEqual(validUserProfileDto);
      expect(mockUserRepository.getUserProfile).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.getUserProfile).toHaveBeenCalledWith(user.id);
    });

    it("should throw NotFoundError when repository returns null", async () => {
      // Given: Repository returns null for given userId
      mockUserRepository.getUserProfile.mockResolvedValue(null);

      // When & Then: Should call repository with userId and throw BaseError
      try {
        await userService.getUserProfile({
          userId: TEST_USER_ID_NOT_FOUND,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(BaseError);
        expect((e as BaseError).message).toBe(
          "User with ID user-not-found not found"
        );
        expect(mockUserRepository.getUserProfile).toHaveBeenCalledWith(
          TEST_USER_ID_NOT_FOUND
        );
        return;
      }
      expect.fail("Expected getUserProfile to throw");
    });

    it("should throw NotFoundError when repository returns undefined", async () => {
      // Given: Repository returns undefined for given userId
      mockUserRepository.getUserProfile.mockResolvedValue(undefined);

      // When & Then: Should call repository with userId and throw BaseError
      try {
        await userService.getUserProfile({
          userId: TEST_USER_ID_NOT_FOUND,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(BaseError);
        expect((e as BaseError).message).toBe(
          "User with ID user-not-found not found"
        );
        expect(mockUserRepository.getUserProfile).toHaveBeenCalledWith(
          TEST_USER_ID_NOT_FOUND
        );
        return;
      }
      expect.fail("Expected getUserProfile to throw");
    });

    it("should re-throw BaseError when repository throws BaseError", async () => {
      // Given: Repository throws BaseError for given userId
      const baseError = BaseError.unauthorized("User", "123", "access");
      mockUserRepository.getUserProfile.mockRejectedValue(baseError);

      // When & Then: Should call repository with userId and re-throw BaseError
      await expect(
        userService.getUserProfile({ userId: TEST_USER_ID_ERROR })
      ).rejects.toThrow(baseError);
      expect(mockUserRepository.getUserProfile).toHaveBeenCalledWith(
        TEST_USER_ID_ERROR
      );
    });

    it("should wrap generic error in BaseError", async () => {
      // Given: Repository throws generic error for given userId
      const genericError = new Error("Database connection failed");
      mockUserRepository.getUserProfile.mockRejectedValue(genericError);

      // When & Then: Should call repository with userId and throw BaseError
      try {
        await userService.getUserProfile({ userId: TEST_USER_ID_ERROR });
      } catch (e) {
        expect(e).toBeInstanceOf(BaseError);
        expect((e as BaseError).message).toBe("Failed to fetch user profile");
        expect(mockUserRepository.getUserProfile).toHaveBeenCalledWith(
          TEST_USER_ID_ERROR
        );
        return;
      }
      expect.fail("Expected getUserProfile to throw");
    });

    it("should log errors to console", async () => {
      // Given: Console spy and repository throws error for given userId
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const error = new Error("Repository error");
      mockUserRepository.getUserProfile.mockRejectedValue(error);

      // When: Get user profile with userId (expect throw)
      try {
        await userService.getUserProfile({ userId: TEST_USER_ID_ERROR });
      } catch {
        // Expected to throw
      }

      // Then: Should call repository with userId and log error
      expect(mockUserRepository.getUserProfile).toHaveBeenCalledWith(
        TEST_USER_ID_ERROR
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching user profile:",
        error
      );

      consoleSpy.mockRestore();
    });
  });

  describe("getCurrentUserProfile", () => {
    it("should return current user profile when repository returns valid data", async () => {
      // Given: Repository returns User (domain) for current user
      const user = new User(
        validUserProfileDto.id,
        validUserProfileDto.username,
        validUserProfileDto.profileImage ?? "",
        validUserProfileDto.age ?? 0,
        validUserProfileDto.email ?? ""
      );
      mockUserRepository.getCurrentUserProfile.mockResolvedValue(user);

      // When: Get current user profile
      const result = await userService.getCurrentUserProfile();

      // Then: Should return mapped profile and call repository (no args)
      expect(result).toEqual(validUserProfileDto);
      expect(mockUserRepository.getCurrentUserProfile).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.getCurrentUserProfile).toHaveBeenCalledWith();
    });

    it("should throw when repository returns null for current user", async () => {
      // Given: Repository returns null for current user
      mockUserRepository.getCurrentUserProfile.mockResolvedValue(null);

      // When & Then: Should throw BaseError
      await expect(userService.getCurrentUserProfile()).rejects.toThrow(
        "Current user not found"
      );
      expect(mockUserRepository.getCurrentUserProfile).toHaveBeenCalledWith();
    });

    it("should re-throw BaseError when repository throws BaseError", async () => {
      // Given: Repository throws BaseError
      const baseError = BaseError.unauthorized("User", "current", "access");
      mockUserRepository.getCurrentUserProfile.mockRejectedValue(baseError);

      // When & Then: Should re-throw BaseError
      await expect(
        userService.getCurrentUserProfile()
      ).rejects.toThrow(baseError);
      expect(mockUserRepository.getCurrentUserProfile).toHaveBeenCalledWith();
    });

    it("should wrap generic error in BaseError", async () => {
      // Given: Repository throws generic error
      const genericError = new Error("Network error");
      mockUserRepository.getCurrentUserProfile.mockRejectedValue(genericError);

      // When & Then: Should throw BaseError
      await expect(userService.getCurrentUserProfile()).rejects.toThrow(
        "Failed to fetch current user profile"
      );
      expect(mockUserRepository.getCurrentUserProfile).toHaveBeenCalledWith();
    });
  });
});
