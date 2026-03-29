// TileRenderer - draws realistic domino tiles on canvas
import { TILE_WIDTH, TILE_HEIGHT, COLORS } from '../utils/constants.js';

// Pip (dot) positions for values 0-6, normalized to [-1, 1] range within each half
const PIP_POSITIONS = {
  0: [],
  1: [[0, 0]],
  2: [[-0.5, -0.5], [0.5, 0.5]],
  3: [[-0.5, -0.5], [0, 0], [0.5, 0.5]],
  4: [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]],
  5: [[-0.5, -0.5], [0.5, -0.5], [0, 0], [-0.5, 0.5], [0.5, 0.5]],
  6: [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0], [0.5, 0], [-0.5, 0.5], [0.5, 0.5]]
};

export class TileRenderer {
  /**
   * Draw a domino tile — realistic style with 3D depth
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x - Center x position
   * @param {number} y - Center y position
   * @param {object} tile - Tile object with .top and .bottom
   * @param {object} options - Drawing options
   */
  static draw(ctx, x, y, tile, options = {}) {
    const {
      horizontal = true,
      scale = 1,
      highlight = false,
      playable = false,
      selected = false,
      faceDown = false,
      opacity = 1,
      rotation = 0
    } = options;

    // Dominos are 2:1 ratio
    const longSide = 76 * scale;
    const shortSide = 38 * scale;
    const w = horizontal ? longSide : shortSide;
    const h = horizontal ? shortSide : longSide;
    const cornerR = 4 * scale;
    const depth = 3 * scale; // 3D depth

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(x, y);
    if (rotation) ctx.rotate(rotation);

    const rx = -w / 2;
    const ry = -h / 2;

    if (faceDown) {
      TileRenderer._drawFaceDown(ctx, rx, ry, w, h, cornerR, depth, scale);
    } else {
      TileRenderer._drawFaceUp(ctx, rx, ry, w, h, cornerR, depth, scale, tile, horizontal);
    }

    // Highlight overlays
    if (!faceDown) {
      if (selected) {
        TileRenderer._drawHighlight(ctx, rx, ry, w, h, cornerR, 'rgba(255, 215, 0, 0.6)', 3 * scale, 15 * scale);
      } else if (playable) {
        TileRenderer._drawHighlight(ctx, rx, ry, w, h, cornerR, 'rgba(76, 175, 80, 0.5)', 2.5 * scale, 10 * scale);
      } else if (highlight) {
        TileRenderer._drawHighlight(ctx, rx, ry, w, h, cornerR, 'rgba(255, 255, 255, 0.2)', 1.5 * scale, 5 * scale);
      }
    }

    ctx.restore();
  }

  /**
   * Draw a face-up domino
   */
  static _drawFaceUp(ctx, rx, ry, w, h, cornerR, depth, scale, tile, horizontal) {
    // === 3D BOTTOM EDGE (depth shadow) ===
    ctx.save();
    TileRenderer._roundRect(ctx, rx + 1, ry + depth, w, h, cornerR);
    ctx.fillStyle = '#1a1208';
    ctx.fill();
    ctx.restore();

    // === MAIN TILE BODY ===
    // Outer border (dark surround)
    TileRenderer._roundRect(ctx, rx - 0.5, ry - 0.5, w + 1, h + 1, cornerR + 0.5);
    ctx.fillStyle = '#2C1810';
    ctx.fill();

    // Inner face — ivory/cream colored domino
    TileRenderer._roundRect(ctx, rx, ry, w, h, cornerR);
    const faceGrad = ctx.createLinearGradient(rx, ry, rx + w, ry + h);
    faceGrad.addColorStop(0, '#FEFCF0');
    faceGrad.addColorStop(0.3, '#F8F3E3');
    faceGrad.addColorStop(0.7, '#F5EDD8');
    faceGrad.addColorStop(1, '#EDE5CC');
    ctx.fillStyle = faceGrad;
    ctx.fill();

    // Subtle border stroke
    TileRenderer._roundRect(ctx, rx, ry, w, h, cornerR);
    ctx.strokeStyle = '#8B7355';
    ctx.lineWidth = 1.2 * scale;
    ctx.stroke();

    // === DIVIDER LINE (the central line dividing two halves) ===
    ctx.beginPath();
    if (horizontal) {
      // Vertical divider in the middle
      const midX = 0;
      ctx.moveTo(midX, ry + 3 * scale);
      ctx.lineTo(midX, ry + h - 3 * scale);
    } else {
      // Horizontal divider in the middle
      const midY = 0;
      ctx.moveTo(rx + 3 * scale, midY);
      ctx.lineTo(rx + w - 3 * scale, midY);
    }
    ctx.strokeStyle = '#9B8B6B';
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();

    // Secondary thinner line next to divider for depth
    ctx.beginPath();
    if (horizontal) {
      ctx.moveTo(0.8 * scale, ry + 3 * scale);
      ctx.lineTo(0.8 * scale, ry + h - 3 * scale);
    } else {
      ctx.moveTo(rx + 3 * scale, 0.8 * scale);
      ctx.lineTo(rx + w - 3 * scale, 0.8 * scale);
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 0.5 * scale;
    ctx.stroke();

    // === DRAW PIPS ===
    const halfW = w / 2;
    const halfH = h / 2;
    const pipAreaSize = Math.min(halfW, halfH) * 0.65;
    const pipRadius = 3.2 * scale;

    if (horizontal) {
      // Left half → tile.top
      TileRenderer._drawPips(ctx, rx + halfW / 2, ry + h / 2, tile.top, pipAreaSize, pipRadius, scale);
      // Right half → tile.bottom
      TileRenderer._drawPips(ctx, rx + halfW + halfW / 2, ry + h / 2, tile.bottom, pipAreaSize, pipRadius, scale);
    } else {
      // Top half → tile.top
      TileRenderer._drawPips(ctx, rx + w / 2, ry + halfH / 2, tile.top, pipAreaSize, pipRadius, scale);
      // Bottom half → tile.bottom
      TileRenderer._drawPips(ctx, rx + w / 2, ry + halfH + halfH / 2, tile.bottom, pipAreaSize, pipRadius, scale);
    }

    // === SUBTLE SHINE (top-left light reflection) ===
    ctx.save();
    TileRenderer._roundRect(ctx, rx, ry, w, h, cornerR);
    ctx.clip();
    const shineGrad = ctx.createLinearGradient(rx, ry, rx + w * 0.5, ry + h * 0.5);
    shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    shineGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.03)');
    shineGrad.addColorStop(1, 'rgba(0, 0, 0, 0.02)');
    ctx.fillStyle = shineGrad;
    ctx.fillRect(rx, ry, w, h);
    ctx.restore();
  }

  /**
   * Draw a face-down domino (back side)
   */
  static _drawFaceDown(ctx, rx, ry, w, h, cornerR, depth, scale) {
    // Depth shadow
    TileRenderer._roundRect(ctx, rx + 1, ry + depth, w, h, cornerR);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    // Dark back
    TileRenderer._roundRect(ctx, rx, ry, w, h, cornerR);
    const backGrad = ctx.createLinearGradient(rx, ry, rx + w, ry + h);
    backGrad.addColorStop(0, '#1B3A5C');
    backGrad.addColorStop(0.5, '#1E4470');
    backGrad.addColorStop(1, '#1B3A5C');
    ctx.fillStyle = backGrad;
    ctx.fill();

    // Border
    TileRenderer._roundRect(ctx, rx, ry, w, h, cornerR);
    ctx.strokeStyle = '#2A5A8C';
    ctx.lineWidth = 1 * scale;
    ctx.stroke();

    // Center diamond decoration
    ctx.save();
    TileRenderer._roundRect(ctx, rx, ry, w, h, cornerR);
    ctx.clip();

    const cx = rx + w / 2;
    const cy = ry + h / 2;
    const dSize = Math.min(w, h) * 0.3;

    // Outer diamond
    ctx.beginPath();
    ctx.moveTo(cx, cy - dSize);
    ctx.lineTo(cx + dSize, cy);
    ctx.lineTo(cx, cy + dSize);
    ctx.lineTo(cx - dSize, cy);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(100, 170, 240, 0.25)';
    ctx.lineWidth = 1 * scale;
    ctx.stroke();

    // Inner diamond
    const dSize2 = dSize * 0.55;
    ctx.beginPath();
    ctx.moveTo(cx, cy - dSize2);
    ctx.lineTo(cx + dSize2, cy);
    ctx.lineTo(cx, cy + dSize2);
    ctx.lineTo(cx - dSize2, cy);
    ctx.closePath();
    ctx.fillStyle = 'rgba(100, 170, 240, 0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(100, 170, 240, 0.2)';
    ctx.lineWidth = 0.5 * scale;
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draw pips (dots) for a given value at a center position
   * Pips are drawn as indented circles (like real carved dominos)
   */
  static _drawPips(ctx, cx, cy, value, areaSize, pipRadius, scale) {
    const positions = PIP_POSITIONS[value];
    if (!positions || positions.length === 0) return;

    positions.forEach(([px, py]) => {
      const pipX = cx + px * areaSize;
      const pipY = cy + py * areaSize;

      // Outer shadow (indent effect)
      ctx.beginPath();
      ctx.arc(pipX, pipY, pipRadius + 0.8 * scale, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fill();

      // Pip indent (carved look)
      const pipGrad = ctx.createRadialGradient(
        pipX - pipRadius * 0.3, pipY - pipRadius * 0.3, 0,
        pipX, pipY, pipRadius
      );
      pipGrad.addColorStop(0, '#2a2a2a');
      pipGrad.addColorStop(0.7, '#1a1a1e');
      pipGrad.addColorStop(1, '#0f0f14');

      ctx.beginPath();
      ctx.arc(pipX, pipY, pipRadius, 0, Math.PI * 2);
      ctx.fillStyle = pipGrad;
      ctx.fill();

      // Small highlight on pip (subtle reflection)
      ctx.beginPath();
      ctx.arc(pipX - pipRadius * 0.25, pipY - pipRadius * 0.25, pipRadius * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fill();
    });
  }

  /**
   * Draw a highlight glow around the tile
   */
  static _drawHighlight(ctx, rx, ry, w, h, cornerR, color, lineWidth, glowRadius) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = glowRadius;

    TileRenderer._roundRect(ctx, rx - 2, ry - 2, w + 4, h + 4, cornerR + 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draw a rounded rectangle path
   */
  static _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /**
   * Get tile dimensions based on orientation and scale
   */
  static getDimensions(horizontal = true, scale = 1) {
    const longSide = 76 * scale;
    const shortSide = 38 * scale;
    return {
      width: horizontal ? longSide : shortSide,
      height: horizontal ? shortSide : longSide
    };
  }
}

export default TileRenderer;
