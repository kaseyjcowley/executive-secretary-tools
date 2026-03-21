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

const pageNames: Record<string, string> = {
  "/": "Dashboard",
  "/messages": "Messages",
  "/interviews": "Interviews",
  "/youth": "Youth",
  "/youth/new": "New Youth",
  "/youth/import": "Import Youth",
  "/conductors": "Conductors",
  "/templates": "Templates",
};

export function Navbar() {
  const pathname = usePathname();
  const pageName = pageNames[pathname] || "Page";

  return (
    <header className="sticky top-0 z-40 bg-base-100 border-b border-base-300">
      <div className="navbar">
        <div className="navbar-start">
          <Link href="/" className="btn btn-ghost text-xl gap-2">
            <span className="text-primary font-bold">EST</span>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold leading-none hidden md:block">
              Executive Secretary Tools
            </h1>
            <span className="text-xs opacity-70">{pageName}</span>
          </div>
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
          <div className="dropdown dropdown-end lg:hidden">
            <label tabIndex={0} className="btn btn-ghost btn-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </label>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-50 p-2 shadow bg-base-100 rounded-box w-52"
            >
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
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
