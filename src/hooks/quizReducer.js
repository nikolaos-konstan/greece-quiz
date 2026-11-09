// src/hooks/quizReducer.js
// Pure game state machine. Randomness is passed in through actions so that the
// reducer stays deterministic and can be tested without mocks.
import { RANK_THRESHOLDS, SKIP_PENALTY } from "../config/quizConfig";

export const PENDING = { CORRECT: "correct", SKIP: "skip" };
export const STATUS = {
  PLAYING: "playing",
  COMPLETE: "complete",
  GAVE_UP: "gaveUp",
};

const pick = (items, random) => items[Math.floor(random * items.length)];
const without = (items, item) => items.filter((value) => value !== item);

export const createQuizState = (regionIds, random) => ({
  total: regionIds.length,
  queue: [...regionIds],
  skipped: [],
  correct: [],
  current: regionIds.length > 0 ? pick(regionIds, random) : null,
  status: regionIds.length > 0 ? STATUS.PLAYING : STATUS.COMPLETE,
  isSecondPass: false,
  // While set, a transition to the next question is scheduled and input is ignored.
  pending: null,
  // A new object per wrong click, so the feedback timer restarts every time.
  wrongClick: null,
  errors: 0,
  skips: 0,
  streak: 0,
  bestStreak: 0,
});

const handleClick = (state, id) => {
  if (id !== state.current) {
    if (state.correct.includes(id)) return state;
    return {
      ...state,
      errors: state.errors + 1,
      streak: 0,
      wrongClick: { id },
    };
  }

  const queue = without(state.queue, id);
  const skipped = without(state.skipped, id);
  const streak = state.streak + 1;
  const isFinished = queue.length === 0 && skipped.length === 0;

  return {
    ...state,
    queue,
    skipped,
    correct: [...state.correct, id],
    streak,
    bestStreak: Math.max(state.bestStreak, streak),
    wrongClick: null,
    current: isFinished ? null : state.current,
    status: isFinished ? STATUS.COMPLETE : state.status,
    pending: isFinished ? null : PENDING.CORRECT,
  };
};

const handleSkip = (state) => {
  // A second-pass skip only moves to another skipped region, without penalty.
  if (state.isSecondPass) {
    if (state.skipped.length < 2) return state;
    return { ...state, pending: PENDING.SKIP, wrongClick: null };
  }

  return {
    ...state,
    queue: without(state.queue, state.current),
    skipped: [...state.skipped, state.current],
    skips: state.skips + 1,
    pending: PENDING.SKIP,
    wrongClick: null,
  };
};

const handleAdvance = (state, random) => {
  const isSecondPass = state.queue.length === 0;
  const pool = isSecondPass ? state.skipped : state.queue;
  const candidates = pool.length > 1 ? without(pool, state.current) : pool;

  return {
    ...state,
    current: pick(candidates, random),
    isSecondPass,
    pending: null,
    wrongClick: null,
  };
};

export const quizReducer = (state, action) => {
  if (action.type === "restart") {
    return createQuizState(action.regionIds, action.random);
  }

  if (state.status !== STATUS.PLAYING) return state;

  switch (action.type) {
    case "click":
      return state.pending ? state : handleClick(state, action.id);
    case "skip":
      return state.pending ? state : handleSkip(state);
    case "advance":
      return state.pending ? handleAdvance(state, action.random) : state;
    case "clearWrongClick":
      return { ...state, wrongClick: null };
    case "giveUp":
      return {
        ...state,
        status: STATUS.GAVE_UP,
        current: null,
        pending: null,
        wrongClick: null,
      };
    default:
      return state;
  }
};

// Regions left unfound after giving up cost more than skips, so that giving up
// can never score better than finishing the quiz.
export const getScore = (state) => {
  if (state.total === 0) return 0;
  const unfound =
    state.status === STATUS.GAVE_UP ? state.total - state.correct.length : 0;
  const penalty = state.errors + state.skips * SKIP_PENALTY + unfound;
  return Math.max(0, Math.round(100 - (penalty / state.total) * 100));
};

export const getRankKey = (score) => {
  if (score >= RANK_THRESHOLDS.S) return "rankS";
  if (score >= RANK_THRESHOLDS.A) return "rankA";
  if (score >= RANK_THRESHOLDS.B) return "rankB";
  if (score >= RANK_THRESHOLDS.C) return "rankC";
  if (score >= RANK_THRESHOLDS.D) return "rankD";
  if (score >= RANK_THRESHOLDS.E) return "rankE";
  return "rankF";
};
