import ProfilePosts from "@/components/ProfilePosts";
import { fetchProfileByUsername } from "@/utils/fetch";
import { QueryResult } from "pg";

type Params = {
  username: string;
};

let profileData: {
  username: string;
  bio: string;
  // add other fields here
};

export default async function UserPage({ params }: { params: Params }) {
  const { username } = params;
  const formattedUsername = username.replace(/-/g, " "); // convert username back
  try {
    const profile = await fetchProfileByUsername(formattedUsername);

    if (profile.rowCount === 0) {
      return <p>404 | Profile Not Found</p>;
    }

    profileData = profile.rows[0];
  } catch (error) {
    console.error(error);
  }

  //console.log(profile.rows)

  return (
    <div>
      <p>{`${formattedUsername}'s Profile`}</p>
      <p>{profileData.bio}</p>
      <ProfilePosts username={formattedUsername} />
    </div>
  );
}
