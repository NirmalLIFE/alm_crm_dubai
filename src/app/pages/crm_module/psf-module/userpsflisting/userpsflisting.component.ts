import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';

@Component({
    selector: 'app-userpsflisting',
    templateUrl: './userpsflisting.component.html',
    styleUrls: ['./userpsflisting.component.css'],
})
export class UserpsflistingComponent implements OnInit {

    public pieChart: any;



    psf_calls: any[] = [];
    temp_psf_calls: any[] = [];
    max: Date = new Date();
    totalCalls: any = 0;
    attemptedCalls: any = 0;
    openCalls: any = 0;
    expiringCalls: any = 0;
    status = '-1';
    selecteddate: any = new Date();
    expiredCalls: any = 0;
    completedCalls: any = 0;
    startdate: any;
    keydata: any;
    ext_num: any;
    psf_id: any;
    public load_flag: boolean = true;
    filteredRows: any[] = [];
    searchvalue: any;
    public search: string = '';
    public assigndate: string = this.datepipe.transform(new Date(), "yyyy-MM-dd") || '';
    public filterCriteria: string = ''; public calllogphn: any = [];
    public selectedNumber:any=''

    @ViewChild('calllogmodal') calllogmodal: any;
    @ViewChild('psfcallupdate') psfcallupdate: any;

    public cols = [
        { field: 'customer_name', title: 'Name' },
        { field: 'phone', title: 'Phone' },
        { field: 'psfm_job_no', title: 'Job No' },
        { field: 'psfm_reg_no', title: 'Reg No' },
        { field: 'psfm_invoice_date', title: 'Invoice date' },
        { field: 'psfm_psf_assign_date', title: 'Assign Date' },
        { field: 'psfm_num_of_attempts', title: 'Attempts' },
        { field: 'latestResponse', title: 'Latest Response' },
        // { field: 'rating', title: 'Rating' },
        { field: 'status', title: 'Current Status' },
        { field: 'Action', title: 'Actions' },
    ];

    constructor(private userServices: StaffPostAuthService, public datepipe: DatePipe, public storeData: Store<any>) {

    }

    ngOnInit(): void {
        this.getPSFCallsList();
    }

    getPSFCallsList() {
        this.load_flag=true;
        this.psf_calls = [];
        this.temp_psf_calls = [];
        console.log("selected date", this.assigndate)
        let data = {
            date: this.assigndate,
        };
        this.userServices.get_crmDailyUserPSFCalls(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.psf_calls = rdata.user_psf;
                this.temp_psf_calls = rdata.user_psf;
                // this.expiredCalls = rdata.user_closed_count;
                // this.completedCalls = rdata.user_success_count;
                this.totalCalls = this.psf_calls.length;
                this.openCalls = this.psf_calls.filter((data: any) => data.psfm_num_of_attempts == 0).length;
                this.attemptedCalls = this.psf_calls.filter((data: any) => data.psfm_num_of_attempts > 0).length;
                let new_date = new Date();
                this.expiringCalls = this.psf_calls.filter(
                    (data: any) =>
                        Math.floor(
                            (Date.UTC(new_date.getFullYear(), new_date.getMonth(), new_date.getDate()) -
                                Date.UTC(
                                    new Date(data.psfm_psf_assign_date).getFullYear(),
                                    new Date(data.psfm_psf_assign_date).getMonth(),
                                    new Date(data.psfm_psf_assign_date).getDate()
                                )) /
                            (1000 * 60 * 60 * 24)
                        ) >= 5
                ).length;
                this.psf_calls.forEach((element: any) => {
                    if (element.rm_name == null) {
                        element['latestResponse'] = 'NIL';
                    } else {
                        element['latestResponse'] = element.rm_name;
                    }
                    if (element.psfm_status == 0) {
                        element['status'] = 'Open';
                    } else if (element.psfm_status == 1) {
                        element['status'] = 'pending';
                    } else if (element.psfm_status == 2) {
                        element['status'] = 'Completed';
                    }

                    if (element.psfm_sa_rating == null) {
                        element['rating'] = 'NIL';
                    } else if (element.psfm_sa_rating != 0) {
                        element['rating'] = element.psfm_sa_rating;
                    }

                    if (
                        Math.floor(
                            (Date.UTC(new_date.getFullYear(), new_date.getMonth(), new_date.getDate()) -
                                Date.UTC(
                                    new Date(element.psfm_psf_assign_date).getFullYear(),
                                    new Date(element.psfm_psf_assign_date).getMonth(),
                                    new Date(element.psfm_psf_assign_date).getDate()
                                )) /
                            (1000 * 60 * 60 * 24)
                        ) >= 5
                    ) {
                        element.psf_expiry = true;
                    } else {
                        element.psf_expiry = false;
                    }
                });
                console.log(rdata.user_monthly_total_count);
                this.pieChart = {
                    series: rdata.user_monthly_total_count.map(Number),
                    chart: {
                        height: 250,
                        type: 'pie',
                        zoom: {
                            enabled: false,
                        },
                        toolbar: {
                            show: false,
                        },
                    },
                    labels: ['Pending calls', 'Closed Calls', 'Expired Calls'],
                    colors: ['#4361ee', '#00ab55', '#e7515a'],
                    title: {
                        text: "Current Month Statistics",
                        align: 'center',
                        margin: 10,
                        offsetX: 0,
                        offsetY: 0,
                        floating: false,
                        style: {
                            fontSize: '14px',
                            fontWeight: 'bold',
                            fontFamily: undefined,
                            color: '#263238'
                        },
                    },
                    responsive: [
                        {
                            breakpoint: 480,
                            options: {
                                chart: {
                                    width: 200,
                                },
                            },
                        },
                    ],
                    stroke: {
                        show: false,
                    },
                    legend: {
                        position: 'bottom',
                    },
                };

                this.load_flag = false;
            }
        });
    }

    openPSFDetails(psf_item: any) {
        this.psf_id = psf_item.psfm_id;
        this.selectedNumber=psf_item.phone;
        this.psfcallupdate.open();
    }
    closePsfcallupdateModal(flag:any) {
        console.log(flag);
        this.psfcallupdate.close();
        if(flag==true)this.getPSFCallsList();
    }

    customSearchFilter() {
        if (this.assigndate === '' || this.assigndate === null) {
            this.psf_calls = this.temp_psf_calls;
            this.filterCriteria = '';
            return;
        }
        let dt = this.psf_calls;
        if (this.assigndate != '' || this.assigndate != null) {
            dt = dt.filter((d) => d.psfm_psf_assign_date === this.assigndate);
            this.filterCriteria = 'Assign Date: ' + this.assigndate + ' ,';
        }
        this.psf_calls = dt;
        this.filterCriteria = this.filterCriteria.slice(0, -1);
    }

    onSearch(searchValue: string) {
        this.filteredRows = this.psf_calls.filter((row) => {
            // Convert each row's values to lowercase for case-insensitive search
            return Object.values(row).some((val) => (val ? val.toString().toLowerCase().includes(searchValue.toLowerCase()) : false));
        });
    }

    openCallLogs(data: any) {
        this.calllogphn = {
            phone: data,
        };
        this.calllogmodal.open();
    }

    callhistoryModal() {
        this.calllogmodal.close();
    }
}
