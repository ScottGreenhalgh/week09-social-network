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
  const handleLike = async (postId: number) => {
    "use server";
    const db = connect();
    try {
      await db.query(
        `INSERT INTO social_likes_dislikes (clerk_id, post_id, is_like) VALUES ($1, $2, $3)
         ON CONFLICT (clerk_id, post_id) DO UPDATE SET is_like = EXCLUDED.is_like`,
        [viewerData.clerk_id, postId, true]
      );
    } catch (error) {
      console.error(error);
    } finally {
      revalidatePath(`/u/${username}`);
    }
  };

  const handleUnlike = async (postId: number) => {
    "use server";
    const db = connect();
    try {
      await db.query(
        `DELETE FROM social_likes_dislikes WHERE clerk_id = $1 AND post_id = $2 AND is_like = $3`,
        [viewerData.clerk_id, postId, true]
      );
    } catch (error) {
      console.error(error);
    } finally {
      revalidatePath(`/u/${username}`);
    }
  };

  const handleDislike = async (postId: number) => {
    "use server";
    const db = connect();
    try {
      await db.query(
        `INSERT INTO social_likes_dislikes (clerk_id, post_id, is_like) VALUES ($1, $2, $3)
       ON CONFLICT (clerk_id, post_id) DO UPDATE SET is_like = EXCLUDED.is_like`,
        [viewerData.clerk_id, postId, false]
      );
    } catch (error) {
      console.error(error);
    } finally {
      revalidatePath(`/u/${username}`);
    }
  };

  const handleUndislike = async (postId: number) => {
    "use server";
    const db = connect();
    try {
      await db.query(
        `DELETE FROM social_likes_dislikes WHERE clerk_id = $1 AND post_id = $2 AND is_like = $3`,
        [viewerData.clerk_id, postId, false]
      );
    } catch (error) {
      console.error(error);
    } finally {
      revalidatePath(`/u/${username}`);
    }
  };
  // Check if the user likes or dislikes the post
  const checkLike = async (postId: number) => {
    "use server";
    const db = connect();
    const like = await db.query(
      `SELECT * FROM social_likes_dislikes WHERE clerk_id = $1 AND post_id = $2 AND is_like = $3`,
      [viewerData.clerk_id, postId, true]
    );
    return !!like.rowCount;
  };

  const checkDislike = async (postId: number) => {
    "use server";
    const db = connect();
    const dislike = await db.query(
      `SELECT * FROM social_likes_dislikes WHERE clerk_id = $1 AND post_id = $2 AND is_like = $3`,
      [viewerData.clerk_id, postId, false]
    );
    return !!dislike.rowCount;
  };

  const postsLikeDislike = await Promise.all(
    rows.map(async (post) => {
      const isLiked = await checkLike(post.id);
      const isDisliked = await checkDislike(post.id);

      return { ...post, isLiked, isDisliked };
    })
  );

  return (
    <div>
      <p>Posts made by {username}:</p>
      {postsLikeDislike.map((post) => {
        const date = new Date(post.created_at);
        const formattedDate = `${date
          .getHours()
          .toString()
          .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")} 
        ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

        const onClickLike = post.isLiked
          ? () => handleUnlike(post.id)
          : () => handleLike(post.id);
        const onClickDislike = post.isDisliked
          ? () => handleUndislike(post.id)
          : () => handleDislike(post.id);

        return (
          <div key={post.id}>
            <p>{post.content}</p>
            <p>{formattedDate}</p>
            <LikeDislikeButton
              onSubmit={onClickLike}
              action={post.isLiked}
              isLike={true}
            />
            <LikeDislikeButton
              onSubmit={onClickDislike}
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
