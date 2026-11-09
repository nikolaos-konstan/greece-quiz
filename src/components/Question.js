// src/components/Question.js
import { t } from "../config/translations";
import styles from "./Question.module.css";

const Question = ({
  regionName,
  language = "en",
  onSkip,
  onGiveUp,
  canSkip = true,
  isSkippedPhase = false,
}) => {
  return (
    <div className={styles.questionContainer}>
      <div className={styles.questionHeader}>
        <h2>{t(language, "findRegion")}</h2>
        <div className={styles.questionActions}>
          {isSkippedPhase && (
            <button
              type="button"
              className={styles.skipButton}
              onClick={onGiveUp}
            >
              {t(language, "giveUp")}
            </button>
          )}
          <button
            type="button"
            className={styles.skipButton}
            onClick={onSkip}
            disabled={!canSkip}
            title={t(language, "skipQuestion")}
          >
            {t(language, "next")}
          </button>
        </div>
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
