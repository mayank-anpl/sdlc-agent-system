import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';

import { API_BASE_URL } from '../api/api.tokens';
import { ErrorResponse, LoginRequest, RegisterRequest, User } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();

  register(request: RegisterRequest): Observable<User> {
    return this.http
      .post<User>(`${this.apiBaseUrl}/api/auth/register`, request)
      .pipe(tap((user) => this.currentUserSubject.next(user)));
  }

  login(request: LoginRequest): Observable<User> {
    return this.http
      .post<User>(`${this.apiBaseUrl}/api/auth/login`, request)
      .pipe(tap((user) => this.currentUserSubject.next(user)));
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiBaseUrl}/api/auth/logout`, {}).pipe(
      tap(() => this.clearLocalSession()),
      catchError(() => {
        this.clearLocalSession();
        return of(undefined);
      })
    );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiBaseUrl}/api/auth/me`).pipe(
      tap((user) => this.currentUserSubject.next(user))
    );
  }

  /** Returns true if the session cookie is valid. */
  ensureAuthenticated(): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map(() => true),
      catchError(() => {
        this.clearLocalSession();
        return of(false);
      })
    );
  }

  clearLocalSession(): void {
    this.currentUserSubject.next(null);
  }

  static extractErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as ErrorResponse | undefined;
      if (body?.error) {
        return body.error;
      }
    }
    return fallback;
  }
}
