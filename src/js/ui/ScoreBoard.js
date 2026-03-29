// ScoreBoard - round end / match end overlay
import { t } from '../utils/i18n.js';
import { GAME_MODE } from '../utils/constants.js';

export class ScoreBoard {
  constructor(container) {
    this.container = container;
    this.element = null;
    this.onAction = null; // callback for button actions
  }

  /**
   * Show round-end results
   */
  showRoundEnd(result, players, gameMode, onAction) {
    this.onAction = onAction;
    if (this.element) this.element.remove();

    const isTeam = gameMode === GAME_MODE.TEAMS;
    const isTie = result.isTie;
    const isBlocked = result.isBlocked;

    let winnerText = '';
    if (isTie) {
      winnerText = t('tiedRound');
    } else if (isTeam) {
      winnerText = `${t('team')} ${result.winnerTeam + 1} ${t('wins')}`;
    } else {
      winnerText = `${result.winnerName} ${t('wins')}`;
    }

    this.element = document.createElement('div');
    this.element.className = 'screen scoreboard-overlay';
    this.element.innerHTML = `
      <div class="scoreboard-card">
        <div class="scoreboard-header">
          <h2>${t('roundWinner')}</h2>
          ${isBlocked ? '<span class="blocked-badge">🔒 ' + t('blocked') + '</span>' : ''}
        </div>
        
        <div class="winner-announcement ${isTie ? 'tie' : ''}">
          <span class="winner-icon">${isTie ? '🤝' : '🏆'}</span>
          <span class="winner-name">${winnerText}</span>
          ${!isTie ? `<span class="points-scored">+${result.points} ${t('pips')}</span>` : ''}
        </div>

        <div class="breakdown-table">
          <h3>${t('matchScores')}</h3>
          <table>
            <thead>
              <tr>
                <th>${t('player')}</th>
                ${isTeam ? `<th>${t('team')}</th>` : ''}
                <th>${t('pips')} Left</th>
                <th>${t('score')}</th>
              </tr>
            </thead>
            <tbody>
              ${players.map((p, i) => `
                <tr class="${result.winnerIndex === i ? 'winner-row' : ''}">
                  <td>${p.name}</td>
                  ${isTeam ? `<td><span class="team-badge team-${p.teamIndex}">${p.teamIndex + 1}</span></td>` : ''}
                  <td>${result.breakdown[i]?.pipsLeft ?? p.getPipCount()}</td>
                  <td class="score-cell">${p.matchScore}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <button class="start-btn" id="nextRoundBtn">
          ${t('nextRound')} →
        </button>
      </div>
    `;

    this.container.appendChild(this.element);

    document.getElementById('nextRoundBtn')?.addEventListener('click', () => {
      this.hide();
      if (this.onAction) this.onAction('nextRound');
    });

    requestAnimationFrame(() => {
      this.element.classList.add('visible');
    });
  }

  /**
   * Show match-end results
   */
  showMatchEnd(matchResult, players, gameMode, onAction) {
    this.onAction = onAction;
    if (this.element) this.element.remove();

    const isTeam = gameMode === GAME_MODE.TEAMS;
    let winnerText;

    if (isTeam) {
      winnerText = `${t('team')} ${matchResult.winnerTeam + 1}`;
    } else {
      winnerText = matchResult.winnerName;
    }

    this.element = document.createElement('div');
    this.element.className = 'screen scoreboard-overlay match-end';
    this.element.innerHTML = `
      <div class="scoreboard-card celebration">
        <div class="confetti-container" id="confettiContainer"></div>
        <div class="scoreboard-header">
          <h2>${t('matchWinner')}</h2>
        </div>

        <div class="match-winner-section">
          <span class="trophy">🏆</span>
          <h1 class="match-winner-name">${winnerText}</h1>
          <p class="congratulations">${t('congratulations')}</p>
          <p class="final-score-label">${t('finalScore')}: ${matchResult.score}</p>
        </div>

        <div class="breakdown-table">
          <table>
            <thead>
              <tr>
                <th>${t('player')}</th>
                ${isTeam ? `<th>${t('team')}</th>` : ''}
                <th>${t('score')}</th>
              </tr>
            </thead>
            <tbody>
              ${players.map(p => `
                <tr>
                  <td>${p.name}</td>
                  ${isTeam ? `<td><span class="team-badge team-${p.teamIndex}">${p.teamIndex + 1}</span></td>` : ''}
                  <td class="score-cell">${p.matchScore}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="match-end-buttons">
          <button class="start-btn" id="playAgainBtn">
            🔄 ${t('playAgain')}
          </button>
          <button class="menu-btn-small" id="mainMenuBtn">
            🏠 ${t('mainMenu')}
          </button>
        </div>
      </div>
    `;

    this.container.appendChild(this.element);

    document.getElementById('playAgainBtn')?.addEventListener('click', () => {
      this.hide();
      if (this.onAction) this.onAction('playAgain');
    });

    document.getElementById('mainMenuBtn')?.addEventListener('click', () => {
      this.hide();
      if (this.onAction) this.onAction('mainMenu');
    });

    requestAnimationFrame(() => {
      this.element.classList.add('visible');
      this._launchConfetti();
    });
  }

  _launchConfetti() {
    const container = document.getElementById('confettiContainer');
    if (!container) return;

    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96E6A1', '#DDA0DD', '#FF8C42'];

    for (let i = 0; i < 60; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = `${Math.random() * 2}s`;
      confetti.style.animationDuration = `${2 + Math.random() * 3}s`;
      confetti.style.width = `${5 + Math.random() * 10}px`;
      confetti.style.height = `${5 + Math.random() * 10}px`;
      container.appendChild(confetti);
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

export default ScoreBoard;
