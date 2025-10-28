import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastService } from './toast.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        const msg = (err.error as any)?.title || err.message || 'Error en la comunicación';
        toast.error(msg);
      } else {
        toast.error('Error inesperado del cliente');
      }
      return throwError(() => err);
    })
  );
};
