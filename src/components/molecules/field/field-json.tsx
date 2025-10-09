import { Upload } from "lucide-react";
import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/atoms/button";
import { BaseFieldProps, Field, FieldProps } from "@/components/atoms/field";
import JSONTextArea from "@/components/atoms/text-area-json";
import { showError, showSuccess } from "@/libs/toast";

export interface FieldJSONProps<T>
	extends Omit<FieldProps, "children">,
		BaseFieldProps<T> {
	placeholder?: string;
	allowUpload?: boolean;
}

function FieldJSON<T>({
	value,
	onChange = () => {},
	placeholder,
	allowUpload = true,
	...fieldProps
}: FieldJSONProps<T>) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const { t } = useTranslation();

	const handleFileUpload = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;

			const reader = new FileReader();
			reader.onload = (event) => {
				try {
					const json = JSON.parse(event.target?.result as string);
					onChange(json);
					showSuccess({ title: `JSON file ${file.name} loaded successfully` });
				} catch (error) {
					showError({ title: `Could not load JSON file ${file.name}` });
				}
			};
			reader.readAsText(file);

			// Reset input so same file can be uploaded again
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		},
		[],
	);

	return (
		<Field labelAlignment="start" layoutVariant="column" {...fieldProps}>
			<>
				<JSONTextArea<T>
					value={value}
					placeHoder={placeholder}
					onChange={onChange}
				/>

				{allowUpload && (
					<div className="flex justify-end">
						<input
							ref={fileInputRef}
							type="file"
							accept=".json,.geojson"
							onChange={handleFileUpload}
							className="hidden"
							id="json-file-upload"
						/>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => fileInputRef.current?.click()}
							className="gap-2 text-muted-foreground"
						>
							<Upload className="h-4 w-4" />
							{t("Upload File")}
						</Button>
					</div>
				)}
			</>
		</Field>
	);
}

export default FieldJSON;
