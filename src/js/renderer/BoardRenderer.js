// BoardRenderer - renders the tile chain on the game canvas
import { TILE_GAP, COLORS } from '../utils/constants.js';
import { TileRenderer } from './TileRenderer.js';

export class BoardRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.offsetX = 0;
    this.offsetY = 0;
    this.zoom = 1;
    this.isDragging = false;
    this.lastMouse = { x: 0, y: 0 };

    this._setupPanning();
    // Cache background texture
    this._bgPattern = null;
  }

  /**
   * Setup mouse panning for the board view
   */
  _setupPanning() {
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 1 || e.button === 2) {
        this.isDragging = true;
        this.lastMouse = { x: e.clientX, y: e.clientY };
        e.preventDefault();
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.offsetX += e.clientX - this.lastMouse.x;
        this.offsetY += e.clientY - this.lastMouse.y;
        this.lastMouse = { x: e.clientX, y: e.clientY };
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('wheel', (e) => {
      const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05;
      this.zoom = Math.max(0.3, Math.min(2, this.zoom * zoomFactor));
      e.preventDefault();
    });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /**
   * Render the entire board
   */
  render(board, animationState = null) {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;

    // Draw felt background
    this._drawBackground(W, H);

    if (board.isEmpty && !animationState) {
      this._drawEmptyMessage(W, H);
      return;
    }

    // Calculate layout positions for chain
    const positions = this._calculateChainLayout(board, W, H);

    // Apply pan & zoom
    ctx.save();
    ctx.translate(W / 2 + this.offsetX, H / 2 + this.offsetY);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-W / 2, -H / 2);

    // Draw each tile in the chain
    positions.forEach((pos, i) => {
      const entry = board.chain[i];
      if (!entry) return;

      let drawX = pos.x;
      let drawY = pos.y;
      let drawOpacity = 1;

      if (animationState && animationState.tileIndex === i) {
        const progress = animationState.progress;
        drawX = animationState.fromX + (pos.x - animationState.fromX) * progress;
        drawY = animationState.fromY + (pos.y - animationState.fromY) * progress;
        drawOpacity = progress;
      }

      TileRenderer.draw(ctx, drawX, drawY, entry.tile, {
        horizontal: pos.horizontal,
        scale: 0.85,
        opacity: drawOpacity
      });
    });

    // Draw open end indicators
    if (!board.isEmpty) {
      this._drawEndIndicators(ctx, positions, board);
    }

    ctx.restore();
  }

  /**
   * Calculate layout positions for the chain
   */
  _calculateChainLayout(board, canvasW, canvasH) {
    const positions = [];
    if (board.chain.length === 0) return positions;

    const dims = TileRenderer.getDimensions(true, 0.85);
    const tileW = dims.width + TILE_GAP;
    const tileH = dims.height + TILE_GAP;
    const doubleDims = TileRenderer.getDimensions(false, 0.85);

    // Start from center
    const centerX = canvasW / 2;
    const centerY = canvasH / 2;

    const midPoint = Math.floor(board.chain.length / 2);
    const rightPositions = [];
    const leftPositions = [];

    // Right half of chain (from center to end)
    let x = centerX;
    let y = centerY;

    for (let i = midPoint; i < board.chain.length; i++) {
      const entry = board.chain[i];
      const isDouble = entry.tile.isDouble;

      rightPositions.push({
        x: x,
        y: y,
        horizontal: !isDouble
      });

      if (isDouble) {
        x += doubleDims.width + TILE_GAP + 2;
      } else {
        x += tileW;
      }
    }

    // Left half of chain (from center going left)
    x = centerX - tileW;
    for (let i = midPoint - 1; i >= 0; i--) {
      const entry = board.chain[i];
      const isDouble = entry.tile.isDouble;

      leftPositions.unshift({
        x: x,
        y: y,
        horizontal: !isDouble
      });

      if (isDouble) {
        x -= doubleDims.width + TILE_GAP + 2;
      } else {
        x -= tileW;
      }
    }

    return [...leftPositions, ...rightPositions];
  }

  /**
   * Draw the felt background
   */
  _drawBackground(w, h) {
    const ctx = this.ctx;

    // Rich green felt gradient
    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.75);
    grad.addColorStop(0, '#147040');
    grad.addColorStop(0.4, '#0f5c32');
    grad.addColorStop(0.7, '#0b4a28');
    grad.addColorStop(1, '#072e19');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Felt texture (noise pattern)
    ctx.save();
    ctx.globalAlpha = 0.04;
    for (let x = 0; x < w; x += 3) {
      for (let y = 0; y < h; y += 3) {
        if (Math.random() > 0.6) {
          ctx.fillStyle = Math.random() > 0.5 ? '#000' : '#fff';
          ctx.fillRect(x, y, 1.5, 1.5);
        }
      }
    }
    ctx.restore();

    // Vignette darkening at edges
    const vignetteGrad = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.8);
    vignetteGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vignetteGrad.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, w, h);
  }

  /**
   * Draw "place first tile" message when board is empty
   */
  _drawEmptyMessage(w, h) {
    const ctx = this.ctx;

    // Subtle circle indicator
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 50, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.font = '28px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎲', w / 2, h / 2 - 10);
    ctx.font = '13px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillText('Play your first tile', w / 2, h / 2 + 22);
  }

  /**
   * Draw indicators at the open ends
   */
  _drawEndIndicators(ctx, positions, board) {
    if (positions.length === 0) return;

    const drawIndicator = (px, py, value, isLeft) => {
      const offsetX = isLeft ? -50 : 50;

      // Glow circle
      ctx.beginPath();
      ctx.arc(px + offsetX, py, 14, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Value text
      ctx.fillStyle = 'rgba(255, 215, 0, 0.75)';
      ctx.font = 'bold 13px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(value, px + offsetX, py);
    };

    // Left end
    const leftPos = positions[0];
    if (leftPos) drawIndicator(leftPos.x, leftPos.y, board.leftEnd, true);

    // Right end
    const rightPos = positions[positions.length - 1];
    if (rightPos) drawIndicator(rightPos.x, rightPos.y, board.rightEnd, false);
  }

  /**
   * Reset view to center
   */
  resetView() {
    this.offsetX = 0;
    this.offsetY = 0;
    this.zoom = 1;
  }

  /**
   * Auto-fit: adjust zoom and offset to show entire chain
   */
  autoFit(board) {
    if (board.isEmpty) {
      this.resetView();
      return;
    }

    const positions = this._calculateChainLayout(board, this.canvas.width, this.canvas.height);
    if (positions.length === 0) return;

    const dims = TileRenderer.getDimensions(true, 0.85);
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    positions.forEach(pos => {
      minX = Math.min(minX, pos.x - dims.width);
      maxX = Math.max(maxX, pos.x + dims.width);
      minY = Math.min(minY, pos.y - dims.width);
      maxY = Math.max(maxY, pos.y + dims.width);
    });

    const chainW = maxX - minX;
    const chainH = maxY - minY;
    const scaleX = (this.canvas.width - 150) / chainW;
    const scaleY = (this.canvas.height - 250) / chainH;
    this.zoom = Math.min(1.2, Math.max(0.3, Math.min(scaleX, scaleY)));

    this.offsetX = -(minX + chainW / 2 - this.canvas.width / 2) * this.zoom;
    this.offsetY = -(minY + chainH / 2 - this.canvas.height / 2) * this.zoom;
  }
}

export default BoardRenderer;
