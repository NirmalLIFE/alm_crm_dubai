import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-psf-whatsapp-report',
    templateUrl: './psf-whatsapp-report.component.html',
    styleUrls: ['./psf-whatsapp-report.component.css'],
})
export class PsfWhatsappReportComponent implements OnInit {
    public load_flag: boolean = true;
    public search: any = '';
    public dateFrom: any = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
    public dateTo: any = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
    public wbMessages: any[] = [];
    public wbMessages1: any[] = [];
    public salesByCategory: any;
    public store: any;
    public analyticCounts: any = {
        total_messages: 0,
        total_failed: 0,
        total_delivered: 0,
        total_seen: 0,
        total_responded: 0,
        total_ext_happy: 0,
        total_very_happy: 0,
        total_happy: 0,
        total_dissatisfied: 0,
    };
    public saCounts: any[] = [];
    public total_Rating_percentage: any;

    public filter_selected:any = 0;

    filterCusRevu = [
        { id: 0, name: 'Select ALL Status' },
        { id: 1, name: 'Extremely Satisfied' },
        { id: 2, name: 'Very Satisfied' },
        { id: 3, name: 'Satisfied' },
        { id: 4, name: 'Dissatisfied' },
        { id: 5, name: 'Very Dissatisfied' }
      ];
    public cols = [
        { field: 'psfm_job_no', title: 'Jobcard No.', isUnique: true },
        { field: 'customer_name', title: 'Customer Name', isUnique: false },
        { field: 'wb_phone', title: 'Phone', isUnique: false },
        { field: 'psfm_reg_no', title: 'Reg. No.', isUnique: false },
        { field: 'sa', title: 'Service Advisor', isUnique: false },
        { field: 'psfm_invoice_date', title: 'Invoice Date', isUnique: true },
        { field: 'psfm_psf_assign_date', title: 'PSF Date', isUnique: false },
        { field: 'message_status', title: 'Message status', isUnique: false },
        { field: 'message_response', title: 'Message Replay', isUnique: false },
        { field: 'psf_call_resposne', title: 'PSF Primary Response', isUnique: false },
    ];

    //Star Rating
    value: number = 1.5;
    stars: number[] = [1, 2, 3, 4, 5];

    constructor(private userServices: StaffPostAuthService, public datePipe: DatePipe, public storeData: Store<any>) {
        this.storeData
            .select((d) => d.index)
            .subscribe((d) => {
                this.store = d;
            });
    }

    ngOnInit(): void {
        this.getPsfWhatsappReport();
    }

    getPsfWhatsappReport() {
        this.load_flag = true;
        this.userServices.getPSFWhatsappReport({ dateFrom: this.dateFrom, dateTo: this.dateTo }).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.wbMessages = rData.messages;
                this.wbMessages1 = rData.messages;
                this.loadAnalytics();
            } else {
                this.coloredToast('danger', 'Cant fetch users');
                this.load_flag = false;
            }
        });
    }

    loadAnalytics() {
        this.saCounts = [];
        this.analyticCounts = {
            total_messages: this.wbMessages.length,
            total_sent: 0,
            total_failed: 0,
            total_delivered: 0,
            total_seen: 0,
            total_responded: 0,
            total_ext_happy: 0,
            total_very_happy: 0,
            total_happy: 0,
            total_dissatisfied: 0,
            total_very_dissatisfied: 0,
        };
        const isDark = this.store.theme === 'dark' || this.store.isDarkMode ? true : false;
        const isRtl = this.store.rtlClass === 'rtl' ? true : false;
        this.wbMessages.forEach((element: any) => {
            //	0-Pending 1-Sent 2-Delivered 3-Read 4-Replaid 5-Failed
            if (element.wb_message_status == '5') {
                this.analyticCounts.total_failed++;
                element.message_status = 'Failed';
                element.message_response = 'NIL';
            } else if (element.wb_message_status == '4') {
                this.analyticCounts.total_responded++;
                element.message_status = 'Replied';
                if (element.wb_replay_body == '5') {
                    this.analyticCounts.total_ext_happy++;
                    element.message_response = 'Extremely Satisfied';
                } else if (element.wb_replay_body == '4') {
                    this.analyticCounts.total_very_happy++;
                    element.message_response = 'Fairly Satisfied';
                } else if (element.wb_replay_body == '3') {
                    this.analyticCounts.total_happy++;
                    element.message_response = 'Satisfied';
                } else if (element.wb_replay_body == '2') {
                    this.analyticCounts.total_dissatisfied++;
                    element.message_response = 'Dissatisfied';
                } else if (element.wb_replay_body == '1') {
                    this.analyticCounts.total_very_dissatisfied++;
                    element.message_response = 'Very Dissatisfied';
                }
            } else if (element.wb_message_status == '3') {
                this.analyticCounts.total_seen++;
                element.message_status = 'Seen';
                element.message_response = 'NIL';
            } else if (element.wb_message_status == '2') {
                element.message_status = 'Delivered';
                element.message_response = 'NIL';
                this.analyticCounts.total_delivered++;
            } else if (element.wb_message_status == '1' || element.wb_message_status == '0') {
                element.message_status = 'Sent';
                element.message_response = 'NIL';
                this.analyticCounts.total_sent++;
            }
            if (element.psf_response == '1') {
                element.psf_call_resposne = 'EXTREMLY HAPPY';
            } else if (element.psf_response == '2') {
                element.psf_call_resposne = 'FAIRLY HAPPY';
            } else if (element.psf_response == '3') {
                element.psf_call_resposne = 'HAPPY';
            } else if (element.psf_response == '4') {
                element.psf_call_resposne = 'NOT ANSWERING';
            } else if (element.psf_response == '5') {
                element.psf_call_resposne = 'DISSATISFIED';
            } else if (element.psf_response == '6') {
                element.psf_call_resposne = 'PSF NOT APPLICABLE';
            } else if (element.psf_response == '7') {
                element.psf_call_resposne = 'NOT DRIVEN';
            } else {
                element.psf_call_resposne = 'NIL';
            }
        });

        let arr = this.wbMessages.filter((entry) => entry.sa_id === null || entry.sa_id === '');
        // console.log('sa id null >>>>>>>>>>>', arr);

        const saIds = [...new Set(this.wbMessages.map((entry) => entry.sa_id))];
        saIds.forEach((saId) => {
            const saName = this.wbMessages.find((entry) => entry.sa_id === saId)?.sa;
            const saEntries = this.wbMessages.filter((entry) => entry.sa_id === saId && entry.wb_message_status === '4');

            let counts = {
                Total: 0,
                Extremely_Dissatisfied: 0,
                Dissatisfied: 0,
                Satisfied: 0,
                Fairly_Satisfied: 0,
                Extremely_Satisfied: 0,
            };

            saEntries.forEach((entry) => {
                switch (entry.wb_replay_body) {
                    case '1':
                        counts.Extremely_Dissatisfied++;
                        counts.Total++;
                        break;
                    case '2':
                        counts.Dissatisfied++;
                        counts.Total++;
                        break;
                    case '3':
                        counts.Satisfied++;
                        counts.Total++;
                        break;
                    case '4':
                        counts.Fairly_Satisfied++;
                        counts.Total++;
                        break;
                    case '5':
                        counts.Extremely_Satisfied++;
                        counts.Total++;
                        break;
                }
            });

            this.saCounts.push({ saId, saName, counts });
        });


        this.saCounts.forEach((element) => {
            let totalRatingPercentage =
                element.counts.Extremely_Dissatisfied * 1 +
                element.counts.Dissatisfied * 2 +
                element.counts.Satisfied * 3 +
                element.counts.Fairly_Satisfied * 4 +
                element.counts.Extremely_Satisfied * 5;
            if (element.counts.Total !== 0) {
                element.totalratingpercentage = totalRatingPercentage / element.counts.Total;
            } else {
                element.totalratingpercentage = 0;
            }
        });

        this.salesByCategory = {
            chart: {
                type: 'donut',
                height: 420,
                fontFamily: 'Nunito, sans-serif',
            },
            dataLabels: {
                enabled: false,
            },
            colors: isDark ? ['#58db85', '#e2a03f', '#5c1ac3', '#F24949', '#FF0808'] : ['#58db85', '#e2a03f', '#5c1ac3', '#F24949', '#FF0808'],
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                fontSize: '12px',
                markers: {
                    width: 10,
                    height: 10,
                    offsetX: -2,
                },
                height: 115,
                offsetY: 20,
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '75%',
                        background: 'transparent',
                        labels: {
                            show: true,
                            name: {
                                show: true,
                                fontSize: '18px',
                                offsetY: -10,
                            },
                            value: {
                                show: true,
                                fontSize: '18px',
                                color: isDark ? '#bfc9d4' : undefined,
                                offsetY: 16,
                                formatter: (val: any) => {
                                    return val;
                                },
                            },
                            total: {
                                show: true,
                                label: 'Total',
                                color: '#888ea8',
                                fontSize: '18px',
                                formatter: (w: any) => {
                                    return w.globals.seriesTotals.reduce(function (a: any, b: any) {
                                        return a + b;
                                    }, 0);
                                },
                            },
                        },
                    },
                },
            },
            labels: ['Extremely Satisfied', 'Very Satisfied', 'Satisfied', 'Dissatisfied', 'Very Dissatisfied'],
            states: {
                hover: {
                    filter: {
                        type: 'none',
                        value: 0.15,
                    },
                },
                active: {
                    filter: {
                        type: 'none',
                        value: 0.15,
                    },
                },
            },
            series: [
                this.analyticCounts.total_ext_happy,
                this.analyticCounts.total_very_happy,
                this.analyticCounts.total_happy,
                this.analyticCounts.total_dissatisfied,
                this.analyticCounts.total_very_dissatisfied,
            ],
        };
        this.load_flag = false;

        let ext_happy = parseFloat(this.analyticCounts.total_ext_happy) * 5;
        let happy = parseFloat(this.analyticCounts.total_happy) * 3;
        let ver_happy = parseFloat(this.analyticCounts.total_very_happy) * 4;
        let dissatisfied = parseFloat(this.analyticCounts.total_dissatisfied) * 2;
        let total_very_dissatisfied = parseFloat(this.analyticCounts.total_very_dissatisfied) * 1;

        let total_rating = (ext_happy + happy + ver_happy + dissatisfied + total_very_dissatisfied) / parseFloat(this.analyticCounts.total_responded);
        

        this.total_Rating_percentage = total_rating.toFixed(2);

    }

    filterFeedback(){
        if(this.filter_selected=='0'){
            this.wbMessages = this.wbMessages1;

        } 
        else if(this.filter_selected=='1'){
            this.wbMessages=this.wbMessages1.filter((element: any) => element.message_response =='Extremely Satisfied');
        } else if(this.filter_selected =='2'){
            this.wbMessages=this.wbMessages1.filter((element: any) => element.message_response =='Fairly Satisfied');
        } else if (this.filter_selected =='3'){
            this.wbMessages=this.wbMessages1.filter((element: any) => element.message_response =='Satisfied');

         } else if(this.filter_selected =='4'){
            this.wbMessages=this.wbMessages1.filter((element: any) => element.message_response =='Dissatisfied');

         } else if(this.filter_selected =='5'){
            this.wbMessages=this.wbMessages1.filter((element: any) => element.message_response =='Very Dissatisfied');

         }
    }

    calculateStarClass(sa: any, star: number): string {
        const ratingPercentage = sa.totalratingpercentage;
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

    calculateStarClass2(percentage:any, star:any): string {
        const ratingPercentage = percentage;
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
