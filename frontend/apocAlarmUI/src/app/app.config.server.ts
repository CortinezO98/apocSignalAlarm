import { ApplicationConfig } from '@angular/core';
import { appConfig as browserConfig } from './app.config';
import { provideServerRendering } from '@angular/platform-server';

export const appConfig: ApplicationConfig = {
  ...browserConfig,
  providers: [
    ...(browserConfig.providers ?? []),
    provideServerRendering(), 
  ],
};
