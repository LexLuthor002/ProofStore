import { Router, type IRouter } from "express";
import healthRouter from "./health";
import suiRpcRouter from "./sui-rpc";
import walrusRouter from "./walrus";
import certificatesRouter from "./certificates";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/sui-rpc", suiRpcRouter);
router.use("/walrus", walrusRouter);
router.use("/certificates", certificatesRouter);

export default router;
