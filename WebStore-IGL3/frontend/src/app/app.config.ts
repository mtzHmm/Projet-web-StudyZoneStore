import { InjectionToken } from '@angular/core';

export const APP_CONFIG = new InjectionToken('app.config');

export const appConfig = {
  apiUrl: 'http://localhost:8080/api/auth',
  // ...
};
