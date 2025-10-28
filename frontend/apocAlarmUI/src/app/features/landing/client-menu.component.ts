import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { CATALOG } from '../../core/catalog';
import { BreadcrumbsComponent } from '../../core/shared/breadcrumbs.component';

@Component({
  selector: 'app-client-menu',
  standalone: true,
  imports:[NgIf, NgFor, RouterLink, BreadcrumbsComponent],
  templateUrl:'./client-menu.component.html',
  styleUrls:['./client-menu.component.scss']
})
export class ClientMenuComponent {
  private route = new ActivatedRoute(); 
  insurerKey = (this.route.snapshot.paramMap.get('insurer') ?? '') as string;
  ramoKey    = (this.route.snapshot.paramMap.get('ramo') ?? '') as string;


  data:any = CATALOG;
  insurer = this.data[this.insurerKey];
  ramo    = this.insurer?.ramos?.[this.ramoKey];

  constructor(route: ActivatedRoute) { this.route = route; }
}
