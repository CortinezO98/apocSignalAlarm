import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';

export const config: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideZonelessChangeDetection()
  ]
};
