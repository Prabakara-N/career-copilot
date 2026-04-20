import type { CvPdfData } from "./pdf-document";

/**
 * Default CV data (Phase 1 placeholder).
 * Phase 2: load this from Firestore based on the authenticated user.
 */
export const DEFAULT_CV_DATA: CvPdfData = {
  name: "Prabakaran M",
  email: "prabakaran.m0208@gmail.com",
  phone: "+91 8072354657",
  linkedinUrl: "https://www.linkedin.com/in/prabakaran0208/",
  portfolioUrl: "https://prabakarandev.in/",
  location: "Coimbatore, India",
  summary:
    "Software Engineer with 2.5 years building responsive and scalable web applications using Next.js, React, TypeScript, Tailwind CSS, and Firebase. Skilled in real-time features, state management, and frontend architecture, with a strong focus on clean, performant, user-centric design.",
  competencies: [
    "React & Next.js",
    "TypeScript",
    "State Management",
    "REST & RPC APIs",
    "Responsive UI",
    "End-to-End Ownership",
  ],
  experience: [
    {
      company: "Darthwares",
      role: "Software Engineer",
      period: "Jul 2023 – Present",
      location: "Coimbatore, India",
      bullets: [
        "Owned end-to-end frontend for a multi-role enterprise platform — designed RBAC, dynamic onboarding workflows, and real-time features.",
        "Shipped enterprise-grade React + TypeScript applications using Next.js, Tailwind CSS, Firebase, and tRPC, focused on responsive design and performance.",
        "Built AI-powered modules including resume generation, interactive voice-navigated tutoring, and automated mock-placement-drive feedback.",
        "Refactored legacy components and standardized shared UI primitives, improving design-system consistency.",
        "Collaborated cross-functionally with product, design, and backend in Agile cycles.",
      ],
    },
  ],
  projects: [
    {
      title: "LeetCampus — AI Academic Platform",
      url: "https://www.leetcampus.com/",
      description:
        "End-to-end ownership of a multi-role academic platform. Designed and shipped RBAC, dynamic onboarding flows, and AI-native modules including Leet Tutor (voice-navigated slide creation) and Mock Placement Drive with automated AI-generated feedback. Automated full college-placement comms pipeline via Firebase Email Extension and SMS triggers.",
      tech: "Next.js · TypeScript · Firebase Admin · tRPC · Tailwind CSS · Jotai",
    },
    {
      title: "LeetCV — AI Resume Builder",
      url: "https://www.leetcv.com/",
      description:
        "Revamped key UI components for responsiveness and cross-device performance. Fixed critical frontend and backend issues for product stability. Developed Leet Link (Linktree-style sharing module). Refactored legacy code and improved design-system consistency.",
      tech: "Next.js · TypeScript · Firebase Admin · tRPC · Tailwind CSS · Recoil",
    },
    {
      title: "Ennuviz — Client Web App",
      url: "https://www.ennuviz.com/",
      description:
        "Contributed to a client-facing web application with multiple responsive pages. Implemented custom event-registration form and integrated API Spreadsheets for Excel exports.",
      tech: "Next.js · TypeScript · Sanity CMS · Tailwind CSS",
    },
  ],
  skills: [
    { category: "Frontend", items: "React, Next.js, TypeScript, JavaScript, HTML, CSS, Tailwind CSS, Bootstrap" },
    { category: "State Management", items: "Redux, Recoil, Jotai" },
    { category: "Backend / APIs", items: "Node.js, Express, Firebase Admin, tRPC, REST, Sanity CMS" },
    { category: "Database", items: "MongoDB, Firebase / Firestore" },
    { category: "Build & Tooling", items: "Webpack, Vite, Turbopack, Git, GitHub, CI/CD via Vercel & Netlify" },
    { category: "Tools", items: "VS Code, Cursor, Postman" },
  ],
  certifications: [
    { title: "React (Basic)", issuer: "HackerRank", year: "Jun 2023" },
    { title: "MERN Stack Web Development", issuer: "Skill Safari", year: "May 2023" },
    { title: "Frontend Development Libraries", issuer: "freeCodeCamp", year: "May 2023" },
    { title: "JavaScript Algorithms & Data Structures", issuer: "freeCodeCamp", year: "Feb 2023" },
  ],
  education: [
    {
      title: "MERN Stack Web Development",
      org: "Skill Safari, Coimbatore",
      period: "Sep 2022 – May 2023",
    },
    {
      title: "BE Metallurgical Engineering",
      org: "PSG College of Technology, Coimbatore",
      period: "Aug 2018 – Jun 2022",
      notes: "CGPA: 7.66 / 10",
    },
  ],
};
