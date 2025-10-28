import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector:'app-exito',
  standalone:true,
  templateUrl:'./exito.component.html',
  styleUrls:['./exito.component.scss']
})
export class ExitoComponent {
  private route = inject(ActivatedRoute);
  docket = this.route.snapshot.paramMap.get('docket') ?? '';
}
