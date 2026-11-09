import { describe, it, expect } from "vitest";
import {
  PENDING,
  STATUS,
  createQuizState,
  getRankKey,
  getScore,
  quizReducer,
} from "../quizReducer";

const IDS = ["a", "b", "c", "d"];
const FIRST = 0;

const run = (state, ...actions) => actions.reduce(quizReducer, state);
const start = (ids = IDS) => createQuizState(ids, FIRST);
const advance = { type: "advance", random: FIRST };
const skip = { type: "skip" };
const click = (id) => ({ type: "click", id });
const answer = (state) => run(state, click(state.current), advance);

describe("first pass", () => {
  it("starts on a question with every region queued", () => {
    const state = start();
    expect(state.current).toBe("a");
    expect(state.queue).toEqual(IDS);
    expect(state.status).toBe(STATUS.PLAYING);
  });

  it("moves a correct answer out of the queue and schedules the next question", () => {
    const state = run(start(), click("a"));
    expect(state.correct).toEqual(["a"]);
    expect(state.queue).toEqual(["b", "c", "d"]);
    expect(state.pending).toBe(PENDING.CORRECT);
    expect(run(state, advance).current).toBe("b");
  });

  it("keeps the question and resets the streak on a wrong answer", () => {
    const state = run(start(), click("a"), advance, click("c"));
    expect(state.current).toBe("b");
    expect(state.errors).toBe(1);
    expect(state.streak).toBe(0);
    expect(state.bestStreak).toBe(1);
    expect(state.wrongClick).toEqual({ id: "c" });
  });

  it("does not count clicks on identified regions as errors", () => {
    const state = run(start(), click("a"), advance, click("a"));
    expect(state.errors).toBe(0);
    expect(state.wrongClick).toBeNull();
  });
});

describe("skipping", () => {
  it("asks skipped regions again once the queue is empty", () => {
    let state = run(start(), skip, advance);
    state = answer(state);
    state = answer(state);
    state = run(state, click(state.current), advance);

    expect(state.status).toBe(STATUS.PLAYING);
    expect(state.isSecondPass).toBe(true);
    expect(state.current).toBe("a");
  });

  it("only completes after every skipped region is found", () => {
    let state = start();
    for (let i = 0; i < IDS.length; i++) state = run(state, skip, advance);
    expect(state.isSecondPass).toBe(true);
    expect(state.skipped).toHaveLength(4);

    for (let found = 1; found < IDS.length; found++) {
      state = answer(state);
      expect(state.status).toBe(STATUS.PLAYING);
      expect(state.correct).toHaveLength(found);
      expect(state.skipped).toHaveLength(4 - found);
    }

    state = run(state, click(state.current));
    expect(state.status).toBe(STATUS.COMPLETE);
    expect(state.correct).toHaveLength(4);
    expect(state.current).toBeNull();
  });

  it("re-asks the last region when it is the only one and gets skipped", () => {
    const state = run(start(["a"]), skip, advance);
    expect(state.status).toBe(STATUS.PLAYING);
    expect(state.current).toBe("a");
    expect(state.isSecondPass).toBe(true);
  });

  it("cycles through the second pass without losing regions or adding skips", () => {
    let state = run(start(["a", "b"]), skip, advance, skip, advance);
    expect(state.skips).toBe(2);
    const first = state.current;

    state = run(state, skip, advance);
    expect(state.current).not.toBe(first);
    state = run(state, skip, advance);
    expect(state.current).toBe(first);

    expect(state.skips).toBe(2);
    expect(state.skipped).toHaveLength(2);
    expect(state.status).toBe(STATUS.PLAYING);
  });

  it("ignores a second-pass skip when only one region is left", () => {
    const state = run(start(["a"]), skip, advance);
    expect(run(state, skip)).toBe(state);
  });
});

describe("input during a transition", () => {
  it("ignores a wrong click during the correct delay", () => {
    const state = run(start(), click("a"), click("b"));
    expect(state.errors).toBe(0);
    expect(state.pending).toBe(PENDING.CORRECT);
    expect(run(state, advance).current).toBe("b");
  });

  it("ignores Next during the correct delay", () => {
    const state = run(start(), click("a"), skip);
    expect(state.skips).toBe(0);
    expect(state.skipped).toEqual([]);
  });

  it("counts a double Next as one skip", () => {
    const state = run(start(), skip, skip);
    expect(state.skips).toBe(1);
    expect(state.skipped).toEqual(["a"]);
  });

  it("ignores a click during the skip delay", () => {
    const state = run(start(), skip, click("a"));
    expect(state.correct).toEqual([]);
    expect(state.errors).toBe(0);
  });

  it("ignores a stray advance when nothing is pending", () => {
    const state = start();
    expect(run(state, advance)).toBe(state);
  });
});

describe("game end", () => {
  it("ignores input once the quiz is over", () => {
    const state = run(start(["a"]), click("a"));
    expect(state.status).toBe(STATUS.COMPLETE);
    expect(run(state, click("a"), skip, advance)).toBe(state);
  });

  it("gives up and clears the question", () => {
    const state = run(start(), skip, advance, { type: "giveUp" });
    expect(state.status).toBe(STATUS.GAVE_UP);
    expect(state.current).toBeNull();
    expect(state.pending).toBeNull();
  });

  it("restarts from a clean state", () => {
    const state = run(start(), click("a"), advance, click("c"), {
      type: "restart",
      regionIds: IDS,
      random: FIRST,
    });
    expect(state).toEqual(start());
  });
});

describe("scoring", () => {
  it("scores a perfect game as 100", () => {
    let state = start();
    while (state.status === STATUS.PLAYING) {
      state = quizReducer(state, click(state.current));
      if (state.pending) state = quizReducer(state, advance);
    }
    expect(getScore(state)).toBe(100);
  });

  it("applies error and skip penalties", () => {
    const state = run(start(), skip, advance, click("c"));
    // (1 error + 1 skip * 0.5) / 4 regions = 37.5% penalty
    expect(getScore(state)).toBe(63);
  });

  it("gives no credit for skipping everything and giving up", () => {
    let state = start();
    for (let i = 0; i < IDS.length; i++) state = run(state, skip, advance);
    expect(getScore(run(state, { type: "giveUp" }))).toBe(0);
  });

  it("scores giving up below finishing the same game", () => {
    const played = run(start(), skip, advance);
    const gaveUp = run(played, { type: "giveUp" });
    expect(getScore(gaveUp)).toBeLessThan(getScore(played));
  });

  it("maps scores to rank keys", () => {
    expect(getRankKey(100)).toBe("rankS");
    expect(getRankKey(88)).toBe("rankA");
    expect(getRankKey(72)).toBe("rankB");
    expect(getRankKey(55)).toBe("rankC");
    expect(getRankKey(38)).toBe("rankD");
    expect(getRankKey(20)).toBe("rankE");
    expect(getRankKey(0)).toBe("rankF");
  });
});
