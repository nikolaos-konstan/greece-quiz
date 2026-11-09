// src/components/QuizGame.js
"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { t } from "../config/translations";
import { useQuizLogic } from "../hooks/useQuizLogic";
import Question from "./Question";
import styles from "./QuizController.module.css";

const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false });

const QuizGame = ({ config, language, regionsData, geoJsonData, onExit }) => {
  const {
    currentQuestion,
    wrongRegionId,
    correctRegionIds,
    isCorrect,
    errors,
    skips,
    bestStreak,
    gameComplete,
    gaveUp,
    isSkippedPhase,
    canSkip,
    remainingRegions,
    skippedRegions,
    identifiedRegions,
    totalRegions,
    score,
    rank,
    handleRegionClick,
    handleSkipQuestion,
    handleGiveUp,
    resetQuiz,
  } = useQuizLogic(regionsData, language);

  // A new map per game, since the map never un-marks found regions.
  const [round, setRound] = useState(0);
  const handlePlayAgain = () => {
    resetQuiz();
    setRound((value) => value + 1);
  };

  const remaining = remainingRegions + skippedRegions;
  const progressPercent =
    totalRegions > 0 ? (identifiedRegions / totalRegions) * 100 : 0;

  return (
    <div className={styles.quizContainer}>
      <div className={styles.header}>
        <button type="button" className={styles.backButton} onClick={onExit}>
          &larr; {t(language, "settings")}
        </button>

        <h1 className={styles.quizTitle}>{config.displayName[language]}</h1>

        <div className={styles.scoreBoard}>
          {t(language, "errors")}: {errors}
          {skips > 0 && (
            <span className={styles.skipCount}>
              {" • "}
              {t(language, "skips")}: {skips}
            </span>
          )}
        </div>
      </div>

      <div
        className={styles.progressBar}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={totalRegions}
        aria-valuenow={identifiedRegions}
      >
        <div
          className={styles.progressFill}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className={styles.progressInfo}>
        {t(language, "progress", identifiedRegions, skippedRegions, remaining)}
        {isSkippedPhase && (
          <span className={styles.phaseIndicator}>
            {" • "}
            {t(language, "reviewingSkipped")}
          </span>
        )}
      </div>

      {gameComplete ? (
        <div className={styles.gameComplete}>
          <h2>{t(language, gaveUp ? "quizEnded" : "quizComplete")}</h2>
          {gaveUp && (
            <p>{t(language, "foundCount", identifiedRegions, totalRegions)}</p>
          )}
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>{t(language, "score")}</span>
              <span className={styles.statValue}>{score}/100</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>
                {t(language, "bestStreak")}
              </span>
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
            <strong className={styles.rankValue}>{rank}</strong>
          </div>
          <div className={styles.gameCompleteButtons}>
            <button
              type="button"
              className={styles.resetButton}
              onClick={handlePlayAgain}
            >
              {t(language, "playAgain")}
            </button>
            <button
              type="button"
              className={styles.settingsButton}
              onClick={onExit}
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
          onGiveUp={handleGiveUp}
          canSkip={canSkip}
          isSkippedPhase={isSkippedPhase}
        />
      )}

      <LeafletMap
        key={round}
        geoJsonData={geoJsonData}
        onRegionClick={handleRegionClick}
        wrongRegionId={wrongRegionId}
        correctRegionIds={correctRegionIds}
        language={language}
        config={config}
      />

      {/* Always rendered, so screen readers announce changes to its content. */}
      <div role="status" aria-live="polite">
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
      </div>

      <div className={styles.feedbackPlaceholder}></div>
    </div>
  );
};

export default QuizGame;
