import { Router } from "express";
import { DrawOptions, convertToPixelMap } from "./renderers/pixelMap";
import {
	TransformAverageOptions,
	transformAverage,
} from "../transformers/average";
import { typeMap } from "../../helpers/type-map";
import {
	TransformLightnessOptions,
	getLightness,
	transformLightness,
} from "../transformers/lightness";
import { PRINTABLE_ASCII_CHARACTERS } from "../../helpers/symbols";

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
		repeatSymbol: number;
		uniformlyDistributeSymbols: boolean;
		invert: boolean;
	};

router.get("/pml", (_, res) => {
	const exampleBody: PmlRequest = {
		text: "ally",
		fontFamily: "Comic Sans MS",
		fontSize: 20,
		fill: true,
		cutoffLightness: 0.9,
		symbolRenderOptions: {
			fontFamily: "Arial",
			fontSize: 20,
			fill: true,
			forceWidth: 15,
			forceHeight: 10,
		},
		symbolLightnessOptions: {
			cutoffLightness: 1,
		},
		invert: false,
		uniformlyDistributeSymbols: true,
		repeatSymbol: 2,
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

router.post("/pml/:text?", (req, res) => {
	// form this request as PmlRequest
	const body: PmlRequest = req.body;

	// need to create the map first
	const symbols: string[] = body.symbols || PRINTABLE_ASCII_CHARACTERS;
	let symbolMap = symbols.map((symbol) => {
		const renderedSymbol = convertToPixelMap({
			...req.body.symbolRenderOptions,
			text: symbol,
		});

		return getLightness(
			symbol,
			renderedSymbol,
			req.body.symbolLightnessOptions
		);
	});

	// See image/quick-start.ts for these shenanigans.
	symbolMap = symbolMap
		.sort(
			(a, b) => (!!req.body.invert ? -1 : 1) * (a.lightness - b.lightness)
		)
		.map((symbol, i) => ({
			text: new Array(req.body.repeatSymbol || 1)
				.fill(symbol.text)
				.join(""),
			lightness: !!req.body.uniformlyDistributeSymbols
				? i / symbolMap.length
				: !!req.body.invert
				? 1 - symbol.lightness
				: symbol.lightness,
		}));

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
