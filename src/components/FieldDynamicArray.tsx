import Fieldset from "./Fieldset";
import InputDynamicArray, {
	FieldDynamicArrayProps as InputDynamicArrayProps,
} from "./InputDynamicArray";

type FieldDynamicArrayProps = InputDynamicArrayProps & {
	name?: string;
};

const FieldDynamicArray: React.FC<FieldDynamicArrayProps> = (props) => {
	return (
		<Fieldset label={props.label}>
			<InputDynamicArray {...props} />
		</Fieldset>
	);
};

export default FieldDynamicArray;
