"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, Check, Rocket, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/forms/text-field";
import { TextareaField } from "@/components/forms/textarea-field";
import { ChipsInput } from "@/components/forms/chips-input";
import { PillToggle } from "@/components/forms/pill-toggle";
import { ResumeUploadButton } from "@/components/forms/resume-upload-button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { useUserDoc, updateUserDoc } from "@/lib/firebase/use-user-doc";
import {
  ProfileFormSchema,
  emptyProfileForm,
  type ProfileFormValues,
} from "@/lib/schemas/profile-form";
import { resumeParsedToFormValues } from "@/lib/schemas/resume-to-form";
import type { ResumeParsed } from "@/lib/schemas/resume-parsed";
import { WORK_MODE_OPTIONS, JOB_TYPE_OPTIONS } from "./options";

const STEPS = [
  { key: "upload", label: "Resume" },
  { key: "basics", label: "Basics" },
  { key: "targets", label: "Targets" },
  { key: "cv", label: "CV" },
] as const;

type Form = UseFormReturn<ProfileFormValues>;

export function FirstTimeSetupDialog() {
  const { user } = useAuth();
  const { data: userDoc, loading: docLoading } = useUserDoc(user?.uid);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const initialized = useRef(false);
  const decided = useRef(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: emptyProfileForm(),
    mode: "onBlur",
  });

  useEffect(() => {
    if (!user || docLoading || decided.current) return;
    decided.current = true;
    const isIncomplete = !userDoc?.cvMarkdown || !userDoc?.fullName || (userDoc?.targetRoles ?? []).length === 0;
    if (isIncomplete) setOpen(true);
    if (!initialized.current) {
      form.reset({
        fullName: userDoc?.fullName ?? user.displayName ?? "",
        phone: userDoc?.phone ?? "",
        location: userDoc?.location ?? "",
        yearsExperience: userDoc?.yearsExperience?.toString() ?? "",
        linkedinUrl: userDoc?.linkedinUrl ?? "",
        portfolioUrl: userDoc?.portfolioUrl ?? "",
        githubUrl: userDoc?.githubUrl ?? "",
        targetRoles: userDoc?.targetRoles ?? [],
        skills: userDoc?.skills ?? [],
        targetSalary: userDoc?.targetSalary ?? "",
        workModes: userDoc?.workModes ?? [],
        jobTypes: userDoc?.jobTypes ?? [],
        openToRelocation: userDoc?.openToRelocation ?? false,
        noticePeriod: userDoc?.noticePeriod ?? "",
        cvMarkdown: userDoc?.cvMarkdown ?? "",
      });
      initialized.current = true;
    }
  }, [user, userDoc, docLoading, form]);

  const persist = async (): Promise<boolean> => {
    if (!user) return false;
    const v = form.getValues();
    try {
      const yoe = parseFloat(v.yearsExperience);
      await updateUserDoc(user.uid, {
        fullName: v.fullName,
        phone: v.phone || undefined,
        location: v.location || undefined,
        yearsExperience: Number.isFinite(yoe) ? yoe : undefined,
        linkedinUrl: v.linkedinUrl || undefined,
        portfolioUrl: v.portfolioUrl || undefined,
        githubUrl: v.githubUrl || undefined,
        targetRoles: v.targetRoles,
        skills: v.skills,
        targetSalary: v.targetSalary || undefined,
        workModes: v.workModes,
        jobTypes: v.jobTypes,
        openToRelocation: v.openToRelocation,
        noticePeriod: v.noticePeriod || undefined,
        cvMarkdown: v.cvMarkdown,
      });
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
      return false;
    }
  };

  const next = async () => {
    if (step > 0) {
      const ok = await form.trigger();
      if (!ok) return;
    }
    const saved = await persist();
    if (!saved) return;
    if (step === STEPS.length - 1) {
      toast.success("Profile saved — ready to evaluate jobs.");
      setOpen(false);
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="!max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="size-5 text-primary" />
            Quick setup
          </DialogTitle>
          <DialogDescription>
            Upload your resume and the AI pre-fills everything. Edit anything before saving.
          </DialogDescription>
        </DialogHeader>

        <Stepper step={step} />

        <div className="mt-2">
          {step === 0 && <UploadStep form={form} onNext={() => setStep(1)} />}
          {step === 1 && <BasicsStep form={form} />}
          {step === 2 && <TargetsStep form={form} />}
          {step === 3 && <CvStep form={form} />}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            I&apos;ll do this later
          </Button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button variant="outline" size="sm" onClick={() => setStep((s) => s - 1)} className="gap-1">
                <ChevronLeft className="size-4" />
                Back
              </Button>
            )}
            <Button onClick={next} size="sm" disabled={form.formState.isSubmitting} className="gap-1 px-5">
              {form.formState.isSubmitting ? "Saving…" : step === STEPS.length - 1 ? "Finish" : "Next"}
              {step < STEPS.length - 1 && <ChevronRight className="size-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-2">
      {STEPS.map((s, i) => (
        <li key={s.key} className="flex items-center gap-2 flex-1 last:flex-initial">
          <div className="flex items-center gap-1.5 shrink-0">
            <div
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                i < step && "border-primary bg-primary text-primary-foreground",
                i === step && "border-primary text-primary",
                i > step && "border-muted text-muted-foreground"
              )}
            >
              {i < step ? <Check className="size-3" /> : i + 1}
            </div>
            <span
              className={cn(
                "text-xs whitespace-nowrap",
                i === step ? "font-medium" : "text-muted-foreground",
                i !== step && "hidden sm:inline"
              )}
            >
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="h-px flex-1 bg-border min-w-[12px]" />
          )}
        </li>
      ))}
    </ol>
  );
}

function UploadStep({ form, onNext }: { form: Form; onNext: () => void }) {
  const handleParsed = (parsed: ResumeParsed) => {
    const patch = resumeParsedToFormValues(parsed);
    const current = form.getValues();
    form.reset({ ...current, ...patch }, { keepDefaultValues: true });
    setTimeout(onNext, 400);
  };
  return (
    <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 md:p-10 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
        <Upload className="size-6 text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">Upload your resume</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
        PDF, TXT, or Markdown. The AI extracts your name, links, skills, target roles, and a clean markdown CV automatically.
      </p>
      <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
        <ResumeUploadButton onParsed={handleParsed} size="lg" label="Choose file" />
        <Button variant="ghost" size="lg" onClick={onNext}>Skip and fill manually</Button>
      </div>
    </div>
  );
}

function BasicsStep({ form }: { form: Form }) {
  const { register, formState: { errors } } = form;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField label="Full name" required {...register("fullName")} error={errors.fullName?.message} placeholder="Your full name" />
        <TextField label="Phone" {...register("phone")} error={errors.phone?.message} placeholder="+91 …" />
        <TextField label="Location" {...register("location")} error={errors.location?.message} placeholder="City, Country" />
        <TextField label="Years of experience" {...register("yearsExperience")} error={errors.yearsExperience?.message} placeholder="2.5" inputMode="decimal" />
      </div>
      <TextField label="LinkedIn URL" {...register("linkedinUrl")} error={errors.linkedinUrl?.message} placeholder="https://linkedin.com/in/…" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField label="Portfolio URL" {...register("portfolioUrl")} error={errors.portfolioUrl?.message} placeholder="https://yourdomain.dev" />
        <TextField label="GitHub URL" {...register("githubUrl")} error={errors.githubUrl?.message} placeholder="https://github.com/handle" />
      </div>
    </div>
  );
}

function TargetsStep({ form }: { form: Form }) {
  const { register, watch, setValue, formState: { errors } } = form;
  const targetRoles = watch("targetRoles") ?? [];
  const skills = watch("skills") ?? [];
  const workModes = watch("workModes") ?? [];
  const jobTypes = watch("jobTypes") ?? [];
  return (
    <div className="space-y-4">
      <ChipsInput
        label="Target roles"
        value={targetRoles}
        onChange={(v) => setValue("targetRoles", v, { shouldDirty: true })}
        placeholder="Type a role and press Enter — e.g. Frontend Engineer"
        error={errors.targetRoles?.message}
      />
      <ChipsInput
        label="Skills"
        value={skills}
        onChange={(v) => setValue("skills", v, { shouldDirty: true })}
        placeholder="Type a skill and press Enter — e.g. React, TypeScript"
        error={errors.skills?.message}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField label="Target salary" {...register("targetSalary")} error={errors.targetSalary?.message} placeholder="₹15-25 LPA or $120k-150k" />
        <TextField label="Notice period" {...register("noticePeriod")} error={errors.noticePeriod?.message} placeholder="30 days / Immediate" />
      </div>
      <PillToggle
        label="Work mode"
        options={WORK_MODE_OPTIONS}
        value={workModes}
        onChange={(v) => setValue("workModes", v, { shouldDirty: true })}
        hint="Multi-select — pick all that apply."
      />
      <PillToggle
        label="Job type"
        options={JOB_TYPE_OPTIONS}
        value={jobTypes}
        onChange={(v) => setValue("jobTypes", v, { shouldDirty: true })}
      />
    </div>
  );
}

function CvStep({ form }: { form: Form }) {
  const { register, setValue, watch, formState: { errors } } = form;
  const cv = watch("cvMarkdown");
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {cv ? "Review the AI-generated markdown — edit as needed." : "Upload or paste your CV as markdown."}
        </p>
        <ResumeUploadButton
          size="sm"
          label="Re-upload"
          onParsed={(parsed) => {
            const patch = resumeParsedToFormValues(parsed);
            Object.entries(patch).forEach(([k, v]) =>
              setValue(k as keyof ProfileFormValues, v as never, { shouldDirty: true })
            );
          }}
        />
      </div>
      <TextareaField
        {...register("cvMarkdown")}
        placeholder="# Your Name&#10;&#10;## Summary&#10;…"
        className="min-h-[320px] font-mono text-xs"
        error={errors.cvMarkdown?.message}
      />
    </div>
  );
}
