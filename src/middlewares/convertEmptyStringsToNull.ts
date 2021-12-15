import { NextFunction, Request, Response } from "express";

export function convertEmptyStringsToNull(
  request: Request,
  response: Response,
  next: NextFunction
) {
  for (let key in request.body) {
    const item = request.body[key];

    if (typeof item === "string" && item.trim() === "")
      request.body[key] = null;
  }

  next();
}