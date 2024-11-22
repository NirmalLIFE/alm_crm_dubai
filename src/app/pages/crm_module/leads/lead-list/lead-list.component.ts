import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-lead-list',
    templateUrl: './lead-list.component.html',
    styleUrls: ['./lead-list.component.css'],
})
export class LeadListComponent implements OnInit {
    @ViewChild('leadCreateModal') leadCreateModal: any;
    @ViewChild('calllogmodal') calllogmodal: any;
    public search = '';
    public load_flag: boolean = true;
    public leadList: any = [];
    public calllogphn: any = [];
    public newPurposeList: any[] = [];
    public call_purpose = '0';
    public source = '0';
    public sourceList: any[] = [];
    public dateFrom: any = this.datePipe.transform(moment(new Date()).startOf('month').toDate(), 'yyyy-MM-dd') || '';
    public dateTo: any = null;
    public selected = 0;
    public allLeads: any[] = [];
    public totalCount: any = {
        totalLeads: 0,
        openLeads: 0,
        convertedLeads: 0,
        closedLeads: 0,
    };

    public phnNum: any = [];

    cols = [
        { field: 'lead_code', title: 'Code', isUnique: true, hide: false },
        { field: 'phone', title: 'Number', hide: false },
        { field: 'name', title: 'Customer', hide: false },
        { field: 'customer_Type', title: 'Type', hide: false },
        { field: 'lead_createdon', title: 'Date', hide: false },
        { field: 'lead_source_detail', title: 'Source' },
        { field: 'lead_purpose', title: 'Purpose' },
        { field: 'ld_sts', title: 'Status', hide: false },
        { field: 'created', title: 'Lead Created', hide: false },
        { field: 'us_firstname', title: 'Assigned', hide: false },
        { field: 'lead_note', title: 'Lead Note', hide: false },
        { field: 'action', title: 'Action', hide: false },

    ];

    constructor(public router: Router, private userServices: StaffPostAuthService, public datePipe: DatePipe) {
        this.userServices.getPreloadDatas().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.newPurposeList = rData.purpose.filter((item: any) => item.new_cus_display == '1');
            } else {
                this.coloredToast('danger', 'Some error occurred, please try again later');
            }
        });

        this.userServices.getLeadSource().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.sourceList = rData.source;
            }
        });
    }
    ngOnInit() {
        this.fetchAllLeads();
    }

    fetchAllLeads() {
        this.totalCount.totalLeads = 0;
        this.totalCount.openLeads = 0;
        this.totalCount.convertedLeads = 0;
        this.totalCount.closedLeads = 0;
        this.load_flag = true;
        let data = {
            dateFrom: this.dateFrom,
            dateTo: this.dateTo,
            purpose: this.call_purpose ? this.call_purpose : 0,
            source: this.source ? this.source : 0,
        };
        console.log('data>>>>>>>>>>>>>>>>>>', data);
        this.userServices.fetchAllLeads(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.load_flag = false;
                this.leadList = rdata.lead;
                this.allLeads = rdata.lead;
                // this.phnNum = this.allLeads.map((customer: any) => customer.phone);
                this.totalCount.totalLeads = this.allLeads.length;
                this.totalCount.openLeads = this.allLeads.filter((element: any) => element.status_id == '1').length;
                this.totalCount.convertedLeads = this.allLeads.filter((element: any) => element.status_id == '5').length;
                this.totalCount.closedLeads = this.allLeads.filter((element: any) => element.status_id == '6').length;
                const purposeMapping: any = {
                    '1': 'Appointment',
                    '2': 'Campaign Enquiry',
                    '3': 'Service Request / Quotation',
                    '4': 'Parts Enquiry',
                    '6': 'Feedback / PSF',
                    '7': 'Others',
                    '8': 'Status Enquiry',
                    '9': 'Wrong Number',
                    '10': 'General Enquiry',
                };
                const leadSource: any = {
                    '1': 'Inbound Call',
                    '2': 'Social Media',
                    '3': 'Website',
                    '4': 'Campaigns',
                    '5': 'Direct Lead',
                    '6': 'Lost Customer',
                    '7': 'Google Marketing',
                    '8': 'Whatsapp Campaign',
                    '9': 'Whatsapp Direct'

                };
                this.leadList.forEach((element: any) => {
                    element.lead_purpose = purposeMapping[element.purpose_id] || 'NIL';
                    element.lead_source_detail = leadSource[element.source_id] || 'NIL';
                });
            } else {
                this.coloredToast('danger', 'Cant fetch leads, please try again later');
                this.load_flag = false;
            }
        });
    }
    filterLeads(type: any) {
        if (type == 0) {
            this.leadList = this.allLeads;
            this.selected = 0;
        } else if (type == 1) {
            this.leadList = this.allLeads.filter((element: any) => element.status_id == '1');
            this.selected = 1;
        } else if (type == 2) {
            this.leadList = this.allLeads.filter((element: any) => element.status_id == '5');
            this.selected = 2;
        } else if (type == 3) {
            this.leadList = this.allLeads.filter((element: any) => element.status_id == '6');
            this.selected = 3;
        }
    }

    createLead() {
        this.leadCreateModal.open();
    }
    leadEdit(item: any) {
        console.log('value>>>>>>>>>>>>>', item);
        if (item.apptm_id != null) {
            this.router.navigateByUrl('leads/appointment/appointment-details/' + btoa(item.apptm_id));
        } else if (item.purpose_id == '3') {
            this.router.navigateByUrl('leads/quotation/quotation-details/' + btoa(item.lead_id));
        } else if (item.purpose_id == '2' || item.purpose_id == '4') {
            this.router.navigateByUrl('lead_update/' + btoa(item.lead_id));
        }
    }

    leadCreateModalClose() {
        this.leadCreateModal.close();
        this.fetchAllLeads();
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
