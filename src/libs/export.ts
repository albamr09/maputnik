import { format } from "@maplibre/maplibre-gl-style-spec";
import { saveAs } from "file-saver";
import { t } from "i18next";
import { version as MAPLIBRE_GL_VERSION } from "maplibre-gl/package.json";
import Slugify from "slugify";
import style from "@/libs/style";
import { ExtendedStyleSpecification } from "@/store/types";

const cleanStyle = (mapStyle: ExtendedStyleSpecification) => {
	return format(
		style.stripSitumMetadata(
			style.stripFloorFilter(
				style.stripAccessTokens(style.replaceAccessTokens(mapStyle)),
			),
		),
	);
};

const getMapStyleExportName = (mapStyle: ExtendedStyleSpecification) => {
	if (mapStyle.name) {
		return Slugify(mapStyle.name, {
			replacement: "_",
			remove: /[*\-+~.()'"!:]/g,
			lower: true,
		});
	} else {
		return mapStyle.id;
	}
};

export const createMapStyleHTML = (mapStyle: ExtendedStyleSpecification) => {
	const cleanedStyle = cleanStyle(mapStyle);
	const htmlTitle = mapStyle.name || t("Map");
	const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${htmlTitle}</title>
  <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
  <script src="https://unpkg.com/maplibre-gl@${MAPLIBRE_GL_VERSION}/dist/maplibre-gl.js"></script>
  <link href="https://unpkg.com/maplibre-gl@${MAPLIBRE_GL_VERSION}/dist/maplibre-gl.css" rel="stylesheet" />
  <style>
    body { margin: 0; padding: 0; }
    #map { position: absolute; top: 0; bottom: 0; width: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
      const map = new maplibregl.Map({
         container: 'map',
         style: ${cleanedStyle},
      });
      map.addControl(new maplibregl.NavigationControl());
  </script>
</body>
</html>
`;

	const blob = new Blob([html], { type: "text/html;charset=utf-8" });
	const exportName = getMapStyleExportName(mapStyle);
	saveAs(blob, exportName + ".html");
};

export const saveMapStyle = (mapStyle: ExtendedStyleSpecification) => {
	const cleanedStyle = cleanStyle(mapStyle);

	const blob = new Blob([cleanedStyle], {
		type: "application/json;charset=utf-8",
	});
	const exportName = getMapStyleExportName(mapStyle);
	saveAs(blob, exportName + ".json");
	return;
};
