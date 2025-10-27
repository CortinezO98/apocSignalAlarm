import { signal, computed, effect } from '@angular/core';
import { Alarm } from '../../models/alarm';

export class AlarmStore {
  alarmsSig = signal<Alarm[]>([]);
  unreadCountSig = computed(() => this.alarmsSig().filter(a => !a.acknowledged).length);
  highCountSig   = computed(() => this.alarmsSig().filter(a => a.severity === 'High').length);

  constructor() {
    effect(() => console.debug('Unread:', this.unreadCountSig()));
  }

  setAll(list: Alarm[]) { this.alarmsSig.set(list); }
  add(a: Alarm) { this.alarmsSig.update(curr => [a, ...curr]); }
  acknowledge(id: string) {
    this.alarmsSig.update(curr => curr.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  }
}
