import { Component, EventEmitter, Output, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ClaimService } from '@app/core/claim.service'; 
import { ClaimStore } from '@app/core/claim.store';
import { ToastService } from '@app/core/toast.service';

@Component({
  standalone: true,
  selector: 'app-otp-step',
  imports: [CommonModule, FormsModule], 
  template: `
  <div class="bg-white p-4 rounded-xl shadow">
    <h2 class="text-xl font-semibold mb-3">Verificación OTP</h2>

    <form (ngSubmit)="validate()" class="flex gap-2 items-center" aria-label="Formulario OTP">
      <input type="text"
             maxlength="6"
             [(ngModel)]="code"
             name="otp"
             inputmode="numeric"
             required
             class="border rounded px-3 py-2 w-40"
             [disabled]="locked() || expired()"
             autocomplete="one-time-code"
             aria-invalid="{{expired() || locked()}}">
      
      <button type="submit"
              class="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              [disabled]="locked() || expired()">Validar</button>

      <button type="button"
              class="border px-3 py-2 rounded"
              (click)="resend()"
              [disabled]="!canResend()">Reenviar ({{timer()}}s)</button>
    </form>

    <p class="mt-2 text-sm text-red-600" aria-live="polite">
      <span *ngIf="expired()">Código expirado. Reenvíalo.</span>
      <span *ngIf="locked()">Demasiados intentos. Intenta luego.</span>
    </p>
  </div>
  `
})
export class OtpStepComponent implements OnInit {
  @Output() validated = new EventEmitter<void>();
  @Output() resendEvt = new EventEmitter<void>();

  private svc = inject(ClaimService);
  private store = inject(ClaimStore);
  private toast = inject(ToastService);

  code = '';
  timer = signal(180);

  expired = computed(() => this.timer() <= 0);
  locked = computed(() => {
    const until = this.store.otpLockedUntil();
    return !!until && Date.now() < until;
  });
  canResend = computed(() => this.timer() <= 150);

  ngOnInit() {
    this.startTimer();
  }

  private startTimer() {
    const interval = setInterval(() => {
      const t = this.timer() - 1;
      this.timer.set(t);
      if (t <= 0) clearInterval(interval);
    }, 1000);
  }

  async validate() {
    try {
      await this.svc.validateOtp(this.code);
      this.toast.success('OTP verificado');
      this.validated.emit();
    } catch {
      this.toast.error('OTP inválido o expirado');
    }
  }

  resend() {
    this.resendEvt.emit();
    this.toast.info('Reenviando OTP…');
    this.timer.set(180);
    this.startTimer();
  }
}
