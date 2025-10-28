import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgFor } from '@angular/common';
import { CATALOG } from '../../core/catalog';
import { BreadcrumbsComponent } from '../../shared/breadcrumbs.component';

@Component({
  selector:'app-pn-menu',
  standalone:true,
  imports:[NgFor, RouterLink, BreadcrumbsComponent],
  templateUrl:'./pn-menu.component.html',
  styleUrls:['./pn-menu.component.scss']
})
export class PnMenuComponent {
  ramoKey = this.route.snapshot.paramMap.get('ramo') as any;
  ramo = (CATALOG.mundial.ramos as any)[this.ramoKey]; // MVP sobre Mundial
  amparos = Object.entries(this.ramo.amparos);
  tab:'radica'|'consulta' = 'radica';
  constructor(private route:ActivatedRoute){}
}
