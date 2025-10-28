import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { ClientMenuComponent } from './features/landing/client-menu.component';
import { PnMenuComponent } from './features/alarm/pn-menu.component';
import { PnWizardComponent } from './features/alarm/pn-wizard.component';
import { ConsultaPnComponent } from './features/consulta/consulta-pn.component';
import { ExitoComponent } from './features/alarm/exito.component';

export const routes: Routes = [
  { path: '', component: LandingComponent, title: 'Inicio' },
  { path: 'cliente/:insurer/:ramo', component: ClientMenuComponent, title: 'Clientes y servicios' },
  { path: 'pn/menu/:ramo', component: PnMenuComponent, title: 'Radicación (PN)' },
  { path: 'pn/radica/:amparo', component: PnWizardComponent, title: 'Radicar (PN)' },
  { path: 'pn/consulta', component: ConsultaPnComponent, title: 'Consulta (PN)' },
  { path: 'exito/:docket', component: ExitoComponent, title: 'Radicación exitosa' },
  { path: '**', redirectTo: '' }
];
