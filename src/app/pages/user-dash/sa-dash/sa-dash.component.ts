import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';

@Component({
    selector: 'app-sa-dash',
    templateUrl: './sa-dash.component.html',
    styleUrls: ['./sa-dash.component.css'],
})
export class SaDashComponent implements OnInit {
    public currentMonth: any;
    public previousMonth: any;
    public dissatisfied_currentMonth_Wsapp: any[] = [];
    public dissatisfied_previousMonth_Wsapp: any[] = [];
    public all_dissatisfied: any[] = [];
    public search: string = '';
    public dateFrom: string = this.datepipe.transform(moment(new Date()).startOf('month').toDate(), 'yyyy-MM-dd') || '';
    public dateTo: string = this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '';
    public basic: FlatpickrOptions;
    us_laabs_id: string = atob(atob(localStorage.getItem('us_laabs_id') || '{}'));
    wbMessages: any[] = [];
    saName: string = atob(atob(localStorage.getItem('us_firstname') || '{}'));

    public dissatisfied_cust_call: any[] = [];
    discust: any[] = [];

    //Star Rating
    value: number = 1.5;
    stars: number[] = [1, 2, 3, 4, 5];

    cols_2 = [
        { field: 'customer_name', title: 'Customer', hide: false },
        { field: 'phone', title: 'Call From' },
        { field: 'psfm_reg_no', title: 'Reg No' },
        { field: 'psfm_invoice_date', title: 'Invoice Date' },
        { field: 'response', title: 'Response' },
        { field: 'ldl_note', title: 'Remarks' },
    ];

    public analyticCounts: any = {
        total_messages: 0,
        total_ext_happy: 0,
        total_very_happy: 0,
        total_happy: 0,
        total_dissatisfied: 0,
        total_Ex_dissatisfied: 0,
        total_call_response: 0,
        total_ext_happy_call_response: 0,
        total_very_happy_call_response: 0,
        total_happy_call_response: 0,
        total_dissatisfied_call_response: 0,
    };

    @ViewChild('DissatifiedModal') DissatifiedModal: any;

    constructor(private userServices: StaffPostAuthService, public datepipe: DatePipe, public router: Router) {
        let currentDate = new Date();
        this.currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        // this.previousMonth = currentDate.getMonth().toString().padStart(2, '0');

        this.basic = {
            dateFormat: 'Y-m-d',
            // defaultDate: this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '',
        };
    }

    ngOnInit(): void {
        this.getMonthlyDissatisfied();
        this.getSaRating();
    }

    getMonthlyDissatisfied() {
        // let data = {
        //     id: this.us_laabs_id,
        //     currentMonth: this.currentMonth,
        //     previousMonth: this.previousMonth,
        // };

        // this.userServices.getMonthlyDissatisfied(data).subscribe((rData: any) => {
        //     if (rData.ret_data == 'success') {
        //         this.dissatisfied_currentMonth_Wsapp = rData.messages_currentMonth;
        //         this.dissatisfied_cust_call = rData.dis_cust;
        //         // this.dissatisfied_previousMonth_Wsapp = rData.messages_previousMonth;
        //         // this.all_dissatisfied = [...this.dissatisfied_currentMonth_Wsapp, ...this.dissatisfied_previousMonth_Wsapp];
        //     }
        // });
    }

    getSaRating() {
        this.analyticCounts = {
            total_messages: 0,
            total_ext_happy: 0,
            total_very_happy: 0,
            total_happy: 0,
            total_dissatisfied: 0,
            total_Ex_dissatisfied: 0,
            total_call_response: 0,
            total_ext_happy_call_response: 0,
            total_very_happy_call_response: 0,
            total_happy_call_response: 0,
            total_dissatisfied_call_response: 0,
        };
        if (this.dateFrom != '' || this.dateFrom != null || this.dateTo != '' || this.dateTo != null) {
            let datevalD = new Date(this.dateFrom);
            let datevalD2 = new Date(this.dateTo);
            this.dateFrom = datevalD.getFullYear() + '-' + ('0' + (datevalD.getMonth() + 1)).slice(-2) + '-' + ('0' + datevalD.getDate()).slice(-2);
            this.dateTo = datevalD2.getFullYear() + '-' + ('0' + (datevalD2.getMonth() + 1)).slice(-2) + '-' + ('0' + datevalD2.getDate()).slice(-2);
        }

        let data = {
            id: this.us_laabs_id,
            dateFrom: this.dateFrom,
            dateTo: this.dateTo,
        };
        this.userServices.getSaRating(data).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.wbMessages = rData.messages;
                this.wbMessages.forEach((element: any) => {
                    //	0-Pending 1-Sent 2-Delivered 3-Read 4-Replaid 5-Failed
                    if (element.wb_message_status == '5') {
                        element.message_status = 'Failed';
                        element.message_response = 'NIL';
                    } else if (element.wb_message_status == '4') {
                        element.message_status = 'Replied';
                        if (element.wb_replay_body == '5') {
                            this.analyticCounts.total_ext_happy++;
                            this.analyticCounts.total_messages++;
                            element.message_response = 'Extremely Satisfied';
                        } else if (element.wb_replay_body == '4') {
                            this.analyticCounts.total_very_happy++;
                            this.analyticCounts.total_messages++;
                            element.message_response = 'Fairly Satisfied';
                        } else if (element.wb_replay_body == '3') {
                            this.analyticCounts.total_happy++;
                            this.analyticCounts.total_messages++;
                            element.message_response = 'Satisfied';
                        } else if (element.wb_replay_body == '2') {
                            this.analyticCounts.total_dissatisfied++;
                            this.analyticCounts.total_messages++;
                            element.message_response = 'Dissatisfied';
                        } else if (element.wb_replay_body == '1') {
                            this.analyticCounts.total_Ex_dissatisfied++;
                            this.analyticCounts.total_messages++;
                            element.message_response = 'Extremely Dissatisfied';
                        }
                    }

                    if (element.psf_response == '1') {
                        element.psf_call_resposne = 'EXTREMLY HAPPY';
                        this.analyticCounts.total_ext_happy_call_response++;
                        this.analyticCounts.total_call_response++;
                    } else if (element.psf_response == '2') {
                        element.psf_call_resposne = 'FAIRLY HAPPY';
                        this.analyticCounts.total_very_happy_call_response++;
                        this.analyticCounts.total_call_response++;
                    } else if (element.psf_response == '3') {
                        element.psf_call_resposne = 'HAPPY';
                        this.analyticCounts.total_happy_call_response++;
                        this.analyticCounts.total_call_response++;
                    } else if (element.psf_response == '4') {
                        element.psf_call_resposne = 'NOT ANSWERING';
                    } else if (element.psf_response == '5') {
                        element.psf_call_resposne = 'DISSATISFIED';
                        this.analyticCounts.total_dissatisfied_call_response++;
                        this.analyticCounts.total_call_response++;
                    } else if (element.psf_response == '6') {
                        element.psf_call_resposne = 'PSF NOT APPLICABLE';
                    } else if (element.psf_response == '7') {
                        element.psf_call_resposne = 'NOT DRIVEN';
                    } else {
                        element.psf_call_resposne = 'NIL';
                    }
                });
                let totalRatingPercentage =
                    this.analyticCounts.total_Ex_dissatisfied * 1 +
                    this.analyticCounts.total_dissatisfied * 2 +
                    this.analyticCounts.total_happy * 3 +
                    this.analyticCounts.total_very_happy * 4 +
                    this.analyticCounts.total_ext_happy * 5;
                if (this.analyticCounts.total_messages !== 0) {
                    this.analyticCounts.totalratingpercentage = totalRatingPercentage / this.analyticCounts.total_messages;
                } else {
                    this.analyticCounts.totalratingpercentage = 0;
                }

                let totalRatingPercentage_call_response =
                    this.analyticCounts.total_dissatisfied_call_response * 1 +
                    this.analyticCounts.total_happy_call_response * 3 +
                    this.analyticCounts.total_very_happy_call_response * 4 +
                    this.analyticCounts.total_ext_happy_call_response * 5;
                if (this.analyticCounts.total_call_response !== 0) {
                    this.analyticCounts.totalratingpercentage_call_response = totalRatingPercentage_call_response / this.analyticCounts.total_call_response;
                } else {
                    this.analyticCounts.totalratingpercentage_call_response = 0;
                }

                this.userServices.getMonthlyDissatisfied(data).subscribe((rData: any) => {
                    if (rData.ret_data == 'success') {
                        this.dissatisfied_currentMonth_Wsapp = rData.messages_currentMonth;
                        this.dissatisfied_cust_call = rData.dis_cust;
                        // this.dissatisfied_previousMonth_Wsapp = rData.messages_previousMonth;
                        // this.all_dissatisfied = [...this.dissatisfied_currentMonth_Wsapp, ...this.dissatisfied_previousMonth_Wsapp];
                    }
                });
                console.log('66546468468468', this.analyticCounts);
            } else {
            }
        });
    }

    calculateStarClass(sa: any, star: number, type: any): string {
        const ratingPercentage = type === 2 ? sa.totalratingpercentage_call_response : sa.totalratingpercentage;
        const roundedRating = Math.floor(ratingPercentage);
        const remainder = ratingPercentage - roundedRating;

        if (star <= roundedRating) {
            return 'full';
        } else if (remainder >= 0.5 && star === roundedRating + 1) {
            return 'half';
        } else {
            return '';
        }
    }

    openDissatifiedModal(no: any) {
        if (no === 1) {
            this.discust = this.dissatisfied_currentMonth_Wsapp;
        } else {
            this.discust = this.dissatisfied_cust_call;
        }
        this.DissatifiedModal.open();
    }
    DissatifiedModalClose() {
        this.DissatifiedModal.close();
    }

    loadQuotation(type: number) {
        type == 0 ? this.router.navigateByUrl('quotation/normal_quote/quote_list') : this.router.navigateByUrl('quotation/special_quote/quote_list');
    }
}
