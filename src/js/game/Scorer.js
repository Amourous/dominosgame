// Scorer - handles all scoring logic
import { GAME_MODE } from '../utils/constants.js';

export class Scorer {
  constructor(scoreTarget = 101) {
    this.scoreTarget = scoreTarget;
    this.roundHistory = [];
  }

  /**
   * Set score target
   */
  setTarget(target) {
    this.scoreTarget = target;
  }

  /**
   * Calculate round scores when a player goes out (empties hand)
   * Returns { winnerId, points, breakdown }
   */
  calculateWinByEmpty(players, winnerIndex, gameMode) {
    if (gameMode === GAME_MODE.TEAMS) {
      return this._calculateTeamScore(players, winnerIndex);
    }
    return this._calculateSinglesScore(players, winnerIndex);
  }

  /**
   * Calculate round scores when game is blocked
   * Returns { winnerId, points, breakdown } or { winnerId: -1 } for tie
   */
  calculateBlockedGame(players, gameMode) {
    if (gameMode === GAME_MODE.TEAMS) {
      return this._calculateBlockedTeams(players);
    }
    return this._calculateBlockedSingles(players);
  }

  /**
   * Singles: winner scores sum of all other players' pip counts
   */
  _calculateSinglesScore(players, winnerIndex) {
    const breakdown = players.map(p => ({
      name: p.name,
      pipsLeft: p.getPipCount()
    }));

    const points = players.reduce((sum, p, i) => {
      return i === winnerIndex ? sum : sum + p.getPipCount();
    }, 0);

    return {
      winnerIndex,
      winnerName: players[winnerIndex].name,
      points,
      breakdown
    };
  }

  /**
   * Teams: winning team scores sum of losing team's pip counts
   */
  _calculateTeamScore(players, winnerIndex) {
    const winnerTeam = players[winnerIndex].teamIndex;
    const breakdown = players.map(p => ({
      name: p.name,
      team: p.teamIndex,
      pipsLeft: p.getPipCount()
    }));

    let points = 0;
    players.forEach(p => {
      if (p.teamIndex !== winnerTeam) {
        points += p.getPipCount();
      }
    });

    return {
      winnerIndex,
      winnerTeam,
      winnerName: players[winnerIndex].name,
      points,
      breakdown,
      isTeamWin: true
    };
  }

  /**
   * Blocked game - singles: player with fewest pips wins
   */
  _calculateBlockedSingles(players) {
    let minPips = Infinity;
    let winnerIndex = -1;
    let tie = false;

    players.forEach((p, i) => {
      const pips = p.getPipCount();
      if (pips < minPips) {
        minPips = pips;
        winnerIndex = i;
        tie = false;
      } else if (pips === minPips) {
        tie = true;
      }
    });

    const breakdown = players.map(p => ({
      name: p.name,
      pipsLeft: p.getPipCount()
    }));

    if (tie) {
      // In Egyptian rules, tied blocked games: no one scores
      return { winnerIndex: -1, points: 0, breakdown, isTie: true };
    }

    // Winner scores sum of all other players' pips minus their own
    const points = players.reduce((sum, p, i) => {
      return i === winnerIndex ? sum : sum + p.getPipCount();
    }, 0) - minPips;

    return {
      winnerIndex,
      winnerName: players[winnerIndex].name,
      points: Math.max(0, points),
      breakdown,
      isBlocked: true
    };
  }

  /**
   * Blocked game - teams: team with fewer total pips wins
   */
  _calculateBlockedTeams(players) {
    const teamPips = [0, 0];
    players.forEach(p => {
      teamPips[p.teamIndex] += p.getPipCount();
    });

    const breakdown = players.map(p => ({
      name: p.name,
      team: p.teamIndex,
      pipsLeft: p.getPipCount()
    }));

    if (teamPips[0] === teamPips[1]) {
      return { winnerIndex: -1, winnerTeam: -1, points: 0, breakdown, isTie: true, isTeamWin: true };
    }

    const winnerTeam = teamPips[0] < teamPips[1] ? 0 : 1;
    const loserTeam = 1 - winnerTeam;

    // Find a player from the winning team to be "winnerIndex"
    const winnerIndex = players.findIndex(p => p.teamIndex === winnerTeam);

    return {
      winnerIndex,
      winnerTeam,
      winnerName: `Team ${winnerTeam + 1}`,
      points: teamPips[loserTeam] - teamPips[winnerTeam],
      breakdown,
      isBlocked: true,
      isTeamWin: true
    };
  }

  /**
   * Apply round score to players/teams
   */
  applyRoundScore(players, result, gameMode) {
    if (result.isTie || result.winnerIndex === -1) {
      // No score changes on tie
      this.roundHistory.push({ ...result, roundNumber: this.roundHistory.length + 1 });
      return;
    }

    if (gameMode === GAME_MODE.TEAMS) {
      players.forEach(p => {
        if (p.teamIndex === result.winnerTeam) {
          p.matchScore += result.points;
        }
      });
    } else {
      players[result.winnerIndex].matchScore += result.points;
    }

    this.roundHistory.push({ ...result, roundNumber: this.roundHistory.length + 1 });
  }

  /**
   * Check if any player/team has won the match
   * Returns the winning player index or -1
   */
  checkMatchWinner(players, gameMode) {
    if (gameMode === GAME_MODE.TEAMS) {
      // Check team scores
      const teamScores = [0, 0];
      players.forEach(p => {
        teamScores[p.teamIndex] = p.matchScore;
      });

      if (teamScores[0] >= this.scoreTarget) {
        return { winnerTeam: 0, score: teamScores[0] };
      }
      if (teamScores[1] >= this.scoreTarget) {
        return { winnerTeam: 1, score: teamScores[1] };
      }
      return null;
    }

    // Singles
    for (let i = 0; i < players.length; i++) {
      if (players[i].matchScore >= this.scoreTarget) {
        return { winnerIndex: i, winnerName: players[i].name, score: players[i].matchScore };
      }
    }
    return null;
  }

  /**
   * Reset for new match
   */
  reset() {
    this.roundHistory = [];
  }
}

export default Scorer;
