import { UserEntity } from "../types/user.types";
import { BaseError } from "@/shared/libs/errors";

export class User implements UserEntity {
  private _id: string;
  private _username: string;
  private _profileImage: string;
  private _age: number;
  private _email: string;

  constructor(
    id: string,
    username: string,
    image: string,
    age: number,
    email: string
  ) {
    this._id = id;
    this._username = username;
    this._profileImage = image;
    this._age = age;
    this._email = email;
  }

  get id(): string {
    return this._id;
  }

  get username(): string {
    return this._username;
  }

  get profileImage(): string {
    return this._profileImage;
  }

  get age(): number {
    return this._age;
  }

  get email(): string {
    return this._email;
  }

  updateEmail(newEmail: string): void {
    if (!this.isValidEmail(newEmail)) {
      throw BaseError.validation("Invalid email format");
    }
    this._email = newEmail;
  }

  updateUsername(newUsername: string) {
    if (!this.isValidUsername(newUsername)) {
      throw BaseError.validation("Invalid username format");
    }
    this._username = newUsername;
  }

  private isValidUsername(username: string): boolean {
    return /^[a-zA-Z0-9_.]{3,20}$/.test(username);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
