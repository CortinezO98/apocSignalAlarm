import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileDropDirective } from '@/app/shared/directives/file-drop.directive';
import { ClaimService } from '@/app/core/claim.service';
import { ToastService } from '@/app/core/toast.service';

@Component({
  standalone: true,
  selector: 'app-uploader',
  imports: [CommonModule, FileDropDirective],
  template: `
  <div class="bg-white p-4 rounded-xl shadow">
    <h2 class="text-xl font-semibold mb-3">Subir documentos</h2>

    <div appFileDrop (files)="onDrop($event)"
         class="border-2 border-dashed rounded-xl p-8 text-center">
      Arrastra tus PDFs aquí o
      <label class="text-blue-600 underline cursor-pointer">
        búscalos
        <input type="file" accept="application/pdf" (change)="onPick($event)" multiple hidden>
      </label>
    </div>

    <ul class="mt-4 text-sm space-y-1">
      <li *ngFor="let up of uploads()">{{ up.name }} - {{ up.progress }}%</li>
    </ul>

    <div class="mt-6 flex justify-end gap-2">
      <button class="border px-4 py-2 rounded" (click)="file()">Finalizar</button>
    </div>
  </div>
  `
})
export class UploaderComponent {
  @Output() filed = new EventEmitter<string>();
  private svc = inject(ClaimService);
  private toast = inject(ToastService);
  uploads = signal<{ name: string; progress: number }[]>([]);

  onPick(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    if (files) this.handleFiles(files);
  }

  onDrop(files: FileList) { this.handleFiles(files); }

  handleFiles(files: FileList) {
    [...files].forEach(file => {
      if (!file.name.endsWith('.pdf')) { this.toast.error('Solo se permiten PDF'); return; }
      if (file.size > 10 * 1024 * 1024) { this.toast.error('Archivo >10 MB'); return; }

      const item = { name: file.name, progress: 0 };
      this.uploads.update(u => [...u, item]);

      this.svc.upload(file, 'GEN').subscribe(ev => {
        if (ev.type === 'progress') {
          item.progress = ev.progress;
          this.uploads.update(u => [...u]);
        } else if (ev.type === 'done') {
          item.progress = 100;
          this.uploads.update(u => [...u]);
        }
      });
    });
  }

  async file() {
    const docket = await this.svc.fileClaim();
    this.toast.success('Radicado correctamente');
    this.filed.emit(docket);
  }
}