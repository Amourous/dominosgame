// Tile class - represents a single domino tile
import { MAX_PIP } from '../utils/constants.js';

export class Tile {
  constructor(top, bottom) {
    // Always store with top <= bottom for consistent identity
    this.top = Math.min(top, bottom);
    this.bottom = Math.max(top, bottom);
    this.id = `${this.top}-${this.bottom}`;
    this.isDouble = this.top === this.bottom;
    this.pipCount = this.top + this.bottom;
  }

  /**
   * Check if this tile can connect to a given value
   */
  canConnect(value) {
    return this.top === value || this.bottom === value;
  }

  /**
   * Get the outward-facing value when connecting on a given value
   * e.g., Tile(3,5) connecting on 3 → outward is 5
   */
  getOtherEnd(connectValue) {
    if (this.isDouble) return connectValue;
    if (this.top === connectValue) return this.bottom;
    if (this.bottom === connectValue) return this.top;
    return null;
  }

  /**
   * String representation
   */
  toString() {
    return `[${this.top}|${this.bottom}]`;
  }

  /**
   * Generate a full double-six set (28 tiles)
   */
  static generateSet() {
    const tiles = [];
    for (let i = 0; i <= MAX_PIP; i++) {
      for (let j = i; j <= MAX_PIP; j++) {
        tiles.push(new Tile(i, j));
      }
    }
    return tiles;
  }

  /**
   * Generate set for 3 players (remove 0/0)
   */
  static generateSetForThree() {
    return Tile.generateSet().filter(tile => !(tile.top === 0 && tile.bottom === 0));
  }
}

export default Tile;
