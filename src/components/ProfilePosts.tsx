import { connect } from "@/utils/connect";

type Props = {
  username: string;
};

type Post = {
  id: number;
  content: string;
  created_at: Date;
};

const ProfilePosts: React.FC<Props> = async ({ username }) => {
  const db = connect();
  const { rows } = await db.query<Post>(
    `
        SELECT 
            social_posts.id,
            social_posts.content,
            social_posts.created_at
        FROM social_posts
        INNER JOIN social_profiles ON social_posts.clerk_id = social_profiles.clerk_id
        WHERE social_profiles.username = $1;
      `,
    [username]
  );

  return (
    <div>
      <p>Posts made by {username}:</p>
      {rows.map((post) => {
        const date = new Date(post.created_at);
        const formattedDate = `${date
          .getHours()
          .toString()
          .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")} 
        ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        return (
          <div key={post.id}>
            <p>{post.content}</p>
            <p>{formattedDate}</p>
          </div>
        );
      })}
    </div>
  );
};
export default ProfilePosts;
