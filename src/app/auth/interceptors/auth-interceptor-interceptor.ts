import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = sessionStorage.getItem('X-IAM-SESSION-ID');

    if (token) {
      const clonedReq = request.clone({
        setHeaders: {
          'X-IAM-SESSION-ID': token
        }
      });
      return next.handle(clonedReq);
    }

    return next.handle(request);
  }
}