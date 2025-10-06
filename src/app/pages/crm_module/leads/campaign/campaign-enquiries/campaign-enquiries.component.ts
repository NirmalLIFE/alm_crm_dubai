import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import { colDef } from '@bhplugin/ng-datatable';
import Swal from 'sweetalert2';
import { FlatpickrOptions } from 'ng2-flatpickr';

@Component({
    selector: 'app-campaign-enquiries',
    templateUrl: './campaign-enquiries.component.html',
    styleUrls: ['./campaign-enquiries.component.css'],
})
export class CampaignEnquiriesComponent implements OnInit {
    public search = '';
    public load_flag: boolean = true;
    public campaignList: any = [];
    public dateFrom: any = this.datePipe.transform(moment(new Date()).startOf('month').toDate(), 'yyyy-MM-dd') || '';
    public dateTo: any = null;
    public calllogphn: any = [];
    public campaignDetails: any;
    public leads: any[] = [];
    public campflag: boolean = true;
    public apptm_id: any;
    public appoint_flag: boolean = false;
    public userList: any[] = [];
    public sourceList: any[] = [];
    basic: FlatpickrOptions;
    public AllcampaignList: any = [];

    phnnum: any = [];
    calls: any = [];
    cdrstartDate: any;
    cdrendDate: any;
    allcampaignList: any = [];
    openedCampaign: any = [];
    closedCampaign: any = [];
    notCallbackCust: any = [];
    callbackCust = 0;
    public selected = 0;
    allPhnNum: any = [];

    public timeExceededCampaignList: any = [];
    public today: any = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
    public socialMediaCampaignList: any[] = [];
    public socialMediaSourceList: any[] = [];
    public createFlag: boolean = false;

    @ViewChild('calllogmodal') calllogmodal: any;
    @ViewChild('campaignModal') campaignModal: any;

    cols = [
        { field: 'lead_code', title: 'Lead Code', isUnique: true, hide: false },
        { field: 'phone', title: 'Number', hide: false },
        { field: 'name', title: 'Customer', hide: false },
        { field: 'lead_source', title: 'Source' },
        { field: 'camp_name', title: 'Campaign Name' },
        { field: 'reg_no', title: 'Reg.No', hide: false },
        { field: 'us_firstname', title: 'Assigned', hide: false },
        { field: 'lead_note', title: 'Note', hide: false },
        { field: 'created', title: 'Created', hide: false },
        { field: 'action', title: 'Action', hide: false },
    ];

    constructor(public router: Router, private userServices: StaffPostAuthService, public datePipe: DatePipe) {
        this.cdrstartDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
        this.cdrendDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
        this.basic = {
            dateFormat: 'Y-m-d',
            minDate: new Date(),
        };
        this.campaignDetails = {
            customerName: null,
            customerNumber: null,
            call_purpose: '2',
            call_note: null,
            assigned_to: null,
            campaign_data: null,
        };

        this.userServices.socialMediaCampaignsource().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.socialMediaSourceList = rData.sourceList;
            }
        });
    }

    ngOnInit() {
        this.userServices.getCampaignList().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.AllcampaignList = rData.camp;
            }
        });
        this.userServices.userList().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.userList = rData.userList;
            }
        });
        this.userServices.getLeadSource().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.sourceList = rData.source;
            }
        });
        this.getCampaignEnquiry();
    }

    getCampaignEnquiry() {
        this.load_flag = true;
        this.campaignList = [];
        this.allcampaignList = [];
        this.openedCampaign = [];
        this.closedCampaign = [];
        this.notCallbackCust = [];
        this.callbackCust = 0;
        this.timeExceededCampaignList = [];

        let data = {
            purpose_id: '2',
            dateFrom: this.dateFrom,
            dateTo: this.dateTo,
        };

        let pendata = {
            purpose_id: '2',
            status: [1],
        };

        this.userServices.getCampaignEnquiry(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.campaignList = rdata.CampaignList;
                this.allcampaignList = rdata.CampaignList;
                this.phnnum = this.campaignList.map((customer: any) => customer.phone);
                this.load_flag = false;
                this.getcalldetails();
            } else {
                this.load_flag = false;
            }
        });
        this.userServices.getCampaignEnquiry(pendata).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.timeExceededCampaignList = rdata.CampaignList.filter((data: any) => data.status_id == '1');
                this.allPhnNum = this.timeExceededCampaignList.map((customer: any) => customer.phone);
                this.load_flag = false;
                this.getALLcalldetails();
            } else {
                this.load_flag = false;
            }
        });
    }

    getcalldetails() {
        this.calls = [];
        this.load_flag = true;
        let inData = {
            start_date: this.cdrstartDate + ' 00:00:00',
            end_date: this.cdrendDate + ' 23:59:59',
            call_to: this.phnnum,
            //call_type: "Outbound",
        };
        this.userServices.getOutboundCalls(inData).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.calls = rdata.customer;
                this.allcampaignList.forEach((element: any) => {
                    element['callbackstatus'] = false;
                    this.calls.forEach((element2: any) => {
                        element2.forEach((element3: any) => {
                            if (element.call_from == element3.dst && element3.calltype === 'Outbound') {
                                if (element.lcl_created_on <= element3.datetime) {
                                    const calldate = new Date(element3.datetime);
                                    const lclcreatedon = new Date(element.lcl_created_on);
                                    const difference = calldate.getTime() - lclcreatedon.getTime();
                                    if (difference < 3 * 60 * 60 * 1000) {
                                        // The element 3 datetime is within the 3 hours of lcl_created_on datetime
                                        element.callbackstatus = true;
                                    }
                                }
                            }
                        });
                    });
                });
                this.getCount();
            } else {
                this.load_flag = false;
            }
        });
    }

    getALLcalldetails() {
        this.load_flag = true;
        let inData = {
            start_date: this.cdrstartDate + ' 00:00:00',
            end_date: this.cdrendDate + ' 23:59:59',
            call_to: this.allPhnNum,
            //call_type: "Outbound",
        };
        this.userServices.getOutboundCalls(inData).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.timeExceededCampaignList.forEach((element: any) => {
                    rdata.customer.forEach((element2: any) => {
                        element2.forEach((element3: any) => {
                            if (element.call_from == element3.dst && element3.calltype === 'Outbound') {
                                if (element.lcl_created_on <= element3.datetime) {
                                    const calldate = new Date(element3.datetime);
                                    const lclcreatedon = new Date(element.lcl_created_on);
                                    const difference = calldate.getTime() - lclcreatedon.getTime();
                                    if (difference < 3 * 60 * 60 * 1000) {
                                        // The element 3 datetime is within the 3 hours of lcl_created_on datetime
                                        element.callbackstatus = true;
                                    }
                                }
                            }
                        });
                    });
                });
                this.timeExceededCampaignList.filter((data: any) => data.callbackstatus == false);
            } else {
                this.load_flag = false;
            }
        });
    }

    getCount() {
        this.load_flag = false;
        this.openedCampaign = this.allcampaignList.filter((data: any) => data.status_id == '1');
        this.closedCampaign = this.allcampaignList.filter((data: any) => data.status_id == '6');
        this.callbackCust = this.openedCampaign.filter((data: any) => data.callbackstatus).length;
        this.notCallbackCust = this.openedCampaign.length - this.callbackCust;
        // this.campaignList = this.allcampaignList;
    }

    filterCampaigns(value: any) {
        if (value == 2) {
            this.campaignList = this.allcampaignList.filter((data: any) => data.status_id == '1');
            this.selected = 2;
        } else if (value == 3) {
            this.campaignList = this.allcampaignList.filter((data: any) => data.status_id == '6');
            this.selected = 3;
        } else if (value == 10) {
            this.campaignList = this.openedCampaign.filter((data: any) => data.callbackstatus == false);
            this.selected = 10;
        } else {
            this.campaignList = this.allcampaignList;
            this.selected = 0;
        }
    }

    updateColumn(col: colDef) {
        col.hide = !col.hide;
        this.cols = [...this.cols]; // Create a new reference of the array
    }

    createCampaign() {
        this.campaignModal.open();
        this.campaignDetails = {
            customerName: null,
            customerNumber: null,
            call_purpose: '2',
            call_note: null,
            assigned_to: null,
            campaign_data: null,
        };
        this.createFlag = false;
    }

    viewCampaignDetails(value: any) {
        this.router.navigateByUrl('campaign-details/' + btoa(value.lead_id));
    }

    checkExistigCust(phone: any) {
        if (/\D/.test(phone)) {
            this.coloredToast('danger', 'Customer Number should be only numbers');
            this.campflag = false;
        }
        if (phone.length >= 9) {
            this.userServices.isExistingCustOrNot({ phone }).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    this.campaignDetails.customerName = rdata.customer.cust_name;
                    this.leads = rdata.leads;
                    if(this.leads.length>0){
                        this.createFlag=true;
                    }
                    if (this.leads.length > 0 && this.leads[0].purpose_id == '1') {
                        this.appoint_flag = true;
                        this.apptm_id = this.leads[0].apptm_id;
                    }
                } else {
                }
            });
        } else {
        }
    }

    createCampaignLead(data: any) {
        this.campflag = true;
        this.createFlag = true;
        if (this.campaignDetails.customerNumber == null || this.campaignDetails.customerNumber == '') {
            this.campflag = false;
            this.createFlag = false;
            this.coloredToast('danger', 'Customer Number Required');
        } else if (/\D/.test(this.campaignDetails.customerNumber)) {
            this.coloredToast('danger', 'Customer Number should be only numbers');
            this.campflag = false;
            this.createFlag = false;
        } else if (this.campaignDetails.customerName == null || this.campaignDetails.customerName == '') {
            this.campflag = false;
            this.createFlag = false;
            this.coloredToast('danger', 'Customer Name Required');
        } else if (this.campaignDetails.source_id == null || this.campaignDetails.source_id == '') {
            this.campflag = false;
            this.createFlag = false;
            this.coloredToast('danger', 'Select An Lead Source');
        } else if (this.campaignDetails.assigned_to == null || this.campaignDetails.assigned_to == '') {
            this.campflag = false;
            this.createFlag = false;
            this.coloredToast('danger', 'A staff should be assigned');
        } else if (this.campaignDetails.campaign_data == null || this.campaignDetails.campaign_data == '') {
            this.campflag = false;
            this.createFlag = false;
            this.coloredToast('danger', 'Select An Lead Campaign');
        } else if (this.campaignDetails.call_note == null || this.campaignDetails.call_note == '') {
            this.campflag = false;
            this.createFlag = false;
            this.coloredToast('danger', 'Customer Remark should be provided');
        }

        if (this.campaignDetails.source_id == '2') {
            if (this.campaignDetails.social_media_source == null || this.campaignDetails.social_media_source == '') {
                this.campflag = false;
                this.createFlag = false;
                this.coloredToast('danger', 'Social Media Source Required');
            }
        }

        if (this.campaignDetails.social_media_source != '' && this.campaignDetails.social_media_source != null && this.campaignDetails.source_id == '2') {
            if (this.campaignDetails.social_media_camp == null || this.campaignDetails.social_media_camp == '') {
                this.campflag = false;
                this.createFlag = false;
                this.coloredToast('danger', 'Social Media Campaign Required');
            }
        }


        if (this.campflag && this.createFlag) {
            this.userServices.createLeadData(data).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    this.coloredToast('success', 'Campaign Lead Created Sucessfully');
                    this.campaignModalClose();
                    // this.appoint_flag = false;
                    // this.createFlag = false;
                    this.getCampaignEnquiry();
                } else {
                    this.coloredToast('danger', 'Some error occurred please try again');
                }
            });
        }
    }

    getSocialMediaCampaign(source: any) {
        this.socialMediaCampaignList = [];
        if (source == '2') {
            let data = {
                today: this.today,
            };
            this.userServices.getActiveSocialMediaCampaigns(data).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    this.socialMediaCampaignList = rdata.activeCampaigns.map((campaign: any) => ({
                        ...campaign,
                        displayLabel: `${campaign.smc_message}(${campaign.smc_name})`,
                    }));
                } else {
                    this.socialMediaCampaignList = [];
                }
            });
        } else {
            this.campaignDetails.social_media_camp = null;
            this.campaignDetails.social_media_source = null;
        }
    }

    getSocialMediaCampaignSource(camp_source: any) {
        const foundCampaign = this.socialMediaCampaignList.find((campaign) => campaign.smc_id == camp_source);
        if (foundCampaign) {
            this.campaignDetails.social_media_source = foundCampaign.smc_source;
        }
    }

    campaignModalClose() {
        this.campaignModal.close();
        this.leads = [];
        this.appoint_flag = false;
    }

    viewAppointmentDetails() {
        this.router.navigateByUrl('leads/appointment/appointment-details/' + btoa(this.apptm_id));
    }

    totalOverDueCampaigns() {
        this.router.navigateByUrl('timeExceededCampaigns');
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
