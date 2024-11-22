import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-job-card-tat',
    templateUrl: './job-card-tat.component.html',
    styleUrls: ['./job-card-tat.component.css'],
})
export class JobCardTatComponent implements OnInit {
    public dateFrom: any = this.datePipe.transform(moment(new Date()).startOf('month').toDate(), 'yyyy-MM-dd') || '';
    public dateTo: any = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
    public jobData: any[] = [];
    public load_flag: boolean = true;
    public timediffStats: any = [];
    public averageHoursPerProperty: any = [];

    constructor(public datePipe: DatePipe, private userServices: StaffPostAuthService) {}

    ngOnInit(): void {
        this.getAllJobcards();
    }

    getAllJobcards() {
        this.load_flag = true;
        this.jobData = [];
        let data = {
            dateFrom: this.dateFrom,
            dateTo: this.dateTo,
        };

        this.userServices.getAllJobCards(data).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.jobData = rData.jobs;
                this.jobData.forEach((element) => {
                    element.timediff = {
                        Open_Start: '0',
                        Open_Start_1: '0',
                        Open_Start_2: '0',
                        Inspection: '0',
                        Repair: '0',
                        Repair_1: '0',
                        Diagnosing: '0',
                        Estimation: '0',
                        Estimation_1: '0',
                        Estimation_2: '0',
                        Approval: '0',
                        Parts: '0',
                        Sublet: '0',
                        Road_Test: '0',
                        Completed: '0',
                        Closed: '0',
                        Workshop_TAT_Open_QC: '0',
                        Workshop_TAT_Open_Complete: '0',
                        Workshop_TAT_Open_Invoice: '0',
                        Front_office_TAT: '0',
                    };
                    if (element.job_status != '') {
                        const conditions = [
                            { startStatus: { sub: 1, main: 'OPN' }, endStatus: { sub: 16, main: 'CLO' }, key: 'Workshop_TAT_Open_Complete' },
                            { startStatus: { sub: 1, main: 'OPN' }, endStatus: { sub: 17, main: 'INV' }, key: 'Workshop_TAT_Open_Invoice' },
                            { startStatus: { sub: 16, main: 'CLO' }, endStatus: { sub: 17, main: 'INV' }, key: 'Closed' },
                            { startStatus: { sub: 15, main: 'COM' }, endStatus: { sub: 16, main: 'CLO' }, key: 'Completed' },
                            { startStatus: { sub: 13, main: 'WIP' }, endStatus: { sub: 14, main: 'TST' }, key: 'Sublet' },
                            { startStatus: { sub: 12, main: 'WIP' }, endStatus: { sub: 7, main: 'WIP' }, key: 'Parts' },
                            { startStatus: { sub: 11, main: 'WIP' }, endStatus: { sub: 12, main: 'WIP' }, key: 'Approval' },
                            { startStatus: { sub: 4, main: 'WIP' }, endStatus: { sub: 11, main: 'WIP' }, key: 'Estimation' },
                            { startStatus: { sub: 6, main: 'WIP' }, endStatus: { sub: 11, main: 'WIP' }, key: 'Estimation_1' },
                            { startStatus: { sub: 10, main: 'WIP' }, endStatus: { sub: 11, main: 'WIP' }, key: 'Estimation_2' },
                            { startStatus: { sub: 5, main: 'WIP' }, endStatus: { sub: 6, main: 'WIP' }, key: 'Diagnosing' },
                            { startStatus: { sub: 5, main: 'WIP' }, endStatus: { sub: 6, main: 'WIP' }, key: 'Repair' },
                            { startStatus: { sub: 7, main: 'WIP' }, endStatus: { sub: 8, main: 'WIP' }, key: 'Repair_1' },
                            { startStatus: { sub: 3, main: 'WIP' }, endStatus: { sub: 4, main: 'WIP' }, key: 'Inspection' },
                            { startStatus: { sub: 1, main: 'OPN' }, endStatus: { sub: 3, main: 'WIP' }, key: 'Open_Start' },
                            { startStatus: { sub: 1, main: 'OPN' }, endStatus: { sub: 5, main: 'WIP' }, key: 'Open_Start_1' },
                            { startStatus: { sub: 1, main: 'OPN' }, endStatus: { sub: 9, main: 'WIP' }, key: 'Open_Start_2' },
                            { startStatus: { sub: 14, main: 'TST' }, endStatus: { sub: 15, main: 'COM' }, key: 'Road_Test' },
                            { startStatus: { sub: 1, main: 'OPN' }, endStatus: { sub: 15, main: 'COM' }, key: 'Workshop_TAT_Open_QC' },
                        ];

                        conditions.forEach((condition) => {
                            const startItem = element.subStatusTracker.find(
                                (d: any) => d.jbsc_sub_status == condition.startStatus.sub && d.jbsc_main_status == condition.startStatus.main
                            );
                            const endItem = element.subStatusTracker.find(
                                (d: any) => d.jbsc_sub_status == condition.endStatus.sub && d.jbsc_main_status == condition.endStatus.main
                            );

                            if (startItem && endItem) {
                                let startTime = new Date(startItem.jbsc_updated_on);
                                let endTime = new Date(endItem.jbsc_updated_on);
                                // element.timediff[condition.key] = this.calculateTimeDiff(startTime, endTime) + ' hours';
                                let timeDiff = this.calculateFilteredTimeDiff(startTime, endTime);
                                if (timeDiff < 1) {
                                    element.timediff[condition.key] = Math.round(timeDiff * 60) + ' minutes';
                                } else {
                                    element.timediff[condition.key] = Math.round(timeDiff * 100) / 100 + ' hours';
                                }
                            }
                        });

                        // Calculate Front_office_TAT separately
                        const Front_office_TAT1 = element.subStatusTracker.find((d: any) => d.jbsc_sub_status == 10 && d.jbsc_main_status == 'WIP');
                        const Front_office_TAT1_end = element.subStatusTracker.find((d: any) => d.jbsc_sub_status == 11 && d.jbsc_main_status == 'WIP');
                        const Front_office_TAT2 = element.subStatusTracker.find((d: any) => d.jbsc_sub_status == 12 && d.jbsc_main_status == 'WIP');
                        const Front_office_TAT3 = element.subStatusTracker.find((d: any) => d.jbsc_sub_status == 13 && d.jbsc_main_status == 'WIP');
                        const Front_office_TAT4 = element.subStatusTracker.find((d: any) => d.jbsc_sub_status == 15 && d.jbsc_main_status == 'COM');
                        const Front_office_TAT4_end = element.subStatusTracker.find((d: any) => d.jbsc_sub_status == 17 && d.jbsc_main_status == 'INV');

                        if (
                            Front_office_TAT1 &&
                            Front_office_TAT1_end &&
                            Front_office_TAT2 &&
                            Front_office_TAT3 &&
                            Front_office_TAT4 &&
                            Front_office_TAT4_end
                        ) {
                            let totalHours_TAT1 = this.calculateFilteredTimeDiff(
                                new Date(Front_office_TAT1.jbsc_updated_on),
                                new Date(Front_office_TAT1_end.jbsc_updated_on)
                            );
                            let totalHours_TAT2 = this.calculateFilteredTimeDiff(
                                new Date(Front_office_TAT1_end.jbsc_updated_on),
                                new Date(Front_office_TAT2.jbsc_updated_on)
                            );
                            let totalHours_TAT3 = this.calculateFilteredTimeDiff(
                                new Date(Front_office_TAT2.jbsc_updated_on),
                                new Date(Front_office_TAT3.jbsc_updated_on)
                            );
                            let totalHours_TAT4 = this.calculateFilteredTimeDiff(
                                new Date(Front_office_TAT4.jbsc_updated_on),
                                new Date(Front_office_TAT4_end.jbsc_updated_on)
                            );
                            let totalHours = totalHours_TAT1 + totalHours_TAT2 + totalHours_TAT3 + totalHours_TAT4;
                            if (totalHours < 1) {
                                element.timediff.Front_office_TAT = Math.round(totalHours * 60) + ' minutes';
                            } else {
                                element.timediff.Front_office_TAT = Math.round(totalHours * 100) / 100 + ' hours';
                            }
                        }
                    }
                });

                this.timediffStats = {
                    Open_Start: { totalHours: 0, count: 0 },
                    Open_Start_1: { totalHours: 0, count: 0 },
                    Open_Start_2: { totalHours: 0, count: 0 },
                    Inspection: { totalHours: 0, count: 0 },
                    Repair: { totalHours: 0, count: 0 },
                    Repair_1: { totalHours: 0, count: 0 },
                    Diagnosing: { totalHours: 0, count: 0 },
                    Estimation: { totalHours: 0, count: 0 },
                    Estimation_1: { totalHours: 0, count: 0 },
                    Estimation_2: { totalHours: 0, count: 0 },
                    Approval: { totalHours: 0, count: 0 },
                    Parts: { totalHours: 0, count: 0 },
                    Sublet: { totalHours: 0, count: 0 },
                    Road_Test: { totalHours: 0, count: 0 },
                    Completed: { totalHours: 0, count: 0 },
                    Closed: { totalHours: 0, count: 0 },
                    Workshop_TAT_Open_QC: { totalHours: 0, count: 0 },
                    Workshop_TAT_Open_Complete: { totalHours: 0, count: 0 },
                    Workshop_TAT_Open_Invoice: { totalHours: 0, count: 0 },
                    Front_office_TAT: { totalHours: 0, count: 0 },
                };

                this.jobData.forEach((element) => {
                    for (let property in this.timediffStats) {
                        if (element.timediff.hasOwnProperty(property) && element.timediff[property] !== '0') {
                            // Increment count for the property
                            this.timediffStats[property].count++;
                            // Accumulate hours for the property
                            this.timediffStats[property].totalHours += parseFloat(element.timediff[property]);
                        }
                    }
                });

                this.averageHoursPerProperty = [];
                for (let property in this.timediffStats) {
                    if (this.timediffStats[property].count !== 0) {
                        this.averageHoursPerProperty[property] = parseFloat(
                            (this.timediffStats[property].totalHours / this.timediffStats[property].count).toFixed(2)
                        );
                    } else {
                        this.averageHoursPerProperty[property] = 0;
                    }
                }
                this.load_flag = false;
                const allZero = Object.values(this.timediffStats).every((stats:any) => stats.totalHours === 0);

                if (allZero) {
                    this.coloredToast('danger', 'No data for Selected date');
                }
            } else {
                this.load_flag = false;
                this.coloredToast('danger', 'No data for Selected date');
            }
        });
    }

    // calculateTimeDiff(startTime: Date, endTime: Date): number {
    //     let timeDiff = endTime.getTime() - startTime.getTime();
    //     let totalMinutes = Math.round(timeDiff / (1000 * 60));
    //     let totalHours = totalMinutes / 60;
    //     return totalHours;
    // }
    calculateFilteredTimeDiff(startTime: Date, endTime: Date): number {
        const startHour = 8; // 8 AM
        const endHour = 20; // 8 PM

        let totalMinutes = 0;
        let current = new Date(startTime.getTime());

        while (current < endTime) {
            let nextHour = new Date(current.getTime());
            nextHour.setHours(current.getHours() + 1);
            if (current.getHours() >= startHour && current.getHours() < endHour) {
                totalMinutes += Math.min((nextHour.getTime() - current.getTime()) / 60000, (endTime.getTime() - current.getTime()) / 60000);
            }
            current = nextHour;
        }
        let totalHours = totalMinutes / 60;
        return totalHours; // convert minutes to hours
    }

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
