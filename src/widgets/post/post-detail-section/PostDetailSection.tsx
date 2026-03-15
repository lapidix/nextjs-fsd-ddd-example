"use client";

import { UserIdentifier } from "@/entities/user";
import { CommentForm, CommentView } from "@/features/comment";
import { useGetPostById } from "@/features/post";
import { useCurrentUserProfile } from "@/features/user";
import { CommentIcon, Divider, LikeIcon } from "@/shared/ui";
import { formatDate } from "@/shared/utils/date";
import Image from "next/image";

export const PostDetailSection = ({ postId }: { postId: string }) => {
  const { data: userProfile } = useCurrentUserProfile();
  const { data } = useGetPostById(postId);
  if (!userProfile || !data) return null;
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4 space-x-2">
        <UserIdentifier user={data.user} />
        <div className="text-xs text-gray-500">
          {formatDate(data.createdAt)}
        </div>
      </div>

      <div className="rounded-lg overflow-hidden mb-4">
        <Image
          src={data.image}
          alt={`Post by ${data.user.username}`}
          className="w-full h-auto"
          width={400}
          height={400}
          priority={true}
          loading="eager"
        />
      </div>

      {/* Post content */}
      <div className="mb-6">
        <p className="text-gray-800 mt-2 mb-4">{data.body}</p>
        <div className="flex items-center text-gray-500 text-sm">
          <div
            className="flex items-center mr-4"
            data-testid="post-detail-likes-section">
            <LikeIcon className="h-4 w-4 text-red-500 mr-1" />
            <span data-testid="post-detail-likes-count">
              {data.likes.toLocaleString()}
            </span>
          </div>
          <div
            className="flex items-center"
            data-testid="post-detail-comments-section">
            <CommentIcon className="h-4 w-4 text-blue-500 mr-1" />
            <span data-testid="post-detail-comments-count">
              {data.comments.length.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <Divider />

      <div>
        <h3 className="font-medium mb-4" data-testid="comments-header">
          {data.comments.length} Comments
        </h3>
        <CommentForm userProfileImage={userProfile?.profileImage} />
        <div className="space-y-4">
          {data.comments.map((comment) => (
            <CommentView comment={comment} key={comment.id} />
          ))}
        </div>
      </div>
    </div>
  );
};
