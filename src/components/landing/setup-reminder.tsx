"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Circle, Rocket, Sparkles, Briefcase, User as UserIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { BorderBeam } from "@/components/ui/border-beam";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { useUserDoc } from "@/lib/firebase/use-user-doc";
import type { UserDoc } from "@/lib/firebase/users";

type ChecklistItem = { label: string; done: boolean };

function buildChecklist(userDoc: UserDoc | null): ChecklistItem[] {
  const hasCareerProfile =
    !!userDoc?.location?.trim() && typeof userDoc?.yearsExperience === "number";
  const hasJobPreferences =
    (userDoc?.targetRoles ?? []).length > 0 && (userDoc?.skills ?? []).length > 0;
  return [
    { label: "Full name", done: !!userDoc?.fullName?.trim() },
    { label: "Career profile", done: hasCareerProfile },
    { label: "Job preferences", done: hasJobPreferences },
    { label: "CV (markdown)", done: !!userDoc?.cvMarkdown && userDoc.cvMarkdown.length > 50 },
  ];
}

export function SetupReminder() {
  const { user, loading } = useAuth();
  const { data: userDoc, loading: docLoading } = useUserDoc(user?.uid);

  if (loading || docLoading || !user) return null;

  const checklist = buildChecklist(userDoc);
  const done = checklist.filter((i) => i.done).length;
  const total = checklist.length;
  const complete = done === total;

  return (
    <section className="container mx-auto max-w-5xl px-6 pb-12 md:pb-16">
      {complete ? (
        <AllSetCard firstName={userDoc?.fullName?.split(" ")[0] ?? ""} />
      ) : (
        <IncompleteCard checklist={checklist} done={done} total={total} />
      )}
    </section>
  );
}

/* ───────────────────── Incomplete state ───────────────────── */

function IncompleteCard({
  checklist,
  done,
  total,
}: {
  checklist: ChecklistItem[];
  done: number;
  total: number;
}) {
  const percent = Math.round((done / total) * 100);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border bg-card p-6 md:p-8 shadow-sm"
    >
      <BorderBeam duration={7} />

      <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <EyebrowBadge
            Icon={Rocket}
            text={`${done} / ${total} complete`}
            tone="primary"
          />
          <h3 className="mt-3 text-xl md:text-2xl font-bold tracking-tight">
            Finish setting up your profile
          </h3>
          <p className="mt-1 text-sm md:text-base text-muted-foreground max-w-xl">
            The more context Career-Ops has, the sharper every evaluation. Takes about 2 minutes — or
            upload your resume and we&apos;ll auto-fill it.
          </p>

          <ProgressBar percent={percent} className="mt-5" />
          <Checklist items={checklist} className="mt-4" />
        </div>

        <Link
          href="/profile"
          className={cn(buttonVariants({ size: "lg" }), "gap-2 px-6 shrink-0 self-start md:self-center")}
        >
          Continue setup
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </motion.div>
  );
}

/* ───────────────────── Complete state ───────────────────── */

function AllSetCard({ firstName }: { firstName: string }) {
  const greeting = firstName ? `You're all set, ${firstName}` : "You're all set";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border bg-card p-6 md:p-8 shadow-sm"
    >
      <BorderBeam duration={8} colorFrom="#10b981" colorTo="#06b6d4" />

      <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <EyebrowBadge Icon={Sparkles} text="Profile complete" tone="success" />
          <h3 className="mt-3 text-xl md:text-2xl font-bold tracking-tight">
            {greeting}. Time to land offers.
          </h3>
          <p className="mt-1 text-sm md:text-base text-muted-foreground max-w-xl">
            Your CV, target roles, and preferences are saved. Paste any job link into chat and the AI will
            evaluate fit, tailor your CV, and save it to your tracker — all in one flow.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <QuickLink href="/chat" Icon={Sparkles} label="Evaluate a job" />
            <QuickLink href="/tracker" Icon={Briefcase} label="View tracker" />
            <QuickLink href="/profile" Icon={UserIcon} label="Edit profile" />
          </div>
        </div>

        <Link
          href="/chat"
          className={cn(buttonVariants({ size: "lg" }), "gap-2 px-6 shrink-0 self-start md:self-center")}
        >
          Open chat
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </motion.div>
  );
}

/* ───────────────────── Shared pieces ───────────────────── */

function EyebrowBadge({
  Icon,
  text,
  tone,
}: {
  Icon: typeof Rocket;
  text: string;
  tone: "primary" | "success";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1",
        tone === "primary" && "border-primary/30 bg-primary/5",
        tone === "success" && "border-emerald-500/30 bg-emerald-500/5"
      )}
    >
      <Icon
        className={cn(
          "size-3",
          tone === "primary" && "text-primary",
          tone === "success" && "text-emerald-500"
        )}
      />
      <span
        className={cn(
          "font-mono text-[10px] uppercase tracking-wider",
          tone === "primary" && "text-primary",
          tone === "success" && "text-emerald-600 dark:text-emerald-400"
        )}
      >
        {text}
      </span>
    </div>
  );
}

function ProgressBar({ percent, className }: { percent: number; className?: string }) {
  return (
    <div className={className}>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary via-violet-500 to-cyan-500"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function Checklist({ items, className }: { items: ChecklistItem[]; className?: string }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-4", className)}>
      {items.map((item) => (
        <li
          key={item.label}
          className={cn(
            "flex items-center gap-2 text-sm",
            item.done ? "text-muted-foreground" : "text-foreground"
          )}
        >
          {item.done ? (
            <Check className="size-4 text-primary shrink-0" />
          ) : (
            <Circle className="size-4 text-muted-foreground shrink-0" />
          )}
          <span className={cn(item.done && "line-through decoration-muted-foreground/40")}>
            {item.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

function QuickLink({ href, Icon, label }: { href: string; Icon: typeof Rocket; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 px-3 py-1.5 text-sm transition-colors hover:bg-muted hover:text-foreground"
    >
      <Icon className="size-3.5" />
      {label}
    </Link>
  );
}
