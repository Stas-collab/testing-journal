import { Router } from "express";
import { requireRole } from "../middleware/authMiddleware";
import {
  getResults,
  getResultById,
  getResultsByStudent,
  createResult,
  deleteResult,
} from "../controllers/resultController";

const router = Router();

router.get("/", requireRole(["teacher"]), getResults);
router.post("/", requireRole(["student"]), createResult);
router.get("/:id", requireRole(["teacher", "student"]), getResultById);
router.get(
  "/student/:studentId",
  requireRole(["teacher", "student"]),
  getResultsByStudent,
);
router.delete("/:id", requireRole(["teacher"]), deleteResult);

export default router;
