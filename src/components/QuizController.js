// src/components/QuizController.js
"use client";
import { useState } from "react";
import {
  QUIZ_CONFIGS,
  DEFAULT_QUIZ_TYPE,
  DEFAULT_LANGUAGE,
} from "../config/quizConfig";
import { useQuizData } from "../hooks/useQuizData";
import { useQuizLogic } from "../hooks/useQuizLogic";
import QuizSettings from "./QuizSettings";
import LeafletMap from "./LeafletMap";
import Question from "./Question";
import styles from "./QuizController.module.css";

const QuizController = () => {
  // Settings state
  const [quizType, setQuizType] = useState(DEFAULT_QUIZ_TYPE);
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [quizStarted, setQuizStarted] = useState(false);

  // Get current quiz configuration
  const currentConfig = QUIZ_CONFIGS[quizType];

  // Data loading hook
  const { regionsData, geoJsonData, loading, error, hasData } = useQuizData(
    quizStarted ? currentConfig : null
  );

  // Game logic hook
  const {
    currentQuestion,
    highlightedRegion,
    correctRegions,
    isCorrect,
    errors,
    gameComplete,
    remainingRegions,
    totalRegions,
    handleRegionClick,
    resetQuiz,
    getUserRank,
  } = useQuizLogic(regionsData, language);

  // Handle quiz type change
  const handleQuizTypeChange = (newQuizType) => {
    setQuizType(newQuizType);
    if (quizStarted) {
      setQuizStarted(false); // Return to settings if quiz was active
    }
  };

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    if (quizStarted) {
      setQuizStarted(false); // Return to settings if quiz was active
    }
  };

  // Start the quiz
  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  // Return to settings
  const handleBackToSettings = () => {
    setQuizStarted(false);
  };

  // Handle quiz reset
  const handleResetQuiz = () => {
    resetQuiz();
  };

  // Show settings screen
  if (!quizStarted) {
    return (
      <QuizSettings
        selectedQuizType={quizType}
        selectedLanguage={language}
        onQuizTypeChange={handleQuizTypeChange}
        onLanguageChange={handleLanguageChange}
        onStartQuiz={handleStartQuiz}
        isLoading={false}
      />
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>
          {language === "en" ? "Loading quiz data..." : "Φόρτωση δεδομένων..."}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2 className={styles.errorTitle}>
          {language === "en" ? "Error Loading Quiz" : "Σφάλμα Φόρτωσης"}
        </h2>
        <p className={styles.errorMessage}>{error}</p>
        <button className={styles.backButton} onClick={handleBackToSettings}>
          {language === "en" ? "Back to Settings" : "Επιστροφή στις Ρυθμίσεις"}
        </button>
      </div>
    );
  }

  // Show quiz interface
  return (
    <div className={styles.quizContainer}>
      {/* Header Controls */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleBackToSettings}>
          ← {language === "en" ? "Settings" : "Ρυθμίσεις"}
        </button>

        <h1 className={styles.quizTitle}>
          {currentConfig.displayName[language]}
        </h1>

        <div className={styles.scoreBoard}>
          {language === "en" ? "Errors" : "Λάθη"}: {errors}
        </div>
      </div>

      {/* Quiz Progress */}
      <div className={styles.progressInfo}>
        {language === "en"
          ? `${
              totalRegions - remainingRegions
            } / ${totalRegions} regions identified`
          : `${
              totalRegions - remainingRegions
            } / ${totalRegions} περιοχές αναγνωρίστηκαν`}
      </div>

      {/* Game Complete Screen */}
      {gameComplete ? (
        <div className={styles.gameComplete}>
          <h2>
            {language === "en" ? "Quiz Complete!" : "Το Κουίζ Ολοκληρώθηκε!"}
          </h2>
          <p>
            {language === "en"
              ? `You identified all ${totalRegions} regions with ${errors} errors.`
              : `Αναγνωρίσατε και τις ${totalRegions} περιοχές με ${errors} λάθη.`}
          </p>
          <p>
            {language === "en" ? "Your rank: " : "Η κατάταξή σας: "}
            <strong>{getUserRank()}</strong>
          </p>
          <div className={styles.gameCompleteButtons}>
            <button className={styles.resetButton} onClick={handleResetQuiz}>
              {language === "en" ? "Play Again" : "Παίξτε Ξανά"}
            </button>
            <button
              className={styles.settingsButton}
              onClick={handleBackToSettings}
            >
              {language === "en" ? "Change Quiz Type" : "Αλλαγή Τύπου Κουίζ"}
            </button>
          </div>
        </div>
      ) : (
        <Question regionName={currentQuestion} language={language} />
      )}

      {/* Map Component */}
      {hasData && geoJsonData && (
        <LeafletMap
          geoJsonData={geoJsonData}
          onRegionClick={handleRegionClick}
          highlightedRegion={highlightedRegion}
          correctRegion={currentQuestion}
          correctRegions={correctRegions}
          language={language}
          config={currentConfig}
        />
      )}

      {/* Feedback Display */}
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

      {/* Feedback Placeholder */}
      <div className={styles.feedbackPlaceholder}></div>
    </div>
  );
};

export default QuizController;
