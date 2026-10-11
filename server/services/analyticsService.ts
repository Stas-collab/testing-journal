import {
  ResultRepository,
  StudentRepository,
  TestRepository,
} from "../repositories/interfaces";
import { forbidden, notFound } from "../errors/AppError";
import { analyzeQuestions, recommendForStudent } from "./analytics";

export class AnalyticsService {
  constructor(
    private results: ResultRepository,
    private tests: TestRepository,
    private students: StudentRepository,
  ) {}

  async questionDifficulty() {
    const [tests, results] = await Promise.all([
      this.tests.findAll(),
      this.results.findAll(),
    ]);
    return analyzeQuestions(tests, results);
  }

  async recommendations(studentId: string, role?: string, userId?: string) {
    if (role === "student" && studentId !== userId) {
      throw forbidden("Ви можете переглядати тільки власні рекомендації");
    }
    if (!(await this.students.findById(studentId))) throw notFound("Студента");

    const [tests, results] = await Promise.all([
      this.tests.findAll(),
      this.results.findByStudent(studentId),
    ]);
    return recommendForStudent(studentId, tests, results);
  }
}
