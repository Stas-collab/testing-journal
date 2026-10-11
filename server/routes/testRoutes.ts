import { Router } from "express";
import { requireRole } from "../middleware/authMiddleware";
import {
  getTests,
  getTestById,
  createTest,
  updateTest,
  deleteTest,
} from "../controllers/testController";

const router = Router();

router.get("/", requireRole(["teacher", "student"]), getTests);
router.get("/:id", requireRole(["teacher", "student"]), getTestById);
router.post("/", requireRole(["teacher"]), createTest);
router.put("/:id", requireRole(["teacher"]), updateTest);
router.delete("/:id", requireRole(["teacher"]), deleteTest);

export default router;
