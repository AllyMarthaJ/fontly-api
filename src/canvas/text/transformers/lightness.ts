import { trim } from "../helpers/trim";
import { Rgb } from "../renderers/pixelMap";

export type CharacterSample = {
	text: string;
	lightness: number;
};

export type TransformLightnessOptions = {
	cutoffLightness?: number; // any lightness greater than this will be trimmed
};

function lightness(color: Rgb) {
	// Least + Most Colored are contrived interpretations of the
	// min/max of the RGB colour channels, but denote essentially
	// the strength of the colour with respect to the remainder of
	// the colour.
	const leastColored = Math.min(color.r, color.g, color.b);
	const mostColored = Math.max(color.r, color.g, color.b);

	// Aproximate a greyscale representation of the colour
	const mean = (leastColored + mostColored) / 2;

	// Scale it between 0 and 1.
	const scaled = mean / 255;

	return scaled;
}

export function getLightness(
	text: string,
	body: Rgb[][],
	options: TransformLightnessOptions
): CharacterSample {
	let transform = body.map((row) => row.map((pixel) => lightness(pixel)));
	transform = trim(
		transform,
		(lightness) =>
			options.cutoffLightness !== undefined &&
			lightness >= options.cutoffLightness
	);

	let sum = transform.reduce((sum, currentRow) => {
		return (
			sum +
			currentRow.reduce(
				(innerSum, currentPixel) => innerSum + currentPixel,
				0
			)
		);
	}, 0);

	const height = transform.length;
	const width = height > 0 ? transform[0].length : 0;

	return {
		text,
		lightness: sum / (width * height),
	};
}

export function transformLightness(
	body: Rgb[][],
	samples: CharacterSample[],
	options: TransformLightnessOptions
) {
	if (samples.length === 0) return "";

	let result = "";

	let transform = body.map((row) => row.map((pixel) => lightness(pixel)));

	transform = trim(
		transform,
		(lightness) =>
			options.cutoffLightness !== undefined &&
			lightness >= options.cutoffLightness
	);

	transform.forEach((row) => {
		row.forEach((lightness) => {
			// want to fetch
			const distanceMap: CharacterSample[] = samples.map((sample) => ({
				text: sample.text,
				lightness: Math.abs(sample.lightness - lightness),
			}));

			const min = distanceMap.reduce((min, cur) => {
				return cur.lightness < min.lightness ? cur : min;
			}, distanceMap[0]);

			result = result.concat(min.text);
		});

		result = result.concat("\n");
	});

	return result;
}
