import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ClaimStore {
  private _id = signal<string | undefined>(undefined);
  private _otpTries = signal(0);
  private _otpLockedUntil = signal<number | undefined>(undefined);

  id = computed(() => this._id());
  otpTries = computed(() => this._otpTries());
  otpLockedUntil = computed(() => this._otpLockedUntil());

  setId(id: string) { this._id.set(id); }
  incTry() { this._otpTries.update(x => x + 1); }
  lockUntil(ts: number) { this._otpLockedUntil.set(ts); }
  resetOtp() { this._otpTries.set(0); this._otpLockedUntil.set(undefined); }
}