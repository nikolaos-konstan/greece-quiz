// src/components/QuizController.js
"use client";
import { useState, useEffect } from "react";
import LeafletMap from "./LeafletMap";
import Question from "./Question";
import styles from "./QuizController.module.css";

const QuizController = () => {
  const [regions, setRegions] = useState([]);
  const [remainingRegions, setRemainingRegions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [highlightedRegion, setHighlightedRegion] = useState(null);
  const [correctRegions, setCorrectRegions] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [errors, setErrors] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  // Load regions data
  useEffect(() => {
    const loadRegions = async () => {
      try {
        const response = await fetch("/data/nomoi_okxe.geojson");
        const data = await response.json();

        // Extract region names using the English name from your new file
        const regionNames = data.features.map(
          (feature) => feature.properties.NAME_ENG
        );

        setRegions(regionNames);
        setRemainingRegions([...regionNames]);
        generateQuestion(regionNames);
      } catch (error) {
        console.error("Error loading regions:", error);
      }
    };

    loadRegions();
  }, []);

  // Generate a new question
  const generateQuestion = (availableRegions) => {
    if (!availableRegions || availableRegions.length === 0) return;

    const randomIndex = Math.floor(Math.random() * availableRegions.length);
    setCurrentQuestion(availableRegions[randomIndex]);
    setHighlightedRegion(null);
    setIsCorrect(null);
  };

  // Handle region click
  const handleRegionClick = (regionName) => {
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
  };

  // Get user's rank based on errors
  const getUserRank = () => {
    const totalRegions = regions.length;
    const errorRate = errors / totalRegions;

    if (errorRate === 0) return "Geography Master";
    if (errorRate < 0.1) return "Geography Expert";
    if (errorRate < 0.25) return "Geography Enthusiast";
    if (errorRate < 0.5) return "Geography Student";
    return "Geography Novice";
  };

  // Reset the game
  const handleReset = () => {
    setRemainingRegions([...regions]);
    setCorrectRegions([]);
    setErrors(0);
    setGameComplete(false);
    generateQuestion([...regions]);
  };

  if (!currentQuestion && !gameComplete) {
    return <div>Loading quiz...</div>;
  }

  return (
    <div className={styles.quizContainer}>
      <div className={styles.scoreBoard}>Errors: {errors}</div>

      {gameComplete ? (
        <div className={styles.gameComplete}>
          <h2>Quiz Complete!</h2>
          <p>
            You identified all {regions.length} regions with {errors} errors.
          </p>
          <p>
            Your rank: <strong>{getUserRank()}</strong>
          </p>
          <button className={styles.resetButton} onClick={handleReset}>
            Play Again
          </button>
        </div>
      ) : (
        <Question regionName={currentQuestion} />
      )}

      <LeafletMap
        onRegionClick={handleRegionClick}
        highlightedRegion={highlightedRegion}
        correctRegion={currentQuestion}
        correctRegions={correctRegions}
      />

      {isCorrect !== null && (
        <div
          className={`${styles.feedback} ${
            isCorrect ? styles.correct : styles.incorrect
          }`}
        >
          {isCorrect
            ? "Correct!"
            : `Incorrect! Try again to find ${currentQuestion}`}
        </div>
      )}
    </div>
  );
};

export default QuizController;
