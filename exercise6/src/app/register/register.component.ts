import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../game.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(private gameService: GameService, private router: Router) {
    this.registerForm = new FormGroup({
      player1: new FormControl(''),
      player2: new FormControl('')
    });
  }

  onSubmit(): void {
    const player1Name = this.registerForm.get('player1')?.value;
    const player2Name = this.registerForm.get('player2')?.value;
    
    this.gameService.registerPlayers(player1Name, player2Name);
    this.router.navigate(['/board']);
  }
}
