import { Request, Response, NextFunction } from "express";
import { StudentModel as RawStudentModel } from "../models";
import { mongoConnected, readDB, writeDB, Student } from "../config/db";

const StudentModel = RawStudentModel as any;

export const getStudents = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (mongoConnected) {
      const list = await StudentModel.find().lean();
      return res.json(list);
    }
    const data = readDB();
    res.json(data.students);
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (mongoConnected) {
      const student = await StudentModel.findOne({ id }).lean();
      if (!student) {
        return res.status(404).json({ message: "Студента не знайдено" });
      }
      return res.json(student);
    }

    const student = readDB().students.find((s) => s.id === id);
    if (!student) {
      return res.status(404).json({ message: "Студента не знайдено" });
    }
    res.json(student);
  } catch (error) {
    next(error);
  }
};

export const createStudent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, group } = req.body;
    if (!name || !email || !group) {
      return res
        .status(400)
        .json({ message: "Усі поля (ім'я, email, група) обов'язкові" });
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (mongoConnected) {
      const existing = await StudentModel.findOne({ email: trimmedEmail });
      if (existing) {
        return res
          .status(400)
          .json({ message: "Email вже використовується іншим студентом" });
      }

      const newStudent = {
        id: `std-${Date.now()}`,
        name: name.trim(),
        email: trimmedEmail,
        group: group.trim(),
        createdAt: new Date().toISOString(),
      };
      await StudentModel.create(newStudent);
      return res.status(201).json(newStudent);
    }

    const data = readDB();
    const existingJson = data.students.find(
      (s) => s.email.toLowerCase() === trimmedEmail,
    );
    if (existingJson) {
      return res
        .status(400)
        .json({ message: "Email вже використовується іншим студентом" });
    }

    const newStudentJson: Student = {
      id: `std-${Date.now()}`,
      name: name.trim(),
      email: trimmedEmail,
      group: group.trim(),
      createdAt: new Date().toISOString(),
    };
    data.students.push(newStudentJson);
    writeDB(data);
    res.status(201).json(newStudentJson);
  } catch (error: any) {
    next(error);
  }
};

export const updateStudent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { name, email, group } = req.body;
    if (!name || !email || !group) {
      return res
        .status(400)
        .json({ message: "Усі поля обов'язкові для оновлення" });
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (mongoConnected) {
      const student = await StudentModel.findOne({ id });
      if (!student) {
        return res.status(404).json({ message: "Студента не знайдено" });
      }

      const dup = await StudentModel.findOne({
        id: { $ne: id },
        email: trimmedEmail,
      });
      if (dup) {
        return res
          .status(400)
          .json({ message: "Email вже використовується іншим студентом" });
      }

      student.name = name.trim();
      student.email = trimmedEmail;
      student.group = group.trim();
      await student.save();
      return res.json(student);
    }

    const data = readDB();
    const index = data.students.findIndex((s) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ message: "Студента не знайдено" });
    }

    const dupJson = data.students.find(
      (s) => s.id !== id && s.email.toLowerCase() === trimmedEmail,
    );
    if (dupJson) {
      return res
        .status(400)
        .json({ message: "Email вже використовується іншим студентом" });
    }

    data.students[index] = {
      ...data.students[index],
      name: name.trim(),
      email: trimmedEmail,
      group: group.trim(),
    };
    writeDB(data);
    res.json(data.students[index]);
  } catch (error: any) {
    next(error);
  }
};

export const deleteStudent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (mongoConnected) {
      await StudentModel.deleteOne({ id });
      const { ResultModel: RawResultModel } = require("../models"); // avoid circular dependency or load safely
      const ResultModel = RawResultModel as any;
      await ResultModel.deleteMany({ studentId: id });
      return res.json({
        message: "Студента та його результати успішно видалено",
      });
    }

    const data = readDB();
    data.students = data.students.filter((s) => s.id !== id);
    data.results = data.results.filter((r) => r.studentId !== id);
    writeDB(data);
    res.json({ message: "Студента та його результати успішно видалено" });
  } catch (error) {
    next(error);
  }
};
