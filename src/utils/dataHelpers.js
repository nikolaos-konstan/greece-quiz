// src/utils/dataHelpers.js

/**
 * Transforms GeoJSON features into standardized region data
 * @param {Array} features - GeoJSON features array
 * @param {Object} config - Quiz configuration object
 * @returns {Array} Standardized region objects
 */
export const transformRegionData = (features, config) => {
  if (!features || !config) return [];

  const { nameProperties } = config;

  return features.map((feature) => {
    const properties = feature.properties;

    return {
      id: generateRegionId(feature, config),
      nameGr: properties[nameProperties.el] || "",
      nameEng: properties[nameProperties.en] || "",
      originalProperties: properties,
      geometry: feature.geometry,
    };
  });
};

/**
 * Generates a unique ID for a region based on available properties
 * @param {Object} feature - GeoJSON feature
 * @param {Object} config - Quiz configuration
 * @returns {string} Unique region identifier
 */
const generateRegionId = (feature, config) => {
  const props = feature.properties;

  // Try different ID strategies based on quiz type
  if (config.id === "prefectures") {
    return props.ESYE_ID || props.NAME_ENG || props.NAME_GR;
  } else if (config.id === "municipalities") {
    return props.GID_3 || props.NAME_3 || props.NL_NAME_3;
  }

  // Fallback: use English name or first available property
  return props.NAME_ENG || props.NAME_3 || Object.values(props)[0] || "unknown";
};

/**
 * Extracts region names for the current language
 * @param {Array} regionsData - Transformed region data
 * @param {string} language - Current language ('en' or 'el')
 * @returns {Array} Array of region names in specified language
 */
export const getRegionNames = (regionsData, language) => {
  if (!regionsData || !language) return [];

  return regionsData
    .map((region) => (language === "en" ? region.nameEng : region.nameGr))
    .filter((name) => name); // Remove empty names
};

/**
 * Finds a region by name in the specified language
 * @param {Array} regionsData - Transformed region data
 * @param {string} regionName - Name to search for
 * @param {string} language - Language of the name
 * @returns {Object|null} Found region object or null
 */
export const findRegionByName = (regionsData, regionName, language) => {
  if (!regionsData || !regionName) return null;

  return (
    regionsData.find((region) => {
      const nameToCompare = language === "en" ? region.nameEng : region.nameGr;
      return nameToCompare === regionName;
    }) || null
  );
};

/**
 * Validates if region data is properly structured
 * @param {Array} regionsData - Region data to validate
 * @returns {boolean} True if data is valid
 */
export const validateRegionData = (regionsData) => {
  if (!Array.isArray(regionsData) || regionsData.length === 0) {
    return false;
  }

  // Check if at least some regions have both language names
  const validRegions = regionsData.filter(
    (region) => region.nameEng && region.nameGr
  );

  return validRegions.length > 0;
};
