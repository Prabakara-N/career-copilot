"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { useAuth } from "@/components/auth-provider";

export function CtaSection() {
  const { user } = useAuth();
  return (
    <AuroraBackground className="border-y">
      <section className="container mx-auto max-w-4xl px-6 py-16 md:py-24 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold tracking-tight"
        >
          Stop spamming applications. Start landing them.
        </motion.h2>
        <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Quality over quantity. The AI flags low-fit roles, drafts tailored applications, and tracks every step — so you spend your time on the few that matter.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href={user ? "/chat" : "/login"}
            className={buttonVariants({ size: "lg" }) + " gap-2 px-7"}
          >
            {user ? "Open chat" : "Sign in to start"}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </AuroraBackground>
  );
}
