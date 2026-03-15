import { Post } from "../core";
import { PostDto } from "../infrastructure/dto";
import { PostEntity } from "../types";

export class PostMapper {
  static toDto(post: Post | PostEntity): PostDto {
    return {
      id: post.id,
      user: post.user,
      title: post.title,
      body: post.body,
      image: post.image,
      likes: post.likes,
      totalComments: post.totalComments,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  static toDomain(dto: PostDto): Post {
    return new Post(
      dto.id,
      dto.user,
      dto.title,
      dto.body,
      dto.image || "",
      dto.likes,
      dto.totalComments,
      dto.createdAt,
      dto.updatedAt
    );
  }

  static fromEntity(entity: PostEntity): Post {
    return new Post(
      entity.id,
      entity.user,
      entity.title,
      entity.body,
      entity.image || "",
      entity.likes,
      entity.totalComments,
      entity.createdAt,
      entity.updatedAt
    );
  }

  static fromEntityList(entities: PostEntity[]): Post[] {
    return entities.map((entity) => this.fromEntity(entity));
  }

  static toDomainList(dtos: PostDto[]): Post[] {
    return dtos.map((dto) => this.toDomain(dto));
  }

  static toDtoList(posts: Post[] | PostEntity[]): PostDto[] {
    return posts.map((post) => this.toDto(post));
  }
}
