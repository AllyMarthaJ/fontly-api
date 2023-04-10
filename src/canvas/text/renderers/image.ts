import { createCanvas } from "canvas";
import { DrawOptions } from "./pixelMap";
import { measureString } from "../helpers/measure-string";

export type ImageOptions = {
	invert: boolean;
};

export function drawToCanvasImage({
	text,
	fontSize,
	fontFamily,
	fill,
	forceWidth,
	forceHeight,
	invert,
}: DrawOptions & ImageOptions): Buffer {
	let [width, height] = measureString(text, `${fontSize}px '${fontFamily}'`);
	if (forceWidth) width = forceWidth;
	if (forceHeight) height = forceHeight;

	if (!width || !height) Buffer.from([]);

	const canvas = createCanvas(width, height);
	const context = canvas.getContext("2d");

	// differentiate text from background by pooping white everywhere
	context.fillStyle = invert ? "black" : "white";
	context.fillRect(0, 0, width, height);
	// See hacks above; ensure we NEVER cut off text.
	context.textBaseline = "top";
	context.font = `${fontSize}px '${fontFamily}'`;
	if (fill) {
		context.fillStyle = invert ? "white" : "black";
		context.fillText(text, 0, 0);
	} else {
		context.strokeStyle = invert ? "white" : "black";
		context.strokeText(text, 0, 0);
	}

	return canvas.toBuffer("image/png");
}
