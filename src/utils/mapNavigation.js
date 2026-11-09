// src/utils/mapNavigation.js

const DIRECTIONS = {
  ArrowUp: { lat: 1, lng: 0 },
  ArrowDown: { lat: -1, lng: 0 },
  ArrowLeft: { lat: 0, lng: -1 },
  ArrowRight: { lat: 0, lng: 1 },
};

// How much sideways drift counts against a candidate, relative to its distance.
const SIDEWAYS_WEIGHT = 2;

export const isArrowKey = (key) => key in DIRECTIONS;

/**
 * Finds the region an arrow key should move to from the current one
 * @param {Array} centers - Region centers as { id, lat, lng }
 * @param {string} fromId - Id of the current region
 * @param {string} key - Arrow key name
 * @returns {string|null} Id of the closest region that way, or null if none
 */
export const findNeighbor = (centers, fromId, key) => {
  const from = centers.find((center) => center.id === fromId);
  const direction = DIRECTIONS[key];
  if (!from || !direction) return null;

  let bestId = null;
  let bestCost = Infinity;

  for (const center of centers) {
    if (center.id === fromId) continue;
    const dLat = center.lat - from.lat;
    const dLng = center.lng - from.lng;
    const forward = dLat * direction.lat + dLng * direction.lng;
    if (forward <= 0) continue;

    const sideways =
      Math.abs(dLat * direction.lng) + Math.abs(dLng * direction.lat);
    const cost = forward + sideways * SIDEWAYS_WEIGHT;
    if (cost < bestCost) {
      bestCost = cost;
      bestId = center.id;
    }
  }

  return bestId;
};
