import "dotenv/config";
import express, { Application } from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use(errorHandler);

app.use("/api", routes);

export default app;
