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
  insurerKey = this.route.snapshot.paramMap.get('insurer')!;
  ramoKey    = this.route.snapshot.paramMap.get('ramo')!;
  data = CATALOG as any;
  insurer = this.data[this.insurerKey];
  ramo    = this.insurer?.ramos[this.ramoKey];
  constructor(private route:ActivatedRoute){}
}
