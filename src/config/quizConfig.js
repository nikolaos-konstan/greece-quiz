// src/config/quizConfig.js

export const QUIZ_TYPES = {
  PREFECTURES: "prefectures",
  MUNICIPALITIES: "municipalities",
};

export const QUIZ_CONFIGS = {
  [QUIZ_TYPES.PREFECTURES]: {
    id: QUIZ_TYPES.PREFECTURES,
    dataPath: "/data/nomoi_okxe.geojson",
    nameProperties: {
      en: "NAME_ENG",
      el: "NAME_GR",
    },
    displayName: {
      en: "Prefectures",
      el: "Νομοί",
    },
    description: {
      en: "Identify Greek prefectures on the map",
      el: "Αναγνωρίστε τους ελληνικούς νομούς στον χάρτη",
    },
  },

  [QUIZ_TYPES.MUNICIPALITIES]: {
    id: QUIZ_TYPES.MUNICIPALITIES,
    dataPath: "/data/dimoi.json",
    nameProperties: {
      en: "NAME_3",
      el: "NL_NAME_3",
    },
    displayName: {
      en: "Municipalities",
      el: "Δήμοι",
    },
    description: {
      en: "Identify Greek municipalities on the map",
      el: "Αναγνωρίστε τους ελληνικούς δήμους στον χάρτη",
    },
  },
};

export const DEFAULT_QUIZ_TYPE = QUIZ_TYPES.PREFECTURES;
export const DEFAULT_LANGUAGE = "en";
