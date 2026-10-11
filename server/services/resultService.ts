import { Result } from "../config/db";
import {
  ResultRepository,
  StudentRepository,
  TestRepository,
} from "../repositories/interfaces";
import { badRequest, forbidden, notFound } from "../errors/AppError";
import { evaluateTest, ClientAnswer } from "./scoring";

export class ResultService {
  constructor(
    private results: ResultRepository,
    private students: StudentRepository,
    private tests: TestRepository,
  ) {}

  private async populate(list: Result[]) {
    const [students, tests] = await Promise.all([
      this.students.findAll(),
      this.tests.findAll(),
    ]);
    return list.map((r) => ({
      ...r,
      student: students.find((s) => s.id === r.studentId),
      test: tests.find((t) => t.id === r.testId),
    }));
  }

  async listAll() {
    return this.populate(await this.results.findAll());
  }

  async listByStudent(studentId: string, role?: string, userId?: string) {
    if (role === "student" && studentId !== userId) {
      throw forbidden("Ви можете запитувати тільки власні результати");
    }
    return this.populate(await this.results.findByStudent(studentId));
  }

  async getById(id: string, role?: string, userId?: string) {
    const result = await this.results.findById(id);
    if (!result) throw notFound("Результат");
    if (role === "student" && result.studentId !== userId) {
      throw forbidden("Ви можете переглядати тільки власні результати");
    }
    return (await this.populate([result]))[0];
  }

  async submit(
    studentId: string,
    testId: string,
    clientAnswers: ClientAnswer[],
  ) {
    if (!studentId)
      throw badRequest("Не вказано ідентифікатор студента у заголовках");
    if (!testId || !Array.isArray(clientAnswers)) {
      throw badRequest("ID тесту та відповіді є обов'язковими");
    }

    const test = await this.tests.findById(testId);
    if (!test) throw notFound("Тест");
    const student = await this.students.findById(studentId);
    if (!student) throw notFound("Студента");

    const { score, answers } = evaluateTest(test, clientAnswers);
    const result = await this.results.create({
      id: `res-${Date.now()}`,
      studentId,
      testId,
      score,
      answers,
      date: new Date().toISOString(),
    });

    return { ...result, student, test };
  }

  remove(id: string) {
    return this.results.delete(id);
  }
}
