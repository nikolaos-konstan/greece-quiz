// src/components/LeafletMap.js
"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { MAP_DEFAULTS } from "../config/quizConfig";
import styles from "./LeafletMap.module.css";

export default function LeafletMap({
  geoJsonData,
  onRegionClick,
  highlightedRegion,
  correctRegion,
  correctRegions = [],
  language = "en",
  config,
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geojsonLayerRef = useRef(null);
  const zoomControlRef = useRef(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [L, setL] = useState(null);

  // Initialize map once on component mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    let isMounted = true;

    const initMap = async () => {
      try {
        await import("leaflet/dist/leaflet.css");
        const leaflet = (await import("leaflet")).default;
        setL(leaflet);

        const mapContainer = mapRef.current;
        if (!mapContainer || !isMounted) return;

        if (mapContainer._leaflet_map) {
          mapContainer._leaflet_map.remove();
        }

        const mapInstance = leaflet
          .map(mapContainer, {
            zoomControl: false,
            dragging: true,
            touchZoom: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            boxZoom: true,
            keyboard: true,
            attributionControl: false,
            minZoom: MAP_DEFAULTS.MIN_ZOOM,
            maxZoom: MAP_DEFAULTS.MAX_ZOOM,
          })
          .setView(MAP_DEFAULTS.CENTER, MAP_DEFAULTS.ZOOM);

        mapInstanceRef.current = mapInstance;
        setIsMapInitialized(true);
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        geojsonLayerRef.current = null;
        zoomControlRef.current = null;
      }
    };
  }, []);

  // Get region name based on current language and config
  const getRegionName = useCallback(
    (feature) => {
      if (!config) return "";

      const nameProperty = config.nameProperties[language];
      return feature.properties[nameProperty] || "";
    },
    [language, config]
  );

  // Read a CSS custom property value from :root
  const getCSSVar = useCallback((name) => {
    if (typeof window === "undefined") return "";
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
  }, []);

  // Style function for regions
  const getRegionStyle = useCallback(
    (feature) => {
      const regionName = getRegionName(feature);
      const isCorrectlyIdentified = correctRegions.includes(regionName);
      const isHighlighted = regionName === highlightedRegion;
      const isCurrentCorrect =
        isHighlighted && highlightedRegion === correctRegion;

      const baseStyle = {
        weight: 1.5,
        opacity: 1,
        color: getCSSVar("--map-border") || "#333",
        dashArray: "",
        fillOpacity: 0.7,
      };

      if (isCorrectlyIdentified) {
        return {
          ...baseStyle,
          fillColor: getCSSVar("--map-region-correct") || "#74c476",
        };
      } else if (isHighlighted) {
        return {
          ...baseStyle,
          fillColor: isCurrentCorrect
            ? getCSSVar("--map-region-correct") || "#74c476"
            : getCSSVar("--map-region-incorrect") || "#fb6a4a",
        };
      } else {
        return {
          ...baseStyle,
          fillColor: getCSSVar("--map-region-default") || "#f2f2f2",
        };
      }
    },
    [highlightedRegion, correctRegion, correctRegions, getRegionName, getCSSVar]
  );

  // Update map when data or settings change
  useEffect(() => {
    if (
      !isMapInitialized ||
      !mapInstanceRef.current ||
      !geoJsonData ||
      !L ||
      !config
    )
      return;

    const updateMap = async () => {
      try {
        // Remove existing layer
        if (geojsonLayerRef.current) {
          mapInstanceRef.current.removeLayer(geojsonLayerRef.current);
        }

        // Create new layer
        const layer = L.geoJSON(geoJsonData, {
          style: (feature) => getRegionStyle(feature),
          onEachFeature: (feature, layer) => {
            const regionName = getRegionName(feature);
            const isIdentified = correctRegions.includes(regionName);

            // Add tooltip for identified regions
            if (isIdentified) {
              layer.bindTooltip(regionName, {
                permanent: false,
                direction: "center",
                className: styles.regionTooltip,
              });
            }

            // Add click handlers to unidentified regions
            if (!isIdentified && regionName) {
              layer.on("click", () => {
                onRegionClick(regionName);
              });
            }
          },
        }).addTo(mapInstanceRef.current);

        // Fit map to bounds on first creation
        if (!geojsonLayerRef.current) {
          mapInstanceRef.current.fitBounds(layer.getBounds(), {
            padding: [20, 20],
          });
        }

        geojsonLayerRef.current = layer;

        // Add custom zoom controls
        if (!zoomControlRef.current) {
          const zoomControlsContainer = L.control({ position: "topright" });

          zoomControlsContainer.onAdd = function () {
            const container = L.DomUtil.create(
              "div",
              styles.customZoomControls
            );

            const zoomInButton = L.DomUtil.create(
              "button",
              styles.zoomButton,
              container
            );
            zoomInButton.innerHTML = "+";
            zoomInButton.title = "Zoom in";
            zoomInButton.setAttribute("aria-label", "Zoom in");

            const zoomOutButton = L.DomUtil.create(
              "button",
              styles.zoomButton,
              container
            );
            zoomOutButton.innerHTML = "−";
            zoomOutButton.title = "Zoom out";
            zoomOutButton.setAttribute("aria-label", "Zoom out");

            const resetZoomButton = L.DomUtil.create(
              "button",
              `${styles.zoomButton} ${styles.resetButton}`,
              container
            );
            resetZoomButton.innerHTML = "⟲";
            resetZoomButton.title = "Reset zoom";
            resetZoomButton.setAttribute(
              "aria-label",
              "Reset zoom to default view"
            );

            L.DomEvent.on(zoomInButton, "click", function () {
              if (
                mapInstanceRef.current.getZoom() <
                mapInstanceRef.current.getMaxZoom()
              ) {
                mapInstanceRef.current.zoomIn();
              }
            });

            L.DomEvent.on(zoomOutButton, "click", function () {
              if (
                mapInstanceRef.current.getZoom() >
                mapInstanceRef.current.getMinZoom()
              ) {
                mapInstanceRef.current.zoomOut();
              }
            });

            L.DomEvent.on(resetZoomButton, "click", function () {
              mapInstanceRef.current.setView(
                MAP_DEFAULTS.CENTER,
                MAP_DEFAULTS.ZOOM
              );
            });

            return container;
          };

          zoomControlRef.current = zoomControlsContainer;
          zoomControlsContainer.addTo(mapInstanceRef.current);
        }
      } catch (error) {
        console.error("Error updating GeoJSON layer:", error);
      }
    };

    updateMap();
  }, [
    isMapInitialized,
    geoJsonData,
    getRegionStyle,
    correctRegions,
    onRegionClick,
    highlightedRegion,
    L,
    config,
    getRegionName,
  ]);

  return (
    <div className={styles.mapContainer}>
      <div ref={mapRef} className={styles.map}></div>
    </div>
  );
}
