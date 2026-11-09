// src/hooks/useQuizData.js
import { useEffect, useState } from "react";
import { FETCH_TIMEOUT_MS } from "../config/quizConfig";
import { transformRegionData, validateRegionData } from "../utils/dataHelpers";

// Quiz data never changes during a visit, so each file is only fetched once.
const dataCache = new Map();

export const clearQuizDataCache = () => dataCache.clear();

const fetchQuizData = async (quizConfig, signal) => {
  const response = await fetch(quizConfig.dataPath, { signal });
  if (!response.ok) {
    throw new Error(`Failed to load quiz data: ${response.status}`);
  }

  const geoJsonData = await response.json();
  if (!Array.isArray(geoJsonData.features)) {
    throw new Error("Invalid GeoJSON format: missing features array");
  }

  const regionsData = transformRegionData(geoJsonData.features, quizConfig);
  if (!validateRegionData(regionsData)) {
    throw new Error("Invalid region data: missing names or ids");
  }

  return { geoJsonData, regionsData };
};

// Mount this per quiz session (see QuizSession), so each session starts clean.
export const useQuizData = (quizConfig) => {
  const [data, setData] = useState(
    () => dataCache.get(quizConfig.dataPath) ?? null
  );
  const [errorKey, setErrorKey] = useState(null);

  useEffect(() => {
    if (dataCache.has(quizConfig.dataPath)) return undefined;

    const controller = new AbortController();
    let cancelled = false;
    let timedOut = false;
    // Covers the whole download, not just the wait for the response headers.
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, FETCH_TIMEOUT_MS);

    fetchQuizData(quizConfig, controller.signal)
      .then((loaded) => {
        dataCache.set(quizConfig.dataPath, loaded);
        if (!cancelled) setData(loaded);
      })
      .catch((err) => {
        if (cancelled) return;
        if (!timedOut) console.error("Error loading quiz data:", err);
        setErrorKey(timedOut ? "fetchTimeout" : "fetchFailed");
      })
      .finally(() => clearTimeout(timeoutId));

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [quizConfig]);

  return {
    regionsData: data?.regionsData ?? [],
    geoJsonData: data?.geoJsonData ?? null,
    loading: !data && !errorKey,
    errorKey,
  };
};
