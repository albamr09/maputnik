import latest from "@maplibre/maplibre-gl-style-spec/dist/latest.json";
import { t } from "i18next";

export const validateURL = (value: string) => {
	try {
		const url = new URL(value);
		if (url.protocol === "http:" || url.protocol === "https:") {
			return true;
		}
		return t("Only HTTP or HTTPS URLs are allowed");
	} catch {
		return t("Invalid URL format");
	}
};

export const validateURLs = (values: string[]) => {
	return values?.map(validateURL).find((r) => r !== true) || true;
};

export const validateTileSize = (value: number) => {
	if (!Number.isInteger(value)) {
		return t("Tile size must be an integer");
	}
	if ((value & (value - 1)) !== 0) {
		return t("Tile size must be a power of 2 (e.g. 128, 256, 512)");
	}
	return true;
};

export const validateRasterDEMEncoding = (value: string) => {
	const validEncodings = Object.keys(latest.source_raster_dem.encoding.values);
	return validEncodings.includes(value)
		? true
		: t("Invalid encoding. Must be one of: {{encodings}}", {
				encodings: validEncodings.join(", "),
			});
};
