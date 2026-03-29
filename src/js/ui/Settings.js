// Settings screen
import { t, setLanguage, getLanguage } from '../utils/i18n.js';
import { LANGUAGES } from '../utils/constants.js';

export class Settings {
  constructor(container, onNavigate) {
    this.container = container;
    this.onNavigate = onNavigate;
    this.element = null;

    // Load settings from localStorage
    this.soundEnabled = localStorage.getItem('domino_sound') !== 'false';
    this.animationsEnabled = localStorage.getItem('domino_anims') !== 'false';
    this.currentLang = getLanguage();
  }

  render() {
    if (this.element) this.element.remove();

    this.element = document.createElement('div');
    this.element.className = 'screen settings-screen';
    this.element.innerHTML = `
      <div class="settings-content">
        <div class="setup-header">
          <button class="back-btn" id="settingsBackBtn">← ${t('back')}</button>
          <h2 class="setup-title">${t('settings')}</h2>
        </div>

        <div class="settings-group">
          <h3 class="section-title">${t('language')}</h3>
          <div class="language-selector">
            <button class="lang-btn ${this.currentLang === LANGUAGES.EN ? 'active' : ''}" data-lang="${LANGUAGES.EN}">
              ${t('english')}
            </button>
            <button class="lang-btn ${this.currentLang === LANGUAGES.AR ? 'active' : ''}" data-lang="${LANGUAGES.AR}">
              ${t('arabic')}
            </button>
            <button class="lang-btn ${this.currentLang === LANGUAGES.FRANCO ? 'active' : ''}" data-lang="${LANGUAGES.FRANCO}">
              ${t('franco_arabic')}
            </button>
          </div>
        </div>

        <div class="settings-group">
          <div class="setting-row">
            <span class="setting-label">${t('soundEffects')}</span>
            <button class="toggle-btn ${this.soundEnabled ? 'active' : ''}" id="toggleSound">
              ${this.soundEnabled ? t('on') : t('off')}
            </button>
          </div>
        </div>

        <div class="settings-group">
          <div class="setting-row">
            <span class="setting-label">${t('animations')}</span>
            <button class="toggle-btn ${this.animationsEnabled ? 'active' : ''}" id="toggleAnims">
              ${this.animationsEnabled ? t('on') : t('off')}
            </button>
          </div>
        </div>
      </div>
    `;

    this.container.appendChild(this.element);
    this._bindEvents();

    requestAnimationFrame(() => {
      this.element.classList.add('visible');
    });
  }

  _bindEvents() {
    document.getElementById('settingsBackBtn')?.addEventListener('click', () => {
      this.onNavigate('menu');
    });

    // Language buttons
    this.element.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentLang = btn.dataset.lang;
        setLanguage(this.currentLang);
        localStorage.setItem('domino_lang', this.currentLang);
        // Re-render to update all text
        this.render();
      });
    });

    // Sound toggle
    document.getElementById('toggleSound')?.addEventListener('click', () => {
      this.soundEnabled = !this.soundEnabled;
      localStorage.setItem('domino_sound', this.soundEnabled);
      this.render();
    });

    // Animations toggle
    document.getElementById('toggleAnims')?.addEventListener('click', () => {
      this.animationsEnabled = !this.animationsEnabled;
      localStorage.setItem('domino_anims', this.animationsEnabled);
      this.render();
    });
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

export default Settings;
