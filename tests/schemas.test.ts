import { describe, it, expect } from "vitest";
import { studentSchema, testSchema } from "../server/validation/schemas";

describe("studentSchema", () => {
  it("нормалізує email і обрізає пробіли", () => {
    const r = studentSchema.parse({
      name: " Іван ",
      email: " IVAN@Mail.com ",
      group: " КН-1 ",
    });
    expect(r).toEqual({ name: "Іван", email: "ivan@mail.com", group: "КН-1" });
  });

  it("[негативний] відхиляє некоректний email", () => {
    expect(
      studentSchema.safeParse({ name: "Іван", email: "bad", group: "КН-1" })
        .success,
    ).toBe(false);
  });
});

describe("testSchema", () => {
  const base = { title: "T", subject: "S" };

  it("приймає коректний тест", () => {
    const r = testSchema.safeParse({
      ...base,
      questions: [
        { questionText: "Q", options: ["a", "b"], correctAnswer: "a" },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("[негативний] відхиляє correctAnswer, якого немає у варіантах", () => {
    const r = testSchema.safeParse({
      ...base,
      questions: [
        { questionText: "Q", options: ["a", "b"], correctAnswer: "z" },
      ],
    });
    expect(r.success).toBe(false);
  });

  it("[негативний] відхиляє порожній список питань", () => {
    expect(testSchema.safeParse({ ...base, questions: [] }).success).toBe(
      false,
    );
  });
});
