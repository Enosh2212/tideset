"use client";
import { PublicNavbar, type AuthUser } from "./PublicNavbar";
export function AppNavbar({ user }: { user?: AuthUser | null }) {
  return <PublicNavbar initialUser={user} workspace />;
}
