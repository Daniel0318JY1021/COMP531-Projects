import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../game.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent {
  boardStatus: string[] = ['', '', '',
                           '', '', '',
                           '', '', ''];

  constructor(private gameService: GameService) {}

  get headline(): string {
    return this.gameService.headline;
  }

  get playerTurn(): string {
    return this.gameService.playerTurn;
  }

  get winner(): boolean {
    return this.gameService.winner;
  }

  /**
   * Handle the user selecting a square to put an X or an O.
   * @param id  The square id
   */
  handleBtnClick(id: number): void {
    // select this square if available
    if (this.boardStatus[id] === '' && !this.gameService.winner) {
      this.gameService.makeMove(this.boardStatus, id);
    }
  }

  /**
   * Reset the game to play again.
   */
  resetGame(): void {
    this.boardStatus = ['', '', '', '', '', '', '', '', ''];
    this.gameService.resetGame();
  }

}
