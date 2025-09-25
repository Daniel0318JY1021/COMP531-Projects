import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  winner: boolean;
  headline: string;
  playerTurn: string;
  player1: string;
  player2: string;

  constructor() {
    this.winner = false;
    this.playerTurn = 'X';
    this.headline = 'Player\'s turn: ' + this.playerTurn;
    this.player1 = '';
    this.player2 = '';
  }

  /**
   * Determine if a player won the game.
   */
  wonGame(board: string[]): boolean {
    let winnerFound = false;
    const winCombos = [ [0, 1, 2], [0, 3, 6], [0, 4, 8],
      [1, 4, 7],
      [2, 5, 8], [2, 4, 6],
      [3, 4, 5],
      [6, 7, 8]];

    // loop through all the winning combinations
    winCombos.forEach(combo => {
      let win = true;
      // check if player made a move in each board location of the winning combination
      combo.forEach(pos =>  win = win && (board[pos] === this.playerTurn));
      if (win) {
        winnerFound = true;
      }
    });

    return winnerFound;
  }

  /**
   *  Alternate player turns.
   */
  nextPlayerTurn(): string {
    return (this.playerTurn === "X" ? "O" : "X");
  }

  /**
   * Make move on board at a given position.
   */
  makeMove(board: string[], pos: number): void {
    board[pos] = this.playerTurn;
    if (this.wonGame(board)) {
      this.winner = true;
      this.headline = "Player " + (this.playerTurn === "X" ? "X " + this.player1 : "O " + this.player2) + " won the game";
    } else if (board.every(square => square !== '')) {
      // Check for draw
      this.winner = true;
      this.headline = 'Draw!';
    } else {
      this.playerTurn = this.nextPlayerTurn();
      this.headline = 'Player\'s turn: ' + (this.playerTurn === "X" ? "X " + this.player1 : "O " + this.player2);
    }
  }

  /**
   * Register tictactoe board players.
   */
  registerPlayers(pName1: string, pName2: string): string {
    this.player1 = "(" + pName1 + ")";
    this.player2 = "(" + pName2 + ")";
    this.headline = 'Player\'s turn: ' + (this.playerTurn === "X" ? "X " + this.player1 : "O " + this.player2);
    return "Registered " + pName1 +  " and " + pName2;
  }

  /**
   * Reset the game to initial state.
   */
  resetGame(): void {
    this.winner = false;
    this.playerTurn = 'X';
    this.headline = 'Player\'s turn: ' + (this.playerTurn === "X" ? "X " + this.player1 : "O " + this.player2);
  }

}
