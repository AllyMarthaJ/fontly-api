import { Router } from "express";
import text from "./text";

const router = Router();

router.use("/text", text);

export default router;
