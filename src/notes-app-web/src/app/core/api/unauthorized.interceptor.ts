import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../auth/auth.service';

const PUBLIC_AUTH_PATHS = ['/api/auth/login', '/api/auth/register'];

export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status === 401 &&
        !PUBLIC_AUTH_PATHS.some((path) => req.url.includes(path))
      ) {
        auth.clearLocalSession();
      }
      return throwError(() => error);
    })
  );
};
