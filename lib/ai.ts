import Anthropic from "@anthropic-ai/sdk";
import type { Question, QuestionType } from "@prisma/client";
import type { MCQOption } from "@/types";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface GenerateQuestionsInput {
  content: string;
  subject: string;
  count: number;
  difficulty: number;
}

interface PartialQuestion {
  text: string;
  type: QuestionType;
  options: MCQOption[] | null;
  correctAnswer: string;
  difficulty: number;
  explanation?: string;
}

/**
 * Generate quiz questions using Claude with streaming
 * Yields questions as they are parsed from the stream
 * @param params Generation parameters
 * @yields Partial question objects
 */
export async function* generateQuestions(
  params: GenerateQuestionsInput
): AsyncGenerator<PartialQuestion> {
  const systemPrompt = `You are an expert educator and quiz creator. Generate pedagogically sound quiz questions that test genuine understanding, not memorization. Each question must be clear, unambiguous, and have exactly one correct answer.

For each question, respond with a JSON object (no markdown code blocks, just raw JSON):
{
  "text": "The question text",
  "type": "MCQ" or "SHORT_ANSWER",
  "options": [{"id": "1", "text": "option"}, {"id": "2", "text": "option"}, ...] (only for MCQ, exactly 4 options),
  "correctAnswer": "The correct answer",
  "difficulty": ${params.difficulty},
  "explanation": "A brief explanation of why this is correct"
}

Generate ${params.count} questions about this content. Output each JSON object on a new line.`;

  const userPrompt = `Subject: ${params.subject}
Difficulty Level: ${params.difficulty}/5

Content to generate questions from:
${params.content}

Generate ${params.count} quiz questions in the specified subject and difficulty level. Output each question as a separate JSON object on a new line. For MCQ questions, provide exactly 4 options with ids "1", "2", "3", "4".`;

  try {
    const stream = await anthropic.messages.stream({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    let buffer = "";

    for await (const chunk of stream) {
      if (
        chunk.type === "content_block_delta" &&
        chunk.delta.type === "text_delta"
      ) {
        buffer += chunk.delta.text;

        // Try to parse complete JSON objects from buffer
        const lines = buffer.split("\n");

        // Keep the last incomplete line in buffer
        buffer = lines[lines.length - 1];

        // Process complete lines
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (line.length === 0) continue;

          try {
            // Remove markdown code block markers if present
            const cleanedLine = line
              .replace(/^```json\s*/, "")
              .replace(/^```\s*/, "")
              .replace(/\s*```$/, "");

            const parsed = JSON.parse(cleanedLine);

            // Validate required fields
            if (parsed.text && parsed.type && parsed.correctAnswer) {
              const question: PartialQuestion = {
                text: parsed.text,
                type: parsed.type,
                options: parsed.options || null,
                correctAnswer: parsed.correctAnswer,
                difficulty: parsed.difficulty || params.difficulty,
                explanation: parsed.explanation,
              };
              yield question;
            }
          } catch (error) {
            // Skip lines that aren't valid JSON
            continue;
          }
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim().length > 0) {
      try {
        const cleanedBuffer = buffer
          .replace(/^```json\s*/, "")
          .replace(/^```\s*/, "")
          .replace(/\s*```$/, "");

        const parsed = JSON.parse(cleanedBuffer);
        if (parsed.text && parsed.type && parsed.correctAnswer) {
          const question: PartialQuestion = {
            text: parsed.text,
            type: parsed.type,
            options: parsed.options || null,
            correctAnswer: parsed.correctAnswer,
            difficulty: parsed.difficulty || params.difficulty,
            explanation: parsed.explanation,
          };
          yield question;
        }
      } catch (error) {
        // Final buffer parsing failed, continue
      }
    }
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error("Failed to generate questions from AI");
  }
}

/**
 * Generate an explanation for why an answer is correct/incorrect
 * @param question The question text
 * @param correctAnswer The correct answer
 * @param userAnswer The user's answer
 * @param subject The subject/topic
 * @returns Explanation string
 */
export async function explainAnswer(
  question: string,
  correctAnswer: string,
  userAnswer: string,
  subject: string
): Promise<string> {
  const systemPrompt =
    "You are a helpful tutor. Give a clear, encouraging 2-3 sentence explanation of why the correct answer is right and help the student understand the concept.";

  const userPrompt = `Subject: ${subject}

Question: ${question}

Correct Answer: ${correctAnswer}
User's Answer: ${userAnswer}

Provide a brief, encouraging explanation.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    const textContent = message.content.find((block) => block.type === "text");
    if (textContent && textContent.type === "text") {
      return textContent.text;
    }

    return "Unable to generate explanation.";
  } catch (error) {
    console.error("Error generating explanation:", error);
    throw new Error("Failed to generate explanation from AI");
  }
}

/**
 * Generate a subtle hint for a question without revealing the answer
 * @param question The question text
 * @param options MCQ options (if applicable)
 * @returns Hint string (max 1 sentence)
 */
export async function generateHint(
  question: string,
  options: MCQOption[] = []
): Promise<string> {
  const systemPrompt =
    "You are a helpful tutor. Provide a subtle, single-sentence hint that guides thinking without revealing the answer.";

  const optionsText =
    options.length > 0
      ? `\nOptions: ${options.map((o) => o.text).join(", ")}`
      : "";

  const userPrompt = `Question: ${question}${optionsText}

Provide one subtle hint to help the student think through this question. Do not reveal the answer.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 150,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    const textContent = message.content.find((block) => block.type === "text");
    if (textContent && textContent.type === "text") {
      // Ensure it's just one sentence
      const hint = textContent.text.split(".")[0] + ".";
      return hint;
    }

    return "Think carefully about the key concepts.";
  } catch (error) {
    console.error("Error generating hint:", error);
    throw new Error("Failed to generate hint from AI");
  }
}

/**
 * Generate a quiz summary/analysis for a completed attempt
 * @param quizTitle Title of the quiz
 * @param score Score achieved
 * @param totalQuestions Total questions in the quiz
 * @param subject Subject of the quiz
 * @returns Summary string
 */
export async function generateAttemptSummary(
  quizTitle: string,
  score: number,
  totalQuestions: number,
  subject: string
): Promise<string> {
  const systemPrompt =
    "You are an encouraging tutor. Provide a brief, constructive feedback summary (2-3 sentences) on the quiz performance.";

  const percentage = Math.round((score / totalQuestions) * 100);

  const userPrompt = `Quiz: ${quizTitle}
Subject: ${subject}
Performance: ${score} out of ${totalQuestions} questions correct (${percentage}%)

Provide encouraging but honest feedback on this performance and one suggestion for improvement.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 250,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    const textContent = message.content.find((block) => block.type === "text");
    if (textContent && textContent.type === "text") {
      return textContent.text;
    }

    return "Great effort! Keep practicing to strengthen your understanding.";
  } catch (error) {
    console.error("Error generating attempt summary:", error);
    throw new Error("Failed to generate summary from AI");
  }
}

export default anthropic;
