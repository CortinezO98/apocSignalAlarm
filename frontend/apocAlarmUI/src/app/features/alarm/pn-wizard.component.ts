import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, JsonPipe } from '@angular/common';
import { ClaimService } from '../../core/claim.service';

@Component({
  selector: 'app-pn-wizard',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, JsonPipe],
  template: `
  <section class="container">
    <h2>Portal PN – Recepción & Seguimiento (demo)</h2>

    <nav class="tabs">
      <button [class.active]="tab() === 'wizard'" (click)="tab.set('wizard')">Nueva radicación</button>
      <button [class.active]="tab() === 'consulta'" (click)="tab.set('consulta')">Consulta por radicado</button>
    </nav>

    <div *ngIf="tab() === 'wizard'" class="panel">
      <div *ngIf="!claimId(); else proceso">
        <h3>1) Datos básicos</h3>
        <label>Documento reclamante</label>
        <input [(ngModel)]="claimant" placeholder="CC / Nro"/>

        <label>Documento víctima</label>
        <input [(ngModel)]="victim" placeholder="CC / Nro"/>

        <button (click)="start()" [disabled]="loading()">Iniciar (envía OTP simulado) </button>
      </div>

      <ng-template #proceso>
        <p class="status">Estado actual: <b>{{ status() }}</b> <span *ngIf="docket()">· Radicado: {{ docket() }}</span></p>

        <div *ngIf="status()==='OtpPending'" class="card">
          <h4>2) Validación OTP</h4>
          <p>Revisa la consola de la API para ver el código enviado (simulado).</p>
          <input [(ngModel)]="otp" placeholder="Código OTP"/>
          <button (click)="validate()" [disabled]="loading()">Validar OTP</button>
        </div>

        <div *ngIf="status()==='DocsValidating' || status()==='Filed'" class="card">
          <h4>3) Documentos</h4>
          <input type="file" (change)="pick($event)"/>
          <select [(ngModel)]="docType">
            <option value="Factura">Factura</option>
            <option value="HistoriaClinica">Historia clínica</option>
            <option value="Cedula">Cédula</option>
          </select>
          <button (click)="upload()" [disabled]="loading() || !file">Subir</button>
          <div class="docs">
            <div *ngFor="let item of docsList()">
              <span>{{ item.type }}</span>
              <span class="badge" [class.ok]="item.status==='Valid'">{{ item.status }}</span>
            </div>
          </div>
        </div>

        <div *ngIf="status()!=='Filed'" class="card">
          <h4>4) Radicar</h4>
          <button (click)="fileClaim()" [disabled]="loading()">Generar radicado</button>
        </div>
      </ng-template>

      <p *ngIf="error()" class="error">{{ error() }}</p>
    </div>

    <div *ngIf="tab() === 'consulta'" class="panel">
      <h3>Consulta</h3>
      <label>Doc reclamante</label>
      <input [(ngModel)]="qClaimant"/>
      <label>Doc víctima</label>
      <input [(ngModel)]="qVictim"/>
      <label>Radicado</label>
      <input [(ngModel)]="qDocket"/>
      <button (click)="consultar()">Buscar</button>

      <pre *ngIf="resultado() as r">{{ r | json }}</pre>
    </div>
  </section>
  `,
  styles: [`
    .container{ max-width: 920px; margin: 24px auto; padding: 12px; }
    .tabs{ display:flex; gap:8px; margin-bottom:12px; }
    .tabs button{ padding:8px 12px; border:1px solid #ccc; background:#f5f5f5; cursor:pointer; }
    .tabs .active{ background:white; border-bottom:2px solid #1976d2; }
    .panel{ border:1px solid #e0e0e0; padding:16px; border-radius:8px; background:white; }
    .card{ border:1px dashed #ddd; padding:12px; margin:12px 0; border-radius:8px; }
    .status{ background:#fafafa; padding:8px; border-radius:6px; }
    label{ display:block; margin-top:8px; font-size:.9rem; color:#333; }
    input, select{ display:block; width:100%; padding:8px; margin:4px 0 8px; }
    button{ padding:8px 12px; }
    .docs{ display:grid; grid-template-columns: 1fr auto; gap:6px; align-items:center; margin-top:8px; }
    .badge{ padding:2px 8px; border-radius:12px; background:#eee; }
    .badge.ok{ background:#c8f7c5; }
    .error{ color:#c62828; }
  `]
})
export class PnWizardComponent {
  constructor(private svc: ClaimService){ this.svc.restoreFromSession(); }

  // wizard
  claimant=''; victim=''; otp=''; docType='Factura'; file?: File;

  tab = signal<'wizard'|'consulta'>('wizard');

  // consulta
  qClaimant=''; qVictim=''; qDocket='';
  private _resultado = signal<any|null>(null);
  resultado = computed(()=>this._resultado());

  // bindings servicio
  claimId = this.svc.claimId;
  status  = this.svc.status;
  docket  = this.svc.docket;
  docs    = this.svc.docs;
  loading = this.svc.loading;
  error   = this.svc.error;

  docsList = computed(()=> Object.entries(this.docs()).map(([_,v]) => v));

  async start(){
    await this.svc.start({
      claimantDocNumber: this.claimant,
      victimDocNumber: this.victim,
      claimType: 'REEMBOLSO'
    });
  }
  async validate(){ await this.svc.validateOtp(this.otp); }
  pick(e:any){ const f:File = e.target.files?.[0]; if (f) this.file = f; }
  async upload(){ if(!this.file) return; await this.svc.upload(this.file, this.docType); this.file=undefined; }
  async fileClaim(){
    const docket = await this.svc.file();
    alert('Radicado: '+docket);
  }

  async consultar(){
    const r = await this.svc.find(this.qClaimant, this.qVictim, this.qDocket);
    this._resultado.set(r);
  }
}
