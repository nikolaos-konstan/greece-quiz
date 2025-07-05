// src/hooks/useQuizData.js
import { useState, useEffect } from "react";
import { transformRegionData, validateRegionData } from "../utils/dataHelpers";

export const useQuizData = (quizConfig) => {
  const [regionsData, setRegionsData] = useState([]);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!quizConfig) return;

    const loadQuizData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(quizConfig.dataPath);

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
        console.error("Error loading quiz data:", err);
        setError(err.message);
        setRegionsData([]);
        setGeoJsonData(null);
      } finally {
        setLoading(false);
      }
    };

    loadQuizData();
  }, [quizConfig]);

  return {
    regionsData,
    geoJsonData,
    loading,
    error,
    hasData: regionsData.length > 0,
  };
};
