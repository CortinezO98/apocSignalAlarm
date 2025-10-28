import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export function isBrowser(): boolean {
  return isPlatformBrowser(inject(PLATFORM_ID));
}

export const safeStorage = {
  get(key: string): string | null {
    return isBrowser() ? window.sessionStorage.getItem(key) : null;
  },
  set(key: string, value: string) {
    if (isBrowser()) window.sessionStorage.setItem(key, value);
  },
  remove(key: string) {
    if (isBrowser()) window.sessionStorage.removeItem(key);
  }
};