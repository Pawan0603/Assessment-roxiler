"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { useAuth } from "@/lib/auth";
import { api } from "@/lib/store";

import { Button } from "@/components/ui/button";
import {
  LogOut,
  Store,
  LayoutDashboard,
  Users,
  KeyRound,
  Menu,
  X,
} from "lucide-react";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);

  const links: { to: string; label: string; icon: ReactNode }[] = [];

  if (user?.role === "admin") {
    links.push(
      { to: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
      { to: "/admin/users", label: "Users", icon: <Users className="h-4 w-4" /> },
      { to: "/admin/stores", label: "Stores", icon: <Store className="h-4 w-4" /> }
    );
  }

  if (user?.role === "user") {
    links.push({
      to: "/stores",
      label: "Stores",
      icon: <Store className="h-4 w-4" />,
    });
  }

  if (user?.role === "owner") {
    links.push({
      to: "/owner",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    });
  }

  if (user) {
    links.push({
      to: "/account/password",
      label: "Password",
      icon: <KeyRound className="h-4 w-4" />,
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Store className="h-4 w-4" />
            </div>
            <span className="hidden sm:inline">RateMyStore</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                href={l.to}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === l.to
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {l.icon}
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden text-sm text-muted-foreground lg:inline">
                  {user.email} · {user.role}
                </span>

                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="mr-1 h-4 w-4" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>

                <Link href="/signup">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setOpen(!open)}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {open && user && (
          <div className="border-t bg-card md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col px-4 py-2">
              {links.map((l) => (
                <Link
                  key={l.to}
                  href={l.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                >
                  {l.icon}
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}