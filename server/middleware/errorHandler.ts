import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Centralized Error Logged:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Помилка валідації даних",
      details: Object.values(err.errors).map((e: any) => e.message),
    });
  }

  // Duplicate key error in Mongoose
  if (err.code === 11000) {
    return res.status(400).json({
      message: "Запис із таким унікальним полем вже існує у базі даних",
    });
  }

  // Bad ObjectId format
  if (err.name === "CastError" && err.kind === "ObjectId") {
    return res.status(400).json({
      message: "Неправильний формат ідентифікатора (ObjectId)",
    });
  }

  // General server exception
  const status = err.status || 500;
  const message = err.message || "Внутрішня помилка сервера";
  res.status(status).json({ message });
};
