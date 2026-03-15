import { POST_QUERY_KEYS } from "@/entities/post";
import { BaseError } from "@/shared/libs/errors";
import { useQuery } from "@tanstack/react-query";
import type { GetPostsQuery } from "../queries";
import type { PostListResult } from "../results";
import type { PostUseCase } from "../usecase/post.usecase";

export const createUseGetPosts = (postUseCase: PostUseCase) => {
  return (options: GetPostsQuery = {}) => {
    const { limit = 10, skip = 0, query } = options;
    const queryPayload: GetPostsQuery = { limit, skip, query };

    const isSearchQuery = !!query && query.length >= 2;

    const useGetPosts = useQuery<PostListResult, Error>({
      queryKey:
        isSearchQuery && query
          ? POST_QUERY_KEYS.search(query)
          : POST_QUERY_KEYS.list({ limit, skip }),
      queryFn: async () => {
        try {
          if (isSearchQuery && query) {
            return await postUseCase.searchPosts(queryPayload);
          }
          return await postUseCase.getAllPosts(queryPayload);
        } catch (error) {
          if (error instanceof BaseError) {
            throw error;
          }
          throw new BaseError(
            `Failed to fetch posts${query ? ` with query "${query}"` : ""}`,
            "FETCH_FAILED"
          );
        }
      },
      enabled: isSearchQuery ? !!query : true,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
    });
    return useGetPosts;
  };
};
