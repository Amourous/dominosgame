// Board class - manages the chain of placed tiles
import { DIRECTION } from '../utils/constants.js';
import { EventEmitter } from '../utils/helpers.js';

export class Board extends EventEmitter {
  constructor() {
    super();
    this.chain = [];        // Array of placed tiles with metadata
    this.leftEnd = null;    // Current value at the left end
    this.rightEnd = null;   // Current value at the right end
    this.isEmpty = true;
  }

  /**
   * Reset the board for a new round
   */
  reset() {
    this.chain = [];
    this.leftEnd = null;
    this.rightEnd = null;
    this.isEmpty = true;
  }

  /**
   * Place the first tile on the board
   */
  placeFirst(tile) {
    const entry = {
      tile: tile,
      direction: null,
      connectValue: null,
      outwardLeft: tile.top,
      outwardRight: tile.bottom
    };
    this.chain.push(entry);
    this.leftEnd = tile.top;
    this.rightEnd = tile.bottom;
    this.isEmpty = false;
    this.emit('tilePlaced', { tile, direction: 'first', entry });
    return entry;
  }

  /**
   * Get valid placement directions for a tile
   * Returns array of directions: ['left'], ['right'], ['left','right'], or []
   */
  getValidPlacements(tile) {
    if (this.isEmpty) return ['first'];

    const dirs = [];
    if (tile.canConnect(this.leftEnd)) dirs.push(DIRECTION.LEFT);
    if (tile.canConnect(this.rightEnd)) dirs.push(DIRECTION.RIGHT);

    // If both ends are the same value, and it's not a double that matches,
    // only return one direction (they're equivalent)
    if (dirs.length === 2 && this.leftEnd === this.rightEnd) {
      return [DIRECTION.LEFT];
    }
    return dirs;
  }

  /**
   * Place a tile on the board at the specified direction
   */
  place(tile, direction) {
    if (this.isEmpty) return this.placeFirst(tile);

    let connectValue, outwardValue;

    if (direction === DIRECTION.LEFT) {
      connectValue = this.leftEnd;
      outwardValue = tile.getOtherEnd(connectValue);
      this.leftEnd = outwardValue;
    } else {
      connectValue = this.rightEnd;
      outwardValue = tile.getOtherEnd(connectValue);
      this.rightEnd = outwardValue;
    }

    const entry = {
      tile: tile,
      direction: direction,
      connectValue: connectValue,
      outwardValue: outwardValue
    };

    if (direction === DIRECTION.LEFT) {
      this.chain.unshift(entry);
    } else {
      this.chain.push(entry);
    }

    this.emit('tilePlaced', { tile, direction, entry });
    return entry;
  }

  /**
   * Check if any tile from a hand can be played
   */
  canAnyBePlayed(hand) {
    if (this.isEmpty) return true;
    return hand.some(tile => this.getValidPlacements(tile).length > 0);
  }

  /**
   * Get the open end values
   */
  getOpenEnds() {
    if (this.isEmpty) return [];
    if (this.leftEnd === this.rightEnd) return [this.leftEnd];
    return [this.leftEnd, this.rightEnd];
  }

  /**
   * Get chain length
   */
  get length() {
    return this.chain.length;
  }
}

export default Board;
