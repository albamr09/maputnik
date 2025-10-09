import { Upload } from "lucide-react";
import {
	DragEvent,
	InputHTMLAttributes,
	useCallback,
	useRef,
	useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/atoms/card";
import Title from "@/components/atoms/title";
import { cn } from "@/libs/shadcn-utils";

interface FileDropZoneProps {
	title?: string;
	subtitle?: string;
	onFilesUploaded: (files: FileList) => void;
	description?: string;
	multiple?: boolean;
	accept?: InputHTMLAttributes<HTMLInputElement>["accept"];
}

const FileDropZone: React.FC<FileDropZoneProps> = ({
	title,
	subtitle,
	description,
	multiple = false,
	onFilesUploaded,
	accept,
}) => {
	const [isDragging, setIsDragging] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const { t } = useTranslation();

	const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
		onFilesUploaded(e.dataTransfer.files);
	}, []);

	const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback(() => {
		setIsDragging(false);
	}, []);

	const handleClick = useCallback(() => {
		inputRef.current?.click();
	}, []);

	return (
		<div className="flex flex-col gap-5">
			{title && <Title title={title} subtitle={subtitle} />}
			<Card
				onClick={handleClick}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				className={cn(
					"border-2 border-dashed p-6 text-center transition",
					isDragging
						? "border-primary bg-muted/50"
						: "border-muted-foreground/30",
				)}
			>
				<Upload className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
				<p className="text-xs text-muted-foreground">
					{description || t("Drag & drop files here, or click to select")}
				</p>
				<input
					ref={inputRef}
					type="file"
					multiple={multiple}
					accept={accept}
					className="hidden"
					id="file-input"
					onChange={(e) => {
						if (!e.target.files) return;
						onFilesUploaded(e.target.files);
						e.target.value = "";
					}}
				/>
			</Card>
		</div>
	);
};

export default FileDropZone;
