import { NextFunction, Request, Response } from "express";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

export function errorHandler(
  err: PrismaClientKnownRequestError,
  request: Request,
  response: Response,
  next: NextFunction
) {
  const { code, message, meta, stack } = err;

  if (code === "P2001" || code === "P2003") response.status(400);
  else if (code === "P2002") response.status(409);
  else if (code === "P2005") response.status(403);
  else response.status(500);

  return response.json({ error: meta || message, stack });
}
