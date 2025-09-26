export const generateRandomString = (length = 8) => {
	const chars =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * chars.length);
		result += chars[randomIndex];
	}
	return result;
};

export const generateAndCheckRandomString = (
	length = 8,
	existingStrings: string[],
) => {
	let generatedString = generateRandomString(length);
	while (existingStrings.includes(generatedString)) {
		generatedString = generateRandomString(length);
	}

	return generatedString;
};
