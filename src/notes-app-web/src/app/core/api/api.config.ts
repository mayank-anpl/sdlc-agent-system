import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { API_BASE_URL } from './api.tokens';
import { credentialsInterceptor } from './credentials.interceptor';
import { unauthorizedInterceptor } from './unauthorized.interceptor';

/**
 * Registers HttpClient for the Notes API with credentialed requests.
 * Inject API_BASE_URL when building request URLs in services.
 */
export function provideApiClient(apiBaseUrl: string): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: API_BASE_URL, useValue: apiBaseUrl.replace(/\/$/, '') },
    provideHttpClient(
      withInterceptors([credentialsInterceptor, unauthorizedInterceptor])
    ),
  ]);
}
