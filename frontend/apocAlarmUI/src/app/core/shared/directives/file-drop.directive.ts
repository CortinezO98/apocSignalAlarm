import { Directive, EventEmitter, HostBinding, HostListener, Output } from '@angular/core';

@Directive({ selector: '[appFileDrop]', standalone: true })
export class FileDropDirective {
  @HostBinding('class.ring-2') hovering = false;
  @Output() files = new EventEmitter<FileList>();

  @HostListener('dragover', ['$event'])
  onOver(e: DragEvent) { e.preventDefault(); this.hovering = true; }

  @HostListener('dragleave')
  onLeave() { this.hovering = false; }

  @HostListener('drop', ['$event'])
  onDrop(e: DragEvent) {
    e.preventDefault(); this.hovering = false;
    if (e.dataTransfer?.files?.length) this.files.emit(e.dataTransfer.files);
  }
}