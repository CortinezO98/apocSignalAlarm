import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { PnWizardComponent } from './features/alarm/pn-wizard.component';
import { provideHttpClient } from '@angular/common/http';

export const routes: Routes = [
  { path: '', component: PnWizardComponent },
  { path: '**', redirectTo: '' }
];


