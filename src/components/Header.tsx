import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

import style from "@/styles/header.module.css";

const Header: React.FC = () => {
  return (
    <header className={style["Header"]}>
      <Link href="/posts" className={style["link"]}>
        Posts
      </Link>
      <Link href="/profile" className={style["link"]}>
        Edit Profile
      </Link>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );
};

export default Header;
