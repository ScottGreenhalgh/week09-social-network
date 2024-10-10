import { connect } from "@/utils/connect";

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
