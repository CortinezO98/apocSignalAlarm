import { Component } from '@angular/core';
import { ToastService } from '@/app/core/toast.service';
import { NgFor } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-toast-container',
  imports: [NgFor],
  template: `
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2">
    <div *ngFor="let t of toastSvc.toasts()" role="status" aria-live="polite"
         class="px-4 py-2 rounded text-white shadow text-sm"
         [class.bg-green-600]="t.type==='success'"
         [class.bg-red-600]="t.type==='error'"
         [class.bg-slate-700]="t.type==='info'">
      {{ t.msg }}
    </div>
  </div>
  `
})
export class ToastContainerComponent {
  constructor(public toastSvc: ToastService) {}
}
