import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-lead-analysis',
    templateUrl: './lead-analysis.component.html',
    styleUrls: ['./lead-analysis.component.css'],
})
export class LeadAnalysisComponent implements OnInit {
    @ViewChild('dataTable') dataTable: any;
    @ViewChild('campMessageModal') campMessageModal: any;

    public search = '';
    public load_flag: boolean = true;
    // public dateFrom: any = this.datePipe.transform(moment(new Date()).startOf('month').toDate(), 'yyyy-MM-dd') || '';
    // public dateTo: any = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
    public selectedLeadSource: any = [];
    public sourceList: any[] = [];
    public selectedCustomerList: any = [];
    public leadList: any[] = [];
    public campaignName: any;
    public tab9: any = 'home';
    public selectedSource: any = this.tab9 === 'home' ? '0' : '1';
    public dateFrom: any = '';
    public dateTo: any = '';
    public selectedMonth: any = this.tab9 === 'home' ? '15' : '15';
    public messageFlag: boolean = false;
    public campaignDateFrom = '';
    public campaignDateTo = '';

    cols = [
        { field: 'lead_code', title: 'Lead Code', isUnique: true },
        { field: 'name', title: 'Customer Name' },
        { field: 'phone', title: 'Contact' },
        { field: 'ld_src', title: 'Lead Source' },
        { field: 'ld_sts', title: 'Lead Status' },
        { field: 'call_purpose', title: 'Lead Purpose' },
        { field: 'lead_createdon', title: 'Created On' },
        { field: 'lead_note', title: 'Note' },
        // { field: 'assigned_user', title: 'Assigned To' },
    ];

    lost_cols = [
        { field: 'customer_no', title: 'Code', isUnique: true },
        { field: 'customer_name', title: 'Name' },
        { field: 'phone', title: 'Contact' },
        { field: 'car_reg_no', title: 'Reg No' },
        { field: 'invoice_date', title: 'Last Invoice Date' },
        { field: 'user_name', title: 'Service Advisor' },
        // { field: 'lead_createdon', title: 'Created On' },
        // { field: 'lead_note', title: 'Note' },
        // { field: 'assigned_user', title: 'Assigned To' },
    ];

    constructor(private userServices: StaffPostAuthService, private cdRef: ChangeDetectorRef, public router: Router, public datePipe: DatePipe) {
        this.userServices.getLeadSource().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.sourceList = rData.source;
            }
        });

        this.setDates();
    }

    ngOnInit(): void {
        this.getLeadAnalysisReport();
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });
        const currentYear = new Date().getFullYear();
        this.campaignName = `${currentMonth}-${currentYear}-Campaign`;
    }

    getLeadAnalysisReport() {
        this.load_flag = true;
        this.leadList = [];
        this.selectedCustomerList = [];
        let data = {
            dateFrom: this.dateFrom,
            dateTo: this.dateTo,
            source: this.selectedSource,
            leadSource: this.selectedLeadSource,
        };

        this.userServices.getLeadsList(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.leadList = rdata.LeadList;
                this.load_flag = false;
            } else {
                // this.coloredToast('danger', 'Cant fetch leads, please try again later');
                this.load_flag = false;
            }
        });
    }

    updateCheckedList() {
        this.selectedCustomerList = this.dataTable.getSelectedRows().map((row: any) => ({
            mobile: row.phone,
            lead_id: row.lead_id,
        }));
    }

    sendBroadcastWhatsappCampaignMessage(campaignName: any) {
        this.messageFlag = true;
        if (!this.campaignName) {
            this.coloredToast('danger', 'Please enter campaign name');
            this.messageFlag = false;
            return;
        }

        if (!this.campaignDateFrom) {
            this.coloredToast('danger', 'Please select a campaign start date');
            this.messageFlag = false;
            return;
        }

        if (!this.campaignDateTo) {
            this.coloredToast('danger', 'Please select a campaign end date');
            this.messageFlag = false;
            return;
        }

        let data = {
            alm_wb_msg_source: '2',
            alm_wb_msg_staff_id: atob(atob(localStorage.getItem('us_id') || '{}')),
            alm_wb_msg_type: '5',
            alm_wb_msg_status: 1,
            alm_wb_msg_customer: '',
            alm_wb_msg_reply_id: '0',
            alm_wb_msg_created_on: Date.now(),
            alm_wb_msg_mobile: this.selectedCustomerList,
            alm_wb_msg_delete_flag: '0',
            alm_wb_msg_camp_type: this.tab9 === 'home' ? '1' : '2',
            us_firstname: atob(atob(localStorage.getItem('us_firstname') || '{}')),
            campaignName: campaignName.trim(),
            campaignDateFrom: this.campaignDateFrom,
            campaignDateTo: this.campaignDateTo,
        };

        this.userServices.sendBroadcastWhatsappCampaignMessage(data).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.campMessageModal.close();
                this.messageFlag = false;
                // this.campaignName = '';
                this.coloredToast('success', 'Message Send Successfully');
                this.tab9 = this.tab9;
                this.selectedSource = this.tab9 === 'home' ? '0' : '1';
                this.selectedMonth = this.tab9 === 'home' ? '15' : '15';
                this.getLeadAnalysisReport();
                // this.selectedCustomers = [];
            } else {
                this.messageFlag = false;
                this.coloredToast('danger', "Can't Send Whatsapp Messages , Please Try Again Later");
            }
        });
    }

    changeSource() {
        this.selectedSource = this.tab9 === 'home' ? '0' : '1';
        this.setDates();
        this.getLeadAnalysisReport();
    }

    // changeMonth(selectedMonth: any) {
    //     this.dateFrom = '';
    //     this.dateTo = '';
    //     let monthsBack = 0;
    //     switch (selectedMonth) {
    //         case '15':
    //             monthsBack = 15;
    //             break;
    //         case '18':
    //             monthsBack = 18;
    //             break;
    //         case '21':
    //             monthsBack = 21;
    //             break;
    //         case '24':
    //             monthsBack = 24;
    //             break;
    //         default:
    //             monthsBack = 15;
    //     }
    //     const dateToEnd = moment().subtract(monthsBack, 'months').endOf('month').toDate();
    //     this.dateTo = this.datePipe.transform(dateToEnd, 'yyyy-MM-dd') || '';
    //     const dateFromStart = moment().subtract(monthsBack, 'months').startOf('month').toDate();
    //     this.dateFrom = this.datePipe.transform(dateFromStart, 'yyyy-MM-dd') || '';
    // }

    setDates(): void {
        if (this.tab9 !== 'home') {
            let monthsBack = 0;
            switch (this.selectedMonth) {
                case '15':
                    monthsBack = 15;
                    break;
                case '18':
                    monthsBack = 18;
                    break;
                case '21':
                    monthsBack = 21;
                    break;
                case '24':
                    monthsBack = 24;
                    break;
                case '27':
                    monthsBack = 27;
                    break;
                default:
                    monthsBack = 15;
            }
            const dateToEnd = moment().subtract(monthsBack, 'months').endOf('month').toDate();
            this.dateTo = this.datePipe.transform(dateToEnd, 'yyyy-MM-dd') || '';
            const dateFromStart = moment().subtract(monthsBack, 'months').startOf('month').toDate();
            this.dateFrom = this.datePipe.transform(dateFromStart, 'yyyy-MM-dd') || '';

            // Set `dateTo` to the last date of the month 15 months back
            // const fifteenMonthsBackEnd = moment().subtract(15, 'months').endOf('month').toDate();
            // this.dateTo = this.datePipe.transform(fifteenMonthsBackEnd, 'yyyy-MM-dd') || '';

            // // Set `dateFrom` to the first date of the month 15 months back
            // const fifteenMonthsBackStart = moment().subtract(15, 'months').startOf('month').toDate();
            // this.dateFrom = this.datePipe.transform(fifteenMonthsBackStart, 'yyyy-MM-dd') || '';
        } else {
            // Default values for 'home'
            this.dateFrom = this.datePipe.transform(moment(new Date()).startOf('month').toDate(), 'yyyy-MM-dd') || '';
            this.dateTo = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
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
