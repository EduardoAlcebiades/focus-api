import { CurrentExercise, Exercise } from "@prisma/client";

import { prismaClient } from "../prisma/prismaClient";

export class CurrentService {
  private randomPick(items: string[]) {
    return items[Math.random() * items.length];
  }

  async getCurrentStatus(user_id: string) {
    const user = await prismaClient.user.findUnique({ where: { id: user_id } });

    const activeCurrent = await prismaClient.current.findFirst({
      where: { user_id, ended_at: null },
      include: {
        user: true,
        training: true,
        currentExercises: {
          include: { exercise: { include: { category: true } } },
        },
      },
    });

    const lastFinishedCurrent = await prismaClient.current.findFirst({
      where: { user_id, ended_at: { not: null } },
      orderBy: { ended_at: "desc" },
    });

    const lastFinishedCurrentDate = lastFinishedCurrent?.started_at || null;

    const nextAvaliable = lastFinishedCurrentDate;

    nextAvaliable?.setMinutes(
      nextAvaliable.getMinutes() + Number(user?.training_frequency_hours)
    );

    const hasAvailableCurrent = Boolean(
      !activeCurrent &&
        (!lastFinishedCurrentDate ||
          (nextAvaliable && nextAvaliable < new Date()))
    );

    return {
      activeCurrent,
      hasAvailableCurrent,
      lastFinishedCurrentDate: lastFinishedCurrentDate?.toISOString() || null,
    };
  }

  async startNewCurrent(user_id: string) {
    const user = await prismaClient.user.findUnique({
      where: { id: user_id },
      include: {
        experience: true,
      },
    });

    const availableTrainings = await prismaClient.training.findMany({
      where: {
        AND: [
          { OR: [{ user_id: null }, { user_id: user?.id }] },
          {
            OR: [
              { experience_id: null },
              { experience_id: user?.experience_id },
            ],
          },
          { OR: [{ week_day: null }, { week_day: new Date().getDay() }] },
          {
            trainingItems: {
              some: {
                OR: [
                  { category: { exercises: { some: {} } } },
                  { exercise: {} },
                ],
              },
            },
          },
        ],
      },
      include: {
        trainingItems: true,
        experience: true,
      },
    });

    if (!availableTrainings.length) return false;

    const training =
      availableTrainings[Math.floor(Math.random() * availableTrainings.length)];

    const currentExercises: Array<{
      series: number;
      times: number;
      exercise_id: string;
    }> = [];

    if (!training) return;

    for (let i = 0; i < training.trainingItems.length; i++) {
      const item = training.trainingItems[i];

      const { series, times } = item;

      if (item.exercise_id) {
        const exercise = await prismaClient.exercise.findFirst({
          where: {
            AND: [
              { id: item.exercise_id },
              {
                id: {
                  notIn: currentExercises.map(
                    (currentExercise) => currentExercise.exercise_id
                  ),
                },
              },
            ],
          },
        });

        if (exercise)
          currentExercises.push({ series, times, exercise_id: exercise.id });

        continue;
      }

      const exercisesLength = await prismaClient.exercise.count({
        where: { category_id: String(item.category_id) },
      });
      const skip = Math.floor(
        Math.random() * Math.abs(exercisesLength - Number(item.amount))
      );
      const orderDir = this.randomPick(["asc", "desc"]);
      const orderBy = this.randomPick([
        "id",
        "name",
        "xp_amount",
        "category_id",
        "min_experience_id",
        "max_experience_id",
      ] as Array<keyof Exercise>);

      const exercises = await prismaClient.exercise.findMany({
        where: {
          AND: [
            { category_id: String(item.category_id) },
            {
              OR: [
                { min_experience_id: null },
                {
                  minExperience: {
                    level: {
                      gte: training.experience?.level || user?.experience.level,
                    },
                  },
                },
              ],
            },
            {
              OR: [
                { max_experience_id: null },
                {
                  maxExperience: {
                    level: {
                      lte: training.experience?.level || user?.experience.level,
                    },
                  },
                },
              ],
            },
            {
              id: {
                notIn: currentExercises.map(
                  (currentExercise) => currentExercise.exercise_id
                ),
              },
            },
          ],
        },
        take: Number(item.amount),
        skip,
        orderBy: {
          [orderBy]: orderDir,
        },
      });

      exercises.forEach((exercise) =>
        currentExercises.push({
          series,
          times,
          exercise_id: exercise.id,
        })
      );
    }

    await prismaClient.current.create({
      data: {
        training_id: training.id,
        user_id,
        currentExercises: {
          create: currentExercises,
        },
      },
    });

    return true;
  }

  async stopActiveCurrents(user_id: string) {
    const user = await prismaClient.user.findUnique({ where: { id: user_id } });

    const trainings = await prismaClient.current.findMany({
      where: { user_id, ended_at: null },
      include: {
        currentExercises: {
          include: {
            exercise: true,
          },
        },
      },
    });

    let xp_earned = 0;

    const transactions = [];

    for (let i = 0; i < trainings.length; i++) {
      const { id, currentExercises } = trainings[i];

      currentExercises.forEach(
        (item) => item.concluded_at && (xp_earned += item.exercise.xp_amount)
      );

      transactions.push({
        where: { id },
        data: {
          ended_at: new Date(),
          currentExercises: {
            updateMany: {
              where: { concluded_at: null, exited_at: null },
              data: {
                exited_at: new Date(),
              },
            },
          },
        },
      });
    }

    const userData = {
      current_xp: Number(user?.current_xp) + xp_earned,
      level: Number(user?.level),
      xp_to_next_level: Number(user?.xp_to_next_level),
    };

    while (userData.current_xp >= userData.xp_to_next_level) {
      userData.current_xp = userData.current_xp - userData.xp_to_next_level;
      userData.level = userData.level + 1;
      userData.xp_to_next_level = Math.pow(
        (userData.level + 1) * Number(process.env.DATABASE_USER_XP_MULTIPIER),
        2
      );
    }

    await prismaClient.$transaction([
      prismaClient.user.update({
        where: { id: user_id },
        data: userData,
      }),
      ...transactions.map((transaction) =>
        prismaClient.current.update(transaction)
      ),
    ]);
  }

  async manageCurrentExercise(
    user_id: string,
    id: string,
    status: "concluded" | "skiped" | "reseted"
  ) {
    const data: CurrentExercise = {} as CurrentExercise;

    if (status === "concluded") data.concluded_at = new Date();
    else if (status === "skiped") data.exited_at = new Date();
    else if (status === "reseted") {
      data.concluded_at = null;
      data.exited_at = null;
    }

    await prismaClient.currentExercise.updateMany({
      where: { id, current: { user_id } },
      data,
    });
  }
}
