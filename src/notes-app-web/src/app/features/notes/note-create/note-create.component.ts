import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { NoteValidationErrors } from '../../../core/notes/notes.models';
import { NotesService } from '../../../core/notes/notes.service';
import { AppHeaderComponent } from '../../../shared/components/app-header/app-header.component';
import {
  validateNoteBody,
  validateNoteTitle,
} from '../../../shared/utils/note-validation';

@Component({
  selector: 'app-note-create',
  standalone: true,
  imports: [AppHeaderComponent, FormsModule, RouterLink],
  templateUrl: './note-create.component.html',
  styleUrl: './note-create.component.css',
})
export class NoteCreateComponent {
  private readonly notes = inject(NotesService);
  private readonly router = inject(Router);

  title = '';
  body = '';
  loading = false;
  bannerError = '';
  titleError = '';
  bodyError = '';

  submit(): void {
    this.bannerError = '';
    this.titleError = validateNoteTitle(this.title) ?? '';
    this.bodyError = validateNoteBody(this.body) ?? '';

    if (this.titleError || this.bodyError) {
      return;
    }

    this.loading = true;
    this.notes
      .createNote({ title: this.title.trim(), body: this.body.trim() })
      .subscribe({
        next: () => {
          this.loading = false;
          void this.router.navigate(['/notes'], {
            queryParams: { created: 'true' },
          });
        },
        error: (err) => this.handleError(err),
      });
  }

  private handleError(err: unknown): void {
    this.loading = false;

    if (err instanceof HttpErrorResponse) {
      if (err.status === 401) {
        this.bannerError = 'Your session has expired. Please log in again.';
        void this.router.navigate(['/login']);
        return;
      }

      const body = err.error as NoteValidationErrors | undefined;
      if (err.status === 400 && body?.errors) {
        this.titleError = body.errors['title'] ?? '';
        this.bodyError = body.errors['body'] ?? '';
        if (!this.titleError && !this.bodyError) {
          this.bannerError = 'Couldn’t save your note. Please try again.';
        }
        return;
      }
    }

    this.bannerError = 'Couldn’t save your note. Please try again.';
  }
}
