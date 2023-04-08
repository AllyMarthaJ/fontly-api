import { Router } from "express";

import renderers from "./renderers";
import transformers from "./transformers";
import quickStart from "./quick-start";

const router = Router();

router.use("/render", renderers);
router.use("/transform", transformers);
router.use("/", quickStart);

export default router;
