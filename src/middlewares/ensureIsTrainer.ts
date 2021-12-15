import { NextFunction, Request, Response } from "express";
import { prismaClient } from "../prisma/prismaClient";

export async function ensureIsTrainer(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const user = await prismaClient.user.findUnique({
      where: { id: request.user_id },
    });

    if (!user?.is_trainer)
      return response.status(401).json({ message: "Unauthorized" });

    next();
  } catch {
    return response.status(401).json({ message: "Unauthorized" });
  }
}
