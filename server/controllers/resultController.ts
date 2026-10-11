import { Request, Response, NextFunction } from "express";
import {
  StudentModel as RawStudentModel,
  TestModel as RawTestModel,
  ResultModel as RawResultModel,
} from "../models";
import { mongoConnected, readDB, writeDB, Result, Answer } from "../config/db";

const StudentModel = RawStudentModel as any;
const TestModel = RawTestModel as any;
const ResultModel = RawResultModel as any;

export const getResults = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (mongoConnected) {
      const results = await ResultModel.find().lean();
      const students = await StudentModel.find().lean();
      const tests = await TestModel.find().lean();

      const populated = results.map((r) => {
        const student = students.find((s) => s.id === r.studentId);
        const test = tests.find((t) => t.id === r.testId);
        return {
          ...r,
          student,
          test,
        };
      });
      return res.json(populated);
    }

    const data = readDB();
    const students = data.students;
    const tests = data.tests;

    const populatedJson = data.results.map((r) => {
      const student = students.find((s) => s.id === r.studentId);
      const test = tests.find((t) => t.id === r.testId);
      return {
        ...r,
        student,
        test,
      };
    });
    res.json(populatedJson);
  } catch (error) {
    next(error);
  }
};

export const getResultById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (mongoConnected) {
      const r = await ResultModel.findOne({ id }).lean();
      if (!r) {
        return res.status(404).json({ message: "Результат не знайдено" });
      }

      const student = await StudentModel.findOne({ id: r.studentId }).lean();
      const test = await TestModel.findOne({ id: r.testId }).lean();

      const populated = {
        ...r,
        student,
        test,
      };

      // Student role boundary check
      if (req.userRole === "student" && r.studentId !== req.userId) {
        return res
          .status(403)
          .json({ message: "Ви можете переглядати тільки власні результати" });
      }

      return res.json(populated);
    }

    const data = readDB();
    const r = data.results.find((resItem) => resItem.id === id);
    if (!r) {
      return res.status(404).json({ message: "Результат не знайдено" });
    }

    // Student role boundary check
    if (req.userRole === "student" && r.studentId !== req.userId) {
      return res
        .status(403)
        .json({ message: "Ви можете переглядати тільки власні результати" });
    }

    const student = data.students.find((s) => s.id === r.studentId);
    const test = data.tests.find((t) => t.id === r.testId);
    res.json({
      ...r,
      student,
      test,
    });
  } catch (error) {
    next(error);
  }
};

export const getResultsByStudent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { studentId } = req.params;

    // Student role boundary check
    if (req.userRole === "student" && studentId !== req.userId) {
      return res
        .status(403)
        .json({ message: "Ви можете запитувати тільки власні результати" });
    }

    if (mongoConnected) {
      const results = await ResultModel.find({ studentId }).lean();
      const student = await StudentModel.findOne({ id: studentId }).lean();
      const tests = await TestModel.find().lean();

      const populated = results.map((r) => {
        const test = tests.find((t) => t.id === r.testId);
        return {
          ...r,
          student,
          test,
        };
      });
      return res.json(populated);
    }

    const data = readDB();
    const tests = data.tests;
    const student = data.students.find((s) => s.id === studentId);

    const populatedJson = data.results
      .filter((r) => r.studentId === studentId)
      .map((r) => {
        const test = tests.find((t) => t.id === r.testId);
        return {
          ...r,
          student,
          test,
        };
      });
    res.json(populatedJson);
  } catch (error) {
    next(error);
  }
};

export const createResult = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { test: testId, answers: clientAnswers } = req.body;
    const studentId = req.userId; // Securely verified from auth middleware headers

    if (!studentId) {
      return res
        .status(400)
        .json({ message: "Не вказано ідентифікатор студента у заголовках" });
    }
    if (!testId || !clientAnswers || !Array.isArray(clientAnswers)) {
      return res
        .status(400)
        .json({ message: "ID тесту та відповіді є обов'язковими" });
    }

    if (mongoConnected) {
      const test = await TestModel.findOne({ id: testId }).lean();
      if (!test) {
        return res.status(404).json({ message: "Тест не знайдено" });
      }

      const student = await StudentModel.findOne({ id: studentId }).lean();
      if (!student) {
        return res.status(404).json({ message: "Студента не знайдено" });
      }

      let score = 0;
      const answers: Answer[] = [];

      for (const q of test.questions) {
        const clientAns = clientAnswers.find(
          (ca) => ca.questionText === q.questionText,
        );
        const selectedAnswer = clientAns ? clientAns.selectedAnswer.trim() : "";
        const isCorrect = q.correctAnswer.trim() === selectedAnswer;

        if (isCorrect) {
          score += 1;
        }

        answers.push({
          questionText: q.questionText,
          selectedAnswer,
          isCorrect,
        });
      }

      const normalizedScore = Math.round(
        (score / test.questions.length) * test.maxScore,
      );

      const newResult = {
        id: `res-${Date.now()}`,
        studentId,
        testId,
        score: normalizedScore,
        answers,
        date: new Date().toISOString(),
      };

      await ResultModel.create(newResult);

      return res.status(201).json({
        ...newResult,
        student,
        test,
      });
    }

    const data = readDB();
    const test = data.tests.find((t) => t.id === testId);
    if (!test) {
      return res.status(404).json({ message: "Тест не знайдено" });
    }

    const student = data.students.find((s) => s.id === studentId);
    if (!student) {
      return res.status(404).json({ message: "Студента не знайдено" });
    }

    let score = 0;
    const answers: Answer[] = [];

    for (const q of test.questions) {
      const clientAns = clientAnswers.find(
        (ca) => ca.questionText === q.questionText,
      );
      const selectedAnswer = clientAns ? clientAns.selectedAnswer.trim() : "";
      const isCorrect = q.correctAnswer.trim() === selectedAnswer;

      if (isCorrect) {
        score += 1;
      }

      answers.push({
        questionText: q.questionText,
        selectedAnswer,
        isCorrect,
      });
    }

    const normalizedScore = Math.round(
      (score / test.questions.length) * test.maxScore,
    );

    const newResultJson: Result = {
      id: `res-${Date.now()}`,
      studentId,
      testId,
      score: normalizedScore,
      answers,
      date: new Date().toISOString(),
    };

    data.results.push(newResultJson);
    writeDB(data);

    res.status(201).json({
      ...newResultJson,
      student,
      test,
    });
  } catch (error: any) {
    next(error);
  }
};

export const deleteResult = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (mongoConnected) {
      await ResultModel.deleteOne({ id });
      return res.json({ message: "Результат успішно видалено" });
    }

    const data = readDB();
    data.results = data.results.filter((r) => r.id !== id);
    writeDB(data);
    res.json({ message: "Результат успішно видалено" });
  } catch (error) {
    next(error);
  }
};
