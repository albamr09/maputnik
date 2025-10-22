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
