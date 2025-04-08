// src/components/LeafletMap.js
"use client";
import { useEffect, useState } from "react";
import styles from "./LeafletMap.module.css";

export default function LeafletMap({
  onRegionClick,
  highlightedRegion,
  correctRegion,
}) {
  const [map, setMap] = useState(null);
  const [geojsonLayer, setGeojsonLayer] = useState(null);

  // Initialize map on first render
  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    // Dynamically import Leaflet
    const initMap = async () => {
      // Import Leaflet CSS
      await import("leaflet/dist/leaflet.css");

      // Import Leaflet library
      const L = (await import("leaflet")).default;

      // Fix icon paths (common Leaflet issue in bundled environments)
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      });

      // Check if map container exists and map not already initialized
      if (!map && document.getElementById("map")) {
        // Create map
        const mapInstance = L.map("map").setView([38.2, 24], 6);

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapInstance);

        // Save map instance to state
        setMap(mapInstance);
      }
    };

    initMap();

    // Cleanup function
    return () => {
      if (map) {
        map.remove();
        setMap(null);
        setGeojsonLayer(null);
      }
    };
  }, []);

  // Load GeoJSON data and handle highlighting when map is ready
  useEffect(() => {
    if (!map) return;

    const loadGeoJSON = async () => {
      try {
        // Remove existing GeoJSON layer if present
        if (geojsonLayer) {
          map.removeLayer(geojsonLayer);
        }

        // Import Leaflet again (needed for scope)
        const L = (await import("leaflet")).default;

        // Fetch GeoJSON data
        const response = await fetch("/data/gadm41_GRC_2.json");
        const data = await response.json();

        // Create new GeoJSON layer
        const layer = L.geoJSON(data, {
          style: (feature) => {
            const regionName = feature.properties.NAME_2;
            const isHighlighted = regionName === highlightedRegion;
            const isCorrect =
              isHighlighted && highlightedRegion === correctRegion;

            return {
              fillColor: isHighlighted
                ? isCorrect
                  ? "#74c476"
                  : "#fb6a4a"
                : "#3388ff",
              weight: 2,
              opacity: 1,
              color: "white",
              dashArray: "3",
              fillOpacity: 0.7,
            };
          },
          onEachFeature: (feature, layer) => {
            // Add tooltip with region name
            layer.bindTooltip(feature.properties.NAME_2);

            // Add click handler
            layer.on("click", () => {
              onRegionClick(feature.properties.NAME_2);
            });
          },
        }).addTo(map);

        // Fit map to GeoJSON bounds
        map.fitBounds(layer.getBounds());

        // Save layer reference to state
        setGeojsonLayer(layer);
      } catch (error) {
        console.error("Error loading GeoJSON:", error);
      }
    };

    loadGeoJSON();
  }, [map, highlightedRegion, correctRegion, onRegionClick]);

  return (
    <div className={styles.mapContainer}>
      <div id="map" className={styles.map}></div>
    </div>
  );
}
