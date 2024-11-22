import { Component, ViewChild } from '@angular/core';
import { StaffPostAuthService } from './service/staff-post-auth.service';
import { Subscription, takeWhile, timer } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ["app.component.css"],
})
export class AppComponent {

    // private timerSubscription: Subscription;
    // private shouldContinue = true;
    @ViewChild('session') session: any;

    constructor() {
        // const interval = 2 * 60 * 1000; // 2 minutes in milliseconds
        // const timer$ = timer(0, interval).pipe(
        //     takeWhile(() => this.shouldContinue)
        // );

        // this.timerSubscription = timer$.subscribe(() => {
        //     // Call your function here
        //     this.changeOfRoutes();
        // });
    }
    // changeOfRoutes() {
    //     this.userServices.userLoginValidity().subscribe((rData: any) => {
    //     }, (error) => {
    //         this.shouldContinue = false;                     //Error callback
    //         this.session.open();
    //     });
    // }
}
