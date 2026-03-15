import { POST_QUERY_KEYS } from "@/entities/post";
import { BaseError } from "@/shared/libs/errors";
import { useQuery } from "@tanstack/react-query";
import type { PostDetailResult } from "../results";
import type { PostUseCase } from "../usecase/post.usecase";

export const createUseGetPostById = (postUseCase: PostUseCase) => {
  return (id: string, enabled = true) => {
    const usePostById = useQuery<PostDetailResult, Error>({
      queryKey: POST_QUERY_KEYS.detail(id),
      queryFn: async () => {
        try {
          return await postUseCase.getPostById({ id });
        } catch (error) {
          if (error instanceof BaseError) {
            throw error;
          }
          throw new BaseError(
            `Failed to fetch post with ID ${id}`,
            "FETCH_FAILED"
          );
        }
      },
      enabled: enabled,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    });
    return usePostById;
  };
};
