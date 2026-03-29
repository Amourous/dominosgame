// Player class
import { PLAYER_TYPE, AI_DIFFICULTY } from '../utils/constants.js';

export class Player {
  constructor(name, type = PLAYER_TYPE.HUMAN, difficulty = AI_DIFFICULTY.MEDIUM) {
    this.name = name;
    this.type = type;
    this.difficulty = difficulty;
    this.hand = [];
    this.matchScore = 0;
    this.roundsWon = 0;
    this.teamIndex = -1; // -1 for singles, 0 or 1 for teams
    this.seatIndex = 0;  // Position at the table (0=bottom, 1=right, 2=top, 3=left)
    this.isActive = false;
    this.hasKnocked = false;
    this.consecutiveKnocks = 0;
  }

  /**
   * Add tiles to hand
   */
  addTiles(tiles) {
    this.hand.push(...tiles);
  }

  /**
   * Remove a specific tile from hand
   */
  removeTile(tile) {
    const idx = this.hand.findIndex(t => t.id === tile.id);
    if (idx !== -1) {
      this.hand.splice(idx, 1);
      return true;
    }
    return false;
  }

  /**
   * Calculate total pips in hand
   */
  getPipCount() {
    return this.hand.reduce((sum, tile) => sum + tile.pipCount, 0);
  }

  /**
   * Check if hand is empty
   */
  get handEmpty() {
    return this.hand.length === 0;
  }

  /**
   * Get the highest double in hand (for determining who starts)
   * Returns the tile or null if no doubles
   */
  getHighestDouble() {
    const doubles = this.hand.filter(t => t.isDouble);
    if (doubles.length === 0) return null;
    return doubles.reduce((max, t) => t.pipCount > max.pipCount ? t : max, doubles[0]);
  }

  /**
   * Get playable tiles for the given board state
   */
  getPlayableTiles(board) {
    if (board.isEmpty) return [...this.hand];
    return this.hand.filter(tile => board.getValidPlacements(tile).length > 0);
  }

  /**
   * Reset hand for new round
   */
  resetHand() {
    this.hand = [];
    this.hasKnocked = false;
    this.consecutiveKnocks = 0;
  }

  /**
   * Reset everything for new match
   */
  resetMatch() {
    this.resetHand();
    this.matchScore = 0;
    this.roundsWon = 0;
  }

  /**
   * Is this player an AI?
   */
  get isAI() {
    return this.type === PLAYER_TYPE.AI;
  }

  toString() {
    return `${this.name} (${this.hand.length} tiles, ${this.getPipCount()} pips)`;
  }
}

export default Player;
