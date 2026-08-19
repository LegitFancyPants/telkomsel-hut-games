import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Platform Game Pos-to-Pos",
  description: "Platform permainan interaktif rally games dengan PIN Gate & Real-time Leaderboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className={`${inter.variable} antialiased bg-slate-950 text-slate-100 min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
