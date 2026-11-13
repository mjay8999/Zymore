import type { Metadata } from "next";
import { connection } from "next/server";
import { Manrope, Urbanist } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-urbanist",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zymore.tech"),
  title: {
    default: "Zymore Research | Independent AI Safety & Governance",
    template: "%s | Zymore",
  },
  description:
    "Independent technical research in AI governance, applied safety, AI welfare, and secure LLM infrastructure.",
  alternates: {
    canonical: "/",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();

  return (
    <html lang="en">
      <body className={`${manrope.variable} ${urbanist.variable}`}>{children}</body>
    </html>
  );
}
