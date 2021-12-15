import { NextFunction, Request, Response } from "express";

import { prismaClient } from "../prisma/prismaClient";

class ExperienceController {
  async index(request: Request, response: Response, next: NextFunction) {
    try {
      const experiences = await prismaClient.experience.findMany({
        orderBy: { level: "asc" },
      });

      return response.json(experiences);
    } catch (err) {
      next(err);
    }
  }

  async store(request: Request, response: Response, next: NextFunction) {
    try {
      let { name, level, ...data } = request.body;

      const deleteRelations = [
        "user",
        "exerciseMin",
        "exerciseMax",
        "training",
      ];

      deleteRelations.forEach((relation) => delete data[relation]);

      level = parseInt(level);

      if (level <= 0)
        return response.status(400).json({ message: "Invalid level" });

      const experienceExists = await prismaClient.experience.findFirst({
        where: { OR: [{ level }, { name }] },
      });

      if (experienceExists)
        return response
          .status(409)
          .json({ message: "Experience already exists" });

      const experience = await prismaClient.experience.create({
        data: {
          ...data,
          name,
          level,
        },
      });

      return response.status(201).json(experience);
    } catch (err) {
      next(err);
    }
  }

  async update(request: Request, response: Response, next: NextFunction) {
    try {
      const { id } = request.params;
      const { ...data } = request.body;

      const deleteRelations = [
        "user",
        "exerciseMin",
        "exerciseMax",
        "training",
      ];

      deleteRelations.forEach((relation) => delete data[relation]);

      if (data.level) data.level = parseInt(data.level);

      const orData = [];

      for (let key in data) orData.push({ [key]: data[key] });

      const experienceExists = await prismaClient.experience.findFirst({
        where: {
          NOT: { id },
          AND: { OR: orData },
        },
      });

      if (experienceExists)
        return response.status(409).json({ message: "Experience conflict" });

      const experience = await prismaClient.experience.update({
        where: { id },
        data,
      });

      return response.json(experience);
    } catch (err) {
      next(err);
    }
  }

  async delete(request: Request, response: Response, next: NextFunction) {
    try {
      const { id } = request.params;

      await prismaClient.experience.delete({ where: { id } });

      return response.end();
    } catch (err) {
      next(err);
    }
  }
}

export default new ExperienceController();
