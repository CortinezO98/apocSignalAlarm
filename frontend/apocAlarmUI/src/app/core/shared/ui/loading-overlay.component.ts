
import { Component, computed } from '@angular/core';
import { loadingState } from '@/app/core/loading.interceptor';
import { NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-loading-overlay',
  imports: [NgIf],
  template: `
  <div *ngIf="busy()" class="fixed inset-0 bg-black/20 z-40 flex items-center justify-center"
       aria-live="polite" role="status">
    <div class="bg-white p-4 rounded-lg shadow">Cargando…</div>
  </div>
  `
})
export class LoadingOverlayComponent {
  busy = computed(() => loadingState() > 0);
}
