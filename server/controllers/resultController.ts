import { asyncHandler } from "../middleware/asyncHandler";
import { getServices } from "../services";

export const getResults = asyncHandler(async (_req, res) => {
  res.json(await getServices().results.listAll());
});

export const getResultById = asyncHandler(async (req, res) => {
  res.json(
    await getServices().results.getById(
      req.params.id,
      req.userRole,
      req.userId,
    ),
  );
});

export const getResultsByStudent = asyncHandler(async (req, res) => {
  res.json(
    await getServices().results.listByStudent(
      req.params.studentId,
      req.userRole,
      req.userId,
    ),
  );
});

export const createResult = asyncHandler(async (req, res) => {
  res
    .status(201)
    .json(await getServices().results.submit(req.userId || "", req.body));
});

export const deleteResult = asyncHandler(async (req, res) => {
  await getServices().results.remove(req.params.id);
  res.json({ message: "Результат успішно видалено" });
});
