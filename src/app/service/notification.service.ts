import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StaffPostAuthService } from '../service/staff-post-auth.service';

@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    private priceRequestCountSource = new BehaviorSubject<number>(0);
    priceRequestCount$ = this.priceRequestCountSource.asObservable();

    constructor(private postAuthService: StaffPostAuthService) {}

    refreshPriceRequestCount(): void {
        const token = localStorage.getItem('us_token');
        if (!token) return; // 🚀 do nothing if not logged in

        this.postAuthService.getPendingPriceRequestCount().subscribe({
            next: (res: any) => {
                this.priceRequestCountSource.next(res?.count || 0);
            },
            error: () => {
                this.priceRequestCountSource.next(0);
            },
        });
    }
}
