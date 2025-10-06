import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MaintenanceService } from './maintenance.service';

@Injectable()
export class MaintenanceInterceptor implements HttpInterceptor {
  private maintenance = false;

  constructor(private router: Router, private maintenanceService: MaintenanceService,) {
    // Keep local copy of maintenance status updated
    this.maintenanceService.getStatus().subscribe(status => this.maintenance = status);
  }

  /**
  * Intercepts all outgoing HTTP requests.
  * - Allows MaintenanceStatus API without checks.
  * - For all other APIs, verifies system maintenance status.
  * - Redirects user to /maintenance if active.
  */

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Always allow MaintenanceStatus API to pass through
    if (req.url.includes('MaintenanceStatus')) {
      return next.handle(req);
    }

    // Check maintenance before continuing
    return this.maintenanceService.check().pipe(
      switchMap(status => {
        if (status) {
          // System under maintenance → redirect
          if (this.router.url !== '/maintenance') {
            this.router.navigate(['/maintenance']);
          }
          return throwError(() => new Error('System under maintenance'));
        }

        //  If not in maintenance, continue with request
        return next.handle(req);
      }),
      catchError(() => {
        // >>>  If maintenance check API fails, allow request to proceed
        return next.handle(req);
      })
    );
  }
}