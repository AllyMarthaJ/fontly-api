import { Rgb } from "../shared/rgb";
import { trim } from "../text/helpers/trim";

export type TransformAverageOptions = {
	background: string;
	foreground: string;
	threshold: number;
};

/**
 * Transforms a 2 dimensional array of pixels to a string delimited
 * by new lines, represented using a binary foreground/background controlled
 * by a threshold.
 */
export function transformAverage(
	body: Rgb[][],
	options: TransformAverageOptions
) {
	let result = "";

	let transform = body.map((row) =>
		row.map((pixel) => (pixel.r + pixel.g + pixel.b) / 3)
	);

	transform = trim(transform, (av) => av >= options.threshold);

	transform.forEach((row) => {
		row.forEach((average) => {
			result = result.concat(
				average < options.threshold
					? options.foreground
					: options.background
			);
		});
		result = result.concat("\n");
	});

	// Trim the result by default, because gross.
	return result;
}
