import { describe, it, expect, beforeEach } from "vitest";
import { StudentService } from "../server/services/studentService";
import { AppError } from "../server/errors/AppError";
import {
  MemoryStudentRepository,
  MemoryResultRepository,
} from "./helpers/memoryRepositories";

let students: MemoryStudentRepository;
let results: MemoryResultRepository;
let service: StudentService;

const valid = { name: "Іван Бондар", email: "ivan@mail.com", group: "КН-301" };

beforeEach(() => {
  students = new MemoryStudentRepository();
  results = new MemoryResultRepository();
  service = new StudentService(students, results);
});

describe("StudentService", () => {
  it("створює студента", async () => {
    const s = await service.create(valid);
    expect(s.id).toMatch(/^std-/);
    expect(await students.findAll()).toHaveLength(1);
  });

  it("[негативний] не дозволяє дублікат email", async () => {
    await service.create(valid);
    await expect(service.create(valid)).rejects.toMatchObject({ status: 400 });
  });

  it("[негативний] кидає 404 для неіснуючого студента", async () => {
    await expect(service.getById("nope")).rejects.toBeInstanceOf(AppError);
  });

  it("при видаленні студента видаляє його результати", async () => {
    const s = await service.create(valid);
    await results.create({
      id: "r1",
      studentId: s.id,
      testId: "t1",
      score: 1,
      answers: [],
      date: "",
    });
    await service.remove(s.id);
    expect(await results.findAll()).toHaveLength(0);
  });
});
