// GameSetup - player configuration screen
import { t } from '../utils/i18n.js';
import { GAME_MODE, PLAYER_TYPE, AI_DIFFICULTY, SCORE_TARGETS } from '../utils/constants.js';

export class GameSetup {
  constructor(container, onNavigate) {
    this.container = container;
    this.onNavigate = onNavigate;
    this.element = null;
    this.mode = GAME_MODE.SINGLES;
    this.playerCount = 2;
    this.scoreTarget = 101;
    this.customScore = 101;

    this.playerConfigs = [];
  }

  render(options = {}) {
    this.mode = options.mode || GAME_MODE.SINGLES;
    this.playerCount = this.mode === GAME_MODE.TEAMS ? 4 : 2;

    this._initPlayerConfigs();

    if (this.element) this.element.remove();

    this.element = document.createElement('div');
    this.element.className = 'screen game-setup';
    this._buildHTML();
    this.container.appendChild(this.element);

    this._bindEvents();

    requestAnimationFrame(() => {
      this.element.classList.add('visible');
    });
  }

  _initPlayerConfigs() {
    this.playerConfigs = [];
    const count = this.mode === GAME_MODE.TEAMS ? 4 : this.playerCount;

    for (let i = 0; i < count; i++) {
      this.playerConfigs.push({
        name: i === 0 ? 'You' : `${t('computer')} ${i}`,
        type: i === 0 ? PLAYER_TYPE.HUMAN : PLAYER_TYPE.AI,
        difficulty: AI_DIFFICULTY.MEDIUM,
        team: this.mode === GAME_MODE.TEAMS ? i % 2 : -1
      });
    }
  }

  _buildHTML() {
    const isTeams = this.mode === GAME_MODE.TEAMS;

    let playerCountSelector = '';
    if (!isTeams) {
      playerCountSelector = `
        <div class="setup-section">
          <h3 class="section-title">${t('numberOfPlayers')}</h3>
          <div class="player-count-selector">
            ${[2, 3, 4].map(n => `
              <button class="count-btn ${n === this.playerCount ? 'active' : ''}" data-count="${n}">
                ${n}
              </button>
            `).join('')}
          </div>
          ${this.playerCount === 3 ? '<p class="rule-note">📋 0|0 tile will be removed</p>' : ''}
        </div>
      `;
    }

    let playersSection = `<div class="setup-section"><h3 class="section-title">${isTeams ? 'Teams' : t('player')+'s'}</h3><div class="players-list" id="playersList">`;

    this.playerConfigs.forEach((config, i) => {
      const teamLabel = isTeams ? `<span class="team-badge team-${config.team}">${t('team')} ${config.team + 1}</span>` : '';

      playersSection += `
        <div class="player-config ${i === 0 ? 'human-player' : ''}" data-index="${i}">
          ${teamLabel}
          <div class="player-row">
            <input type="text" class="player-name-input" value="${config.name}" 
                   data-index="${i}" placeholder="${t('playerName')}" 
                   ${i === 0 ? 'autofocus' : ''}>
            <select class="player-type-select" data-index="${i}">
              <option value="${PLAYER_TYPE.HUMAN}" ${config.type === PLAYER_TYPE.HUMAN ? 'selected' : ''}>${t('human')}</option>
              <option value="${PLAYER_TYPE.AI}" ${config.type === PLAYER_TYPE.AI ? 'selected' : ''}>${t('computer')}</option>
            </select>
          </div>
          ${config.type === PLAYER_TYPE.AI ? `
            <div class="ai-difficulty-row" data-index="${i}">
              <label>${t('aiDifficulty')}:</label>
              <div class="difficulty-selector">
                ${Object.values(AI_DIFFICULTY).map(d => `
                  <button class="diff-btn ${d === config.difficulty ? 'active' : ''}" 
                          data-index="${i}" data-difficulty="${d}">
                    ${t(d)}
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    });
    playersSection += '</div></div>';

    // Score target
    const scoreSection = `
      <div class="setup-section">
        <h3 class="section-title">${t('scoreTarget')}</h3>
        <div class="score-targets">
          ${SCORE_TARGETS.map(s => `
            <button class="score-btn ${s === this.scoreTarget ? 'active' : ''}" data-score="${s}">
              ${s}
            </button>
          `).join('')}
          <button class="score-btn ${!SCORE_TARGETS.includes(this.scoreTarget) ? 'active' : ''}" data-score="custom">
            ${t('customScore')}
          </button>
        </div>
        <div class="custom-score-row ${SCORE_TARGETS.includes(this.scoreTarget) ? 'hidden' : ''}" id="customScoreRow">
          <input type="number" id="customScoreInput" class="custom-score-input" 
                 value="${this.customScore}" min="50" max="9999" step="10">
        </div>
      </div>
    `;

    this.element.innerHTML = `
      <div class="setup-content">
        <div class="setup-header">
          <button class="back-btn" id="setupBackBtn">← ${t('back')}</button>
          <h2 class="setup-title">${t('gameSetup')} — ${isTeams ? t('playTeams') : t('playSingles')}</h2>
        </div>
        ${playerCountSelector}
        ${playersSection}
        ${scoreSection}
        <button class="start-btn" id="startGameBtn">
          <span>🎮</span> ${t('startGame')}
        </button>
      </div>
    `;
  }

  _bindEvents() {
    // Back button
    document.getElementById('setupBackBtn')?.addEventListener('click', () => {
      this.onNavigate('menu');
    });

    // Player count buttons
    this.element.querySelectorAll('.count-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.playerCount = parseInt(btn.dataset.count);
        this._initPlayerConfigs();
        this._buildHTML();
        this._bindEvents();
      });
    });

    // Player name inputs
    this.element.querySelectorAll('.player-name-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index);
        this.playerConfigs[idx].name = e.target.value;
      });
    });

    // Player type selects
    this.element.querySelectorAll('.player-type-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.index);
        this.playerConfigs[idx].type = e.target.value;
        this._buildHTML();
        this._bindEvents();
      });
    });

    // Difficulty buttons
    this.element.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        this.playerConfigs[idx].difficulty = btn.dataset.difficulty;
        this._buildHTML();
        this._bindEvents();
      });
    });

    // Score target buttons
    this.element.querySelectorAll('.score-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const score = btn.dataset.score;
        if (score === 'custom') {
          this.scoreTarget = this.customScore;
          document.getElementById('customScoreRow')?.classList.remove('hidden');
        } else {
          this.scoreTarget = parseInt(score);
          document.getElementById('customScoreRow')?.classList.add('hidden');
        }
        this._buildHTML();
        this._bindEvents();
      });
    });

    // Custom score input
    document.getElementById('customScoreInput')?.addEventListener('input', (e) => {
      this.customScore = parseInt(e.target.value) || 101;
      this.scoreTarget = this.customScore;
    });

    // Start game
    document.getElementById('startGameBtn')?.addEventListener('click', () => {
      // Validate
      const hasHuman = this.playerConfigs.some(p => p.type === PLAYER_TYPE.HUMAN);
      if (!hasHuman) {
        // At least one player should ideally be human, but allow all-AI for watching
      }

      this.onNavigate('game', {
        mode: this.mode,
        playerConfigs: this.playerConfigs,
        scoreTarget: this.scoreTarget
      });
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

export default GameSetup;
