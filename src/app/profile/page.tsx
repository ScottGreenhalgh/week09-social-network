import { SignedIn, SignedOut } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export default async function ProfilePage() {
  //const { userId } = auth();
  const user = await currentUser();

  //console.log(user);
  return (
    <div>
      <SignedIn>
        <h2>
          Welcome {user?.firstName} {user?.lastName}
        </h2>
        <p> You are signed in with {user?.emailAddresses[0].emailAddress}</p>
      </SignedIn>

      <SignedOut>
        <h2>Please sign in.</h2>
      </SignedOut>
    </div>
  );
}
