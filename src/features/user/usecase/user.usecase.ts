import type { GetUserProfileQuery } from "../queries";
import type { UserProfileResult } from "../results";

export interface UserUseCase {
  getUserProfile: (query: GetUserProfileQuery) => Promise<UserProfileResult>;
  getCurrentUserProfile: () => Promise<UserProfileResult>;
}
