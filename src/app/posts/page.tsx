import AllPosts from "@/components/AllPosts";
import { connect } from "@/utils/connect";
import { auth } from "@clerk/nextjs/server";
import dynamic from "next/dynamic";

const { userId } = auth();

const ModularForm = dynamic(() => import("@/components/ModularForm"), {
  ssr: false,
});

async function profileCheck() {
  "use server";
  const db = connect();
  const profile = await db.query(
    `SELECT * FROM social_profiles WHERE clerk_id = $1`,
    [userId]
  );
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
}

export default async function Page() {
  async function handleCreatePost(formData: FormData) {
    "use server";
    const db = connect();
    // get content from the form
    const content = formData.get("content") as string;
    // add post to db
    await db.query(
      `INSERT INTO social_posts (clerk_id, content) VALUES ($1, $2)`,
      [userId, content]
    );
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
    return profileResult; // If renderPage returns, render its JSX
  }

  return (
    <div>
      <h1>Form Page</h1>
      <ModularForm fields={fields} onSubmit={handleCreatePost} />
      <AllPosts />
    </div>
  );
}

//note: use this somewhere: import { revalidatePath } from 'next/navigation';
