"use client";

import React from "react";
import * as Form from "@radix-ui/react-form";
import style from "@/styles/user.module.css";

import {
  AiOutlineDislike,
  AiOutlineLike,
  AiFillLike,
  AiFillDislike,
} from "react-icons/ai";

type LikeDislikeProps = {
  postId: number; // passed down from the map as a prop
  isLike: boolean;
  action: boolean; // true if already liked/disliked
  likes?: number;
  dislikes?: number;
  onSubmit: (formData: FormData) => void;
};

const LikeDislikeButton: React.FC<LikeDislikeProps> = ({
  postId,
  isLike,
  action,
  likes,
  dislikes,
  onSubmit,
}) => {
  return (
    <Form.Root
      className={style["FormRoot"]}
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        formData.append("isLike", isLike.toString());
        formData.append("postId", postId.toString());
        onSubmit(formData);
        (e.target as HTMLFormElement).reset();
      }}
    >
      <Form.Field name="postId" asChild>
        {/* Hidden input to pass the postId */}
        <input type="hidden" value={postId} />
      </Form.Field>

      <Form.Submit asChild>
        <button className={style["Likes"]}>
          {action ? (
            isLike ? (
              <span className="flex">
                <AiFillLike />
                {likes}
              </span>
            ) : (
              <span className="flex">
                <AiFillDislike />
                {dislikes}
              </span>
            )
          ) : isLike ? (
            <span className="flex">
              <AiOutlineLike />
              {likes}
            </span>
          ) : (
            <span className="flex">
              <AiOutlineDislike />
              {dislikes}
            </span>
          )}
        </button>
      </Form.Submit>
    </Form.Root>
  );
};

export default LikeDislikeButton;
