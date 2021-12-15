import express from "express";
import cors from "cors";

import { routes } from "./routes";
import { logErrors } from "./middlewares/logErrors";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(express.json());
app.use(cors());
app.use(routes);
app.use(logErrors)
app.use(errorHandler)

export { app };
