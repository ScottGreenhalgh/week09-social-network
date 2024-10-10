import ProfilePosts from "@/components/ProfilePosts";
import { fetchProfileByUsername } from "@/utils/fetch";

type Params = {
  username: string;
};

export default async function UserPage({ params }: { params: Params }) {
  const { username } = params;
  const formattedUsername = username.replace(/-/g, " "); // convert username back

  const profile = await fetchProfileByUsername(formattedUsername);

  if (profile.rowCount === 0) {
    return <p>404 | Profile Not Found</p>;
  }

  //console.log(profile.rows)

  return (
    <div>
      <p>{`${formattedUsername}'s Profile`}</p>
      <p>{profile.rows[0].bio}</p>
      <ProfilePosts username={formattedUsername} />
    </div>
  );
}
