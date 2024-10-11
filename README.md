# Basic Social Network

This project involves creating a social network utilising Clerk and Radix UI elements. Clerk operates as a login system which heavily simplifies the method I was using in my past project https://github.com/ScottGreenhalgh/week08-next-comments-form/. Using my clerk user id I can retrieve data from the login related to that account without needing to store it in a database first. This means I only really need 3 database tables to complete the task I did last week using 5 since Clerk can handle the majority of the work. Alongside this, clerk has login integration with other services such as Google, GitHub etc which offers the ability to one click login to the service, something I never implamented previously. Using Radix I can create elements rendering on my page quickly and easily. Overall I want to handle this much cleaner than this prior project. My return statements on my pages were incredibly long previously, so instead I'm going to try my best to break the output into smaller components.

### Project Setup

To setup this project I used `npx create-next-app@latest` and selected Typescript. Having just been introduced to typed variables I wanted to see if I could utilise them in this project too. From here deleted the fonts folder and removed them from the layout.tsx file. I then ran `npm i pg` and created a utils folder containing my connect.ts file that linked to my db. I then created a env.local file and placed my db url inside.

### Clerk

To setup Clerk, I went to their website and created a new project. I then grabbed the api keys and placed these inside my env file. From here I ran `npm i @clerk/nextjs` and followed this guide: https://clerk.com/docs/quickstarts/nextjs. From here I started work on creating the custom sign in/ sign up pages, for this I used this guide: https://clerk.com/docs/references/nextjs/custom-signup-signin-pages.

### Pages

The page layout for this project required the usage of sign-in and sign-out for the clerk custom pages to operate (with the alternative being a redirect to an external site). Besides this I knew I needed a page for posts and a page for profile. The profile page would contain information relevant to users finishing their initial profile setup or updating the existing data. The posts page would allow users to create posts viewable to all in a public space. The username associate with that post can be clicked on taking the user to /u/{username} which would contain all the posts that user has made. I added the /u/ as a buffer to prevent usernames from becoming equal to posts or profile causing problems. This is the structure I went for in the end.

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

### Components

Besides the ModularForm component which I was using to create all my forms, I needed to break other elements of my page apart. I started my moving my post fetching and displaying logic into seperate components. I made one for AllPosts and another for ProfilePosts. These each fetch different data from the database. One would fetch everything, the other would only fetch the rows that contain the username which matches the /u/{username}. I can then format what each of these look like independantly and then apply the back to their relevant pages. This also makes them incredibly reusable if I happen to need this data again later down the line on a different page. I also made a Header component which would handle my basic navigation throughout all of my pages. I can then place this inside my layout.tsx file so it displays on every page when rendered.

### Images and Timestamps

I wanted to import the clerk image onto the page if it existed. To do this I changed my next.config.mjs file to include the following:

```js
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
};
```

This would allow images from img.clerk.com to appear on the page, but images from any other source would be declined. From here I could grab the imageUrl using currentUser from clerk/nextjs/server and add this to the Image src.

From here I had a look at timestamps. This is something I made a handly function for in my last project which looks like this:

```ts
const date = new Date(post.created_at);
const formattedDate = `${date.getHours().toString().padStart(2, "0")}:${date
  .getMinutes()
  .toString()
  .padStart(2, "0")} 
${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
```

Converting the timestamp format into something readable on the page. All I needed to do now was add the extra column to the social_posts table. To do this I did the following:

```sql
ALTER TABLE social_posts
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

From here I just added the above function to my maps in AllPosts and ProfilePosts and outputting it onto the page. At this stage I also went back through all of my db.query() statements and ensured they were all encapsualted inside a try/catch/finally to help prevent any issues down the line.

### Followers/following

With the overall webpage so far meeting the requirements of this project (minus the styling), I decided to turn my attention towards some of the stretch goals. Specifically follower and following relationships. To start with I needed a new PostgreSQL table to handle this information which looked as follows:

```sql
CREATE TABLE social_relationships (
    follower_id INT,
    followee_id INT,
    PRIMARY KEY (follower_id, followee_id),
    FOREIGN KEY (follower_id) REFERENCES social_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (followee_id) REFERENCES social_profiles(id) ON DELETE CASCADE
);

```

To do various functions with this table I can do any of the following:

```sql
-- follow user
INSERT INTO social_relationships (follower_id, followee_id) VALUES (1, 2);
-- unfollow user
DELETE FROM social_relationships WHERE follower_id = 1 AND followee_id = 2;
-- get users followers
SELECT follower_id FROM social_relationships WHERE followee_id = 2;
-- get users followees
SELECT followee_id FROM social_relationships WHERE follower_id = 1;
```

With this design solidified I moved onto implamenting this into the project. While integrating this approach I realised I made a bit of a blunder with my table definitions. The clerk_id isn't actually a number. I defined my table to store integers, but instead I'm trying to store a string, a small oversight on my part. This was where the fun began. I now needed to migrate the database columns to use VARCHAR(255) instead of INT. This involved a few ALTER TABLE operations, which was a bit of a pain and required a fair bit of Googling. This was because my table had foreign keys attached so I couldn't directly alter the table without first removing these relations. I therefore had to remove these first then change the columns, and then add the foreign keys back. Here's how I did it:

```sql
-- Drop the foreign keys
ALTER TABLE social_relationships DROP CONSTRAINT social_relationships_follower_id_fkey;
ALTER TABLE social_relationships DROP CONSTRAINT social_relationships_followee_id_fkey;

-- Change column types to VARCHAR(255)
ALTER TABLE social_relationships
ALTER COLUMN follower_id TYPE VARCHAR(255) USING follower_id::VARCHAR,
ALTER COLUMN followee_id TYPE VARCHAR(255) USING followee_id::VARCHAR;

-- Re-add the foreign keys with the new type
ALTER TABLE social_relationships
ADD CONSTRAINT social_relationships_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES social_profiles(clerk_id) ON DELETE CASCADE,
ADD CONSTRAINT social_relationships_followee_id_fkey FOREIGN KEY (followee_id) REFERENCES social_profiles(clerk_id) ON DELETE CASCADE;
```

From here I created a button that would toggle between follow and unfollow when pressed running a function to either INSERT or DELETE the entry. I would then grab this information from the table and map it to the profile when the page loaded to keep an active count of who was following who and displaying that data to the user. This is when I ran into yet another problem. I needed to take this clerk_id stored in the table and convert it back to a username when displaying which was the easy part, but I also needed an id to reference when using .map() to supply a key to the div. Another oversight when making this table, I forgot to add a primary key for the table or rather for some reason I defined them with this: `PRIMARY KEY (follower_id, followee_id),`. When I tried adding it with ALTER TABLE, it gave me an error, and told me that multiple primary keys weren't allowed. This is where I realised it had decided to take follower_id and followee_id both as primary keys when I first created the table. So first I had to remove this relationship before adding my own id primary key. I did this with the following:

```sql
-- remove existing primary key
ALTER TABLE social_relationships DROP CONSTRAINT social_relationships_pkey;

-- Add the new id column and set it as the primary key
ALTER TABLE social_relationships
ADD COLUMN id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY;

```

Turns out I knew a lot less about SQL than I thought I did going into this project, but it has been a good learning experience to see what to do when issues like this do come up.
