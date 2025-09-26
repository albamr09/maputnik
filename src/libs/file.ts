const readFileasText = async (file: File) => {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => {
			resolve(reader.result as string);
		};

		reader.onerror = (e) => {
			reject(e);
		};

		reader.readAsText(file);
	});
};

export const readFileAsJSON = async <T>(file: File) => {
	return new Promise<T>((resolve, reject) => {
		readFileasText(file)
			.then((response) => resolve(JSON.parse(response)))
			.catch((e) => reject(e));
	});
};
