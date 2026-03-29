// HandRenderer - renders player hands on the game canvas
import { TileRenderer } from './TileRenderer.js';

export class HandRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.hoveredTileIndex = -1;
    this.selectedTileIndex = -1;
    this.tilePositions = []; // Cached positions for hit testing
  }

  /**
   * Render the current player's hand at the bottom of the screen
   * @param {Tile[]} hand - Player's tiles
   * @param {Board} board - Current board state (to check playability)
   * @param {boolean} isHumanTurn - Whether it's the human's turn
   */
  renderHumanHand(hand, board, isHumanTurn) {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;

    if (hand.length === 0) return;

    const scale = 1;
    const dims = TileRenderer.getDimensions(true, scale);
    const tileW = dims.width;
    const tileH = dims.height;
    const gap = 10;
    const totalWidth = hand.length * (tileW + gap) - gap;
    const startX = (W - totalWidth) / 2 + tileW / 2;
    const y = H - 55;

    this.tilePositions = [];

    // Draw hand background — frosted glass strip
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    const bgPad = 18;
    TileRenderer._roundRect(ctx,
      startX - tileW / 2 - bgPad,
      y - tileH / 2 - bgPad,
      totalWidth + bgPad * 2,
      tileH + bgPad * 2,
      12
    );
    ctx.fill();

    // Subtle border on hand area
    TileRenderer._roundRect(ctx,
      startX - tileW / 2 - bgPad,
      y - tileH / 2 - bgPad,
      totalWidth + bgPad * 2,
      tileH + bgPad * 2,
      12
    );
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    hand.forEach((tile, i) => {
      const x = startX + i * (tileW + gap);
      const isPlayable = isHumanTurn && board.getValidPlacements(tile).length > 0;
      const isHovered = i === this.hoveredTileIndex;
      const isSelected = i === this.selectedTileIndex;

      const tileY = isHovered ? y - 14 : y;

      TileRenderer.draw(ctx, x, tileY, tile, {
        horizontal: true,
        scale: scale,
        playable: isPlayable && !isSelected,
        selected: isSelected,
        opacity: isHumanTurn ? 1 : 0.65
      });

      // Store position for hit testing
      this.tilePositions.push({
        x: x - tileW / 2,
        y: tileY - tileH / 2,
        width: tileW,
        height: tileH,
        tileIndex: i
      });
    });
  }

  /**
   * Render opponent hands (face down, positioned around the table)
   */
  renderOpponentHands(players, currentSeatIndex) {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    const scale = 0.55;

    players.forEach((player, i) => {
      if (player.seatIndex === currentSeatIndex) return; // Skip human player

      const tileCount = player.hand.length;
      if (tileCount === 0) return;

      const seatDiff = (player.seatIndex - currentSeatIndex + 4) % 4;
      let x, y, horizontal, gap;

      switch (seatDiff) {
        case 1: // Right side
          x = W - 45;
          y = H / 2;
          horizontal = false;
          gap = 22;
          break;
        case 2: // Top (across)
          x = W / 2;
          y = 42;
          horizontal = true;
          gap = 28;
          break;
        case 3: // Left side
          x = 45;
          y = H / 2;
          horizontal = false;
          gap = 22;
          break;
        default:
          return;
      }

      const totalSize = tileCount * gap;
      const startOffset = -totalSize / 2;

      // Label background pill
      let labelX = x, labelY = y;
      if (seatDiff === 1) { labelX -= 15; labelY = y - totalSize / 2 - 30; }
      else if (seatDiff === 2) { labelY += totalSize / 2 + 30; }
      else if (seatDiff === 3) { labelX += 15; labelY = y - totalSize / 2 - 30; }

      // Background pill for name
      ctx.save();
      const nameText = `${player.name} (${tileCount})`;
      ctx.font = `${player.isCurrentTurn ? 'bold ' : ''}12px Inter, sans-serif`;
      const nameWidth = ctx.measureText(nameText).width;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      TileRenderer._roundRect(ctx, labelX - nameWidth / 2 - 10, labelY - 12, nameWidth + 20, 34, 8);
      ctx.fill();

      // Player name
      ctx.fillStyle = player.isCurrentTurn ? '#FFD700' : 'rgba(255,255,255,0.75)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(nameText, labelX, labelY);

      // Score
      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
      ctx.fillText(`${player.matchScore} pts`, labelX, labelY + 15);
      ctx.restore();

      // Draw tiles
      for (let j = 0; j < tileCount; j++) {
        let tileX, tileY;
        if (horizontal || seatDiff === 2) {
          tileX = x + startOffset + j * gap;
          tileY = y;
        } else {
          tileX = x;
          tileY = y + startOffset + j * gap;
        }

        TileRenderer.draw(ctx, tileX, tileY, { top: 0, bottom: 0 }, {
          horizontal: horizontal || seatDiff === 2,
          scale: scale,
          faceDown: true
        });
      }
    });
  }

  /**
   * Hit test: which tile (if any) is under the mouse?
   */
  hitTest(mouseX, mouseY) {
    for (let i = this.tilePositions.length - 1; i >= 0; i--) {
      const pos = this.tilePositions[i];
      if (
        mouseX >= pos.x &&
        mouseX <= pos.x + pos.width &&
        mouseY >= pos.y - 18 && // Extra tolerance for hover offset
        mouseY <= pos.y + pos.height + 8
      ) {
        return pos.tileIndex;
      }
    }
    return -1;
  }

  /**
   * Reset selections
   */
  reset() {
    this.hoveredTileIndex = -1;
    this.selectedTileIndex = -1;
    this.tilePositions = [];
  }
}

export default HandRenderer;
