// Internationalization: English, Egyptian Arabic, Franco Arabic
import { LANGUAGES } from './constants.js';

const translations = {
  // =================== MAIN MENU ===================
  appTitle: {
    en: 'Egyptian Dominoes',
    ar: 'دومينو مصري',
    franco: 'Domino Masry'
  },
  appSubtitle: {
    en: 'The Classic Café Game',
    ar: 'لعبة القهوة الكلاسيكية',
    franco: "Le3bet el Ahwa el Classic"
  },
  playSingles: {
    en: 'Play Singles',
    ar: 'لعب فردي',
    franco: 'El3ab Fardy'
  },
  playTeams: {
    en: 'Play Teams',
    ar: 'لعب فرق',
    franco: 'El3ab Fere2'
  },
  settings: {
    en: 'Settings',
    ar: 'الإعدادات',
    franco: 'El E3dadat'
  },

  // =================== GAME SETUP ===================
  gameSetup: {
    en: 'Game Setup',
    ar: 'إعداد اللعبة',
    franco: "E3dad el Lo3ba"
  },
  numberOfPlayers: {
    en: 'Number of Players',
    ar: 'عدد اللاعبين',
    franco: "3adad el La3been"
  },
  playerName: {
    en: 'Player Name',
    ar: 'اسم اللاعب',
    franco: 'Esm el La3eb'
  },
  player: {
    en: 'Player',
    ar: 'لاعب',
    franco: 'La3eb'
  },
  human: {
    en: 'Human',
    ar: 'إنسان',
    franco: 'Ensan'
  },
  computer: {
    en: 'Computer',
    ar: 'كمبيوتر',
    franco: 'Computer'
  },
  aiDifficulty: {
    en: 'AI Difficulty',
    ar: 'صعوبة الكمبيوتر',
    franco: "So3obet el Computer"
  },
  easy: {
    en: 'Easy',
    ar: 'سهل',
    franco: 'Sahl'
  },
  medium: {
    en: 'Medium',
    ar: 'متوسط',
    franco: 'Motawaset'
  },
  hard: {
    en: 'Hard',
    ar: 'صعب',
    franco: 'Sa3b'
  },
  scoreTarget: {
    en: 'Score Target',
    ar: 'هدف النقاط',
    franco: "Hadaf el No2at"
  },
  customScore: {
    en: 'Custom',
    ar: 'مخصص',
    franco: 'Mo5asas'
  },
  startGame: {
    en: 'Start Game',
    ar: 'ابدأ اللعبة',
    franco: "Ebda2 el Lo3ba"
  },
  back: {
    en: 'Back',
    ar: 'رجوع',
    franco: 'Rogo3'
  },
  team: {
    en: 'Team',
    ar: 'فريق',
    franco: 'Fere2'
  },

  // =================== GAMEPLAY ===================
  yourTurn: {
    en: 'Your Turn',
    ar: 'دورك',
    franco: 'Dorak'
  },
  turnOf: {
    en: "'s Turn",
    ar: ' بيلعب',
    franco: ' Beyl3ab'
  },
  knock: {
    en: 'Knock (Pass)',
    ar: 'دق (باس)',
    franco: 'Do2 (Pass)'
  },
  noMoves: {
    en: 'No playable tiles!',
    ar: 'مفيش حجر ينفع!',
    franco: 'Mafish 7agar yanfa3!'
  },
  blocked: {
    en: 'Game Blocked!',
    ar: 'اللعبة اتقفلت!',
    franco: "El Lo3ba Et2aflet!"
  },
  draw: {
    en: 'Draw from boneyard',
    ar: 'اسحب من الحجر',
    franco: "Es7ab men el 7agar"
  },
  score: {
    en: 'Score',
    ar: 'النقاط',
    franco: "El No2at"
  },
  round: {
    en: 'Round',
    ar: 'جولة',
    franco: 'Gawla'
  },
  pips: {
    en: 'Pips',
    ar: 'نقط',
    franco: 'No2at'
  },
  tilesLeft: {
    en: 'Tiles Left',
    ar: 'حجر باقي',
    franco: '7agar Ba2y'
  },
  boneyard: {
    en: 'Boneyard',
    ar: 'الحجر',
    franco: "El 7agar"
  },

  // =================== ROUND END ===================
  roundWinner: {
    en: 'Round Winner',
    ar: 'فائز الجولة',
    franco: "Fayez el Gawla"
  },
  pointsScored: {
    en: 'Points Scored',
    ar: 'نقاط محسوبة',
    franco: 'No2at Ma7souba'
  },
  nextRound: {
    en: 'Next Round',
    ar: 'الجولة التالية',
    franco: "El Gawla el Gaya"
  },
  matchScores: {
    en: 'Match Scores',
    ar: 'نقاط الماتش',
    franco: 'No2at el Match'
  },
  tiedRound: {
    en: 'Tied Round!',
    ar: 'الجولة تعادل!',
    franco: "El Gawla Ta3adol!"
  },

  // =================== MATCH END ===================
  matchWinner: {
    en: 'Match Winner!',
    ar: 'فائز الماتش!',
    franco: 'Fayez el Match!'
  },
  congratulations: {
    en: 'Congratulations!',
    ar: 'مبروك!',
    franco: 'Mabrouk!'
  },
  playAgain: {
    en: 'Play Again',
    ar: 'العب تاني',
    franco: 'El3ab Tany'
  },
  mainMenu: {
    en: 'Main Menu',
    ar: 'القائمة الرئيسية',
    franco: "El 2a2ema el Ra2eseya"
  },
  finalScore: {
    en: 'Final Score',
    ar: 'النتيجة النهائية',
    franco: "El Neteega el Neha2eya"
  },

  // =================== SETTINGS ===================
  language: {
    en: 'Language',
    ar: 'اللغة',
    franco: 'El Logha'
  },
  soundEffects: {
    en: 'Sound Effects',
    ar: 'المؤثرات الصوتية',
    franco: "El Mo2aserat el Sawteya"
  },
  animations: {
    en: 'Animations',
    ar: 'الحركات',
    franco: "El 7arakat"
  },
  on: {
    en: 'On',
    ar: 'مفعّل',
    franco: 'Mashghoul'
  },
  off: {
    en: 'Off',
    ar: 'متوقف',
    franco: 'Matfe'
  },
  english: {
    en: 'English',
    ar: 'English',
    franco: 'English'
  },
  arabic: {
    en: 'العربية',
    ar: 'العربية',
    franco: 'العربية'
  },
  franco_arabic: {
    en: 'Franco',
    ar: 'Franco',
    franco: 'Franco'
  },

  // =================== MISC ===================
  vs: {
    en: 'vs',
    ar: 'ضد',
    franco: 'Ded'
  },
  and: {
    en: '&',
    ar: 'و',
    franco: 'w'
  },
  wins: {
    en: 'Wins!',
    ar: 'فاز!',
    franco: 'Faz!'
  },
  selectTile: {
    en: 'Select a tile to play',
    ar: 'اختار حجر تلعبه',
    franco: "E5tar 7agar tel3abo"
  },
  selectSide: {
    en: 'Select which side to play on',
    ar: 'اختار تلعب على أنهي جنب',
    franco: "E5tar tel3ab 3ala anhy ganb"
  },
  placedDouble: {
    en: 'placed a double!',
    ar: 'نزّل دبل!',
    franco: 'Nazzel double!'
  },
  knocked: {
    en: 'knocked!',
    ar: 'دق!',
    franco: 'Da2!'
  },
  drewTile: {
    en: 'drew a tile',
    ar: 'سحب حجر',
    franco: 'Sa7ab 7agar'
  }
};

let currentLanguage = LANGUAGES.EN;

export function setLanguage(lang) {
  currentLanguage = lang;
  document.documentElement.dir = lang === LANGUAGES.AR ? 'rtl' : 'ltr';
  document.documentElement.lang = lang === LANGUAGES.AR ? 'ar' : 'en';
}

export function getLanguage() {
  return currentLanguage;
}

export function t(key) {
  const entry = translations[key];
  if (!entry) {
    console.warn(`Missing translation key: ${key}`);
    return key;
  }
  return entry[currentLanguage] || entry.en || key;
}

// Format with placeholders: t_fmt('turnOf', {name: 'Ahmed'})
export function t_fmt(key, vars) {
  let text = t(key);
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, v);
    }
  }
  return text;
}

export default { t, t_fmt, setLanguage, getLanguage };
