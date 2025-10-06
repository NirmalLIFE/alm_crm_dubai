import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as moment from 'moment';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { colDef } from '@bhplugin/ng-datatable';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';
import { trigger, transition, style, animate } from '@angular/animations';


@Component({
    selector: 'app-inbound-call-report',
    templateUrl: './inbound-call-report.component.html',
    styleUrls: ['./inbound-call-report.component.css'],
    animations: [
        trigger('toggleAnimation', [
            transition(':enter', [style({ opacity: 0, transform: 'scale(0.95)' }), animate('100ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))]),
            transition(':leave', [animate('75ms', style({ opacity: 0, transform: 'scale(0.95)' }))]),
        ]),
    ],
})
export class InboundCallReportComponent implements OnInit {
    tab17 = 'home';
    // rangeCalendar: FlatpickrOptions;
    public purposeList: any[] = [];
    public timearray: any[] = [];
    public callarray: any[] = [];
    public report: any = [];
    public arr_sample: any[] = [];
    public userlist: any[] = [];
    public numarray: any[] = [];
    public call_rep: any[] = [];
    public callIdarray: any[] = [];
    public all_data: any[] = [];
    public calllogphn: any = [];

    leadDetail: any = [];
    cust_convert: any[] = [];
    jobcard: any[] = [];
    leads: any[] = [];
    leadlogs: any[] = [];
    answered = 0;
    call_filter = '0';
    temp: any[] = [];
    numlist: any[] = [];
    arr_sample_unique: any[] = [];
    uniqueid: any[] = [];
    callnum: any[] = [];
    commoncount = 0;
    isChecked: any = false;
    misscall: any[] = [];
    totalcall: any[] = [];
    newcall: any[] = [];
    existcall: any[] = [];
    markcall: any[] = [];
    nonmarkcall: any[] = [];
    custconvertedcall: any[] = [];
    custconverted: any[] = [];
    activecall: any[] = [];
    appointcall: any[] = [];
    newcust: any[] = [];
    nopurpose: any[] = [];
    c_nopurpose = 0;
    newcustcount = 0;
    newcus = 0;
    exscus = 0;
    totalmarkcount = 0;
    totalnonmarkcount = 0;
    totalconvertedcust = 0;
    activejobcards = 0;

    totalincall = 0;
    totalmiscount = 0;
    totalapcount = 0;

    public start_date: string = this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '';
    public end_date: string = this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '';

    public search: string = '';
    public load_flag: boolean = true;
    // public daterange: any;

    filterParams: any = {
        department_param: '0',
        customerType: 'ALL',
        username: 'ALL',
        call_purpose: 'ALL',
    };

    @ViewChild('calllogmodal') calllogmodal: any;
    @ViewChild('leadDetailModal') leadDetailModal: any;
    @ViewChild('custDetailModal') custDetailModal: any;
    @ViewChild('uniqueCallDetailModal') uniqueCallDetailModal: any;

    cols = [
        { field: 'call_time', title: 'Date', isUnique: true, hide: false },
        { field: 'customer', title: 'Customer', hide: false },
        { field: 'disposition', title: 'Disposition', hide: false },
        { field: 'call_from', title: 'Call From' },
        { field: 'lead', title: 'Leads', hide: false },
        { field: 'user', title: 'Last Answered', hide: true },
        { field: 'convert', title: 'Converted', hide: false },
        { field: 'call_details', title: 'Call List', hide: false },
    ];
    cols_2 = [
        { field: 'customer', title: 'Customer', hide: false },
        { field: 'call_from', title: 'Call From' },
    ];

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

    //unique Inbound Call Graph
    chartOptions: any;
    uniqueMarkCalls: any[] = [];
    uniqueNonMarkCalls: any[] = [];
    uniqueNewCallsCount: any[] = [];
    uniqueMissCalls: any[] = [];
    uniquemarkconvertcust: any[] = [];
    uniquenonmarkconvertcust: any[] = [];
    uniqueactivecustomer: any[] = [];
    public call_graph_flag: boolean = false;
    pieChart: any;
    unique_arr: any[] = [];

    //Inbound Call Analysis
    call_analysis: any[] = [];

    constructor(
        private userServices: StaffPostAuthService,
        public datepipe: DatePipe,
        private router: Router,
        public storeData: Store<any>,
        public fb: FormBuilder
    ) {
        // const today = new Date();
        // const tomorrow = new Date(today);
        // tomorrow.setDate(today.getDate() + 1);
        // const formattedToday = today.toISOString();
        // const formattedTomorrow = tomorrow.toISOString();
        // this.daterange = [formattedToday, formattedTomorrow];
        // this.rangeCalendar = {
        //     defaultDate:this.daterange,
        //     dateFormat: 'Y-m-d',
        //     mode: 'range',
        //     // position: this.store.rtlClass === 'rtl' ? 'auto right' : 'auto left',
        // };
        // console.log('daterange>>>>>>>>>>>>>>>>>>0', this.daterange);
    }

    updateColumn(col: colDef) {
        col.hide = !col.hide;
        this.cols = [...this.cols]; // Create a new reference of the array
    }

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
        // this.start_date = this.daterange;
        // this.end_date = this.daterange;
        // const startDate = new Date(this.daterange[0]);
        // const endDate = new Date(this.daterange[1]);
        // this.start_date = this.formatDate(startDate);
        // this.end_date = this.formatDate(endDate);

        this.getinboundcalls();
    }
    selecteddate() {
        //console.log('daterange>>>>>>>>>>>>>>>>>>0', this.daterange);
        // const startDate = new Date(this.daterange[0]);
        // const endDate = new Date(this.daterange[1]);
        // this.start_date = this.formatDate(startDate);
        // this.end_date = this.formatDate(endDate);
        this.getinboundcalls();
    }

    getinboundcalls() {
        this.load_flag = true;
        this.report = [];
        this.arr_sample = [];
        this.totalincall = 0;
        this.c_nopurpose = 0;
        this.newcustcount = 0;
        this.newcus = 0;
        this.exscus = 0;
        this.totalmarkcount = 0;
        this.totalnonmarkcount = 0;
        this.totalconvertedcust = 0;
        this.activejobcards = 0;
        this.totalmiscount = 0;
        this.totalapcount = 0;

        let data = {
            call_type: 'Inbound',
            start_day: this.start_date + ' 00:00:00',
            end_day: this.end_date + ' 23:59:59',
        };

        let dataa = {
            num_list: this.numarray,
            start_date: this.start_date + ' 00:00:00',
            end_date: this.end_date + ' 23:59:59',
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
                            //    console.log('cal rep>>>>>>>>>>>', this.call_rep);
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
                                                _that.answered++;
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
                                        var substring = value[0]['src'].substring(value[0]['src'].length - 7);
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
                                        };
                                        _that.arr_sample.push(arr);
                                    }
                                });
                            });
                            // this.arr_sample = filteredArr.reduce((acc: any, call: any) => {
                            //     const existingGroup = acc.find((group: any) => group.uniqueid === call.uniqueid);

                            //     if (existingGroup) {
                            //         existingGroup.call_list.push(call);
                            //     } else {
                            //         const newGroup = {
                            //             call_from: call.src,
                            //             uniqueid: call.uniqueid,
                            //             uid: call.uid,
                            //             src_trunk: call.srctrunk,
                            //             call_list: [call],
                            //             date: call.datetime,
                            //             call_to: call.dst,
                            //             disposition: call.disposition,
                            //         };
                            //         acc.push(newGroup);
                            //     }

                            //     return acc;
                            // }, []);

                            // this.arr_sample.forEach((element) => {
                            //     var substring = element.call_from.substring(element.call_from.length - 7);
                            //     if (this.numarray.indexOf(substring) === -1) {
                            //         this.numarray.push(substring);
                            //     }
                            //     element.call_list.forEach((element3: any) => {
                            //         if (element3.disposition == 'ANSWERED') {
                            //             this.callIdarray.push(element3.uniqueid);
                            //         } else {
                            //         }
                            //         this.userlist.forEach((element2) => {
                            //             if (element2.ext_number == element.call_to) {
                            //                 element.user = element2.us_firstname;
                            //             } else {
                            //                 if (element.dst == '6300') {
                            //                     element.user = 'Missed Call';
                            //                 } else {
                            //                     element.user = element.dst;
                            //                 }
                            //             }
                            //             if (element2.ext_number == element3.dst) {
                            //                 element3.user = element2.us_firstname;
                            //             } else {
                            //                 if (element3.dst == '6300') {
                            //                     element3.user = 'Missed Call';
                            //                 } else {
                            //                     element3.user = element.dst;
                            //                 }
                            //             }
                            //         });
                            //     });
                            // });

                            const groupedCallsByFrom = this.groupBy(this.arr_sample, 'call_from');
                            this.arr_sample = this.arr_sample.map((element) => {
                                const group = groupedCallsByFrom.find((g) => g.call_from === element.call_from);
                                if (group) {
                                    if (group.src_trunk === '025503556') {
                                        element['department'] = 'marketing';
                                    } else {
                                        element['department'] = 'Non-marketing';
                                    }
                                }
                                return element;
                            });

                            // console.log('groupedCallsByFrom>>>>>>>>>>', groupedCallsByFrom);
                            // console.log('arr_sample>>>>>arr_sample>>arr_sample>>>', this.arr_sample);
                            this.getcustomerinfo(dataa);
                            this.callarray = this.arr_sample;
                            this.all_data = this.arr_sample;
                        } else {
                            this.load_flag = false;
                            this.coloredToast('danger', 'Issue With Yeastar Token. Try again after some time');
                        }
                    } else {
                        this.load_flag = false;
                        this.coloredToast('danger', 'Issue With Yeastar Token. Try again after some time');
                    }
                });
            } else {
                this.coloredToast('danger', 'Some error occurred please try again');
            }
        });
    }

    getcustomerinfo(dataa: any) {
        this.load_flag = true;
        let mc = 0;
        let cc = 0;
        var that = this;
        this.userServices.getcustomerdata(dataa).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                var customers = rdata.customers;
                this.cust_convert = rdata.cust_convert;
                this.jobcard = rdata.jobcard;

                this.arr_sample.map(function (x: any) {
                    var result = rdata.customers.filter(
                        (a1: any) =>
                            a1.phon_uniq == x.call_from.substring(x.call_from.length - 7) ||
                            a1.alt_num_uniq == x.call_from.substring(x.call_from.length - 7) ||
                            a1.mob_uniq == x.call_from.substring(x.call_from.length - 7)
                    );
                    if (result.length > 0) {
                        x.customer = result[0].customer_name;
                        x.customertype = result[0].type;
                        result[0].type == 'M' ? mc++ : cc++;
                    } else {
                        x.customer = 'new';
                    }

                    var custconvert = that.cust_convert.filter((a1) => a1.phon_uniq == x.call_from.substring(x.call_from.length - 7));
                    if (custconvert.length > 0) {
                        x.convert = 'true';
                    } else {
                        x.convert = 'fail';
                    }

                    var activecust = that.jobcard.filter((a1) => a1.phon_uniq == x.call_from.substring(x.call_from.length - 7));
                    if (activecust.length > 0) {
                        x.jc_status = 'active';
                    } else {
                        x.jc_status = 'fail';
                    }
                });

                this.getcustomerleads();
            } else {
                this.coloredToast('danger', 'Some error occurred please try again');
                this.load_flag = false;
            }
        });
    }

    getcustomerleads() {
        this.load_flag = true;
        let data: any = {};

        if (this.numarray.length > 0) {
            data.num_list = this.numarray;
        }
        if (this.callIdarray.length > 0) {
            data.callid_array = this.callIdarray;
        }
        this.userServices.getcustomerleads(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.leads = rdata.leads;
                this.leadlogs = rdata.leadlogs;

                this.arr_sample.map(function (x: any) {
                    var result = rdata.leads.filter((a1: any) => a1.phon_uniq == x.call_from.substring(x.call_from.length - 7));
                    if (result.length > 0) {
                        x.lead = result[0].lead_code;
                        x.leadCreate = result[0].lead_updatedon;
                        x.lead_id = result[0].lead_id;
                        x.cp_id = result[0].cp_id;
                        x.call_purpose = result[0].call_purpose;
                    } else {
                        x.lead = 'fail';
                        x.leadCreate = 'fail';
                        x.cp_id = '0';
                        x.call_purpose = 'fail';
                    }
                    return x;
                });

                this.arr_sample.map(function (x: any) {
                    x.call_list.forEach(function (value: any, key: any) {
                        if (value.disposition == 'ANSWERED') {
                            let s = value.uniqueid;
                            var result = rdata.leadlogs.filter((a1: any) => a1.ystar_call_id == s && a1.lcl_call_to == value.dst);
                            if (result.length > 0) {
                                x.call_list[key].leadlog = result[0].lcl_purpose_note;
                                x.call_list[key].purpose = result[0].call_purpose;
                            } else {
                                x.call_list[key].leadlog = 'fail';
                                x.call_list[key].purpose = 'fail';
                            }
                        } else if (value.disposition == 'NO ANSWER' || value.disposition == 'VOICEMAIL') {
                            x.call_list[key].leadlog = 'fail';
                            x.call_list[key].purpose = 'fail';
                        }
                    });
                });

                this.CallFilter();
            } else {
                this.load_flag = false;
            }
        });
    }

    CallFilter() {
         console.log('arr_sample>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', this.arr_sample);
        if (this.filterParams.department_param == '1') {
            this.arr_sample = this.all_data.filter((data) => data.department === 'marketing');
        } else if (this.filterParams.department_param == '2') {
            this.arr_sample = this.all_data.filter((data) => data.department === 'Non-marketing');
        } else if (this.filterParams.department_param == '0') {
            this.arr_sample = this.all_data;
        }
        if (this.filterParams.customerType != 'ALL') {
            this.arr_sample = this.arr_sample.filter((customer: any) => customer.customer != 'new');

            this.arr_sample = this.arr_sample.filter((customertype: any) => customertype.customertype === this.filterParams.customerType);
        }
        if (this.filterParams.username != 'ALL') {
            this.arr_sample = this.arr_sample.filter((row: any) => row.call_list.some((el: any) => el.dst === this.filterParams.username));
        }
        if (this.filterParams.call_purpose != 'ALL') {
            this.arr_sample = this.arr_sample.filter((row: any) => row.call_list.some((el: any) => el.purpose === this.filterParams.call_purpose));
        }
        this.callarray = this.arr_sample;
        this.checkValue(this.isChecked);
    }

    checkValue(event: any) {
        this.temp = this.callarray;
        this.isChecked = event;
        this.userServices.getExcludedNumberList().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.numlist = rdata.numlist;
                this.commoncount = rdata.numlist.length;

                if (event == false) {
                    // console.log("callarray", this.callarray);
                    this.arr_sample = this.callarray.filter((element) => {
                        return !this.numlist.some((element2) => {
                            return element.call_from.substring(element.call_from.length - 7) === element2.cn_number.substring(element2.cn_number.length - 7);
                        });
                    });
                    // this.arr_sample = this.callarray.filter((el) => {
                    //   return el.call_from.substring(0, 2) != "02";
                    // });
                } else {
                    this.arr_sample = this.temp;
                }
                this.load_flag = false;
                this.getCount();
            } else {
                this.coloredToast('danger', 'Some error occurred please try again');
            }
        });
    }

    // groupBy(arr: any, key: any) {
    //     return Object.values(arr.reduce((acc: any, item: any) => {
    //         const groupKey = item[key];
    //         if (!acc[groupKey]) {
    //             acc[groupKey] = [item];
    //         } else {
    //             acc[groupKey].push(item);
    //         }
    //         return acc;
    //     }, {}));
    // }

    // groupBy(arr: any, key: any) {
    //     const groupedCalls: any = {};

    //     arr.forEach((item: any) => {
    //         const groupKey = item[key];

    //         if (!groupedCalls[groupKey]) {
    //             groupedCalls[groupKey] = { mainCall: item, callgroups: [] };
    //         } else {
    //             groupedCalls[groupKey].callgroups.push(item);
    //         }
    //     });

    //     return Object.values(groupedCalls);
    // }

    groupBy(arr: any[], key: string) {
        const groupedCalls: { [key: string]: { mainCall: any; callgroups: any[] } } = arr.reduce((result, item) => {
            const groupKey = item[key];
            if (!result[groupKey]) {
                result[groupKey] = { mainCall: item, callgroups: [] };
            } else {
                result[groupKey].callgroups.push(item);
                if (item.datetime < result[groupKey].mainCall.datetime) {
                    result[groupKey].mainCall = item;
                }
            }
            return result;
        }, {});
        const result = Object.values(groupedCalls).map(({ mainCall, callgroups }) => ({
            ...mainCall,
            callgroups,
        }));

        return result;
    }

    getCount() {
        this.load_flag = true;
        //  console.log('arr_sample?????arr_samplearr_sample??????', this.arr_sample);
        this.arr_sample_unique = this.groupBy(this.arr_sample, 'call_from');
        // this.arr_sample_unique = this.getUniqueListBy(this.arr_sample, 'call_from');
        // this.arr_sample_unique = [...new Set(this.arr_sample.map((group) => group.call_from))];

        this.totalcall = this.arr_sample;

        this.totalincall = this.arr_sample.length;

        var ffArr = this.arr_sample_unique.filter((item) => item.customer == 'new');
        this.newcall = ffArr;
        this.newcus = ffArr.length;

        var ffArr = this.arr_sample_unique;
        this.newcust = ffArr;
        this.newcustcount = ffArr.length;

        var ffArr = this.arr_sample_unique.filter(({ customer }) => customer != 'new' && customer != 'EXISTS');
        this.existcall = ffArr;
        this.exscus = ffArr.length;

        var ffArrs = this.arr_sample.filter((cp_id: any) => cp_id.cp_id == 1);
        this.appointcall = ffArrs;
        this.totalapcount = ffArrs.length;

        let custconverted = this.arr_sample_unique.filter((a1) => a1.convert == 'true');
        this.custconvertedcall = custconverted;
        this.totalconvertedcust = custconverted.length;

        let activecust = this.arr_sample_unique.filter((a1) => a1.jc_status == 'active');
        this.activecall = activecust;
        this.activejobcards = activecust.length;

        let markcount = this.arr_sample.filter((a1: any) => a1.department === 'marketing'); //src_trunk == '025503556'
        this.totalmarkcount = markcount.length;
        this.markcall = markcount;
        let nonmarkcount = this.arr_sample.filter((a1: any) => a1.department === 'Non-marketing'); //src_trunk != '025503556'
        this.nonmarkcall = nonmarkcount;
        this.totalnonmarkcount = nonmarkcount.length;

        let uniqueMarkCount = this.arr_sample_unique.filter((a1: any) => a1.src_trunk === '025503556');
        this.uniqueMarkCalls = uniqueMarkCount;
        // console.log('non mar cal>>>>>>>>>>', this.nonmarkcall);
        let uniqueNonMarkCount = this.arr_sample_unique.filter((a1: any) => a1.src_trunk != '025503556');
        this.uniqueNonMarkCalls = uniqueNonMarkCount;

        let uniqueNewCallsCount = this.arr_sample_unique.filter(({ customer }) => customer === 'new');
        this.uniqueNewCallsCount = uniqueNewCallsCount;

        const miss = this.arr_sample.filter((row) => row.call_list.some((el: any) => el.disposition === 'NO ANSWER'));
        this.uniqueMissCalls = this.getUniqueListBy(miss, 'call_from');

        if (this.filterParams.username != 'ALL') {
            const missArr = this.arr_sample.filter((row: any) =>
                row.call_list.some((el: any) => el.disposition === 'NO ANSWER' && el.dst === this.filterParams.username)
            );
            this.misscall = missArr;
            this.totalmiscount = missArr.length;
        } else {
            const missArr = this.arr_sample.filter((row: any) => row.call_list.some((el: any) => el.disposition === 'NO ANSWER'));
            this.misscall = missArr;
            this.totalmiscount = missArr.length;
        }
        // this.custconverted = this.arr_sample_unique.filter((a1) => a1.convert == "true");

        this.uniquemarkconvertcust = this.arr_sample_unique.filter((a1) => a1.convert == 'true' && a1.src_trunk == '025503556');
        this.uniquenonmarkconvertcust = this.arr_sample_unique.filter((a1) => a1.convert == 'true' && a1.src_trunk != '025503556');
        this.uniqueactivecustomer = this.arr_sample_unique.filter((a1) => a1.jc_status == 'active');

        const nopurposeArr = this.arr_sample.filter((row: any) => row.call_list.some((el: any) => el.purpose === 'fail' && el.disposition == 'ANSWERED'));
        this.nopurpose = nopurposeArr;
        this.c_nopurpose = nopurposeArr.length;
        this.getOutboundCall();
        this.uniqueInboundCalls();
    }
    getOutboundCall() {
        this.uniqueid = [];
        this.callnum = this.misscall.map((number) => number.src);
        let dataa = {
            call_to: this.callnum,
            start_day: this.start_date + ' 00:00:00',
            end_day: this.end_date + ' 23:59:59',
        };
        this.userServices.getOutboundCalls(dataa).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.arr_sample.forEach((element: any) => {
                    if (element.disposition == 'NO ANSWER') {
                        element.outboundcalldata = [];
                        let callfrom = element.src;
                        rdata.customer.forEach((element2: any) => {
                            element2.forEach((element3: any) => {
                                if (element3.src == callfrom || element3.dst == callfrom) {
                                    //element.outboundcalldata.push(element2)
                                    element.outboundcalldata.push(element3);
                                }
                            });
                        });
                    } else {
                        element.outboundcalldata = [];
                    }
                });
            } else {
            }

            this.arr_sample.forEach((element: any, index: any) => {
                if (element.outboundcalldata) {
                    element.outboundcalldata.forEach((e: any, i: any) => {
                        if (e.datetime <= element.datetime) {
                            element.outboundcalldata.splice(i);
                        }
                    });
                    if (element.outboundcalldata.length > 0) {
                        this.uniqueid.push(element.outboundcalldata[element.outboundcalldata.length - 1].uniqueid);
                    }
                }
            });
            let data = {
                call_id: this.uniqueid,
            };
            this.userServices.getcallleadlog(data).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    this.arr_sample.map(function (x: any) {
                        if (x.outboundcalldata) {
                            x.outboundcalldata.forEach(function (value: any, key: any) {
                                if (value.disposition == 'ANSWERED') {
                                    let s = value.uniqueid;
                                    var result = rdata.leadlog.filter((a1: any) => a1.ystar_call_id == s);
                                    if (result.length > 0) {
                                        x.outboundcalldata[key].leadlog = result[0].lcl_purpose_note;
                                        x.outboundcalldata[key].purpose = result[0].call_purpose;
                                    } else {
                                        x.outboundcalldata[key].leadlog = 'fail';
                                        x.outboundcalldata[key].purpose = 'fail';
                                    }
                                } else if (value.disposition == 'NO ANSWER' || value.disposition == 'VOICEMAIL') {
                                    x.outboundcalldata[key].leadlog = 'fail';
                                    x.outboundcalldata[key].purpose = 'fail';
                                }
                            });
                        }
                    });
                }
            });

            this.arr_sample.forEach((element1: any, index: any) => {
                if (element1.outboundcalldata) {
                    element1.outboundcalldata.forEach((element2: any, index: any) => {
                        (element2.c_time = moment(element2.datetime, 'YYYY-MM-DD HH:mm:ss').format('hh:mm:ss A')),
                            (element2.c_date = moment(element2.datetime, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD'));
                        if (element2.calltype == 'Inbound') {
                            element2.username = 'Inbound Call';
                        } else {
                            element2.username = 'Callback ';
                        }
                    });
                }
            });
            this.load_flag = false;
        });
    }

    cardfilter(type: any) {
        switch (type) {
            case 'misscalls':
                this.arr_sample = this.misscall;
                break;
            case 'totalcall':
                this.arr_sample = this.totalcall;
                break;
            case 'newcall':
                this.arr_sample = this.newcall;
                break;
            case 'existcall':
                this.arr_sample = this.existcall;
                break;
            case 'markcall':
                this.arr_sample = this.markcall;
                break;
            case 'nonmarkcall':
                this.arr_sample = this.nonmarkcall;
                break;
            case 'custconvertedcall':
                this.arr_sample = this.custconvertedcall;
                break;
            case 'activecall':
                this.arr_sample = this.activecall;
                break;
            case 'appointcall':
                this.arr_sample = this.appointcall;
                break;
            case 'newcust':
                this.arr_sample = this.newcust;
                break;
            case 'nopurpose':
                this.arr_sample = this.nopurpose;
                break;
            default:
                break;
        }
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
    openUniqueCallDetailModal(data: any) {
        this.unique_arr = [];
        if (data == 'uniqueCalls') {
            this.unique_arr = this.arr_sample_unique;
        } else if (data == 'uniqueMarkCalls') {
            this.unique_arr = this.uniqueMarkCalls;
        } else if (data == 'uniqueNonMarkCalls') {
            this.unique_arr = this.uniqueNonMarkCalls;
        } else if (data == 'uniqueNewCalls') {
            this.unique_arr = this.uniqueNewCallsCount;
        } else if (data == 'uniqueMissCalls') {
            this.unique_arr = this.uniqueMissCalls;
        } else if (data == 'custconvertedcall') {
            this.unique_arr = this.custconvertedcall;
        } else if (data == 'uniquemarkconvertcust') {
            this.unique_arr = this.uniquemarkconvertcust;
        } else if (data == 'uniquenonmarkconvertcust') {
            this.unique_arr = this.uniquenonmarkconvertcust;
        } else if (data == 'uniqueactivecustomer') {
            this.unique_arr = this.uniqueactivecustomer;
        }

        this.uniqueCallDetailModal.open();
    }
    uniqueCallDetailModalClose() {
        this.uniqueCallDetailModal.close();
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
                // this.cust_name = rdata.customer['customer_name'];
                this.custvehicle = rdata.vehicle;
                this.custjobcard = rdata.jobcard;
                this.custtotalLead = rdata.totalLead;
                this.custpendLead = rdata.pendLead;
                this.custpenLeadId = rdata.pendLeadId;
                this.custleads = rdata.lead;
                this.custleadLog = rdata.JCY;
                //   this.isnNew = true;
                //   this.loading = false;
            } else {
            }
        });

        this.custDetailModal.open();
    }

    custDetailModalClose() {
        this.custDetailModal.close();
    }

    getUniqueListBy(arr: any, key: any) {
        return [...new Map(arr.map((item: any) => [item[key], item])).values()];
    }

    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
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

    uniqueInboundCalls() {
        this.call_graph_flag = true;
        this.chartOptions = {
            series: [
                {
                    name: 'Call Analysis',
                    data: [
                        this.arr_sample_unique.length,
                        this.uniqueMarkCalls.length,
                        this.uniqueNonMarkCalls.length,
                        this.newcall.length,
                        this.uniqueMissCalls.length,
                    ],
                },
            ],
            chart: {
                height: 350,
                type: 'bar',
                // events: {
                //     click: function (chart, w, e) {
                //         // console.log(chart, w, e)
                //     },
                // },
            },
            colors: ['#4bb6e3', '#28714e', '#375b62', '#317edd', '#922628'],
            plotOptions: {
                bar: {
                    columnWidth: '45%',
                    distributed: true,
                },
            },
            dataLabels: {
                enabled: false,
            },
            legend: {
                show: true,
            },
            grid: {
                show: true,
            },
            xaxis: {
                categories: [
                    ['Total', 'Calls'],
                    ['Marketing', 'Calls'],
                    ['Non-Marketing', 'Calls'],
                    ['New', 'Calls'],
                    ['Missed', 'Calls'],
                ],
                labels: {
                    style: {
                        colors: ['#4bb6e3', '#28714e', '#375b62', '#317edd', '#922628'],
                        fontSize: '12px',
                    },
                },
            },
        };
        this.pieChart = {
            series: [this.uniquemarkconvertcust.length, this.uniquenonmarkconvertcust.length],
            chart: {
                height: 300,
                type: 'pie',
                zoom: {
                    enabled: false,
                },
                toolbar: {
                    show: false,
                },
            },
            labels: ['Marketing', 'Non-Marketing'],
            colors: ['#7cb698', '#5ea2af', '#00ab55', '#e7515a', '#e2a03f'],
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
    }
}
