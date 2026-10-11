import mongoose, { Schema } from "mongoose";

// Question sub-schema
export interface IQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    questionText: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: String, required: true },
  },
  { _id: false },
);

// Student Schema
export interface IStudent {
  id: string;
  name: string;
  email: string;
  group: string;
  createdAt: string;
}

const StudentSchema = new Schema<IStudent>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  group: { type: String, required: true },
  createdAt: { type: String, required: true },
});

// Test Schema
export interface ITest {
  id: string;
  title: string;
  subject: string;
  maxScore: number;
  questions: IQuestion[];
  createdAt: string;
}

const TestSchema = new Schema<ITest>({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  maxScore: { type: Number, required: true },
  questions: { type: [QuestionSchema], required: true },
  createdAt: { type: String, required: true },
});

// Answer sub-schema
export interface IAnswer {
  questionText: string;
  selectedAnswer: string;
  isCorrect: boolean;
}

const AnswerSchema = new Schema<IAnswer>(
  {
    questionText: { type: String, required: true },
    selectedAnswer: { type: String, default: "" },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false },
);

// Result Schema
export interface IResult {
  id: string;
  studentId: string;
  testId: string;
  score: number;
  answers: IAnswer[];
  date: string;
}

const ResultSchema = new Schema<IResult>({
  id: { type: String, required: true, unique: true, index: true },
  studentId: { type: String, required: true, index: true },
  testId: { type: String, required: true, index: true },
  score: { type: Number, required: true },
  answers: { type: [AnswerSchema], required: true },
  date: { type: String, required: true },
});

// Register models safely to prevent OverwriteModelError during hot reloads
export const StudentModel =
  mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);
export const TestModel =
  mongoose.models.Test || mongoose.model<ITest>("Test", TestSchema);
export const ResultModel =
  mongoose.models.Result || mongoose.model<IResult>("Result", ResultSchema);
