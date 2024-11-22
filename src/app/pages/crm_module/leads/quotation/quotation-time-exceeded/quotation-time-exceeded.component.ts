import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';

@Component({
    selector: 'app-quotation-time-exceeded',
    templateUrl: './quotation-time-exceeded.component.html',
    styleUrls: ['./quotation-time-exceeded.component.css'],
})
export class QuotationTimeExceededComponent implements OnInit {
    public search = '';
    cdrstartDate: any;
    cdrendDate: any;
    public userList: any[] = [];
    public user_role: any = atob(atob(localStorage.getItem('us_role_id') || '{}'));
    public TotalSRorQuotes: any = [];
    phnnum: any = [];
    calls: any = [];
    public load_flag: boolean = true;
    public dateFrom: any = null;
    public dateTo: any = null;
    calllogphn: any = [];
    leadDetail: any = [];

    @ViewChild('calllogmodal') calllogmodal: any;
    @ViewChild('leadDetailModal') leadDetailModal: any;

    cols = [
        // { field: 'apptm_code', title: 'Code', isUnique: true, hide: false },
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
        { field: 'action', title: 'Action', hide: false },
    ];

    constructor(public router: Router, private userServices: StaffPostAuthService, public datepipe: DatePipe) {
        this.cdrstartDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
        this.cdrendDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
    }
    ngOnInit() {
        this.userServices.userList().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.userList = rData.userList;
            }
        });
        this.getquotationcalls();
    }

    getquotationcalls() {
        let pendata: any;
        if (this.user_role == '11') {
            pendata = {
                start_day: this.dateFrom,
                end_day: this.dateTo,
                purpose: [3],
                us_id: atob(atob(localStorage.getItem('us_id') || '')),
                type: '1',
                status:[1]
            };
        } else {
            pendata = {
                start_day: this.dateFrom,
                end_day: this.dateTo,
                purpose: [3],
                type: '0',
                status:[1]
            };
        }

        this.userServices.getQuotations(pendata).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.TotalSRorQuotes = rdata.calls.filter(
                    (data: any) => data.lql_status != '4' && data.lql_status != '5' && data.lql_status != '6' && data.lql_status != '2'
                );
                this.phnnum = this.TotalSRorQuotes.map((customer: any) => customer.phone);
                this.TotalSRorQuotes.forEach((element: any) => {
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
                        if (element2.us_id == element.lcl_createdby) {
                            element.created_by = element2.us_firstname;
                        }
                    });
                });
                this.getcalldetails();
            } else {
                this.load_flag = false;
            }
        });
    }

    getcalldetails() {
        this.calls = [];
        this.load_flag = true;
        let inData = {
            start_date: this.cdrendDate + ' 00:00:00',
            end_date: this.cdrendDate + ' 23:59:59',
            call_to: this.phnnum,
            //call_type: "Outbound",
        };
        this.userServices.getOutboundCalls(inData).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.calls = rdata.customer;
                this.TotalSRorQuotes.forEach((element: any) => {
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
                this.TotalSRorQuotes = this.TotalSRorQuotes.filter((item: any) => item.callbackstatus == false);
                this.load_flag = false;
            } else {
                this.load_flag = false;
            }
        });
    }
    quotesupdate(data: any) {
        this.router.navigateByUrl('leads/quotation/quotation-details/' + btoa(data.lead_id));
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
}
