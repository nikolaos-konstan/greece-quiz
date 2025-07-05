// src/components/LeafletMap.js
"use client";
import { useEffect, useState, useRef, useCallback } from "react";
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
            minZoom: 6,
            maxZoom: 10,
          })
          .setView([38.2, 24], 6);

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

  // Style function for regions
  const getRegionStyle = useCallback(
    (feature) => {
      const regionName = getRegionName(feature);
      const isCorrectlyIdentified = correctRegions.includes(regionName);
      const isHighlighted = regionName === highlightedRegion;
      const isCurrentCorrect =
        isHighlighted && highlightedRegion === correctRegion;

      if (isCorrectlyIdentified) {
        return {
          fillColor: "#74c476",
          weight: 1.5,
          opacity: 1,
          color: "#333",
          dashArray: "",
          fillOpacity: 0.7,
        };
      } else if (isHighlighted) {
        return {
          fillColor: isCurrentCorrect ? "#74c476" : "#fb6a4a",
          weight: 1.5,
          opacity: 1,
          color: "#333",
          dashArray: "",
          fillOpacity: 0.7,
        };
      } else {
        return {
          fillColor: "#f2f2f2",
          weight: 1.5,
          opacity: 1,
          color: "#333",
          dashArray: "",
          fillOpacity: 0.7,
        };
      }
    },
    [highlightedRegion, correctRegion, correctRegions, getRegionName]
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
        if (!document.getElementById("custom-zoom-controls")) {
          const zoomControlsContainer = L.control({ position: "topright" });

          zoomControlsContainer.onAdd = function () {
            const container = L.DomUtil.create(
              "div",
              styles.customZoomControls
            );
            container.id = "custom-zoom-controls";

            const zoomInButton = L.DomUtil.create(
              "button",
              styles.zoomButton,
              container
            );
            zoomInButton.innerHTML = "+";
            zoomInButton.title = "Zoom in";

            const zoomOutButton = L.DomUtil.create(
              "button",
              styles.zoomButton,
              container
            );
            zoomOutButton.innerHTML = "−";
            zoomOutButton.title = "Zoom out";

            const resetZoomButton = L.DomUtil.create(
              "button",
              `${styles.zoomButton} ${styles.resetButton}`,
              container
            );
            resetZoomButton.innerHTML = "⟲";
            resetZoomButton.title = "Reset zoom";

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
              mapInstanceRef.current.setView([38.2, 24], 6);
            });

            return container;
          };

          zoomControlsContainer.addTo(mapInstanceRef.current);
        }

        // Add focus styles
        if (!document.getElementById("leaflet-styles")) {
          const style = document.createElement("style");
          style.id = "leaflet-styles";
          style.innerHTML = `
            .leaflet-interactive {
              outline: none !important;
            }
            .leaflet-container:focus,
            .leaflet-container *:focus {
              outline: none !important;
              box-shadow: none !important;
            }
          `;
          document.head.appendChild(style);
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
