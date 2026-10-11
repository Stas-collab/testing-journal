import { asyncHandler } from "../middleware/asyncHandler";
import { getServices } from "../services";

export const getQuestionAnalytics = asyncHandler(async (_req, res) => {
  res.json(await getServices().analytics.questionDifficulty());
});

export const getRecommendations = asyncHandler(async (req, res) => {
  res.json(
    await getServices().analytics.recommendations(
      req.params.studentId,
      req.userRole,
      req.userId,
    ),
  );
});
