// src/components/LeafletMap.js
"use client";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import styles from "./LeafletMap.module.css";

export default function LeafletMap({
  onRegionClick,
  highlightedRegion,
  correctRegion,
}) {
  const [mapInitialized, setMapInitialized] = useState(false);

  useEffect(() => {
    // Dynamic import of Leaflet to avoid SSR issues
    const initializeMap = async () => {
      if (typeof window !== "undefined" && !mapInitialized) {
        const L = await import("leaflet");

        // Create map instance
        const map = L.map("map").setView([38.5, 24], 7); // Center on Greece

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        // Load GeoJSON data
        try {
          const response = await fetch("/data/gadm41_GRC_1.json");
          const geoData = await response.json();

          // Add GeoJSON to map with styling
          const geojsonLayer = L.geoJSON(geoData, {
            style: (feature) => {
              const isHighlighted =
                feature.properties.NAME_1 === highlightedRegion;
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
              layer.on({
                click: () => {
                  if (onRegionClick) {
                    onRegionClick(feature.properties.NAME_1);
                  }
                },
              });
            },
          }).addTo(map);

          // Fit map to GeoJSON bounds
          map.fitBounds(geojsonLayer.getBounds());

          setMapInitialized(true);
        } catch (error) {
          console.error("Error loading GeoJSON:", error);
        }
      }
    };

    initializeMap();

    // Cleanup
    return () => {
      if (typeof window !== "undefined" && mapInitialized) {
        const mapElement = document.getElementById("map");
        if (mapElement && mapElement._leaflet_id) {
          mapElement._leaflet_id = null;
        }
      }
    };
  }, [onRegionClick, highlightedRegion, correctRegion, mapInitialized]);

  return (
    <div className={styles.mapContainer}>
      <div id="map" className={styles.map}></div>
    </div>
  );
}
