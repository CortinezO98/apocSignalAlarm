import { HttpInterceptorFn } from '@angular/common/http';
import { signal } from '@angular/core';

export const loadingState = signal(0);

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  loadingState.update(v => v + 1);
  return next(req).finally(() => loadingState.update(v => Math.max(0, v - 1)));
};
