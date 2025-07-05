// src/components/Question.js
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
        <h2>
          {language === "en"
            ? "Find this region on the map:"
            : "Βρείτε αυτήν την περιοχή στον χάρτη:"}
        </h2>
        <button
          className={styles.skipButton}
          onClick={onSkip}
          title={
            language === "en" ? "Skip this question" : "Παράλειψη ερώτησης"
          }
        >
          {language === "en" ? "Next" : "Επόμενο"}
        </button>
      </div>

      <p className={styles.regionName}>
        {regionName}
        {isSkippedPhase && (
          <span className={styles.skippedBadge}>
            {language === "en"
              ? "(Previously skipped)"
              : "(Προηγουμένως παραλείφθηκε)"}
          </span>
        )}
      </p>
    </div>
  );
};

export default Question;
