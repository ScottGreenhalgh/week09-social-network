import { fetchUserProfile } from "@/utils/fetch";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = auth();
  const profile = await fetchUserProfile(userId);

  if (profile.rowCount === 0) {
    redirect("/profile");
  }
  redirect("/posts");

  return (
    <div>
      <h1 className="text-4xl">Home</h1>
    </div>
  );
}
