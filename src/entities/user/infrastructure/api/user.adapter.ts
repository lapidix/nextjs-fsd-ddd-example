import { BaseHttpClient } from "@/shared/libs/http";
import { UserDto, UserProfileDto } from "../dto";

export const UserAdapter = (httpClient: BaseHttpClient) => ({
  getProfile: async (userId: string): Promise<UserProfileDto> => {
    return await httpClient
      .get<UserDto>(`/users/${userId}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error("User Profile Error: ", error);
        throw error;
      });
  },
  getCurrentProfile: async (): Promise<UserProfileDto> => {
    return await httpClient
      .get<UserDto>("/users/me")
      .then((response) => response.data)
      .catch((error) => {
        console.error("Current User Profile Error: ", error);
        throw error;
      });
  },
});
