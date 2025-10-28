import { Injectable, signal, computed } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';

type DocsMap = Record<string, { type: string; status: string }>;

@Injectable({ providedIn: 'root' })
export class ClaimService {
  private hub?: signalR.HubConnection;

  // estado principal
  private _claimId = signal<string | null>(null);
  private _status  = signal<string>('OtpPending');
  private _docket  = signal<string | null>(null);
  private _docs    = signal<DocsMap>({});
  private _loading = signal<boolean>(false);
  private _error   = signal<string | null>(null);

  claimId = computed(() => this._claimId());
  status  = computed(() => this._status());
  docket  = computed(() => this._docket());
  docs    = computed(() => this._docs());
  loading = computed(() => this._loading());
  error   = computed(() => this._error());

  //#region API
  private api(url: string) { return `${environment.apiBase}${url}`; }

  async start(seed: any) {
    this._loading.set(true); this._error.set(null);
    try {
      const r = await fetch(this.api('/api/claims/start'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(seed)
      });
      if (!r.ok) throw new Error(await r.text());
      const claim = await r.json();
      this._claimId.set(claim.id);
      this._status.set(claim.status ?? 'OtpPending');
      await this.connectHub(claim.id);
      return claim;
    } catch (e:any) {
      this._error.set(e.message ?? 'Error iniciando reclamación');
      throw e;
    } finally { this._loading.set(false); }
  }

  async validateOtp(code: string) {
    const id = this._claimId(); if (!id) throw new Error('Sin claim');
    this._loading.set(true); this._error.set(null);
    try {
      const r = await fetch(this.api(`/api/claims/${id}/otp`), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(code)
      });
      if (!r.ok) throw new Error(await r.text());
    } catch (e:any) {
      this._error.set(e.message ?? 'OTP inválido'); throw e;
    } finally { this._loading.set(false); }
  }

  async upload(file: File, docType: string) {
    const id = this._claimId(); if (!id) throw new Error('Sin claim');
    const fd = new FormData(); fd.append('file', file); fd.append('docType', docType);
    this._loading.set(true); this._error.set(null);
    try {
      const r = await fetch(this.api(`/api/claims/${id}/docs`), { method: 'POST', body: fd });
      if (!r.ok) throw new Error(await r.text());
    } catch (e:any) {
      this._error.set(e.message ?? 'Error subiendo documento'); throw e;
    } finally { this._loading.set(false); }
  }

  async file() {
    const id = this._claimId(); if (!id) throw new Error('Sin claim');
    this._loading.set(true); this._error.set(null);
    try {
      const r = await fetch(this.api(`/api/claims/${id}/file`), { method: 'POST' });
      if (!r.ok) throw new Error(await r.text());
      const docket = await r.text();
      this._docket.set(docket);
      return docket;
    } catch (e:any) {
      this._error.set(e.message ?? 'Error generando radicado'); throw e;
    } finally { this._loading.set(false); }
  }

  async find(claimantDoc: string, victimDoc: string, docket: string) {
    const url = this.api(`/api/claims/find?claimantDoc=${encodeURIComponent(claimantDoc)}&victimDoc=${encodeURIComponent(victimDoc)}&docket=${encodeURIComponent(docket)}`);
    const r = await fetch(url);
    if (!r.ok) return null;
    return await r.json();
  }
  //#endregion

  //#region SignalR
  private async connectHub(claimId: string) {
    if (this.hub) { try { await this.hub.stop(); } catch {} }
    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(environment.hubUrl, { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    this.hub.on('statusChanged', (p:any) => {
      if (p.claimId !== claimId) return;
      this._status.set(p.status);
      if (p.docket) this._docket.set(p.docket);
    });
    this.hub.on('docUploaded', (p:any) => {
      if (p.claimId !== claimId) return;
      const d = { ...this._docs() };
      d[p.docId] = { type: p.docType, status: 'Uploaded' };
      this._docs.set(d);
    });
    this.hub.on('docValidated', (p:any) => {
      if (p.claimId !== claimId) return;
      const d = { ...this._docs() };
      d[p.docId] = { ...(d[p.docId] ?? { type: 'Desconocido' }), status: p.status };
      this._docs.set(d);
    });

    await this.hub.start();
    await this.hub.invoke('JoinClaim', claimId);
    sessionStorage.setItem('claimId', claimId);
  }

  restoreFromSession() {
    const id = sessionStorage.getItem('claimId');
    if (id) this.connectHub(id).then(() => this._claimId.set(id));
  }

}
