import { UserUseCase } from "../usecase/user.usecase";
import { createUseCurrentUserProfile } from "./useCurrentUserProfile";
import { createUseUserProfile } from "./useUserProfile";

export const createUserHooks = (userUseCase: UserUseCase) => ({
  useUserProfile: createUseUserProfile(userUseCase),
  useCurrentUserProfile: createUseCurrentUserProfile(userUseCase),
});
