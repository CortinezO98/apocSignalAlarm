import { Component, Input } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector:'app-breadcrumbs',
  standalone:true,
  imports:[RouterLink, NgFor],
  templateUrl:'./breadcrumbs.component.html',
  styleUrls:['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent{
  @Input() items:{label:string, url?:string}[] = [];
}
