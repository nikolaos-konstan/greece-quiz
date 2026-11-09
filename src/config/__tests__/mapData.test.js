import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import {
  transformRegionData,
  validateRegionData,
} from "../../utils/dataHelpers";
import { QUIZ_CONFIGS } from "../quizConfig";

const load = (config) =>
  JSON.parse(readFileSync(join("public", config.dataPath), "utf8"));

const duplicates = (values) =>
  values.filter((value, i) => values.indexOf(value) !== i);

describe.each(Object.values(QUIZ_CONFIGS))("$id map data", (config) => {
  const { features } = load(config);
  const regions = transformRegionData(features, config);

  it("passes validation", () => {
    expect(validateRegionData(regions)).toBe(true);
  });

  it("has no duplicate names, so every question is unambiguous", () => {
    expect(duplicates(regions.map((region) => region.nameEng))).toEqual([]);
    expect(duplicates(regions.map((region) => region.nameGr))).toEqual([]);
  });

  it("has no names with missing spaces or upper-case source names", () => {
    const words = regions.flatMap(({ nameEng, nameGr }) => [nameEng, nameGr]);
    expect(words.filter((name) => /[a-zα-ωά-ώ][A-ZΑ-ΩΆ-Ώ]/.test(name))).toEqual(
      []
    );
    expect(words.filter((name) => name === name.toUpperCase())).toEqual([]);
  });

  it("has closed rings with enough points to draw", () => {
    const invalid = features.flatMap((feature) =>
      feature.geometry.coordinates
        .flat()
        .filter(
          (ring) =>
            ring.length < 4 ||
            ring[0][0] !== ring.at(-1)[0] ||
            ring[0][1] !== ring.at(-1)[1]
        )
    );
    expect(invalid).toEqual([]);
  });
});
