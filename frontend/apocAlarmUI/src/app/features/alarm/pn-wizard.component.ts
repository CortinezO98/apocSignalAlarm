import { Component, signal, computed } from '@angular/core';
import { ClaimService } from '../../core/claim.service';

@Component({
  selector: 'app-pn-wizard',
  standalone: true,
  template: `
  <section class="p-4">
    <h2>Recepción PN (demo)</h2>

    <div *ngIf="!claimId()">
      <input class="input" placeholder="Doc reclamante" [(ngModel)]="claimant"/>
      <input class="input" placeholder="Doc víctima" [(ngModel)]="victim"/>
      <button (click)="start()">Iniciar (envía OTP simulado)</button>
    </div>

    <div *ngIf="claimId()">
      <p><b>Estado:</b> {{ status() }}</p>

      <div *ngIf="status()==='OtpPending'">
        <input class="input" placeholder="Código OTP" [(ngModel)]="otp"/>
        <button (click)="validate()">Validar OTP</button>
      </div>

      <div *ngIf="status()==='DocsValidating'">
        <input type="file" (change)="pick($event)"/>
        <button (click)="fileClaim()">Radicar</button>
      </div>

      <div>
        <h4>Documentos</h4>
        <pre>{{ docs() | json }}</pre>
      </div>
    </div>
  `,
  styles:[`.input{display:block;margin:6px 0;padding:6px}`]
})
export class PnWizardComponent {
  constructor(private svc: ClaimService) {}
  claimant = ''; victim = '';
  otp = '';
  private _claimId = signal<string|undefined>(undefined);
  claimId = computed(()=>this._claimId());
  status = this.svc.status;
  docs = this.svc.docs;

  async start(){
    const seed = {
      claimantDocNumber: this.claimant,
      victimDocNumber: this.victim,
      claimType: 'REEMBOLSO'
    };
    const c = await this.svc.start(seed);
    this._claimId.set(c.id);
  }
  async validate(){ await this.svc.validateOtp(this.claimId()!, this.otp); }
  async pick(e:any){
    const f:File = e.target.files[0]; if(!f) return;
    await this.svc.upload(this.claimId()!, f, 'Factura');
  }
  async fileClaim(){
    const docket = await this.svc.file(this.claimId()!);
    alert('Radicado: ' + docket);
  }
}
