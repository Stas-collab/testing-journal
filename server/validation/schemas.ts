import { z } from "zod";
import { badRequest } from "../errors/AppError";

export const studentSchema = z.object({
  name: z
    .string({ message: "Ім'я обов'язкове" })
    .trim()
    .min(2, "Ім'я має містити щонайменше 2 символи"),
  email: z
    .string({ message: "Email обов'язковий" })
    .trim()
    .toLowerCase()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Некоректний формат email"),
  group: z
    .string({ message: "Група обов'язкова" })
    .trim()
    .min(1, "Група обов'язкова"),
});

const questionSchema = z
  .object({
    questionText: z
      .string()
      .trim()
      .min(1, "Текст питання не може бути порожнім"),
    options: z
      .array(z.string().trim())
      .transform((arr) => arr.filter(Boolean))
      .pipe(
        z.array(z.string()).min(2, "Потрібно щонайменше 2 варіанти відповіді"),
      ),
    correctAnswer: z.string().trim().min(1, "Вкажіть правильну відповідь"),
  })
  .superRefine((q, ctx) => {
    if (!q.options.includes(q.correctAnswer)) {
      ctx.addIssue({
        code: "custom",
        message: `Правильна відповідь для питання "${q.questionText}" має бути серед варіантів`,
      });
    }
  });

export const testSchema = z.object({
  title: z
    .string({ message: "Назва обов'язкова" })
    .trim()
    .min(1, "Назва обов'язкова"),
  subject: z
    .string({ message: "Предмет обов'язковий" })
    .trim()
    .min(1, "Предмет обов'язковий"),
  maxScore: z
    .number()
    .positive("Максимальний бал має бути додатним")
    .optional(),
  questions: z
    .array(questionSchema, { message: "Список питань обов'язковий" })
    .min(1, "Тест має містити хоча б одне питання"),
});

export const submissionSchema = z.object({
  test: z
    .string({ message: "ID тесту обов'язковий" })
    .min(1, "ID тесту обов'язковий"),
  answers: z.array(
    z.object({
      questionText: z.string(),
      selectedAnswer: z.string().optional(),
    }),
    { message: "Відповіді обов'язкові" },
  ),
});

export function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw badRequest(result.error.issues.map((i) => i.message).join("; "));
  }
  return result.data;
}
