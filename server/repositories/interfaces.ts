import { Student, Test, Result } from "../config/db";

export interface Repository<T extends { id: string }> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(item: T): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<void>;
}

export interface StudentRepository extends Repository<Student> {
  findByEmail(email: string): Promise<Student | null>;
}

export interface TestRepository extends Repository<Test> {}

export interface ResultRepository extends Repository<Result> {
  findByStudent(studentId: string): Promise<Result[]>;
  deleteByStudent(studentId: string): Promise<void>;
  deleteByTest(testId: string): Promise<void>;
}

export interface Repositories {
  students: StudentRepository;
  tests: TestRepository;
  results: ResultRepository;
}
