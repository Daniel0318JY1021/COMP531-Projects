import { GameService } from "../game.service";
import { Router } from "@angular/router";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { Component } from '@angular/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  playerForm: FormGroup;
  titleText: string;

  constructor(private gServ: GameService, private router: Router) {
    this.playerForm = new FormGroup({
      uname1: new FormControl(''),
      uname2: new FormControl('')
    });
    this.titleText = "Game Registration";
  }

  onSubmit() {
    const firstPlayer = this.playerForm.get('username1')?.value || 'Frist Player';
    const secondPlayer = this.playerForm.get('username2')?.value || 'Second Player';

    this.gServ.registerPlayers(firstPlayer, secondPlayer);
    this.router.navigate(['/board']);
  }
}
