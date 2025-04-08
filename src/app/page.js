// src/app/page.js
import QuizController from "../components/QuizController";

export default function Home() {
  return (
    <main>
      <h1 style={{ textAlign: "center", margin: "20px 0" }}>
        Greece Geography Quiz
      </h1>
      <QuizController />
    </main>
  );
}
