// AnimationManager - handles game animations
import { ANIM } from '../utils/constants.js';

export class AnimationManager {
  constructor() {
    this.animations = [];
    this.particles = [];
  }

  /**
   * Add a tile placement animation
   */
  addTilePlacement(fromX, fromY, toX, toY, tileIndex, callback) {
    this.animations.push({
      type: 'tilePlacement',
      fromX, fromY, toX, toY,
      tileIndex,
      startTime: performance.now(),
      duration: ANIM.TILE_PLACE,
      callback,
      progress: 0
    });
  }

  /**
   * Add a score popup animation
   */
  addScorePopup(x, y, text, color = '#FFD700') {
    this.animations.push({
      type: 'scorePopup',
      x, y,
      text,
      color,
      startTime: performance.now(),
      duration: ANIM.SCORE_POPUP,
      progress: 0
    });
  }

  /**
   * Add knock notification
   */
  addKnockNotification(playerName, x, y) {
    this.animations.push({
      type: 'notification',
      x, y,
      text: `🤚 ${playerName}`,
      startTime: performance.now(),
      duration: 1200,
      progress: 0
    });
  }

  /**
   * Add celebration particles
   */
  addCelebration(x, y) {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96E6A1', '#DDA0DD'];
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10 - 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 5,
        life: 1,
        decay: 0.01 + Math.random() * 0.02
      });
    }
  }

  /**
   * Update all animations
   */
  update() {
    const now = performance.now();

    // Update animations
    this.animations = this.animations.filter(anim => {
      const elapsed = now - anim.startTime;
      anim.progress = Math.min(1, elapsed / anim.duration);

      // Easing: ease-out cubic
      anim.easedProgress = 1 - Math.pow(1 - anim.progress, 3);

      if (anim.progress >= 1) {
        if (anim.callback) anim.callback();
        return false;
      }
      return true;
    });

    // Update particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // Gravity
      p.life -= p.decay;
      return p.life > 0;
    });
  }

  /**
   * Render all active animations
   */
  render(ctx) {
    // Render animations
    this.animations.forEach(anim => {
      switch (anim.type) {
        case 'scorePopup':
          this._renderScorePopup(ctx, anim);
          break;
        case 'notification':
          this._renderNotification(ctx, anim);
          break;
      }
    });

    // Render particles
    this.particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  /**
   * Render score popup
   */
  _renderScorePopup(ctx, anim) {
    const { x, y, text, color, easedProgress } = anim;
    const offsetY = -30 * easedProgress;
    const opacity = 1 - Math.pow(anim.progress, 2);

    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(text, x, y + offsetY);
    ctx.shadowColor = 'transparent';
    ctx.globalAlpha = 1;
  }

  /**
   * Render notification
   */
  _renderNotification(ctx, anim) {
    const { x, y, text, easedProgress } = anim;
    const scaleVal = 0.5 + easedProgress * 0.5;
    const opacity = anim.progress < 0.7 ? 1 : (1 - anim.progress) / 0.3;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(x, y);
    ctx.scale(scaleVal, scaleVal);

    // Background pill
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    const textW = ctx.measureText(text).width + 30;
    ctx.beginPath();
    ctx.roundRect(-textW / 2, -18, textW, 36, 18);
    ctx.fill();

    // Text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 0);

    ctx.restore();
  }

  /**
   * Get tile placement animation state (if any)
   */
  getTilePlacementState() {
    const anim = this.animations.find(a => a.type === 'tilePlacement');
    if (!anim) return null;
    return {
      tileIndex: anim.tileIndex,
      fromX: anim.fromX,
      fromY: anim.fromY,
      progress: anim.easedProgress
    };
  }

  /**
   * Check if any animations are active
   */
  get isAnimating() {
    return this.animations.length > 0 || this.particles.length > 0;
  }

  /**
   * Clear all animations
   */
  clear() {
    this.animations = [];
    this.particles = [];
  }
}

export default AnimationManager;
