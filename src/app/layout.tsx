import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { IconClock } from "@/components/ui/Icons";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Executive Secretary Tools",
  description: "A suite of tools to magnify your executive secretary calling",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="hidden md:flex justify-end px-4 sm:px-6 lg:px-8 py-2 bg-slate-50">
            <LogoutButton />
          </div>
          <main className="min-h-screen bg-gray-50">{children}</main>
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
