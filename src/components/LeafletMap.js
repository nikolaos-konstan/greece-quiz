// src/components/LeafletMap.js
"use client";
import { useEffect, useState, useRef } from "react";
import styles from "./LeafletMap.module.css";

export default function LeafletMap({
  onRegionClick,
  highlightedRegion,
  correctRegion,
}) {
  const mapRef = useRef(null);
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

      // Ensure map container exists and map not already initialized
      const mapContainer = mapRef.current;
      if (mapContainer && !map) {
        try {
          // Check if map already exists
          if (mapContainer._leaflet_map) {
            mapContainer._leaflet_map.remove();
          }

          // Create map with limited interactions for a simpler interface
          const mapInstance = L.map(mapContainer, {
            zoomControl: false, // Remove zoom controls
            dragging: false, // Disable dragging
            touchZoom: false, // Disable touch zoom
            scrollWheelZoom: false, // Disable scroll wheel zoom
            doubleClickZoom: false, // Disable double click zoom
            boxZoom: false, // Disable box zoom
            keyboard: false, // Disable keyboard navigation
            attributionControl: false, // Remove attribution
          }).setView([38.2, 24], 6);

          // Save map instance to state
          setMap(mapInstance);
        } catch (error) {
          console.error("Error initializing map:", error);
        }
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
        const response = await fetch("/data/nomoi_okxe.geojson");
        const data = await response.json();

        // Create new GeoJSON layer
        const layer = L.geoJSON(data, {
          style: (feature) => {
            const regionName = feature.properties.NAME_ENG;
            const isHighlighted = regionName === highlightedRegion;
            const isCorrect =
              isHighlighted && highlightedRegion === correctRegion;

            return {
              fillColor: isHighlighted
                ? isCorrect
                  ? "#74c476"
                  : "#fb6a4a"
                : "#f2f2f2", // Light gray fill for regions
              weight: 1.5, // Border thickness
              opacity: 1,
              color: "#333", // Border color
              dashArray: "", // Solid lines
              fillOpacity: 0.7,
            };
          },
          onEachFeature: (feature, layer) => {
            const regionName = feature.properties.NAME_ENG;

            // Add tooltip with region name
            layer.bindTooltip(regionName);

            // Add click handler
            layer.on("click", () => {
              onRegionClick(regionName);
            });
          },
        }).addTo(map);

        // Fit map to GeoJSON bounds with some padding
        map.fitBounds(layer.getBounds(), {
          padding: [20, 20],
        });

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
      <div ref={mapRef} className={styles.map}></div>
    </div>
  );
}
