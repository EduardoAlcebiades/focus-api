import { NextFunction, Request, Response } from "express";

import { prismaClient } from "../prisma/prismaClient";

class TrainingController {
  async index(request: Request, response: Response, next: NextFunction) {
    try {
      const trainings = await prismaClient.training.findMany({
        orderBy: [
          { user: { first_name: "asc" } },
          { user: { last_name: "asc" } },
          { user: { code: "asc" } },
          { experience: { level: "asc" } },
          { week_day: "asc" },
        ],
        include: {
          experience: true,
          user: true,
          trainingItems: {
            include: { category: true, exercise: true },
            orderBy: { category: { name: "asc" } },
          },
        },
      });

      return response.json(trainings);
    } catch (err) {
      next(err);
    }
  }

  async store(request: Request, response: Response, next: NextFunction) {
    try {
      let { name, week_day, trainingItems, ...data } = request.body;

      const deleteRelations = ["user", "experience", "trainingItem", "current"];
      const deleteItemRelations = ["training", "category", "exercise"];

      deleteRelations.forEach((relation) => delete data[relation]);

      week_day = week_day !== undefined ? Number(week_day) : null;

      trainingItems =
        trainingItems?.map((item: any) => {
          deleteItemRelations.forEach((relation) => delete item[relation]);

          delete item.training_id;

          if (item.exercise_id) item.category_id = null;
          else item.exercise_id = null;

          item.amount =
            item.amount !== undefined && item.category_id
              ? Number(item.amount)
              : null;
          item.series = Number(item.series);
          item.times = Number(item.times);

          return item;
        }) || [];

      trainingItems = trainingItems.reduce((a: Array<any>, b: any) => {
        const i = a.findIndex(
          (item) =>
            (item.category_id === b.category_id ||
              item.exercise_id === b.exercise_id) &&
            item.series === b.series &&
            item.times === b.times
        );

        if (i > -1 && a[i].category_id) a[i].amount += b.amount;

        return i === -1 && a.push(b), a;
      }, []);

      if (week_day !== null && (week_day < 0 || week_day > 6))
        return response.status(400).json({ message: "Invalid week_day" });

      const training = await prismaClient.training.create({
        data: {
          ...data,
          name,
          week_day,
          trainingItems: {
            create: trainingItems,
          },
        },
      });

      return response.status(201).json(training);
    } catch (err) {
      next(err);
    }
  }

  async update(request: Request, response: Response, next: NextFunction) {
    try {
      const { id } = request.params;
      let { trainingItems, ...data } = request.body;

      const deleteRelations = ["user", "experience", "trainingItem", "current"];
      const deleteItemRelations = ["training", "category", "exercise"];

      deleteRelations.forEach((relation) => delete data[relation]);

      if (data.week_day) data.week_day = Number(data.week_day);

      if (data.week_day !== null && (data.week_day < 0 || data.week_day > 6))
        return response.status(400).json({ message: "Invalid week_day" });

      trainingItems =
        trainingItems?.map((item: any) => {
          deleteItemRelations.forEach((relation) => delete item[relation]);

          delete item.training_id;

          if (item.exercise_id) item.category_id = null;
          else item.exercise_id = null;

          item.amount =
            item.amount !== undefined && item.category_id
              ? Number(item.amount)
              : null;
          item.series = Number(item.series);
          item.times = Number(item.times);

          return item;
        }) || [];

      trainingItems = trainingItems.reduce((a: Array<any>, b: any) => {
        const i = a.findIndex(
          (item) =>
            ((!item.exercise_id && item.category_id === b.category_id) ||
              (!item.category_id && item.exercise_id === b.exercise_id)) &&
            item.series === b.series &&
            item.times === b.times
        );

        if (i > -1 && a[i].category_id) a[i].amount += b.amount;

        return i === -1 && a.push(b), a;
      }, []);

      const training = await prismaClient.training.update({
        where: { id },
        data: {
          ...data,
          trainingItems: {
            deleteMany: {},
            create: trainingItems,
          },
        },
      });

      return response.json(training);
    } catch (err) {
      next(err);
    }
  }

  async delete(request: Request, response: Response, next: NextFunction) {
    try {
      const { id } = request.params;

      await prismaClient.$transaction([
        prismaClient.trainingItem.deleteMany({ where: { training_id: id } }),
        prismaClient.training.delete({ where: { id } }),
      ]);

      return response.end();
    } catch (err) {
      next(err);
    }
  }
}

export default new TrainingController();
