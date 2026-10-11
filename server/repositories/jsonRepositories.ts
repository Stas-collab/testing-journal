import { readDB, writeDB, Student, Test, Result } from "../config/db";
import {
  Repository,
  StudentRepository,
  TestRepository,
  ResultRepository,
} from "./interfaces";

type Collection = "students" | "tests" | "results";

class JsonRepository<T extends { id: string }> implements Repository<T> {
  constructor(protected collection: Collection) {}

  protected load(): T[] {
    return (readDB() as any)[this.collection];
  }
  protected save(items: T[]): void {
    const data: any = readDB();
    data[this.collection] = items;
    writeDB(data);
  }

  async findAll(): Promise<T[]> {
    return this.load();
  }
  async findById(id: string): Promise<T | null> {
    return this.load().find((i) => i.id === id) ?? null;
  }
  async create(item: T): Promise<T> {
    this.save([...this.load(), item]);
    return item;
  }
  async update(id: string, patch: Partial<T>): Promise<T | null> {
    const items = this.load();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...patch };
    this.save(items);
    return items[index];
  }
  async delete(id: string): Promise<void> {
    this.save(this.load().filter((i) => i.id !== id));
  }
}

export class JsonStudentRepository
  extends JsonRepository<Student>
  implements StudentRepository
{
  constructor() {
    super("students");
  }
  async findByEmail(email: string): Promise<Student | null> {
    return this.load().find((s) => s.email.toLowerCase() === email) ?? null;
  }
}

export class JsonTestRepository
  extends JsonRepository<Test>
  implements TestRepository
{
  constructor() {
    super("tests");
  }
}

export class JsonResultRepository
  extends JsonRepository<Result>
  implements ResultRepository
{
  constructor() {
    super("results");
  }
  async findByStudent(studentId: string): Promise<Result[]> {
    return this.load().filter((r) => r.studentId === studentId);
  }
  async deleteByStudent(studentId: string): Promise<void> {
    this.save(this.load().filter((r) => r.studentId !== studentId));
  }
  async deleteByTest(testId: string): Promise<void> {
    this.save(this.load().filter((r) => r.testId !== testId));
  }
}
