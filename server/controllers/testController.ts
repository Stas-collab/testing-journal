import { asyncHandler } from "../middleware/asyncHandler";
import { getServices } from "../services";

export const getTests = asyncHandler(async (_req, res) => {
  res.json(await getServices().tests.list());
});

export const getTestById = asyncHandler(async (req, res) => {
  res.json(await getServices().tests.getById(req.params.id));
});

export const createTest = asyncHandler(async (req, res) => {
  res.status(201).json(await getServices().tests.create(req.body));
});

export const updateTest = asyncHandler(async (req, res) => {
  res.json(await getServices().tests.update(req.params.id, req.body));
});

export const deleteTest = asyncHandler(async (req, res) => {
  await getServices().tests.remove(req.params.id);
  res.json({ message: "Тест успішно видалено" });
});
