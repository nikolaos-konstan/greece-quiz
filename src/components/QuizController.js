// src/components/QuizController.js
"use client";
import { useState, useEffect } from "react";
import LeafletMap from "./LeafletMap";
import Question from "./Question";
import styles from "./QuizController.module.css";

const QuizController = () => {
  const [regions, setRegions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [highlightedRegion, setHighlightedRegion] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [errors, setErrors] = useState(0);

  // Load regions data
  useEffect(() => {
    const loadRegions = async () => {
      try {
        const response = await fetch("/data/gadm41_GRC_1.json");
        const data = await response.json();

        // Extract region names
        const regionNames = [
          ...new Set(data.features.map((feature) => feature.properties.NAME_1)),
        ];

        setRegions(regionNames);
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

    if (!correct) {
      setErrors((prevErrors) => prevErrors + 1);
    }

    // Show feedback before moving to next question
    setTimeout(() => {
      generateQuestion(regions);
    }, 1500);
  };

  if (!currentQuestion) {
    return <div>Loading quiz...</div>;
  }

  return (
    <div className={styles.quizContainer}>
      <div className={styles.scoreBoard}>Errors: {errors}</div>

      <Question regionName={currentQuestion} />

      <LeafletMap
        onRegionClick={handleRegionClick}
        highlightedRegion={highlightedRegion}
        correctRegion={currentQuestion}
      />

      {isCorrect !== null && (
        <div
          className={`${styles.feedback} ${
            isCorrect ? styles.correct : styles.incorrect
          }`}
        >
          {isCorrect ? "Correct!" : `Incorrect! That was ${highlightedRegion}`}
        </div>
      )}
    </div>
  );
};

export default QuizController;
