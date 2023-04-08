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
