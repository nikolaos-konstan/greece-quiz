// src/components/QuizController.js
"use client";
import { useState, useEffect } from "react";
import LeafletMap from "./LeafletMap";
import Question from "./Question";
import styles from "./QuizController.module.css";

const QuizController = () => {
  const [regions, setRegions] = useState([]);
  const [regionsData, setRegionsData] = useState([]); // Store full region data
  const [remainingRegions, setRemainingRegions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [highlightedRegion, setHighlightedRegion] = useState(null);
  const [correctRegions, setCorrectRegions] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [errors, setErrors] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [language, setLanguage] = useState("en"); // 'en' for English, 'el' for Greek

  // Load regions data
  useEffect(() => {
    const loadRegions = async () => {
      try {
        const response = await fetch("/data/nomoi_okxe.geojson");
        const data = await response.json();

        // Store full feature data for language switching
        const featuresData = data.features.map((feature) => ({
          nameGr: feature.properties.NAME_GR,
          nameEng: feature.properties.NAME_ENG,
          id: feature.properties.ESYE_ID,
        }));
        setRegionsData(featuresData);

        // Extract region names based on current language
        const regionNames = featuresData.map((feature) =>
          language === "en" ? feature.nameEng : feature.nameGr
        );

        setRegions(regionNames);
        setRemainingRegions([...regionNames]);
        generateQuestion(regionNames);
      } catch (error) {
        console.error("Error loading regions:", error);
      }
    };

    loadRegions();
  }, [language]); // Re-fetch when language changes

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

  // Handle language change
  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "el" : "en";
    setLanguage(newLanguage);

    // Reset the game when changing language
    setCorrectRegions([]);
    setErrors(0);
    setGameComplete(false);
    setIsCorrect(null);
    setHighlightedRegion(null);
  };

  // Get user's rank based on errors
  const getUserRank = () => {
    const totalRegions = regions.length;
    const errorRate = errors / totalRegions;

    if (errorRate === 0)
      return language === "en" ? "Geography Master" : "Γεωγραφικός Δάσκαλος";
    if (errorRate < 0.1)
      return language === "en" ? "Geography Expert" : "Ειδικός Γεωγραφίας";
    if (errorRate < 0.25)
      return language === "en" ? "Geography Enthusiast" : "Λάτρης Γεωγραφίας";
    if (errorRate < 0.5)
      return language === "en" ? "Geography Student" : "Μαθητής Γεωγραφίας";
    return language === "en" ? "Geography Novice" : "Αρχάριος Γεωγραφίας";
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
      <div className={styles.controls}>
        <button
          onClick={toggleLanguage}
          className={styles.languageToggle}
          title={language === "en" ? "Switch to Greek" : "Switch to English"}
        >
          {language === "en" ? "ΕΛ" : "ENG"}
        </button>
        <div className={styles.scoreBoard}>Errors: {errors}</div>
      </div>

      {gameComplete ? (
        <div className={styles.gameComplete}>
          <h2>
            {language === "en" ? "Quiz Complete!" : "Το Κουίζ Ολοκληρώθηκε!"}
          </h2>
          <p>
            {language === "en"
              ? `You identified all ${regions.length} regions with ${errors} errors.`
              : `Αναγνωρίσατε και τις ${regions.length} περιοχές με ${errors} λάθη.`}
          </p>
          <p>
            {language === "en" ? "Your rank: " : "Η κατάταξή σας: "}
            <strong>{getUserRank()}</strong>
          </p>
          <button className={styles.resetButton} onClick={handleReset}>
            {language === "en" ? "Play Again" : "Παίξτε Ξανά"}
          </button>
        </div>
      ) : (
        <Question regionName={currentQuestion} language={language} />
      )}

      <LeafletMap
        onRegionClick={handleRegionClick}
        highlightedRegion={highlightedRegion}
        correctRegion={currentQuestion}
        correctRegions={correctRegions}
        language={language}
      />

      {/* Fixed-position feedback that doesn't affect layout */}
      {isCorrect !== null && (
        <div
          className={`${styles.feedback} ${
            isCorrect ? styles.correct : styles.incorrect
          }`}
        >
          {isCorrect
            ? language === "en"
              ? "Correct!"
              : "Σωστά!"
            : language === "en"
            ? `Incorrect! Try again to find ${currentQuestion}`
            : `Λάθος! Προσπαθήστε ξανά να βρείτε ${currentQuestion}`}
        </div>
      )}

      {/* Placeholder to maintain consistent layout */}
      <div className={styles.feedbackPlaceholder}></div>
    </div>
  );
};

export default QuizController;
