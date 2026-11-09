// src/components/QuizController.js
"use client";
import { useEffect, useState } from "react";
import {
  QUIZ_CONFIGS,
  DEFAULT_QUIZ_TYPE,
  DEFAULT_LANGUAGE,
} from "../config/quizConfig";
import { t } from "../config/translations";
import { useQuizData } from "../hooks/useQuizData";
import QuizGame from "./QuizGame";
import QuizSettings from "./QuizSettings";
import styles from "./QuizController.module.css";

// Mounted for each started quiz, so every session begins with fresh state.
const QuizSession = ({ config, language, onExit }) => {
  const { regionsData, geoJsonData, loading, errorKey } = useQuizData(config);

  if (errorKey) {
    return (
      <div className={styles.errorContainer} role="alert">
        <h2 className={styles.errorTitle}>{t(language, "errorLoading")}</h2>
        <p className={styles.errorMessage}>{t(language, errorKey)}</p>
        <button type="button" className={styles.backButton} onClick={onExit}>
          {t(language, "backToSettings")}
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer} role="status">
        <div className={styles.loadingText}>{t(language, "loadingData")}</div>
      </div>
    );
  }

  return (
    <QuizGame
      config={config}
      language={language}
      regionsData={regionsData}
      geoJsonData={geoJsonData}
      onExit={onExit}
    />
  );
};

const QuizController = () => {
  const [quizType, setQuizType] = useState(DEFAULT_QUIZ_TYPE);
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [quizStarted, setQuizStarted] = useState(false);

  // Keeps screen readers on the right pronunciation.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  if (!quizStarted) {
    return (
      <QuizSettings
        selectedQuizType={quizType}
        selectedLanguage={language}
        onQuizTypeChange={setQuizType}
        onLanguageChange={setLanguage}
        onStartQuiz={() => setQuizStarted(true)}
      />
    );
  }

  return (
    <QuizSession
      config={QUIZ_CONFIGS[quizType]}
      language={language}
      onExit={() => setQuizStarted(false)}
    />
  );
};

export default QuizController;
