import { NextFunction, Request, Response } from "express";
import { sign } from "jsonwebtoken";

import { prismaClient } from "../prisma/prismaClient";

class AuthController {
  async signIn(request: Request, response: Response, next: NextFunction) {
    try {
      const { phone_number } = request.body;

      const user = await prismaClient.user.findUnique({
        where: { phone_number },
        include: {
          experience: true,
        },
      });

      if (!user) return response.status(401).json({ message: "Unauthorized" });

      const token = sign({ sub: user.id }, String(process.env.APP_KEY), {
        expiresIn: "1d",
      });

      return response.json({ token, user });
    } catch (err) {
      next(err);
    }
  }

  async signUp(request: Request, response: Response, next: NextFunction) {
    try {
      const {
        first_name,
        last_name,
        phone_number,
        experience_id,
        is_trainer,
        invite_code,
      } = request.body;

      let userExists = await prismaClient.user.findUnique({
        where: { phone_number },
      });

      if (userExists)
        return response.status(409).json({ message: "User already exists" });

      if (is_trainer) {
        await prismaClient.invite.deleteMany({
          where: { expires_in: { lt: new Date() } },
        });

        const invite = await prismaClient.invite.findFirst({
          where: { code: Number(invite_code) },
        });

        if (!invite)
          return response.status(401).json({ message: "Unauthorized" });
      }

      let code;

      do {
        code = Math.floor(Math.random() * 9999) + 1000;

        userExists = await prismaClient.user.findFirst({
          where: { first_name, last_name, code },
        });
      } while (userExists);

      const experience = await prismaClient.experience.findUnique({
        where: { id: experience_id },
      });

      if (!experience)
        return response.status(400).json({ message: "Invalid experience" });

      const xp_to_next_level = Math.pow(
        (experience.level + 1) * Number(process.env.DATABASE_USER_XP_MULTIPIER),
        2
      );

      const user = await prismaClient.user.create({
        data: {
          first_name,
          last_name,
          code,
          phone_number,
          level: experience.level,
          xp_to_next_level,
          is_trainer,
          experience_id,
          training_frequency_hours: Number(
            process.env.DATABASE_USER_TRAINING_FREQUENCY
          ),
        },
      });

      return response.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }
}

export default new AuthController();
