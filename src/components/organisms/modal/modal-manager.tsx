import ModalDatasources from "@/components/organisms/modal/modal-datasources";
import ModalDebug from "@/components/organisms/modal/modal-debug";
import ModalGeoJSONTheme from "@/components/organisms/modal/modal-geojson-theme";
import ModalMetadata from "@/components/organisms/modal/modal-metadata";
import ModalOpen from "@/components/organisms/modal/modal-open";
import ModalProfile from "@/components/organisms/modal/modal-profile";
import ModalShortcuts from "@/components/organisms/modal/modal-shortcuts";

const ModalManager = () => {
	return (
		<>
			<ModalMetadata />
			<ModalDatasources />
			<ModalOpen />
			<ModalProfile />
			<ModalGeoJSONTheme />
			<ModalDebug />
			<ModalShortcuts />
		</>
	);
};

export default ModalManager;
