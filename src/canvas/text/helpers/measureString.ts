import { doc } from "../../../dom";

export function measureString(text: string, font: string): [number, number] {
	const canvas: HTMLCanvasElement = doc.createElement("canvas");

	const context = canvas.getContext("2d");

	if (!context) {
		return [0, 0];
	}

	context.font = font;

	const textMeasurement = context.measureText(text);

	// Ensure width is an integer so we can modulo it properly.
	const width = Math.ceil(textMeasurement.width);

	// Use the font bounding box to ensure consistency with cutoffs.
	// I hate Firefox.
	// https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics/fontBoundingBoxAscent
	let height =
		(textMeasurement.fontBoundingBoxAscent ||
			textMeasurement.actualBoundingBoxAscent) +
		(textMeasurement.fontBoundingBoxDescent ||
			textMeasurement.actualBoundingBoxDescent);

	return [width, height];
}
