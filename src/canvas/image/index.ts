import { Router } from "express";
import renderers from "./renderers";
import quickStart from "./quick-start";

const router = Router();

router.use("/render", renderers);
router.use("/", quickStart);

export default router;
