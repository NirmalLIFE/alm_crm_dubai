// import { Component, ViewChild } from '@angular/core';
// import { StaffPostAuthService } from './service/staff-post-auth.service';
// import { Subscription, takeWhile, timer } from 'rxjs';

// @Component({
//     selector: 'app-root',
//     templateUrl: './app.component.html',
//     styleUrls: ["app.component.css"],
// })
// export class AppComponent {

//     // private timerSubscription: Subscription;
//     // private shouldContinue = true;
//     @ViewChild('session') session: any;

//     constructor() {
//         // const interval = 2 * 60 * 1000; // 2 minutes in milliseconds
//         // const timer$ = timer(0, interval).pipe(
//         //     takeWhile(() => this.shouldContinue)
//         // );

//         // this.timerSubscription = timer$.subscribe(() => {
//         //     // Call your function here
//         //     this.changeOfRoutes();
//         // });
//     }
//     // changeOfRoutes() {
//     //     this.userServices.userLoginValidity().subscribe((rData: any) => {
//     //     }, (error) => {
//     //         this.shouldContinue = false;                     //Error callback
//     //         this.session.open();
//     //     });
//     // }
// }

import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MaintenanceService } from './maintenance.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
    constructor(private maintenanceService: MaintenanceService, private router: Router) { }

    ngOnInit() {
        // this.clickApiaction(); // Initial check when the app starts
    }

    // Global listener for user clicks anywhere in the document.Each click triggers a maintenance status check.
    @HostListener('document:click')
    onUserClick() {
        // this.maintenanceService.check().subscribe(status => {
        //     if (status) {
        //         this.router.navigate(['/maintenance']);
        //     }
        // });
    }

    // Perform API check at app startup.
    clickApiaction() {
        // this.maintenanceService.check().subscribe(status => {
        //     if (status) {
        //         this.router.navigate(['/maintenance']);
        //     }
        // });
    }
}
