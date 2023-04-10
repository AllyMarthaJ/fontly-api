import { Router } from "express";
import text from "./text";
import transformers from "./transformers";
import image from "./image";

const router = Router();

router.use("/text", text);
router.use("/image", image);
router.use("/transform", transformers);

export default router;
