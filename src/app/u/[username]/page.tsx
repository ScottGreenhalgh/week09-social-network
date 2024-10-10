import ProfilePosts from "@/components/ProfilePosts";
import { connect } from "@/utils/connect";
import { fetchProfileByUsername, fetchUserProfile } from "@/utils/fetch";
import { auth } from "@clerk/nextjs/server";
import dynamic from "next/dynamic";

const FollowButton = dynamic(() => import("@/components/FollowButton"), {
  ssr: false,
});

type Params = {
  username: string;
};

let profileData: {
  username: string;
  bio: string;
  clerk_id: string;
};

let viewerData: {
  username: string;
  clerk_id: string;
};

export default async function UserPage({ params }: { params: Params }) {
  const db = connect();
  const { userId } = auth();
  const { username } = params;
  const formattedUsername = username.replace(/-/g, " "); // convert username back
  try {
    const profile = await fetchProfileByUsername(formattedUsername);
    const viewer = await fetchUserProfile(userId);

    if (profile.rowCount === 0) {
      return <p>404 | Profile Not Found</p>;
    }

    profileData = profile.rows[0];
    viewerData = viewer.rows[0];
  } catch (error) {
    console.error(error);
  }
  //console.log(profileData);

  const handleFollow = async () => {
    "use server";
    const db = connect();
    try {
      await db.query(
        `INSERT INTO social_relationships (follower_id, followee_id) VALUES ($1, $2)`,
        [viewerData.clerk_id, profileData.clerk_id]
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleUnfollow = async () => {
    "use server";
    const db = connect();
    try {
      await db.query(
        `DELETE FROM social_relationships WHERE follower_id = $1 AND followee_id = $2`,
        [viewerData.clerk_id, profileData.clerk_id]
      );
    } catch (error) {
      console.error(error);
    }
  };

  // Check if the user is following the profile
  const checkFollowing = await db.query(
    `SELECT * FROM social_relationships WHERE follower_id = $1 AND followee_id = $2`,
    [viewerData.clerk_id, profileData.clerk_id]
  );

  const isFollowing = !!checkFollowing.rowCount;
  const onClick = checkFollowing.rowCount ? handleUnfollow : handleFollow;

  return (
    <div>
      {viewerData.username !== profileData.username ? (
        <FollowButton onClick={onClick} isFollowing={isFollowing} />
      ) : (
        <p>Viewing your own profile</p>
      )}
      <p>{`${formattedUsername}'s Profile`}</p>
      <p>{profileData.bio}</p>
      <ProfilePosts username={formattedUsername} />
    </div>
  );
}
