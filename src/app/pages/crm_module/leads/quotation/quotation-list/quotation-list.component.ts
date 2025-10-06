import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';
import { filter } from 'rxjs';

@Component({
    selector: 'app-quotation-list',
    templateUrl: './quotation-list.component.html',
    styleUrls: ['./quotation-list.component.css'],
})
export class QuotationListComponent implements OnInit {
    public search = '';
    public load_flag: boolean = true;
    public SRorQuotes: any = [];
    public allSRorQuotes: any = [];
    phnnum: any = [];
    calls: any = [];
    calllogphn: any = [];
    leadDetail: any = [];
    callbackCust = 0;
    notCallbackCust = 0;
    cdrstartDate: any;
    cdrendDate: any;
    public quotationDetails: any;
    public leads: any[] = [];
    public userList: any[] = [];
    public user_role: any = atob(atob(localStorage.getItem('us_role_id') || '{}'));
    appoint_flag = false;
    public sourceList: any[] = [];
    // public dateFrom: any = this.datepipe.transform(moment(new Date()).startOf('month').toDate(), 'yyyy-MM-dd') || '';
    public dateFrom: any = this.datepipe.transform(moment().toDate(), 'yyyy-MM-dd') || '';
    public dateTo: any = null;
    public apptm_id: any;

    public quoteflag: boolean = true;
    public closedQuotation: any = [];
    public openedQuotation: any = [];
    public selected = 0;

    public TotalSRorQuotes: any = [];
    public allQuotePhnNum: any = [];
    public totalTimeExceedQuotes: any = [];
    public convertedQuote: any = [];
    public today: any = this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '';
    public socialMediaCampaignList: any[] = [];
    public socialMediaSourceList: any[] = [];
    public createFlag: boolean = false;

    @ViewChild('calllogmodal') calllogmodal: any;
    @ViewChild('leadDetailModal') leadDetailModal: any;
    @ViewChild('quotationModal') quotationModal: any;
    @Output() modalEvent = new EventEmitter<boolean>();

    cols = [
        // { field: 'apptm_code', title: 'Code', isUnique: true, hide: false },
        { field: 'action', title: 'Action', hide: false },
        ...(['13', '1', '19'].includes(this.user_role) ? [{ field: 'ld_verify_flag', title: 'Verified', hide: false }] : []),
        { field: 'phone', title: 'Number', hide: false },
        { field: 'customer_name', title: 'Customer', hide: false },
        { field: 'lead_code', title: 'Lead' },
        { field: 'type', title: 'Type' },
        { field: 'lead_source', title: 'Source' },
        { field: 'c_date', title: 'Date', hide: false },
        { field: 'c_time', title: 'Time', hide: false },
        { field: 'us_firstname', title: 'Assigned', hide: false },
        { field: 'created_by', title: 'Created', hide: false },
        { field: 'lead_note', title: 'Remarks', hide: false },
        { field: 'quote_count', title: 'Attempts', hide: false },
        { field: 'status', title: 'Status', hide: false },
    ];

    constructor(public router: Router, private userServices: StaffPostAuthService, public datepipe: DatePipe) {
        this.cdrstartDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
        this.cdrendDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
        this.quotationDetails = {
            cust_name: '',
            call_from: '',
            appt_date: '',
            appt_time: '',
            appt_assign_to: null,
            apptm_transport_service: null,
            appt_note: '',
            apptm_type: '4',
        };

        this.userServices.socialMediaCampaignsource().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.socialMediaSourceList = rData.sourceList;
            }
        });
    }
    ngOnInit() {
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

        this.getquotationcalls();
    }

    getquotationcalls() {
        this.openedQuotation = [];
        this.closedQuotation = [];
        this.load_flag = true;
        this.appoint_flag = false;
        this.createFlag = false;
        this.callbackCust = 0;
        this.notCallbackCust = 0;
        this.SRorQuotes = [];
        this.leads = [];
        this.quotationDetails = {
            cust_name: '',
            call_from: '',
            appt_date: '',
            appt_time: '',
            appt_assign_to: null,
            apptm_transport_service: null,
            appt_note: '',
            apptm_type: '4',
        };
        // let data = {
        //     start_day: this.cdrstartDate + ' 00:00:00',
        //     end_day: this.cdrendDate + ' 23:59:59',
        //     purpose: [3],
        // };
        let data: any;
        let pendata: any;

        if (this.user_role == '11') {
            data = {
                start_day: this.dateFrom,
                end_day: this.dateTo,
                purpose: [3],
                us_id: atob(atob(localStorage.getItem('us_id') || '')),
                type: '1',
            };
            pendata = {
                purpose: [3],
                us_id: atob(atob(localStorage.getItem('us_id') || '')),
                type: '1',
                status: [1],
            };
        } else {
            data = {
                start_day: this.dateFrom,
                end_day: this.dateTo,
                purpose: [3],
                type: '0',
            };
            pendata = {
                purpose: [3],
                type: '0',
                status: [1],
            };
        }

        this.userServices.getQuotations(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.SRorQuotes = rdata.calls;
                this.allSRorQuotes = rdata.calls;
                this.convertedQuote = rdata.calls.filter((data: any) => data.status_id == '5');
                this.phnnum = this.SRorQuotes.map((customer: any) => customer.phone);
                this.allSRorQuotes.forEach((element: any) => {
                    element['callbackstatus'] = false;
                    var a = element.lead_createdon.split(' ');
                    var date = a[0];
                    var time = a[1];
                    element['c_date'] = date;
                    element['c_time'] = moment(time, 'HHmmss').format('hh:mm:ss A');
                    if (element.lql_type === '1') {
                        element['type'] = 'Normal Quotation';
                    } else if (element.lql_type === '2') {
                        element['type'] = 'Special or campaign Quotation';
                    } else {
                        element['type'] = 'NIL';
                    }
                    if (element.lql_status === '1') {
                        element['status'] = 'Quotation Provided';
                    } else if (element.lql_status === '2') {
                        element['status'] = 'Quotation Accepted';
                    } else if (element.lql_status === '3') {
                        element['status'] = 'Revise quote Requested';
                    } else if (element.lql_status === '4') {
                        element['status'] = 'Not Answering';
                    } else if (element.lql_status === '5') {
                        element['status'] = 'Quotation Rejected';
                    } else if (element.lql_status === '6') {
                        element['status'] = 'Customer Not Responding';
                    } else {
                        element['status'] = 'Quotation Not Provided';
                    }

                    if (element.cust_name != null) {
                        element['customer_name'] = element.cust_name;
                    } else if (element.name != null) {
                        element['customer_name'] = element.name;
                    } else if (element.name == null && element.cust_name == null) {
                        element['customer_name'] = 'NEW';
                    }
                    this.userList.forEach((element2) => {
                        if (element2.us_id == element.lead_createdby) {
                            element.created_by = element2.us_firstname;
                        }
                    });
                });
                this.getcalldetails();
            } else {
                this.load_flag = false;
            }
        });

        this.userServices.getQuotations(pendata).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.TotalSRorQuotes = rdata.calls;
                this.allQuotePhnNum = this.TotalSRorQuotes.map((customer: any) => customer.phone);
                this.TotalSRorQuotes.forEach((element: any) => {
                    element['callbackstatus'] = false;
                });
                this.getALLcalldetails();
            } else {
                this.load_flag = false;
            }
        });
    }

    filterQuotes(value: any) {
        this.SRorQuotes = [];
        if (value == 1) {
            this.SRorQuotes = this.allSRorQuotes.filter((data: any) => data.callbackstatus);
            this.selected = 1;
        } else if (value == 2) {
            this.SRorQuotes = this.allSRorQuotes.filter(
                (data: any) => data.lql_status != '4' && data.lql_status != '5' && data.lql_status != '6' && data.lql_status != '2'
            );
            this.selected = 2;
        } else if (value == 3) {
            this.SRorQuotes = this.allSRorQuotes.filter((data: any) => data.lql_status == '4' || data.lql_status == '5' || data.lql_status == '6'); //|| data.lql_status == '2'
            this.selected = 3;
        } else if (value == 10) {
            this.SRorQuotes = this.openedQuotation.filter((data: any) => data.callbackstatus == false);
            this.selected = 10;
        } else if (value == 4) {
            this.SRorQuotes = this.convertedQuote;
            this.selected = 4;
        } else {
            this.SRorQuotes = this.allSRorQuotes;
            this.selected = 0;
        }
    }

    getcalldetails() {
        this.calls = [];
        this.load_flag = true;
        let inData = {
            start_date: this.dateFrom + ' 00:00:00',
            end_date: this.cdrendDate + ' 23:59:59',
            call_to: this.phnnum,
            //call_type: "Outbound",
        };
        this.userServices.getOutboundCalls(inData).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.calls = rdata.customer;
                this.allSRorQuotes.forEach((element: any) => {
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
                                    } else {
                                    }
                                }
                            }
                        });
                    });
                });
                this.getCount();
                this.load_flag = false;
            } else {
                this.load_flag = false;
            }
        });
    }

    getALLcalldetails() {
        // this.load_flag = true;
        let inData = {
            start_date: this.cdrstartDate + ' 00:00:00',
            end_date: this.cdrendDate + ' 23:59:59',
            call_to: this.allQuotePhnNum,
            //call_type: "Outbound",
        };
        this.userServices.getOutboundCalls(inData).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.TotalSRorQuotes.forEach((element: any) => {
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
                let totalopenedQuotation = this.TotalSRorQuotes.filter(
                    (data: any) => data.lql_status != '4' && data.lql_status != '5' && data.lql_status != '6' && data.lql_status != '2'
                );
                this.totalTimeExceedQuotes = totalopenedQuotation.filter((data: any) => data.callbackstatus == false);
                // this.load_flag = false;
            } else {
                //  this.load_flag = false;
            }
        });
    }

    totalTimeExceededQuotations() {
        this.router.navigateByUrl('totalTimeExceededQuotations');
    }

    openQuotationModal() {
        this.quotationModal.open();
        this.createFlag = false;
    }

    quotationModalClose() {
        this.quotationModal.close();
        this.getquotationcalls();
    }

    createQuote(data: any) {
        this.quoteflag = true;
        this.createFlag = true;
        if (this.quotationDetails.phone == null || this.quotationDetails.phone == '') {
            this.quoteflag = false;
            this.createFlag = false;
            this.coloredToast('danger', 'Customer Number Required');
        } else if (/\D/.test(this.quotationDetails.phone)) {
            this.coloredToast('danger', 'Customer Number should be only numbers');
            this.quoteflag = false;
            this.createFlag = false;
        } else if (this.quotationDetails.cust_name == null || this.quotationDetails.cust_name == '') {
            this.quoteflag = false;
            this.createFlag = false;
            this.coloredToast('danger', 'Customer Name Required');
        } else if (this.quotationDetails.source == null || this.quotationDetails.source == '') {
            this.quoteflag = false;
            this.createFlag = false;
            this.coloredToast('danger', 'Select An Quotation Source');
        } else if (this.quotationDetails.assigned_to == null || this.quotationDetails.assigned_to == '') {
            this.quoteflag = false;
            this.createFlag = false;
            this.coloredToast('danger', 'A staff should be assigned');
        } else if (this.quotationDetails.customer_note == null || this.quotationDetails.customer_note == '') {
            this.quoteflag = false;
            this.createFlag = false;
            this.coloredToast('danger', 'Customer Remark should be provided');
        }

        if (this.quotationDetails.source == '2') {
            if (this.quotationDetails.social_media_source == null || this.quotationDetails.social_media_source == '') {
                this.quoteflag = false;
                this.createFlag = false;
                this.coloredToast('danger', 'Social Media Source Required');
            }
        }
        if (this.quotationDetails.social_media_source != '' && this.quotationDetails.social_media_source != null && this.quotationDetails.source_id == '2') {
            if (this.quotationDetails.social_media_camp == null || this.quotationDetails.social_media_camp == '') {
                this.quoteflag = false;
                this.createFlag = false;
                this.coloredToast('danger', 'Social Media Campaign Required');
            }
        }

        if (this.quoteflag && this.createFlag) {
            this.userServices.createQuotation(data).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    this.quotationModalClose();
                } else {
                    this.coloredToast('danger', 'Some Error Ocurred, Please Try Again');
                    this.createFlag = false;
                }
            });
        }else {
            this.coloredToast('danger', 'Please Fill All Missing Fields');
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
        }else{
            this.quotationDetails.social_media_camp = null;
            this.quotationDetails.social_media_source = null;
        }
    }

    getSocialMediaCampaignSource(camp_source: any) {
        const foundCampaign = this.socialMediaCampaignList.find((campaign) => campaign.smc_id == camp_source);
        if (foundCampaign) {
            this.quotationDetails.social_media_source = foundCampaign.smc_source;
        }
    }

    checkExistigCust(phone: any) {
        if (/\D/.test(phone)) {
            this.coloredToast('danger', 'Customer Number should be only numbers');
            this.quoteflag = false;
        }
        if (phone.length >= 9) {
            this.userServices.isExistingCustOrNot({ phone }).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    this.quotationDetails.cust_name = rdata.customer.cust_name;
                    this.leads = rdata.leads;
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

    viewAppointmentDetails() {
        this.router.navigateByUrl('leads/appointment/appointment-details/' + btoa(this.apptm_id));
    }

    quotesupdate(data: any) {
        this.router.navigateByUrl('leads/quotation/quotation-details/' + btoa(data.lead_id));
    }

    getCount() {
        this.load_flag = false;
        this.closedQuotation = this.allSRorQuotes.filter((data: any) => data.lql_status == '4' || data.lql_status == '5' || data.lql_status == '6'); //|| data.lql_status == '2'
        this.openedQuotation = this.allSRorQuotes.filter(
            (data: any) => data.lql_status != '4' && data.lql_status != '5' && data.lql_status != '6' && data.lql_status != '2'
        );
        this.callbackCust = this.openedQuotation.filter((data: any) => data.callbackstatus).length;
        this.notCallbackCust = this.openedQuotation.length - this.callbackCust;
        this.SRorQuotes = this.allSRorQuotes;
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

    openLeadDetailModal(data: any) {
        this.leadDetail = {
            lead_id: data,
        };
        this.leadDetailModal.open();
    }

    LeadDetailModalClose() {
        this.leadDetailModal.close();
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
