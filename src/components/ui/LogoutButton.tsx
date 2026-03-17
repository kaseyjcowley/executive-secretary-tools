"use client";

import { useSession, signOut } from "next-auth/react";

export function LogoutButton() {
  const { data: session, status } = useSession();

  if (status === "loading" || !session) {
    return null;
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-slate-600 hover:text-slate-900"
    >
      Sign out
    </button>
  );
}
