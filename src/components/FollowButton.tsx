"use client";

import React from "react";
import * as Form from "@radix-ui/react-form";

type FollowButtonProps = {
  isFollowing: boolean;
  onSubmit: (formData: FormData) => void;
};

const FollowButton: React.FC<FollowButtonProps> = ({
  isFollowing,
  onSubmit,
}) => {
  return (
    <Form.Root
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        onSubmit(formData); // Call the function passed down as a prop
        (e.target as HTMLFormElement).reset();
      }}
    >
      <Form.Submit asChild>
        <button>{isFollowing ? "Unfollow" : "Follow"}</button>
      </Form.Submit>
    </Form.Root>
  );
};

export default FollowButton;
