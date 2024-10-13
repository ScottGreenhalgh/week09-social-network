import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Noto_Serif, Roboto, Lato, Play } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Basic Social Network",
  description:
    "A basic social media app powered by Clerk | Basic Social Network",
};

const noto = Noto_Serif({
  subsets: ["latin"],
  style: "normal",
  weight: "400",
  variable: "--font-noto",
});

const roboto = Roboto({
  subsets: ["latin"],
  style: "normal",
  weight: "400",
  variable: "--font-roboto",
});

const lato = Lato({
  subsets: ["latin"],
  style: "normal",
  weight: "400",
  variable: "--font-lato",
});

const play = Play({
  subsets: ["latin"],
  style: "normal",
  weight: "400",
  variable: "--font-play",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${noto.variable} ${roboto.variable} ${lato.variable} ${play.variable} antialiased`}
        >
          <Header />
          <main>{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
