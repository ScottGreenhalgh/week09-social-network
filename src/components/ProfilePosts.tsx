import { connect } from "@/utils/connect";
import dynamic from "next/dynamic";
import { revalidatePath } from "next/cache";

const LikeDislikeButton = dynamic(
  () => import("@/components/LikeDislikeButton"),
  {
    ssr: false,
  }
);

type Props = {
  username: string;
  viewerData: {
    username: string;
    clerk_id: string;
  };
};

type Post = {
  id: number;
  content: string;
  created_at: Date;
};

const ProfilePosts: React.FC<Props> = async ({ username, viewerData }) => {
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

  // --------- Likes Logic ----------
  const handleLike = async (formData: FormData) => {
    "use server";
    const postId = formData.get("postId") as string;
    const db = connect();

    // Check if a like already exists
    const existingLike = await db.query(
      `SELECT * FROM social_likes_dislikes WHERE clerk_id = $1 AND post_id = $2 AND is_like = true`,
      [viewerData.clerk_id, postId]
    );

    try {
      if (existingLike.rowCount === 0) {
        // Insert like and increment the likes count in social_posts
        await db.query(
          `
          WITH insert_like AS (
            INSERT INTO social_likes_dislikes (clerk_id, post_id, is_like)
            VALUES ($1, $2, true)
            ON CONFLICT (clerk_id, post_id) DO NOTHING
            RETURNING post_id
          )
          UPDATE social_posts
          SET likes = likes + 1
          WHERE id = $2 AND EXISTS (SELECT 1 FROM insert_like)
          `,
          [viewerData.clerk_id, postId]
        );
      } else {
        // Remove like and decrement the likes count in social_posts
        await db.query(
          `
          WITH delete_like AS (
            DELETE FROM social_likes_dislikes
            WHERE clerk_id = $1 AND post_id = $2 AND is_like = true
            RETURNING post_id
          )
          UPDATE social_posts
          SET likes = likes - 1
          WHERE id = $2 AND EXISTS (SELECT 1 FROM delete_like)
          `,
          [viewerData.clerk_id, postId]
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      revalidatePath(`/u/${username}`);
    }
  };

  const handleDislike = async (formData: FormData) => {
    "use server";
    const postId = formData.get("postId") as string;
    const db = connect();

    // Check if a dislike already exists
    const existingDislike = await db.query(
      `SELECT * FROM social_likes_dislikes WHERE clerk_id = $1 AND post_id = $2 AND is_like = false`,
      [viewerData.clerk_id, postId]
    );

    try {
      if (existingDislike.rowCount === 0) {
        // Insert dislike and increment the dislikes count in social_posts
        await db.query(
          `
          WITH insert_dislike AS (
            INSERT INTO social_likes_dislikes (clerk_id, post_id, is_like)
            VALUES ($1, $2, false)
            ON CONFLICT (clerk_id, post_id) DO NOTHING
            RETURNING post_id
          )
          UPDATE social_posts
          SET dislikes = dislikes + 1
          WHERE id = $2 AND EXISTS (SELECT 1 FROM insert_dislike)
          `,
          [viewerData.clerk_id, postId]
        );
      } else {
        // Remove dislike and decrement the dislikes count in social_posts
        await db.query(
          `
          WITH delete_dislike AS (
            DELETE FROM social_likes_dislikes
            WHERE clerk_id = $1 AND post_id = $2 AND is_like = false
            RETURNING post_id
          )
          UPDATE social_posts
          SET dislikes = dislikes - 1
          WHERE id = $2 AND EXISTS (SELECT 1 FROM delete_dislike)
          `,
          [viewerData.clerk_id, postId]
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      revalidatePath(`/u/${username}`);
    }
  };

  const checkLike = async (postId: number) => {
    const db = connect();
    const like = await db.query(
      `SELECT * FROM social_likes_dislikes WHERE clerk_id = $1 AND post_id = $2 AND is_like = $3`,
      [viewerData.clerk_id, postId, true]
    );
    return !!like.rowCount;
  };

  const checkDislike = async (postId: number) => {
    const db = connect();
    const dislike = await db.query(
      `SELECT * FROM social_likes_dislikes WHERE clerk_id = $1 AND post_id = $2 AND is_like = $3`,
      [viewerData.clerk_id, postId, false]
    );
    return !!dislike.rowCount;
  };
  // resolve promises
  const postsWithLikeDislike = await Promise.all(
    rows.map(async (post) => {
      const isLiked = await checkLike(post.id);
      const isDisliked = await checkDislike(post.id);

      return { ...post, isLiked, isDisliked };
    })
  );

  return (
    <div>
      <p>Posts made by {username}:</p>
      {postsWithLikeDislike.map((post) => {
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
            <LikeDislikeButton
              postId={post.id}
              onSubmit={handleLike}
              action={post.isLiked}
              isLike={true}
            />
            <LikeDislikeButton
              postId={post.id}
              onSubmit={handleDislike}
              action={post.isDisliked}
              isLike={false}
            />
          </div>
        );
      })}
    </div>
  );
};
export default ProfilePosts;
