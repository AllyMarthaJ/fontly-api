import { Router } from "express";
import { TransformAverageOptions, transformAverage } from "./average";
import { typeMap } from "../../helpers/type-map";
import { Rgb } from "../text/renderers/pixelMap";
import {
	CharacterSample,
	TransformLightnessOptions,
	getLightness,
	transformLightness,
} from "./lightness";

const router = Router();

router.get("/average", (_, res) => {
	const examplePixelData: Rgb = {
		r: 0,
		g: 0,
		b: 0,
	};
	const exampleBody: TransformAverageOptions = {
		background: "demo",
		foreground: "demo",
		threshold: 200,
	};

	const mappedType = typeMap({
		body: {
			data: [[examplePixelData]],
			...exampleBody,
		},
	});

	const content = JSON.stringify(mappedType);

	res.statusCode = 200;
	res.contentType("application/json");
	res.send(content);
});
router.post("/average", (req, res) => {
	const average = transformAverage(req.body.data, req.body);

	res.statusCode = 200;
	res.send(average);
});

router.get("/lightness", (req, res) => {
	const examplePixelData: Rgb = {
		r: 0,
		g: 0,
		b: 0,
	};
	const exampleSample: CharacterSample = {
		text: ".",
		lightness: 0,
	};
	const exampleOptions: TransformLightnessOptions = {
		cutoffLightness: 0,
	};

	const mappedType = typeMap({
		body: {
			data: [[examplePixelData]],
			samples: [exampleSample],
			...exampleOptions,
		},
	});

	const content = JSON.stringify(mappedType);

	res.statusCode = 200;
	res.contentType("application/json");
	res.send(content);
});
router.post("/lightness", (req, res) => {
	const light = transformLightness(req.body.data, req.body.samples, req.body);
	console.log(req.body);

	res.statusCode = 200;
	res.send(light);
});

router.get("/mapLightness", (req, res) => {
	const examplePixelData: Rgb = {
		r: 0,
		g: 0,
		b: 0,
	};
	const exampleBody: {
		text: string;
		data: Rgb[][];
	} & TransformLightnessOptions = {
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
	const lightness = getLightness(req.body.text, req.body.data, req.body);

	res.statusCode = 200;
	res.send(lightness);
});

export default router;
