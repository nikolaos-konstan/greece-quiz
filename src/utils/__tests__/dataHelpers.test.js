import { describe, it, expect } from "vitest";
import {
  getRegionName,
  transformRegionData,
  validateRegionData,
} from "../dataHelpers";

const config = {
  idProperty: "id",
  nameProperties: { en: "name_en", el: "name_el" },
};

const mockFeatures = [
  {
    properties: { id: "01", name_en: "Attica", name_el: "Αττική" },
    geometry: { type: "Polygon", coordinates: [] },
  },
  {
    properties: { id: "02", name_en: "Thessaloniki", name_el: "Θεσσαλονίκη" },
    geometry: { type: "Polygon", coordinates: [] },
  },
];

describe("transformRegionData", () => {
  it("transforms features into region objects", () => {
    expect(transformRegionData(mockFeatures, config)).toEqual([
      { id: "01", nameEng: "Attica", nameGr: "Αττική" },
      { id: "02", nameEng: "Thessaloniki", nameGr: "Θεσσαλονίκη" },
    ]);
  });

  it("returns empty array for null features", () => {
    expect(transformRegionData(null, config)).toEqual([]);
  });

  it("returns empty array for null config", () => {
    expect(transformRegionData(mockFeatures, null)).toEqual([]);
  });
});

describe("getRegionName", () => {
  const region = { id: "01", nameEng: "Attica", nameGr: "Αττική" };

  it("returns the name in the given language", () => {
    expect(getRegionName(region, "en")).toBe("Attica");
    expect(getRegionName(region, "el")).toBe("Αττική");
  });
});

describe("validateRegionData", () => {
  const valid = transformRegionData(mockFeatures, config);

  it("returns true for valid data", () => {
    expect(validateRegionData(valid)).toBe(true);
  });

  it("returns false for empty array", () => {
    expect(validateRegionData([])).toBe(false);
  });

  it("returns false for non-array", () => {
    expect(validateRegionData(null)).toBe(false);
  });

  it("returns false when any region is missing a name", () => {
    expect(
      validateRegionData([...valid, { id: "03", nameEng: "Crete", nameGr: "" }])
    ).toBe(false);
  });

  it("returns false when any region is missing an id", () => {
    expect(
      validateRegionData([
        ...valid,
        { id: "", nameEng: "Crete", nameGr: "Κρήτη" },
      ])
    ).toBe(false);
  });

  it("returns false for duplicate ids", () => {
    expect(validateRegionData([...valid, valid[0]])).toBe(false);
  });
});
