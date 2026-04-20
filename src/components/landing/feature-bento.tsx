"use client";

import { motion } from "framer-motion";
import { type LucideIcon, Brain, FileText, Search, Briefcase, Sparkles, Boxes } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Feature = {
  title: string;
  description: string;
  badge: string;
  Icon: LucideIcon;
  span?: "wide" | "full" | "default";
};

/**
 * Layout (3-col on lg):
 *  Row 1: [Evaluate (col-span-2)] [Tailor]
 *  Row 2: [Research]              [Cover]   [Track]
 *  Row 3: [Multi-LLM (col-span-3, full)]
 *
 * No empty cells. Mobile collapses to 1 col.
 */
const FEATURES: Feature[] = [
  {
    title: "Evaluate any JD",
    description:
      "Paste a job link or description. Get a structured A-G score, gap analysis, and STAR stories — auto-saved to /reports for revisits.",
    badge: "Claude Sonnet 4.5",
    Icon: Brain,
    span: "wide",
  },
  {
    title: "Tailor your CV",
    description: "JD-tailored, ATS-clean PDF in seconds. Keywords woven naturally — never invented.",
    badge: "react-pdf",
    Icon: FileText,
  },
  {
    title: "Real-time research",
    description: "Funding, founders, Glassdoor signal, recent news. Live web search — not training data.",
    badge: "Perplexity Sonar",
    Icon: Search,
  },
  {
    title: "Cover letters",
    description: "Tight, JD-tailored, downloadable. No filler, no clichés.",
    badge: "Claude",
    Icon: Sparkles,
  },
  {
    title: "Track every application",
    description: "Realtime status, follow-ups, response rate, search, link to original report.",
    badge: "Firestore",
    Icon: Briefcase,
  },
  {
    title: "Multi-LLM router",
    description:
      "Best model per task — Claude for writing & evaluation, Perplexity for live web research, Gemini Flash for cheap batch triage, GPT-4o for vision (parsing screenshots of JDs).",
    badge: "smart routing",
    Icon: Boxes,
    span: "full",
  },
];

export function FeatureBento() {
  return (
    <section className="container mx-auto max-w-6xl px-6 py-12 md:py-20">
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="text-2xl md:text-3xl font-bold tracking-tight text-center"
      >
        One chat. Every step of the search.
      </motion.h2>
      <p className="mt-2 text-center text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
        Each feature below is a tool the AI calls. You just describe what you want.
      </p>

      <div className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(180px,_auto)] gap-3">
        {FEATURES.map((f, i) => (
          <FeatureCard key={f.title} feature={f} index={i} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.05 * index }}
      className={cn(
        feature.span === "wide" && "sm:col-span-2 lg:col-span-2",
        feature.span === "full" && "sm:col-span-2 lg:col-span-3"
      )}
    >
      <Card className="group h-full p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30">
        <div className="flex items-start justify-between gap-2">
          <div className="rounded-md bg-primary/10 p-2 ring-1 ring-primary/20">
            <feature.Icon className="size-4 text-primary" />
          </div>
          <Badge variant="outline" className="font-mono text-[10px]">
            {feature.badge}
          </Badge>
        </div>
        <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
      </Card>
    </motion.div>
  );
}
