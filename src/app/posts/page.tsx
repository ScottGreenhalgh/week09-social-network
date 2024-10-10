import AllPosts from "@/components/AllPosts";
import { connect } from "@/utils/connect";
import { auth } from "@clerk/nextjs/server";
import dynamic from "next/dynamic";
import { fetchUserProfile } from "@/utils/fetch";
import { revalidatePath } from "next/cache";
import { SignedIn, SignedOut } from "@clerk/nextjs";

const { userId } = auth();

const ModularForm = dynamic(() => import("@/components/ModularForm"), {
  ssr: false,
});

async function profileCheck() {
  "use server";
  try {
    const profile = await fetchUserProfile(userId);
    // conditional rendering based on profile
    if (profile.rowCount === 0) {
      return (
        <div>
          <p>Login and setup profile to create a post.</p>
          <AllPosts />
        </div>
      );
    }
    return null; // allows further rendering
  } catch (error) {
    console.error(error);
  }
}

export default async function Page() {
  async function handleCreatePost(formData: FormData) {
    "use server";
    const db = connect();
    // get content from the form
    const content = formData.get("content") as string;
    try {
      // add post to db
      await db.query(
        `INSERT INTO social_posts (clerk_id, content) VALUES ($1, $2)`,
        [userId, content]
      );
    } catch (error) {
      console.error(error);
    } finally {
      revalidatePath("/posts");
    }
  }

  const fields = [
    {
      name: "content",
      label: "Post content",
      type: "textarea",
      required: true,
    },
  ];

  // Await the result of profileCheck to conditionally render
  const profileResult = await profileCheck();

  if (profileResult) {
    return profileResult; // If renderPage returns JSX, render it
  }

  return (
    <div>
      <SignedIn>
        <h1>Form Page</h1>
        <ModularForm fields={fields} onSubmit={handleCreatePost} />
        <AllPosts />
      </SignedIn>

      <SignedOut>
        <h2>Please sign in.</h2>
      </SignedOut>
    </div>
  );
}
