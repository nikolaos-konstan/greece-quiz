// Builds the map files in public/data from the raw sources in data/raw:
// display names, a single id, smaller geometry. Run with `npm run data:build`.
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PREFECTURE_NAMES, municipalityNames } from "./regionNames.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// About half a pixel at the map's maximum zoom (10), in degrees.
const PREFECTURE_TOLERANCE = 0.0006;
// About 0.1 km². Islets below this are too small to see or click.
const PREFECTURE_MIN_AREA = 0.00001;

const SOURCES = [
  {
    input: "nomoi_okxe.geojson",
    output: "prefectures.geojson",
    tolerance: PREFECTURE_TOLERANCE,
    minArea: PREFECTURE_MIN_AREA,
    id: (properties) => properties.ESYE_ID,
    names: (properties) => {
      const [en, el] = PREFECTURE_NAMES[properties.ESYE_ID];
      return { en, el };
    },
  },
  {
    // Already coarse, so it only needs rounding.
    input: "dimoi.json",
    output: "municipalities.geojson",
    tolerance: 0,
    minArea: 0,
    id: (properties) => properties.GID_3,
    names: municipalityNames,
  },
];

const COORDINATE_FACTOR = 1e4; // 4 decimals, about 10 m
const LNG_SCALE = Math.cos((38 * Math.PI) / 180); // Greece's mid latitude

const roundCoordinate = (value) =>
  Math.round(value * COORDINATE_FACTOR) / COORDINATE_FACTOR;
const keyOf = ([lng, lat]) => `${lng},${lat}`;

const dedupe = (points) =>
  points.filter((point, i) => i === 0 || keyOf(point) !== keyOf(points[i - 1]));

const roundRing = (ring) =>
  dedupe(
    ring.map(([lng, lat]) => [roundCoordinate(lng), roundCoordinate(lat)])
  );

const ringArea = (ring) => {
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    sum += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return Math.abs(sum) / 2;
};

const distanceToSegment = (point, start, end) => {
  const px = (point[0] - start[0]) * LNG_SCALE;
  const py = point[1] - start[1];
  const ex = (end[0] - start[0]) * LNG_SCALE;
  const ey = end[1] - start[1];
  const lengthSquared = ex * ex + ey * ey;
  const along =
    lengthSquared === 0
      ? 0
      : Math.max(0, Math.min(1, (px * ex + py * ey) / lengthSquared));
  return Math.hypot(px - along * ex, py - along * ey);
};

// Douglas-Peucker on an open line.
const simplifyLine = (points, tolerance) => {
  if (points.length < 3) return points;
  const keep = new Array(points.length).fill(false);
  keep[0] = keep[points.length - 1] = true;
  const stack = [[0, points.length - 1]];

  while (stack.length > 0) {
    const [first, last] = stack.pop();
    let farthest = -1;
    let maxDistance = tolerance;
    for (let i = first + 1; i < last; i++) {
      const distance = distanceToSegment(
        points[i],
        points[first],
        points[last]
      );
      if (distance > maxDistance) {
        maxDistance = distance;
        farthest = i;
      }
    }
    if (farthest !== -1) {
      keep[farthest] = true;
      stack.push([first, farthest], [farthest, last]);
    }
  }

  return points.filter((_, i) => keep[i]);
};

const simplifyLoop = (points, tolerance) => {
  // A closed line has no baseline, so split it at its farthest point.
  let farthest = 1;
  let maxDistance = -1;
  for (let i = 1; i < points.length - 1; i++) {
    const distance = distanceToSegment(points[i], points[0], points[0]);
    if (distance > maxDistance) {
      maxDistance = distance;
      farthest = i;
    }
  }
  const head = simplifyLine(points.slice(0, farthest + 1), tolerance);
  const tail = simplifyLine(points.slice(farthest), tolerance);
  return [...head, ...tail.slice(1)];
};

// Neighbouring regions must simplify a shared border identically, or gaps open
// between them. Each arc is simplified in a direction that depends only on its
// points, so both regions get the same result whichever way their rings run.
const simplifyArc = (arc, tolerance) => {
  const first = keyOf(arc[0]);
  const last = keyOf(arc[arc.length - 1]);
  const isLoop = first === last;
  const reversed = isLoop
    ? keyOf(arc[1]) > keyOf(arc[arc.length - 2])
    : first > last;
  const points = reversed ? [...arc].reverse() : arc;
  const result = isLoop
    ? simplifyLoop(points, tolerance)
    : simplifyLine(points, tolerance);
  return reversed ? result.reverse() : result;
};

// A junction is a vertex with more than two distinct neighbours: where a border
// between two regions meets a third region or the coast.
const findJunctions = (rings) => {
  const neighbours = new Map();
  const link = (a, b) => {
    if (!neighbours.has(a)) neighbours.set(a, new Set());
    neighbours.get(a).add(b);
  };
  for (const ring of rings) {
    for (let i = 0; i < ring.length - 1; i++) {
      const a = keyOf(ring[i]);
      const b = keyOf(ring[i + 1]);
      link(a, b);
      link(b, a);
    }
  }
  const junctions = new Set();
  for (const [key, set] of neighbours) {
    if (set.size > 2) junctions.add(key);
  }
  return junctions;
};

const simplifyRing = (ring, junctions, tolerance) => {
  if (tolerance === 0 || ring.length < 5) return ring;
  const open = ring.slice(0, -1);

  let start = open.findIndex((point) => junctions.has(keyOf(point)));
  if (start === -1) {
    // No junction, so the ring is a single loop. Start from a fixed point so a
    // ring shared with an enclave is split the same way from both sides.
    start = 0;
    open.forEach((point, i) => {
      if (keyOf(point) < keyOf(open[start])) start = i;
    });
  }
  const rotated = [...open.slice(start), ...open.slice(0, start)];
  rotated.push(rotated[0]);

  const output = [rotated[0]];
  let arcStart = 0;
  for (let i = 1; i < rotated.length; i++) {
    if (i === rotated.length - 1 || junctions.has(keyOf(rotated[i]))) {
      const arc = simplifyArc(rotated.slice(arcStart, i + 1), tolerance);
      output.push(...arc.slice(1));
      arcStart = i;
    }
  }

  // Too small to survive simplification: keep the original shape.
  return output.length >= 4 ? output : ring;
};

const polygonsOf = (geometry) =>
  geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;

const buildFile = ({ input, output, tolerance, minArea, id, names }) => {
  const rawText = readFileSync(join(ROOT, "data/raw", input), "utf8");
  const raw = JSON.parse(rawText);

  const roundedFeatures = raw.features.map((feature) => ({
    properties: feature.properties,
    polygons: polygonsOf(feature.geometry).map((polygon) =>
      polygon.map(roundRing)
    ),
  }));

  const allRings = roundedFeatures.flatMap(({ polygons }) => polygons.flat());
  const junctions = findJunctions(allRings);

  const features = roundedFeatures.map(({ properties, polygons }) => {
    const largest = Math.max(...polygons.map(([outer]) => ringArea(outer)));
    const kept = polygons
      .filter(([outer]) => {
        const area = ringArea(outer);
        return area === largest || area >= minArea;
      })
      .map(([outer, ...holes]) => [
        simplifyRing(outer, junctions, tolerance),
        ...holes
          .filter((hole) => ringArea(hole) >= minArea)
          .map((hole) => simplifyRing(hole, junctions, tolerance)),
      ]);
    const { en, el } = names(properties);

    return {
      type: "Feature",
      properties: { id: id(properties), name_en: en, name_el: el },
      geometry: { type: "MultiPolygon", coordinates: kept },
    };
  });

  const text = JSON.stringify({ type: "FeatureCollection", features });
  writeFileSync(join(ROOT, "public/data", output), text);

  const vertices = (rings) => rings.reduce((sum, ring) => sum + ring.length, 0);
  const kilobytes = (bytes) => `${Math.round(bytes / 1024)} KB`;
  console.log(
    `${output}: ${features.length} regions, ` +
      `${vertices(allRings)} -> ` +
      `${vertices(features.flatMap((f) => f.geometry.coordinates.flat()))} vertices, ` +
      `${kilobytes(rawText.length)} -> ${kilobytes(text.length)} ` +
      `(${kilobytes(gzipSync(text).length)} gzipped)`
  );
};

SOURCES.forEach(buildFile);
