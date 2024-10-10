import { connect } from "@/utils/connect";
import Link from "next/link";

const db = connect();

type Post = {
  id: number;
  content: string;
  username: string;
  created_at: Date;
};

const AllPosts: React.FC = async () => {
  const { rows } = await db.query<Post>(`
    SELECT 
        social_posts.id,
        social_profiles.username,
        social_posts.content,
        social_posts.created_at
    FROM social_posts
    INNER JOIN social_profiles ON social_posts.clerk_id = social_profiles.clerk_id;
        `);
  console.log(rows);

  return (
    <div>
      <h3>All Posts</h3>
      {rows.map((post) => {
        const date = new Date(post.created_at);
        const formattedDate = `${date
          .getHours()
          .toString()
          .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")} 
          ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        return (
          <div key={post.id}>
            <Link
              href={`/u/${post.username.replace(/ /g, "-")}`}
            >{`${post.username} Posted:`}</Link>
            <p>{post.content}</p>
            <p>{formattedDate}</p>
          </div>
        );
      })}
    </div>
  );
};
export default AllPosts;
