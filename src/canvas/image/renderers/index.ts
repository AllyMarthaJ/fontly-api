import { Router } from "express";
import upload from "multer";
import { convertToPixelMap } from "./pixelMap";

const router = Router();
const multerUpload = upload();

router.post(
	"/pixelMap",
	multerUpload.single("image"),
	async (req, res, next) => {
		if (!req.file || !req.file.buffer) {
			next();
		}
		const pixelMap = await convertToPixelMap(req.file!.buffer!, {
			resizeFactor: req.body.resizeFactor,
		});

		const content = JSON.stringify(pixelMap);

		res.statusCode = 200;
		res.contentType("application/json");
		res.send(content);
	}
);

export default router;
