import { SignedIn, SignedOut } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { connect } from "@/utils/connect";
import dynamic from "next/dynamic";
import { fetchUserProfile } from "@/utils/fetch";
import { revalidatePath } from "next/cache";

const ModularForm = dynamic(() => import("@/components/ModularForm"), {
  ssr: false,
});

export default async function ProfilePage() {
  const { userId } = auth();
  const user = await currentUser();

  //use truthy falsy to determin if profile exists
  async function profileCheck(userId: string | null) {
    "use server";
    try {
      const profile = await fetchUserProfile(userId);
      if (profile.rowCount === 0) {
        return false;
      }
      return true;
    } catch (error) {
      console.error(error);
    }
  }

  async function handleUpdateProfile(formData: FormData) {
    "use server";
    const db = connect();
    const username = formData.get("username") as string;
    const bio = formData.get("bio") as string;

    // check whether a profile exists
    try {
      const profile = await fetchUserProfile(userId);
      if (profile.rowCount === 0) {
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
    } catch (error) {
      console.error(error);
    } finally {
      revalidatePath("/profile");
    }
  }

  const profileExists = await profileCheck(userId);

  const fields = [
    {
      name: "username",
      label: "Username",
      type: "username",
      required: true,
      validationMessage: "Please provide a unique username",
    },
    { name: "bio", label: "Bio", type: "textarea", required: false },
  ];

  //console.log(user);
  return (
    <div>
      <SignedIn>
        <h2>
          Welcome {user?.firstName} {user?.lastName}
        </h2>
        <p> You are signed in with {user?.emailAddresses[0].emailAddress}</p>
        {profileExists ? (
          <p>Update your profile:</p>
        ) : (
          <p>Finish your profile setup:</p>
        )}
        <ModularForm fields={fields} onSubmit={handleUpdateProfile} />
      </SignedIn>

      <SignedOut>
        <h2>Please sign in.</h2>
      </SignedOut>
    </div>
  );
}
