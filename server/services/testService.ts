import { Test } from "../config/db";
import { TestRepository, ResultRepository } from "../repositories/interfaces";
import { notFound } from "../errors/AppError";
import { testSchema, parseOrThrow } from "../validation/schemas";

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

  private normalize(input: unknown) {
    const data = parseOrThrow(testSchema, input);
    return { ...data, maxScore: data.maxScore ?? data.questions.length };
  }

  create(input: unknown): Promise<Test> {
    return this.tests.create({
      id: `test-${Date.now()}`,
      ...this.normalize(input),
      createdAt: new Date().toISOString(),
    });
  }

  async update(id: string, input: unknown): Promise<Test> {
    const data = this.normalize(input);
    await this.getById(id);
    return (await this.tests.update(id, data))!;
  }

  async remove(id: string): Promise<void> {
    await this.tests.delete(id);
    await this.results.deleteByTest(id);
  }
}
