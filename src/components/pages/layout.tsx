import { LngLat, Map as Maplibre, StyleSpecification } from "maplibre-gl";
import { useCallback, useMemo } from "react";
import { withTranslation } from "react-i18next";
import ModalManager from "@/components/organisms/modal/modal-manager";
import Toolbar from "@/components/organisms/toolbar";
import useLayerEdition from "@/hooks/edition/useLayerEdition";
import useStyleEdition from "@/hooks/edition/useStyleEdition";
import style from "@/libs/style";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	selectMaplibreGlDebugOptions,
	selectMapStyle,
	selectMapStyleLayers,
	selectMapStyleToRender,
	selectSelectedLayer,
	selectSelectedLayerIndex,
	selectSelectedLayerOriginalId,
	selectStyleSources,
	selectStyleSpec,
	selectVectorLayers,
} from "@/store/slices/styleSlice";
import {
	selectErrorMessages,
	selectFloorIds,
	selectInfoMessages,
	selectMapViewMode,
	selectSelectedFloorId,
	setMapView,
	setSelectedFloorId,
} from "@/store/slices/uiSlice";
import MessagePanel from "../AppMessagePanel";
import FloorSelector from "../FloorSelector";
import LayerEditor from "../LayerEditor";
import LayerList from "../LayerList";
import MapMaplibreGl from "../MapMaplibreGl";
import ScrollContainer from "../ScrollContainer";

const _AppLayout = () => {
	const dispatch = useAppDispatch();
	const selectedFloorId = useAppSelector(selectSelectedFloorId);
	const floorIds = useAppSelector(selectFloorIds);
	const maplibreGlDebugOptions = useAppSelector(selectMaplibreGlDebugOptions);
	const mapStyle = useAppSelector(selectMapStyle);
	const errors = useAppSelector(selectErrorMessages);
	const infos = useAppSelector(selectInfoMessages);
	const selectedLayerIndex = useAppSelector(selectSelectedLayerIndex);
	const selectedLayer = useAppSelector(selectSelectedLayer);
	const selectedLayerOriginalId = useAppSelector(selectSelectedLayerOriginalId);
	const sources = useAppSelector(selectStyleSources);
	const vectorLayers = useAppSelector(selectVectorLayers);
	const styleSpec = useAppSelector(selectStyleSpec);
	const mapStyleLayers = useAppSelector(selectMapStyleLayers);
	const mapViewMode = useAppSelector(selectMapViewMode);
	const mapStyleToRender = useAppSelector(selectMapStyleToRender);

	const { fetchSources } = useStyleEdition();
	const {
		onMoveLayer,
		onLayerSelect,
		onLayerChanged,
		onLayerDestroy,
		onLayerCopy,
		onLayerVisibilityToggle,
		onLayerIdChange,
		onLayerFloorFilterToggle,
		onLayersChange,
	} = useLayerEdition();

	// TODO ALBA: Most of these functions should be inside of each component
	// const onChangeMaplibreGlDebug = useCallback(
	//   (key: keyof typeof maplibreGlDebugOptions, value: any) => {
	//     dispatch(setMaplibreGlDebugOptions({ [key]: value }));
	//   },
	//   [dispatch],
	// );

	const onMapChange = useCallback(
		(mapView: { zoom: number; center: LngLat }) => {
			dispatch(
				setMapView({
					...mapView,
					center: { lat: mapView.center.lat, lng: mapView.center.lng },
				}),
			);
		},
		[dispatch],
	);

	const isMapLoaded = useMemo(() => {
		return (
			mapStyleToRender && mapStyleToRender.layers && mapStyleToRender.sources
		);
	}, [mapStyleToRender]);

	const mapElementStyle = useMemo(() => {
		let filterName;
		if (mapViewMode.match(/^filter-/)) {
			filterName = mapViewMode.replace(/^filter-/, "");
		}
		const elementStyle: { filter?: string } = {};
		if (filterName) {
			elementStyle.filter = `url('#${filterName}')`;
		}
		return elementStyle;
	}, [mapViewMode]);

	return (
		<div>
			<Toolbar />
			<div className="maputnik-layout-main">
				<div className="maputnik-layout-list">
					<LayerList
						onMoveLayer={onMoveLayer}
						onLayerDestroy={onLayerDestroy}
						onLayerCopy={onLayerCopy}
						onLayerVisibilityToggle={onLayerVisibilityToggle}
						onLayerFloorFilterToggle={onLayerFloorFilterToggle}
						onLayersChange={onLayersChange}
						onLayerSelect={onLayerSelect}
						selectedLayerIndex={selectedLayerIndex}
						layers={mapStyleLayers}
						sources={sources}
						errors={errors}
					/>
				</div>
				{selectedLayer && (
					<div className="maputnik-layout-drawer">
						<ScrollContainer>
							<LayerEditor
								key={selectedLayerOriginalId}
								layer={selectedLayer}
								layerIndex={selectedLayerIndex}
								isFirstLayer={selectedLayerIndex < 1}
								isLastLayer={selectedLayerIndex === mapStyle.layers.length - 1}
								sources={sources}
								vectorLayers={vectorLayers}
								spec={styleSpec}
								onMoveLayer={onMoveLayer}
								onLayerChanged={onLayerChanged}
								onLayerDestroy={onLayerDestroy}
								onLayerCopy={onLayerCopy}
								onLayerVisibilityToggle={onLayerVisibilityToggle}
								onLayerIdChange={onLayerIdChange}
								errors={errors}
								selectedFloorId={selectedFloorId}
							/>
						</ScrollContainer>
					</div>
				)}
				{isMapLoaded && (
					<div
						style={mapElementStyle}
						className="maputnik-map__container"
						data-wd-key="maplibre:container"
					>
						<MapMaplibreGl
							key={mapStyleToRender.id}
							mapStyle={mapStyleToRender}
							replaceAccessTokens={(mapStyle: StyleSpecification) => {
								return style.replaceAccessTokens(mapStyle, {
									allowFallback: true,
								});
							}}
							onDataChange={(_e: { map: Maplibre }) => {
								// TODO ALBA: I should restore this some time
								//layerWatcherRef.current?.analyzeMap(e.map);
								fetchSources();
							}}
							onChange={onMapChange}
							options={maplibreGlDebugOptions as any}
							inspectModeEnabled={mapViewMode === "inspect"}
							highlightedLayer={mapStyleLayers?.[selectedLayerIndex]}
							onLayerSelect={onLayerSelect}
						/>
					</div>
				)}
			</div>
			{/* TODO ALBA: Does this even work? */}
			{errors.length + infos.length > 0 && (
				<div className="maputnik-layout-bottom">
					<MessagePanel
						currentLayer={selectedLayer}
						selectedLayerIndex={selectedLayerIndex}
						onLayerSelect={onLayerSelect}
						mapStyle={mapStyle}
						errors={errors}
						infos={infos}
					/>
				</div>
			)}

			{/*Modals*/}
			<ModalManager />

			{/*Floor selector*/}
			<FloorSelector
				selectedFloorId={selectedFloorId}
				floorIds={floorIds}
				onFloorSelected={(floorId) => dispatch(setSelectedFloorId(floorId))}
			/>
		</div>
	);
};

const AppLayout = withTranslation()(_AppLayout);
export default AppLayout;
