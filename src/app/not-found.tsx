"use client";

import Link from "next/link";
import { Compass, Home, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";

const SUGGESTED_LINKS = [
  { href: "/", label: "Home", description: "Back to the landing page", Icon: Home },
  { href: "/chat", label: "Chat", description: "Start a new evaluation", Icon: Sparkles },
];

export default function NotFound() {
  const { user } = useAuth();

  const links = user
    ? [
        ...SUGGESTED_LINKS,
        { href: "/tracker", label: "Tracker", description: "Your applications", Icon: Compass },
        { href: "/profile", label: "Profile", description: "Your account", Icon: Compass },
      ]
    : SUGGESTED_LINKS;

  return (
    <main className="container mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="font-mono text-2xl md:text-3xl font-semibold text-primary">404</p>
        <h1 className="mt-3 text-5xl md:text-7xl font-bold tracking-tight">Lost the trail.</h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
          That page doesn&apos;t exist — or it walked off looking for a better job. Try one of these instead:
        </p>
      </motion.div>

      <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {links.map((l, i) => (
          <motion.div
            key={l.href}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
          >
            <Link href={l.href} className="block">
              <Card className="text-left transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="rounded-md bg-muted/50 p-2">
                    <l.Icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{l.label}</p>
                    <p className="text-xs text-muted-foreground">{l.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <Link href="/" className={`mt-8 ${buttonVariants({ size: "lg" })}`}>
        <Home className="size-4" />
        Take me home
      </Link>
    </main>
  );
}
