"use client";

import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/auth-provider";
import { ProtectedPage } from "@/components/protected-page";
import { useUserDoc } from "@/lib/firebase/use-user-doc";
import { IdentityCard } from "@/components/profile/identity-card";
import { ProfileForm } from "@/components/profile/profile-form";
import { SignOutCard } from "@/components/profile/sign-out-card";
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton";

export default function ProfilePage() {
  return (
    <ProtectedPage fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </ProtectedPage>
  );
}

function ProfileContent() {
  const { user } = useAuth();
  const { data: userDoc, loading } = useUserDoc(user?.uid);

  if (!user) return null; // ProtectedPage guarantees this never renders
  if (loading) return <ProfileSkeleton />;

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        This data powers Career-Ops chat — evaluations, tailored CVs, and tracker entries are based on it.
      </p>

      <div className="mt-6 space-y-4">
        <IdentityCard user={user} />
        <ProfileForm user={user} userDoc={userDoc} />
      </div>

      <Separator className="my-8" />

      <SignOutCard />
    </main>
  );
}
