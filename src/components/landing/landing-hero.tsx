"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { GridBackground } from "@/components/ui/grid-background";
import { ShineText } from "@/components/ui/sparkles-text";
import { useAuth } from "@/components/auth-provider";

export function LandingHero() {
  const { user, loading } = useAuth();

  return (
    <section className="relative isolate overflow-hidden">
      <GridBackground />

      <div className="container mx-auto max-w-5xl px-6 pt-16 pb-12 md:pt-28 md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center gap-6"
        >
          <Badge variant="outline" className="font-mono text-xs gap-1.5 backdrop-blur">
            <Rocket className="size-3 text-primary" />
            v0.1 — Built on career-ops CLI
          </Badge>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Your AI{" "}
            <ShineText>job-search</ShineText>
            {" "}command center
          </h1>

          <p className="text-base md:text-xl text-muted-foreground max-w-2xl">
            Paste a job link. Get a structured evaluation, tailored CV, and tracker entry — in seconds.
            Powered by Claude, Perplexity, Gemini, and GPT-4o.
          </p>

          {!loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 mt-2"
            >
              {user ? (
                <>
                  <Link href="/chat" className={buttonVariants({ size: "lg" }) + " gap-2 px-6"}>
                    Open chat
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link href="/tracker" className={buttonVariants({ size: "lg", variant: "outline" }) + " px-6"}>
                    Open tracker
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className={buttonVariants({ size: "lg" }) + " gap-2 px-6"}>
                    Get started — free
                    <ArrowRight className="size-4" />
                  </Link>
                  <a
                    href="https://github.com/santifer/career-ops"
                    target="_blank"
                    rel="noreferrer"
                    className={buttonVariants({ size: "lg", variant: "outline" }) + " px-6"}
                  >
                    See the CLI repo
                  </a>
                </>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
