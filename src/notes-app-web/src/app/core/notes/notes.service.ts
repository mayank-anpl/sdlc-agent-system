import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api/api.tokens';
import { CreateNoteRequest, NoteCreated, NoteListItem } from './notes.models';

@Injectable({ providedIn: 'root' })
export class NotesService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  getNotes(): Observable<NoteListItem[]> {
    return this.http.get<NoteListItem[]>(`${this.apiBaseUrl}/api/notes`);
  }

  createNote(request: CreateNoteRequest): Observable<NoteCreated> {
    return this.http.post<NoteCreated>(`${this.apiBaseUrl}/api/notes`, request);
  }
}
