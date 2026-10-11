import { StudentModel, TestModel, ResultModel } from "../models";
import { Student, Test, Result } from "../config/db";
import {
  Repository,
  StudentRepository,
  TestRepository,
  ResultRepository,
} from "./interfaces";

const HIDE = "-_id -__v";

class MongoRepository<T extends { id: string }> implements Repository<T> {
  constructor(protected model: any) {}

  async findAll(): Promise<T[]> {
    return this.model.find().select(HIDE).lean();
  }
  async findById(id: string): Promise<T | null> {
    return this.model.findOne({ id }).select(HIDE).lean();
  }
  async create(item: T): Promise<T> {
    await this.model.create(item);
    return item;
  }
  async update(id: string, patch: Partial<T>): Promise<T | null> {
    return this.model
      .findOneAndUpdate({ id }, patch, { new: true, runValidators: true })
      .select(HIDE)
      .lean();
  }
  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ id });
  }
}

export class MongoStudentRepository
  extends MongoRepository<Student>
  implements StudentRepository
{
  constructor() {
    super(StudentModel);
  }
  async findByEmail(email: string): Promise<Student | null> {
    return this.model.findOne({ email }).select(HIDE).lean();
  }
}

export class MongoTestRepository
  extends MongoRepository<Test>
  implements TestRepository
{
  constructor() {
    super(TestModel);
  }
}

export class MongoResultRepository
  extends MongoRepository<Result>
  implements ResultRepository
{
  constructor() {
    super(ResultModel);
  }
  async findByStudent(studentId: string): Promise<Result[]> {
    return this.model.find({ studentId }).select(HIDE).lean();
  }
  async deleteByStudent(studentId: string): Promise<void> {
    await this.model.deleteMany({ studentId });
  }
  async deleteByTest(testId: string): Promise<void> {
    await this.model.deleteMany({ testId });
  }
}
