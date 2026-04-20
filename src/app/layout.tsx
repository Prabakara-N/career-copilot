import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { AppHeader } from "@/components/app-header";
import { Toaster } from "@/components/ui/sonner";
import { FirstTimeSetupDialog } from "@/components/setup/first-time-dialog";

// Body — Inter: the gold standard for AI / dev tools (Linear, Vercel, Anthropic)
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

// Headings — Space Grotesk: distinctive geometric for the brand
const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

// Code / mono — JetBrains Mono: best in class for code blocks
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Career-Ops Cloud — AI Job Search Command Center",
  description:
    "Chat-driven AI job search. Evaluate offers, generate tailored CVs, research companies, track applications.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AuthProvider>
            <AppHeader />
            <div className="flex-1">{children}</div>
            <FirstTimeSetupDialog />
          </AuthProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
