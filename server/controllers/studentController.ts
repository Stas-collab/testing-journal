import { asyncHandler } from "../middleware/asyncHandler";
import { getServices } from "../services";

export const getStudents = asyncHandler(async (_req, res) => {
  res.json(await getServices().students.list());
});

export const getStudentById = asyncHandler(async (req, res) => {
  res.json(await getServices().students.getById(req.params.id));
});

export const createStudent = asyncHandler(async (req, res) => {
  res.status(201).json(await getServices().students.create(req.body));
});

export const updateStudent = asyncHandler(async (req, res) => {
  res.json(await getServices().students.update(req.params.id, req.body));
});

export const deleteStudent = asyncHandler(async (req, res) => {
  await getServices().students.remove(req.params.id);
  res.json({ message: "Студента та його результати успішно видалено" });
});
