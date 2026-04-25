import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs';

export const responseTransformInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map((event) => {
      if (!(event instanceof HttpResponse)) return event;

      const body = event.body as any;
      // Se a resposta tem estrutura { success, data, ... }, extrai o data
      if (body?.success !== undefined && body?.data !== undefined) {
        return event.clone({ body: body.data });
      }

      return event;
    })
  );
};
