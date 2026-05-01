// src/components/Question.js
import { t } from "../config/translations";
import styles from "./Question.module.css";

const Question = ({
  regionName,
  language = "en",
  onSkip,
  isSkippedPhase = false,
}) => {
  return (
    <div className={styles.questionContainer}>
      <div className={styles.questionHeader}>
        <h2>{t(language, "findRegion")}</h2>
        <button
          className={styles.skipButton}
          onClick={onSkip}
          title={t(language, "skipQuestion")}
        >
          {t(language, "next")}
        </button>
      </div>

      <p className={styles.regionName}>
        {regionName}
        {isSkippedPhase && (
          <span className={styles.skippedBadge}>
            {t(language, "previouslySkipped")}
          </span>
        )}
      </p>
    </div>
  );
};

export default Question;
