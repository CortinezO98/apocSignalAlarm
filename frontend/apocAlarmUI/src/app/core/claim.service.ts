import { Injectable, signal, computed, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({ providedIn: 'root' })
export class ClaimService {
  private hub?: signalR.HubConnection;
  private _status = signal<string>('OtpPending');
  private _docs = signal<Record<string, string>>({}); 
  status = computed(() => this._status());
  docs = computed(() => this._docs());

  private api = 'http://localhost:5080/api/claims';
  private hubUrl = 'http://localhost:5080/hubs/claim';

  async start(seed: any) {
    const r = await fetch(`${this.api}/start`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(seed) });
    const claim = await r.json();
    await this.connectHub(claim.id);
    return claim;
  }

  async validateOtp(id: string, code: string) {
    const r = await fetch(`${this.api}/${id}/otp`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(code) });
    if (!r.ok) throw new Error('OTP inválido');
  }

  async file(id: string) {
    const r = await fetch(`${this.api}/${id}/file`, { method:'POST' });
    return await r.text(); 
  }

  async upload(id: string, file: File, docType: string) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('docType', docType);
    await fetch(`${this.api}/${id}/docs`, { method:'POST', body: fd });
  }

  async connectHub(claimId: string) {
    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    this.hub.on('statusChanged', (p:any) => this._status.set(p.status));
    this.hub.on('docUploaded', (p:any) => {
      const d = {...this._docs()}; d[p.docId] = 'Uploaded'; this._docs.set(d);
    });
    this.hub.on('docValidated', (p:any) => {
      const d = {...this._docs()}; d[p.docId] = p.status; this._docs.set(d);
    });

    await this.hub.start();
    await this.hub.invoke('JoinClaim', claimId);
  }
}
