import { connect } from "@/utils/connect";
import ModularForm from "@/components/ModularForm";
import { auth } from "@clerk/nextjs/server";

const { userId } = auth();

export default async function Page() {
  async function handleCreatePost(formData: FormData) {
    "use server";
    const db = connect();
    // get content from the form
    const content = formData.get("content") as string;
    // add post to db
    await db.query(
      `INSERT INTO social_posts (clerk_id, content) VALUES ($1, $2)`,
      [userId, content]
    );
  }
  //   const fields = [
  //     {
  //       name: "email",
  //       label: "Email",
  //       type: "email",
  //       required: true,
  //       validationMessage: "Please provide a valid email",
  //     },
  //     { name: "question", label: "Question", type: "textarea", required: true },
  //   ];
  const fields = [
    { name: "comment", label: "Comment", type: "textarea", required: true },
  ];

  return (
    <div>
      <h1>Form Page</h1>
      <ModularForm fields={fields} onSubmit={handleCreatePost} />
    </div>
  );
}
