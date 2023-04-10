import { createCanvas, loadImage } from "canvas";
import { Rgb } from "../../shared/rgb";

export type DrawOptions = {
	resizeFactor: number;
};

export async function convertToPixelMap(
	buffer: Buffer,
	options: DrawOptions
): Promise<Rgb[][]> {
	const image = await loadImage(buffer);

	const width = Math.floor(image.width * options.resizeFactor);
	const height = Math.floor(image.height * options.resizeFactor);

	const canvas = createCanvas(width, height);
	const context = canvas.getContext("2d");

	context.drawImage(
		image,
		0,
		0,
		image.width,
		image.height,
		0,
		0,
		width,
		height
	);

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
