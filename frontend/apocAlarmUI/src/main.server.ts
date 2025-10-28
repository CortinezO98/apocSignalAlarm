import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import type { ApplicationRef } from '@angular/core';
import { AppComponent } from './app/app';
import { appConfig } from './app/app.config.server';

export default function bootstrap(context: unknown): Promise<ApplicationRef> {
  return bootstrapApplication(AppComponent, appConfig, context as any);
}
