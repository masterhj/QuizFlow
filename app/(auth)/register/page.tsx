import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { BookOpen, Users, Zap } from "lucide-react";

import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 gap-0">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-emerald-600 to-emerald-800 p-12 text-white">
        <div>
          <h1 className="text-4xl font-bold mb-2">Join QuizFlow</h1>
          <p className="text-xl text-emerald-100">
            Join 10,000+ learners mastering their subjects
          </p>
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/30 flex items-center justify-center">
                <Zap className="h-5 w-5 text-emerald-200" />
              </div>
              <h3 className="font-semibold">Personalized Learning</h3>
            </div>
            <p className="text-emerald-100 text-sm ml-13">
              Questions adapt to your skill level, making learning efficient and engaging
            </p>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/30 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-emerald-200" />
              </div>
              <h3 className="font-semibold">Instant Feedback</h3>
            </div>
            <p className="text-emerald-100 text-sm ml-13">
              AI-powered explanations help you understand not just what, but why
            </p>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-emerald-200" />
              </div>
              <h3 className="font-semibold">Join a Community</h3>
            </div>
            <p className="text-emerald-100 text-sm ml-13">
              Learn alongside thousands of students and teachers worldwide
            </p>
          </div>
        </div>

        <div className="text-sm text-emerald-200">
          <p>© 2024 QuizFlow. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-white dark:bg-slate-950">
        <div className="w-full max-w-md">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
