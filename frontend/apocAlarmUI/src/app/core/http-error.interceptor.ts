import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastService } from './toast.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).catch(err => {
    if (err instanceof HttpErrorResponse) {
      const msg = err.error?.title || err.message || 'Error en la comunicación';
      toast.error(msg);
    } else {
      toast.error('Error inesperado del cliente');
    }
    throw err;
  });
};
