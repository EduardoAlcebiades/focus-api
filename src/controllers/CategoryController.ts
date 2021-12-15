import { NextFunction, Request, Response } from "express";

import { prismaClient } from "../prisma/prismaClient";

class CategoryController {
  async index(request: Request, response: Response, next: NextFunction) {
    try {
      const categories = await prismaClient.category.findMany({
        orderBy: { name: "asc" },
      });

      return response.json(categories);
    } catch (err) {
      next(err);
    }
  }

  async store(request: Request, response: Response, next: NextFunction) {
    try {
      const { name, ...data } = request.body;

      const categoryExists = await prismaClient.category.findFirst({
        where: { name },
      });

      const deleteRelations = ["exercise", "trainingItem"];

      deleteRelations.forEach((relation) => delete data[relation]);

      if (categoryExists)
        return response
          .status(409)
          .json({ message: "Category already exists" });

      const category = await prismaClient.category.create({
        data: {
          ...data,
          name,
        },
      });

      return response.status(201).json(category);
    } catch (err) {
      next(err);
    }
  }

  async update(request: Request, response: Response, next: NextFunction) {
    try {
      const { id } = request.params;
      const { name, ...data } = request.body;

      const deleteRelations = ["exercise", "trainingItem"];

      deleteRelations.forEach((relation) => delete data[relation]);

      const categoryExists = await prismaClient.category.findFirst({
        where: {
          NOT: { id },
          AND: { name },
        },
      });

      if (categoryExists)
        return response.status(409).json({ message: "Category conflict" });

      const category = await prismaClient.category.update({
        where: { id },
        data: { ...data, name },
      });

      return response.json(category);
    } catch (err) {
      next(err);
    }
  }

  async delete(request: Request, response: Response, next: NextFunction) {
    try {
      const { id } = request.params;

      await prismaClient.category.delete({ where: { id } });

      return response.end();
    } catch (err) {
      next(err);
    }
  }
}

export default new CategoryController();
