// src/components/LeafletMap.js
"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import styles from "./LeafletMap.module.css";

export default function LeafletMap({
  onRegionClick,
  highlightedRegion,
  correctRegion,
  correctRegions = [],
  language = "en", // Default to English
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geojsonLayerRef = useRef(null);
  const dataRef = useRef(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [L, setL] = useState(null); // Store Leaflet library reference

  // Initialize map once on component mount
  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    let isMounted = true;

    // Dynamically import Leaflet
    const initMap = async () => {
      try {
        // Import Leaflet CSS
        await import("leaflet/dist/leaflet.css");

        // Import Leaflet library
        const leaflet = (await import("leaflet")).default;
        setL(leaflet); // Store Leaflet reference

        // Ensure map container exists and map not already initialized
        const mapContainer = mapRef.current;
        if (!mapContainer || !isMounted) return;

        // Check if map already exists and remove it
        if (mapContainer._leaflet_map) {
          mapContainer._leaflet_map.remove();
        }

        // Create map with zoom functionality enabled, but without default controls
        const mapInstance = leaflet
          .map(mapContainer, {
            zoomControl: false, // Disable default zoom controls
            dragging: true, // Enable dragging
            touchZoom: true, // Enable touch zoom
            scrollWheelZoom: true, // Enable scroll wheel zoom
            doubleClickZoom: true, // Enable double click zoom
            boxZoom: true, // Enable box zoom
            keyboard: true, // Enable keyboard navigation
            attributionControl: false,
            minZoom: 6, // Set minimum zoom level (starting point)
            maxZoom: 10, // Set maximum zoom level (4x from starting point)
          })
          .setView([38.2, 24], 6);

        // Store the map instance in a ref
        mapInstanceRef.current = mapInstance;

        // Fetch GeoJSON data
        const response = await fetch("/data/nomoi_okxe.geojson");
        const data = await response.json();
        dataRef.current = data;

        // Set initialization flag
        setIsMapInitialized(true);
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initMap();

    // Cleanup function
    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        geojsonLayerRef.current = null;
      }
    };
  }, []);

  // Get region name based on current language
  const getRegionName = useCallback(
    (feature) => {
      return language === "en"
        ? feature.properties.NAME_ENG
        : feature.properties.NAME_GR;
    },
    [language]
  );

  // Style function memoized to prevent unnecessary recalculation
  const getRegionStyle = useCallback(
    (feature) => {
      const regionName = getRegionName(feature);

      // Check if region is in the correctly identified list
      const isCorrectlyIdentified = correctRegions.includes(regionName);

      // Check if region is currently highlighted
      const isHighlighted = regionName === highlightedRegion;

      // Determine if current highlight is correct
      const isCurrentCorrect =
        isHighlighted && highlightedRegion === correctRegion;

      // Set style based on region status
      if (isCorrectlyIdentified) {
        // Already correctly identified regions stay green
        return {
          fillColor: "#74c476", // Green
          weight: 1.5,
          opacity: 1,
          color: "#333",
          dashArray: "",
          fillOpacity: 0.7,
        };
      } else if (isHighlighted) {
        // Currently highlighted region (not yet correctly identified)
        return {
          fillColor: isCurrentCorrect ? "#74c476" : "#fb6a4a", // Green if correct, red if wrong
          weight: 1.5,
          opacity: 1,
          color: "#333",
          dashArray: "",
          fillOpacity: 0.7,
        };
      } else {
        // Default style for non-highlighted, non-identified regions
        return {
          fillColor: "#f2f2f2", // Light gray
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

  // Recreate the GeoJSON layer when the map is initialized or when correctRegions/language changes
  useEffect(() => {
    if (!isMapInitialized || !mapInstanceRef.current || !dataRef.current || !L)
      return;

    const updateMap = async () => {
      try {
        // Remove existing layer if it exists
        if (geojsonLayerRef.current) {
          mapInstanceRef.current.removeLayer(geojsonLayerRef.current);
        }

        // Create a new layer with updated event handlers
        const layer = L.geoJSON(dataRef.current, {
          style: (feature) => {
            return getRegionStyle(feature);
          },
          onEachFeature: (feature, layer) => {
            const regionName = getRegionName(feature);
            const isIdentified = correctRegions.includes(regionName);

            // Add tooltip only for correctly identified regions
            if (isIdentified) {
              layer.bindTooltip(regionName, {
                permanent: false,
                direction: "center",
                className: styles.regionTooltip,
              });
            }

            // Only add click handlers to regions that haven't been identified yet
            if (!isIdentified) {
              layer.on("click", () => {
                onRegionClick(regionName);
              });
            }
          },
        }).addTo(mapInstanceRef.current);

        // Fit map to GeoJSON bounds with some padding (only on initial creation)
        if (!geojsonLayerRef.current) {
          mapInstanceRef.current.fitBounds(layer.getBounds(), {
            padding: [20, 20],
          });
        }

        // Store layer in ref
        geojsonLayerRef.current = layer;

        // Add custom controls for zoom in/out
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
              // Check if we can zoom in further
              if (
                mapInstanceRef.current.getZoom() <
                mapInstanceRef.current.getMaxZoom()
              ) {
                mapInstanceRef.current.zoomIn();
              }
            });

            L.DomEvent.on(zoomOutButton, "click", function () {
              // Check if we can zoom out further
              if (
                mapInstanceRef.current.getZoom() >
                mapInstanceRef.current.getMinZoom()
              ) {
                mapInstanceRef.current.zoomOut();
              }
            });

            L.DomEvent.on(resetZoomButton, "click", function () {
              // Reset to initial view
              mapInstanceRef.current.setView([38.2, 24], 6);
            });

            return container;
          };

          zoomControlsContainer.addTo(mapInstanceRef.current);
        }

        // Add CSS to remove focus outlines from map layers
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
    getRegionStyle,
    correctRegions,
    onRegionClick,
    highlightedRegion,
    L,
    language,
    getRegionName,
  ]);

  return (
    <div className={styles.mapContainer}>
      <div ref={mapRef} className={styles.map}></div>
    </div>
  );
}
