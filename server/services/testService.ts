import { Test, Question } from "../config/db";
import { TestRepository, ResultRepository } from "../repositories/interfaces";
import { badRequest, notFound } from "../errors/AppError";

export interface TestInput {
  title?: string;
  subject?: string;
  maxScore?: number;
  questions?: Question[];
}

export class TestService {
  constructor(
    private tests: TestRepository,
    private results: ResultRepository,
  ) {}

  list() {
    return this.tests.findAll();
  }

  async getById(id: string) {
    const test = await this.tests.findById(id);
    if (!test) throw notFound("Тест");
    return test;
  }

  private normalize(input: TestInput) {
    const { title, subject, maxScore, questions } = input;
    if (!title || !subject || !Array.isArray(questions)) {
      throw badRequest("Назва, предмет та список питань є обов'язковими");
    }
    return {
      title: title.trim(),
      subject: subject.trim(),
      maxScore: Number(maxScore) || questions.length,
      questions: questions.map((q) => ({
        questionText: q.questionText.trim(),
        options: q.options.map((o) => o.trim()).filter(Boolean),
        correctAnswer: q.correctAnswer.trim(),
      })),
    };
  }

  create(input: TestInput): Promise<Test> {
    return this.tests.create({
      id: `test-${Date.now()}`,
      ...this.normalize(input),
      createdAt: new Date().toISOString(),
    });
  }

  async update(id: string, input: TestInput): Promise<Test> {
    const data = this.normalize(input);
    await this.getById(id);
    return (await this.tests.update(id, data))!;
  }

  async remove(id: string): Promise<void> {
    await this.tests.delete(id);
    await this.results.deleteByTest(id);
  }
}
