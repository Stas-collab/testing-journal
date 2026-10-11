import { mongoConnected } from "../config/db";
import { Repositories } from "./interfaces";
import {
  MongoStudentRepository,
  MongoTestRepository,
  MongoResultRepository,
} from "./mongoRepositories";
import {
  JsonStudentRepository,
  JsonTestRepository,
  JsonResultRepository,
} from "./jsonRepositories";

const mongoRepos: Repositories = {
  students: new MongoStudentRepository(),
  tests: new MongoTestRepository(),
  results: new MongoResultRepository(),
};

const jsonRepos: Repositories = {
  students: new JsonStudentRepository(),
  tests: new JsonTestRepository(),
  results: new JsonResultRepository(),
};

/** Factory: обирає сховище залежно від стану підключення до MongoDB. */
export function getRepositories(): Repositories {
  return mongoConnected ? mongoRepos : jsonRepos;
}
