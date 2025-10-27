import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Alarm } from '../../models/alarm';

@Injectable({ providedIn: 'root' })
export class AlarmApi {
  constructor(private http: HttpClient) {}
  list() { return this.http.get<Alarm[]>('/api/alarms'); }
  ack(id: string) { return this.http.post<void>(`/api/alarms/${id}/ack`, {}); }
}
