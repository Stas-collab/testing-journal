import { Router } from "express";
import { requireRole } from "../middleware/authMiddleware";
import {
  getQuestionAnalytics,
  getRecommendations,
} from "../controllers/analyticsController";

const router = Router();

router.get("/questions", requireRole(["teacher"]), getQuestionAnalytics);
router.get(
  "/recommendations/:studentId",
  requireRole(["teacher", "student"]),
  getRecommendations,
);

export default router;
