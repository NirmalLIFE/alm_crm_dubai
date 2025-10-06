import { DatePipe } from '@angular/common';
import { getSafePropertyAccessString } from '@angular/compiler';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalComponent } from 'angular-custom-modal';
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
    @ViewChild('sessionClearModal', { static: false }) sessionClearModal: any;
    public search = '';
    public load_flag: boolean = true;
    public leadList: any = [];
    public calllogphn: any = [];
    public newPurposeList: any[] = [];
    public call_purpose = '0';
    public source = '0';
    public sourceList: any[] = [];
    // public dateFrom: any = this.datePipe.transform(moment(new Date()).startOf('month').toDate(), 'yyyy-MM-dd') || '';
    public dateFrom: any = this.datePipe.transform(moment().toDate(), 'yyyy-MM-dd') || '';
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
    public user_role = atob(atob(localStorage.getItem('us_role_id') || '{}'));

    cols = [
        { field: 'action', title: 'Action', hide: false },
        ...(['13', '1', '19'].includes(this.user_role) ? [{ field: 'ld_verify_flag', title: 'Verified', hide: false }] : []),
        { field: 'phone', title: 'Number', hide: false },
        { field: 'name', title: 'Customer', hide: false },
        { field: 'customer_Type', title: 'Type', hide: false },
        { field: 'lead_source_detail', title: 'Source' },
        { field: 'lead_note', title: 'Lead Note', hide: false },
        { field: 'lead_purpose', title: 'Purpose' },
        { field: 'lead_createdon', title: 'Date', hide: false },
        { field: 'lead_code', title: 'Code', isUnique: true, hide: false },
        { field: 'ld_sts', title: 'Status', hide: false },
        { field: 'created', title: 'Lead Created', hide: false },
        { field: 'us_firstname', title: 'Assigned', hide: false },
    ];
    firstSearch: boolean = false;

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
                if (this.user_role == '19') {
                    this.sourceList = rData.source.filter((element: any) => element.ld_src_id == '8' || element.ld_src_id == '9');
                } else {
                    this.sourceList = rData.source;
                }
            }
        });
    }


    //alert and session storgae dont works if the function is called from ngOninit()
    ngAfterViewInit() {
        let searchDataStr = sessionStorage.getItem('Sleads');

        if (searchDataStr) {
            const oldParams = JSON.parse(searchDataStr);

            const newParams = {
                dateFrom: this.dateFrom,
                dateTo: this.dateTo,
                purpose: this.call_purpose ?? 0,
                source: this.source ?? 0,
            };
            //checks if the user backtracks to the default search of the System...
            if (
                newParams.dateFrom !== oldParams.dateFrom ||
                newParams.dateTo !== oldParams.dateTo ||
                newParams.purpose !== oldParams.purpose ||
                newParams.source !== oldParams.source
            ) {
                this.showAlert();
            } else {
                this.fetchAllLeads();
            }
        } else {
            this.fetchAllLeads();
        }
    }
    ngOnInit(): void {}

    fetchAllLeads(filter?: any) {
        this.totalCount.totalLeads = 0;
        this.totalCount.openLeads = 0;
        this.totalCount.convertedLeads = 0;
        this.totalCount.closedLeads = 0;
        this.load_flag = true;
        const data = filter || {
            dateFrom: this.dateFrom,
            dateTo: this.dateTo,
            purpose: this.call_purpose ?? 0,
            source: this.source ?? 0,
        };
        sessionStorage.setItem('Sleads', JSON.stringify(data));
        this.userServices.fetchAllLeads(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                if (this.user_role == '19') {
                    this.leadList = rdata.lead.filter((element: any) => element.source_id == '8' || element.source_id == '9');
                    this.allLeads = rdata.lead.filter((element: any) => element.source_id == '8' || element.source_id == '9');
                } else {
                    this.leadList = rdata.lead;
                    this.allLeads = rdata.lead;
                }
                this.load_flag = false;

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
                    '9': 'Whatsapp Direct',
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
        if (item.apptm_id != null) {
            this.router.navigateByUrl('leads/appointment/appointment-details/' + btoa(item.apptm_id));
        } else if (item.purpose_id == '3') {
            this.router.navigateByUrl('leads/quotation/quotation-details/' + btoa(item.lead_id));
        } else if (item.purpose_id == '2' || item.purpose_id == '4') {
            this.router.navigateByUrl('lead_update/' + btoa(item.lead_id));
        } else {
            this.router.navigateByUrl('lead_update/' + btoa(item.lead_id));
        }
    }

    redirectToWhatsappChat(number: any) {
        sessionStorage.setItem('chatNumbers', JSON.stringify([number]));
        this.router.navigate(['whatsappchat']);
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

    //function to run if the alert is YES
    onModalYes() {
        let searchDataStr = sessionStorage.getItem('Sleads');
        if (searchDataStr) {
            let searchData = JSON.parse(searchDataStr);

            this.dateFrom = searchData.dateFrom;
            this.dateTo = searchData.dateTo;
            this.call_purpose = searchData.purpose;
            this.source = searchData.source;
            this.fetchAllLeads(searchData);
        }
        this.sessionClearModal.close();
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

    //use to show the user the alert to re enable the previous filters ....
    showAlert() {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                popup: 'sweet-alerts',
                confirmButton: 'btn btn-secondary',
                cancelButton: 'btn btn-danger ltr:mr-3 rtl:ml-3',
            },
            buttonsStyling: false,
        });
        swalWithBootstrapButtons
            .fire({
                title: 'Restore Previous Search?',
                text: "You won't be able to revert this!",
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Confirm !',
                cancelButtonText: 'Cancel',
                reverseButtons: true,
                padding: '2em',
            })
            .then((result) => {
                if (result.value) {
                    this.onModalYes();
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    sessionStorage.removeItem('Sleads');
                    this.fetchAllLeads();
                }
            });
    }
}
