import { Request, Response, NextFunction } from "express";

export const extractUserRole = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.userRole = (req.headers["x-user-role"] as string) || "";
  req.userId = (req.headers["x-user-id"] as string) || "";
  next();
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.userRole || "";
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: `Доступ заборонено. Потрібна роль: ${allowedRoles.join(" або ")}, ваша роль: ${userRole || "гість"}`,
      });
    }
    next();
  };
};
