import { HttpInterceptorFn } from '@angular/common/http';

/** Sends the API auth cookie on cross-origin requests (ADR-003). */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) =>
  next(req.clone({ withCredentials: true }));
