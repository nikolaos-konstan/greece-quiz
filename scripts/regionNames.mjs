// Display names for the map data. The raw prefecture names are upper-case
// transliterations ("N. PIERIAS"), so they are listed in full, keyed by ESYE_ID.
export const PREFECTURE_NAMES = {
  "01000000": ["Aetolia-Acarnania", "Νομός Αιτωλοακαρνανίας"],
  "03000000": ["Boeotia", "Νομός Βοιωτίας"],
  "04000000": ["Euboea", "Νομός Ευβοίας"],
  "05000000": ["Evrytania", "Νομός Ευρυτανίας"],
  "06000000": ["Phthiotis", "Νομός Φθιώτιδας"],
  "07000000": ["Phocis", "Νομός Φωκίδας"],
  11000000: ["Argolis", "Νομός Αργολίδας"],
  12000000: ["Arcadia", "Νομός Αρκαδίας"],
  13000000: ["Achaea", "Νομός Αχαΐας"],
  14000000: ["Elis", "Νομός Ηλείας"],
  15000000: ["Corinthia", "Νομός Κορινθίας"],
  16000000: ["Laconia", "Νομός Λακωνίας"],
  17000000: ["Messenia", "Νομός Μεσσηνίας"],
  21000000: ["Zakynthos", "Νομός Ζακύνθου"],
  22000000: ["Corfu", "Νομός Κέρκυρας"],
  23000000: ["Kefalonia", "Νομός Κεφαλληνίας"],
  24000000: ["Lefkada", "Νομός Λευκάδας"],
  31000000: ["Arta", "Νομός Άρτας"],
  32000000: ["Thesprotia", "Νομός Θεσπρωτίας"],
  33000000: ["Ioannina", "Νομός Ιωαννίνων"],
  34000000: ["Preveza", "Νομός Πρέβεζας"],
  41000000: ["Karditsa", "Νομός Καρδίτσας"],
  42000000: ["Larissa", "Νομός Λάρισας"],
  43000000: ["Magnesia", "Νομός Μαγνησίας"],
  44000000: ["Trikala", "Νομός Τρικάλων"],
  51000000: ["Grevena", "Νομός Γρεβενών"],
  52000000: ["Drama", "Νομός Δράμας"],
  53000000: ["Imathia", "Νομός Ημαθίας"],
  54000000: ["Thessaloniki", "Νομός Θεσσαλονίκης"],
  55000000: ["Kavala", "Νομός Καβάλας"],
  56000000: ["Kastoria", "Νομός Καστοριάς"],
  57000000: ["Kilkis", "Νομός Κιλκίς"],
  58000000: ["Kozani", "Νομός Κοζάνης"],
  59000000: ["Pella", "Νομός Πέλλας"],
  61000000: ["Pieria", "Νομός Πιερίας"],
  62000000: ["Serres", "Νομός Σερρών"],
  63000000: ["Florina", "Νομός Φλώρινας"],
  64000000: ["Chalkidiki", "Νομός Χαλκιδικής"],
  65000000: ["Mount Athos", "Άγιο Όρος"],
  71000000: ["Evros", "Νομός Έβρου"],
  72000000: ["Xanthi", "Νομός Ξάνθης"],
  73000000: ["Rhodope", "Νομός Ροδόπης"],
  81000000: ["Dodecanese", "Νομός Δωδεκανήσου"],
  82000000: ["Cyclades", "Νομός Κυκλάδων"],
  83000000: ["Lesbos", "Νομός Λέσβου"],
  84000000: ["Samos", "Νομός Σάμου"],
  85000000: ["Chios", "Νομός Χίου"],
  91000000: ["Heraklion", "Νομός Ηρακλείου"],
  92000000: ["Lasithi", "Νομός Λασιθίου"],
  93000000: ["Rethymno", "Νομός Ρεθύμνης"],
  94000000: ["Chania", "Νομός Χανίων"],
  96000000: ["Piraeus and Islands", "Νομός Πειραιά και Νήσων"],
  97000000: ["West Attica", "Νομός Δυτικής Αττικής"],
  98000000: ["East Attica", "Νομός Ανατολικής Αττικής"],
  99000000: ["Athens", "Νομός Αθηνών"],
};

// Municipality names are mostly usable once their missing spaces are restored.
// These entries, keyed by the raw NAME_3, correct the rest. The two municipalities
// named Ηρακλείου are told apart by region, otherwise the question is ambiguous.
export const MUNICIPALITY_OVERRIDES = {
  NaxosandMikresKyklades: {
    en: "Naxos and Mikres Kyklades",
    el: "Δήμος Νάξου και Μικρών Κυκλάδων",
  },
  Athos: { en: "Mount Athos", el: "Άγιο Όρος" },
  Irakleio: { el: "Δήμος Ηρακλείου (Αττική)" },
  Heraklion: { el: "Δήμος Ηρακλείου (Κρήτη)" },
  Megisti: { el: "Δήμος Μεγίστης" },
  "Troizinia-Methana": { el: "Δήμος Τροιζηνίας-Μεθάνων" },
  "Velo-Vocha": { el: "Δήμος Βέλου-Βόχας" },
  "Aktio-Vonitsa": { el: "Δήμος Ακτίου-Βόνιτσας" },
  Amari: { el: "Δήμος Αμαρίου" },
  "Andravida-Kyllini": { el: "Δήμος Ανδραβίδας-Κυλλήνης" },
  NeaPropontida: { el: "Δήμος Νέας Προποντίδας" },
  "Mantoudi-Limni-AgiaAnna": { el: "Δήμος Μαντουδίου-Λίμνης-Αγίας Άννας" },
  Pella: { el: "Δήμος Πέλλας" },
};

const LOWER_THEN_UPPER = /([a-zα-ωά-ώϊϋΐΰ])([A-ZΑ-ΩΆ-Ώ])/g;

export const restoreSpaces = (name) => name.replace(LOWER_THEN_UPPER, "$1 $2");

// Raw Greek names are genitive ("Χίου"), which reads correctly after "Δήμος".
export const municipalityNames = (properties) => {
  const override = MUNICIPALITY_OVERRIDES[properties.NAME_3] ?? {};
  return {
    en: override.en ?? restoreSpaces(properties.NAME_3),
    el: override.el ?? `Δήμος ${restoreSpaces(properties.NL_NAME_3)}`,
  };
};
