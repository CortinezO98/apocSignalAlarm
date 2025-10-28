import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ClaimStore {
  // Señales privadas con tipos explícitos 
  private _id = signal<string | undefined>(undefined);
  private _otpTries = signal<number>(0);
  private _otpLockedUntil = signal<number | undefined>(undefined);
  id = computed<string | undefined>(() => this._id());
  otpTries = computed<number>(() => this._otpTries());
  otpLockedUntil = computed<number | undefined>(() => this._otpLockedUntil());

  // Métodos de actualización 
  setId(id: string) {
    this._id.set(id);
  }

  incTry() {
    this._otpTries.update(x => x + 1);
  }

  lockUntil(ts: number) {
    this._otpLockedUntil.set(ts);
  }

  resetOtp() {
    this._otpTries.set(0);
    this._otpLockedUntil.set(undefined);
  }
}
