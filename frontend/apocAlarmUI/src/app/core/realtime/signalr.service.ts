import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as signalR from '@microsoft/signalr';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private hub?: signalR.HubConnection;
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async connect() {
    if (!this.isBrowser) return; 
    if (this.hub) return;

    this.hub = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/alarm', { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    await this.hub.start();
  }

  on<T>(event: string, handler: (p: T) => void) {
    this.hub?.on(event, handler as any);
  }

  invoke<T>(method: string, ...args: any[]): Promise<T> {
    if (!this.hub) return Promise.reject('Hub no conectado');
    return this.hub.invoke<T>(method, ...args);
  }
}
