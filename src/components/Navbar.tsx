"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconMail,
  IconUsers,
  IconUser,
  IconMusic,
  IconFile,
} from "@/components/ui/Icons";
import { MobileNav } from "./MobileNav";

const navLinks = [
  { href: "/messages", label: "Messages" },
  { href: "/interviews", label: "Interviews" },
  { href: "/youth", label: "Youth" },
  { href: "/conductors", label: "Conductors" },
  { href: "/templates", label: "Templates" },
];

export function Navbar() {
  const pathname = usePathname();

  const renderPageIcon = () => {
    if (pathname.startsWith("/interviews")) {
      return <IconUsers className="w-5 h-5 text-blue-600" />;
    }
    if (pathname.startsWith("/youth")) {
      return <IconUser className="w-5 h-5 text-blue-600" />;
    }
    if (pathname.startsWith("/conductors")) {
      return <IconMusic className="w-5 h-5 text-blue-600" />;
    }
    if (pathname.startsWith("/templates")) {
      return <IconFile className="w-5 h-5 text-blue-600" />;
    }
    return <IconMail className="w-5 h-5 text-blue-600" />;
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3">
          <MobileNav />
          <Link href="/messages" className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              {renderPageIcon()}
            </div>
            <span className="hidden sm:block text-lg font-semibold text-gray-900">
              Executive Secretary Tools
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
