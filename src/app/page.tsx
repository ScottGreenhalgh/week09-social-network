import { redirect } from "next/navigation";

export default function Home() {
  redirect("/posts");

  return (
    <div>
      <h1 className="text-4xl">Home</h1>
    </div>
  );
}
