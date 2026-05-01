// src/hooks/useQuizData.js
import { useState, useEffect } from "react";
import { transformRegionData, validateRegionData } from "../utils/dataHelpers";
import { FETCH_TIMEOUT_MS } from "../config/quizConfig";

export const useQuizData = (quizConfig) => {
  const [regionsData, setRegionsData] = useState([]);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!quizConfig) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const loadQuizData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(quizConfig.dataPath, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Failed to load quiz data: ${response.status}`);
        }

        const data = await response.json();

        // Validate GeoJSON structure
        if (!data.features || !Array.isArray(data.features)) {
          throw new Error("Invalid GeoJSON format: missing features array");
        }

        // Transform the data using our helper
        const transformedData = transformRegionData(data.features, quizConfig);

        // Validate transformed data
        if (!validateRegionData(transformedData)) {
          throw new Error(
            "Invalid region data: missing required language names"
          );
        }

        setGeoJsonData(data);
        setRegionsData(transformedData);
      } catch (err) {
        if (err.name === "AbortError") {
          setError(
            "Data loading timed out. Please check your connection and try again."
          );
        } else {
          console.error("Error loading quiz data:", err);
          setError(err.message);
        }
        setRegionsData([]);
        setGeoJsonData(null);
      } finally {
        setLoading(false);
      }
    };

    loadQuizData();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [quizConfig]);

  return {
    regionsData,
    geoJsonData,
    loading,
    error,
    hasData: regionsData.length > 0,
  };
};
