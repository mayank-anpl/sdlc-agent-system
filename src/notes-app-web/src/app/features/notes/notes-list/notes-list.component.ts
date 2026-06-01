import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { NoteListItem } from '../../../core/notes/notes.models';
import { NotesService } from '../../../core/notes/notes.service';
import { AppHeaderComponent } from '../../../shared/components/app-header/app-header.component';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [AppHeaderComponent, RouterLink, DatePipe],
  templateUrl: './notes-list.component.html',
  styleUrl: './notes-list.component.css',
})
export class NotesListComponent implements OnInit, OnDestroy {
  private readonly notesService = inject(NotesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  loading = true;
  loadError = '';
  notes: NoteListItem[] = [];
  showCreatedBanner = false;

  private bannerTimer: ReturnType<typeof setTimeout> | null = null;
  private querySub?: Subscription;

  ngOnInit(): void {
    this.querySub = this.route.queryParamMap.subscribe((params) => {
      if (params.get('created') === 'true') {
        this.showSuccessBanner();
        void this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { created: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
    });
    this.loadNotes();
  }

  ngOnDestroy(): void {
    this.querySub?.unsubscribe();
    this.clearBannerTimer();
  }

  loadNotes(): void {
    this.loading = true;
    this.loadError = '';
    this.notesService.getNotes().subscribe({
      next: (notes) => {
        this.notes = notes;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        if (err instanceof HttpErrorResponse && err.status === 401) {
          void this.router.navigate(['/login']);
          return;
        }
        this.loadError = 'Couldn’t load your notes. Please try again.';
      },
    });
  }

  dismissCreatedBanner(): void {
    this.showCreatedBanner = false;
    this.clearBannerTimer();
  }

  private showSuccessBanner(): void {
    this.showCreatedBanner = true;
    this.clearBannerTimer();
    this.bannerTimer = setTimeout(() => {
      this.showCreatedBanner = false;
      this.bannerTimer = null;
    }, 4000);
  }

  private clearBannerTimer(): void {
    if (this.bannerTimer !== null) {
      clearTimeout(this.bannerTimer);
      this.bannerTimer = null;
    }
  }
}
