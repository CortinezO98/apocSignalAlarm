import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { FormsModule } from '@angular/forms';               
import { ClaimService } from '../../core/claim.service';

@Component({
  selector: 'app-pn-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,                                             
  ],
  template: `
  <section class="container">
    <h2>Portal PN – Recepción & Seguimiento (demo)</h2>

    <nav class="tabs">
      <button [class.active]="tab() === 'wizard'" (click)="tab.set('wizard')">Nueva radicación</button>
      <button [class.active]="tab() === 'consulta'" (click)="tab.set('consulta')">Consulta por radicado</button>
    </nav>

    <!-- Paso de radicación -->
    <div *ngIf="tab() === 'wizard'" class="panel">
      <div *ngIf="!claimId(); else proceso">
        <h3>1) Datos básicos</h3>

        <form [formGroup]="claimForm" (ngSubmit)="start()" novalidate>
          <label for="claimantDoc">Documento reclamante</label>
          <input id="claimantDoc"
                 formControlName="claimantDoc"
                 aria-describedby="doc-help doc-error"
                 placeholder="CC / Nro" />
          <small id="doc-help">Ingresa el documento (6 a 12 dígitos).</small>
          <small id="doc-error"
                 *ngIf="claimForm.get('claimantDoc')?.invalid && claimForm.get('claimantDoc')?.touched"
                 role="alert"
                 class="error">
            Documento inválido.
          </small>

          <label for="victimDoc">Documento víctima</label>
          <input id="victimDoc"
                 formControlName="victimDoc"
                 aria-describedby="victim-help"
                 placeholder="CC / Nro" />
          <small id="victim-help">Opcional: documento de la víctima.</small>

          <label for="phone">Teléfono</label>
          <input id="phone"
                 formControlName="phone"
                 placeholder="10 dígitos" />

          <button type="submit" [disabled]="claimForm.invalid || loading()">Iniciar (envía OTP simulado)</button>
        </form>
      </div>

      <ng-template #proceso>
        <p class="status">
          Estado actual: <b>{{ status() }}</b>
          <span *ngIf="docket()">· Radicado: {{ docket() }}</span>
        </p>

        <!-- Validación OTP -->
        <div *ngIf="status()==='OtpPending'" class="card">
          <h4>2) Validación OTP</h4>
          <p>Revisa la consola de la API para ver el código enviado (simulado).</p>

          <form [formGroup]="otpForm" (ngSubmit)="validate()">
            <input formControlName="code"
                   placeholder="Código OTP"
                   aria-describedby="otp-help otp-error" />
            <small id="otp-help">Ingresa el código de 6 dígitos.</small>
            <small id="otp-error"
                   *ngIf="otpForm.get('code')?.invalid && otpForm.get('code')?.touched"
                   role="alert"
                   class="error">
              Código OTP inválido.
            </small>
            <button type="submit" [disabled]="otpForm.invalid || loading()">Validar OTP</button>
          </form>
        </div>

        <!-- Documentos -->
        <div *ngIf="status()==='DocsValidating' || status()==='Filed'" class="card">
          <h4>3) Documentos</h4>
          <input type="file" (change)="pick($event)" />
          <select [(ngModel)]="docType">        <!-- ✅ ya funciona ngModel -->
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

        <!-- Radicado -->
        <div *ngIf="status()!=='Filed'" class="card">
          <h4>4) Radicar</h4>
          <button (click)="fileClaim()" [disabled]="loading()">Generar radicado</button>
        </div>
      </ng-template>

      <p *ngIf="error()" class="error">{{ error() }}</p>
    </div>

    <!-- Consulta -->
    <div *ngIf="tab() === 'consulta'" class="panel">
      <h3>Consulta</h3>
      <label>Doc reclamante</label>
      <input [(ngModel)]="qClaimant" />
      <label>Doc víctima</label>
      <input [(ngModel)]="qVictim" />
      <label>Radicado</label>
      <input [(ngModel)]="qDocket" />
      <button (click)="consultar()">Buscar</button>

      <pre *ngIf="resultado() as r">{{ r | json }}</pre>
    </div>
  </section>
  `,
  styles: [`
    .container{ max-width:920px; margin:24px auto; padding:12px; }
    .tabs{ display:flex; gap:8px; margin-bottom:12px; }
    .tabs button{ padding:8px 12px; border:1px solid #ccc; background:#f5f5f5; cursor:pointer; }
    .tabs .active{ background:white; border-bottom:2px solid #1976d2; }
    .panel{ border:1px solid #e0e0e0; padding:16px; border-radius:8px; background:white; }
    .card{ border:1px dashed #ddd; padding:12px; margin:12px 0; border-radius:8px; }
    .status{ background:#fafafa; padding:8px; border-radius:6px; }
    label{ display:block; margin-top:8px; font-size:.9rem; color:#333; }
    input, select{ display:block; width:100%; padding:8px; margin:4px 0 8px; }
    button{ padding:8px 12px; }
    .docs{ display:grid; grid-template-columns:1fr auto; gap:6px; align-items:center; margin-top:8px; }
    .badge{ padding:2px 8px; border-radius:12px; background:#eee; }
    .badge.ok{ background:#c8f7c5; }
    .error{ color:#c62828; }
  `]
})
export class PnWizardComponent {

  tab = signal<'wizard' | 'consulta'>('wizard');

  claimForm!: FormGroup;        
  otpForm!: FormGroup;

  docType = 'Factura';
  file?: File;

  qClaimant = ''; qVictim = ''; qDocket = '';
  private _resultado = signal<any | null>(null);
  resultado = computed(() => this._resultado());

  constructor(private fb: FormBuilder, private svc: ClaimService) {
    this.svc.restoreFromSession();

    this.claimForm = this.fb.group({
      claimantDoc: ['', [Validators.required, Validators.pattern(/^\d{6,12}$/)]],
      victimDoc: ['', [Validators.pattern(/^\d{6,12}$/)]],
      phone: ['', [Validators.pattern(/^\d{10}$/)]],
    });

    this.otpForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });
  }

  // Getters reactivos
  get claimId() { return this.svc.claimId; }
  get status() { return this.svc.status; }
  get docket() { return this.svc.docket; }
  get docs() { return this.svc.docs; }
  get loading() { return this.svc.loading; }
  get error() { return this.svc.error; }

  docsList = computed(() => Object.entries(this.docs()).map(([_, v]) => v));

  async start() {
    if (this.claimForm.invalid) return;
    const dto = {
      claimantDocNumber: this.claimForm.value.claimantDoc,
      victimDocNumber: this.claimForm.value.victimDoc,
      claimType: 'REEMBOLSO'
    };
    await this.svc.start(dto);
  }

  async validate() {
    if (this.otpForm.invalid) return;
    await this.svc.validateOtp(this.otpForm.value.code);
  }

  pick(e: any) {
    const f: File = e.target.files?.[0];
    if (f) this.file = f;
  }

  async upload() {
    if (!this.file) return;
    await this.svc.upload(this.file, this.docType);
    this.file = undefined;
  }

  async fileClaim() {
    const docket = await this.svc.file();
    alert('Radicado: ' + docket);
  }

  async consultar() {
    const r = await this.svc.find(this.qClaimant, this.qVictim, this.qDocket);
    this._resultado.set(r);
  }
}
