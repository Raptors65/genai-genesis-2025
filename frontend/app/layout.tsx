"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isTutorPage = pathname === "/tutor";

  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className={isTutorPage ? "" : "pt-16"}>{children}</main>
      </body>
    </html>
  );
}
