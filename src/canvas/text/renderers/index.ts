import { Router } from "express";
import { DrawOptions, convertToPixelMap } from "./pixelMap";
import { typeMap } from "../../../helpers/type-map";
import { ImageOptions, drawToCanvasImage } from "./image";

const router = Router();

type PixelMapRequest = DrawOptions;

router.get("/pixelMap", (_, res) => {
	const exampleBody: PixelMapRequest = {
		text: ".",
		fontFamily: "Arial",
		fontSize: 20,
		fill: true,
		forceWidth: 15,
		forceHeight: 10,
	};
	const mappedType = typeMap({
		params: { text: "." },
		body: exampleBody,
	});

	const content = JSON.stringify(mappedType);

	res.statusCode = 200;
	res.contentType("application/json");
	res.send(content);
});

router.post("/pixelMap/:text?", (req, res) => {
	const request: PixelMapRequest = {
		...req.body,
		text: req.params.text || req.body.text,
	};

	const pixelMap = convertToPixelMap(request);

	const content = JSON.stringify(pixelMap);

	res.statusCode = 200;
	res.contentType("application/json");
	res.send(content);
});

type ImageRequest = DrawOptions & ImageOptions;

router.get("/image", (_, res) => {
	const exampleBody: ImageRequest = {
		text: ".",
		fontFamily: "Arial",
		fontSize: 20,
		fill: true,
		forceWidth: 15,
		forceHeight: 10,
		invert: false,
	};
	const mappedType = typeMap({
		params: { text: "." },
		body: exampleBody,
	});

	const content = JSON.stringify(mappedType);

	res.statusCode = 200;
	res.contentType("application/json");
	res.send(content);
});

router.post("/image/:text?", (req, res) => {
	const request: ImageRequest = {
		...req.body,
		text: req.params.text || req.body.text,
	};

	const image = drawToCanvasImage(request);

	res.statusCode = 200;
	res.contentType("image/png");
	res.send(image);
});

export default router;
