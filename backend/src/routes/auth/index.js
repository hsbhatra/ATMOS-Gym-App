import { Router } from "express";
import authenticationRoutes from "./authentication.routes.js";
import passwordRoutes from "./password.routes.js";

const authRouter = Router();

authRouter.use("/", authenticationRoutes);
authRouter.use("/", passwordRoutes);

export default authRouter;
