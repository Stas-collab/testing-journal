import { getRepositories } from "../repositories";
import { StudentService } from "./studentService";
import { TestService } from "./testService";
import { ResultService } from "./resultService";

export function getServices() {
  const r = getRepositories();
  return {
    students: new StudentService(r.students, r.results),
    tests: new TestService(r.tests, r.results),
    results: new ResultService(r.results, r.students, r.tests),
  };
}
