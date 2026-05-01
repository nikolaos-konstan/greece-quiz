import { describe, it, expect } from "vitest";
import {
  transformRegionData,
  getRegionNames,
  findRegionByName,
  validateRegionData,
} from "../dataHelpers";

const prefectureConfig = {
  id: "prefectures",
  nameProperties: { en: "NAME_ENG", el: "NAME_GR" },
};

const mockFeatures = [
  {
    properties: {
      NAME_ENG: "Attica",
      NAME_GR: "Αττική",
      ESYE_ID: "01",
    },
    geometry: { type: "Polygon", coordinates: [] },
  },
  {
    properties: {
      NAME_ENG: "Thessaloniki",
      NAME_GR: "Θεσσαλονίκη",
      ESYE_ID: "02",
    },
    geometry: { type: "Polygon", coordinates: [] },
  },
];

describe("transformRegionData", () => {
  it("transforms features into region objects", () => {
    const result = transformRegionData(mockFeatures, prefectureConfig);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      nameEng: "Attica",
      nameGr: "Αττική",
      id: "01",
    });
    expect(result[1]).toMatchObject({
      nameEng: "Thessaloniki",
      nameGr: "Θεσσαλονίκη",
    });
  });

  it("returns empty array for null features", () => {
    expect(transformRegionData(null, prefectureConfig)).toEqual([]);
  });

  it("returns empty array for null config", () => {
    expect(transformRegionData(mockFeatures, null)).toEqual([]);
  });

  it("preserves original properties", () => {
    const result = transformRegionData(mockFeatures, prefectureConfig);
    expect(result[0].originalProperties.ESYE_ID).toBe("01");
  });
});

describe("getRegionNames", () => {
  const regionsData = transformRegionData(mockFeatures, prefectureConfig);

  it("returns English names when language is en", () => {
    const names = getRegionNames(regionsData, "en");
    expect(names).toEqual(["Attica", "Thessaloniki"]);
  });

  it("returns Greek names when language is el", () => {
    const names = getRegionNames(regionsData, "el");
    expect(names).toEqual(["Αττική", "Θεσσαλονίκη"]);
  });

  it("filters out empty names", () => {
    const dataWithEmpty = [
      { nameEng: "Attica", nameGr: "Αττική" },
      { nameEng: "", nameGr: "" },
    ];
    const names = getRegionNames(dataWithEmpty, "en");
    expect(names).toEqual(["Attica"]);
  });

  it("returns empty array for null input", () => {
    expect(getRegionNames(null, "en")).toEqual([]);
  });
});

describe("findRegionByName", () => {
  const regionsData = transformRegionData(mockFeatures, prefectureConfig);

  it("finds region by English name", () => {
    const result = findRegionByName(regionsData, "Attica", "en");
    expect(result?.nameEng).toBe("Attica");
  });

  it("finds region by Greek name", () => {
    const result = findRegionByName(regionsData, "Αττική", "el");
    expect(result?.nameGr).toBe("Αττική");
  });

  it("returns null for unknown name", () => {
    expect(findRegionByName(regionsData, "Unknown", "en")).toBeNull();
  });

  it("returns null for null input", () => {
    expect(findRegionByName(null, "Attica", "en")).toBeNull();
  });
});

describe("validateRegionData", () => {
  const regionsData = transformRegionData(mockFeatures, prefectureConfig);

  it("returns true for valid data", () => {
    expect(validateRegionData(regionsData)).toBe(true);
  });

  it("returns false for empty array", () => {
    expect(validateRegionData([])).toBe(false);
  });

  it("returns false for non-array", () => {
    expect(validateRegionData(null)).toBe(false);
  });

  it("returns false when no region has both language names", () => {
    const missingNames = [{ nameEng: "", nameGr: "" }];
    expect(validateRegionData(missingNames)).toBe(false);
  });
});
