import { NextFunction, Request, Response } from "express";
import { prismaClient } from "../prisma/prismaClient";
import { CurrentService } from "../services/CurrentService";

class CurrentController {
  async getCurrentStatus(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      if (!request.user_id)
        return response.status(401).json({ message: "Unauthorized" });

      const service = new CurrentService();
      const currentStatus = await service.getCurrentStatus(request.user_id);

      return response.json(currentStatus);
    } catch (err) {
      next(err);
    }
  }

  async startCurrent(request: Request, response: Response, next: NextFunction) {
    try {
      if (!request.user_id)
        return response.status(401).json({ message: "Unauthorized" });

      const service = new CurrentService();
      let currentStatus = await service.getCurrentStatus(request.user_id);

      if (!currentStatus.hasAvailableCurrent)
        return response.json(currentStatus);

      const canCreateCurrent = await service.startNewCurrent(request.user_id);

      if (!canCreateCurrent)
        return response.status(404).json({ message: "Training unavailables" });

      currentStatus = await service.getCurrentStatus(request.user_id);

      return response.json(currentStatus);
    } catch (err) {
      next(err);
    }
  }

  async stopCurrent(request: Request, response: Response, next: NextFunction) {
    try {
      if (!request.user_id)
        return response.status(401).json({ message: "Unauthorized" });

      const service = new CurrentService();
      let currentStatus = await service.getCurrentStatus(request.user_id);

      if (!currentStatus.activeCurrent) return response.json(currentStatus);

      await service.stopActiveCurrents(request.user_id);

      currentStatus = await service.getCurrentStatus(request.user_id);

      return response.json(currentStatus);
    } catch (err) {
      next(err);
    }
  }

  async completeCurrentExercise(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const { exercise_id } = request.params;

      if (!request.user_id)
        return response.status(401).json({ message: "Unauthorized" });

      const service = new CurrentService();
      let currentStatus = await service.getCurrentStatus(request.user_id);

      if (!currentStatus.activeCurrent) return response.json(currentStatus);

      if (
        !currentStatus.activeCurrent.currentExercises.some(
          (item) => item.id === exercise_id
        )
      )
        return response.status(409).send("Unavailable to manage this exercise");

      await service.manageCurrentExercise(
        request.user_id,
        exercise_id,
        "concluded"
      );

      currentStatus = await service.getCurrentStatus(request.user_id);

      return response.json(currentStatus);
    } catch (err) {
      next(err);
    }
  }

  async skipCurrentExercise(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const { exercise_id } = request.params;

      if (!request.user_id)
        return response.status(401).json({ message: "Unauthorized" });

      const service = new CurrentService();
      let currentStatus = await service.getCurrentStatus(request.user_id);

      if (!currentStatus.activeCurrent) return response.json(currentStatus);

      if (
        !currentStatus.activeCurrent.currentExercises.some(
          (item) => item.id === exercise_id
        )
      )
        return response.status(409).send("Unavailable to manage this exercise");

      await service.manageCurrentExercise(
        request.user_id,
        exercise_id,
        "skiped"
      );

      currentStatus = await service.getCurrentStatus(request.user_id);

      return response.json(currentStatus);
    } catch (err) {
      next(err);
    }
  }

  async restoreCurrentExercise(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const { exercise_id } = request.params;

      if (!request.user_id)
        return response.status(401).json({ message: "Unauthorized" });

      const service = new CurrentService();
      let currentStatus = await service.getCurrentStatus(request.user_id);

      if (!currentStatus.activeCurrent) return response.json(currentStatus);

      if (
        !currentStatus.activeCurrent.currentExercises.some(
          (item) => item.id === exercise_id
        )
      )
        return response.status(409).send("Unavailable to manage this exercise");

      await service.manageCurrentExercise(
        request.user_id,
        exercise_id,
        "reseted"
      );

      currentStatus = await service.getCurrentStatus(request.user_id);

      return response.json(currentStatus);
    } catch (err) {
      next(err);
    }
  }
}

export default new CurrentController();
