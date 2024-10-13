import { SignedIn, SignedOut } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { connect } from "@/utils/connect";
import dynamic from "next/dynamic";
import { fetchUserProfile } from "@/utils/fetch";
import { revalidatePath } from "next/cache";
import Image from "next/image";

import style from "@/styles/profile.module.css";
import Link from "next/link";

const ModularForm = dynamic(() => import("@/components/ModularForm"), {
  ssr: false,
});

export default async function ProfilePage() {
  const { userId } = auth();
  const user = await currentUser();
  const userData = await fetchUserProfile(userId);
  let currentUsername: string = "";

  if (!(userData.rowCount === 0)) {
    currentUsername = userData.rows[0].username;
  }

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
    const nickname = formData.get("nickname") as string;

    // check whether a profile exists
    try {
      const profile = await fetchUserProfile(userId);
      if (profile.rowCount === 0) {
        // insert into db
        await db.query(
          `INSERT INTO social_profiles (clerk_id, username, bio, image_url, nickname) VALUES ($1, $2, $3, $4, $5)`,
          [userId, username, bio, user?.imageUrl || null, nickname]
        );
      } else {
        // update existing item
        await db.query(
          `UPDATE social_profiles SET username = $1, bio=$2, image_url=$3, nickname=$4 WHERE clerk_id=$5`,
          [username, bio, user?.imageUrl || null, nickname, userId]
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      revalidatePath("/");
    }
  }

  const profileExists = await profileCheck(userId);

  const fields = [
    {
      name: "username",
      label: "Username",
      type: "username",
      required: true,
      validationMessage: "Enter a unique username",
    },
    { name: "nickname", label: "Nickname", type: "text", required: true },
    { name: "bio", label: "Bio", type: "textarea", required: true },
  ];

  //console.log(user);
  return (
    <div className={style["main-container"]}>
      <SignedIn>
        {user?.imageUrl && (
          <Image
            className={style["profile-img"]}
            src={user.imageUrl}
            alt={`${user?.username}'s profile image`}
            height={100}
            width={100}
          />
        )}
        <h2 className="text-2xl">
          Welcome {user?.firstName} {user?.lastName}
        </h2>
        <p> You are signed in with {user?.emailAddresses[0].emailAddress}</p>
        {profileExists ? (
          <>
            <Link
              href={`/u/${currentUsername.replace(/ /g, "-")}`}
              className="text-amber-500 hover:text-orange-500"
            >
              @{currentUsername}
            </Link>
            <p className="text-2xl">Update your profile:</p>
          </>
        ) : (
          <p className="text-2xl">Finish your profile setup:</p>
        )}
        <ModularForm fields={fields} onSubmit={handleUpdateProfile} />
      </SignedIn>

      <SignedOut>
        <h2 className="text-4xl">Please sign in.</h2>
      </SignedOut>
    </div>
  );
}
