import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Check } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 gap-0">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-indigo-600 to-indigo-800 p-12 text-white">
        <div>
          <h1 className="text-4xl font-bold mb-4">QuizFlow</h1>
          <p className="text-xl text-indigo-100">Learn smarter, not harder</p>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold mb-4">Why QuizFlow?</h3>
          {[
            "Adaptive difficulty that grows with you",
            "AI-powered explanations for every answer",
            "Proven spaced repetition algorithm",
          ].map((feature, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <Check className="h-5 w-5 text-indigo-200" />
              </div>
              <p className="text-indigo-100">{feature}</p>
            </div>
          ))}
        </div>

        <div className="text-sm text-indigo-200">
          <p>© 2024 QuizFlow. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-white dark:bg-slate-950">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
