import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { SafeUrlPipe } from './safe-url.pipe'; 

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [NgIf, SafeUrlPipe], 
  template: `<iframe *ngIf="src" [src]="src | safeUrl" title="PDF"
                     style="width:100%;height:70vh;border:0"></iframe>`,
})
export class PdfViewerComponent {
  @Input() src = '';
}
