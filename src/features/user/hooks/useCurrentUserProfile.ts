import { USER_QUERY_KEYS } from "@/entities/user";
import { BaseError } from "@/shared/libs/errors";
import { useQuery } from "@tanstack/react-query";
import type { UserProfileResult } from "../results";
import type { UserUseCase } from "../usecase/user.usecase";

export const createUseCurrentUserProfile = (userUseCase: UserUseCase) => {
  const useCurrentUserProfile = () => {
    return useQuery<UserProfileResult>({
      queryKey: [...USER_QUERY_KEYS.currentProfile()],
      queryFn: async () => {
        try {
          return await userUseCase.getCurrentUserProfile();
        } catch (error) {
          if (error instanceof BaseError) {
            throw error;
          }
          throw new BaseError(
            "Failed to fetch current user profile",
            "FetchError"
          );
        }
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  return useCurrentUserProfile;
};
