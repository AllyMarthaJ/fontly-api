import { Router } from "express";
import upload from "multer";
import {
	DrawOptions as TextDrawOptions,
	convertToPixelMap as convertTextToPixelMap,
} from "../text/renderers/pixelMap";
import {
	TransformLightnessOptions,
	getLightness,
	transformLightness,
} from "../transformers/lightness";
import { convertToPixelMap } from "./renderers/pixelMap";
import { PRINTABLE_ASCII_CHARACTERS } from "../../helpers/symbols";
import { typeMap } from "../../helpers/type-map";

const router = Router();
const multerUpload = upload();

type PmlRequest = TransformLightnessOptions & {
	image: Buffer;
	symbols: string[];
	symbolRenderOptions: Omit<TextDrawOptions, "text">;
	symbolLightnessOptions: TransformLightnessOptions;
	uniformlyDistributeSymbols: boolean;
	resizeFactor: number;
	repeatSymbol: number;
	invert: boolean;
};

router.get("/pml", (_, res) => {
	const exampleBody: PmlRequest = {
		image: Buffer.from([]),
		cutoffLightness: 0.9,
		symbols: PRINTABLE_ASCII_CHARACTERS,
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
		uniformlyDistributeSymbols: true,
		resizeFactor: 1,
		invert: false,
		repeatSymbol: 2,
	};

	const mappedType = typeMap({
		body: exampleBody,
	});

	const content = JSON.stringify(mappedType);

	res.statusCode = 200;
	res.contentType("application/json");
	res.send(content);
});

router.post("/pml", multerUpload.single("image"), async (req, res, next) => {
	// form this request as PmlRequest
	if (!req.file || !req.file.buffer) {
		next("Image not supplied.");
	} else {
		const request: PmlRequest = {
			image: req.file.buffer,
			symbols:
				(!!req.body.symbols && JSON.parse(req.body.symbols)) ||
				PRINTABLE_ASCII_CHARACTERS,
			symbolRenderOptions: JSON.parse(req.body.symbolRenderOptions),
			symbolLightnessOptions: JSON.parse(req.body.symbolLightnessOptions),
			uniformlyDistributeSymbols:
				req.body.uniformlyDistributeSymbols === "true",
			resizeFactor: parseFloat(req.body.resizeFactor),
			repeatSymbol: parseInt(req.body.repeatSymbol, 10) || 1,
			invert: req.body.invert === "true",
			cutoffLightness: req.body.cutoffLightness,
		};

		// need to create the map first
		const symbols: string[] = request.symbols;

		let symbolMap = symbols.map((symbol) => {
			const renderedSymbol = convertTextToPixelMap({
				...request.symbolRenderOptions,
				text: symbol,
			});

			return getLightness(
				symbol,
				renderedSymbol,
				request.symbolLightnessOptions
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
				text: new Array(request.repeatSymbol)
					.fill(symbol.text)
					.join(""),
				lightness: request.uniformlyDistributeSymbols
					? i / symbolMap.length
					: request.invert
					? 1 - symbol.lightness
					: symbol.lightness,
			}));

		// need to render the actual image
		const pixelMap = await convertToPixelMap(req.file!.buffer!, {
			resizeFactor: request.resizeFactor,
		});

		const transformedLightness = transformLightness(
			pixelMap,
			symbolMap,
			request
		);

		res.statusCode = 200;
		res.send(transformedLightness);
	}
});

export default router;
