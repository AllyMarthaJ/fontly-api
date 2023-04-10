import { Router } from "express";
import upload from "multer";
import { DrawOptions, convertToPixelMap } from "./pixelMap";
import { typeMap } from "../../../helpers/type-map";

const router = Router();
const multerUpload = upload();

router.get("/pixelMap", (_, res) => {
	const exampleBody: PixelMapRequest = {
		image: Buffer.from([]),
		resizeFactor: 0.5,
	};

	const mappedType = typeMap({
		body: exampleBody,
	});

	const content = JSON.stringify(mappedType);

	res.statusCode = 200;
	res.contentType("application/json");
	res.send(content);
});

type PixelMapRequest = DrawOptions & {
	image: Buffer;
};

router.post(
	"/pixelMap",
	multerUpload.single("image"),
	async (req, res, next) => {
		if (!req.file || !req.file.buffer) {
			next("Image not supplied.");
		} else {
			const request: PixelMapRequest = {
				image: req.file.buffer,
				resizeFactor: parseFloat(req.body.resizeFactor),
			};

			const pixelMap = await convertToPixelMap(request.image, request);

			const content = JSON.stringify(pixelMap);

			res.statusCode = 200;
			res.contentType("application/json");
			res.send(content);
		}
	}
);

export default router;
