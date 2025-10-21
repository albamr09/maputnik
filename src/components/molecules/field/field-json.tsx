import { Upload } from "lucide-react";
import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/atoms/button";
import { BaseFieldProps, Field, FieldProps } from "@/components/atoms/field";
import JSONTextArea from "@/components/atoms/text-area-json";
import { showError, showSuccess } from "@/libs/toast";

type UploadButtonProps<T> = Pick<BaseFieldProps<T>, "onChange">;

function UploadButton<T>({ onChange = () => {} }: UploadButtonProps<T>) {
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
		<>
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
			<input
				ref={fileInputRef}
				type="file"
				accept=".json,.geojson"
				onChange={handleFileUpload}
				className="hidden"
			/>
		</>
	);
}

export interface FieldJSONProps<T>
	extends Omit<FieldProps, "children">,
		BaseFieldProps<T> {
	placeholder?: string;
	allowUpload?: boolean;
}

function FieldJSON<T>({
	value,
	onChange = () => {},
	onBlur = () => {},
	placeholder,
	allowUpload = true,
	...fieldProps
}: FieldJSONProps<T>) {
	return (
		<Field
			labelAlignment="start"
			layoutVariant="column"
			{...fieldProps}
			trailingButtons={allowUpload && <UploadButton onChange={onChange} />}
		>
			<div className="flex flex-col gap-5">
				<JSONTextArea
					value={value}
					placeHoder={placeholder}
					onChange={onChange}
					onBlur={onBlur}
					maxHeight="450px"
				/>
			</div>
		</Field>
	);
}

export default FieldJSON;
