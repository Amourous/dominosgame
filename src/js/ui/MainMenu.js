// MainMenu - the main menu screen
import { t } from '../utils/i18n.js';

export class MainMenu {
  constructor(container, onNavigate) {
    this.container = container;
    this.onNavigate = onNavigate;
    this.element = null;
  }

  render() {
    if (this.element) this.element.remove();

    this.element = document.createElement('div');
    this.element.className = 'screen main-menu';
    this.element.innerHTML = `
      <div class="menu-bg">
        <div class="menu-particles" id="menuParticles"></div>
      </div>
      <div class="menu-content">
        <div class="menu-logo">
          <div class="logo-icon">🁣</div>
          <h1 class="logo-title">${t('appTitle')}</h1>
          <p class="logo-subtitle">${t('appSubtitle')}</p>
        </div>
        <div class="menu-buttons">
          <button class="menu-btn primary" id="btnSingles">
            <span class="btn-icon">👤</span>
            <span class="btn-text">${t('playSingles')}</span>
            <span class="btn-arrow">→</span>
          </button>
          <button class="menu-btn secondary" id="btnTeams">
            <span class="btn-icon">👥</span>
            <span class="btn-text">${t('playTeams')}</span>
            <span class="btn-arrow">→</span>
          </button>
          <button class="menu-btn tertiary" id="btnSettings">
            <span class="btn-icon">⚙️</span>
            <span class="btn-text">${t('settings')}</span>
            <span class="btn-arrow">→</span>
          </button>
        </div>
        <div class="menu-footer">
          <span class="version">v1.0.0</span>
        </div>
      </div>
    `;

    this.container.appendChild(this.element);

    // Button events
    document.getElementById('btnSingles').addEventListener('click', () => {
      this.onNavigate('setup', { mode: 'singles' });
    });

    document.getElementById('btnTeams').addEventListener('click', () => {
      this.onNavigate('setup', { mode: 'teams' });
    });

    document.getElementById('btnSettings').addEventListener('click', () => {
      this.onNavigate('settings');
    });

    // Animate particles
    this._animateParticles();

    // Entrance animation
    requestAnimationFrame(() => {
      this.element.classList.add('visible');
    });
  }

  _animateParticles() {
    const container = document.getElementById('menuParticles');
    if (!container) return;

    const dominos = ['🁣', '🁤', '🁫', '🁥', '🁩', '🁪', '🁬'];
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.className = 'floating-domino';
      particle.textContent = dominos[Math.floor(Math.random() * dominos.length)];
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 20}s`;
      particle.style.animationDuration = `${15 + Math.random() * 20}s`;
      particle.style.fontSize = `${20 + Math.random() * 30}px`;
      particle.style.opacity = `${0.03 + Math.random() * 0.07}`;
      container.appendChild(particle);
    }
  }

  hide() {
    if (this.element) {
      this.element.classList.remove('visible');
      this.element.classList.add('exiting');
      setTimeout(() => {
        if (this.element) this.element.remove();
        this.element = null;
      }, 500);
    }
  }

  destroy() {
    if (this.element) this.element.remove();
    this.element = null;
  }
}

export default MainMenu;
