import { NextFunction, Request, Response } from "express";

import { prismaClient } from "../prisma/prismaClient";

class ExerciseController {
  async index(request: Request, response: Response, next: NextFunction) {
    try {
      const exercises = await prismaClient.exercise.findMany({
        orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
        include: {
          category: true,
          minExperience: true,
          maxExperience: true,
        },
      });

      return response.json(exercises);
    } catch (err) {
      next(err);
    }
  }

  async store(request: Request, response: Response, next: NextFunction) {
    try {
      let { name, xp_amount, ...data } = request.body;

      const deleteRelations = [
        "category",
        "minExperience",
        "maxExperience",
        "trainingItem",
        "currentExercise",
      ];

      deleteRelations.forEach((relation) => delete data[relation]);

      xp_amount = parseInt(request.body.xp_amount);

      if (xp_amount <= 0)
        return response.status(400).json({ message: "Invalid xp_amount" });

      const exerciseExists = await prismaClient.exercise.findFirst({
        where: { name },
      });

      if (exerciseExists)
        return response
          .status(409)
          .json({ message: "Exercise already exists" });

      const exercise = await prismaClient.exercise.create({
        data: {
          ...data,
          name,
          xp_amount,
        },
      });

      return response.status(201).json(exercise);
    } catch (err) {
      next(err);
    }
  }

  async update(request: Request, response: Response, next: NextFunction) {
    try {
      const { id } = request.params;
      const { name, ...data } = request.body;

      const orData = [];
      const deleteRelations = [
        "category",
        "minExperience",
        "maxExperience",
        "trainingItem",
        "currentExercise",
      ];

      deleteRelations.forEach((relation) => delete data[relation]);

      if (data.xp_amount) data.xp_amount = parseInt(data.xp_amount);

      for (let key in data) orData.push({ [key]: data[key] });

      const exerciseExists = await prismaClient.exercise.findFirst({
        where: {
          NOT: { id },
          AND: { name },
        },
      });

      if (exerciseExists)
        return response.status(409).json({ message: "Exercises conflict" });

      const exercise = await prismaClient.exercise.update({
        where: { id },
        data,
      });

      return response.json(exercise);
    } catch (err) {
      next(err);
    }
  }

  async delete(request: Request, response: Response, next: NextFunction) {
    try {
      const { id } = request.params;

      await prismaClient.exercise.delete({ where: { id } });

      return response.end();
    } catch (err) {
      next(err);
    }
  }
}

export default new ExerciseController();
