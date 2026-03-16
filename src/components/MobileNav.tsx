"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconX, IconMenu } from "@/components/ui/Icons";

const navLinks = [
  { href: "/messages", label: "Messages", icon: "📬" },
  { href: "/interviews", label: "Interviews", icon: "📅" },
  { href: "/youth", label: "Youth", icon: "👦" },
  { href: "/conductors", label: "Conductors", icon: "🎵" },
  { href: "/templates", label: "Templates", icon: "📝" },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Open menu"
      >
        <IconMenu className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-0 left-0 w-64 h-full bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-semibold text-gray-900">Menu</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4">
              <ul className="space-y-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? "bg-blue-100 text-blue-700 font-medium"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span className="text-lg">{link.icon}</span>
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
