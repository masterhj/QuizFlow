"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ReviewCardProps {
  question: string;
  answer: string;
  onGrade: (grade: 1 | 2 | 3 | 4) => void;
  isFlipped: boolean;
  onFlip: () => void;
}

export function ReviewCard({
  question,
  answer,
  onGrade,
  isFlipped,
  onFlip,
}: ReviewCardProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-8 text-center">
          <motion.div
            initial={{ rotateY: 0 }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6 }}
            className="min-h-[200px] flex items-center justify-center"
          >
            <div className="text-2xl font-semibold">
              {isFlipped ? answer : question}
            </div>
          </motion.div>
        </Card>
      </motion.div>

      <Button
        onClick={onFlip}
        variant="ghost"
        className="px-6"
      >
        {isFlipped ? "Show Question" : "Show Answer"}
      </Button>

      {isFlipped && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-4"
        >
          <Button
            onClick={() => onGrade(1)}
            variant="danger"
            className="px-6"
          >
            Again (1)
          </Button>
          <Button
            onClick={() => onGrade(2)}
            variant="secondary"
            className="px-6"
          >
            Hard (2)
          </Button>
          <Button
            onClick={() => onGrade(3)}
            variant="default"
            className="px-6"
          >
            Good (3)
          </Button>
          <Button
            onClick={() => onGrade(4)}
            variant="default"
            className="px-6"
          >
            Easy (4)
          </Button>
        </motion.div>
      )}
    </div>
  );
}
