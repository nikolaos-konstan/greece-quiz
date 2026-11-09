// src/hooks/useQuizLogic.js
import { useCallback, useEffect, useMemo, useReducer } from "react";
import { TIMING } from "../config/quizConfig";
import { t } from "../config/translations";
import { getRegionName } from "../utils/dataHelpers";
import {
  PENDING,
  STATUS,
  createQuizState,
  getRankKey,
  getScore,
  quizReducer,
} from "./quizReducer";

export const useQuizLogic = (regionsData, language) => {
  const regionIds = useMemo(
    () => regionsData.map((region) => region.id),
    [regionsData]
  );
  const [state, dispatch] = useReducer(quizReducer, regionIds, (ids) =>
    createQuizState(ids, Math.random())
  );

  // Timers follow the state, so a state change can never leave one behind.
  useEffect(() => {
    if (!state.pending) return undefined;
    const delay =
      state.pending === PENDING.CORRECT
        ? TIMING.CORRECT_DELAY
        : TIMING.SKIP_DELAY;
    const timer = setTimeout(
      () => dispatch({ type: "advance", random: Math.random() }),
      delay
    );
    return () => clearTimeout(timer);
  }, [state.pending]);

  useEffect(() => {
    if (!state.wrongClick) return undefined;
    const timer = setTimeout(
      () => dispatch({ type: "clearWrongClick" }),
      TIMING.INCORRECT_FEEDBACK
    );
    return () => clearTimeout(timer);
  }, [state.wrongClick]);

  const handleRegionClick = useCallback(
    (id) => dispatch({ type: "click", id }),
    []
  );
  const handleSkipQuestion = useCallback(() => dispatch({ type: "skip" }), []);
  const handleGiveUp = useCallback(() => dispatch({ type: "giveUp" }), []);
  const resetQuiz = useCallback(
    () => dispatch({ type: "restart", regionIds, random: Math.random() }),
    [regionIds]
  );

  const currentId = state.current;
  const currentRegion = useMemo(
    () => regionsData.find((region) => region.id === currentId) ?? null,
    [regionsData, currentId]
  );

  const isGameOver = state.status !== STATUS.PLAYING;
  const score = getScore(state);

  let isCorrect = null;
  if (state.pending === PENDING.CORRECT) isCorrect = true;
  else if (state.wrongClick) isCorrect = false;

  return {
    currentQuestion: currentRegion
      ? getRegionName(currentRegion, language)
      : null,
    wrongRegionId: state.wrongClick?.id ?? null,
    correctRegionIds: state.correct,
    isCorrect,
    errors: state.errors,
    skips: state.skips,
    bestStreak: state.bestStreak,
    gameComplete: isGameOver,
    gaveUp: state.status === STATUS.GAVE_UP,
    isSkippedPhase: state.isSecondPass && !isGameOver,
    canSkip: !isGameOver && (!state.isSecondPass || state.skipped.length > 1),
    remainingRegions: state.queue.length,
    skippedRegions: state.skipped.length,
    identifiedRegions: state.correct.length,
    totalRegions: state.total,
    score,
    rank: t(language, getRankKey(score)),

    handleRegionClick,
    handleSkipQuestion,
    handleGiveUp,
    resetQuiz,
  };
};
