import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { ClaimService } from '../../core/claim.service';

@Component({
  selector:'app-consulta-pn',
  standalone:true,
  imports:[ReactiveFormsModule, NgIf],
  templateUrl:'./consulta-pn.component.html',
  styleUrls:['./consulta-pn.component.scss']
})
export class ConsultaPnComponent {
  constructor(private fb:FormBuilder, private svc:ClaimService){}
  f = this.fb.group({
    claimant:['',[Validators.maxLength(15)]],
    victim:['',[Validators.maxLength(15)]],
    docket:['',[Validators.maxLength(32)]],
  });
  resultado:any = null; error = '';
  async consultar(){
    const { claimant, victim, docket } = this.f.value;
    if(!claimant && !victim && !docket){ this.error='Campos obligatorios'; this.resultado=null; return; }
    this.error='';
    const r = await this.svc.find(claimant||'', victim||'', docket||'');
    this.resultado = r || null;
    if(!r) this.error = 'Con las llaves de consulta realizadas no se encuentra coincidencias de una reclamación presentada.';
  }
}
