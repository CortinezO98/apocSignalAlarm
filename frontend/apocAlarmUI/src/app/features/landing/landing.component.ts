import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { CATALOG } from '../../core/catalog';
import { BreadcrumbsComponent } from '../../core/shared/breadcrumbs.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports:[NgFor, NgIf, RouterLink, BreadcrumbsComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  catalog = CATALOG;
  open1: string | null = null;
  open2: string | null = null;
  toggle1(k:string){ this.open1 = (this.open1===k? null:k); this.open2=null; }
  toggle2(k:string){ this.open2 = (this.open2===k? null:k); }
}
