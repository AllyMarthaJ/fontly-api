import { Router } from "express";
import { transformAverage } from "./average";

const router = Router();

router.post("/average", (req, res) => {
	const average = transformAverage(req.body.data, req.body);

	res.statusCode = 200;
	res.send(average);
});

export default router;
