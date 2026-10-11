import { describe, it, expect } from "vitest";
import { evaluateTest } from "../server/services/scoring";
import { Test } from "../server/config/db";

const test: Test = {
  id: "t1",
  title: "JS",
  subject: "Prog",
  maxScore: 10,
  createdAt: "",
  questions: [
    { questionText: "Q1", options: ["a", "b"], correctAnswer: "a" },
    { questionText: "Q2", options: ["c", "d"], correctAnswer: "d" },
  ],
};

describe("evaluateTest", () => {
  it("повний бал за всі правильні відповіді", () => {
    const r = evaluateTest(test, [
      { questionText: "Q1", selectedAnswer: "a" },
      { questionText: "Q2", selectedAnswer: "d" },
    ]);
    expect(r.score).toBe(10);
    expect(r.answers.every((a) => a.isCorrect)).toBe(true);
  });

  it("масштабує бал до maxScore при частковій правильності", () => {
    const r = evaluateTest(test, [
      { questionText: "Q1", selectedAnswer: "a" },
      { questionText: "Q2", selectedAnswer: "c" },
    ]);
    expect(r.score).toBe(5);
  });

  it("нуль балів, якщо всі відповіді хибні", () => {
    const r = evaluateTest(test, [
      { questionText: "Q1", selectedAnswer: "b" },
      { questionText: "Q2", selectedAnswer: "c" },
    ]);
    expect(r.score).toBe(0);
  });

  it("[негативний] відсутня відповідь рахується неправильною", () => {
    const r = evaluateTest(test, [{ questionText: "Q1", selectedAnswer: "a" }]);
    expect(r.score).toBe(5);
    expect(r.answers[1]).toEqual({
      questionText: "Q2",
      selectedAnswer: "",
      isCorrect: false,
    });
  });

  it("[негативний] ігнорує питання, яких немає в тесті", () => {
    const r = evaluateTest(test, [
      { questionText: "Fake", selectedAnswer: "a" },
    ]);
    expect(r.score).toBe(0);
    expect(r.answers).toHaveLength(2);
  });

  it("обрізає пробіли у відповідях", () => {
    const r = evaluateTest(test, [
      { questionText: "Q1", selectedAnswer: "  a " },
      { questionText: "Q2", selectedAnswer: "d" },
    ]);
    expect(r.score).toBe(10);
  });
});
