import { Router } from "express";
import studentRoutes from "./studentRoutes";
import testRoutes from "./testRoutes";
import resultRoutes from "./resultRoutes";

const router = Router();

router.use("/students", studentRoutes);
router.use("/tests", testRoutes);
router.use("/results", resultRoutes);

export default router;
