import { ValueObject } from "@/shared/domain";

export class CommentBody extends ValueObject<string> {
  private static readonly MAX_LENGTH = 100;

  constructor(value: string) {
    super(value);
  }

  protected validate(value: string): void {
    if (!value || !value.trim()) {
      throw new Error("Comment body cannot be empty");
    }

    if (value.length > CommentBody.MAX_LENGTH) {
      throw new Error(
        `Comment body cannot exceed ${CommentBody.MAX_LENGTH} characters`
      );
    }
  }

  public get text(): string {
    return this.value;
  }
}
