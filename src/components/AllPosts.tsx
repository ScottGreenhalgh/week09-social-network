import { connect } from "@/utils/connect";
import Link from "next/link";

import style from "@/styles/posts.module.css";
import Image from "next/image";

const db = connect();

type Post = {
  id: number;
  content: string;
  username: string;
  created_at: Date;
  image_url?: string;
  nickname: string;
};

const AllPosts: React.FC = async () => {
  const { rows } = await db.query<Post>(`
    SELECT 
        social_posts.id,
        social_profiles.username,
        social_profiles.image_url,
        social_profiles.nickname,
        social_posts.content,
        social_posts.created_at
    FROM social_posts
    INNER JOIN social_profiles ON social_posts.clerk_id = social_profiles.clerk_id;
        `);
  // console.log(rows);

  return (
    <div className={style["post-container"]}>
      {rows.map((post) => {
        const date = new Date(post.created_at);
        const formattedDate = `${date
          .getHours()
          .toString()
          .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")} 
          ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        return (
          <div key={post.id} className={style["individual-post"]}>
            {post?.image_url && (
              <Image
                className={style["profile-image"]}
                src={post.image_url}
                alt={`${post.username}'s profile image`}
                height={50}
                width={50}
              />
            )}
            <Link
              className={`text-amber-500 hover:text-orange-500 ${style["post-username"]}`}
              href={`/u/${post.username.replace(/ /g, "-")}`}
            >
              {post.nickname}
              <span className="text-gray-400 text-sm">{` @${post.username}`}</span>
            </Link>
            <p>{post.content}</p>
            <p className={style["post-timestamp"]}>{formattedDate}</p>
          </div>
        );
      })}
    </div>
  );
};
export default AllPosts;
