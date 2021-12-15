import { Router } from "express";

import { convertEmptyStringsToNull } from "./middlewares/convertEmptyStringsToNull";
import { ensureAuthenticated } from "./middlewares/ensureAuthenticates";
import { ensureIsTrainer } from "./middlewares/ensureIsTrainer";

import AuthController from "./controllers/AuthController";
import CategoryController from "./controllers/CategoryController";
import ExerciseController from "./controllers/ExerciseController";
import ExperienceController from "./controllers/ExperienceController";
import TrainingController from "./controllers/TrainingController";
import UserController from "./controllers/UserController";
import CurrentController from "./controllers/CurrentController";

const routes = Router();

routes.use(convertEmptyStringsToNull);

routes.post("/signin", AuthController.signIn);
routes.post("/signup", AuthController.signUp);

routes.get("/category", ensureAuthenticated, CategoryController.index);
routes.post(
  "/category",
  ensureAuthenticated,
  ensureIsTrainer,
  CategoryController.store
);
routes.put(
  "/category/:id",
  ensureAuthenticated,
  ensureIsTrainer,
  CategoryController.update
);
routes.delete(
  "/category/:id",
  ensureAuthenticated,
  ensureIsTrainer,
  CategoryController.delete
);

routes.get("/exercise", ensureAuthenticated, ExerciseController.index);
routes.post(
  "/exercise",
  ensureAuthenticated,
  ensureIsTrainer,
  ExerciseController.store
);
routes.put(
  "/exercise/:id",
  ensureAuthenticated,
  ensureIsTrainer,
  ExerciseController.update
);
routes.delete(
  "/exercise/:id",
  ensureAuthenticated,
  ensureIsTrainer,
  ExerciseController.delete
);

routes.get("/experience", ExperienceController.index);
routes.post(
  "/experience",
  ensureAuthenticated,
  ensureIsTrainer,
  ExperienceController.store
);
routes.put(
  "/experience/:id",
  ensureAuthenticated,
  ensureIsTrainer,
  ExperienceController.update
);
routes.delete(
  "/experience/:id",
  ensureAuthenticated,
  ExperienceController.delete
);

routes.get("/training", ensureAuthenticated, TrainingController.index);
routes.post(
  "/training",
  ensureAuthenticated,
  ensureIsTrainer,
  TrainingController.store
);
routes.put(
  "/training/:id",
  ensureAuthenticated,
  ensureIsTrainer,
  TrainingController.update
);
routes.delete(
  "/training/:id",
  ensureAuthenticated,
  ensureIsTrainer,
  TrainingController.delete
);

routes.get("/user", ensureAuthenticated, UserController.index);
routes.get(
  "/user/invite_code",
  ensureAuthenticated,
  ensureIsTrainer,
  UserController.generateInviteCode
);

routes.get(
  "/current/active",
  ensureAuthenticated,
  CurrentController.getCurrentStatus
);
routes.post(
  "/current/start",
  ensureAuthenticated,
  CurrentController.startCurrent
);
routes.put(
  "/current/active/stop",
  ensureAuthenticated,
  CurrentController.stopCurrent
);
routes.put(
  "/current/active/exercise/:exercise_id/finish",
  ensureAuthenticated,
  CurrentController.completeCurrentExercise
);
routes.put(
  "/current/active/exercise/:exercise_id/skip",
  ensureAuthenticated,
  CurrentController.skipCurrentExercise
);
routes.put(
  "/current/active/exercise/:exercise_id/restore",
  ensureAuthenticated,
  CurrentController.restoreCurrentExercise
);

export { routes };
