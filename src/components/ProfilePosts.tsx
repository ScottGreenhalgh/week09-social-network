import { connect } from "@/utils/connect";

type Props = {
  username: string;
};

type Post = {
  id: number;
  content: string;
};

const ProfilePosts: React.FC<Props> = async ({ username }) => {
  const db = connect();
  const { rows } = await db.query<Post>(
    `
        SELECT 
            social_posts.id,
            social_posts.content
        FROM social_posts
        INNER JOIN social_profiles ON social_posts.clerk_id = social_profiles.clerk_id
        WHERE social_profiles.username = $1;
      `,
    [username]
  );

  return (
    <div>
      <p>The following posts have been made my {username}:</p>
      {rows.map((post) => {
        return (
          <div key={post.id}>
            <p>{post.content}</p>
          </div>
        );
      })}
    </div>
  );
};
export default ProfilePosts;
