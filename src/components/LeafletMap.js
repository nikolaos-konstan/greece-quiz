// src/components/LeafletMap.js
// Loaded on the client only (see QuizGame), because Leaflet needs `window`.
"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MAP_DEFAULTS } from "../config/quizConfig";
import { t } from "../config/translations";
import { findNeighbor, isArrowKey } from "../utils/mapNavigation";
import styles from "./LeafletMap.module.css";

const REGION_ID_ATTRIBUTE = "data-region-id";
const FIT_OPTIONS = { padding: [20, 20] };
const STATE = { DEFAULT: "default", CORRECT: "correct", WRONG: "wrong" };

const readColors = () => {
  const root = getComputedStyle(document.documentElement);
  const read = (name) => root.getPropertyValue(name).trim();
  return {
    border: read("--map-border"),
    [STATE.DEFAULT]: read("--map-region-default"),
    [STATE.CORRECT]: read("--map-region-correct"),
    [STATE.WRONG]: read("--map-region-incorrect"),
  };
};

const styleFor = (state, colors) => ({
  weight: 1.5,
  opacity: 1,
  fillOpacity: 0.7,
  color: colors.border,
  fillColor: colors[state],
});

// Remount (change its key) to start a new game: found regions are never reset.
export default function LeafletMap({
  geoJsonData,
  onRegionClick,
  wrongRegionId = null,
  correctRegionIds,
  language = "en",
  config,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const boundsRef = useRef(null);
  // id -> { layer, name, state, isIdentified }
  const regionsRef = useRef(new Map());
  const colorsRef = useRef(null);
  // Lets the long-lived Leaflet handlers see the latest props without rebuilding.
  const latestRef = useRef({ onRegionClick, wrongRegionId, correctRegionIds });

  useEffect(() => {
    latestRef.current = { onRegionClick, wrongRegionId, correctRegionIds };
  });

  const syncRegions = () => {
    const { correctRegionIds: correct, wrongRegionId: wrong } =
      latestRef.current;
    const correctIds = new Set(correct);

    regionsRef.current.forEach((region, id) => {
      const isIdentified = correctIds.has(id);
      let state = STATE.DEFAULT;
      if (isIdentified) state = STATE.CORRECT;
      else if (id === wrong) state = STATE.WRONG;

      if (state !== region.state) {
        region.layer.setStyle(styleFor(state, colorsRef.current));
        region.state = state;
      }

      // Regions are only ever marked found: Play Again mounts a new map, because
      // Leaflet's unbindTooltip leaves a focus listener behind that then throws.
      if (isIdentified && !region.isIdentified) {
        region.isIdentified = true;
        region.layer.bindTooltip(region.name, {
          direction: "center",
          className: styles.regionTooltip,
        });
        const element = region.layer.getElement();
        element?.setAttribute("aria-label", region.name);
        if (element) element.style.cursor = "default";
      }
    });
  };

  // The map and its layer live as long as this component. Game updates only
  // restyle the regions that changed (see syncRegions).
  useEffect(() => {
    const regions = regionsRef.current;
    colorsRef.current = readColors();

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: Boolean(config.attribution),
      minZoom: MAP_DEFAULTS.MIN_ZOOM,
      maxZoom: MAP_DEFAULTS.MAX_ZOOM,
    }).setView(MAP_DEFAULTS.CENTER, MAP_DEFAULTS.ZOOM);
    mapRef.current = map;

    if (config.attribution) {
      map.attributionControl.setPrefix(false);
      map.attributionControl.addAttribution(config.attribution);
    }

    const nameProperty = config.nameProperties[language];
    const layerGroup = L.geoJSON(geoJsonData, {
      style: styleFor(STATE.DEFAULT, colorsRef.current),
      onEachFeature: (feature, layer) => {
        const id = feature.properties[config.idProperty];
        regions.set(id, {
          layer,
          name: feature.properties[nameProperty],
          state: STATE.DEFAULT,
          isIdentified: false,
        });
        layer.on("click", () => latestRef.current.onRegionClick(id));
      },
    }).addTo(map);

    boundsRef.current = layerGroup.getBounds();
    map.fitBounds(boundsRef.current, FIT_OPTIONS);

    // Keyboard play: one region is in the tab order at a time, and the arrow
    // keys move between regions. Labels stay generic until a region is found,
    // because announcing its name would give away the answer.
    const centers = [];
    regions.forEach(({ layer }, id) => {
      const { lat, lng } = layer.getBounds().getCenter();
      centers.push({ id, lat, lng });

      const element = layer.getElement();
      element.setAttribute(REGION_ID_ATTRIBUTE, id);
      element.setAttribute("role", "button");
      element.setAttribute("aria-label", t(language, "unidentifiedRegion"));
      element.setAttribute("tabindex", "-1");
    });
    if (centers.length > 0) {
      regions
        .get(centers[0].id)
        .layer.getElement()
        .setAttribute("tabindex", "0");
    }

    const container = containerRef.current;
    const handleKeyDown = (event) => {
      const id = event.target.getAttribute?.(REGION_ID_ATTRIBUTE);
      if (!id) return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        latestRef.current.onRegionClick(id);
      } else if (isArrowKey(event.key)) {
        event.preventDefault();
        event.stopPropagation();
        const nextId = findNeighbor(centers, id, event.key);
        if (!nextId) return;

        const next = regions.get(nextId);
        event.target.setAttribute("tabindex", "-1");
        next.layer.getElement().setAttribute("tabindex", "0");
        next.layer.getElement().focus({ preventScroll: true });
        map.panInside(next.layer.getBounds().getCenter(), {
          padding: [40, 40],
        });
      }
    };
    container.addEventListener("keydown", handleKeyDown);

    // Follow the system theme if it changes during a quiz.
    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSchemeChange = () => {
      colorsRef.current = readColors();
      regions.forEach((region) =>
        region.layer.setStyle(styleFor(region.state, colorsRef.current))
      );
    };
    colorScheme.addEventListener("change", handleSchemeChange);

    return () => {
      colorScheme.removeEventListener("change", handleSchemeChange);
      container.removeEventListener("keydown", handleKeyDown);
      regions.clear();
      map.remove();
      mapRef.current = null;
    };
  }, [geoJsonData, config, language]);

  // Declared after the setup effect, so it also applies the state on mount.
  useEffect(syncRegions, [correctRegionIds, wrongRegionId, language]);

  return (
    <div className={styles.mapContainer}>
      <div
        ref={containerRef}
        className={styles.map}
        role="group"
        aria-label={t(language, "mapLabel")}
      />
      <div className={styles.customZoomControls}>
        <button
          type="button"
          className={styles.zoomButton}
          title={t(language, "zoomIn")}
          aria-label={t(language, "zoomIn")}
          onClick={() => mapRef.current?.zoomIn()}
        >
          +
        </button>
        <button
          type="button"
          className={styles.zoomButton}
          title={t(language, "zoomOut")}
          aria-label={t(language, "zoomOut")}
          onClick={() => mapRef.current?.zoomOut()}
        >
          −
        </button>
        <button
          type="button"
          className={`${styles.zoomButton} ${styles.resetButton}`}
          title={t(language, "resetZoom")}
          aria-label={t(language, "resetZoom")}
          onClick={() =>
            mapRef.current?.fitBounds(boundsRef.current, FIT_OPTIONS)
          }
        >
          ⟲
        </button>
      </div>
    </div>
  );
}
