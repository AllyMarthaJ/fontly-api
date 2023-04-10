import { Router } from "express";
import { TransformAverageOptions, transformAverage } from "./average";
import { typeMap } from "../../helpers/type-map";
import {
	CharacterSample,
	TransformLightnessOptions,
	getLightness,
	transformLightness,
} from "./lightness";
import { Rgb } from "../shared/rgb";

const router = Router();

type TransformAverageRequest = TransformAverageOptions & {
	data: Rgb[][];
};

router.get("/average", (_, res) => {
	const examplePixelData: Rgb = {
		r: 0,
		g: 0,
		b: 0,
	};
	const exampleBody: TransformAverageRequest = {
		data: [[examplePixelData]],
		background: "demo",
		foreground: "demo",
		threshold: 200,
	};

	const mappedType = typeMap({
		body: exampleBody,
	});

	const content = JSON.stringify(mappedType);

	res.statusCode = 200;
	res.contentType("application/json");
	res.send(content);
});
router.post("/average", (req, res) => {
	const request: TransformAverageRequest = req.body;

	const average = transformAverage(request.data, request);

	res.statusCode = 200;
	res.send(average);
});

type TransformLightnessRequest = TransformLightnessOptions & {
	data: Rgb[][];
	samples: CharacterSample[];
};

router.get("/lightness", (_, res) => {
	const examplePixelData: Rgb = {
		r: 0,
		g: 0,
		b: 0,
	};
	const exampleSample: CharacterSample = {
		text: ".",
		lightness: 0,
	};

	const exampleBody: TransformLightnessRequest = {
		data: [[examplePixelData]],
		samples: [exampleSample],
		cutoffLightness: 0,
	};

	const mappedType = typeMap({
		body: exampleBody,
	});

	const content = JSON.stringify(mappedType);

	res.statusCode = 200;
	res.contentType("application/json");
	res.send(content);
});
router.post("/lightness", (req, res) => {
	const request: TransformLightnessRequest = {
		data: req.body.data,
		samples: req.body.samples,
		cutoffLightness: req.body.cutoffLightness,
	};

	const light = transformLightness(request.data, request.samples, request);

	res.statusCode = 200;
	res.send(light);
});

type MapLightnessRequest = TransformLightnessOptions & {
	text: string;
	data: Rgb[][];
};

router.get("/mapLightness", (req, res) => {
	const examplePixelData: Rgb = {
		r: 0,
		g: 0,
		b: 0,
	};
	const exampleBody: MapLightnessRequest = {
		text: ".",
		data: [[examplePixelData]],
		cutoffLightness: 0,
	};

	const mappedType = typeMap({
		body: exampleBody,
	});

	const content = JSON.stringify(mappedType);

	res.statusCode = 200;
	res.contentType("application/json");
	res.send(content);
});
router.post("/mapLightness", (req, res) => {
	const request: MapLightnessRequest = {
		text: req.body.text,
		data: req.body.data,
		cutoffLightness: req.body.cutoffLightness,
	};

	const lightness = getLightness(request.text, request.data, request);

	res.statusCode = 200;
	res.send(lightness);
});

export default router;
