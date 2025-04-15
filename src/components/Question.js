// src/components/Question.js
import styles from "./Question.module.css";

const Question = ({ regionName, language = "en" }) => {
  return (
    <div className={styles.questionContainer}>
      <h2>
        {language === "en"
          ? "Find this region on the map:"
          : "Βρείτε αυτήν την περιοχή στον χάρτη:"}
      </h2>
      <p className={styles.regionName}>{regionName}</p>
    </div>
  );
};

export default Question;
