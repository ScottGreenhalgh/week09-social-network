# Basic Social Network

This project involves creating a social network utilising Clerk and Radix UI elements. Clerk operates as a login system which heavily simplifies the method I was using in my past project https://github.com/ScottGreenhalgh/week08-next-comments-form/. Using my clerk user id I can retrieve data from the login related to that account without needing to store it in a database first. This means I only really need 3 database tables to complete the task I did last week using 5 since Clerk can handle the majority of the work. Alongside this, clerk has login integration with other services such as Google, GitHub etc which offers the ability to one click login to the service, something I never implamented previously. Using Radix I can create elements rendering on my page quickly and easily. Overall I want to handle this much cleaner than this prior project. My return statements on my pages were incredibly long previously, so instead I'm going to try my best to break the output into smaller components.

### Project Setup

To setup this project I used `npx create-next-app@latest` and selected Typescript. Having just been introduced to typed variables I wanted to see if I could utilise them in this project too. From here deleted the fonts folder and removed them from the layout.tsx file. I then ran `npm i pg` and created a utils folder containing my connect.ts file that linked to my db. I then created a env.local file and placed my db url inside.

### Clerk

To setup Clerk, I went to their website and created a new project. I then grabbed the api keys and placed these inside my env file. From here I ran `npm i @clerk/nextjs` and followed this guide: https://clerk.com/docs/quickstarts/nextjs. From here I started work on creating the custom sign in/ sign up pages, for this I used this guide: https://clerk.com/docs/references/nextjs/custom-signup-signin-pages.

### Forms

During my last project, I realised how often I needed to use forms and their submissions to make database queries. Based on this I wanted to create a form component that was modular, so I could quickly create a form on any page by simply by using the component and passing the data the form needed to gather using props. Also, instead of passing the data over to an src/api location, I wanted to be able to handle the database requests on each individual page using the handleFormSubmit function with "use server". This would be a little more elegant in my opinion and should in theory perform better.

To start this process I went over to https://www.radix-ui.com/primitives/docs/components/form and grabbed their example usage of the form. I then followed the installation instructions to insure I had the correct modules. This included running `npm i @radix-ui/colors` which isn't mentioned in the doc as required despite the css styles relying on it.

From here I needed a way of passing my handle submit function back to the page where this component is being used. Since props can only be passed down, I needed a way of sending this data back up. This is when I came across the concept of something called dynamic from next/dynamic. This is a Next.js function which allows me to dynamically import components which will only fetch the component when it's needed. The `ssr: false` object here determins whether to use server side rendering or not based on the result of a boolean. Since my form is a client component ssr false is ideal in this scenario. Essentially how it works is in two parts. On the server, Next.js will know not to render thee ModularForm component, and will instead use placeholder HTML which will later be filled in by the client. On the client, once the page is loaded it will hit the dynamic import where the component is fetched, replacing the placeholder with the actual rendered component. Because my client component has server side dependancies, this method ensures it doesn't break when calling the function handling the submit passed down as a prop.

As for the parameters that define what the form actually looks like, I refered to the docs in the link above and had a look what information each of those imported components can take and strucured my fields based on this. I settled on a name, refering to the name of the field, which is what I can reference using dot notation I can use from the outputted formData, the label which will display above the rendered input element, the type, a boolean to determin whether that field is required or not and an optional validation message.

To summarise the above, when defining data to pass down as a prop to the form I should do something similar to the following (based on the example found in the docs):

```ts
const ModularForm = dynamic(() => import("@/components/ModularForm"), {
  ssr: false,
});

export default async function Page() {
  async function handleSubmit(formData: FormData) {
    "use server";
    const db = connect();
    // db query code here
  }

  const fields = [
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      validationMessage: "Please provide a valid email",
    },
    { name: "question", label: "Question", type: "textarea", required: true },
  ];

  return (
    <div>
      <ModularForm fields={fields} onSubmit={handleSubmit} />
    </div>
  );
}
```

### Pages

The page layout for this project required the usage of sign-in and sign-out for the clerk custom pages to operate (with the alternative being a redirect to an external site). Besides this I knew I needed a page for posts and a page for profile. The profile page would contain information relevant to users finishing their initial profile setup or updating the existing data. The posts page would allow users to create posts viewable to all in a public space. The username associate with that post can be clicked on taking the user to /u/{username} which would contain all the posts that user has made. I added the /u/ as a buffer to prevent usernames from becoming equal to posts or profile causing problems. This is the structure I went for in the end.
