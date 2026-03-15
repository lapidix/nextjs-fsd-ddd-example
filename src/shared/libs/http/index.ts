import { BaseHttpClient } from "./base.http";

export type { BaseHttpClient };
export const baseHttpClient = new BaseHttpClient({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
});
