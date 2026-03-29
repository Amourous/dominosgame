// AI Player logic
import { AI_DIFFICULTY, DIRECTION } from '../utils/constants.js';

export class AIPlayer {
  /**
   * Choose a tile and direction for an AI player
   * @param {Player} player - The AI player
   * @param {Board} board - Current board state
   * @param {Player[]} allPlayers - All players (for hard AI analysis)
   * @returns {{ tile, direction }} or null if no move
   */
  static chooseMove(player, board, allPlayers = []) {
    const playable = player.getPlayableTiles(board);
    if (playable.length === 0) return null;

    switch (player.difficulty) {
      case AI_DIFFICULTY.EASY:
        return AIPlayer._easyMove(playable, board);
      case AI_DIFFICULTY.MEDIUM:
        return AIPlayer._mediumMove(playable, board, player);
      case AI_DIFFICULTY.HARD:
        return AIPlayer._hardMove(playable, board, player, allPlayers);
      default:
        return AIPlayer._mediumMove(playable, board, player);
    }
  }

  /**
   * Easy AI: Random valid tile
   */
  static _easyMove(playable, board) {
    const tile = playable[Math.floor(Math.random() * playable.length)];
    const directions = board.getValidPlacements(tile);
    const direction = directions[Math.floor(Math.random() * directions.length)];
    return { tile, direction };
  }

  /**
   * Medium AI: Prefer doubles, then highest pip count
   */
  static _mediumMove(playable, board, player) {
    // Sort: doubles first, then by pip count descending
    const sorted = [...playable].sort((a, b) => {
      if (a.isDouble && !b.isDouble) return -1;
      if (!a.isDouble && b.isDouble) return 1;
      return b.pipCount - a.pipCount;
    });

    const tile = sorted[0];
    const directions = board.getValidPlacements(tile);

    // If can play on both sides, prefer the side where we have more connecting tiles
    if (directions.length > 1) {
      const dir = AIPlayer._preferredDirection(tile, board, player);
      return { tile, direction: dir };
    }
    return { tile, direction: directions[0] };
  }

  /**
   * Hard AI: Strategic play considering opponents and hand analysis
   */
  static _hardMove(playable, board, player, allPlayers) {
    let bestScore = -Infinity;
    let bestMove = null;

    for (const tile of playable) {
      const directions = board.getValidPlacements(tile);
      for (const direction of directions) {
        const score = AIPlayer._evaluateMove(tile, direction, board, player, allPlayers);
        if (score > bestScore) {
          bestScore = score;
          bestMove = { tile, direction };
        }
      }
    }

    return bestMove || { tile: playable[0], direction: board.getValidPlacements(playable[0])[0] };
  }

  /**
   * Evaluate a potential move (hard AI)
   */
  static _evaluateMove(tile, direction, board, player, allPlayers) {
    let score = 0;

    // 1. Prefer playing high-pip tiles (get rid of heavy tiles)
    score += tile.pipCount * 2;

    // 2. Prefer doubles (tradition: get rid of doubles early)
    if (tile.isDouble) score += 5;

    // 3. Prefer to leave ends that match our remaining hand
    const remainingHand = player.hand.filter(t => t.id !== tile.id);
    const newEndValue = tile.getOtherEnd(
      direction === DIRECTION.LEFT ? board.leftEnd : board.rightEnd
    );

    // Count how many of our remaining tiles connect to the new end
    const connectCount = remainingHand.filter(t => t.canConnect(newEndValue)).length;
    score += connectCount * 3;

    // 4. Try to block opponents (create ends they might not have)
    // Heuristic: if end appears many times in our hand, opponents likely don't have it
    const endFrequency = remainingHand.filter(t =>
      t.top === newEndValue || t.bottom === newEndValue
    ).length;
    score += endFrequency * 2;

    // 5. Penalize leaving us with no connecting tiles on an end
    const otherEnd = direction === DIRECTION.LEFT ? board.rightEnd : board.leftEnd;
    const canPlayOtherEnd = remainingHand.some(t => t.canConnect(otherEnd));
    if (!canPlayOtherEnd && remainingHand.length > 0) score -= 5;

    // 6. If going out (last tile), big bonus
    if (remainingHand.length === 0) score += 100;

    return score;
  }

  /**
   * Choose preferred direction when both sides are valid
   */
  static _preferredDirection(tile, board, player) {
    const leftEnd = tile.getOtherEnd(board.leftEnd);
    const rightEnd = tile.getOtherEnd(board.rightEnd);

    const remainingHand = player.hand.filter(t => t.id !== tile.id);

    const leftConnections = remainingHand.filter(t => t.canConnect(leftEnd)).length;
    const rightConnections = remainingHand.filter(t => t.canConnect(rightEnd)).length;

    return leftConnections >= rightConnections ? DIRECTION.LEFT : DIRECTION.RIGHT;
  }
}

export default AIPlayer;
