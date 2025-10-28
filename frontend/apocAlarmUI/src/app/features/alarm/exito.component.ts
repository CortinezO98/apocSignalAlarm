import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector:'app-exito',
  standalone:true,
  templateUrl:'./exito.component.html',
  styleUrls:['./exito.component.scss']
})
export class ExitoComponent {
  docket = this.route.snapshot.paramMap.get('docket');
  constructor(private route:ActivatedRoute){}
}
