"use client";

import React from "react";
import * as Form from "@radix-ui/react-form";

type LikeDislikeProps = {
  postId: number; // passed down from the map as a prop
  isLike: boolean;
  action: boolean; // true if already liked/disliked
  onSubmit: (formData: FormData) => void;
};

const LikeDislikeButton: React.FC<LikeDislikeProps> = ({
  postId,
  isLike,
  action,
  onSubmit,
}) => {
  return (
    <Form.Root
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
        <button>
          {action
            ? isLike
              ? "Unlike"
              : "Undislike"
            : isLike
            ? "Like"
            : "Dislike"}
        </button>
      </Form.Submit>
    </Form.Root>
  );
};

export default LikeDislikeButton;
