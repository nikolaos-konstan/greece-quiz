// src/components/QuizSettings.js
import { QUIZ_CONFIGS } from "../config/quizConfig";
import { t } from "../config/translations";
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
      <h1 className={styles.title}>{t(selectedLanguage, "appTitle")}</h1>

      <div className={styles.settingsCard}>
        <h2 className={styles.cardTitle}>
          {t(selectedLanguage, "quizSettings")}
        </h2>

        {/* Quiz Type Selection */}
        <fieldset className={styles.settingGroup}>
          <legend className={styles.label}>
            {t(selectedLanguage, "quizType")}
          </legend>
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
                <span className={styles.description}>
                  {config.description[selectedLanguage]}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Language Selection */}
        <fieldset className={styles.settingGroup}>
          <legend className={styles.label}>
            {t(selectedLanguage, "language")}
          </legend>
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
        </fieldset>

        {/* Start Quiz Button */}
        <button
          className={styles.startButton}
          onClick={onStartQuiz}
          disabled={isLoading}
        >
          {isLoading
            ? t(selectedLanguage, "loading")
            : t(selectedLanguage, "startQuiz")}
        </button>
      </div>
    </div>
  );
};

export default QuizSettings;
