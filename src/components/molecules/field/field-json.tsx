import { Upload } from "lucide-react";
import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/atoms/button";
import { BaseFieldProps, Field, FieldProps } from "@/components/atoms/field";
import JSONTextArea from "@/components/atoms/text-area-json";
import { showError } from "@/libs/toast";

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
				} catch (error) {
					showError({ title: "Could not load JSON" });
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
			<div className="space-y-2">
				<JSONTextArea<T>
					value={value}
					placeHoder={placeholder}
					onChange={onChange}
				/>

				{allowUpload && (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
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
							className="gap-2"
						>
							<Upload className="h-4 w-4" />
							{t("Upload file")}
						</Button>
					</div>
				)}
			</div>
		</Field>
	);
}

export default FieldJSON;
