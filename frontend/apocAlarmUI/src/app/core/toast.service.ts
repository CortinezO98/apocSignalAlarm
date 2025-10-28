import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';
export interface Toast { id: number; msg: string; type: ToastType; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  toasts = signal<Toast[]>([]);

  show(msg: string, type: ToastType = 'info') {
    const t = { id: ++this.seq, msg, type };
    this.toasts.update(list => [...list, t]);
    setTimeout(() => this.dismiss(t.id), 4000);
  }

  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string) { this.show(msg, 'error'); }
  info(msg: string) { this.show(msg, 'info'); }

  dismiss(id: number) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
