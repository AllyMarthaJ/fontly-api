import { Router } from "express";
import { DrawOptions, convertToPixelMap } from "./renderers/pixelMap";
import {
	TransformAverageOptions,
	transformAverage,
} from "./transformers/average";
import { typeMap } from "../../helpers/type-map";
import {
	TransformLightnessOptions,
	getLightness,
	transformLightness,
} from "./transformers/lightness";

const router = Router();

router.get("/pma", (_, res) => {
	const exampleBody: DrawOptions & TransformAverageOptions = {
		text: "demo",
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
router.post("/pma/:text?", (req, res) => {
	const pixelMap = convertToPixelMap({
		...req.body,
		text: req.params.text || req.body.text,
	});

	const transformedAverage = transformAverage(pixelMap, req.body);

	res.statusCode = 200;
	res.send(transformedAverage);
});

type PmlRequest = DrawOptions &
	TransformLightnessOptions & {
		symbols?: string[];
		symbolRenderOptions: Omit<DrawOptions, "text">;
		symbolLightnessOptions: TransformLightnessOptions;
	};

router.post("/pml/:text?", (req, res) => {
	// form this request as PmlRequest
	const body: PmlRequest = req.body;

	// need to create the map first
	const symbols: string[] =
		body.symbols ||
		new Array(256 - 32).fill("").map((w, i) => String.fromCharCode(i + 31));
	const symbolMap = symbols.map((symbol) => {
		const renderedSymbol = convertToPixelMap({
			...body.symbolRenderOptions,
			text: symbol,
		});

		return getLightness(
			symbol,
			renderedSymbol,
			body.symbolLightnessOptions
		);
	});

	// need to render the actual text
	const pixelMap = convertToPixelMap({
		...body,
		text: req.params.text || req.body.text,
	});

	const transformedLightness = transformLightness(pixelMap, symbolMap, body);

	res.statusCode = 200;
	res.send(transformedLightness);
});

export default router;
