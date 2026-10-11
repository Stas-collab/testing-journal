import { Test, Result } from "../config/db";

export type Difficulty = "hard" | "medium" | "easy";

export interface QuestionStat {
  questionText: string;
  attempts: number;
  correctRate: number;
  difficulty: Difficulty;
  suspicious: boolean;
}

export interface TestAnalysis {
  testId: string;
  title: string;
  subject: string;
  attempts: number;
  avgPct: number;
  questions: QuestionStat[];
}

export interface Recommendations {
  weakSubjects: { subject: string; avgPct: number }[];
  retake: { testId: string; title: string; subject: string; pct: number }[];
  notTaken: { testId: string; title: string; subject: string }[];
  mistakes: {
    testTitle: string;
    questionText: string;
    selectedAnswer: string;
    correctAnswer: string;
  }[];
}

export const PASS_THRESHOLD = 0.6;
const HARD_RATE = 0.4;
const EASY_RATE = 0.85;
const SUSPICIOUS_RATE = 0.2;
const MIN_ATTEMPTS_FOR_SUSPICION = 3;

const pctOf = (r: Result, t: Test) => r.score / (t.maxScore || 1);

export function classifyDifficulty(rate: number): Difficulty {
  if (rate < HARD_RATE) return "hard";
  if (rate > EASY_RATE) return "easy";
  return "medium";
}

export function analyzeQuestions(
  tests: Test[],
  results: Result[],
): TestAnalysis[] {
  return tests.map((test) => {
    const attemptsList = results.filter((r) => r.testId === test.id);

    const questions = test.questions.map((q) => {
      const answered = attemptsList
        .map((r) => r.answers.find((a) => a.questionText === q.questionText))
        .filter((a): a is NonNullable<typeof a> => !!a);
      const correct = answered.filter((a) => a.isCorrect).length;
      const rate = answered.length ? correct / answered.length : 0;

      return {
        questionText: q.questionText,
        attempts: answered.length,
        correctRate: rate,
        difficulty: classifyDifficulty(rate),
        suspicious:
          answered.length >= MIN_ATTEMPTS_FOR_SUSPICION &&
          rate <= SUSPICIOUS_RATE,
      };
    });

    const avgPct = attemptsList.length
      ? attemptsList.reduce((s, r) => s + pctOf(r, test), 0) /
        attemptsList.length
      : 0;

    return {
      testId: test.id,
      title: test.title,
      subject: test.subject,
      attempts: attemptsList.length,
      avgPct,
      questions,
    };
  });
}

export function recommendForStudent(
  studentId: string,
  tests: Test[],
  results: Result[],
): Recommendations {
  const mine = results
    .filter((r) => r.studentId === studentId)
    .sort((a, b) => a.date.localeCompare(b.date));

  const latestByTest = new Map<string, Result>();
  mine.forEach((r) => latestByTest.set(r.testId, r));

  const subjectPcts = new Map<string, number[]>();
  const retake: Recommendations["retake"] = [];
  const mistakes: Recommendations["mistakes"] = [];

  latestByTest.forEach((r, testId) => {
    const test = tests.find((t) => t.id === testId);
    if (!test) return;
    const pct = pctOf(r, test);

    subjectPcts.set(test.subject, [
      ...(subjectPcts.get(test.subject) ?? []),
      pct,
    ]);

    if (pct < PASS_THRESHOLD) {
      retake.push({ testId, title: test.title, subject: test.subject, pct });
    }

    r.answers
      .filter((a) => !a.isCorrect)
      .forEach((a) => {
        const q = test.questions.find((x) => x.questionText === a.questionText);
        if (!q) return;
        mistakes.push({
          testTitle: test.title,
          questionText: a.questionText,
          selectedAnswer: a.selectedAnswer,
          correctAnswer: q.correctAnswer,
        });
      });
  });

  const weakSubjects = [...subjectPcts.entries()]
    .map(([subject, arr]) => ({
      subject,
      avgPct: arr.reduce((s, x) => s + x, 0) / arr.length,
    }))
    .filter((s) => s.avgPct < PASS_THRESHOLD)
    .sort((a, b) => a.avgPct - b.avgPct);

  const notTaken = tests
    .filter((t) => !latestByTest.has(t.id))
    .map((t) => ({ testId: t.id, title: t.title, subject: t.subject }));

  retake.sort((a, b) => a.pct - b.pct);

  return { weakSubjects, retake, notTaken, mistakes };
}
