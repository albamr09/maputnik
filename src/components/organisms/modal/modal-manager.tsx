import ModalDatasources from "@/components/organisms/modal/modal-datasources";
import ModalGeoJSONTheme from "@/components/organisms/modal/modal-geojson-theme";
import ModalMetadata from "@/components/organisms/modal/modal-metadata";
import ModalOpen from "@/components/organisms/modal/modal-open";
import ModalProfile from "@/components/organisms/modal/modal-profile";

const ModalManager = () => {
	return (
		<>
			<ModalMetadata />
			<ModalDatasources />
			<ModalOpen />
			<ModalProfile />
			<ModalGeoJSONTheme />
		</>
	);
};

export default ModalManager;

//        <ModalDebug
//          maplibreGlDebugOptions={maplibreGlDebugOptions}
//          onChangeMaplibreGlDebug={onChangeMaplibreGlDebug}
//          isOpen={modalOpenName == "debug"}
//          onOpenToggle={() => toggleModalHandler("debug")}
//          mapView={mapView}
//        />
//        <ModalShortcuts
//          isOpen={modalOpenName == "shortcuts"}
//          onOpenToggle={() => toggleModalHandler("shortcuts")}
//        />
//        <ModalSettings
//          mapStyle={mapStyle}
//          onStyleChanged={onStyleChanged}
//          onChangeMetadataProperty={onChangeMetadataProperty}
//          isOpen={modalOpenName == "settings"}
//          onOpenToggle={() => toggleModalHandler("settings")}
//        />
//        <ModalSources
//          mapStyle={mapStyle}
//          onStyleChanged={onStyleChanged}
//          isOpen={modalOpenName == "sources"}
//          onOpenToggle={() => toggleModalHandler("sources")}
//        />
