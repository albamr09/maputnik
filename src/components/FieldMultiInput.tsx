import Fieldset from "./Fieldset";
import InputMultiInput, { InputMultiInputProps } from "./InputMultiInput";

type FieldMultiInputProps = InputMultiInputProps & {
	label?: string;
};

const FieldMultiInput: React.FC<FieldMultiInputProps> = (props) => {
	return (
		<Fieldset label={props.label}>
			<InputMultiInput {...props} />
		</Fieldset>
	);
};

export default FieldMultiInput;
