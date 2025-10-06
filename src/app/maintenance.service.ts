import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  private http: HttpClient;

  /** 
  * BehaviorSubject to store and broadcast maintenance state.
  * - true  → System under maintenance
  * - false → System running for normal system
  */

  private maintenance$ = new BehaviorSubject<boolean>(false);

  /** Backend API URL for maintenance status check */
  private apiUrl = `${environment.base_url}/Maintenance/MaintenanceStatus`;

  constructor(handler: HttpBackend) {
    this.http = new HttpClient(handler);
  }

  /**
 * Calls backend API to check current maintenance status.
 * Updates local BehaviorSubject and returns status as Observable<boolean>.
 */

  check(): Observable<boolean> {
    return this.http.get<{ maintenance: boolean }>(this.apiUrl).pipe(
      map(res => {
        this.maintenance$.next(res.maintenance);
        return res.maintenance;
      }),
      catchError(() => {
        this.maintenance$.next(false);
        return of(false);
      })
    );
  }


  /**
 * Provides observable of current maintenance state.
 * Useful for components/interceptors to reactively subscribe.
 */

  getStatus(): Observable<boolean> {
    return this.maintenance$.asObservable();
  }

}