import { Component, Input } from '@angular/core';
import { RouterLink, NgFor } from '@angular/common';

@Component({
  selector:'app-breadcrumbs',
  standalone:true,
  imports:[RouterLink, NgFor],
  templateUrl:'./breadcrumbs.component.html',
  styleUrls:['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent {
  @Input() items: {label:string, url?:string}[] = [];
}
