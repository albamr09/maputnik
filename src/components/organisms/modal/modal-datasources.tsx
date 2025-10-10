import { Check, Plus } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/atoms/button";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/atoms/tabs";
import Modal from "@/components/molecules/layout/modal";
import ActiveSources from "@/components/organisms/sources/active-sources";
import NewSource from "@/components/organisms/sources/new-source";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeModal, selectModalOpenName } from "@/store/slices/uiSlice";
import { SourceEditorRef } from "../sources/editor/editor";

const ModalDatasources = () => {
	const dispatch = useAppDispatch();
	const modalOpenName = useAppSelector(selectModalOpenName);

	const [tabSelected, setTabSelected] = useState<
		"active-sources" | "new-source"
	>("active-sources");

	const newSourceRef = useRef<SourceEditorRef>(null);

	const { t } = useTranslation();

	const isActiveTab = tabSelected === "active-sources";

	const handleFooterButtonClick = useCallback(() => {
		if (isActiveTab) {
			setTabSelected("new-source");
		} else {
			newSourceRef.current?.saveSource();
		}
	}, [isActiveTab]);

	return (
		<Modal
			isOpen={modalOpenName == "sources"}
			onClose={() => dispatch(closeModal())}
			footerButtons={
				<Button onClick={handleFooterButtonClick}>
					{isActiveTab ? t("New") : t("Add")}
					{isActiveTab ? <Plus /> : <Check />}
				</Button>
			}
			title={t("Data Sources")}
			description={t("Define which sources to use while styling your map.")}
			cancelText={t("Close")}
			size="xl"
		>
			<Tabs value={tabSelected} className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger
						value="active-sources"
						onClick={() => {
							setTabSelected("active-sources");
						}}
						className="flex items-center gap-2"
					>
						{t("Active Sources")}
					</TabsTrigger>
					<TabsTrigger
						value="new-source"
						onClick={() => {
							setTabSelected("new-source");
						}}
						className="flex items-center gap-2"
					>
						{t("New Source")}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="active-sources" className="space-y-5">
					<ActiveSources />
				</TabsContent>

				<TabsContent value="new-source" className="space-y-5">
					<NewSource
						ref={newSourceRef}
						onNewSourceAdded={() => {
							setTabSelected("active-sources");
						}}
					/>
				</TabsContent>
			</Tabs>
		</Modal>
	);
};

export default ModalDatasources;
