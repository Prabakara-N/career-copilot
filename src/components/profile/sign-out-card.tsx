"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";

export function SignOutCard() {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Account</CardTitle>
        <CardDescription>Sign out of this device. You can sign back in anytime.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" onClick={handleSignOut} className="gap-2 px-5">
          <LogOut className="size-4" />
          Sign out
        </Button>
      </CardContent>
    </Card>
  );
}
