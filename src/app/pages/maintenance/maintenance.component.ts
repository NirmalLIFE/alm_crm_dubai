import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-maintenance',
    templateUrl: './maintenance.component.html',
    styleUrls: ['./maintenance.component.css'],
})
export class MaintenanceComponent implements OnInit {
    /**
     * Flag that determines if the system is currently in maintenance mode.
     * When `true`, the user should remain on the maintenance screen.
     * When `false`, the user will be redirected back to the login screen.
     */

    maintenanceMode = false;

    timerset = {
        hours: 0,
        minutes: 0,
        seconds: 0,
    };
    intervalId: any;

    constructor(private router: Router, private http: HttpClient) {}

    ngOnInit() {
        this.startCount();
    }

    startCount() {
        this.http.get<{ maintenance: boolean; maintenance_until?: number }>(`${environment.base_url}/Maintenance/MaintenanceStatus`).subscribe({
            next: (res) => {
                this.maintenanceMode = res.maintenance;

                if (this.maintenanceMode && res.maintenance_until) {
                    // Convert to ms
                    const endDate = new Date(res.maintenance_until * 1000).toISOString();
                    this.startCountdown(endDate);
                } else {
                    // this.logout();
                }
            },
            error: () => {
                this.maintenanceMode = false;
            },
        });
    }

    startCountdown(endDate: string) {
        const end = new Date(endDate).getTime();

        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        this.intervalId = setInterval(() => {
            const now = new Date().getTime();
            const distance = end - now;
            if (distance < 0) {
                this.timerset = { hours: 0, minutes: 0, seconds: 0 };
                return;
            }
            this.timerset.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            this.timerset.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            this.timerset.seconds = Math.floor((distance % (1000 * 60)) / 1000);
        }, 1000);
    }
    ngOnDestroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    /**
     * Calls the backend API to check whether the system
     * is in maintenance mode or not.
     *
     * - If NOT in maintenance: log the user out and redirect.
     * - If in maintenance: show a toast notification.
     */

    // API call to check system maintenance status
    checkMaintenanceStatus() {
        this.http.get<{ maintenance: boolean }>(`${environment.base_url}/Maintenance/MaintenanceStatus`).subscribe({
            next: (res) => {
                this.maintenanceMode = res.maintenance;
                if (!this.maintenanceMode) {
                    this.logout();
                } else {
                    this.coloredToast('danger', 'The system is currently under maintenance. Please try again later.');
                }
            },
            error: () => {
                this.maintenanceMode = false;
            },
        });
    }

    /**
     * Clears user session and navigates to login screen.
     * Also reloads the app to reset state.
     */

    // Clears user data and redirects to login
    logout() {
        localStorage.clear();
        sessionStorage.clear();
        this.coloredToast('warning', 'You are logged out successfully');
        this.router.navigate(['']).then(() => {
            window.location.reload();
        });
    }

    // Reusable toast notification
    coloredToast(color: string, message: string) {
        const toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            showCloseButton: true,
            customClass: {
                popup: `color-${color}`,
            },
            target: document.getElementById(color + '-toast') || 'body',
        });
        toast.fire({
            title: message,
        });
    }
}
