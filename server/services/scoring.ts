import { Test, Answer } from "../config/db";

export interface ClientAnswer {
  questionText: string;
  selectedAnswer?: string;
}

export interface Evaluation {
  score: number;
  answers: Answer[];
}

export function evaluateTest(
  test: Test,
  clientAnswers: ClientAnswer[],
): Evaluation {
  let correct = 0;

  const answers: Answer[] = test.questions.map((q) => {
    const given = clientAnswers.find((a) => a.questionText === q.questionText);
    const selectedAnswer = (given?.selectedAnswer ?? "").trim();
    const isCorrect = q.correctAnswer.trim() === selectedAnswer;
    if (isCorrect) correct += 1;
    return { questionText: q.questionText, selectedAnswer, isCorrect };
  });

  const total = test.questions.length || 1;
  const score = Math.round((correct / total) * test.maxScore);
  return { score, answers };
}
