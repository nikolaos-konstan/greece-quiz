// src/components/Question.js
import styles from "./Question.module.css";

const Question = ({ regionName }) => {
  return (
    <div className={styles.questionContainer}>
      <h2>Find this region on the map:</h2>
      <p className={styles.regionName}>{regionName}</p>
    </div>
  );
};

export default Question;
