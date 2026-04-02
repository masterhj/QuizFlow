import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { QuizCreateWizard } from "@/components/quiz/quiz-create-wizard";

export default async function CreateQuizPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if ((session.user as any).role !== "TEACHER") {
    redirect("/dashboard");
  }

  return <QuizCreateWizard userId={session.user.id} />;
}
