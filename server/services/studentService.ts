import { Student } from "../config/db";
import {
  StudentRepository,
  ResultRepository,
} from "../repositories/interfaces";
import { badRequest, notFound } from "../errors/AppError";

export interface StudentInput {
  name?: string;
  email?: string;
  group?: string;
}

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

  private normalize(input: StudentInput) {
    const { name, email, group } = input;
    if (!name || !email || !group) {
      throw badRequest("Усі поля (ім'я, email, група) обов'язкові");
    }
    return {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      group: group.trim(),
    };
  }

  async create(input: StudentInput): Promise<Student> {
    const data = this.normalize(input);
    if (await this.students.findByEmail(data.email)) {
      throw badRequest("Email вже використовується іншим студентом");
    }
    return this.students.create({
      id: `std-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
    });
  }

  async update(id: string, input: StudentInput): Promise<Student> {
    const data = this.normalize(input);
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
