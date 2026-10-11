import { Student } from "../config/db";
import {
  StudentRepository,
  ResultRepository,
} from "../repositories/interfaces";
import { badRequest, notFound } from "../errors/AppError";
import { studentSchema, parseOrThrow } from "../validation/schemas";

export class StudentService {
  constructor(
    private students: StudentRepository,
    private results: ResultRepository,
  ) {}

  list() {
    return this.students.findAll();
  }

  async getById(id: string) {
    const student = await this.students.findById(id);
    if (!student) throw notFound("Студента");
    return student;
  }

  async create(input: unknown): Promise<Student> {
    const data = parseOrThrow(studentSchema, input);
    if (await this.students.findByEmail(data.email)) {
      throw badRequest("Email вже використовується іншим студентом");
    }
    return this.students.create({
      id: `std-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
    });
  }

  async update(id: string, input: unknown): Promise<Student> {
    const data = parseOrThrow(studentSchema, input);
    await this.getById(id);

    const duplicate = await this.students.findByEmail(data.email);
    if (duplicate && duplicate.id !== id) {
      throw badRequest("Email вже використовується іншим студентом");
    }
    return (await this.students.update(id, data))!;
  }

  async remove(id: string): Promise<void> {
    await this.students.delete(id);
    await this.results.deleteByStudent(id);
  }
}
