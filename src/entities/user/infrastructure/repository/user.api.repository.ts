import { User, UserRepository } from "../../core";
import { UserAdapter } from "../api";
import { UserMapper } from "../../mapper";
import { ApiClient } from "@/shared/api";

export class UserApiRepository implements UserRepository {
  private api: ReturnType<typeof UserAdapter>;
  constructor(apiClient: ApiClient) {
    this.api = UserAdapter(apiClient);
  }

  async getUserProfile(): Promise<User> {
    try {
      const response = await this.api.getProfile();
      const user = UserMapper.toDomainFromProfile(response);
      return user;
    } catch (error) {
      console.error("UserRepository getUserProfile Error:", error);
      throw error;
    }
  }
}
