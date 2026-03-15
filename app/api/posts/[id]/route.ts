import { PostDto } from "@/entities/post";
import { getRandomDate } from "@/shared/utils/date";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const post = generateMockPostById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Failed to fetch post details:", error);
    return NextResponse.json(
      { error: "Server error occurred." },
      { status: 500 }
    );
  }
}

const generateMockPostById = (id: string): PostDto => {
  return {
    id,
    user: {
      id,
      username: `Post_User_${id}`,
      profileImage: `https://picsum.photos/seed/${id + 200}/50/50`,
    },
    title: `Post Title ${id}`,
    body: `Hello! Sharing a special moment today. #Daily #Memory #HappyMoment`,
    image: `https://picsum.photos/seed/${id}/400/300`,
    totalComments: Math.floor(Math.random() * 100),
    likes: Math.floor(Math.random() * 1000),
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
  };
};
