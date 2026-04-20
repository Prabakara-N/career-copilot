"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Rocket, MessageSquare, LogIn, LogOut, CircleUser, Briefcase, ShieldCheck, ShieldHalf } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "./auth-provider";

const NAV_ITEMS = [
  { href: "/profile", label: "Profile", icon: CircleUser },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/tracker", label: "Tracker", icon: Briefcase },
  { href: "/ats", label: "ATS analyzer", icon: ShieldHalf },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
] as const;

export function AppHeader() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  const initials = (user?.displayName ?? user?.email ?? "U")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Rocket className="size-4 text-primary" />
          Career-Ops
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {loading ? null : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Account menu"
                className="flex items-center gap-2 rounded-full outline-none ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
              >
                <Avatar className="size-8">
                  <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? "User"} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-medium">{user.displayName ?? "User"}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                {NAV_ITEMS.map((item) => (
                  <DropdownMenuItem key={item.href} onClick={() => router.push(item.href)}>
                    <item.icon className="mr-2 size-4" />
                    {item.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm">
                <LogIn className="size-3.5" />
                <span className="hidden sm:inline">Sign in</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
