export const USER_QUERY_KEYS = {
  profile: () => ["user", "profile"] as const,
  profileById: (userId: string) => ["user", "profile", userId] as const,
  currentProfile: () => ["user", "profile", "current"] as const,
};
