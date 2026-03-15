import { User } from "./user.domain";

export interface UserRepository {
  getUserProfile(userId: string): Promise<User>;
  getCurrentUserProfile(): Promise<User>;
}
