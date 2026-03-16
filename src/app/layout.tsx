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
      <body className={`${inter.variable} font-sans`}>
        <Providers>
          <header className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 bg-slate-50">
            <div className="p-2 bg-blue-100 rounded-lg">
              <IconClock className="w-6 h-6 text-blue-600" />
            </div>
            <LogoutButton />
          </header>
          {children}
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
