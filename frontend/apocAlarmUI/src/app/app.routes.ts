import { Routes } from '@angular/router';

// Importación de las pantallas principales (todas standalone)
import { LandingComponent } from './features/landing/landing.component';
import { ClientMenuComponent } from './features/landing/client-menu.component';
import { PnMenuComponent } from './features/alarm/pn-menu.component';
import { PnWizardComponent } from './features/alarm/pn-wizard.component';
import { ConsultaPnComponent } from './features/consulta/consulta-pn.component';
import { ExitoComponent } from './features/alarm/exito.component';

export const routes: Routes = [
  // Página inicial con el mega-menú
  { 
    path: '', 
    component: LandingComponent, 
    title: 'Inicio' 
  },

  // Nivel cliente / ramo → muestra Recepción PN / PJ
  { 
    path: 'cliente/:insurer/:ramo', 
    component: ClientMenuComponent, 
    title: 'Clientes y servicios' 
  },

  // Menú Persona Natural (Radica / Consulta)
  { 
    path: 'pn/menu/:ramo', 
    component: PnMenuComponent, 
    title: 'Radicación (PN)' 
  },

  // Asistente paso a paso de radicación PN
  { 
    path: 'pn/radica/:amparo', 
    component: PnWizardComponent, 
    title: 'Radicar (PN)' 
  },

  // Consulta de radicado PN
  { 
    path: 'pn/consulta', 
    component: ConsultaPnComponent, 
    title: 'Consulta (PN)' 
  },

  // Pantalla de éxito tras radicar
  { 
    path: 'exito/:docket', 
    component: ExitoComponent, 
    title: 'Radicación exitosa' 
  },

  // Cualquier ruta desconocida → redirige al inicio
  { 
    path: '**', 
    redirectTo: '', 
    pathMatch: 'full' 
  }
];
