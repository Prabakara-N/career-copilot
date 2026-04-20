export function LandingFooter() {
  return (
    <footer className="container mx-auto max-w-5xl px-6 py-12 text-center text-sm text-muted-foreground">
      <p>
        Built on{" "}
        <a
          className="underline underline-offset-4 hover:text-foreground"
          href="https://github.com/santifer/career-ops"
          target="_blank"
          rel="noreferrer"
        >
          career-ops
        </a>
        . Next.js 16 · React 19 · Tailwind v4 · shadcn/ui · Firebase · Aceternity.
      </p>
    </footer>
  );
}
