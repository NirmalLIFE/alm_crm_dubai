import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { colDef } from '@bhplugin/ng-datatable';
import { log } from 'console';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';

@Component({
    selector: 'app-whatsapp-leads-list',
    templateUrl: './whatsapp-leads-list.component.html',
    styleUrls: ['./whatsapp-leads-list.component.css'],
})
export class WhatsappLeadsListComponent {
    public search = '';
    public load_flag: boolean = true;
    public whatsappLeadList: any = [];
    public allWhatsappLeadList: any = [];
    public dateFrom: any = this.datepipe.transform(moment(new Date()).subtract(7, 'days').toDate(), 'yyyy-MM-dd') || '';
    public dateTo: any = null;
    public selected = 0;
    public calllogphn: any = [];
    public campaignWhatsappLeads = [];
    public directWhatsappLeads = [];
    public latestJobCards: any = [];
    public openJobcardCampaignLeads: any = [];
    public invJobcardCampaignLeads: any = [];
    public openJobcardDirectLeads: any = [];
    public invJobcardDirectLeads: any = [];
    public jobCardModalHeading: any;
    public convertedLeads = 0;
    public openJobcardLeads = 0;
    public invJobcardLeads = 0;
    public campaignJobcardFlag: boolean = false;
    public allDirectLeads: any = [];
    public allCampaignLeads: any = [];
    public user_role = atob(atob(localStorage.getItem('us_role_id') || '{}'));

    @ViewChild('calllogmodal') calllogmodal: any;
    @ViewChild('jobcardmodal') jobcardmodal: any;

    cols = [
        { field: 'lead_code', title: 'Lead Code', isUnique: true, hide: false },
        { field: 'phone', title: 'Number', hide: false },
        { field: 'name', title: 'Customer', hide: false },
        { field: 'ld_src', title: 'Source' },
        { field: 'campaign_displayname', title: 'Campaign Name' },
        { field: 'reg_no', title: 'Reg.No', hide: true },
        { field: 'us_firstname', title: 'Assigned', hide: true },
        { field: 'lead_note', title: 'Note', hide: false },
        { field: 'created', title: 'Created', hide: false },
        { field: 'action', title: 'Action', hide: false },
    ];

    directCols = [
        { field: 'lead_code', title: 'Lead Code', isUnique: true, hide: false },
        { field: 'phone', title: 'Number', hide: false },
        { field: 'name', title: 'Customer', hide: false },
        { field: 'ld_src', title: 'Source' },
        { field: 'lead_note', title: 'Note', hide: false },
        { field: 'created', title: 'Created', hide: false },
    ];
    campaignCols = [
        { field: 'lead_code', title: 'Lead Code', isUnique: true, hide: false },
        { field: 'phone', title: 'Number', hide: false },
        { field: 'name', title: 'Customer', hide: false },
        { field: 'ld_src', title: 'Source' },
        { field: 'campaign_displayname', title: 'Campaign Name' },
        { field: 'lead_note', title: 'Note', hide: false },
        { field: 'created', title: 'Created', hide: false },
    ];

    constructor(private userServices: StaffPostAuthService, public router: Router, private http: HttpClient, public datepipe: DatePipe) {}

    ngOnInit(): void {
        this.getwhatsAppLeads();
    }

    getwhatsAppLeads() {
        this.load_flag = true;
        this.allWhatsappLeadList = [];
        this.whatsappLeadList = [];
        this.campaignWhatsappLeads = [];
        this.directWhatsappLeads = [];
        this.openJobcardCampaignLeads = [];
        this.invJobcardCampaignLeads = [];
        this.openJobcardDirectLeads = [];
        this.invJobcardDirectLeads = [];
        this.convertedLeads = 0;
        this.openJobcardLeads = 0;
        this.invJobcardLeads = 0;
        this.allCampaignLeads = [];
        this.allDirectLeads = [];

        let data = {
            dateFrom: this.dateFrom,
            dateTo: this.dateTo,
        };

        this.userServices.getWhatsappLeadsList(data).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.allWhatsappLeadList = rData.whatsappLeadList;
                this.campaignWhatsappLeads = rData.whatsappLeadList.filter((data: any) => data.source_id == '8');
                this.directWhatsappLeads = rData.whatsappLeadList.filter((data: any) => data.source_id == '9');




                
                const phones = rData.whatsappLeadList.map((phn: any) => phn.phone);
                this.userServices.getLatestJobCard({ phones: phones }).subscribe((rData: any) => {
                    if (rData.ret_data == 'success') {
                        this.latestJobCards = rData.jobcards;
                        this.allWhatsappLeadList.forEach((element: any) => {
                            this.latestJobCards.forEach((element2: any) => {
                                if (this.latestJobCards.length > 0) {
                                    if (element.phone.slice(-9) === element2.phone.slice(-9)) {
                                        element['openjobcard'] = false;
                                        const lead_created = new Date(element.lead_createdon);
                                        const jobOpenDate = new Date(element2.job_open_date);
                                        lead_created.setHours(0, 0, 0, 0);
                                        jobOpenDate.setHours(0, 0, 0, 0);
                                        element['job_open_date'] = element2.job_open_date;
                                        if (jobOpenDate >= lead_created) {
                                            element.openjobcard = true;
                                            element['job_status'] = element2.job_status;
                                            element['job_open_date'] = element2.job_open_date;
                                            // this.appointmentCounts.Laabs_visited_appts++;
                                        }
                                    }
                                }
                            });
                        });
                        this.whatsappLeadList = this.allWhatsappLeadList;
                        // this.openJobcardLeads = this.allWhatsappLeadList.filter((data: any) => {
                        //     return data.job_status && data.job_status === 'OPN';
                        // }).length;
                        this.jobCardFilterWhatsappLeads();
                        //this.load_flag = false;
                    } else {
                        this.whatsappLeadList = this.allWhatsappLeadList;
                        this.load_flag = false;
                    }
                });
            } else {
                this.load_flag = false;
            }
        });
    }

    filterWhatsappLeads(value: any) {
        if (value == 1) {
            this.whatsappLeadList = this.allWhatsappLeadList.filter((data: any) => data.source_id == '8');
            this.selected = 1;
        } else if (value == 2) {
            this.whatsappLeadList = this.allWhatsappLeadList.filter((data: any) => data.source_id != '8');
            this.selected = 2;
        } else if (value == 3) {
            this.whatsappLeadList = this.allWhatsappLeadList.filter((data: any) => {
                return data.job_status && data.job_status === 'OPN';
            });
            this.selected = 3;
        } else {
            this.whatsappLeadList = this.allWhatsappLeadList;
            this.selected = 0;
        }
    }

    jobCardFilterWhatsappLeads() {
        console.log('allwhatsapp Leads>>>>>>>>>>>>>>>>', this.allWhatsappLeadList);
        this.allCampaignLeads = this.allWhatsappLeadList.filter((data: any) => data.openjobcard && data.openjobcard === true && data.source_id == '8');
        this.allDirectLeads = this.allWhatsappLeadList.filter((data: any) => data.openjobcard && data.openjobcard === true && data.source_id != '8');
        this.openJobcardCampaignLeads = this.allWhatsappLeadList.filter((data: any) => data.job_status && data.job_status === 'OPN' && data.source_id === '8');
        this.invJobcardCampaignLeads = this.allWhatsappLeadList.filter((data: any) => data.job_status && data.job_status === 'INV' && data.source_id === '8');
        this.openJobcardDirectLeads = this.allWhatsappLeadList.filter((data: any) => data.job_status && data.job_status === 'OPN' && data.source_id !== '8');
        this.invJobcardDirectLeads = this.allWhatsappLeadList.filter((data: any) => data.job_status && data.job_status === 'INV' && data.source_id !== '8');
        this.load_flag = false;
    }

    viewMorereports(value: any) {
        this.jobCardModalHeading = '';
        this.convertedLeads = 0;
        this.openJobcardLeads = 0;
        this.invJobcardLeads = 0;
        if (value == 1) {
            this.jobCardModalHeading = 'WhatsApp Campaign Leads';
            this.convertedLeads = this.openJobcardCampaignLeads.length + this.invJobcardCampaignLeads.length;
            this.openJobcardLeads = this.openJobcardCampaignLeads.length;
            this.invJobcardLeads = this.invJobcardCampaignLeads.length;
            this.campaignJobcardFlag = true;
        } else {
            this.jobCardModalHeading = 'WhatsApp Direct Leads';
            this.convertedLeads = this.openJobcardDirectLeads.length + this.invJobcardDirectLeads.length;
            this.openJobcardLeads = this.openJobcardDirectLeads.length;
            this.invJobcardLeads = this.invJobcardDirectLeads.length;
            this.campaignJobcardFlag = false;
        }
        this.jobcardmodal.open();
    }

    modalFilterWhatsappLeads(value: any) {
        if (value === 1 || value === 2) {
            this.allCampaignLeads = value === 1 ? this.openJobcardCampaignLeads : this.invJobcardCampaignLeads;
        } else if (value === 4 || value === 5) {
            this.allDirectLeads = value === 4 ? this.openJobcardDirectLeads : this.invJobcardDirectLeads;
        } else if (value == 3) {
            this.allCampaignLeads = this.allWhatsappLeadList.filter((data: any) => data.openjobcard && data.openjobcard === true && data.source_id == '8');
        } else if (value == 6) {
            this.allDirectLeads = this.allWhatsappLeadList.filter((data: any) => data.openjobcard && data.openjobcard === true && data.source_id != '8');
        }
        this.selected = value;
    }

    chatWithCustomer() {
        this.router.navigate(['/whatsappchat']);
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

    updateColumn(col: colDef) {
        col.hide = !col.hide;
        this.cols = [...this.cols]; // Create a new reference of the array
    }
}
