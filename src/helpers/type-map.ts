/**
 * Using an example of a typed object, creates a rudimentary
 * JSON annotation of the types.
 */
export function typeMap<T extends object>(example: T): any {
	if (Array.isArray(example)) {
		return {
			entries: typeMap(example[0]),
		};
	}

	if (typeof example === "object") {
		const entries = Object.entries(example);

		let typedExample = {};

		entries.forEach((entry) => {
			typedExample = { ...typedExample, [entry[0]]: typeMap(entry[1]) };
		});

		return typedExample;
	}

	return typeof example;
}
