import { SourceTypesType } from "@/store/types";

export type SourceOnChange<T> = <K extends keyof T>(
	key: K,
	value: T[K],
) => void;

export interface SourceEditorForm {
	sourceId: string;
	sourceType: SourceTypesType;
}
