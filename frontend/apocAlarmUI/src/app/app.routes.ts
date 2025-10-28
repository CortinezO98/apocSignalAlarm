import { Routes } from '@angular/router';
import { PnWizardComponent } from './features/alarm/pn-wizard.component';

export const routes: Routes = [
  { path: '', component: PnWizardComponent },
  { path: '**', redirectTo: '' }
];
