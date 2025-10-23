import { forwardRef } from "react";
import SourceEditor, {
	SourceEditorRef,
} from "@/components/organisms/sources/editor/editor";

interface NewSourceProps {
	onNewSourceAdded: () => void;
}

const NewSource = forwardRef<SourceEditorRef, NewSourceProps>(
	({ onNewSourceAdded }, ref) => {
		return (
			<SourceEditor
				ref={ref}
				maxHeight={"50vh"}
				showSourceId
				showSourceType
				onSourceSaved={onNewSourceAdded}
			/>
		);
	},
);

export default NewSource;
