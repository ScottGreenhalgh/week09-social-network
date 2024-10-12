import { connect } from "@/utils/connect";
import { redirect } from "next/navigation";

export async function fetchUserProfile(userId: string | null) {
  const db = connect();
  const profile = await db.query(
    `SELECT * FROM social_profiles WHERE clerk_id = $1`,
    [userId]
  );
  return profile;
}

export async function fetchProfileByUsername(username: string | null) {
  const db = connect();
  const profile = await db.query(
    `SELECT * FROM social_profiles WHERE username = $1`,
    [username]
  );
  return profile;
}

export async function getFollowees(userId: string | null) {
  const db = connect();
  const followees = await db.query(
    `SELECT social_profiles.clerk_id as id, social_profiles.username, social_relationships.follower_id
     FROM social_relationships
     INNER JOIN social_profiles ON social_relationships.follower_id = social_profiles.clerk_id
     WHERE social_relationships.followee_id = $1`,
    [userId]
  );
  return followees;
}

export async function getFollowers(userId: string | null) {
  const db = connect();
  const followers = await db.query(
    `SELECT social_profiles.clerk_id as id, social_profiles.username, social_relationships.followee_id
     FROM social_relationships
     INNER JOIN social_profiles ON social_relationships.followee_id = social_profiles.clerk_id
     WHERE social_relationships.follower_id = $1`,
    [userId]
  );
  return followers;
}

export async function checkProfileSetup(
  userId: string | null,
  referer: string | null
) {
  if (userId) {
    const db = connect();
    const response = await db.query(
      `SELECT * FROM social_profiles WHERE clerk_id = $1`,
      [userId]
    );

    // if no profile returns redirect
    if (
      response.rowCount === 0 &&
      !["/sign-in", "/sign-up", "/profile"].includes(
        new URL(referer || "").pathname
      )
    ) {
      redirect("/profile");
    }
  }
}
