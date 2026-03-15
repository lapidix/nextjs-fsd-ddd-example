import { USER_QUERY_KEYS } from "@/entities/user";
import { BaseError } from "@/shared/libs/errors";
import { useQuery } from "@tanstack/react-query";
import type { UserProfileResult } from "../results";
import type { UserUseCase } from "../usecase/user.usecase";

export const createUseUserProfile = (userUseCase: UserUseCase) => {
  const useUserProfile = (userId: string) => {
    return useQuery<UserProfileResult>({
      queryKey: [...USER_QUERY_KEYS.profileById(userId)],
      queryFn: async () => {
        try {
          return await userUseCase.getUserProfile({ userId });
        } catch (error) {
          if (error instanceof BaseError) {
            throw error;
          }
          throw new BaseError("Failed to fetch user profile", "FetchError");
        }
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  return useUserProfile;
};
