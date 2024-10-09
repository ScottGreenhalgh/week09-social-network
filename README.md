# Basic Social Network

This project involves creating a social network utilising Clerk and Radix UI elements. Clerk operates as a login system which heavily simplifies the method I was using in my past project. Using my clerk user id I can retrieve data from the login related to that account without needing to store it in a database first. Using Radix I can create elements rendering on my page quickly and easily.

### Project Setup

To setup this project I used `npx create-next-app@latest` and selected Typescript. Having just been introduced to typed variables I wanted to see if I could utilise them in this project too. From here deleted the fonts folder and removed them from the layout.tsx file. I then ran `npm i pg` and created a utils folder containing my connect.ts file that linked to my db. I then created a env.local file and placed my db url inside.

### Clerk

To setup Clerk, I went to their website and created a new project. I then grabbed the api keys and placed these inside my env file. From here I ran `npm i @clerk/nextjs` and followed this guide: https://clerk.com/docs/quickstarts/nextjs. From here I started work on creating the custom sign in/ sign up pages, for this I used this guide: https://clerk.com/docs/references/nextjs/custom-signup-signin-pages.

### Forms

During my last project, I realised how often I needed to use forms and their submissions to make database queries. Based on this I wanted to create a form component that was modular, so I could quickly create a form on any page by simply by using the component and passing the data the form needed to gather using props. Also, instead of passing the data over to an src/api location, I wanted to be able to handle the database requests on each individual page using the handleFormSubmit function with "use server". This would be a little more elegant in my opinion and should in theory perform better.

To start this process I went over to https://www.radix-ui.com/primitives/docs/components/form and grabbed their example usage of the form. I then followed the installation instructions to insure I had the correct modules.
