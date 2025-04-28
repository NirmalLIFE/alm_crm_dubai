import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';
import { filter } from 'rxjs';

@Component({
    selector: 'app-customer-follow-ups',
    templateUrl: './customer-follow-ups.component.html',
    styleUrls: ['./customer-follow-ups.component.css'],
})
export class CustomerFollowUpsComponent implements OnInit {
    public search = '';
    public load_flag: boolean = true;
    public customersList: any = [];
    public allCustomersList: any = [];
    public dateFrom: any = this.datePipe.transform(moment(new Date()).startOf('month').toDate(), 'yyyy-MM-dd') || '';
    public dateTo: any = null;
    public tab = 'home';
    public todayRemindCustomers: any = [];
    public selected: any = 0;

    cols = [
        { field: 'wb_cus_mobile', title: 'Number', hide: false },
        { field: 'wb_cus_name', title: 'Customer', hide: false },
        { field: 'wb_cus_service_reminder', title: 'Type', hide: false },
        { field: 'wb_cus_remind_date', title: 'Remind Date', hide: false },
        { field: 'us_firstname', title: 'Assigned', hide: false },
        { field: 'action', title: 'Action', hide: false },
    ];

    cols2 = [
        { field: 'wb_cus_mobile', title: 'Number', hide: false },
        { field: 'wb_cus_name', title: 'Customer', hide: false },
        { field: 'wb_cus_service_reminder', title: 'Type', hide: false },
        { field: 'wb_cus_updated_on', title: 'Support Requested Date', hide: false },
        { field: 'us_firstname', title: 'Assigned', hide: false },
        { field: 'action', title: 'Action', hide: false },
    ];

    constructor(private userServices: StaffPostAuthService, private cdRef: ChangeDetectorRef, public router: Router, public datePipe: DatePipe) {}

    ngOnInit(): void {
        this.fetchAllCustomers(1);
    }

    fetchAllCustomers(num: any) {
        this.customersList = [];
        this.allCustomersList = [];
        this.load_flag = true;
        let data = {
            dateFrom: this.dateFrom,
            dateTo: this.dateTo,
        };
        this.userServices.fetchAllFollowUpCustomers(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                if (num == 1 && rdata.remindCustomersList) {
                    this.selected = 0;
                    rdata.remindCustomersList.forEach((element: any) => {
                        if (element.wb_cus_reminder == '3') {
                            element.wb_cus_service_reminder = 'First Service Reminder';
                        } else if (element.wb_cus_reminder == '4') {
                            element.wb_cus_service_reminder = 'Second Service Reminder';
                        } else if (element.wb_cus_reminder == '5') {
                            element.wb_cus_service_reminder = 'Third Service Reminder';
                        }
                    });
                    this.allCustomersList = rdata.remindCustomersList;
                    this.customersList = rdata.remindCustomersList;

                    const today = new Date().toISOString().split('T')[0]; // Get today's date in 'YYYY-MM-DD' format
                    console.log('today>>>>>>>>>>>>>>>', today);
                    this.todayRemindCustomers = this.customersList.filter((element: any) => {
                        // Ensure wb_cus_remind_date is in 'YYYY-MM-DD' format as a string
                        const remindDate = new Date(element.wb_cus_remind_date).toISOString().split('T')[0];
                        return remindDate == today;
                    });

                    this.load_flag = false;
                } else if (num == 2 && rdata.assistanceRequiredCustomers) {
                    rdata.assistanceRequiredCustomers.forEach((element: any) => {
                        if (element.wb_cus_reminder == '3') {
                            element.wb_cus_service_reminder = 'First Service Reminder';
                        } else if (element.wb_cus_reminder == '4') {
                            element.wb_cus_service_reminder = 'Second Service Reminder';
                        } else if (element.wb_cus_reminder == '5') {
                            element.wb_cus_service_reminder = 'Third Service Reminder';
                        }
                    });
                    // this.allCustomersList = rdata.assistanceRequiredCustomers;
                    this.customersList = rdata.assistanceRequiredCustomers;
                    this.load_flag = false;
                } else {
                    this.coloredToast('danger', 'No customers found for the selected date');
                    this.load_flag = false;
                }

                // this.allLeads = rdata.lead;
                // // this.phnNum = this.allLeads.map((customer: any) => customer.phone);
                // this.totalCount.totalLeads = this.allLeads.length;
                // this.totalCount.openLeads = this.allLeads.filter((element: any) => element.status_id == '1').length;
                // this.totalCount.convertedLeads = this.allLeads.filter((element: any) => element.status_id == '5').length;
                // this.totalCount.closedLeads = this.allLeads.filter((element: any) => element.status_id == '6').length;
            } else {
                this.coloredToast('danger', 'No customers found for the selected date');
                this.load_flag = false;
            }
        });
    }

    redirectToWhatsappChat(number: any) {
        sessionStorage.setItem('chatNumbers', JSON.stringify([number]));
        this.router.navigate(['whatsappchat']);
    }

    filterCustomers(num: any) {
        this.selected = num;
        if (num == 1) {
            const today = new Date().toISOString().split('T')[0]; // Get today's date in 'YYYY-MM-DD' format
            console.log('today>>>>>>>>>>>>>>>', today);
            this.todayRemindCustomers = this.allCustomersList.filter((element: any) => {
                // Ensure wb_cus_remind_date is in 'YYYY-MM-DD' format as a string
                const remindDate = new Date(element.wb_cus_remind_date).toISOString().split('T')[0];
                return remindDate == today;
            });
            this.customersList = this.todayRemindCustomers;
        } else {
            this.customersList = this.allCustomersList;
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
