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
};

router.post("/pml", multerUpload.single("image"), async (req, res, next) => {
	// form this request as PmlRequest
	console.log(req.body.symbolLightnessOptions);
	console.log(req.file?.buffer);
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
	symbolMap = symbolMap
		.sort((a, b) => b.lightness - a.lightness)
		.map((symbol, i) => ({
			text: `${symbol.text}${symbol.text}`,
			lightness: i / symbolMap.length,
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
