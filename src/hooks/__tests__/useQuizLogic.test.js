import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { TIMING } from "../../config/quizConfig";
import { useQuizLogic } from "../useQuizLogic";

const regions = [
  { id: "a", nameEng: "Alpha", nameGr: "Άλφα" },
  { id: "b", nameEng: "Beta", nameGr: "Βήτα" },
];

const setup = (language = "en") =>
  renderHook(() => useQuizLogic(regions, language)).result;
const wait = (ms) => act(() => vi.advanceTimersByTime(ms));

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(Math, "random").mockReturnValue(0);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useQuizLogic", () => {
  it("shows the question in the selected language", () => {
    expect(setup("en").current.currentQuestion).toBe("Alpha");
    expect(setup("el").current.currentQuestion).toBe("Άλφα");
  });

  it("moves on after the correct delay", () => {
    const result = setup();
    act(() => result.current.handleRegionClick("a"));
    expect(result.current.isCorrect).toBe(true);
    expect(result.current.currentQuestion).toBe("Alpha");

    wait(TIMING.CORRECT_DELAY);
    expect(result.current.currentQuestion).toBe("Beta");
    expect(result.current.isCorrect).toBeNull();
  });

  it("clears wrong-answer feedback but keeps the question", () => {
    const result = setup();
    act(() => result.current.handleRegionClick("b"));
    expect(result.current.isCorrect).toBe(false);
    expect(result.current.wrongRegionId).toBe("b");

    wait(TIMING.INCORRECT_FEEDBACK);
    expect(result.current.isCorrect).toBeNull();
    expect(result.current.wrongRegionId).toBeNull();
    expect(result.current.currentQuestion).toBe("Alpha");
  });

  it("does not get stuck after a wrong click during the correct delay", () => {
    const result = setup();
    act(() => result.current.handleRegionClick("a"));
    wait(200);
    act(() => result.current.handleRegionClick("b"));
    wait(TIMING.CORRECT_DELAY);

    expect(result.current.currentQuestion).toBe("Beta");
    expect(result.current.errors).toBe(0);
  });

  it("clears the feedback when the last region is found", () => {
    const result = setup();
    act(() => result.current.handleRegionClick("a"));
    wait(TIMING.CORRECT_DELAY);
    act(() => result.current.handleRegionClick("b"));

    expect(result.current.gameComplete).toBe(true);
    expect(result.current.isCorrect).toBeNull();
    expect(result.current.score).toBe(100);
  });

  it("does not let a pending timer change the question after a restart", () => {
    const result = setup();
    act(() => result.current.handleRegionClick("a"));
    wait(200);
    act(() => result.current.resetQuiz());
    wait(TIMING.CORRECT_DELAY * 2);

    expect(result.current.currentQuestion).toBe("Alpha");
    expect(result.current.identifiedRegions).toBe(0);
  });

  it("reports second-pass progress accurately", () => {
    const result = setup();
    act(() => result.current.handleSkipQuestion());
    wait(TIMING.SKIP_DELAY);
    act(() => result.current.handleSkipQuestion());
    wait(TIMING.SKIP_DELAY);
    expect(result.current.isSkippedPhase).toBe(true);
    expect(result.current.skippedRegions).toBe(2);

    act(() => result.current.handleRegionClick("a"));
    expect(result.current.identifiedRegions).toBe(1);
    expect(result.current.skippedRegions).toBe(1);
    expect(result.current.gameComplete).toBe(false);
  });
});
