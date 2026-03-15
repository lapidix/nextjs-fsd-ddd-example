import { BaseHttpClient } from "@/shared/libs/http";
import { User, UserRepository } from "../../core";
import { UserMapper } from "../../mapper";
import { UserAdapter } from "../api";

export class UserApiRepository implements UserRepository {
  private api: ReturnType<typeof UserAdapter>;
  constructor(httpClient: BaseHttpClient) {
    this.api = UserAdapter(httpClient);
  }

  async getUserProfile(userId: string): Promise<User> {
    try {
      const response = await this.api.getProfile(userId);
      const user = UserMapper.toDomainFromProfile(response);
      return user;
    } catch (error) {
      console.error("UserRepository getUserProfile Error:", error);
      throw error;
    }
  }

  async getCurrentUserProfile(): Promise<User> {
    try {
      const response = await this.api.getCurrentProfile();
      const user = UserMapper.toDomainFromProfile(response);
      return user;
    } catch (error) {
      console.error("UserRepository getCurrentUserProfile Error:", error);
      throw error;
    }
  }
}
