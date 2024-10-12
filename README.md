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

### Likes/Dislikes

From here a had a look at likes/dislikes logic. Previously I handled this in a client component, but similarly to the rest of this project, I'm going to attempt to handle almost everything on the server. Little did I know at this stage that this would be a huge headache to handle. previosuly when I handled likes and dislikes I utilised useEffect and useState to manage the rendering and fetching the data from api routes. This time I wanted to handle it all in server components with the most minimal logic being sent to the client as possible. To start this process I created a new table called social_likes_dislikes, keeping the social prefix to differentiate between existing tables in my database. It contained a primary key, a refernce to the clerk_id, post_id, a boolean determining likes/dislikes and some foreign keys to link it all together. Then I modified the existing social_posts table to include 2 extra columns, one for likes and one for dislikes.

This is where I ran into my first problem. When making my request, I needed a way of referencing the current postId. Since I broke my logic to handle likes, unlikes, dislikes and undislikes into 4 seperate functions which would be passed to the client based on the result of a ternary operator. These functions would look something like this:

```tsx
const handleUndislike = async () => {
  "use server";
  const db = connect();
  try {
    await db.query(
      `DELETE FROM social_likes_dislikes WHERE clerk_id = $1 AND post_id = $2 AND is_like = $3`,
      [viewerData.clerk_id, postId, false]
    );
  } catch (error) {
    console.error(error);
  } finally {
    revalidatePath(`/u/${username}`);
  }
};
```

The problem is getting that postId back to this function. This would've been very simple with a useState, however I decided I wasn't going to handle my logic this way. So instead I needed to pass this data back to the function in the form of a parameter. This param would look something like `post.id: number`. Then I just needed to work out where to get this prop from, and the only place where I could access this was within the .map(). This is because prior to running the map postsData.rows would return an array of objects. Without mapping them I had no way of directly accessing the specific post.id I needed here. Under the map I could then use my ternary operator to pass this prop back to the function by doing this:

```jsx
const onClickLike = post.isLiked
  ? () => handleUnlike(post.id)
  : () => handleLike(post.id);
const onClickDislike = post.isDisliked
  ? () => handleUndislike(post.id)
  : () => handleDislike(post.id);
```

Using callback functions here to ensure that they aren't called early. This solution looked good on paper but when it came down to testing it would thrown an error.

```
Error: Only plain objects, and a few built-ins, can be passed to Server Actions. Classes or null prototypes are not supported.
```

This is the same error I ran into previously when handling followers and followees which I previously resolved by using a form to submit instead of just using a button directly. In this instance I was doing that, however I wasn't using the formData given back, and was instead treating it as if it was just a button component. So instead I decided to utilise the FormData to pass data back to the server. Instead of passing the post.id back as a prop in the function I can pass down post.id to the form component (which is acting as my button) and passing that back through the formData to my function. To do this I created a hidden input Form.Field which would hold my value of postId, so that when it's submitted it can be passed to the function as a parameter.

While here, I decided to restructure all of my functions to handling either likes or dislikes. From here I can use the formData isLike boolean to track whether it has been liked or not and use truthy falsy to determin if the action needed is to INSERT or DELETE.

This is when I ran into my next problem, the boolean action islike given to my component as a prop was returning as a `Promise<boolean>` and not a boolean as I expected (bless typescript for telling me this). This is because I was using an await db.query() to fetch from the database to determin this value. Since it hasn't resolved when the button is given the data, it's still a Promise. So after another round of googling, I found a way of resolving the Promise before passing it down, giving me the expected boolean. The thread I was reading suggesting using something called await Promise.all. I'm still not entirely sure how it works exactly, but it essentially resolved all my promises before returning them. I ran this through the map so it would do this for each post. I then mapped through this under my return to give me access to these variables under my tsx return for my ProfilePosts.tsx component.

Looking back, this simple concept was a huge headache to deal with. A concept I've created many times in the past was made very difficult by the server side constraints I put on myself, but thankfully I managed to get it working while still handling the majority of the work on the server.

One bug so far is that you can't like and dislike at the same time, which is fine, but usually when interacting with these buttons, clicking the opposing button changes the like to a dislike. I probably need to modify my SQL statements to handle likes and dislikes transitions better.

### Profile setup redirect

Just before working on styling I quickly tackled page redirects if the profile setup hasn't been completed. This was necessary because visiting a users profile page without a setup profile, so without rewriting how the profile information is gathered, I decided to instead force the user to fill in this information. I initially made this under the RootLayout function in layout.tsx, but then realise this wasn't executing the functions correctly. Instead I moved this to my fetch.ts file and modified the logic slightly. Since my fetch.ts file is outside the app router, I don't have access to auth() or headers() so both of these values needed are passed in as params. If no rows are returned and you are not under the /sign-in, /sign-up or /profile routes then you will redirect back to the profile. Once this information is given, you can continue visiting the other pages.

### Styling

With everything I needed to complete the project thrown on the page somewhere, it was time to make it a little more presentable. Luckily, since I was using Radix for some of my elements, I could simply utilise some of this styling for a few of my elements. For elements not using this, I turned my attention to past projects and grabbed some of this styling to quickly get this roughly in the correct place. If some elements aren't exactly where I need them to be, I can move around the div tags to make it fit a little better. I will also try keep my styles scoped as much as possible too, utilising module.css files as best I can.

I decided to also include some React Icons from https://react-icons.github.io/react-icons/. I placed these under my LikeDislikeButton to act as the icons for my buttons.

## Requirements

For this project the following requirements were completed:

- Sign-up and login with Clerk

- Error page viewable if page doesn't exist.

- Utilised Radix to create components (specifically forms) in ModularForm, LikeDislikeButton and FollowButton.

- Users can create their own user profile where this information is stored in its own table.

- Users can create posts which are viewable in a global comments environment. User specific comments are viewable on their individual profiles.

Additional features added to the project include:

- Clicking on usernames in the global comments section redirects to that users profile.

- Users can follow/unfollow each other and this information is displayed on each profile.

- Likes and dislikes can be given to individual posts by visiting their profile.

- Added redirects back to the /profile route if setup hasn't been finished.

Something I would probably change in the future is how I'm handling the likes and dislike buttons. Currently they heavily rely on server side functions which are currently not very reusable. I wanted to avoid using api routes for this project, but it seems that when handling the logic for these buttons this way would've probably been better. This would've allowed me to place these buttons in more than one location without rewriting all of my logic. I could alternatively move them to my fetch.ts file and just call them at their respective locations. This is because I did also want to place them under the global posts, but without copying everthing over, this is less than ideal.
