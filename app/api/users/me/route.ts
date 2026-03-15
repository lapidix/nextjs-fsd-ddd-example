import { NextResponse } from "next/server";

/** Matches UserProfileDto: id (string), username, profileImage, age?, email? */
const generateMockUserProfile = () => {
  return {
    id: "user-1",
    username: "astute lee",
    profileImage: "https://picsum.photos/seed/523/100/100",
    email: "user@example.com",
    age: 28,
  };
};

export async function GET() {
  try {
    const userProfile = generateMockUserProfile();

    return NextResponse.json(userProfile, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch user profile", error },
      { status: 500 }
    );
  }
}
