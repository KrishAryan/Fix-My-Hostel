import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import FixBot from "@/components/FixBot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fix My Hostel | Smart Complaint System",
  description: "Premium SaaS frontend for intelligent hostel facility management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-background text-foreground antialiased selection:bg-primary selection:text-white`}>
        {children}
        <FixBot />
      </body>
    </html>
  );
}
