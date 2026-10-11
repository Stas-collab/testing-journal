import { describe, it, expect } from "vitest";
import {
  classifyDifficulty,
  analyzeQuestions,
  recommendForStudent,
} from "../server/services/analytics";
import { Test, Result } from "../server/config/db";

const test: Test = {
  id: "t1",
  title: "JS",
  subject: "Prog",
  maxScore: 2,
  createdAt: "",
  questions: [
    { questionText: "Q1", options: ["a", "b"], correctAnswer: "a" },
    { questionText: "Q2", options: ["c", "d"], correctAnswer: "d" },
  ],
};

const other: Test = { ...test, id: "t2", title: "ENG", subject: "Lang" };

const mk = (
  id: string,
  studentId: string,
  testId: string,
  q1: boolean,
  q2: boolean,
  date = "2026-01-01",
): Result => ({
  id,
  studentId,
  testId,
  score: Number(q1) + Number(q2),
  date,
  answers: [
    { questionText: "Q1", selectedAnswer: q1 ? "a" : "b", isCorrect: q1 },
    { questionText: "Q2", selectedAnswer: q2 ? "d" : "c", isCorrect: q2 },
  ],
});

describe("classifyDifficulty", () => {
  it("розподіляє за порогами", () => {
    expect(classifyDifficulty(0.1)).toBe("hard");
    expect(classifyDifficulty(0.6)).toBe("medium");
    expect(classifyDifficulty(0.95)).toBe("easy");
  });
});

describe("analyzeQuestions", () => {
  it("рахує відсоток правильних відповідей", () => {
    const res = [
      mk("r1", "s1", "t1", true, false),
      mk("r2", "s2", "t1", true, false),
    ];
    const [a] = analyzeQuestions([test], res);
    expect(a.questions[0].correctRate).toBe(1);
    expect(a.questions[1].correctRate).toBe(0);
    expect(a.avgPct).toBe(0.5);
  });

  it("позначає підозрілі питання лише при достатній кількості спроб", () => {
    const few = [
      mk("r1", "s1", "t1", true, false),
      mk("r2", "s2", "t1", true, false),
    ];
    expect(analyzeQuestions([test], few)[0].questions[1].suspicious).toBe(
      false,
    );

    const many = [...few, mk("r3", "s3", "t1", true, false)];
    expect(analyzeQuestions([test], many)[0].questions[1].suspicious).toBe(
      true,
    );
  });

  it("[негативний] тест без спроб не ламає аналіз", () => {
    const [a] = analyzeQuestions([test], []);
    expect(a.attempts).toBe(0);
    expect(a.avgPct).toBe(0);
    expect(a.questions[0].suspicious).toBe(false);
  });
});

describe("recommendForStudent", () => {
  it("рекомендує перескласти тест нижче порогу та показує помилки", () => {
    const rec = recommendForStudent(
      "s1",
      [test],
      [mk("r1", "s1", "t1", true, false)],
    );
    expect(rec.retake).toHaveLength(1);
    expect(rec.weakSubjects[0].subject).toBe("Prog");
    expect(rec.mistakes).toEqual([
      {
        testTitle: "JS",
        questionText: "Q2",
        selectedAnswer: "c",
        correctAnswer: "d",
      },
    ]);
  });

  it("враховує лише останню спробу", () => {
    const res = [
      mk("r1", "s1", "t1", false, false, "2026-01-01"),
      mk("r2", "s1", "t1", true, true, "2026-02-01"),
    ];
    const rec = recommendForStudent("s1", [test], res);
    expect(rec.retake).toHaveLength(0);
    expect(rec.mistakes).toHaveLength(0);
  });

  it("повертає непройдені тести", () => {
    const rec = recommendForStudent(
      "s1",
      [test, other],
      [mk("r1", "s1", "t1", true, true)],
    );
    expect(rec.notTaken.map((t) => t.testId)).toEqual(["t2"]);
  });

  it("[негативний] ігнорує результати інших студентів", () => {
    const rec = recommendForStudent(
      "s1",
      [test],
      [mk("r1", "s2", "t1", false, false)],
    );
    expect(rec.retake).toHaveLength(0);
    expect(rec.notTaken).toHaveLength(1);
  });
});
