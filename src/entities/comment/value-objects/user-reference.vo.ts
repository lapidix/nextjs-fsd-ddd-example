import { ValueObject } from "@/shared/domain";
import { BaseError } from "@/shared/libs/errors";
import { UserReference } from "../types";

export class UserReferenceVO extends ValueObject<UserReference> {
  constructor(value: UserReference) {
    super(value);
  }

  protected validate(value: UserReference): void {
    if (value === null || value === undefined) {
      throw BaseError.validation("User reference cannot be null or undefined");
    }

    if (typeof value.id !== "string") {
      throw BaseError.validation("User ID must be a string");
    }

    if (!value.username || !value.username.trim()) {
      throw BaseError.validation("Username cannot be empty");
    }
  }

  public get id(): string {
    return this.value.id;
  }

  public get username(): string {
    return this.value.username;
  }

  public get profileImage(): string {
    return this.value.profileImage;
  }

  public toDTO(): UserReference {
    return {
      id: this.id,
      username: this.username,
      profileImage: this.profileImage,
    };
  }
}
