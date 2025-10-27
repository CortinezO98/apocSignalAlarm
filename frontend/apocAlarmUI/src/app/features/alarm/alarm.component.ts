import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Alarm } from '../../models/alarm';
import { AlarmStore } from './alarm.store';
import { AlarmApi } from '../../core/api/alarm.api';
import { SignalRService } from '../../core/realtime/signalr.service';

@Component({
  selector: 'app-alarm',
  standalone: true,
  imports: [CommonModule],
  template: `
  <section class="container">
    <header class="toolbar">
      <h2>Signal Alarm</h2>
      <div class="badges">
        <span>Sin leer: {{ store.unreadCountSig() }}</span>
        <span>High: {{ store.highCountSig() }}</span>
      </div>
    </header>
    <ul class="list">
      <li *ngFor="let a of store.alarmsSig()"
          [class.ack]="a.acknowledged"
          [class.high]="a.severity==='High'">
        <div class="row">
          <div>
            <strong>{{ a.title }}</strong>
            <small>{{ a.createdAt | date:'short' }}</small>
            <p>{{ a.description }}</p>
          </div>
          <div class="actions">
            <button (click)="ack(a)" [disabled]="a.acknowledged">Reconocer</button>
          </div>
        </div>
      </li>
    </ul>
  </section>
  `,
  styles: [`
    .container{ padding:1rem; }
    .toolbar{ display:flex; justify-content:space-between; align-items:center; }
    .badges span{ margin-left:.75rem; font-weight:600; }
    .list{ list-style:none; padding:0; }
    .row{ display:flex; justify-content:space-between; align-items:center; gap:1rem; }
    li{ border:1px solid #ddd; padding:.75rem; border-radius:.5rem; margin:.5rem 0; }
    li.ack{ opacity:.6; }
    li.high{ border-color:#c00; box-shadow: 0 0 0 2px rgba(204,0,0,.1); }
  `]
})
export default class AlarmComponent implements OnInit {
  private api = inject(AlarmApi);
  private rt  = inject(SignalRService);
  store = new AlarmStore();

  async ngOnInit() {

    this.api.list().subscribe(list => this.store.setAll(list));

    await this.rt.connect();

    this.rt.on<any>('alarmCreated', (p) => {
      const a: Alarm = {
        id: p.id, title: p.title, description: p.description,
        severity: p.severity, createdAt: p.createdAt, acknowledged: p.acknowledged
      };
      this.store.add(a);
    });
    this.rt.on<string>('alarmAcknowledged', (id) => this.store.acknowledge(id));
  }

  ack(a: Alarm) {
    this.api.ack(a.id).subscribe(() => this.store.acknowledge(a.id));
  }
}
