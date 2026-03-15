import { BaseHttpClient } from "./base.api";

export type { BaseHttpClient };
export const baseHttpClient = new BaseHttpClient({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
});
