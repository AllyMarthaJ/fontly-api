import { Router } from "express";
import upload from "multer";
import { convertToPixelMap as convertTextToPixelMap } from "../text/renderers/pixelMap";
import {
	TransformLightnessOptions,
	getLightness,
	transformLightness,
} from "../transformers/lightness";
import { DrawOptions, convertToPixelMap } from "./renderers/pixelMap";

const router = Router();
const multerUpload = upload();

type PmlRequest = TransformLightnessOptions & {
	image: string;
	symbols: string[];
	symbolRenderOptions: Omit<DrawOptions, "text">;
	symbolLightnessOptions: TransformLightnessOptions;
	repeatSymbol: number;
	uniformlyDistributeSymbols: boolean;
	invert: boolean;
};

router.post("/pml", multerUpload.single("image"), async (req, res, next) => {
	// form this request as PmlRequest

	// need to create the map first
	const symbols: string[] =
		(!!req.body.symbols && JSON.parse(req.body.symbols)) ||
		new Array(127 - 32).fill("").map((w, i) => String.fromCharCode(i + 32));
	let symbolMap = symbols.map((symbol) => {
		const renderedSymbol = convertTextToPixelMap({
			...JSON.parse(req.body.symbolRenderOptions),
			text: symbol,
		});

		return getLightness(
			symbol,
			renderedSymbol,
			JSON.parse(req.body.symbolLightnessOptions)
		);
	});

	// A typical monospace font will have an approximate
	// height:width ratio of 2:1. I'd like to maintain the integrity of images
	// a little bit, so we double the symbols up.
	// Also give the option to invert. This is useful for dark theme.
	// Redistribute the values equally across the map. Since we only care about the
	// *order* of lightness, and not strictly the lightness values themselves, let's
	// uniformly distribute the values.
	// The reason we in fact don't want to care about the original lightness values is
	// due to the fact that characters share similar lightness values *anyway*. It turns
	// out the values aren't so wildly different, and so in a typical image we'd like a
	// range of values used.
	// Anecdotally, when I tried out the transformLightness method manually via the
	// /transform endpoint, I used uniformly distributed values which gave me an amazing
	// output. Conversely when I tried it with text that automatically generated the values
	// the result was mediocre by comparison.
	symbolMap = symbolMap
		.sort(
			(a, b) =>
				(req.body.invert === "true" ? -1 : 1) *
				(a.lightness - b.lightness)
		)
		.map((symbol, i) => ({
			text: new Array(parseInt(req.body.repeatSymbol || 1, 10))
				.fill(symbol.text)
				.join(""),
			lightness:
				req.body.uniformlyDistributeSymbols === "true"
					? i / symbolMap.length
					: req.body.invert === "true"
					? 1 - symbol.lightness
					: symbol.lightness,
		}));

	// need to render the actual image
	if (!req.file || !req.file.buffer) {
		next();
	}
	const pixelMap = await convertToPixelMap(req.file!.buffer!, {
		resizeFactor: req.body.resizeFactor,
	});

	const transformedLightness = transformLightness(
		pixelMap,
		symbolMap,
		req.body
	);

	res.statusCode = 200;
	res.send(transformedLightness);
});

export default router;
