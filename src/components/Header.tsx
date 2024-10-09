import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

import style from "@/styles/header.module.css";

export default function Header() {
  return (
    <header className={style["Header"]}>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <Link href="/profile" className={style["link"]}>
        Profile
      </Link>
      <Link href="/posts" className={style["link"]}>
        Posts
      </Link>
    </header>
  );
}
