import { SignedIn, SignedOut } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { connect } from "@/utils/connect";

export default async function ProfilePage() {
  const { userId } = auth();
  const user = await currentUser();

  async function handleUpdateProfile(formData: FormData) {
    "use server";
    const db = connect();
    const username = formData.get("username") as string;
    const bio = formData.get("bio") as string;

    // check whether a profile exists
    const profiles = await db.query(
      `SELECT * FROM social_profiles WHERE clerk_id = $1`,
      [userId]
    );

    if (profiles.rowCount === 0) {
      // insert into db
      await db.query(
        `INSERT INTO social_profiles (clerk_id, username, bio) VALUES ($1, $2, $3)`,
        [userId, username, bio]
      );
    } else {
      // update existing item
      await db.query(
        `UPDATE social_profiles SET username = $1, bio=$2 WHERE clerk_id=$3`,
        [username, bio, userId]
      );
    }
  }

  console.log(user);
  return (
    <div>
      <SignedIn>
        <h2>
          Welcome {user?.firstName} {user?.lastName}
        </h2>
        <p> You are signed in with {user?.emailAddresses[0].emailAddress}</p>
      </SignedIn>

      <SignedOut>
        <h2>Please sign in.</h2>
      </SignedOut>

      <form action={handleUpdateProfile}>
        <input name="username" placeholder="Username" />
        <textarea name="bio" placeholder="Bio" />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
