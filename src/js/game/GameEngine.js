// GameEngine - core game loop, rules, turn management
import { GAME_STATE, GAME_MODE, TILES_PER_PLAYER, ANIM } from '../utils/constants.js';
import { shuffle, delay, EventEmitter } from '../utils/helpers.js';
import { Tile } from './Tile.js';
import { Board } from './Board.js';
import { Scorer } from './Scorer.js';
import { AIPlayer } from './AIPlayer.js';

export class GameEngine extends EventEmitter {
  constructor() {
    super();
    this.state = GAME_STATE.MENU;
    this.gameMode = GAME_MODE.SINGLES;
    this.players = [];
    this.board = new Board();
    this.scorer = new Scorer();
    this.boneyard = [];
    this.currentPlayerIndex = 0;
    this.roundNumber = 0;
    this.firstRound = true;
    this.turnHistory = [];
    this._aiPaused = false;
  }

  /**
   * Initialize a new match
   */
  initMatch(players, gameMode, scoreTarget) {
    this.players = players;
    this.gameMode = gameMode;
    this.scorer.setTarget(scoreTarget);
    this.scorer.reset();
    this.roundNumber = 0;
    this.firstRound = true;
    this.turnHistory = [];

    // Assign team indices for teams mode
    if (gameMode === GAME_MODE.TEAMS) {
      // Players 0,2 = Team 0; Players 1,3 = Team 1
      players.forEach((p, i) => {
        p.teamIndex = i % 2;
      });
    }

    // Assign seat positions
    players.forEach((p, i) => {
      p.seatIndex = i;
    });

    // Reset match scores
    players.forEach(p => p.resetMatch());

    this.emit('matchStarted', { gameMode, scoreTarget, players });
    this.startRound();
  }

  /**
   * Start a new round
   */
  startRound() {
    this.roundNumber++;
    this.board.reset();
    this.boneyard = [];
    this.turnHistory = [];

    // Reset player hands
    this.players.forEach(p => p.resetHand());

    // Generate and deal tiles
    const playerCount = this.players.length;
    let tiles;
    if (playerCount === 3) {
      tiles = Tile.generateSetForThree(); // 27 tiles, 0/0 removed
    } else {
      tiles = Tile.generateSet(); // 28 tiles
    }
    shuffle(tiles);

    const tilesPerPlayer = TILES_PER_PLAYER[playerCount];

    // Deal tiles
    this.players.forEach((player, i) => {
      const dealt = tiles.splice(0, tilesPerPlayer);
      player.addTiles(dealt);
    });

    // Remaining tiles go to boneyard (only for 2 players)
    this.boneyard = tiles;

    // Determine who starts
    this.currentPlayerIndex = this._determineStarter();

    this.state = GAME_STATE.PLAYING;
    this.emit('roundStarted', {
      roundNumber: this.roundNumber,
      starterIndex: this.currentPlayerIndex,
      starterName: this.players[this.currentPlayerIndex].name,
      boneyardCount: this.boneyard.length
    });

    // If first player is AI, trigger their turn
    this._checkAITurn();
  }

  /**
   * Determine who starts the round
   */
  _determineStarter() {
    if (this.firstRound) {
      this.firstRound = false;

      // Find player with highest double
      let highestDouble = null;
      let starterIndex = 0;

      this.players.forEach((player, i) => {
        const hd = player.getHighestDouble();
        if (hd && (!highestDouble || hd.pipCount > highestDouble.pipCount)) {
          highestDouble = hd;
          starterIndex = i;
        }
      });

      return starterIndex;
    }

    // Subsequent rounds: winner of last round starts
    const lastRound = this.scorer.roundHistory[this.scorer.roundHistory.length - 1];
    if (lastRound && lastRound.winnerIndex >= 0) {
      return lastRound.winnerIndex;
    }

    // If tied, same starter
    return this.currentPlayerIndex;
  }

  /**
   * Get the current player
   */
  get currentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  /**
   * Human player plays a tile
   */
  playTile(tile, direction) {
    if (this.state !== GAME_STATE.PLAYING) return false;

    const player = this.currentPlayer;
    if (player.isAI) return false;

    // Validate the play
    const validDirs = this.board.getValidPlacements(tile);
    if (!validDirs.includes(direction) && direction !== 'first') return false;

    return this._executeTurn(tile, direction);
  }

  /**
   * Human player draws from boneyard (2-player only)
   */
  drawFromBoneyard() {
    if (this.boneyard.length === 0) return null;
    if (this.state !== GAME_STATE.PLAYING) return null;

    const player = this.currentPlayer;
    if (player.isAI) return null;

    // Can only draw if you can't play
    if (this.board.canAnyBePlayed(player.hand)) return null;

    const tile = this.boneyard.pop();
    player.hand.push(tile);

    this.emit('tileDrawn', {
      playerIndex: this.currentPlayerIndex,
      playerName: player.name,
      tile: player.isAI ? null : tile,
      boneyardCount: this.boneyard.length
    });

    return tile;
  }

  /**
   * Human player knocks (passes)
   */
  knock() {
    if (this.state !== GAME_STATE.PLAYING) return false;

    const player = this.currentPlayer;
    if (player.isAI) return false;

    // In 2-player mode, must draw from boneyard first if available
    if (this.players.length === 2 && this.boneyard.length > 0) {
      return false; // Must draw instead
    }

    // Can only knock if you can't play
    if (this.board.canAnyBePlayed(player.hand)) return false;

    return this._executeKnock();
  }

  /**
   * Execute a tile placement
   */
  _executeTurn(tile, direction) {
    const player = this.currentPlayer;

    // Place on board
    const entry = this.board.place(tile, direction);

    // Remove from hand
    player.removeTile(tile);
    player.hasKnocked = false;
    player.consecutiveKnocks = 0;

    this.turnHistory.push({
      type: 'play',
      playerIndex: this.currentPlayerIndex,
      playerName: player.name,
      tile: tile,
      direction: direction
    });

    this.emit('turnPlayed', {
      playerIndex: this.currentPlayerIndex,
      playerName: player.name,
      tile,
      direction,
      entry,
      handCount: player.hand.length
    });

    // Check if player won the round
    if (player.handEmpty) {
      this._endRound(this.currentPlayerIndex);
      return true;
    }

    // Advance to next player
    this._nextTurn();
    return true;
  }

  /**
   * Execute a knock/pass
   */
  _executeKnock() {
    const player = this.currentPlayer;
    player.hasKnocked = true;
    player.consecutiveKnocks++;

    this.turnHistory.push({
      type: 'knock',
      playerIndex: this.currentPlayerIndex,
      playerName: player.name
    });

    this.emit('playerKnocked', {
      playerIndex: this.currentPlayerIndex,
      playerName: player.name
    });

    // Check if game is blocked (all players have knocked consecutively)
    if (this._isGameBlocked()) {
      this._endRoundBlocked();
      return true;
    }

    this._nextTurn();
    return true;
  }

  /**
   * Check if game is fully blocked
   */
  _isGameBlocked() {
    // Game is blocked when no player can play
    return this.players.every(p => !this.board.canAnyBePlayed(p.hand));
  }

  /**
   * Advance to the next player's turn
   */
  _nextTurn() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    this.emit('turnChanged', {
      playerIndex: this.currentPlayerIndex,
      playerName: this.currentPlayer.name,
      isAI: this.currentPlayer.isAI
    });

    // Trigger AI turn if needed
    this._checkAITurn();
  }

  /**
   * If current player is AI, execute their turn after a delay
   */
  async _checkAITurn() {
    const player = this.currentPlayer;
    if (!player.isAI || this.state !== GAME_STATE.PLAYING) return;
    if (this._aiPaused) return;

    // Add thinking delay for realism
    await delay(ANIM.AI_THINK);

    if (this.state !== GAME_STATE.PLAYING) return;

    // AI draw from boneyard if can't play (2-player mode)
    if (!this.board.canAnyBePlayed(player.hand)) {
      if (this.players.length === 2 && this.boneyard.length > 0) {
        while (this.boneyard.length > 0 && !this.board.canAnyBePlayed(player.hand)) {
          const tile = this.boneyard.pop();
          player.hand.push(tile);
          this.emit('tileDrawn', {
            playerIndex: this.currentPlayerIndex,
            playerName: player.name,
            tile: null, // Don't reveal AI's drawn tile
            boneyardCount: this.boneyard.length
          });
          await delay(300);
        }
      }

      // Still can't play? Knock
      if (!this.board.canAnyBePlayed(player.hand)) {
        this._executeKnock();
        return;
      }
    }

    // Choose and play
    const move = AIPlayer.chooseMove(player, this.board, this.players);
    if (move) {
      this._executeTurn(move.tile, move.direction);
    } else {
      this._executeKnock();
    }
  }

  /**
   * End round - a player went out
   */
  _endRound(winnerIndex) {
    this.state = GAME_STATE.ROUND_END;
    const result = this.scorer.calculateWinByEmpty(this.players, winnerIndex, this.gameMode);
    this.scorer.applyRoundScore(this.players, result, this.gameMode);

    this.emit('roundEnded', {
      ...result,
      roundNumber: this.roundNumber,
      isBlocked: false
    });

    this._checkMatchEnd();
  }

  /**
   * End round - game blocked
   */
  _endRoundBlocked() {
    this.state = GAME_STATE.ROUND_END;
    const result = this.scorer.calculateBlockedGame(this.players, this.gameMode);
    this.scorer.applyRoundScore(this.players, result, this.gameMode);

    this.emit('roundEnded', {
      ...result,
      roundNumber: this.roundNumber,
      isBlocked: true
    });

    this._checkMatchEnd();
  }

  /**
   * Check if match is over
   */
  _checkMatchEnd() {
    const winner = this.scorer.checkMatchWinner(this.players, this.gameMode);
    if (winner) {
      this.state = GAME_STATE.MATCH_END;
      this.emit('matchEnded', winner);
    }
  }

  /**
   * Get current game info for UI
   */
  getGameInfo() {
    return {
      state: this.state,
      gameMode: this.gameMode,
      roundNumber: this.roundNumber,
      currentPlayerIndex: this.currentPlayerIndex,
      currentPlayerName: this.currentPlayer?.name,
      players: this.players.map((p, i) => ({
        name: p.name,
        tileCount: p.hand.length,
        matchScore: p.matchScore,
        teamIndex: p.teamIndex,
        isAI: p.isAI,
        isCurrentTurn: i === this.currentPlayerIndex,
        hasKnocked: p.hasKnocked
      })),
      boneyardCount: this.boneyard.length,
      boardLength: this.board.length,
      leftEnd: this.board.leftEnd,
      rightEnd: this.board.rightEnd,
      scoreTarget: this.scorer.scoreTarget
    };
  }

  /**
   * Pause/resume AI
   */
  pauseAI() { this._aiPaused = true; }
  resumeAI() {
    this._aiPaused = false;
    this._checkAITurn();
  }

  /**
   * Destroy
   */
  destroy() {
    this.removeAllListeners();
    this.board.removeAllListeners();
  }
}

export default GameEngine;
