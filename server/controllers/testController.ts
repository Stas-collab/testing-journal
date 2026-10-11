import { Request, Response, NextFunction } from "express";
import { TestModel as RawTestModel } from "../models";
import { mongoConnected, readDB, writeDB, Test, Question } from "../config/db";

const TestModel = RawTestModel as any;

export const getTests = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (mongoConnected) {
      const list = await TestModel.find().lean();
      return res.json(list);
    }
    res.json(readDB().tests);
  } catch (error) {
    next(error);
  }
};

export const getTestById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (mongoConnected) {
      const test = await TestModel.findOne({ id }).lean();
      if (!test) {
        return res.status(404).json({ message: "Тест не знайдено" });
      }
      return res.json(test);
    }

    const test = readDB().tests.find((t) => t.id === id);
    if (!test) {
      return res.status(404).json({ message: "Тест не знайдено" });
    }
    res.json(test);
  } catch (error) {
    next(error);
  }
};

export const createTest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title, subject, maxScore, questions } = req.body;
    if (!title || !subject || !questions || !Array.isArray(questions)) {
      return res
        .status(400)
        .json({ message: "Назва, предмет та список питань є обов'язковими" });
    }

    const mappedQuestions = questions.map((q: Question) => ({
      questionText: q.questionText.trim(),
      options: q.options.map((o: string) => o.trim()).filter(Boolean),
      correctAnswer: q.correctAnswer.trim(),
    }));

    const scoreCap = Number(maxScore) || questions.length;

    if (mongoConnected) {
      const newTest = {
        id: `test-${Date.now()}`,
        title: title.trim(),
        subject: subject.trim(),
        maxScore: scoreCap,
        questions: mappedQuestions,
        createdAt: new Date().toISOString(),
      };
      await TestModel.create(newTest);
      return res.status(201).json(newTest);
    }

    const data = readDB();
    const newTestJson: Test = {
      id: `test-${Date.now()}`,
      title: title.trim(),
      subject: subject.trim(),
      maxScore: scoreCap,
      questions: mappedQuestions,
      createdAt: new Date().toISOString(),
    };
    data.tests.push(newTestJson);
    writeDB(data);
    res.status(201).json(newTestJson);
  } catch (error: any) {
    next(error);
  }
};

export const updateTest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { title, subject, maxScore, questions } = req.body;
    if (!title || !subject || !questions || !Array.isArray(questions)) {
      return res
        .status(400)
        .json({ message: "Всі поля та масив питань є обов'язковими" });
    }

    const mappedQuestions = questions.map((q: Question) => ({
      questionText: q.questionText.trim(),
      options: q.options.map((o: string) => o.trim()).filter(Boolean),
      correctAnswer: q.correctAnswer.trim(),
    }));

    const scoreCap = Number(maxScore) || questions.length;

    if (mongoConnected) {
      const test = await TestModel.findOne({ id });
      if (!test) {
        return res.status(404).json({ message: "Тест не знайдено" });
      }

      test.title = title.trim();
      test.subject = subject.trim();
      test.maxScore = scoreCap;
      test.questions = mappedQuestions;

      await test.save();
      return res.json(test);
    }

    const data = readDB();
    const index = data.tests.findIndex((t) => t.id === id);
    if (index === -1) {
      return res.status(404).json({ message: "Тест не знайдено" });
    }

    data.tests[index] = {
      ...data.tests[index],
      title: title.trim(),
      subject: subject.trim(),
      maxScore: scoreCap,
      questions: mappedQuestions,
    };
    writeDB(data);
    res.json(data.tests[index]);
  } catch (error: any) {
    next(error);
  }
};

export const deleteTest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (mongoConnected) {
      await TestModel.deleteOne({ id });
      const { ResultModel: RawResultModel } = require("../models");
      const ResultModel = RawResultModel as any;
      await ResultModel.deleteMany({ testId: id });
      return res.json({ message: "Тест успішно видалено" });
    }

    const data = readDB();
    data.tests = data.tests.filter((t) => t.id !== id);
    data.results = data.results.filter((r) => r.testId !== id);
    writeDB(data);
    res.json({ message: "Тест успішно видалено" });
  } catch (error) {
    next(error);
  }
};
