// src/hooks/useQuizLogic.js
import { useState, useEffect, useCallback, useRef } from "react";
import { getRegionNames } from "../utils/dataHelpers";
import { TIMING, RANK_THRESHOLDS, SKIP_PENALTY } from "../config/quizConfig";
import { t } from "../config/translations";

export const useQuizLogic = (regionsData, language) => {
  const [remainingRegions, setRemainingRegions] = useState([]);
  const [skippedRegions, setSkippedRegions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [highlightedRegion, setHighlightedRegion] = useState(null);
  const [correctRegions, setCorrectRegions] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [errors, setErrors] = useState(0);
  const [skips, setSkips] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [isSkippedPhase, setIsSkippedPhase] = useState(false);
  const timerRef = useRef(null);

  // Clear any pending timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Generate a new random question
  const generateQuestion = useCallback(
    (availableRegions, skippedRegionsArray) => {
      // First try remaining regions
      if (availableRegions && availableRegions.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableRegions.length);
        setCurrentQuestion(availableRegions[randomIndex]);
        setHighlightedRegion(null);
        setIsCorrect(null);
        setIsSkippedPhase(false);
        return;
      }

      // If no remaining regions, switch to skipped phase
      if (skippedRegionsArray && skippedRegionsArray.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * skippedRegionsArray.length
        );
        setCurrentQuestion(skippedRegionsArray[randomIndex]);
        setHighlightedRegion(null);
        setIsCorrect(null);
        setIsSkippedPhase(true);
        return;
      }

      // No regions left - game complete
      setGameComplete(true);
      setCurrentQuestion(null);
    },
    []
  );

  // Initialize or reset quiz
  const initializeQuiz = useCallback(() => {
    if (!regionsData.length) return;

    const regionNames = getRegionNames(regionsData, language);
    setRemainingRegions([...regionNames]);
    setSkippedRegions([]);
    setCorrectRegions([]);
    setErrors(0);
    setSkips(0);
    setCurrentStreak(0);
    setBestStreak(0);
    setGameComplete(false);
    setIsSkippedPhase(false);
    setHighlightedRegion(null);
    setIsCorrect(null);

    // Generate first question
    generateQuestion(regionNames, []);
  }, [regionsData, language, generateQuestion]);

  // Handle skipping the current question
  const handleSkipQuestion = useCallback(() => {
    if (!currentQuestion) return;

    if (!isSkippedPhase) {
      // Move from remaining to skipped
      setSkippedRegions((prev) => [...prev, currentQuestion]);
      const updatedRemainingRegions = remainingRegions.filter(
        (region) => region !== currentQuestion
      );
      setRemainingRegions(updatedRemainingRegions);
      setSkips((prevSkips) => prevSkips + 1);

      // Generate next question
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        generateQuestion(updatedRemainingRegions, skippedRegions);
      }, TIMING.SKIP_DELAY);
    } else {
      // In skipped phase - just move to next skipped region
      const currentSkippedRegions = skippedRegions.filter(
        (region) => region !== currentQuestion
      );

      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        generateQuestion([], currentSkippedRegions);
      }, TIMING.SKIP_DELAY);
    }
  }, [
    currentQuestion,
    remainingRegions,
    skippedRegions,
    isSkippedPhase,
    generateQuestion,
  ]);
  const handleRegionClick = useCallback(
    (regionName) => {
      setHighlightedRegion(regionName);

      const correct = regionName === currentQuestion;
      setIsCorrect(correct);

      if (correct) {
        setCurrentStreak((prev) => {
          const next = prev + 1;
          setBestStreak((best) => Math.max(best, next));
          return next;
        });

        // Add to correct regions list
        setCorrectRegions((prev) => [...prev, regionName]);

        // Remove from remaining regions
        const updatedRemainingRegions = remainingRegions.filter(
          (region) => region !== regionName
        );
        setRemainingRegions(updatedRemainingRegions);

        // Check if game is complete
        if (updatedRemainingRegions.length === 0) {
          setGameComplete(true);
          setCurrentQuestion(null);
        } else {
          // Generate new question after brief delay
          clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
            generateQuestion(updatedRemainingRegions);
          }, TIMING.CORRECT_DELAY);
        }
      } else {
        setCurrentStreak(0);
        setErrors((prevErrors) => prevErrors + 1);

        // Clear feedback after delay, but keep asking for same region
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setHighlightedRegion(null);
          setIsCorrect(null);
        }, TIMING.INCORRECT_FEEDBACK);
      }
    },
    [currentQuestion, remainingRegions, generateQuestion]
  );

  const getScore = useCallback(() => {
    if (!regionsData.length) return 0;
    return Math.max(
      0,
      Math.round(100 - ((errors + skips * SKIP_PENALTY) / regionsData.length) * 100)
    );
  }, [regionsData.length, errors, skips]);

  const getUserRank = useCallback(() => {
    if (!regionsData.length) return "";
    const score = getScore();
    if (score >= RANK_THRESHOLDS.S) return t(language, "rankS");
    if (score >= RANK_THRESHOLDS.A) return t(language, "rankA");
    if (score >= RANK_THRESHOLDS.B) return t(language, "rankB");
    if (score >= RANK_THRESHOLDS.C) return t(language, "rankC");
    if (score >= RANK_THRESHOLDS.D) return t(language, "rankD");
    if (score >= RANK_THRESHOLDS.E) return t(language, "rankE");
    return t(language, "rankF");
  }, [getScore, regionsData.length, language]);

  // Initialize quiz when data or language changes
  useEffect(() => {
    initializeQuiz();
  }, [initializeQuiz]);

  return {
    // Current state
    currentQuestion,
    highlightedRegion,
    correctRegions,
    isCorrect,
    errors,
    skips,
    gameComplete,
    isSkippedPhase,
    remainingRegions: remainingRegions.length,
    skippedRegions: skippedRegions.length,
    totalRegions: regionsData.length,

    // Actions
    handleRegionClick,
    handleSkipQuestion,
    resetQuiz: initializeQuiz,
    getScore,
    getUserRank,
    bestStreak,
  };
};
