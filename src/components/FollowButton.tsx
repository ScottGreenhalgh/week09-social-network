"use client";
type FollowButtonProps = {
  onClick: () => void;
  isFollowing: boolean;
};

const FollowButton: React.FC<FollowButtonProps> = ({
  onClick,
  isFollowing,
}) => {
  return (
    <button onClick={onClick}>{isFollowing ? "Unfollow" : "Follow"}</button>
  );
};

export default FollowButton;
