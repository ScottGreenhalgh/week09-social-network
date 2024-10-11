import ProfilePosts from "@/components/ProfilePosts";
import { connect } from "@/utils/connect";
import {
  fetchProfileByUsername,
  fetchUserProfile,
  getFollowees,
  getFollowers,
} from "@/utils/fetch";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
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

let followerData: {
  id: number;
  username: string;
  follower_id: string;
}[];

let followeeData: {
  id: number;
  username: string;
  follower_id: string;
}[];

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

    const follower = await getFollowers(profileData.clerk_id);
    const followee = await getFollowees(profileData.clerk_id);

    followerData = follower.rows;
    followeeData = followee.rows;

    // console.log("profile id", profileData.clerk_id);
    // console.log("viewer id", viewerData.clerk_id);
    // console.log("follower(s)", followerData);
    // console.log("followee(s)", followeeData);
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
    } finally {
      revalidatePath(`/u/${username}`);
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
    } finally {
      revalidatePath(`/u/${username}`);
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
        <FollowButton onSubmit={onClick} isFollowing={isFollowing} />
      ) : (
        <p>Viewing your own profile</p>
      )}
      <div>
        <p>{`${formattedUsername}'s Profile`}</p>
        <p>{profileData.bio}</p>
      </div>
      <div>
        {followerData.length === 0 ? (
          <p>{`${formattedUsername} is not following anyone.`}</p>
        ) : (
          <div>
            <p>{`${formattedUsername} is following:`}</p>
            {followerData.map((follower) => (
              <div key={follower.id}>
                <p>{follower.username}</p>
              </div>
            ))}
          </div>
        )}
        {followeeData.length === 0 ? (
          <p>{`${formattedUsername} is not followed by anyone.`}</p>
        ) : (
          <div>
            <p>{`${formattedUsername} is followed by:`}</p>
            {followeeData.map((followee) => (
              <div key={followee.id}>
                <p>{followee.username}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <ProfilePosts username={formattedUsername} />
    </div>
  );
}
