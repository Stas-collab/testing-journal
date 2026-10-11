import { Router } from "express";
import studentRoutes from "./studentRoutes";
import testRoutes from "./testRoutes";
import resultRoutes from "./resultRoutes";
import analyticsRoutes from "./analyticsRoutes";

const router = Router();

router.use("/students", studentRoutes);
router.use("/tests", testRoutes);
router.use("/results", resultRoutes);
router.use("/analytics", analyticsRoutes);

export default router;
