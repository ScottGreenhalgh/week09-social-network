import { connect } from "@/utils/connect";

const db = connect();

interface Post {
  id: number;
  content: string;
  username: string;
}

export default async function AllPosts() {
  const { rows } = await db.query<Post>(`
    SELECT 
        social_posts.id,
        social_profiles.username,
        social_posts.content
    FROM social_posts
    INNER JOIN social_profiles ON social_posts.clerk_id = social_profiles.clerk_id;
        `);
  console.log(rows);

  return (
    <div>
      <h3>All Posts</h3>
      {rows.map((post) => {
        return (
          <div key={post.id}>
            <h4>{`${post.username} Posted:`}</h4>
            <p>{post.content}</p>
          </div>
        );
      })}
    </div>
  );
}
