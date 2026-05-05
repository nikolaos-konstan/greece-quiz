// src/components/QuizController.js
"use client";
import { useState } from "react";
import {
  QUIZ_CONFIGS,
  DEFAULT_QUIZ_TYPE,
  DEFAULT_LANGUAGE,
} from "../config/quizConfig";
import { t } from "../config/translations";
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

  // Get current quiz configuration (may be undefined for invalid quizType)
  const currentConfig = QUIZ_CONFIGS[quizType] ?? null;

  // Data loading hook — passes null when config is invalid or quiz not started
  const { regionsData, geoJsonData, loading, error, hasData } = useQuizData(
    quizStarted && currentConfig ? currentConfig : null
  );

  // Game logic hook
  const {
    currentQuestion,
    highlightedRegion,
    correctRegions,
    isCorrect,
    errors,
    skips,
    gameComplete,
    isSkippedPhase,
    remainingRegions,
    skippedRegions,
    totalRegions,
    handleRegionClick,
    handleSkipQuestion,
    resetQuiz,
    getScore,
    getUserRank,
    bestStreak,
  } = useQuizLogic(regionsData, language);

  // Handle quiz type change
  const handleQuizTypeChange = (newQuizType) => {
    setQuizType(newQuizType);
    if (quizStarted) {
      setQuizStarted(false);
    }
  };

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    if (quizStarted) {
      setQuizStarted(false);
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

  // Guard against invalid quiz type (after all hooks)
  if (!currentConfig) {
    return (
      <div className={styles.errorContainer}>
        <h2 className={styles.errorTitle}>{t(language, "invalidQuizType")}</h2>
        <button
          className={styles.backButton}
          onClick={() => setQuizType(DEFAULT_QUIZ_TYPE)}
        >
          {t(language, "reset")}
        </button>
      </div>
    );
  }

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
        <div className={styles.loadingText}>{t(language, "loadingData")}</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2 className={styles.errorTitle}>{t(language, "errorLoading")}</h2>
        <p className={styles.errorMessage}>{error}</p>
        <button className={styles.backButton} onClick={handleBackToSettings}>
          {t(language, "backToSettings")}
        </button>
      </div>
    );
  }

  const identified = totalRegions - remainingRegions - skippedRegions;
  const remaining = remainingRegions + skippedRegions;

  // Show quiz interface
  return (
    <div className={styles.quizContainer}>
      {/* Header Controls */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleBackToSettings}>
          &larr; {t(language, "settings")}
        </button>

        <h1 className={styles.quizTitle}>
          {currentConfig.displayName[language]}
        </h1>

        <div className={styles.scoreBoard}>
          {t(language, "errors")}: {errors}
          {skips > 0 && (
            <span className={styles.skipCount}>
              {" \u2022 "}
              {t(language, "skips")}: {skips}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{
            width: `${totalRegions > 0 ? (identified / totalRegions) * 100 : 0}%`,
          }}
        />
      </div>

      {/* Quiz Progress */}
      <div className={styles.progressInfo}>
        {t(language, "progress", identified, skippedRegions, remaining)}
        {isSkippedPhase && (
          <span className={styles.phaseIndicator}>
            {" \u2022 "}
            {t(language, "reviewingSkipped")}
          </span>
        )}
      </div>

      {/* Game Complete Screen */}
      {gameComplete ? (
        <div className={styles.gameComplete}>
          <h2>{t(language, "quizComplete")}</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>{t(language, "score")}</span>
              <span className={styles.statValue}>{getScore()}/100</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>{t(language, "bestStreak")}</span>
              <span className={styles.statValue}>{bestStreak}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>{t(language, "errors")}</span>
              <span className={styles.statValue}>{errors}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>{t(language, "skips")}</span>
              <span className={styles.statValue}>{skips}</span>
            </div>
          </div>
          <div className={styles.rankDisplay}>
            <span className={styles.rankLabel}>{t(language, "yourRank")}</span>
            <strong className={styles.rankValue}>{getUserRank()}</strong>
          </div>
          <div className={styles.gameCompleteButtons}>
            <button className={styles.resetButton} onClick={handleResetQuiz}>
              {t(language, "playAgain")}
            </button>
            <button
              className={styles.settingsButton}
              onClick={handleBackToSettings}
            >
              {t(language, "changeQuizType")}
            </button>
          </div>
        </div>
      ) : (
        <Question
          regionName={currentQuestion}
          language={language}
          onSkip={handleSkipQuestion}
          isSkippedPhase={isSkippedPhase}
        />
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
            ? t(language, "correct")
            : t(language, "incorrect", currentQuestion)}
        </div>
      )}

      {/* Feedback Placeholder */}
      <div className={styles.feedbackPlaceholder}></div>
    </div>
  );
};

export default QuizController;
