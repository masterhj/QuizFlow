"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Toast } from "@/components/ui/toast";
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Edit2,
  Check,
} from "lucide-react";
import { quizValidationSchema } from "@/lib/validations";

const SUBJECTS = [
  "Mathematics",
  "Science",
  "History",
  "Literature",
  "Language",
  "Geography",
  "Biology",
  "Chemistry",
  "Physics",
  "Economics",
];

interface QuizFormData {
  title: string;
  subject: string;
  description: string;
  difficulty: number;
  estimatedMinutes: number;
  tags: string[];
}

interface Question {
  id: string;
  type: "MCQ" | "SHORT_ANSWER";
  text: string;
  difficulty: number;
  options?: Array<{ text: string; isCorrect: boolean }>;
  correctAnswer?: string;
  explanation: string;
}

interface GeneratedQuestion extends Question {
  isGenerated: true;
}

interface QuizCreateWizardProps {
  userId: string;
}

export function QuizCreateWizard({ userId }: QuizCreateWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [generatedQuestions, setGeneratedQuestions] = useState<
    GeneratedQuestion[]
  >([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<{ message: string } | null>(null);
  const [aiTab, setAiTab] = useState<"manual" | "ai">("manual");
  const [isDraft, setIsDraft] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<QuizFormData>({
    resolver: zodResolver(quizValidationSchema),
    defaultValues: {
      title: "",
      subject: "Mathematics",
      description: "",
      difficulty: 3,
      estimatedMinutes: 30,
      tags: [],
    },
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("quiz-draft");
    if (saved) {
      const draft = JSON.parse(saved);
      reset(draft.formData);
      setQuestions(draft.questions || []);
      setStep(draft.step || 1);
      setToast({ message: "Draft restored!" });
      setTimeout(() => setToast(null), 3000);
    }
  }, [reset]);

  // Auto-save every 30s
  useEffect(() => {
    const formData = watch();
    const interval = setInterval(() => {
      localStorage.setItem(
        "quiz-draft",
        JSON.stringify({
          formData,
          questions,
          step,
          timestamp: Date.now(),
        })
      );
    }, 30000);

    return () => clearInterval(interval);
  }, [watch, questions, step]);

  const handleNextStep = async (data?: QuizFormData) => {
    if (step === 1) {
      if (!data?.title || !data?.subject) {
        setToast({ message: "Please fill in all required fields" });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (questions.length === 0) {
        setToast({ message: "Add at least one question" });
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const addQuestion = (newQuestion: Question) => {
    setQuestions([...questions, { ...newQuestion, id: Date.now().toString() }]);
    setToast({ message: "Question added!" });
    setTimeout(() => setToast(null), 2000);
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const generateWithAI = async (
    material: string,
    subject: string,
    count: number,
    difficulty: number
  ) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          material,
          subject,
          count,
          difficulty,
        }),
      });

      if (!response.ok) throw new Error("Generation failed");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const generated: GeneratedQuestion[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split("\n").filter(Boolean);

        for (const line of lines) {
          try {
            const question = JSON.parse(line);
            generated.push({ ...question, isGenerated: true });
            setGeneratedQuestions([...generated]);
          } catch {
            // Skip invalid JSON
          }
        }
      }

      setToast({ message: `Generated ${generated.length} questions!` });
    } catch (error) {
      setToast({ message: "Failed to generate questions" });
    } finally {
      setIsGenerating(false);
    }
  };

  const addAllGenerated = () => {
    setQuestions([
      ...questions,
      ...generatedQuestions.map((q) => ({
        ...q,
        id: Date.now().toString() + Math.random(),
      })),
    ]);
    setGeneratedQuestions([]);
    setToast({ message: "All questions added!" });
  };

  const handleCreateQuiz = async (data: QuizFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          questions,
          published: !isDraft,
          createdById: userId,
        }),
      });

      if (!response.ok) throw new Error("Failed to create quiz");

      const { quiz } = await response.json();
      localStorage.removeItem("quiz-draft");
      setToast({ message: "Quiz created successfully!" });

      setTimeout(() => {
        router.push(`/quiz/${quiz.id}`);
      }, 1000);
    } catch (error) {
      setToast({ message: "Error creating quiz" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formData = watch();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 dark:from-indigo-950/20 py-12">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">Create a Quiz</h1>
          <p className="text-muted-foreground mt-2">
            Build an engaging quiz in just a few minutes
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step === s
                    ? "bg-indigo-600 text-white scale-110"
                    : step > s
                      ? "bg-green-600 text-white"
                      : "bg-muted text-muted-foreground"
                }`}
                animate={{
                  scale: step === s ? 1.1 : 1,
                }}
              >
                {step > s ? <Check className="w-5 h-5" /> : s}
              </motion.div>
              <span className="text-sm font-medium">
                {s === 1 ? "Details" : s === 2 ? "Questions" : "Review"}
              </span>
              {s < 3 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            </div>
          ))}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(handleCreateQuiz)}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="p-8 space-y-6">
                  <h2 className="text-2xl font-bold">Quiz Details</h2>

                  {/* Title */}
                  <div>
                    <label className="text-sm font-medium">Title *</label>
                    <Input
                      {...register("title", { required: true })}
                      placeholder="e.g., Advanced Calculus"
                      className="mt-2"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs mt-1">Required</p>
                    )}
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="text-sm font-medium">Subject *</label>
                    <select
                      {...register("subject")}
                      className="w-full mt-2 px-3 py-2 border rounded-lg bg-background"
                    >
                      {SUBJECTS.map((subj) => (
                        <option key={subj} value={subj}>
                          {subj}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                      {...register("description")}
                      placeholder="What is this quiz about?"
                      className="w-full mt-2 px-3 py-2 border rounded-lg bg-background"
                      rows={4}
                    />
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="text-sm font-medium">
                      Difficulty: {formData.difficulty}/5
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      {...register("difficulty", { valueAsNumber: true })}
                      className="w-full mt-2"
                    />
                  </div>

                  {/* Estimated Time */}
                  <div>
                    <label className="text-sm font-medium">
                      Estimated Time (minutes)
                    </label>
                    <Input
                      {...register("estimatedMinutes", { valueAsNumber: true })}
                      type="number"
                      min="5"
                      max="180"
                      className="mt-2"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="text-sm font-medium">Tags</label>
                    <Input
                      placeholder="Type and press Enter"
                      className="mt-2"
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          e.currentTarget.value.trim()
                        ) {
                          e.preventDefault();
                          const newTags = [
                            ...formData.tags,
                            e.currentTarget.value.trim(),
                          ];
                          // Note: This would need a proper form state management
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.tags?.map((tag, idx) => (
                        <Badge key={idx}>{tag}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between pt-6">
                    <Button
                      variant="outline"
                      disabled
                      onClick={handlePrevStep}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={() => handleSubmit((data) => handleNextStep(data))()}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="p-8 space-y-6">
                  <h2 className="text-2xl font-bold">Add Questions</h2>

                  {/* Tabs */}
                  <div className="flex gap-4 border-b">
                    <button
                      className={`pb-2 font-medium text-sm ${
                        aiTab === "manual"
                          ? "border-b-2 border-indigo-600 text-indigo-600"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setAiTab("manual")}
                    >
                      Add Manually
                    </button>
                    <button
                      className={`pb-2 font-medium text-sm ${
                        aiTab === "ai"
                          ? "border-b-2 border-indigo-600 text-indigo-600"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setAiTab("ai")}
                    >
                      Generate with AI
                    </button>
                  </div>

                  {aiTab === "manual" && (
                    <ManualQuestionTab onAddQuestion={addQuestion} />
                  )}

                  {aiTab === "ai" && (
                    <AIQuestionTab
                      isGenerating={isGenerating}
                      onGenerate={generateWithAI}
                      generatedQuestions={generatedQuestions}
                      onAddAll={addAllGenerated}
                    />
                  )}

                  {/* Questions List */}
                  {questions.length > 0 && (
                    <div className="space-y-2 mt-6">
                      <h3 className="font-semibold">
                        Questions ({questions.length})
                      </h3>
                      {questions.map((q, idx) => (
                        <div
                          key={q.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {idx + 1}. {q.text.substring(0, 60)}...
                            </p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="secondary">{q.type}</Badge>
                              <Badge variant="outline">
                                {q.difficulty}/5
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteQuestion(q.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between pt-6">
                    <Button variant="outline" onClick={handlePrevStep}>
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button onClick={() => handleNextStep()}>
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="p-8 space-y-6">
                  <h2 className="text-2xl font-bold">Review & Publish</h2>

                  {/* Summary */}
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Title:</span>
                      <span className="font-medium">{formData.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subject:</span>
                      <span className="font-medium">{formData.subject}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Questions:</span>
                      <span className="font-medium">{questions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Difficulty:</span>
                      <span className="font-medium">
                        {formData.difficulty}/5
                      </span>
                    </div>
                  </div>

                  {/* Questions Preview */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">Questions</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {questions.map((q, idx) => (
                        <div
                          key={q.id}
                          className="p-2 bg-muted rounded text-sm"
                        >
                          {idx + 1}. {q.text}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Publish Option */}
                  <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <input
                      type="checkbox"
                      checked={!isDraft}
                      onChange={(e) => setIsDraft(!e.target.checked)}
                      id="publish"
                    />
                    <label htmlFor="publish" className="text-sm cursor-pointer">
                      <span className="font-medium">Publish immediately</span>
                      <p className="text-xs text-muted-foreground">
                        {isDraft
                          ? "This quiz will be saved as a draft"
                          : "This quiz will be visible to students"}
                      </p>
                    </label>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between pt-6">
                    <Button
                      variant="outline"
                      onClick={handlePrevStep}
                      disabled={isSubmitting}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit(handleCreateQuiz)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating..." : "Create Quiz"}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Toast */}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-4 right-4 bg-card border rounded-lg p-4 shadow-lg"
          >
            {toast.message}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Manual Question Tab Component
function ManualQuestionTab({
  onAddQuestion,
}: {
  onAddQuestion: (q: Question) => void;
}) {
  const [type, setType] = useState<"MCQ" | "SHORT_ANSWER">("MCQ");
  const [text, setText] = useState("");
  const [difficulty, setDifficulty] = useState(3);
  const [options, setOptions] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [explanation, setExplanation] = useState("");

  const handleAddQuestion = () => {
    if (!text.trim()) return;

    onAddQuestion({
      id: "",
      type,
      text,
      difficulty,
      options: type === "MCQ" ? options : undefined,
      explanation,
    });

    setText("");
    setOptions([
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ]);
    setExplanation("");
    setDifficulty(3);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Question Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "MCQ" | "SHORT_ANSWER")}
          className="w-full mt-2 px-3 py-2 border rounded-lg bg-background"
        >
          <option value="MCQ">Multiple Choice</option>
          <option value="SHORT_ANSWER">Short Answer</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">Question Text</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your question..."
          className="w-full mt-2 px-3 py-2 border rounded-lg bg-background"
          rows={3}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Difficulty: {difficulty}/5</label>
        <input
          type="range"
          min="1"
          max="5"
          value={difficulty}
          onChange={(e) => setDifficulty(Number(e.target.value))}
          className="w-full mt-2"
        />
      </div>

      {type === "MCQ" && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Options</label>
          {options.map((opt, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="radio"
                name="correct"
                checked={opt.isCorrect}
                onChange={() => {
                  setOptions(
                    options.map((o, i) => ({
                      ...o,
                      isCorrect: i === idx,
                    }))
                  );
                }}
              />
              <Input
                value={opt.text}
                onChange={(e) => {
                  const newOpts = [...options];
                  newOpts[idx].text = e.target.value;
                  setOptions(newOpts);
                }}
                placeholder={`Option ${String.fromCharCode(65 + idx)}`}
              />
            </div>
          ))}
        </div>
      )}

      <div>
        <label className="text-sm font-medium">Explanation</label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Explain why this is correct..."
          className="w-full mt-2 px-3 py-2 border rounded-lg bg-background"
          rows={2}
        />
      </div>

      <Button onClick={handleAddQuestion} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Question
      </Button>
    </div>
  );
}

// AI Question Tab Component
function AIQuestionTab({
  isGenerating,
  onGenerate,
  generatedQuestions,
  onAddAll,
}: {
  isGenerating: boolean;
  onGenerate: (material: string, subject: string, count: number, difficulty: number) => void;
  generatedQuestions: GeneratedQuestion[];
  onAddAll: () => void;
}) {
  const [material, setMaterial] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState(3);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Study Material</label>
        <textarea
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          placeholder="Paste your study notes or describe the topic..."
          className="w-full mt-2 px-3 py-2 border rounded-lg bg-background"
          rows={5}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full mt-2 px-3 py-2 border rounded-lg bg-background"
          >
            <option>Mathematics</option>
            <option>Science</option>
            <option>History</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">
            Number of Questions: {count}
          </label>
          <input
            type="range"
            min="5"
            max="20"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full mt-2"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">
          Difficulty: {difficulty}/5
        </label>
        <input
          type="range"
          min="1"
          max="5"
          value={difficulty}
          onChange={(e) => setDifficulty(Number(e.target.value))}
          className="w-full mt-2"
        />
      </div>

      <Button
        onClick={() => onGenerate(material, subject, count, difficulty)}
        disabled={!material.trim() || isGenerating}
        className="w-full"
      >
        {isGenerating ? "Generating..." : "Generate Questions with AI"}
      </Button>

      {generatedQuestions.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Generated Questions</h3>
          {generatedQuestions.map((q, idx) => (
            <Card key={idx} className="p-3">
              <p className="text-sm font-medium">{idx + 1}. {q.text}</p>
              <p className="text-xs text-muted-foreground mt-1">{q.type}</p>
            </Card>
          ))}
          <Button onClick={onAddAll} className="w-full">
            Add All to Quiz
          </Button>
        </div>
      )}
    </div>
  );
}
