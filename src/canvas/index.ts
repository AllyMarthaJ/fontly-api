import { Router } from "express";
import text from "./text";
import transformers from "./transformers";

const router = Router();

router.use("/text", text);
router.use("/transform", transformers);

export default router;
