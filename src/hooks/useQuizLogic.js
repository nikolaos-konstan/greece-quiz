// src/hooks/useQuizLogic.js
import { useState, useEffect, useCallback } from "react";
import { getRegionNames } from "../utils/dataHelpers";

export const useQuizLogic = (regionsData, language) => {
  const [remainingRegions, setRemainingRegions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [highlightedRegion, setHighlightedRegion] = useState(null);
  const [correctRegions, setCorrectRegions] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [errors, setErrors] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  // Initialize or reset quiz
  const initializeQuiz = useCallback(() => {
    if (!regionsData.length) return;

    const regionNames = getRegionNames(regionsData, language);
    setRemainingRegions([...regionNames]);
    setCorrectRegions([]);
    setErrors(0);
    setGameComplete(false);
    setHighlightedRegion(null);
    setIsCorrect(null);

    // Generate first question
    generateQuestion(regionNames);
  }, [regionsData, language]);

  // Generate a new random question
  const generateQuestion = useCallback((availableRegions) => {
    if (!availableRegions || availableRegions.length === 0) {
      setGameComplete(true);
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableRegions.length);
    setCurrentQuestion(availableRegions[randomIndex]);
    setHighlightedRegion(null);
    setIsCorrect(null);
  }, []);

  // Handle region click from map
  const handleRegionClick = useCallback(
    (regionName) => {
      setHighlightedRegion(regionName);

      const correct = regionName === currentQuestion;
      setIsCorrect(correct);

      if (correct) {
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
          setTimeout(() => {
            generateQuestion(updatedRemainingRegions);
          }, 1000);
        }
      } else {
        // Incorrect answer - increment error count
        setErrors((prevErrors) => prevErrors + 1);

        // Clear feedback after delay, but keep asking for same region
        setTimeout(() => {
          setHighlightedRegion(null);
          setIsCorrect(null);
        }, 1500);
      }
    },
    [currentQuestion, remainingRegions, generateQuestion]
  );

  // Calculate user rank based on performance
  const getUserRank = useCallback(() => {
    if (!regionsData.length) return "";

    const totalRegions = regionsData.length;
    const errorRate = errors / totalRegions;

    const ranks = {
      en: {
        perfect: "Geography Master",
        excellent: "Geography Expert",
        good: "Geography Enthusiast",
        fair: "Geography Student",
        beginner: "Geography Novice",
      },
      el: {
        perfect: "Γεωγραφικός Δάσκαλος",
        excellent: "Ειδικός Γεωγραφίας",
        good: "Λάτρης Γεωγραφίας",
        fair: "Μαθητής Γεωγραφίας",
        beginner: "Αρχάριος Γεωγραφίας",
      },
    };

    const langRanks = ranks[language] || ranks.en;

    if (errorRate === 0) return langRanks.perfect;
    if (errorRate < 0.1) return langRanks.excellent;
    if (errorRate < 0.25) return langRanks.good;
    if (errorRate < 0.5) return langRanks.fair;
    return langRanks.beginner;
  }, [regionsData.length, errors, language]);

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
    gameComplete,
    remainingRegions: remainingRegions.length,
    totalRegions: regionsData.length,

    // Actions
    handleRegionClick,
    resetQuiz: initializeQuiz,
    getUserRank,
  };
};
