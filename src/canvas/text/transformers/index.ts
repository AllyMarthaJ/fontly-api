import { Router } from "express";
import { PrintOptions, transformAverage } from "./average";
import { typeMap } from "../../../helpers/type-map";
import { Rgb } from "../renderers/pixelMap";

const router = Router();

router.get("/average", (_, res) => {
	const pixelData: Rgb = {
		r: 0,
		g: 0,
		b: 0,
	};
	const body: PrintOptions = {
		background: "demo",
		foreground: "demo",
		threshold: 200,
	};
	const mappedType = typeMap({
		body: {
			data: [[pixelData]],
			...body,
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

export default router;
