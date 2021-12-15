import { NextFunction, Request, Response } from "express";

import { prismaClient } from "../prisma/prismaClient";

class UserController {
  async index(request: Request, response: Response, next: NextFunction) {
    try {
      const users = await prismaClient.user.findMany({
        orderBy: [{ first_name: "asc" }, { last_name: "asc" }, { code: "asc" }],
      });

      return response.json(users);
    } catch (err) {
      next(err);
    }
  }

  async generateInviteCode(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const user_id = request.user_id || "";

      const expires_in = new Date();
      expires_in.setMinutes(expires_in.getMinutes() + 10);

      let code: number | null = null;

      do {
        code = Math.floor(Math.random() * 99999 + 10000);

        const inviteExists = await prismaClient.invite.findUnique({
          where: { code },
        });

        if (inviteExists) code = null;
      } while (!code);

      await prismaClient.invite.deleteMany({ where: { user_id } });

      const invite = await prismaClient.invite.create({
        data: {
          code,
          user_id,
          expires_in,
        },
      });

      return response.json(invite.code);
    } catch (err) {
      next(err);
    }
  }
}

export default new UserController();
