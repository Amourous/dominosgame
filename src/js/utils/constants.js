// Game constants
export const MAX_PIP = 6;
export const TILE_COUNT = 28; // Full double-six set

export const GAME_MODE = {
  SINGLES: 'singles',
  TEAMS: 'teams'
};

export const PLAYER_TYPE = {
  HUMAN: 'human',
  AI: 'ai'
};

export const AI_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

export const GAME_STATE = {
  MENU: 'menu',
  SETUP: 'setup',
  PLAYING: 'playing',
  ROUND_END: 'round_end',
  MATCH_END: 'match_end'
};

export const TURN_STATE = {
  WAITING: 'waiting',
  SELECTING: 'selecting',
  PLACING: 'placing',
  ANIMATING: 'animating'
};

// How many tiles each player gets based on player count
export const TILES_PER_PLAYER = {
  2: 7,
  3: 9,
  4: 7
};

// Score targets available
export const SCORE_TARGETS = [101, 151, 200, 250, 301, 501];

// Direction on board
export const DIRECTION = {
  LEFT: 'left',
  RIGHT: 'right'
};

// Canvas rendering constants
export const TILE_WIDTH = 70;
export const TILE_HEIGHT = 35;
export const PIP_RADIUS = 3.5;
export const TILE_CORNER_RADIUS = 5;
export const TILE_GAP = 3;

// Colors
export const COLORS = {
  TILE_FACE: '#F5F0E1',
  TILE_BORDER: '#2C1810',
  TILE_PIP: '#1a1a2e',
  TILE_DIVIDER: '#8B7355',
  TILE_HIGHLIGHT: '#FFD700',
  TILE_PLAYABLE: 'rgba(76, 175, 80, 0.4)',
  TILE_SELECTED: 'rgba(255, 215, 0, 0.5)',
  BOARD_FELT: '#0d4f2b',
  BOARD_BORDER: '#1a3520',
  PLAYER_ACTIVE: '#FFD700',
  PLAYER_INACTIVE: '#8B8B8B'
};

// Animation durations (ms)
export const ANIM = {
  TILE_PLACE: 400,
  TILE_DRAW: 300,
  SCORE_POPUP: 1500,
  TURN_DELAY: 800,
  AI_THINK: 1000,
  SCREEN_TRANSITION: 500
};

// Supported languages
export const LANGUAGES = {
  EN: 'en',
  AR: 'ar',
  FRANCO: 'franco'
};
