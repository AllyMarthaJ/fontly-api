import { dom } from "../dom";

export type DrawOptions = {
	text: string;
	fontSize: number;
	fontFamily: string;
	fill?: boolean;
};

export type PrintOptions = {
	background: string;
	foreground: string;
	threshold: number;
};

type Rgb = {
	r: number;
	g: number;
	b: number;
};

export function renderToCanvas({
	text,
	fontSize,
	fontFamily,
	fill,
}: DrawOptions): Rgb[][] {
	const canvas: HTMLCanvasElement = dom.createElement("canvas");
	const context = canvas.getContext("2d")!;

	const [width, height] = measureString(text, `${fontSize}px '${fontFamily}`);
	if (!width || !height) return [];

	/**
	 * HACKS
	 * node-canvas does NOT support fontBoundingBox. I'm very sad about this.
	 * I didn't want to do this, but I'm hacking in some empty space so that
	 * we don't cut off the fucking text. For fuck's sake.
	 */
	const offsetY = height;
	const renderHeight = 2 * height;

	canvas.width = width;
	canvas.height = renderHeight;

	// differentiate text from background by pooping white everywhere
	context.fillStyle = "white";
	context.fillRect(0, 0, width, renderHeight);

	// See hacks above; ensure we NEVER cut off text.
	context.textBaseline = "middle";
	context.font = `${fontSize}px '${fontFamily}`;
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

export function renderFromData(body: Rgb[][], options: PrintOptions) {
	let result = "";

	body.forEach((row) => {
		row.forEach((pixel) => {
			const av = (pixel.r + pixel.g + pixel.b) / 3;

			result = result.concat(
				av < options.threshold ? options.foreground : options.background
			);
		});
		result = result.concat("\n");
	});

	return result;
}

function measureString(text: string, font: string): [number, number] {
	const canvas: HTMLCanvasElement = dom.createElement("canvas");

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

export function trim<T>(data: T[][], isEmptyPredicate: (val: T) => boolean) {
	let trimmed = [...data];

	// Trim from the beginning.
	while (trimmed.length > 0 && trimmed[0].every(isEmptyPredicate)) {
		trimmed.shift();
	}

	// Trim from the end.
	while (
		trimmed.length > 0 &&
		trimmed[trimmed.length - 1].every(isEmptyPredicate)
	) {
		trimmed.pop();
	}

	return trimmed;
}
