import { Router } from "express";
import { requireRole } from "../middleware/authMiddleware";
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/studentController";

const router = Router();

router.get("/", requireRole(["teacher", "student"]), getStudents);
router.get("/:id", requireRole(["teacher", "student"]), getStudentById);
router.post("/", requireRole(["teacher"]), createStudent);
router.put("/:id", requireRole(["teacher"]), updateStudent);
router.delete("/:id", requireRole(["teacher"]), deleteStudent);

export default router;
