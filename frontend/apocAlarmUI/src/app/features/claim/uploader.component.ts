import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileDropDirective } from '@/app/core/shared/directives/file-drop.directive';
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

  onDrop(files: FileList) {
    this.handleFiles(files);
  }

  async handleFiles(files: FileList) {
    for (const file of Array.from(files)) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        this.toast.error('Solo se permiten PDF');
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        this.toast.error('Archivo >10 MB');
        continue;
      }

      const item = { name: file.name, progress: 0 };
      this.uploads.update(u => [...u, item]);

      try {
        await this.svc.upload(file, 'GEN'); 
        item.progress = 100;
        this.uploads.update(u => [...u]);
      } catch {
        this.toast.error('Error subiendo documento');
      }
    }
  }


  async file() {
    try {
      const docket = await this.svc.file(); 
      this.toast.success('Radicado correctamente');
      this.filed.emit(docket);
    } catch {
      this.toast.error('Error al radicar la reclamación');
    }
  }
}
