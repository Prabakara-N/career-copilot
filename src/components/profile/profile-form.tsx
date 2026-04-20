"use client";

import { useEffect, useRef } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TextField } from "@/components/forms/text-field";
import { TextareaField } from "@/components/forms/textarea-field";
import { ChipsInput } from "@/components/forms/chips-input";
import { PillToggle } from "@/components/forms/pill-toggle";
import { ResumeUploadButton } from "@/components/forms/resume-upload-button";
import { toast } from "sonner";
import {
  ProfileFormSchema,
  emptyProfileForm,
  type ProfileFormValues,
} from "@/lib/schemas/profile-form";
import { resumeParsedToFormValues } from "@/lib/schemas/resume-to-form";
import type { ResumeParsed } from "@/lib/schemas/resume-parsed";
import { updateUserDoc } from "@/lib/firebase/use-user-doc";
import type { UserDoc } from "@/lib/firebase/users";
import type { User } from "firebase/auth";
import { WORK_MODE_OPTIONS, JOB_TYPE_OPTIONS } from "@/components/setup/options";

type Props = { user: User; userDoc: UserDoc | null };

function defaultsFromUserDoc(user: User, userDoc: UserDoc | null): ProfileFormValues {
  return {
    ...emptyProfileForm(),
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
  };
}

export function ProfileForm({ user, userDoc }: Props) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: defaultsFromUserDoc(user, null),
    mode: "onBlur",
  });

  const initialized = useRef(false);
  useEffect(() => {
    if (!userDoc || initialized.current) return;
    form.reset(defaultsFromUserDoc(user, userDoc));
    initialized.current = true;
  }, [userDoc, user, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      const yoe = parseFloat(values.yearsExperience);
      await updateUserDoc(user.uid, {
        fullName: values.fullName,
        phone: values.phone || undefined,
        location: values.location || undefined,
        yearsExperience: Number.isFinite(yoe) ? yoe : undefined,
        linkedinUrl: values.linkedinUrl || undefined,
        portfolioUrl: values.portfolioUrl || undefined,
        githubUrl: values.githubUrl || undefined,
        targetRoles: values.targetRoles,
        skills: values.skills,
        targetSalary: values.targetSalary || undefined,
        workModes: values.workModes,
        jobTypes: values.jobTypes,
        openToRelocation: values.openToRelocation,
        noticePeriod: values.noticePeriod || undefined,
        cvMarkdown: values.cvMarkdown,
      });
      form.reset(values);
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  const handleResumeParsed = (parsed: ResumeParsed) => {
    const patch = resumeParsedToFormValues(parsed);
    Object.entries(patch).forEach(([k, v]) =>
      form.setValue(k as keyof ProfileFormValues, v as never, { shouldDirty: true })
    );
    toast.success("Fields auto-filled from resume.");
  };

  const { isSubmitting, isDirty } = form.formState;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
      <ResumeImportCard onParsed={handleResumeParsed} />
      <CareerProfileCard form={form} />
      <PreferencesCard form={form} />
      <CvCard form={form} onParsed={handleResumeParsed} />
      <SaveBar isSubmitting={isSubmitting} isDirty={isDirty} />
    </form>
  );
}

function ResumeImportCard({ onParsed }: { onParsed: (p: ResumeParsed) => void }) {
  return (
    <Card className="border-dashed border-primary/30 bg-primary/5">
      <CardContent className="flex flex-wrap items-center gap-4 p-5">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20 shrink-0">
          <Upload className="size-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Import from resume</p>
          <p className="text-xs text-muted-foreground">
            Upload a PDF — the AI auto-fills name, links, skills, target roles, and CV markdown.
          </p>
        </div>
        <ResumeUploadButton onParsed={onParsed} size="sm" />
      </CardContent>
    </Card>
  );
}

function CareerProfileCard({ form }: { form: UseFormReturn<ProfileFormValues> }) {
  const { register, formState: { errors } } = form;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Career profile</CardTitle>
        <CardDescription>Core facts used in every evaluation and tailored CV.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Full name" required {...register("fullName")} error={errors.fullName?.message} placeholder="Your full name" />
        <TextField label="Phone" {...register("phone")} error={errors.phone?.message} placeholder="+91 …" />
        <TextField label="Location" {...register("location")} error={errors.location?.message} placeholder="City, Country" />
        <TextField label="Years of experience" {...register("yearsExperience")} error={errors.yearsExperience?.message} placeholder="2.5" inputMode="decimal" />
        <div className="sm:col-span-2">
          <TextField label="LinkedIn URL" {...register("linkedinUrl")} error={errors.linkedinUrl?.message} placeholder="https://linkedin.com/in/…" />
        </div>
        <TextField label="Portfolio URL" {...register("portfolioUrl")} error={errors.portfolioUrl?.message} placeholder="https://yourdomain.dev" />
        <TextField label="GitHub URL" {...register("githubUrl")} error={errors.githubUrl?.message} placeholder="https://github.com/handle" />
      </CardContent>
    </Card>
  );
}

function PreferencesCard({ form }: { form: UseFormReturn<ProfileFormValues> }) {
  const { register, watch, setValue, formState: { errors } } = form;
  const targetRoles = watch("targetRoles") ?? [];
  const skills = watch("skills") ?? [];
  const workModes = watch("workModes") ?? [];
  const jobTypes = watch("jobTypes") ?? [];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Job preferences</CardTitle>
        <CardDescription>What you&apos;re targeting — guides the evaluation engine.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ChipsInput
          label="Target roles"
          value={targetRoles}
          onChange={(v) => setValue("targetRoles", v, { shouldDirty: true })}
          placeholder="Press Enter after each — e.g. Frontend Engineer"
          error={errors.targetRoles?.message}
        />
        <ChipsInput
          label="Skills"
          value={skills}
          onChange={(v) => setValue("skills", v, { shouldDirty: true })}
          placeholder="Press Enter after each — e.g. React, TypeScript, Next.js"
          error={errors.skills?.message}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
      </CardContent>
    </Card>
  );
}

function CvCard({
  form,
  onParsed,
}: {
  form: UseFormReturn<ProfileFormValues>;
  onParsed: (p: ResumeParsed) => void;
}) {
  const { register, formState: { errors } } = form;
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">CV (markdown)</CardTitle>
            <CardDescription>Source of truth for evaluations and tailored CVs.</CardDescription>
          </div>
          <ResumeUploadButton onParsed={onParsed} size="sm" label="Re-upload" />
        </div>
      </CardHeader>
      <CardContent>
        <TextareaField
          {...register("cvMarkdown")}
          error={errors.cvMarkdown?.message}
          placeholder="# Your Name&#10;&#10;## Summary&#10;…"
          className="min-h-[400px] font-mono text-xs"
        />
      </CardContent>
    </Card>
  );
}

function SaveBar({ isSubmitting, isDirty }: { isSubmitting: boolean; isDirty: boolean }) {
  return (
    <div className="flex items-center justify-end gap-2 pt-2">
      <Button type="submit" size="lg" disabled={isSubmitting || !isDirty} className="gap-2 px-6">
        <Save className="size-4" />
        {isSubmitting ? "Saving…" : isDirty ? "Save changes" : "Saved"}
      </Button>
    </div>
  );
}
