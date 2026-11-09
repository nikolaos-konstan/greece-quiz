import { describe, it, expect } from "vitest";
import { findNeighbor, isArrowKey } from "../mapNavigation";

const centers = [
  { id: "center", lat: 38, lng: 24 },
  { id: "north", lat: 40, lng: 24 },
  { id: "farNorth", lat: 41, lng: 24 },
  { id: "south", lat: 36, lng: 24.2 },
  { id: "east", lat: 38, lng: 26 },
  { id: "west", lat: 38.1, lng: 21 },
];

describe("findNeighbor", () => {
  it("moves to the closest region in each direction", () => {
    expect(findNeighbor(centers, "center", "ArrowUp")).toBe("north");
    expect(findNeighbor(centers, "center", "ArrowDown")).toBe("south");
    expect(findNeighbor(centers, "center", "ArrowRight")).toBe("east");
    expect(findNeighbor(centers, "center", "ArrowLeft")).toBe("west");
  });

  it("prefers a region straight ahead over a closer one off to the side", () => {
    const options = [
      { id: "from", lat: 38, lng: 24 },
      { id: "diagonal", lat: 39, lng: 25.5 },
      { id: "ahead", lat: 41, lng: 24 },
    ];
    expect(findNeighbor(options, "from", "ArrowUp")).toBe("ahead");
  });

  it("returns null when nothing lies that way", () => {
    expect(findNeighbor(centers, "farNorth", "ArrowUp")).toBeNull();
  });

  it("returns null for an unknown region or key", () => {
    expect(findNeighbor(centers, "missing", "ArrowUp")).toBeNull();
    expect(findNeighbor(centers, "center", "Enter")).toBeNull();
  });
});

describe("isArrowKey", () => {
  it("recognizes arrow keys only", () => {
    expect(isArrowKey("ArrowLeft")).toBe(true);
    expect(isArrowKey("Enter")).toBe(false);
  });
});
