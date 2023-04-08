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

	canvas.width = width;
	canvas.height = height;

	// differentiate text from background by pooping white everywhere
	context.fillStyle = "white";
	context.fillRect(0, 0, width, height);

	// also want the baseline to be bottom so we don't have to care about
	// descender height
	context.textBaseline = "bottom";
	context.font = `${fontSize}px '${fontFamily}`;
	if (fill) {
		context.fillStyle = "black";
		context.fillText(text, 0, height);
	} else {
		context.strokeStyle = "black";
		context.strokeText(text, 0, height);
	}

	const imageData = context.getImageData(0, 0, width, height);

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
	console.log(textMeasurement);
	console.log(height);

	return [width, height];
}
