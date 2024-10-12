import ProfilePosts from "@/components/ProfilePosts";
import { connect } from "@/utils/connect";
import {
  checkProfileSetup,
  fetchProfileByUsername,
  fetchUserProfile,
  getFollowees,
  getFollowers,
} from "@/utils/fetch";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import dynamic from "next/dynamic";
import { headers } from "next/headers";

import style from "@/styles/user.module.css";
import Link from "next/link";
import Image from "next/image";

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
  image_url?: string;
  nickname: string;
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
  const { userId } = auth();
  const referer = headers().get("referer");
  await checkProfileSetup(userId, referer);
  const { username } = params;
  const formattedUsername = username.replace(/-/g, " "); // convert username back
  const db = connect();
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

  // -------- Follower Logic ---------
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
    <div className={style["main-container"]}>
      {profileData?.image_url && (
        <Image
          className={style["profile-image"]}
          src={profileData.image_url}
          alt={`${profileData.username}'s profile image`}
          height={100}
          width={100}
        />
      )}
      <div className={style["profile-container"]}>
        <p className="text-amber-500 text-xl">
          {`${profileData.nickname}`}
          <span className="text-gray-400 text-sm">{` @${formattedUsername}`}</span>
        </p>
        <p className="text-sm">{profileData.bio}</p>
        <br />
        {followerData.length === 0 ? (
          <p>{`${formattedUsername} is not following anyone.`}</p>
        ) : (
          <div>
            <p>{`${formattedUsername} is following:`}</p>
            {followerData.map((follower) => (
              <div key={follower.id}>
                <Link
                  href={`/u/${follower.username}`}
                  className="text-gray-400 hover:text-gray-300 italic"
                >
                  @{follower.username}
                </Link>
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
                <Link
                  href={`/u/${followee.username}`}
                  className="text-gray-400 italic"
                >
                  @{followee.username}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      {viewerData.username !== profileData.username ? (
        <FollowButton onSubmit={onClick} isFollowing={isFollowing} />
      ) : (
        <p className="text-gray-400">Viewing your own profile</p>
      )}
      <ProfilePosts username={formattedUsername} viewerData={viewerData} />
    </div>
  );
}
