export type SourceOnChange<T> = <K extends keyof T>(
	key: K,
	value: T[K],
) => void;
