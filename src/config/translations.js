// src/config/translations.js

const translations = {
  en: {
    // App
    appTitle: "Greece Geography Quiz",
    appSubtitle: "Test your knowledge of Greek geography",

    // Settings
    quizSettings: "Quiz Settings",
    quizType: "Quiz Type:",
    language: "Language:",
    startQuiz: "Start Quiz",
    loading: "Loading...",

    // Quiz
    loadingData: "Loading quiz data...",
    errorLoading: "Error Loading Quiz",
    backToSettings: "Back to Settings",
    settings: "Settings",
    errors: "Errors",
    skips: "Skips",
    reviewingSkipped: "Reviewing skipped regions",

    // Question
    findRegion: "Find this region on the map:",
    next: "Next",
    skipQuestion: "Skip this question",
    previouslySkipped: "(Previously skipped)",

    // Feedback
    correct: "Correct!",
    incorrect: (name) => `Incorrect! Try again to find ${name}`,

    // Progress
    progress: (identified, skipped, remaining) =>
      `${identified} identified, ${skipped} skipped, ${remaining} remaining`,

    // Game complete
    quizComplete: "Quiz Complete!",
    identifiedAll: (total, errorCount) =>
      `You identified all ${total} regions with ${errorCount} errors.`,
    yourRank: "Your rank: ",
    playAgain: "Play Again",
    changeQuizType: "Change Quiz Type",

    // Stats
    score: "Score",
    bestStreak: "Best Streak",

    // Ranks
    rankS: "Chosen of Poseidon",
    rankA: "Alexandrian Cartographer",
    rankB: "Argonaut",
    rankC: "Athenian Scholar",
    rankD: "Ionian Trader",
    rankE: "Rural Wanderer",
    rankF: "Lost Wayfarer",

    // Errors
    invalidQuizType: "Invalid quiz type",
    reset: "Reset",
    fetchTimeout:
      "Data loading timed out. Please check your connection and try again.",
  },
  el: {
    appTitle: "Κουίζ Γεωγραφίας Ελλάδας",
    appSubtitle: "Δοκιμάστε τις γνώσεις σας για τη γεωγραφία της Ελλάδας",

    quizSettings: "Ρυθμίσεις Κουίζ",
    quizType: "Τύπος Κουίζ:",
    language: "Γλώσσα:",
    startQuiz: "Έναρξη Κουίζ",
    loading: "Φόρτωση...",

    loadingData: "Φόρτωση δεδομένων...",
    errorLoading: "Σφάλμα Φόρτωσης",
    backToSettings: "Επιστροφή στις Ρυθμίσεις",
    settings: "Ρυθμίσεις",
    errors: "Λάθη",
    skips: "Παραλείψεις",
    reviewingSkipped: "Επανεξέταση παραλειφθέντων περιοχών",

    findRegion: "Βρείτε αυτήν την περιοχή στον χάρτη:",
    next: "Επόμενο",
    skipQuestion: "Παράλειψη ερώτησης",
    previouslySkipped: "(Προηγουμένως παραλείφθηκε)",

    correct: "Σωστά!",
    incorrect: (name) => `Λάθος! Προσπαθήστε ξανά να βρείτε ${name}`,

    progress: (identified, skipped, remaining) =>
      `${identified} αναγνωρίστηκαν, ${skipped} παραλείφθηκαν, ${remaining} απομένουν`,

    quizComplete: "Το Κουίζ Ολοκληρώθηκε!",
    identifiedAll: (total, errorCount) =>
      `Αναγνωρίσατε και τις ${total} περιοχές με ${errorCount} λάθη.`,
    yourRank: "Η κατάταξή σας: ",
    playAgain: "Παίξτε Ξανά",
    changeQuizType: "Αλλαγή Τύπου Κουίζ",

    score: "Βαθμολογία",
    bestStreak: "Καλύτερη Σειρά",

    rankS: "Εκλεκτός του Ποσειδώνα",
    rankA: "Αλεξανδρινός Χαρτογράφος",
    rankB: "Αργοναύτης",
    rankC: "Αθηναίος Λόγιος",
    rankD: "Ιώνιος Έμπορος",
    rankE: "Περιπλανώμενος",
    rankF: "Χαμένος Οδοιπόρος",

    invalidQuizType: "Μη έγκυρος τύπος κουίζ",
    reset: "Επαναφορά",
    fetchTimeout:
      "Η φόρτωση δεδομένων έληξε. Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.",
  },
};

export const t = (language, key, ...args) => {
  const value = translations[language]?.[key] ?? translations.en[key] ?? key;
  return typeof value === "function" ? value(...args) : value;
};
