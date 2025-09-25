import { Routes } from '@angular/router';
import { BoardComponent } from './board/board.component';
import { RegisterComponent } from './register/register.component';

export const routes: Routes = [
  { path: 'board', component: BoardComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: '/register', pathMatch: 'full' }
];
