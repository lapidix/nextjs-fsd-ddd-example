import { UserApiRepository } from "@/entities/user";
import { baseHttpClient } from "@/shared/libs/http";
import { UserService } from "./user.service";

export const createUserService = () => {
  const repository = new UserApiRepository(baseHttpClient);
  return UserService(repository);
};
