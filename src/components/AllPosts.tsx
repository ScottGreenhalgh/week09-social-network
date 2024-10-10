import { connect } from "@/utils/connect";
import Link from "next/link";

const db = connect();

type Post = {
  id: number;
  content: string;
  username: string;
};

const AllPosts: React.FC = async () => {
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
            <Link
              href={`/u/${post.username.replace(/ /g, "-")}`}
            >{`${post.username} Posted:`}</Link>
            <p>{post.content}</p>
          </div>
        );
      })}
    </div>
  );
};
export default AllPosts;
