import { connect } from "@/utils/connect";
import { auth } from "@clerk/nextjs/server";

const { userId } = auth();
const db = connect();

interface Post {
  id: number;
  content: string;
}

export default async function PostsPage() {
  const { rows } = await db.query<Post>(`
SELECT 
    social_posts.id,
    social_profiles.username,
    social_posts.content
FROM social_posts
INNER JOIN social_profiles ON social_posts.clerk_id = social_profiles.clerk_id;
    `);
  console.log(rows);

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

  return (
    <div>
      <h2>Posts</h2>
      <h3>Add new posts</h3>
      <form action={handleCreatePost}>
        <textarea content="content" placeholder="New Post"></textarea>
        <button type="submit">Submit</button>
      </form>

      <h3>All posts</h3>
      {rows.map((post) => {
        return (
          <div key={post.id}>
            <h4>Username</h4>
            <p>{post.content}</p>
          </div>
        );
      })}
    </div>
  );
}

//note: use this somewhere import { revalidatePath } from 'next/navigation';
