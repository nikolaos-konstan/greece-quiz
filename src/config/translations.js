// src/config/translations.js

export const translations = {
  en: {
    // App
    appTitle: "Greece Geography Quiz",
    appSubtitle: "Test your knowledge of Greek geography",

    // Settings
    quizSettings: "Quiz Settings",
    quizType: "Quiz Type:",
    language: "Language:",
    startQuiz: "Start Quiz",

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
    giveUp: "Give up",

    // Feedback
    correct: "Correct!",
    incorrect: (name) => `Incorrect! Try again to find ${name}`,

    // Progress
    progress: (identified, skipped, remaining) =>
      `${identified} identified, ${skipped} skipped, ${remaining} remaining`,

    // Game complete
    quizComplete: "Quiz Complete!",
    quizEnded: "Quiz Ended",
    foundCount: (found, total) => `You found ${found} of ${total} regions.`,
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

    // Map
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    resetZoom: "Reset zoom",
    mapLabel:
      "Map of Greece. Use the arrow keys to move between regions and Enter to select one.",
    unidentifiedRegion: "Unidentified region",

    // Errors
    fetchTimeout:
      "Data loading timed out. Please check your connection and try again.",
    fetchFailed: "The quiz data could not be loaded. Please try again.",
  },
  el: {
    appTitle: "Κουίζ Γεωγραφίας Ελλάδας",
    appSubtitle: "Δοκιμάστε τις γνώσεις σας για τη γεωγραφία της Ελλάδας",

    quizSettings: "Ρυθμίσεις Κουίζ",
    quizType: "Τύπος Κουίζ:",
    language: "Γλώσσα:",
    startQuiz: "Έναρξη Κουίζ",

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
    giveUp: "Τα παρατάω",

    correct: "Σωστά!",
    incorrect: (name) => `Λάθος! Προσπαθήστε ξανά: ${name}`,

    progress: (identified, skipped, remaining) =>
      `${identified} αναγνωρίστηκαν, ${skipped} παραλείφθηκαν, ${remaining} απομένουν`,

    quizComplete: "Το Κουίζ Ολοκληρώθηκε!",
    quizEnded: "Το Κουίζ Τερματίστηκε",
    foundCount: (found, total) => `Βρήκατε ${found} από ${total} περιοχές.`,
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

    zoomIn: "Μεγέθυνση",
    zoomOut: "Σμίκρυνση",
    resetZoom: "Επαναφορά εστίασης",
    mapLabel:
      "Χάρτης της Ελλάδας. Μετακινηθείτε μεταξύ των περιοχών με τα βέλη και επιλέξτε με το Enter.",
    unidentifiedRegion: "Μη αναγνωρισμένη περιοχή",

    fetchTimeout:
      "Η φόρτωση δεδομένων έληξε. Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.",
    fetchFailed: "Δεν ήταν δυνατή η φόρτωση των δεδομένων. Δοκιμάστε ξανά.",
  },
};

export const t = (language, key, ...args) => {
  const value = translations[language]?.[key] ?? translations.en[key] ?? key;
  return typeof value === "function" ? value(...args) : value;
};
