import { Student, Test, Result } from "../../server/config/db";
import {
  Repository,
  StudentRepository,
  TestRepository,
  ResultRepository,
} from "../../server/repositories/interfaces";

class MemoryRepository<T extends { id: string }> implements Repository<T> {
  items: T[] = [];

  async findAll() {
    return [...this.items];
  }
  async findById(id: string) {
    return this.items.find((i) => i.id === id) ?? null;
  }
  async create(item: T) {
    this.items.push(item);
    return item;
  }
  async update(id: string, patch: Partial<T>) {
    const index = this.items.findIndex((i) => i.id === id);
    if (index === -1) return null;
    this.items[index] = { ...this.items[index], ...patch };
    return this.items[index];
  }
  async delete(id: string) {
    this.items = this.items.filter((i) => i.id !== id);
  }
}

export class MemoryStudentRepository
  extends MemoryRepository<Student>
  implements StudentRepository
{
  async findByEmail(email: string) {
    return this.items.find((s) => s.email === email) ?? null;
  }
}

export class MemoryTestRepository
  extends MemoryRepository<Test>
  implements TestRepository {}

export class MemoryResultRepository
  extends MemoryRepository<Result>
  implements ResultRepository
{
  async findByStudent(studentId: string) {
    return this.items.filter((r) => r.studentId === studentId);
  }
  async deleteByStudent(studentId: string) {
    this.items = this.items.filter((r) => r.studentId !== studentId);
  }
  async deleteByTest(testId: string) {
    this.items = this.items.filter((r) => r.testId !== testId);
  }
}
