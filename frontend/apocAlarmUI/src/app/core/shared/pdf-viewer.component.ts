import { Component, Input } from '@angular/core';

@Component({
  selector:'app-pdf-viewer',
  standalone:true,
  template:`<iframe *ngIf="src" [src]="src | safeUrl" title="PDF" style="width:100%;height:70vh;border:0"></iframe>`,
})
export class PdfViewerComponent { @Input() src = ''; }
