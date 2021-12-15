import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

export function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const requestToken = request.headers.authorization;

    if (!requestToken)
      return response.status(401).json({ message: "Unauthorized" });

    const [, token] = requestToken.split(" ");

    const { sub } = verify(token, String(process.env.APP_KEY));

    request.user_id = sub as string;

    next();
  } catch {
    return response.status(401).json({ message: "Unauthorized" });
  }
}
