"use client";

import { User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "firebase/auth";

export function IdentityCard({ user }: { user: User }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Identity</CardTitle>
        <CardDescription>From your Google account — read-only here.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? "User"} />
          <AvatarFallback><UserIcon className="size-6" /></AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="font-medium">{user.displayName ?? "—"}</p>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        </div>
      </CardContent>
    </Card>
  );
}
