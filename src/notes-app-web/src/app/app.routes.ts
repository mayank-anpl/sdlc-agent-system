import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';
import { guestGuard } from './core/auth/guest.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { NoteCreateComponent } from './features/notes/note-create/note-create.component';
import { NotesListComponent } from './features/notes/notes-list/notes-list.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'signup',
    component: SignupComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'notes',
    component: NotesListComponent,
    canActivate: [authGuard],
  },
  {
    path: 'notes/new',
    component: NoteCreateComponent,
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'login' },
];
