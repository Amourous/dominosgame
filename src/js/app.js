// App.js - Main application shell
import { GameEngine } from './game/GameEngine.js';
import { Player } from './game/Player.js';
import { BoardRenderer } from './renderer/BoardRenderer.js';
import { HandRenderer } from './renderer/HandRenderer.js';
import { AnimationManager } from './renderer/AnimationManager.js';
import { MainMenu } from './ui/MainMenu.js';
import { GameSetup } from './ui/GameSetup.js';
import { ScoreBoard } from './ui/ScoreBoard.js';
import { Settings } from './ui/Settings.js';
import { SoundManager } from './SoundManager.js';
import { t } from './utils/i18n.js';
import { setLanguage } from './utils/i18n.js';
import { GAME_STATE, DIRECTION, ANIM } from './utils/constants.js';

class App {
  constructor() {
    this.container = document.getElementById('app');
    this.currentScreen = null;
    this.engine = new GameEngine();
    this.boardRenderer = null;
    this.handRenderer = null;
    this.animManager = new AnimationManager();
    this.scoreBoard = new ScoreBoard(this.container);
    this.soundManager = new SoundManager();
    this.canvas = null;
    this.gameHUD = null;
    this.gameContainer = null;
    this.selectedTile = null;
    this.animFrameId = null;
    this.humanPlayerIndex = 0;

    this._lastGameConfig = null;

    // Load language preference
    const savedLang = localStorage.getItem('domino_lang') || 'en';
    setLanguage(savedLang);

    // Setup screens
    this.screens = {
      menu: new MainMenu(this.container, (screen, opts) => this.navigate(screen, opts)),
      setup: new GameSetup(this.container, (screen, opts) => this.navigate(screen, opts)),
      settings: new Settings(this.container, (screen, opts) => this.navigate(screen, opts))
    };

    this.navigate('menu');
  }

  navigate(screen, options = {}) {
    // Hide current screen
    if (this.currentScreen && this.screens[this.currentScreen]) {
      this.screens[this.currentScreen].hide();
    }

    // Clean up game if leaving game screen
    if (this.currentScreen === 'game' && screen !== 'game') {
      this._cleanupGame();
    }

    this.currentScreen = screen;

    switch (screen) {
      case 'menu':
        this.screens.menu.render();
        break;
      case 'setup':
        this.screens.setup.render(options);
        break;
      case 'settings':
        this.screens.settings.render();
        break;
      case 'game':
        this._startGame(options);
        break;
    }
  }

  _startGame(config) {
    this._lastGameConfig = config;

    // Create game container
    this.gameContainer = document.createElement('div');
    this.gameContainer.className = 'screen game-screen visible';
    this.gameContainer.innerHTML = `
      <canvas id="gameCanvas"></canvas>
      <div class="game-hud" id="gameHUD">
        <div class="hud-top">
          <div class="hud-round">
            <span class="hud-label">${t('round')}</span>
            <span class="hud-value" id="hudRound">1</span>
          </div>
          <div class="hud-target">
            <span class="hud-label">${t('scoreTarget')}</span>
            <span class="hud-value" id="hudTarget">${config.scoreTarget}</span>
          </div>
          <div class="hud-boneyard" id="hudBoneyard" style="display:none">
            <span class="hud-label">${t('boneyard')}</span>
            <span class="hud-value" id="hudBoneyardCount">0</span>
          </div>
        </div>
        <div class="hud-turn" id="hudTurn"></div>
        <div class="hud-actions" id="hudActions" style="display:none">
          <button class="action-btn knock-btn" id="btnKnock">🤚 ${t('knock')}</button>
          <button class="action-btn draw-btn" id="btnDraw" style="display:none">📥 ${t('draw')}</button>
        </div>
        <div class="hud-side-selector" id="hudSideSelector" style="display:none">
          <p>${t('selectSide')}</p>
          <div class="side-buttons">
            <button class="side-btn" id="btnPlayLeft">← ${t('player')} Left (${t('pips')}: <span id="leftEndValue">?</span>)</button>
            <button class="side-btn" id="btnPlayRight">${t('player')} Right (${t('pips')}: <span id="rightEndValue">?</span>) →</button>
          </div>
          <button class="cancel-btn" id="btnCancelSide">✕ Cancel</button>
        </div>
      </div>
      <button class="menu-exit-btn" id="btnExitGame">✕</button>
    `;

    this.container.appendChild(this.gameContainer);

    // Setup canvas
    this.canvas = document.getElementById('gameCanvas');
    this._resizeCanvas();
    window.addEventListener('resize', this._resizeCanvas.bind(this));

    this.boardRenderer = new BoardRenderer(this.canvas);
    this.handRenderer = new HandRenderer(this.canvas);

    // Create players from config
    const players = config.playerConfigs.map((pc) => {
      return new Player(pc.name, pc.type, pc.difficulty);
    });

    // Find human player
    this.humanPlayerIndex = players.findIndex(p => !p.isAI);
    if (this.humanPlayerIndex === -1) this.humanPlayerIndex = 0;

    // Bind engine events
    this._bindEngineEvents();

    // Bind UI interactions
    this._bindUIEvents();

    // Start the game engine
    this.engine.initMatch(players, config.mode, config.scoreTarget);

    // Start render loop
    this._startRenderLoop();
  }

  _resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  _bindEngineEvents() {
    this.engine.on('roundStarted', (data) => {
      this._updateHUD();
      this.handRenderer.reset();
      this.boardRenderer.resetView();
      this.soundManager.play('deal');

      // Show boneyard count for 2-player games
      const boneyardEl = document.getElementById('hudBoneyard');
      if (boneyardEl) {
        boneyardEl.style.display = this.engine.boneyard.length > 0 ? 'flex' : 'none';
      }
    });

    this.engine.on('turnChanged', (data) => {
      this._updateHUD();
      this.selectedTile = null;
      this.handRenderer.selectedTileIndex = -1;
      this._hideSideSelector();
    });

    this.engine.on('turnPlayed', (data) => {
      this._updateHUD();
      this.soundManager.play('place');
      this.boardRenderer.autoFit(this.engine.board);
    });

    this.engine.on('playerKnocked', (data) => {
      this.soundManager.play('knock');
      this.animManager.addKnockNotification(
        data.playerName + ' ' + t('knocked'),
        this.canvas.width / 2,
        this.canvas.height / 2
      );
    });

    this.engine.on('tileDrawn', (data) => {
      this._updateHUD();
      this.soundManager.play('draw');
    });

    this.engine.on('roundEnded', (result) => {
      this.soundManager.play('roundEnd');
      // Small delay then show scoreboard
      setTimeout(() => {
        this.scoreBoard.showRoundEnd(result, this.engine.players, this.engine.gameMode, (action) => {
          if (action === 'nextRound') {
            this.engine.startRound();
          }
        });
      }, 800);
    });

    this.engine.on('matchEnded', (result) => {
      this.soundManager.play('win');
      setTimeout(() => {
        this.scoreBoard.showMatchEnd(result, this.engine.players, this.engine.gameMode, (action) => {
          if (action === 'playAgain') {
            this._cleanupGame();
            this._startGame(this._lastGameConfig);
          } else if (action === 'mainMenu') {
            this.navigate('menu');
          }
        });
      }, 1000);
    });
  }

  _bindUIEvents() {
    // Canvas mouse move (hand hover)
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.engine.state !== GAME_STATE.PLAYING) return;
      if (this.engine.currentPlayer.isAI) return;

      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const tileIdx = this.handRenderer.hitTest(mouseX, mouseY);
      this.handRenderer.hoveredTileIndex = tileIdx;
      this.canvas.style.cursor = tileIdx >= 0 ? 'pointer' : 'default';
    });

    // Canvas click (tile selection)
    this.canvas.addEventListener('click', (e) => {
      if (this.engine.state !== GAME_STATE.PLAYING) return;
      const player = this.engine.currentPlayer;
      if (player.isAI) return;
      if (player.seatIndex !== this.engine.players[this.humanPlayerIndex]?.seatIndex) return;

      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const tileIdx = this.handRenderer.hitTest(mouseX, mouseY);
      if (tileIdx >= 0) {
        this._selectTile(tileIdx);
      }
    });

    // Knock button
    document.getElementById('btnKnock')?.addEventListener('click', () => {
      this.engine.knock();
    });

    // Draw button
    document.getElementById('btnDraw')?.addEventListener('click', () => {
      const drawn = this.engine.drawFromBoneyard();
      if (drawn) {
        // Check if can play now
        this._updateHUD();
      }
    });

    // Side selector buttons
    document.getElementById('btnPlayLeft')?.addEventListener('click', () => {
      if (this.selectedTile) {
        this.engine.playTile(this.selectedTile, DIRECTION.LEFT);
        this.selectedTile = null;
        this._hideSideSelector();
      }
    });

    document.getElementById('btnPlayRight')?.addEventListener('click', () => {
      if (this.selectedTile) {
        this.engine.playTile(this.selectedTile, DIRECTION.RIGHT);
        this.selectedTile = null;
        this._hideSideSelector();
      }
    });

    document.getElementById('btnCancelSide')?.addEventListener('click', () => {
      this.selectedTile = null;
      this.handRenderer.selectedTileIndex = -1;
      this._hideSideSelector();
    });

    // Exit game
    document.getElementById('btnExitGame')?.addEventListener('click', () => {
      this.navigate('menu');
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (this.currentScreen !== 'game') return;
      if (e.key === 'Escape') {
        if (this.selectedTile) {
          this.selectedTile = null;
          this.handRenderer.selectedTileIndex = -1;
          this._hideSideSelector();
        }
      }
      if (e.key === ' ') {
        // Space to knock
        this.engine.knock();
      }
    });
  }

  _selectTile(tileIndex) {
    const player = this.engine.currentPlayer;
    const tile = player.hand[tileIndex];
    if (!tile) return;

    const validDirs = this.engine.board.getValidPlacements(tile);
    if (validDirs.length === 0) {
      // Can't play this tile
      this.soundManager.play('invalid');
      return;
    }

    this.handRenderer.selectedTileIndex = tileIndex;

    if (validDirs.includes('first') || validDirs.length === 1) {
      // Only one option — play directly
      const dir = validDirs[0];
      this.selectedTile = null;
      this.handRenderer.selectedTileIndex = -1;
      this.engine.playTile(tile, dir);
    } else {
      // Two options — show side selector
      this.selectedTile = tile;
      this._showSideSelector();
    }
  }

  _showSideSelector() {
    const selector = document.getElementById('hudSideSelector');
    if (selector) {
      selector.style.display = 'block';
      document.getElementById('leftEndValue').textContent = this.engine.board.leftEnd;
      document.getElementById('rightEndValue').textContent = this.engine.board.rightEnd;
    }
  }

  _hideSideSelector() {
    const selector = document.getElementById('hudSideSelector');
    if (selector) selector.style.display = 'none';
  }

  _updateHUD() {
    const info = this.engine.getGameInfo();
    const player = this.engine.currentPlayer;
    const humanPlayer = this.engine.players[this.humanPlayerIndex];
    const isHumanTurn = this.engine.currentPlayerIndex === this.humanPlayerIndex;

    // Round
    const hudRound = document.getElementById('hudRound');
    if (hudRound) hudRound.textContent = info.roundNumber;

    // Turn indicator
    const hudTurn = document.getElementById('hudTurn');
    if (hudTurn) {
      if (isHumanTurn) {
        hudTurn.innerHTML = `<span class="your-turn-badge">🎯 ${t('yourTurn')}</span>`;
        hudTurn.className = 'hud-turn active';
      } else {
        hudTurn.innerHTML = `<span>${info.currentPlayerName}${t('turnOf')}</span>`;
        hudTurn.className = 'hud-turn';
      }
    }

    // Actions
    const actionsEl = document.getElementById('hudActions');
    if (actionsEl) {
      if (isHumanTurn && !this.engine.board.canAnyBePlayed(humanPlayer.hand)) {
        actionsEl.style.display = 'flex';

        const drawBtn = document.getElementById('btnDraw');
        const knockBtn = document.getElementById('btnKnock');

        if (this.engine.boneyard.length > 0 && this.engine.players.length === 2) {
          if (drawBtn) drawBtn.style.display = 'block';
          if (knockBtn) knockBtn.style.display = 'none';
        } else {
          if (drawBtn) drawBtn.style.display = 'none';
          if (knockBtn) knockBtn.style.display = 'block';
        }
      } else {
        actionsEl.style.display = 'none';
      }
    }

    // Boneyard
    const boneyardCount = document.getElementById('hudBoneyardCount');
    if (boneyardCount) boneyardCount.textContent = info.boneyardCount;
  }

  _startRenderLoop() {
    const render = () => {
      if (!this.canvas || this.currentScreen !== 'game') return;

      const ctx = this.canvas.getContext('2d');
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Render board
      const animState = this.animManager.getTilePlacementState();
      this.boardRenderer.render(this.engine.board, animState);

      // Render opponent hands
      const humanSeat = this.engine.players[this.humanPlayerIndex]?.seatIndex ?? 0;
      const opponentData = this.engine.players.map((p, i) => ({
        ...p,
        isCurrentTurn: i === this.engine.currentPlayerIndex
      }));
      this.handRenderer.renderOpponentHands(opponentData, humanSeat);

      // Render human hand
      const humanPlayer = this.engine.players[this.humanPlayerIndex];
      if (humanPlayer) {
        const isHumanTurn = this.engine.currentPlayerIndex === this.humanPlayerIndex;
        this.handRenderer.renderHumanHand(humanPlayer.hand, this.engine.board, isHumanTurn);
      }

      // Render animations
      this.animManager.update();
      this.animManager.render(ctx);

      this.animFrameId = requestAnimationFrame(render);
    };

    this.animFrameId = requestAnimationFrame(render);
  }

  _cleanupGame() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.gameContainer) {
      this.gameContainer.remove();
      this.gameContainer = null;
    }
    this.engine.destroy();
    this.engine = new GameEngine();
    this.animManager.clear();
    this.scoreBoard.destroy();
    this.scoreBoard = new ScoreBoard(this.container);
    this.canvas = null;
    this.selectedTile = null;
    window.removeEventListener('resize', this._resizeCanvas.bind(this));
  }
}

// Boot
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
