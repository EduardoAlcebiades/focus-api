import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { NextFunction, Request, Response } from "express";

export function logErrors(
  err: PrismaClientKnownRequestError,
  request: Request,
  response: Response,
  next: NextFunction
) {
  console.error(err);

  next(err);
}
