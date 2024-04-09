import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptorService implements HttpInterceptor {
  constructor() {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    let request = req;

    const token = localStorage.getItem('token');
    if (token) {
      request = req.clone({
        setHeaders: {
          authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(request).pipe(
      catchError((error) => {
        return throwError(error);
        // console.log(error)
        // // If user hasn't got permissions, navigate to sign up page
        // if (error.status === 401) {
        //   this.router.navigate(['sign-up'])
        //   return of(error);
        // } else {
        //   return throwError(error);
        // }
      }),
    );
  }
}
