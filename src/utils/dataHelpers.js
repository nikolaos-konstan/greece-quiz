// src/utils/dataHelpers.js

/**
 * Transforms GeoJSON features into standardized region data
 * @param {Array} features - GeoJSON features array
 * @param {Object} config - Quiz configuration object
 * @returns {Array} Region objects with an id and a name per language
 */
export const transformRegionData = (features, config) => {
  if (!features || !config) return [];

  const { idProperty, nameProperties } = config;

  return features.map(({ properties }) => ({
    id: properties[idProperty] ?? "",
    nameGr: properties[nameProperties.el] || "",
    nameEng: properties[nameProperties.en] || "",
  }));
};

/**
 * Returns a region's name in the given language
 * @param {Object} region - Transformed region
 * @param {string} language - Current language ('en' or 'el')
 * @returns {string} Region name
 */
export const getRegionName = (region, language) =>
  language === "en" ? region.nameEng : region.nameGr;

/**
 * Validates region data. A region without a name or an id could never be asked
 * or answered, which would make the quiz impossible to finish, so every region
 * must have both names and a unique id.
 * @param {Array} regionsData - Region data to validate
 * @returns {boolean} True if data is valid
 */
export const validateRegionData = (regionsData) => {
  if (!Array.isArray(regionsData) || regionsData.length === 0) {
    return false;
  }

  const ids = new Set(regionsData.map((region) => region.id));

  return (
    ids.size === regionsData.length &&
    regionsData.every((region) => region.id && region.nameEng && region.nameGr)
  );
};
