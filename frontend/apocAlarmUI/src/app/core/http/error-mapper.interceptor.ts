import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
export const errorMapperInterceptor: HttpInterceptorFn = (req, next) => next(req).pipe(
  tap({ error: (e) => {
    const err = e as HttpErrorResponse;
    let msg = 'Ocurrió un error, intenta de nuevo.';
    if (err.status === 400 && err.error?.code === 'OTP_INVALID') msg = 'El código OTP es inválido.';
    if (err.status === 413) msg = 'El archivo excede el tamaño permitido (10MB).';
  }})
);