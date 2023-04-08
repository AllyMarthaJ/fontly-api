import { Router } from "express";
import { DrawOptions, convertToPixelMap } from "./renderers/pixelMap";
import { PrintOptions, transformAverage } from "./transformers/average";
import { typeMap } from "../../helpers/type-map";

const router = Router();

router.get("/pma", (_, res) => {
	const exampleBody: Omit<DrawOptions & PrintOptions, "text"> = {
		fontFamily: "Arial",
		fontSize: 20,
		fill: true,
		foreground: "🤡",
		background: "💩",
		threshold: 200,
	};

	const mappedType = typeMap({
		params: { text: "demo" },
		body: exampleBody,
	});

	const content = JSON.stringify(mappedType);

	res.statusCode = 200;
	res.contentType("application/json");
	res.send(content);
});

/**
 * PMA = Pixel Map Average, where we take the average channel value of
 * each pixel in the image produced by rendering text to a canvas.
 */
router.post("/pma/:text", (req, res) => {
	const pixelMap = convertToPixelMap({
		...req.body,
		text: req.params.text,
	});

	const transformedAverage = transformAverage(pixelMap, req.body);

	res.statusCode = 200;
	res.send(transformedAverage);
});

export default router;
