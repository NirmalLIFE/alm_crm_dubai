import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-inbound-call-analysis',
    templateUrl: './inbound-call-analysis.component.html',
    styleUrls: ['./inbound-call-analysis.component.css'],
})
export class InboundCallAnalysisComponent implements OnInit {
    public search: string = '';
    public load_flag: boolean = true;
    public purposeList: any[] = [];
    numarray: any[] = [];
    arr_sample: any[] = [];
    calls_common: any[] = [];
    common: any[] = [];
    call_rep: any[] = [];
    callIdarray: any[] = [];
    timearray: any[] = [];
    userlist: any[] = [];
    report: any[] = [];
    nojobcardcustomer: any[] = [];
    jobcardcustomer: any[] = [];
    totalcall: any[] = [];
    public calllogphn: any = [];

    //customer detail modal
    cust_name: string = '';
    customerdata: any = [];
    custvehicle: any[] = [];
    custjobcard: any[] = [];
    cust_id: any;
    custtotalLead: any;
    custpendLead: any;
    custpenLeadId: any;
    custleadLog: any[] = [];
    custleads: any[] = [];

    public start_date: string = this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '';
    public end_date: string = this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '';
    filterParams: any = {
        username: 'ALL',
        call_purpose: 'ALL',
        customer_name: '0',
    };
    cols = [
        { field: 'customer', title: 'Customer',},
        { field: 'src', title: 'Call From' },
        { field: 'call_time', title: 'Last Call', },
        { field: 'call_purpose', title: 'Call purpose',},
        { field: 'notes', title: 'Notes', },
        { field: 'user', title: 'Last Answered',},
    ];

    @ViewChild('calllogmodal') calllogmodal: any;
    @ViewChild('custDetailModal') custDetailModal: any;

    constructor(
        private userServices: StaffPostAuthService,
        public datepipe: DatePipe,
        private router: Router,
        public storeData: Store<any>,
        public fb: FormBuilder
    ) {}
    ngOnInit(): void {
        this.userServices.getCallPurposeList().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.purposeList = rData.purpose;
                //  this.load_flag = false;
            } else {
                this.load_flag = false;
                this.coloredToast('danger', 'Some error occurred please try again');
            }
        });
        this.getinboundcalls();
    }

    getinboundcalls() {
        this.load_flag = true;
        this.numarray = [];
        this.arr_sample = [];
        this.calls_common = [];
        this.common = [];
        this.call_rep = [];
        this.callIdarray = [];
        this.timearray = [];
        this.userlist = [];
        this.report = [];

        let data = {
            call_type: 'Inbound',
            start_day: this.start_date + ' 00:00:00',
            end_day: this.end_date + ' 23:59:59',
        };

        this.userServices.userList().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.userlist = rdata.userList.filter((data: any) => data.ext_number !== '');
                // this.userlist = this.userlist

                this.userServices.getLatestCallReportData(data).subscribe((rdata: any) => {
                    if (rdata.ret_data == 'success') {
                        let _that = this;

                        if (rdata.call_data.length > 0) {
                            let filteredArr = rdata.call_data.filter((data: any) => data.src.length > 5 && data.src != 'Unknown'); // INBOUND CALLS FILTER
                            filteredArr = filteredArr.filter((data: any) => !(data.dst == '6300' && data.disposition == 'ANSWERED')); // REMOVE RINGGROUP AND ANSWERED

                            this.report = filteredArr.reduce(function (r: any, a: any) {
                                r[a.uid] = r[a.uid] || [];
                                r[a.uid].push(a);
                                return r;
                            }, []);
                            this.call_rep = Object.entries(this.report);
                            this.call_rep.forEach((element) => {
                                element.forEach(function (value: any, key: any) {
                                    if (key == 1) {
                                        let user = '';
                                        var a = value[0]['datetime'].split(' ');
                                        var date = a[0];
                                        var time = a[1];
                                        element['call_date'] = date;
                                        element['call_time'] = moment(time, 'HHmmss').format('hh:mm:ss A');
                                        for (let i = 0; i < value.length; i++) {
                                            var a = value[i]['datetime'].split(' ');
                                            var date = a[0];
                                            var time = a[1];
                                            value[i]['c_date'] = date;
                                            value[i]['c_time'] = moment(time, 'HHmmss').format('hh:mm:ss A');
                                            _that.timearray.push(value[i]['datetime']);
                                            if (value[i]['disposition'] == 'ANSWERED') {
                                                // _that.answeredG++;
                                                _that.callIdarray.push(value[i]['uniqueid']);
                                            } else {
                                                _that.callIdarray.push(0);
                                            }
                                            var BreakException = {};
                                            try {
                                                _that.userlist.forEach((element2) => {
                                                    if (element2.ext_number == value[i]['dst']) {
                                                        value[i]['username'] = element2.us_firstname;
                                                        value[i]['userid'] = element2.us_id;
                                                        throw BreakException;
                                                    } else {
                                                        if (value[i]['dst'] == '6300') {
                                                            value[i]['username'] = 'Missed Call';
                                                        } else {
                                                            value[i]['username'] = value[i]['dst'];
                                                            value[i]['userid'] = 0;
                                                        }
                                                    }
                                                });
                                            } catch (e) {}
                                        }
                                        var substring = value[0]['src'].substring(value[0]['src'].length - 9);
                                        if (_that.numarray.indexOf(substring) === -1) {
                                            _that.numarray.push(substring);
                                        }

                                        var BreakException = {};
                                        try {
                                            _that.userlist.forEach((element2) => {
                                                if (element2.ext_number == value[value.length - 1]['dst']) {
                                                    user = element2.us_firstname;
                                                    var user_id = element2.us_id;
                                                    throw BreakException;
                                                } else {
                                                    if (value[value.length - 1]['dst'] == '6300') {
                                                        user = 'Missed Call';
                                                    } else {
                                                        user = value[value.length - 1]['dst'];
                                                        user_id = 0;
                                                    }
                                                }
                                            });
                                        } catch (e) {}
                                        let arr = {
                                            call_time: date,
                                            user: value[0]['username'],
                                            call_from: value[0]['src'],
                                            src_trunk: value[0]['srctrunk'],
                                            call_to: value[0]['dst'],
                                            call_list: value,
                                            disposition: value[0]['disposition'],
                                            src: value[0]['src'],
                                            datetime: value[0]['datetime'],
                                            uniqueid: value[0]['uniqueid'],
                                        };
                                        _that.arr_sample.push(arr);
                                    }
                                });
                            });
                            this.calls_common = _that.arr_sample;

                            this.ExcludecommonNumber();
                        } else {
                             this.load_flag=false;
                        }
                    } else {
                         this.load_flag=false;
                    }
                });
            } else {
                this.load_flag=false;
            }
        });
    }

    ExcludecommonNumber() {
        this.userServices.getExcludedNumberList().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.common = rdata.numlist;

                this.arr_sample = this.calls_common.filter((element) => {
                    return !this.common.some((element2) => {
                        return element.call_from.substring(element.call_from.length - 7) === element2.cn_number.substring(element2.cn_number.length - 7);
                    });
                });
                this.getcustomerinfo();
            } else {
                 this.load_flag=false;
            }
        });
    }

    getcustomerinfo() {
        let data = {
            num_list: this.numarray,
            start_date: this.start_date + ' 00:00:00',
            end_date: this.end_date + ' 23:59:59',
        };
        this.arr_sample = this.getUniqueListBy(this.arr_sample, 'src');
        this.userServices.getcustomerdataanalysis(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.arr_sample.forEach((element) => {
                    let matchFound = false;
                    rdata.customers.forEach((element2: any) => {
                        if (this.isMatch(element.src, element2.phone) || this.isMatch(element.src, element2.mobile)) {
                            element['customer_name'] = element2.customer_name;
                            element['customer_type'] = element2.type;
                            matchFound = true;
                        }
                    });

                    if (!matchFound) {
                        rdata.customer_master.forEach((element3: any) => {
                            if (this.isMatch(element.src, element3.phone) || this.isMatch(element.src, element3.mobile)) {
                                element['customer_name'] = element3.customer_name;
                                element['customer_type'] = 'n';
                                matchFound = true;
                            }
                        });
                    }

                    if (!matchFound) {
                        element['customer_name'] = 'NEW';
                        element['customer_type'] = 'n';
                    }
                });
                this.getcustomerleads();
            } else {
               this.load_flag=false;
            }
        });
    }

    getcustomerleads() {
        let data: any = {};

        if (this.numarray.length > 0) {
            data.num_list = this.numarray;
        }
        if (this.callIdarray.length > 0) {
            data.callid_array = this.callIdarray;
        }
        this.userServices.getcustomerleads(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                // this.leads = rdata.leads;
                // this.leadlogs = rdata.leadlogs;
                if (rdata.leadlogs.length > 0) {
                }
                this.arr_sample.forEach((element) => {
                    if (rdata.leadlogs.length > 0) {
                        rdata.leadlogs.forEach((element1: any) => {
                            if (element.checkvalue != true) {
                                if (element.uniqueid === element1.ystar_call_id) {
                                    element['call_purpose'] = element1.call_purpose;
                                    element['notes'] = element1.lcl_purpose_note;
                                    element['checkvalue'] = true;
                                } else {
                                    element['call_purpose'] = 'Purpose Nil';
                                    element['notes'] = 'Nil';
                                }
                            }
                        });
                    } else {
                        element['call_purpose'] = 'Purpose Nil';
                        element['notes'] = 'Nil';
                    }
                });
                this.getcount();
            } else {
                this.load_flag = false;
            }
        });
    }

    getcount() {
        this.totalcall = [];
        this.nojobcardcustomer = [];
        this.jobcardcustomer = [];

        this.totalcall = this.arr_sample;
        this.nojobcardcustomer = this.arr_sample.filter((data) => data.customer_type == 'n');
        this.jobcardcustomer = this.arr_sample.filter((data) => data.customer_type != 'n');
        this.load_flag = false;
        console.log('arra?????????????????????????', this.arr_sample);
    }

    CallFilter() {
        if (this.filterParams.call_purpose != 'ALL') {
            if (this.filterParams.customer_name == '0') {
                this.arr_sample = this.totalcall.filter((row) => row.call_purpose === this.filterParams.call_purpose);

                if (this.filterParams.username != 'ALL') {
                    this.arr_sample = this.arr_sample.filter((row) => row.call_to === this.filterParams.username);
                }
            } else if (this.filterParams.customer_name == '1') {
                this.arr_sample = this.jobcardcustomer.filter((row) => row.call_purpose === this.filterParams.call_purpose);
                if (this.filterParams.username != 'ALL') {
                    this.arr_sample = this.arr_sample.filter((row) => row.call_to === this.filterParams.username);
                }
            } else if (this.filterParams.customer_name == '2') {
                this.arr_sample = this.nojobcardcustomer.filter((row) => row.call_purpose === this.filterParams.call_purpose);
                if (this.filterParams.username != 'ALL') {
                    this.arr_sample = this.arr_sample.filter((row) => row.call_to === this.filterParams.username);
                }
            }
        } else if (this.filterParams.call_purpose == 'ALL') {
            if (this.filterParams.customer_name == '0') {
                this.arr_sample = this.totalcall;
                if (this.filterParams.username != 'ALL') {
                    this.arr_sample = this.arr_sample.filter((row) => row.call_to === this.filterParams.username);
                }
            } else if (this.filterParams.customer_name == '1') {
                this.arr_sample = this.jobcardcustomer;
                if (this.filterParams.username != 'ALL') {
                    this.arr_sample = this.arr_sample.filter((row) => row.call_to === this.filterParams.username);
                }
            } else if (this.filterParams.customer_name == '2') {
                this.arr_sample = this.nojobcardcustomer;
                if (this.filterParams.username != 'ALL') {
                    this.arr_sample = this.arr_sample.filter((row) => row.call_to === this.filterParams.username);
                }
            }
        }

        console.log('=====>', this.arr_sample);
    }
    cardfilter(type: any) {
        switch (type) {
            case 'nojobcardcustomer':
                this.arr_sample = this.nojobcardcustomer;
                break;
            case 'jobcardcustomer':
                this.arr_sample = this.jobcardcustomer;
                break;
            case 'totalcalls':
                this.arr_sample = this.totalcall;
                break;
            default:
                break;
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

    openCallLogs(data: any) {
        this.calllogphn = {
            phone: data,
        };
        this.calllogmodal.open();
    }

    callhistoryModal() {
        this.calllogmodal.close();
    }

    opencustDetailModal(data: any) {
        this.customerdata = [];
        this.custvehicle = [];
        this.custjobcard = [];
        this.custtotalLead = [];
        this.custpendLead = [];
        this.custpenLeadId = [];
        this.custleads = [];
        this.custleadLog = [];
        this.userServices.getcustomerData({ phone: data }).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.customerdata = rdata.customer;
                this.custvehicle = rdata.vehicle;
                this.custjobcard = rdata.jobcard;
                this.custtotalLead = rdata.totalLead;
                this.custpendLead = rdata.pendLead;
                this.custpenLeadId = rdata.pendLeadId;
                this.custleads = rdata.lead;
                this.custleadLog = rdata.JCY;
            } else {
            }
        });

        this.custDetailModal.open();
    }

    custDetailModalClose() {
        this.custDetailModal.close();
    }

    getUniqueListBy(arr: any, key: any) {
        const uniqueMap = new Map();

        for (let i = 0; i < arr.length; i++) {
            const item = arr[i];
            if (uniqueMap.has(item[key])) {
                const existingItem = uniqueMap.get(item[key]);
                if (item.datetime > existingItem.datetime) {
                    uniqueMap.set(item[key], item);
                }
            } else {
                uniqueMap.set(item[key], item);
            }
        }

        return [...uniqueMap.values()];
    }

    isMatch(src: string, phoneOrMobile: string) {
        return src.substring(src.length - 9) === phoneOrMobile.substring(phoneOrMobile.length - 9);
    }
}
