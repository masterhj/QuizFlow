import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "QuizFlow — Learn Smarter",
  description:
    "Master any subject with AI-powered adaptive quizzes. Personalized learning with spaced repetition and instant feedback.",
  keywords:
    "quiz, learning, education, adaptive learning, spaced repetition, AI",
  openGraph: {
    title: "QuizFlow — Learn Smarter",
    description:
      "Master any subject with AI-powered adaptive quizzes. Personalized learning with spaced repetition and instant feedback.",
    url: "https://quizflow.app",
    siteName: "QuizFlow",
    images: [
      {
        url: "https://quizflow.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "QuizFlow",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuizFlow — Learn Smarter",
    description: "Master any subject with AI-powered adaptive quizzes.",
    images: ["https://quizflow.app/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable}`}
    >
      <body className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
