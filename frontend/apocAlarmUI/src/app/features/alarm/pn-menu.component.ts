import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgFor } from '@angular/common';
import { CATALOG } from '../../core/catalog';
import { BreadcrumbsComponent } from '../../core/shared/breadcrumbs.component';

@Component({
  selector:'app-pn-menu',
  standalone:true,
  imports:[NgFor, RouterLink, BreadcrumbsComponent],
  templateUrl:'./pn-menu.component.html',
  styleUrls:['./pn-menu.component.scss']
})
export class PnMenuComponent {
  private route = inject(ActivatedRoute);
  ramoKey = this.route.snapshot.paramMap.get('ramo') as string;
  ramo = (CATALOG as any).mundial.ramos[this.ramoKey]; 
  amparos = Object.entries(this.ramo?.amparos ?? {});
  tab:'radica'|'consulta' = 'radica';
}
