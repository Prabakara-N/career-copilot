import type { CvPdfData } from "@/lib/cv/pdf-document";

const base: CvPdfData = {
  name: "Test Candidate",
  email: "test@example.com",
  phone: "+1 555 010 0000",
  linkedinUrl: "https://linkedin.com/in/test",
  portfolioUrl: "https://example.com",
  location: "Remote",
  summary: "Software engineer.",
  competencies: ["Programming"],
  experience: [],
  projects: [],
  skills: [],
  certifications: [],
  education: [
    { title: "BE CS", org: "Test University", period: "2018-2022" },
  ],
};

export const STRONG_FRONTEND: CvPdfData = {
  ...base,
  summary:
    "Frontend engineer with 3 years shipping React, Next.js, and TypeScript apps. Improved LCP by 35% on a production dashboard and scaled Firestore realtime sync to 50k DAU.",
  competencies: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Firebase", "tRPC", "Realtime sync", "Performance"],
  experience: [
    {
      company: "Acme",
      role: "Software Engineer",
      period: "2022 – Present",
      bullets: [
        "Shipped Next.js 14 App Router dashboard serving 50k users with 99.9% uptime.",
        "Cut LCP by 35% through image pipeline migration and React Server Component adoption.",
        "Built realtime Firestore sync with optimistic UI across 12 tRPC-backed routes.",
        "Mentored 3 juniors and led migration to TypeScript strict mode across a 60k-line codebase.",
        "Reduced Tailwind bundle size by 22% via component-system audit.",
      ],
    },
  ],
  projects: [
    { title: "Realtime Dashboard", description: "Firestore-backed analytics with React Server Components.", tech: "React, Next.js, Firestore, Tailwind" },
    { title: "Component System", description: "Reusable Tailwind primitives shared across 3 products.", tech: "React, TypeScript, Tailwind" },
  ],
  skills: [
    { category: "Frontend", items: "React, Next.js, TypeScript, Tailwind CSS, React Server Components" },
    { category: "Backend", items: "Node.js, tRPC, Firebase, Firestore" },
    { category: "Tooling", items: "Vite, Turbopack, Vitest, Playwright" },
  ],
  certifications: [{ title: "Advanced TypeScript", issuer: "Frontend Masters", year: "2024" }],
};

export const MEDIUM_FRONTEND: CvPdfData = {
  ...base,
  summary: "Frontend developer with 2 years of experience building React applications.",
  competencies: ["React", "JavaScript", "CSS", "HTML"],
  experience: [
    {
      company: "Beta",
      role: "Frontend Developer",
      period: "2023 – Present",
      bullets: [
        "Developed React components for the customer dashboard.",
        "Helped migrate the landing page from jQuery to React.",
        "Implemented a redesign using CSS modules and some Tailwind.",
      ],
    },
  ],
  projects: [{ title: "Landing page redesign", description: "Rebuilt marketing pages.", tech: "React, CSS" }],
  skills: [{ category: "Frontend", items: "React, JavaScript, CSS, HTML" }],
};

export const WEAK_FRONTEND: CvPdfData = {
  ...base,
  summary: "Developer looking for a frontend role.",
  competencies: [],
  experience: [
    {
      company: "Gamma",
      role: "Developer",
      period: "2024 – Present",
      bullets: ["Worked on the website.", "Fixed bugs.", "Helped the team."],
    },
  ],
  projects: [],
  skills: [],
};

export const STRONG_BACKEND: CvPdfData = {
  ...base,
  summary:
    "Senior backend engineer with 7 years of Node.js and PostgreSQL. Designed APIs handling 10M+ daily events and owned the Kubernetes migration for 4 core services.",
  competencies: ["Node.js", "TypeScript", "PostgreSQL", "Kubernetes", "Redis", "Kafka", "gRPC", "OpenTelemetry"],
  experience: [
    {
      company: "ScaleCo",
      role: "Senior Backend Engineer",
      period: "2020 – Present",
      bullets: [
        "Architected gRPC services that process 12M events/day with p99 latency under 50ms.",
        "Owned Postgres schema and partitioned a 4B-row table, cutting query p95 by 60%.",
        "Led Kubernetes migration across 4 services, reducing deploy time from 40 to 6 minutes.",
        "Mentored 5 engineers, ran weekly architecture reviews, and authored 3 service runbooks.",
        "Rolled out OpenTelemetry, achieving 95% trace coverage across the backend.",
      ],
    },
  ],
  projects: [{ title: "Events pipeline", description: "Kafka-backed stream processing.", tech: "Node.js, Kafka, Postgres" }],
  skills: [
    { category: "Languages", items: "TypeScript, Node.js, Go, SQL" },
    { category: "Infra", items: "Kubernetes, Docker, Redis, Kafka, PostgreSQL" },
  ],
  certifications: [{ title: "CKA", issuer: "Linux Foundation", year: "2023" }],
};

export const MEDIUM_BACKEND: CvPdfData = {
  ...base,
  summary: "Backend developer with Node.js and Postgres experience.",
  competencies: ["Node.js", "Postgres", "REST APIs"],
  experience: [
    {
      company: "Delta",
      role: "Backend Developer",
      period: "2022 – Present",
      bullets: [
        "Built REST APIs in Node.js for the customer platform.",
        "Worked on Postgres schema changes and query tuning.",
        "Collaborated with frontend on API contracts.",
      ],
    },
  ],
  skills: [{ category: "Backend", items: "Node.js, Express, Postgres, REST" }],
};

export const WEAK_BACKEND: CvPdfData = {
  ...base,
  summary: "Developer interested in backend work.",
  competencies: [],
  experience: [
    {
      company: "Epsilon",
      role: "Developer",
      period: "2024 – Present",
      bullets: ["Did tickets.", "Was part of the team."],
    },
  ],
};
