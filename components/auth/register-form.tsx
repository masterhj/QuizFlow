"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { GraduationCap, BookOpen } from "lucide-react";
import Link from "next/link";

import { registerSchema, type RegisterInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const RegisterForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "STUDENT",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Registration failed");
        setIsLoading(false);
        return;
      }

      // Sign in after successful registration
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!signInResult?.ok) {
        setError("Registration successful, but sign-in failed. Please try logging in.");
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto space-y-6"
    >
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="text-sm text-slate-600">Join QuizFlow and start learning</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-lg bg-red-50 p-3 text-sm text-red-900 border border-red-200"
          >
            {error}
          </motion.div>
        )}

        <motion.div variants={containerVariants} initial="hidden" animate="show">
          {/* Full Name Field */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Full name
            </label>
            <Input
              type="text"
              placeholder="John Doe"
              {...register("name")}
              error={errors.name?.message}
            />
          </motion.div>

          {/* Email Field */}
          <motion.div variants={itemVariants} className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email address
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              error={errors.email?.message}
            />
          </motion.div>

          {/* Password Field */}
          <motion.div variants={itemVariants} className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register("password")}
              error={errors.password?.message}
            />
          </motion.div>

          {/* Confirm Password Field */}
          <motion.div variants={itemVariants} className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Confirm password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />
          </motion.div>

          {/* Role Selector */}
          <motion.div variants={itemVariants} className="mt-6 space-y-2">
            <label className="block text-sm font-medium text-slate-700">I am a</label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-3">
                  {/* Student Card */}
                  <motion.button
                    type="button"
                    onClick={() => field.onChange("STUDENT")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`rounded-lg border-2 p-4 text-center transition-all ${
                      selectedRole === "STUDENT"
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <GraduationCap className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
                    <div className="text-sm font-semibold text-slate-900">Student</div>
                    <div className="text-xs text-slate-600">I want to learn</div>
                  </motion.button>

                  {/* Teacher Card */}
                  <motion.button
                    type="button"
                    onClick={() => field.onChange("TEACHER")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`rounded-lg border-2 p-4 text-center transition-all ${
                      selectedRole === "TEACHER"
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <BookOpen className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
                    <div className="text-sm font-semibold text-slate-900">Teacher</div>
                    <div className="text-xs text-slate-600">I want to teach</div>
                  </motion.button>
                </div>
              )}
            />
            {errors.role && (
              <p className="text-xs text-red-600 mt-1">{errors.role.message}</p>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={itemVariants} className="mt-6">
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={isLoading}
              className="w-full"
            >
              Create account
            </Button>
          </motion.div>
        </motion.div>
      </form>

      {/* Login Link */}
      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </motion.div>
  );
};
