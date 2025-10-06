import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { MaintenanceService } from './maintenance.service';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceGuard implements CanActivate {

  constructor(private router: Router, private maintenanceService: MaintenanceService,) { }

  /**
 * Route guard that checks system maintenance status
 * before allowing route activation.
  
 * - If in maintenance → redirects to /maintenance.
 * - If not in maintenance → allows navigation.
 * - On API error → allows navigation (fail safe).
 */

  canActivate(
  ): Observable<boolean | UrlTree> {
    return this.maintenanceService.check().pipe(
      map(status => {
        if (status) {
          return this.router.createUrlTree(['/maintenance']);//  Redirect if maintenance
        }
        return true;    // Allow normal
      }),
      catchError(() => of(true))  //  If API fails, allow navigation
    );
  }

}