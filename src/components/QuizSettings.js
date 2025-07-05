// src/components/QuizSettings.js
import { QUIZ_CONFIGS } from "../config/quizConfig";
import styles from "./QuizSettings.module.css";

const QuizSettings = ({
  selectedQuizType,
  selectedLanguage,
  onQuizTypeChange,
  onLanguageChange,
  onStartQuiz,
  isLoading,
}) => {
  const quizOptions = Object.values(QUIZ_CONFIGS);

  return (
    <div className={styles.settingsContainer}>
      <h1 className={styles.title}>
        {selectedLanguage === "en"
          ? "Greece Geography Quiz"
          : "Κουίζ Γεωγραφίας Ελλάδας"}
      </h1>

      <div className={styles.settingsCard}>
        <h2 className={styles.cardTitle}>
          {selectedLanguage === "en" ? "Quiz Settings" : "Ρυθμίσεις Κουίζ"}
        </h2>

        {/* Quiz Type Selection */}
        <div className={styles.settingGroup}>
          <label className={styles.label}>
            {selectedLanguage === "en" ? "Quiz Type:" : "Τύπος Κουίζ:"}
          </label>
          <div className={styles.radioGroup}>
            {quizOptions.map((config) => (
              <label key={config.id} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="quizType"
                  value={config.id}
                  checked={selectedQuizType === config.id}
                  onChange={(e) => onQuizTypeChange(e.target.value)}
                  className={styles.radioInput}
                />
                <span className={styles.radioText}>
                  {config.displayName[selectedLanguage]}
                </span>
                <p className={styles.description}>
                  {config.description[selectedLanguage]}
                </p>
              </label>
            ))}
          </div>
        </div>

        {/* Language Selection */}
        <div className={styles.settingGroup}>
          <label className={styles.label}>
            {selectedLanguage === "en" ? "Language:" : "Γλώσσα:"}
          </label>
          <div className={styles.languageToggle}>
            <button
              className={`${styles.languageButton} ${
                selectedLanguage === "en" ? styles.active : ""
              }`}
              onClick={() => onLanguageChange("en")}
            >
              English
            </button>
            <button
              className={`${styles.languageButton} ${
                selectedLanguage === "el" ? styles.active : ""
              }`}
              onClick={() => onLanguageChange("el")}
            >
              Ελληνικά
            </button>
          </div>
        </div>

        {/* Start Quiz Button */}
        <button
          className={styles.startButton}
          onClick={onStartQuiz}
          disabled={isLoading}
        >
          {isLoading
            ? selectedLanguage === "en"
              ? "Loading..."
              : "Φόρτωση..."
            : selectedLanguage === "en"
            ? "Start Quiz"
            : "Έναρξη Κουίζ"}
        </button>
      </div>
    </div>
  );
};

export default QuizSettings;
