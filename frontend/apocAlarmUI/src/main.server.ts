import { bootstrapApplication } from '@angular/platform-browser';
import type { ApplicationRef } from '@angular/core';
import { AppComponent } from './app/app';
import { appConfig } from './app/app.config.server';


export default function bootstrap(): Promise<ApplicationRef> {
  return bootstrapApplication(AppComponent, appConfig);
}
