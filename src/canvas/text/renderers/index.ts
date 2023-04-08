import { Router } from "express";
import { convertToPixelMap } from "./pixelMap";

const router = Router();

router.post("/pixelMap/:text", (req, res) => {
	const pixelMap = convertToPixelMap({
		...req.body,
		text: req.params.text,
	});

	const content = JSON.stringify(pixelMap);

	res.statusCode = 200;
	res.contentType("application/json");
	res.send(content);
});

export default router;
