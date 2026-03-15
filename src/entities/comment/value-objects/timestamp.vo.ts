import { ValueObject } from "@/shared/domain";

export class Timestamp extends ValueObject<Date> {
  constructor(value: Date | number = new Date()) {
    super(typeof value === "object" ? value : new Date(value));
  }

  protected validate(value: Date): void {
    if (!(value instanceof Date) || isNaN(value.getTime())) {
      throw new Error("Invalid date format");
    }
  }

  public static now(): Timestamp {
    return new Timestamp(new Date());
  }

  public toDate(): Date {
    return new Date(this.value);
  }

  public toNumber(): number {
    return this.value.getTime();
  }
}
