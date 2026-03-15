import { UserMapper, UserRepository } from "@/entities/user";
import { BaseError } from "@/shared/libs/errors";
import type { GetUserProfileQuery } from "../queries";
import type { UserProfileResult } from "../results";
import type { UserUseCase } from "../usecase/user.usecase";

export const UserService = (userRepository: UserRepository): UserUseCase => ({
  getUserProfile: async (
    query: GetUserProfileQuery
  ): Promise<UserProfileResult> => {
    try {
      const user = await userRepository.getUserProfile(query.userId);
      if (!user) {
        throw BaseError.notFound("User", query.userId);
      }
      return UserMapper.toProfileDto(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (error instanceof BaseError) {
        throw error;
      }
      throw new BaseError("Failed to fetch user profile", "FetchError");
    }
  },
  getCurrentUserProfile: async (): Promise<UserProfileResult> => {
    try {
      const user = await userRepository.getCurrentUserProfile();
      if (!user) {
        throw new BaseError("Current user not found", "NotFound");
      }
      return UserMapper.toProfileDto(user);
    } catch (error) {
      console.error("Error fetching current user profile:", error);
      if (error instanceof BaseError) {
        throw error;
      }
      throw new BaseError(
        "Failed to fetch current user profile",
        "FetchError"
      );
    }
  },
});
