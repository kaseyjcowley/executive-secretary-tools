"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  EnvelopeIcon,
  UsersIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
} from "@/components/ui/Icon";
import { Button } from "./ui/Button";

const navLinks = [
  {
    href: "/messages",
    label: "Messages",
    icon: <EnvelopeIcon className="w-5 h-5" />,
  },
  {
    href: "/interviews",
    label: "Interviews",
    icon: <CalendarDaysIcon className="w-5 h-5" />,
  },
  { href: "/youth", label: "Youth", icon: <UsersIcon className="w-5 h-5" /> },
  {
    href: "/templates",
    label: "Templates",
    icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
  },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-base-100 border-b border-base-300">
      <div className="navbar">
        <div className="navbar-start">
          <Link href="/" className="btn btn-ghost text-xl gap-2">
            <span className="text-primary">ES</span>
            <span className="hidden sm:inline">Executive Secretary</span>
          </Link>
        </div>

        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={
                    pathname === link.href ? "active bg-primary/10" : ""
                  }
                >
                  {link.icon}
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="navbar-end gap-2">
          <Button variant="ghost" size="sm">
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
