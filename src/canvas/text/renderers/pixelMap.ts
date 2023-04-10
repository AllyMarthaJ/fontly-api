import { createCanvas } from "canvas";
import { measureString } from "../helpers/measure-string";
import { Rgb } from "../../shared/rgb";

export type DrawOptions = {
	text: string;
	fontSize: number;
	fontFamily: string;
	fill?: boolean;
	forceWidth?: number;
	forceHeight?: number;
};

export function convertToPixelMap({
	text,
	fontSize,
	fontFamily,
	fill,
	forceWidth,
	forceHeight,
}: DrawOptions): Rgb[][] {
	let [width, height] = measureString(text, `${fontSize}px '${fontFamily}'`);
	if (forceWidth) width = forceWidth;
	if (forceHeight) height = forceHeight;

	if (!width || !height) return [];

	/**
	 * HACKS
	 * node-canvas does NOT support fontBoundingBox. I'm very sad about this.
	 * I didn't want to do this, but I'm hacking in some empty space so that
	 * we don't cut off the fucking text. For fuck's sake.
	 */
	const offsetY = height;
	const renderHeight = 2 * height;

	const canvas = createCanvas(width, renderHeight);
	const context = canvas.getContext("2d");

	// differentiate text from background by pooping white everywhere
	context.fillStyle = "white";
	context.fillRect(0, 0, width, renderHeight);
	// See hacks above; ensure we NEVER cut off text.
	context.textBaseline = "middle";
	context.font = `${fontSize}px '${fontFamily}'`;
	if (fill) {
		context.fillStyle = "black";
		context.fillText(text, 0, offsetY);
	} else {
		context.strokeStyle = "black";
		context.strokeText(text, 0, offsetY);
	}

	const imageData = context.getImageData(0, 0, width, renderHeight);

	const data = imageData.data;

	const result = [];
	let currentRow = [];

	for (let i = 0; i < data.length; i += 4) {
		// a pixel is a subsequence of 4 entries in data
		const pixelX = i / 4;

		// concat is faster than join or +=
		currentRow.push({
			r: data[i],
			g: data[i + 1],
			b: data[i + 2],
		});

		// chompy at end not at start
		if (pixelX % width === width - 1) {
			result.push(currentRow);
			currentRow = [];
		}
	}

	return result;
}
