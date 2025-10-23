import { SourceTypeMap } from "@/store/types";

export type SourceOnChange<T> = <K extends keyof T>(
	key: K,
	value: T[K],
) => void;

export type SourceEditorForm = {
	[K in keyof SourceTypeMap]: {
		sourceId: string;
		sourceType: K;
		situmAccessToken?: boolean;
	} & SourceTypeMap[K];
}[keyof SourceTypeMap];
