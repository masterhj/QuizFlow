import { Metadata } from "next";
import Link from "next/link";
import { Star, Sparkles, Zap, Brain, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroIllustration } from "@/components/landing/hero-illustration";
import { CountUpSection } from "@/components/landing/count-up-section";
import { TestimonialCard } from "@/components/landing/testimonial-card";

export const metadata: Metadata = {
  title: "QuizFlow — Learn Smarter",
  description:
    "Master any subject with AI-powered adaptive quizzes. Personalized learning with spaced repetition and instant feedback.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-indigo-600">QuizFlow</div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
            >
              Sign in
            </Link>
            <Link href="/register">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 w-fit">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">AI-Powered Learning</span>
            </div>

            {/* Heading */}
            <h1 className="font-playfair text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
              Master any subject with adaptive quizzes
            </h1>

            {/* Subtext */}
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-xl">
              Personalized learning with spaced repetition, AI-powered explanations, and instant feedback to accelerate your progress.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start learning free
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                  See how it works
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative h-96 lg:h-full">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Why QuizFlow works
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Cutting-edge technology meets proven learning science
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Adaptive Difficulty */}
            <div className="group p-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Adaptive Difficulty
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Questions adjust in real-time based on your performance. Master concepts faster without wasting time.
              </p>
            </div>

            {/* Feature 2: Spaced Repetition */}
            <div className="group p-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Brain className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Spaced Repetition
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Proven SM-2 algorithm schedules reviews at optimal intervals. Lock knowledge into long-term memory.
              </p>
            </div>

            {/* Feature 3: AI Explanations */}
            <div className="group p-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="h-12 w-12 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                AI Explanations
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Instant AI-powered explanations clarify wrong answers. Understand the why, not just the what.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl font-bold text-slate-900 dark:text-white mb-4">
              How it works
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Four simple steps to mastery
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connector Line */}
            <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-200 dark:from-indigo-900 dark:via-indigo-700 dark:to-indigo-900" />

            {[
              { num: 1, title: "Take a quiz", desc: "Choose from thousands of quizzes or create your own" },
              { num: 2, title: "Get feedback", desc: "Instant explanations for every answer with AI insights" },
              { num: 3, title: "Review weak spots", desc: "Focus on topics you need to strengthen" },
              { num: 4, title: "Track progress", desc: "Watch your mastery grow with detailed analytics" },
            ].map((step) => (
              <div key={step.num} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center mb-6 relative z-10 shadow-lg">
                    <span className="font-playfair text-4xl font-bold text-white">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <CountUpSection />

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Loved by learners
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              See what students and teachers are saying
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=student1"
              name="Sarah Chen"
              role="Pre-med student"
              quote="QuizFlow helped me improve my MCAT score by 15 points. The adaptive questions really target my weak areas."
              rating={5}
            />
            <TestimonialCard
              avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=student2"
              name="Marcus Johnson"
              role="High school teacher"
              quote="My students love the instant feedback. It's transformed how they study and their exam scores have improved significantly."
              rating={5}
            />
            <TestimonialCard
              avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=student3"
              name="Elena Rodriguez"
              role="Language learner"
              quote="The spaced repetition system actually works. I've retained vocabulary way better than with traditional flashcards."
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-indigo-600 dark:bg-indigo-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-playfair text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to ace your next exam?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students using QuizFlow to learn smarter, not harder.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="font-semibold">
              Start free today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="text-2xl font-bold text-white mb-4">QuizFlow</div>
            <p className="text-sm">Learn smarter with AI-powered adaptive quizzes</p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Privacy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm">© 2024 QuizFlow. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-white transition-colors">GitHub</Link>
            <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
