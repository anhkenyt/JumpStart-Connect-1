import { Router, type IRouter } from "express";
import healthRouter from "./health";
import jumpstartRouter from "./jumpstart";

const router: IRouter = Router();

router.use(healthRouter);
router.use(jumpstartRouter);

export default router;
