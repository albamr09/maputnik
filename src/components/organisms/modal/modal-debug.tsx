import { t } from "i18next";
import { Button } from "@/components/atoms/button";
import FieldSwitch from "@/components/molecules/field/field-switch";
import Modal from "@/components/molecules/layout/modal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	disableAllMaplibreGlDebugOptions,
	enableAllMaplibreGlDebugOptions,
	selectMaplibreGlDebugOptions,
	setMaplibreGlDebugOptions,
} from "@/store/slices/styleSlice";
import { closeModal, selectModalOpenName } from "@/store/slices/uiSlice";

const ModalDebug = () => {
	const dispatch = useAppDispatch();

	const modalOpenName = useAppSelector(selectModalOpenName);
	const maplibreDebugOptions = useAppSelector(selectMaplibreGlDebugOptions);

	return (
		<Modal
			isOpen={modalOpenName === "debug"}
			title={t("Debug")}
			onClose={() => dispatch(closeModal())}
			description={t("Configure debug options")}
			cancelText={t("Close")}
		>
			<div className="flex flex-col gap-5 px-2">
				{Object.entries(maplibreDebugOptions).map(([key, value]) => {
					return (
						<FieldSwitch
							key={key}
							rowDistribution="label-lg"
							inputAlignment="end"
							label={key}
							// @ts-ignore
							value={value}
							onChange={(v) => {
								dispatch(setMaplibreGlDebugOptions({ [key]: v }));
							}}
						/>
					);
				})}
				<div className="flex gap-3 justify-between">
					<Button
						className="flex-1"
						onClick={() => {
							dispatch(enableAllMaplibreGlDebugOptions());
						}}
					>
						{t("Enable All")}
					</Button>
					<Button
						className="flex-1"
						onClick={() => {
							dispatch(disableAllMaplibreGlDebugOptions());
						}}
					>
						{t("Clear All")}
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default ModalDebug;
