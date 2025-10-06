import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import { Store } from '@ngrx/store';
import { lastValueFrom } from 'rxjs';
import * as moment from 'moment';

interface FilterData {
    total_row: number;
    converted: number;
    attempted_converted_count: number;
    nonattempted_converted_count: number;
    not_converted_count: number;
    attempted_call: number;
    not_attempted_call: number;
}

interface FilterOption {
    id: string;
    name: string;
    data: FilterData;
}

@Component({
    selector: 'app-cre-dash',
    templateUrl: './cre-dash.component.html',
    styleUrls: ['./cre-dash.component.css'],
})
export class CreDashComponent implements OnInit {
    public load_flag: boolean = true;
    public appt_load_flag: boolean = false;
    public call_load_flag: boolean = false;

    inb_calls: any[] = [];
    inb_calls_unique: any[] = [];
    todaysCalls: any[] = [];
    total_calls: any[] = [];
    phnnum: any[] = [];
    report: any[] = [];
    customerdata: any[] = [];
    totalconverted: any[] = [];
    newcall: any[] = [];
    missedcall: any[] = [];
    call_id: any[] = [];
    targetdetails: any[] = [];
    lostlist: any[] = [];
    exist_cust_target = 0;
    totalcust = 0;
    totalexisting_invoiced = 0;
    attendedlostlist: any[] = [];
    positivelostlist: any[] = [];
    convertedlostlist: any[] = [];
    yeartarget: any[] = [];
    thirdDayPsfCalls: any[] = [];
    seventhDAyPsfCalls: any[] = [];
    existinginvpercentage: any;
    newinvpercentage: any;
    ts_exinbound: any;
    ts_newinbound: any;
    columnChart: any;
    columnChart1: any;
    purposemissing = 0;
    thirdDayCompleted = 0;
    seventhDAycompleted = 0;
    newappointment = 0;

    // public startDate: string;
    // public endDate: string;

    // startDate: string = '2023-12-01';
    // endDate: string = '2023-12-30';

    public dateFrom: any = this.datePipe.transform(moment(new Date()).startOf('month').toDate(), 'yyyy-MM-dd') || '';
    public last7DaysDate: any = this.datePipe.transform(moment().subtract(6, 'days').toDate(), 'yyyy-MM-dd') || '';
    // public dateTo: any = null;
    public dateTo: any = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
    public today: any = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';

    public userList: any[] = [];
    public appointmentList: any = [];
    public search = '';
    public appointmentCounts: any = {
        total_appts: 0,
        visited_appts: 0,
        not_converted: 0,
        marketing_appts: 0,
        non_marketing_appts: 0,
        marketing_campaign: 0,
        marketing_campaign_visited: 0,
        marketing_campaign_not_visited: 0,
        marketing_normal: 0,
        marketing_normal_visited: 0,
        marketing_normal_not_visited: 0,
        marketing_department: 0,
        marketing_department_visited: 0,
        marketing_social_media: 0,
        marketing_social_media_visited: 0,
        marketing_website: 0,
        marketing_website_visited: 0,
        marketing_google_marketing: 0,
        marketing_google_marketing_visited: 0,
        non_marketing_campaign: 0,
        non_marketing_campaign_visited: 0,
        non_marketing_normal: 0,
        non_marketing_normal_visited: 0,
        non_marketing_department: 0,
        non_marketing_department_visited: 0,
        non_marketing_direct: 0,
        non_marketing_direct_visited: 0,
        non_marketing_lost: 0,
        non_marketing_lost_visited: 0,
        non_marketing_dissatisfied: 0,
        non_marketing_dissatisfied_visited: 0,
        marketing_visited: 0,
        non_marketing_visited: 0,
        last7DaysAppointment: 0,
        last7DaysAppointment_visited: 0,
    };

    public marketingAppt: any = {
        Last7DayMarketing_appts: 0,
        Last7DayMarketing_visited: 0,
        dateCounts: [] as { date: string; marketing_appts: number; visited_appts: number }[],
    };

    public nonMarketingAppt: any = {
        Last7DayMarketing_appts: 0,
        Last7DayMarketing_visited: 0,
        dateCounts: [] as { date: string; marketing_appts: number; visited_appts: number }[],
    };
    public Appt: any = {
        Last7DayAppt: 0,
        Last7DayAppt_visited: 0,
        dateCounts: [] as { date: string; appts: number; visited_appts: number }[],
    };

    salesByCategory: any;
    markApptChart: any;
    nonMarkApptChart: any;
    customerChart: any;
    customerConvertedChart: any;
    nonMarkAppt: any;
    public last7DaysAppointment: any = [];
    public allAppointment: any = [];
    public selected = 0;
    public dateRange: string[] = [];
    public store: any;
    public marketingAppointments: any = [];
    last7DaysmarketingAppt: any = [];
    last7DaysNonmarketingAppt: any = [];
    last7dayMarkApptChart: any;
    last7dayNonMarkApptChart: any;
    followers: any;
    profiteChartOption: any;
    last7DayApptChart: any;
    last7DaysAppt: any = [];

    //excel sheet datas
    public source: any = '0';
    total_row: any = 0;
    converted: any = 0;
    converted_count: any = 0;
    attempted_converted_count: any = 0;
    nonattempted_converted_count: any = 0;
    not_converted_count: any = 0;
    not_attempted_call: any = 0;
    attempted_call: any = 0;
    public usersList: any[] = [];
    public alllist: any[] = [];
    out_temp: any[] = [];
    public internal_cust_load_flag: boolean = false;

    public filterOptions: FilterOption[] = [
        { id: '0', name: 'ALL', data: this.createEmptyFilterData() },
        { id: '1', name: 'Lost Customer', data: this.createEmptyFilterData() },
        { id: '2', name: 'Service Reminder', data: this.createEmptyFilterData() },
        { id: '3', name: 'Discontinued Customer', data: this.createEmptyFilterData() },
        { id: '4', name: 'Extended Warranty Customer', data: this.createEmptyFilterData() },
        { id: '5', name: 'Campaign Data', data: this.createEmptyFilterData() },
    ];

    public user_role = atob(atob(localStorage.getItem('us_role_id') || '{}'));
    public user_id = atob(atob(localStorage.getItem('us_id') || '{}'));

    constructor(private userServices: StaffPostAuthService, public datePipe: DatePipe, public storeData: Store<any>) {
        this.userServices.userList().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.userList = rData.userList; //.filter((item: any) => item.us_laabs_id !== null)
            }
        });
        const startDate = moment(this.last7DaysDate);
        const endDate = moment(this.today);
        while (startDate <= endDate) {
            this.dateRange.push(startDate.format('YYYY-MM-DD'));
            startDate.add(1, 'days');
        }
        this.storeData
            .select((d) => d.index)
            .subscribe((d) => {
                this.store = d;
            });
        // const today = new Date();
        // const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        // this.startDate = this.datepipe.transform(firstDayOfMonth, 'yyyy-MM-dd') || '';
        // this.endDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '';
    }

    ngOnInit(): void {
        this.getMonthlyInboundCalls();
        // this.getUserTarget();  not using NOw just holding

        // const isDark = this.store.theme === 'dark' || this.store.isDarkMode ? true : false;
        // const isRtl = this.store.rtlClass === 'rtl' ? true : false;
        this.load_flag = false;
    }

    // getUserTarget() {
    //     var currentYear = new Date().getFullYear();
    //     var currentDate = new Date();
    //     var currentMonth = currentDate.getMonth() + 1;
    //     let data = {
    //         role_id: this.user_role,
    //         year: currentYear,
    //     };
    //     //  console.log('targetdetails targetdetails', currentMonth);

    //     this.userServices.gettargetsettingsdata(data).subscribe((rData: any) => {
    //         if (rData.ret_data == 'success') {
    //             this.targetdetails = rData.result.filter((item: any) => item.ts_month == currentMonth);
    //             this.yeartarget = rData.result.map((item: any) => ({
    //                 ts_month: item.ts_month,
    //                 ts_newinbound: item.ts_newinbound,
    //                 ts_exinbound: item.ts_exinbound,
    //                 ts_year: item.ts_year,
    //             }));
    //             this.yeartarget.forEach((element) => {
    //                 if (element.ts_newinbound === '') {
    //                     element.ts_newinbound = 0;
    //                 }
    //                 if (element.ts_exinbound === '') {
    //                     element.ts_exinbound = 0;
    //                 }
    //             });
    //             //  console.log('yeartarget targetdetails', this.yeartarget);
    //             this.ts_exinbound = this.targetdetails[0].ts_exinbound;
    //             this.ts_newinbound = this.targetdetails[0].ts_newinbound;
    //         }
    //     });

    //     this.getCustomerConverted();
    // }

    // getCustomerConverted() {
    //     let data = {
    //         start_date: this.dateFrom,
    //         end_date: this.dateTo,
    //     };
    //     this.userServices.getlaabscustomerdata(data).subscribe((rdata: any) => {
    //         if (rdata.ret_data === 'success') {
    //             this.customerdata = rdata.customers.filter((job_status: any) => job_status.job_status != null);
    //             let inv_temp = this.customerdata.filter(({ job_status }) => job_status == 'INV');
    //             if (inv_temp.length > 0) {
    //                 this.totalconverted = inv_temp;
    //                 this.newinvpercentage = parseFloat((this.totalconverted.length / this.ts_newinbound).toFixed(2));
    //                 this.newinvpercentage *= 100;
    //                 this.newinvpercentage = this.newinvpercentage + '%';
    //             }

    //             this.userServices.getexistingCustomer(data).subscribe((rdata: any) => {
    //                 if (rdata.ret_data === 'success') {
    //                     this.totalcust = rdata.customers.length;
    //                     if (this.totalcust != 0) {
    //                         this.totalexisting_invoiced = this.totalcust - this.totalconverted.length;
    //                         this.existinginvpercentage = parseFloat((this.totalexisting_invoiced / this.ts_exinbound).toFixed(2));
    //                         this.existinginvpercentage *= 100;
    //                         this.existinginvpercentage = this.existinginvpercentage + '%';
    //                     }
    //                 }
    //             });
    //         }
    //         this.getMonthlyInboundCalls();
    //     });
    // }
    getMonthlyInboundCalls() {
        this.call_load_flag = true;
        this.appt_load_flag = false;
        this.internal_cust_load_flag = false;
        this.appointmentList = [];
        this.marketingAppointments = [];
        this.last7DaysmarketingAppt = [];
        this.last7DaysNonmarketingAppt = [];
        this.last7DaysAppt = [];
        this.purposemissing = 0;
        this.appointmentCounts = {
            total_appts: 0,
            visited_appts: 0,
            not_converted: 0,
            marketing_appts: 0,
            non_marketing_appts: 0,
            marketing_campaign: 0,
            marketing_campaign_visited: 0,
            marketing_campaign_not_visited: 0,
            marketing_normal: 0,
            marketing_normal_visited: 0,
            marketing_normal_not_visited: 0,
            marketing_department: 0,
            marketing_department_visited: 0,
            marketing_social_media: 0,
            marketing_social_media_visited: 0,
            marketing_website: 0,
            marketing_website_visited: 0,
            marketing_google_marketing: 0,
            marketing_google_marketing_visited: 0,
            non_marketing_campaign: 0,
            non_marketing_campaign_visited: 0,
            non_marketing_normal: 0,
            non_marketing_normal_visited: 0,
            non_marketing_department: 0,
            non_marketing_department_visited: 0,
            non_marketing_direct: 0,
            non_marketing_direct_visited: 0,
            non_marketing_lost: 0,
            non_marketing_lost_visited: 0,
            non_marketing_dissatisfied: 0,
            non_marketing_dissatisfied_visited: 0,
            marketing_visited: 0,
            non_marketing_visited: 0,
            last7DaysAppointment: 0,
            last7DaysAppointment_visited: 0,
        };
        this.userServices
            .getLatestCallReportData({
                call_type: 'Inbound',
                start_day: this.dateFrom + ' 00:00:00',
                end_day: this.dateTo + ' 23:59:59',
            })
            .subscribe((rData: any) => {
                if (rData.ret_data == 'success') {
                    let filteredArr = rData.call_data.filter((data: any) => data.src.length > 5 && data.src != 'Unknown');
                    filteredArr = filteredArr.filter((data: any) => !(data.dst == '6300' && data.disposition == 'ANSWERED'));
                    // REMOVE RINGGROUP AND ANSWERED
                    this.report = filteredArr.reduce(function (r: any, a: any) {
                        r[a.uid] = r[a.uid] || [];
                        r[a.uid].push(a);
                        return r;
                    }, []);
                    let _that = this;
                    let calls = Object.entries(this.report);
                    calls.forEach((element) => {
                        element.forEach(function (value: any, key: any) {
                            if (key == 1) {
                                let arr = {
                                    user: value[0]['username'],
                                    call_from: value[0]['src'],
                                    src_trunk: value[0]['srctrunk'],
                                    call_to: value[0]['dst'],
                                    call_list: value,
                                    disposition: value[0]['disposition'],
                                    src: value[0]['src'],
                                    datetime: value[0]['datetime'],
                                    calltype: value[0]['calltype'],
                                    uniqueid: value[0]['uniqueid'],
                                };
                                _that.total_calls.push(arr);
                            }
                        });
                    });
                    this.inb_calls = this.total_calls;
                    this.inb_calls_unique = this.inb_calls; //getLatestCalls(this.inb_calls, 'call_from');
                    this.phnnum = this.inb_calls_unique.map((entry) => entry.src.slice(-7));
                    this.call_id = this.inb_calls_unique.map((entry) => entry.uniqueid);
                    this.getcustomerdata();
                } else {
                    this.call_load_flag = false;
                }
            });
    }

    getcustomerdata() {
        let data = {
            num_list: this.phnnum,
            start_date: this.dateFrom,
            end_date: this.dateTo,
        };
        this.userServices.getcustomerdata(data).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.inb_calls_unique.map(function (x) {
                    var result = rdata.customers.filter(
                        (a1: any) =>
                            a1.phon_uniq == x.call_from.substring(x.call_from.length - 7) || a1.alt_num_uniq == x.call_from.substring(x.call_from.length - 7)
                    );
                    if (result.length > 0) {
                        x.customer = result[0].customer_name;
                        x.customertype = result[0].type;
                    } else {
                        x.customer = 'new';
                    }
                });
                //console.log('inb_calls_unique', this.inb_calls_unique);
                //this.missedcall = this.inb_calls_unique.filter((item) => item.disposition == 'NO ANSWER');
                this.newcall = this.inb_calls_unique.filter((item) => item.customer == 'new');
                //this.call_load_flag = false;
            } else {
                this.call_load_flag = false;
            }
        });
        let dataa = {
            num_list: this.phnnum,
            callid_array: this.call_id,
        };

        this.userServices.getcustomerleads(dataa).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.inb_calls_unique.map(function (x) {
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
                this.inb_calls_unique.forEach((element) => {
                    rdata.leads.forEach((element2: any) => {
                        if (element.call_from.substring(element.call_from.length - 9) == element2.phone.substring(element2.phone.length - 9)) {
                            element['call_purpose'] = element2.call_purpose;
                            element['lead_code'] = element2.lead_code;
                            element['lead_createdon'] = element2.lead_createdon;
                            element['lead_id'] = element2.lead_id;
                            element['cp_id'] = element2.cp_id;
                        }
                    });
                });

                this.inb_calls_unique.forEach((element) => {
                    if (element.cp_id) {
                        if (element.cp_id == 1 && element.customer == 'new') {
                            this.newappointment = this.newappointment + 1;
                        }
                    }
                });
                this.getInboundCallsDaily();
            } else {
                this.call_load_flag = false;
            }
        });
    }

    getInboundCallsDaily() {
        const today = new Date();
        this.todaysCalls = this.inb_calls_unique.filter((call) => {
            const callDate = new Date(call.datetime);
            return callDate.getDate() === today.getDate() && callDate.getMonth() === today.getMonth() && callDate.getFullYear() === today.getFullYear();
        });

        this.todaysCalls.forEach((element) => {
            element.call_list.forEach((element2: any) => {
                if (element2.purpose == 'fail') {
                    this.purposemissing = this.purposemissing + 1;
                }
            });
        });

        this.missedcall = this.todaysCalls.filter((item) => item.disposition == 'NO ANSWER');
        // this.lostCustomerDetails();
        this.getPsfCallData();
    }

    getLatestCalls(arr: any, key: any) {
        const latestCallsMap = new Map();
        arr.forEach((item: any) => {
            const keyValue = item[key];
            const currentLatestCall = latestCallsMap.get(keyValue);
            if (!currentLatestCall || new Date(item.datetime) > new Date(currentLatestCall.datetime)) {
                latestCallsMap.set(keyValue, item);
            }
        });
        const latestCallsArray = Array.from(latestCallsMap.values());
        return latestCallsArray;
    }

    // lostCustomerDetails() {
    //     let lostdata = {
    //         start: this.dateFrom,
    //         due: this.dateTo,
    //         uid: this.user_id,
    //     };

    //     this.userServices.getUserAssignedLostCustomers(lostdata).subscribe((rdata: any) => {
    //         if (rdata.ret_data == 'success') {
    //             this.lostlist = rdata.lostlist;
    //             this.attendedlostlist = this.lostlist.filter((item: any) => item.lcst_status != '' && item.lcst_status != null);
    //             this.positivelostlist = this.lostlist.filter((item: any) => item.lcst_status == 'Positive Response');
    //             // this.convertedlostlist = this.lostlist.filter((item: any) => item.status == 'Converted');
    //             this.convertedlostlist = rdata.lostlistconverted;
    //             this.call_load_flag = false;
    //         } else {
    //             this.call_load_flag = false;
    //         }
    //         this.getPsfCallData();
    //     });
    // }

    getPsfCallData() {
        //this.call_load_flag = true;
        let us_labs_id = atob(atob(localStorage.getItem('us_laabs_id') || '{}'));
        let data = {
            us_id: this.user_id,
            startDate: this.dateFrom,
            endDate: this.dateTo,
        };
        this.userServices.get3rdDayPsfCallData(data).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.thirdDayPsfCalls = rData.thirdDayCalls;
                if (this.thirdDayPsfCalls.length > 0) {
                    this.thirdDayPsfCalls.forEach((element) => {
                        element.psf_calls.forEach((element2: any) => {
                            if (element2.pst_response == 1 || element2.pst_response == 2 || element2.pst_response == 3 || element2.pst_response == 5) {
                                this.thirdDayCompleted = this.thirdDayCompleted + 1;
                            }
                        });
                    });
                }
                //this.call_load_flag = false;
            } else {
                this.call_load_flag = false;
            }
        });
        this.userServices.get7thDayPsfCallData(data).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.seventhDAyPsfCalls = rData.seventhDAyCalls;
                if (this.seventhDAyPsfCalls.length > 0) {
                    this.seventhDAyPsfCalls.forEach((element) => {
                        element.psf_calls.forEach((element2: any) => {
                            if (element2.pst_response == 1 || element2.pst_response == 2 || element2.pst_response == 3 || element2.pst_response == 5) {
                                this.seventhDAycompleted = this.seventhDAycompleted + 1;
                            }
                        });
                    });
                }
                this.call_load_flag = false;
            } else {
                this.call_load_flag = false;
            }
            this.getAppointmentList();
            // this.newTargetGraph();
            // this.exstTargetGraph();
        });
    }

    createEmptyFilterData(): FilterData {
        return {
            total_row: 0,
            converted: 0,
            attempted_converted_count: 0,
            nonattempted_converted_count: 0,
            not_converted_count: 0,
            attempted_call: 0,
            not_attempted_call: 0,
        };
    }

    filterData(type: any) {
    }

    getAppointmentList() {
        this.appt_load_flag = true;
        this.appointmentList = [];
        this.marketingAppointments = [];
        this.last7DaysmarketingAppt = [];
        this.last7DaysNonmarketingAppt = [];
        this.last7DaysAppt = [];
        let data: any;
        let last7data: any;

        data = {
            us_id: atob(atob(localStorage.getItem('us_id') || '')),
            dateFrom: this.dateFrom,
            dateTo: this.dateTo,
        };

        last7data = {
            us_id: atob(atob(localStorage.getItem('us_id') || '')),
            dateFrom: this.dateRange[0],
            dateTo: this.dateRange[6],
        };

        // this.appointmentCounts = {
        //     total_appts: 0,
        //     visited_appts: 0,
        //     not_converted: 0,
        //     marketing_appts: 0,
        //     non_marketing_appts: 0,
        //     marketing_campaign: 0,
        //     marketing_campaign_visited: 0,
        //     marketing_campaign_not_visited: 0,
        //     marketing_normal: 0,
        //     marketing_normal_visited: 0,
        //     marketing_normal_not_visited: 0,
        //     marketing_department: 0,
        //     marketing_department_visited: 0,
        //     marketing_social_media: 0,
        //     marketing_social_media_visited: 0,
        //     marketing_website: 0,
        //     marketing_website_visited: 0,
        //     marketing_google_marketing: 0,
        //     marketing_google_marketing_visited: 0,
        //     non_marketing_campaign: 0,
        //     non_marketing_campaign_visited: 0,
        //     non_marketing_normal: 0,
        //     non_marketing_normal_visited: 0,
        //     non_marketing_department: 0,
        //     non_marketing_department_visited: 0,
        //     non_marketing_direct: 0,
        //     non_marketing_direct_visited: 0,
        //     non_marketing_lost: 0,
        //     non_marketing_lost_visited: 0,
        //     non_marketing_dissatisfied: 0,
        //     non_marketing_dissatisfied_visited: 0,
        //     marketing_visited: 0,
        //     non_marketing_visited: 0,
        //     last7DaysAppointment: 0,
        //     last7DaysAppointment_visited: 0,
        // };

        this.marketingAppt = {
            dateCounts: [] as { date: string; marketing_appts: number; visited_appts: number }[],
        };
        this.nonMarketingAppt = {
            dateCounts: [] as { date: string; marketing_appts: number; visited_appts: number }[],
        };
        this.Appt = {
            dateCounts: [] as { date: string; appts: number; visited_appts: number }[],
        };

        const dateFrom = new Date(this.dateRange[0]);
        const dateTo = new Date(this.dateRange[6]);
        const dateArray = this.generateDateArray(dateFrom, dateTo);

        dateArray.forEach((date) => {
            this.marketingAppt.dateCounts.push({ date: date, marketing_appts: 0, visited_appts: 0 });
            this.nonMarketingAppt.dateCounts.push({ date: date, marketing_appts: 0, visited_appts: 0 });
            this.Appt.dateCounts.push({ date: date, appts: 0, visited_appts: 0 });
        });

        const isDark = this.store.theme === 'dark' || this.store.isDarkMode ? true : false;
        const isRtl = this.store.rtlClass === 'rtl' ? true : false;
        this.userServices.getAppointmentReports(data).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                let temp: any = [];
                this.appointmentList = rData.appointments;
                this.allAppointment = rData.appointments;
                this.appointmentCounts.total_appts = this.appointmentList.length;
                this.appointmentList.forEach((element: any) => {
                    this.userList.forEach((element2) => {
                        if (element2.us_id == element.apptm_created_by) {
                            element.apptm_created = element2.us_firstname;
                            element.us_dept_id = element2.us_dept_id;
                        }
                    });
                    if (element.apptm_group == '2') {
                        element['apptm_group_l'] = 'Campaign';
                    } else if (element.apptm_group == '0' || element.apptm_group == '1') {
                        element['apptm_group_l'] = 'Normal';
                    }
                    if (
                        element.us_dept_id == '3' ||
                        element.source_id == '2' ||
                        element.source_id == '3' ||
                        element.source_id == '7' ||
                        (element.lcl_call_source && element.lcl_call_source == '1')
                    ) {
                        this.appointmentCounts.marketing_appts++;
                        if (element.us_dept_id == '3' || (element.lcl_call_source && element.lcl_call_source == '1')) {
                            this.appointmentCounts.marketing_department++;
                            if (element.apptm_status == '5') {
                                this.appointmentCounts.marketing_department_visited++;
                            }
                        } else if (element.source_id == '2' && element.us_dept_id != '3') {
                            this.appointmentCounts.marketing_social_media++;
                            if (element.apptm_status == '5') {
                                this.appointmentCounts.marketing_social_media_visited++;
                            }
                        } else if (element.source_id == '3' && element.us_dept_id != '3') {
                            this.appointmentCounts.marketing_website++;
                            if (element.apptm_status == '5') {
                                this.appointmentCounts.marketing_website_visited++;
                            }
                        } else if (element.source_id == '7' && element.us_dept_id != '3') {
                            this.appointmentCounts.marketing_google_marketing++;
                            if (element.apptm_status == '5') {
                                this.appointmentCounts.marketing_google_marketing_visited++;
                            }
                        }
                        if (element.apptm_group == '2') {
                            this.appointmentCounts.marketing_campaign++;
                            if (element.apptm_status == '5') {
                                this.appointmentCounts.marketing_campaign_visited++;
                            }
                        }
                        if (element.apptm_group != '2') {
                            this.appointmentCounts.marketing_normal++;
                            if (element.apptm_status == '5') {
                                this.appointmentCounts.marketing_normal_visited++;
                            }
                        }
                        if (element.apptm_status == '5') {
                            this.appointmentCounts.marketing_visited++;
                            this.appointmentCounts.visited_appts++;
                        }
                    }
                    if (
                        element.us_dept_id !== '3' &&
                        element.source_id !== '2' &&
                        element.source_id !== '3' &&
                        element.source_id !== '7' &&
                        (!element.lcl_call_source || element.lcl_call_source !== '1')
                    ) {
                        this.appointmentCounts.non_marketing_appts++;
                        if (element.source_id == '5') {
                            //||(element.source_id != '5' && element.source_id != '6' && element.lcl_call_source != '0' && element.apptm_type == '4')
                            this.appointmentCounts.non_marketing_direct++;
                            if (element.apptm_status == '5') {
                                this.appointmentCounts.non_marketing_direct_visited++;
                            }
                        } else if (element.source_id == '6') {
                            this.appointmentCounts.non_marketing_lost++;
                            if (element.apptm_status == '5') {
                                this.appointmentCounts.non_marketing_lost_visited++;
                            }
                        } else {
                            //if (element.source_id == '1')
                            if (element.apptm_type != '3') {
                                this.appointmentCounts.non_marketing_department++;
                                if (element.apptm_status == '5') {
                                    this.appointmentCounts.non_marketing_department_visited++;
                                }
                            }
                        }
                        if (element.apptm_status == '5') {
                            this.appointmentCounts.non_marketing_visited++;
                            this.appointmentCounts.visited_appts++;
                        }
                        if (element.apptm_group == '2') {
                            this.appointmentCounts.non_marketing_campaign++;
                            if (element.apptm_status == '5') {
                                this.appointmentCounts.non_marketing_campaign_visited++;
                            }
                        }
                        if (element.apptm_group != '2') {
                            this.appointmentCounts.non_marketing_normal++;
                            if (element.apptm_status == '5') {
                                this.appointmentCounts.non_marketing_normal_visited++;
                            }
                        }
                        if (element.apptm_type == '3') {
                            this.appointmentCounts.non_marketing_dissatisfied++;
                            if (element.apptm_status == '5') {
                                this.appointmentCounts.non_marketing_dissatisfied_visited++;
                            }
                        }
                    }
                    if (element.apptm_type == '4' && element.us_dept_id != '3' && element.apptm_group != '2' && element.source_id == '5') {
                        this.appointmentCounts.direct++;
                        if (element.apptm_status == '5') {
                            this.appointmentCounts.direct_visited++;
                        }
                    }
                    if (element.apptm_group == '2') {
                        this.appointmentCounts.campaign++;
                        if (element.apptm_status == '5') {
                            this.appointmentCounts.campaign_visited++;
                        }
                    }
                });
                this.appointmentCounts.not_converted = this.appointmentCounts.total_appts - this.appointmentCounts.visited_appts;
                this.appointmentCounts.marketing_not_visited = this.appointmentCounts.marketing_appts - this.appointmentCounts.marketing_visited;
                this.appointmentCounts.non_marketing_not_visited = this.appointmentCounts.non_marketing_appts - this.appointmentCounts.non_marketing_visited;
                this.appointmentCounts.marketing_campaign_not_visited =
                    this.appointmentCounts.marketing_campaign - this.appointmentCounts.marketing_campaign_visited;
                this.appointmentCounts.marketing_normal_not_visited = this.appointmentCounts.marketing_normal - this.appointmentCounts.marketing_normal_visited;

                this.salesByCategory = {
                    chart: {
                        type: 'donut',
                        height: 200,
                        fontFamily: 'Nunito, sans-serif',
                    },
                    dataLabels: {
                        enabled: false,
                    },
                    colors: isDark ? ['#7cb698', '#5ea2af'] : ['#7cb698', '#5ea2af'],
                    legend: {
                        position: 'bottom',
                        horizontalAlign: 'center',
                        fontSize: '12px',
                        markers: {
                            width: 10,
                            height: 10,
                            offsetX: -2,
                        },
                        height: 40,
                        offsetY: 10,
                    },
                    plotOptions: {
                        pie: {
                            donut: {
                                size: '75%',
                                background: 'transparent',
                                labels: {
                                    show: true,
                                    name: {
                                        show: true,
                                        fontSize: '18px',
                                        offsetY: -10,
                                    },
                                    value: {
                                        show: true,
                                        fontSize: '18px',
                                        color: isDark ? '#bfc9d4' : undefined,
                                        offsetY: 16,
                                        formatter: (val: any) => {
                                            return val;
                                        },
                                    },
                                    total: {
                                        show: true,
                                        label: 'Total',
                                        color: '#888ea8',
                                        fontSize: '18px',
                                        formatter: (w: any) => {
                                            return w.globals.seriesTotals.reduce(function (a: any, b: any) {
                                                return a + b;
                                            }, 0);
                                        },
                                    },
                                },
                            },
                        },
                    },
                    labels: ['Campaign', 'Normal'],
                    states: {
                        hover: {
                            filter: {
                                type: 'none',
                                value: 0.15,
                            },
                        },
                        active: {
                            filter: {
                                type: 'none',
                                value: 0.15,
                            },
                        },
                    },
                    series: [this.appointmentCounts.marketing_campaign, this.appointmentCounts.marketing_normal],
                };
                this.markApptChart = {
                    chart: {
                        type: 'donut',
                        height: 250,
                        fontFamily: 'Nunito, sans-serif',
                    },
                    dataLabels: {
                        enabled: false,
                    },
                    colors: isDark ? ['#7cb698', '#5ea2af', '#2274A5', '#496A81', '#e2a03f'] : ['#7cb698', '#5ea2af', '#2274A5', '#496A81', '#e2a03f'],
                    legend: {
                        position: 'bottom',
                        horizontalAlign: 'center',
                        fontSize: '12px',
                        markers: {
                            width: 10,
                            height: 10,
                            offsetX: -2,
                        },
                        height: 80,
                        offsetY: 10,
                    },
                    plotOptions: {
                        pie: {
                            donut: {
                                size: '75%',
                                background: 'transparent',
                                labels: {
                                    show: true,
                                    name: {
                                        show: true,
                                        fontSize: '18px',
                                        offsetY: -10,
                                    },
                                    value: {
                                        show: true,
                                        fontSize: '18px',
                                        color: isDark ? '#bfc9d4' : undefined,
                                        offsetY: 16,
                                        formatter: (val: any) => {
                                            return val;
                                        },
                                    },
                                    total: {
                                        show: true,
                                        label: 'Total',
                                        color: '#888ea8',
                                        fontSize: '18px',
                                        formatter: (w: any) => {
                                            return w.globals.seriesTotals.reduce(function (a: any, b: any) {
                                                return a + b;
                                            }, 0);
                                        },
                                    },
                                },
                            },
                        },
                    },
                    labels: ['Google Marketing', 'Marketing Department', 'Social Media', 'Website'],
                    states: {
                        hover: {
                            filter: {
                                type: 'none',
                                value: 0.15,
                            },
                        },
                        active: {
                            filter: {
                                type: 'none',
                                value: 0.15,
                            },
                        },
                    },
                    series: [
                        this.appointmentCounts.marketing_google_marketing,
                        this.appointmentCounts.marketing_department,
                        this.appointmentCounts.marketing_social_media,
                        this.appointmentCounts.marketing_website,
                    ],
                };
                this.nonMarkApptChart = {
                    chart: {
                        type: 'donut',
                        height: 200,
                        fontFamily: 'Nunito, sans-serif',
                    },
                    dataLabels: {
                        enabled: false,
                    },
                    colors: isDark ? ['#7cb698', '#5ea2af'] : ['#7cb698', '#5ea2af'],
                    legend: {
                        position: 'bottom',
                        horizontalAlign: 'center',
                        fontSize: '12px',
                        markers: {
                            width: 10,
                            height: 10,
                            offsetX: -2,
                        },
                        height: 40,
                        offsetY: 10,
                    },
                    plotOptions: {
                        pie: {
                            donut: {
                                size: '75%',
                                background: 'transparent',
                                labels: {
                                    show: true,
                                    name: {
                                        show: true,
                                        fontSize: '18px',
                                        offsetY: -10,
                                    },
                                    value: {
                                        show: true,
                                        fontSize: '18px',
                                        color: isDark ? '#bfc9d4' : undefined,
                                        offsetY: 16,
                                        formatter: (val: any) => {
                                            return val;
                                        },
                                    },
                                    total: {
                                        show: true,
                                        label: 'Total',
                                        color: '#888ea8',
                                        fontSize: '18px',
                                        formatter: (w: any) => {
                                            return w.globals.seriesTotals.reduce(function (a: any, b: any) {
                                                return a + b;
                                            }, 0);
                                        },
                                    },
                                },
                            },
                        },
                    },
                    labels: ['Campaign', 'Normal'],
                    states: {
                        hover: {
                            filter: {
                                type: 'none',
                                value: 0.15,
                            },
                        },
                        active: {
                            filter: {
                                type: 'none',
                                value: 0.15,
                            },
                        },
                    },
                    series: [this.appointmentCounts.non_marketing_campaign, this.appointmentCounts.non_marketing_normal],
                };
                this.nonMarkAppt = {
                    chart: {
                        type: 'donut',
                        height: 250,
                        fontFamily: 'Nunito, sans-serif',
                    },
                    dataLabels: {
                        enabled: false,
                    },
                    colors: isDark ? ['#7cb698', '#5ea2af', '#2274A5', '#496A81', '#e2a03f'] : ['#7cb698', '#5ea2af', '#2274A5', '#496A81', '#e2a03f'],
                    legend: {
                        position: 'bottom',
                        horizontalAlign: 'center',
                        fontSize: '12px',
                        markers: {
                            width: 10,
                            height: 10,
                            offsetX: -2,
                        },
                        height: 80,
                        offsetY: 10,
                    },
                    plotOptions: {
                        pie: {
                            donut: {
                                size: '75%',
                                background: 'transparent',
                                labels: {
                                    show: true,
                                    name: {
                                        show: true,
                                        fontSize: '18px',
                                        offsetY: -10,
                                    },
                                    value: {
                                        show: true,
                                        fontSize: '18px',
                                        color: isDark ? '#bfc9d4' : undefined,
                                        offsetY: 16,
                                        formatter: (val: any) => {
                                            return val;
                                        },
                                    },
                                    total: {
                                        show: true,
                                        label: 'Total',
                                        color: '#888ea8',
                                        fontSize: '18px',
                                        formatter: (w: any) => {
                                            return w.globals.seriesTotals.reduce(function (a: any, b: any) {
                                                return a + b;
                                            }, 0);
                                        },
                                    },
                                },
                            },
                        },
                    },
                    labels: ['Direct', 'Non-Marketing Department', 'Lost Customer', 'Dissatisfied'],
                    states: {
                        hover: {
                            filter: {
                                type: 'none',
                                value: 0.15,
                            },
                        },
                        active: {
                            filter: {
                                type: 'none',
                                value: 0.15,
                            },
                        },
                    },
                    series: [
                        this.appointmentCounts.non_marketing_direct,
                        this.appointmentCounts.non_marketing_department,
                        this.appointmentCounts.non_marketing_lost,
                        this.appointmentCounts.non_marketing_dissatisfied,
                    ],
                };

                //this.appt_load_flag = false;
            } else {
                //this.coloredToast('danger', 'No appointments found');
                this.appt_load_flag = false;
            }
        });
        this.userServices.Last7DaysAppointments(last7data).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.marketingAppointments = rData.Last7DaysMarketingAppointment;
                this.marketingAppointments.forEach((element: any) => {
                    this.userList.forEach((element2) => {
                        if (element2.us_id == element.apptm_created_by) {
                            element.apptm_created = element2.us_firstname;
                            element.us_dept_id = element2.us_dept_id;
                        }
                    });
                    if (
                        element.us_dept_id == '3' ||
                        element.source_id == '2' ||
                        element.source_id == '3' ||
                        element.source_id == '7' ||
                        (element.lcl_call_source && element.lcl_call_source == '1')
                    ) {
                        const appointmentDate = new Date(element.appt_date).toISOString().split('T')[0];
                        const dateCount = this.marketingAppt.dateCounts.find((d: any) => d.date === appointmentDate);

                        if (dateCount) {
                            dateCount.marketing_appts++;
                            if (element.apptm_status == '5') {
                                dateCount.visited_appts++;
                            }
                        }
                    }
                    if (
                        element.us_dept_id !== '3' &&
                        element.source_id !== '2' &&
                        element.source_id !== '3' &&
                        element.source_id !== '7' &&
                        (!element.lcl_call_source || element.lcl_call_source !== '1')
                    ) {
                        const appointmentDate = new Date(element.appt_date).toISOString().split('T')[0];
                        const dateCount = this.nonMarketingAppt.dateCounts.find((d: any) => d.date === appointmentDate);

                        if (dateCount) {
                            dateCount.marketing_appts++;
                            if (element.apptm_status == '5') {
                                dateCount.visited_appts++;
                            }
                        }
                    }
                    const appointmentDate = new Date(element.appt_date).toISOString().split('T')[0];
                    const dateCount = this.Appt.dateCounts.find((d: any) => d.date === appointmentDate);
                    if (dateCount) {
                        dateCount.appts++;
                        if (element.apptm_status == '5') {
                            dateCount.visited_appts++;
                        }
                    }

                    this.appointmentCounts.last7DaysAppointment++;
                    if (element.apptm_status == '5') {
                        this.appointmentCounts.last7DaysAppointment_visited++;
                    }
                });
                this.last7DaysmarketingAppt = this.marketingAppt.dateCounts;
                this.last7DaysNonmarketingAppt = this.nonMarketingAppt.dateCounts;
                this.last7DaysAppt = this.Appt.dateCounts;
                this.profiteChartOption = {
                    chart: {
                        height: 45,
                        width: '100%',
                        type: 'line',
                        sparkline: {
                            enabled: true,
                        },
                    },
                    stroke: {
                        width: 2,
                    },
                    markers: {
                        size: 0,
                    },
                    colors: ['#134aec'],
                    grid: {
                        padding: {
                            top: 0,
                            bottom: 0,
                            left: 0,
                        },
                    },
                    tooltip: {
                        x: {
                            show: false,
                        },
                        y: {
                            title: {
                                formatter: (val: any) => {
                                    return '';
                                },
                            },
                        },
                    },
                    responsive: [
                        {
                            breakPoint: 576,
                            options: {
                                chart: {
                                    height: 95,
                                },
                                grid: {
                                    padding: {
                                        top: 45,
                                        bottom: 0,
                                        left: 0,
                                    },
                                },
                            },
                        },
                    ],
                    series: [
                        {
                            name: 'Total Appointments',
                            data: [
                                this.last7DaysAppt[0].appts,
                                this.last7DaysAppt[1].appts,
                                this.last7DaysAppt[2].appts,
                                this.last7DaysAppt[3].appts,
                                this.last7DaysAppt[4].appts,
                                this.last7DaysAppt[5].appts,
                                this.last7DaysAppt[6].appts,
                            ],
                        },
                    ],
                };
                this.last7DayApptChart = {
                    chart: {
                        height: 45,
                        width: '100%',
                        type: 'line',
                        sparkline: {
                            enabled: true,
                        },
                    },
                    stroke: {
                        width: 2,
                    },
                    markers: {
                        size: 0,
                    },
                    colors: ['#00ab55'],
                    grid: {
                        padding: {
                            top: 0,
                            bottom: 0,
                            left: 0,
                        },
                    },
                    tooltip: {
                        x: {
                            show: false,
                        },
                        y: {
                            title: {
                                formatter: (val: any) => {
                                    return '';
                                },
                            },
                        },
                    },
                    responsive: [
                        {
                            breakPoint: 576,
                            options: {
                                chart: {
                                    height: 95,
                                },
                                grid: {
                                    padding: {
                                        top: 45,
                                        bottom: 0,
                                        left: 0,
                                    },
                                },
                            },
                        },
                    ],
                    series: [
                        {
                            name: 'Total Appointments Visited',
                            data: [
                                this.last7DaysAppt[0].visited_appts,
                                this.last7DaysAppt[1].visited_appts,
                                this.last7DaysAppt[2].visited_appts,
                                this.last7DaysAppt[3].visited_appts,
                                this.last7DaysAppt[4].visited_appts,
                                this.last7DaysAppt[5].visited_appts,
                                this.last7DaysAppt[6].visited_appts,
                            ],
                        },
                    ],
                };

                this.followers = {
                    chart: {
                        height: 250,
                        type: 'area',
                        fontFamily: 'Nunito, sans-serif',
                        sparkline: {
                            enabled: false,
                        },
                    },
                    stroke: {
                        curve: 'smooth',
                        width: 2,
                    },
                    colors: ['#4361ee', '#00ab55'],
                    grid: {
                        padding: {
                            top: 5,
                        },
                    },
                    yaxis: {
                        show: false,
                    },
                    tooltip: {
                        x: {
                            show: false,
                        },
                        y: {
                            title: {
                                formatter: (val: any) => {
                                    return '';
                                },
                            },
                        },
                    },
                    fill: isDark
                        ? null
                        : {
                              type: 'gradient',
                              gradient: {
                                  type: 'vertical',
                                  shadeIntensity: 1,
                                  inverseColors: false,
                                  opacityFrom: 0.3,
                                  opacityTo: 0.05,
                                  stops: [100, 100],
                              },
                          },
                    legend: {
                        position: 'bottom',
                        horizontalAlign: 'center',
                        fontSize: '12px',
                        markers: {
                            width: 10,
                            height: 10,
                            offsetX: -2,
                        },
                        height: 80,
                        offsetY: 10,
                    },
                    plotOptions: {
                        pie: {
                            donut: {
                                size: '75%',
                                background: 'transparent',
                                labels: {
                                    show: true,
                                    name: {
                                        show: true,
                                        fontSize: '18px',
                                        offsetY: -10,
                                    },
                                    value: {
                                        show: true,
                                        fontSize: '18px',
                                        color: isDark ? '#bfc9d4' : undefined,
                                        offsetY: 16,
                                        formatter: (val: any) => {
                                            return val;
                                        },
                                    },
                                    total: {
                                        show: true,
                                        label: 'Total',
                                        color: '#888ea8',
                                        fontSize: '18px',
                                        formatter: (w: any) => {
                                            return w.globals.seriesTotals.reduce(function (a: any, b: any) {
                                                return a + b;
                                            }, 0);
                                        },
                                    },
                                },
                            },
                        },
                    },
                    series: [
                        {
                            name: 'Total Appointments',
                            data: [
                                this.last7DaysmarketingAppt[0].marketing_appts,
                                this.last7DaysmarketingAppt[1].marketing_appts,
                                this.last7DaysmarketingAppt[2].marketing_appts,
                                this.last7DaysmarketingAppt[3].marketing_appts,
                                this.last7DaysmarketingAppt[4].marketing_appts,
                                this.last7DaysmarketingAppt[5].marketing_appts,
                                this.last7DaysmarketingAppt[6].marketing_appts,
                            ],
                        },
                        {
                            name: 'Visted Appointments',
                            data: [
                                this.last7DaysmarketingAppt[0].visited_appts,
                                this.last7DaysmarketingAppt[1].visited_appts,
                                this.last7DaysmarketingAppt[2].visited_appts,
                                this.last7DaysmarketingAppt[3].visited_appts,
                                this.last7DaysmarketingAppt[4].visited_appts,
                                this.last7DaysmarketingAppt[5].visited_appts,
                                this.last7DaysmarketingAppt[6].visited_appts,
                            ],
                        },
                    ],
                };
                this.last7dayNonMarkApptChart = {
                    chart: {
                        height: 250,
                        type: 'area',
                        fontFamily: 'Nunito, sans-serif',
                        sparkline: {
                            enabled: false,
                        },
                    },
                    stroke: {
                        curve: 'smooth',
                        width: 2,
                    },
                    colors: ['#4361ee', '#00ab55'],
                    //labels: ['Total Appointments', 'Visited Appointments'],
                    grid: {
                        padding: {
                            top: 5,
                        },
                    },
                    yaxis: {
                        show: false,
                    },
                    tooltip: {
                        x: {
                            show: false,
                        },
                        y: {
                            title: {
                                formatter: (val: any) => {
                                    return '';
                                },
                            },
                        },
                    },
                    fill: isDark
                        ? null
                        : {
                              type: 'gradient',
                              gradient: {
                                  type: 'vertical',
                                  shadeIntensity: 1,
                                  inverseColors: false,
                                  opacityFrom: 0.3,
                                  opacityTo: 0.05,
                                  stops: [100, 100],
                              },
                          },
                    legend: {
                        position: 'bottom',
                        horizontalAlign: 'center',
                        fontSize: '12px',
                        markers: {
                            width: 10,
                            height: 10,
                            offsetX: -2,
                        },
                        height: 80,
                        offsetY: 10,
                    },
                    plotOptions: {
                        pie: {
                            donut: {
                                size: '75%',
                                background: 'transparent',
                                labels: {
                                    show: true,
                                    name: {
                                        show: true,
                                        fontSize: '18px',
                                        offsetY: -10,
                                    },
                                    value: {
                                        show: true,
                                        fontSize: '18px',
                                        color: isDark ? '#bfc9d4' : undefined,
                                        offsetY: 16,
                                        formatter: (val: any) => {
                                            return val;
                                        },
                                    },
                                    total: {
                                        show: true,
                                        label: 'Total',
                                        color: '#888ea8',
                                        fontSize: '18px',
                                        formatter: (w: any) => {
                                            return w.globals.seriesTotals.reduce(function (a: any, b: any) {
                                                return a + b;
                                            }, 0);
                                        },
                                    },
                                },
                            },
                        },
                    },
                    series: [
                        {
                            name: 'Total Appointments',
                            data: [
                                this.last7DaysNonmarketingAppt[0].marketing_appts,
                                this.last7DaysNonmarketingAppt[1].marketing_appts,
                                this.last7DaysNonmarketingAppt[2].marketing_appts,
                                this.last7DaysNonmarketingAppt[3].marketing_appts,
                                this.last7DaysNonmarketingAppt[4].marketing_appts,
                                this.last7DaysNonmarketingAppt[5].marketing_appts,
                                this.last7DaysNonmarketingAppt[6].marketing_appts,
                            ],
                        },
                        {
                            name: 'Visted Appointments',
                            data: [
                                this.last7DaysNonmarketingAppt[0].visited_appts,
                                this.last7DaysNonmarketingAppt[1].visited_appts,
                                this.last7DaysNonmarketingAppt[2].visited_appts,
                                this.last7DaysNonmarketingAppt[3].visited_appts,
                                this.last7DaysNonmarketingAppt[4].visited_appts,
                                this.last7DaysNonmarketingAppt[5].visited_appts,
                                this.last7DaysNonmarketingAppt[6].visited_appts,
                            ],
                        },
                    ],
                };
                this.fetchData();
                this.appt_load_flag = false;
            } else {
                this.appt_load_flag = false;
                this.fetchData();
            }
        });
    }

    fetchData() {
        // Prepare data objects for the API call
        this.internal_cust_load_flag = true;
        const dataOut = {
            call_type: 'Outbound',
            start_day: this.dateFrom + ' 00:00:00',
            end_day: this.dateTo + ' 23:59:59',
        };

        // Fetch latest call report data outside forEach loop
        this.userServices.getLatestCallReportData(dataOut).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                const outbound = rdata.call_data.filter((item: any) => item.src !== '6300').sort((a: any, b: any) => b.timestamp - a.timestamp);

                // Create an array to hold all the promises
                let promises: any = [];
                // Iterate over filter options
                this.filterOptions.forEach((filter) => {
                    const fetchtype = filter.id;

                    // Update filter data after processing
                    filter.data = {
                        total_row: 0,
                        converted: 0,
                        attempted_converted_count: 0,
                        nonattempted_converted_count: 0,
                        not_converted_count: 0,
                        attempted_call: 0,
                        not_attempted_call: 0,
                    };

                    // Fetch staff performance data for each filter option

                    let data = {
                        us_id: atob(atob(localStorage.getItem('us_id') || '')),
                        start_date: this.dateFrom,
                        date_to: this.dateTo,
                        fetchtype: fetchtype,
                    };

                    // Push the promise to the array
                    let promise = lastValueFrom(this.userServices.getStaffPerformance(data)).then((rData: any) => {
                        if (rData.ret_data === 'success') {
                            this.alllist = rData.data;
                            let attempted_converted_count = 0;
                            let converted_count = 0;

                            // Update alllist with call attempt status based on the fetched outbound data
                            this.alllist.forEach((x) => {
                                let status;
                                const result = outbound.find((a1: { dst: string }) => a1.dst.substring(a1.dst.length - 7) === x.phon_uniq);
                                if (result) {
                                    if (result.disposition === 'NO ANSWER') {
                                        if (result.ringduration >= 30) {
                                            x.call_attempted = 'Attempted';
                                            status = 'Not Answered';
                                        } else {
                                            x.call_attempted = 'Not Attempted';
                                            status = 'Ring<30';
                                        }
                                    } else if (result.disposition === 'ANSWERED') {
                                        x.call_attempted = 'Attempted';
                                        status = 'Answered';
                                    } else {
                                        x.call_attempted = 'Not Attempted';
                                        status = '';
                                    }
                                } else {
                                    x.call_attempted = 'Not Attempted';
                                    status = '';
                                }
                                return x;
                            });

                            // Calculate various counts for the current filter option
                            const total_row = this.alllist.length;
                            this.attempted_converted_count = 0;
                            this.converted_count = 0;
                            this.not_converted_count = 0;

                            let tempattemptconverted_count = this.alllist.filter(({ jobcount, lcst_ring_status }) => {
                                return parseInt(jobcount) >= 1 && lcst_ring_status && lcst_ring_status.trim() == 'Answered';
                            });
                            let tempconverted_count = this.alllist.filter(({ jobcount }) => {
                                return parseInt(jobcount) >= 1;
                            });

                            if (tempattemptconverted_count.length > 0) {
                                this.attempted_converted_count = tempattemptconverted_count.length;
                            }
                            if (tempconverted_count.length > 0) {
                                this.converted_count = tempconverted_count.length;
                            }

                            const nonattempted_converted_count = Number(this.converted_count) - Number(this.attempted_converted_count);
                            const not_converted_count = Number(this.alllist.length) - Number(this.converted_count);
                            let attempted_callcount = this.alllist.filter(({ lcst_ring_status }) => {
                                return lcst_ring_status && lcst_ring_status.trim() === 'Answered';
                            });
                            const attempted_call = attempted_callcount.length;
                            let not_attempted_callcount = this.alllist.filter(({ lcst_ring_status }) => {
                                return (lcst_ring_status && lcst_ring_status != 'Answered') || lcst_ring_status == '' || lcst_ring_status == null;
                            });

                            const not_attempted_call = not_attempted_callcount.length;

                            // Update filter data
                            filter.data = {
                                total_row: total_row,
                                converted: this.converted_count,
                                attempted_converted_count: this.attempted_converted_count,
                                nonattempted_converted_count: nonattempted_converted_count,
                                not_converted_count: not_converted_count,
                                attempted_call: attempted_call,
                                not_attempted_call: not_attempted_call,
                            };

                            // Log filter data for debugging
                        }
                    });

                    promises.push(promise);
                });

                // Use Promise.all to wait for all promises to resolve
                Promise.all(promises).then(() => {
                    this.internal_cust_load_flag = false;
                    const isDark = this.store.theme === 'dark' || this.store.isDarkMode ? true : false;

                    this.customerChart = {
                        chart: {
                            type: 'donut',
                            height: 300,
                            fontFamily: 'Nunito, sans-serif',
                        },
                        dataLabels: {
                            enabled: false,
                        },
                        colors: isDark ? ['#7cb698', '#5ea2af'] : ['#7cb698', '#5ea2af'],
                        legend: {
                            position: 'bottom',
                            horizontalAlign: 'center',
                            fontSize: '12px',
                            markers: {
                                width: 10,
                                height: 10,
                                offsetX: -2,
                            },
                            height: 40,
                            offsetY: 10,
                        },
                        plotOptions: {
                            pie: {
                                donut: {
                                    size: '75%',
                                    background: 'transparent',
                                    labels: {
                                        show: true,
                                        name: {
                                            show: true,
                                            fontSize: '18px',
                                            offsetY: -10,
                                        },
                                        value: {
                                            show: true,
                                            fontSize: '18px',
                                            color: isDark ? '#bfc9d4' : undefined,
                                            offsetY: 16,
                                            formatter: (val: any) => {
                                                return val;
                                            },
                                        },
                                        total: {
                                            show: true,
                                            label: 'Total',
                                            color: '#888ea8',
                                            fontSize: '18px',
                                            formatter: (w: any) => {
                                                return w.globals.seriesTotals.reduce(function (a: any, b: any) {
                                                    return a + b;
                                                }, 0);
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        labels: ['Attempted Call', 'Not Attempted Call'],
                        states: {
                            hover: {
                                filter: {
                                    type: 'none',
                                    value: 0.15,
                                },
                            },
                            active: {
                                filter: {
                                    type: 'none',
                                    value: 0.15,
                                },
                            },
                        },
                        series: [this.filterOptions[0].data.attempted_call, this.filterOptions[0].data.not_attempted_call],
                    };
                    this.customerConvertedChart = {
                        chart: {
                            type: 'donut',
                            height: 300,
                            fontFamily: 'Nunito, sans-serif',
                        },
                        dataLabels: {
                            enabled: false,
                        },
                        colors: isDark ? ['#7cb698', '#5ea2af'] : ['#7cb698', '#5ea2af'],
                        legend: {
                            position: 'bottom',
                            horizontalAlign: 'center',
                            fontSize: '12px',
                            markers: {
                                width: 10,
                                height: 10,
                                offsetX: -2,
                            },
                            height: 40,
                            offsetY: 10,
                        },
                        plotOptions: {
                            pie: {
                                donut: {
                                    size: '75%',
                                    background: 'transparent',
                                    labels: {
                                        show: true,
                                        name: {
                                            show: true,
                                            fontSize: '18px',
                                            offsetY: -10,
                                        },
                                        value: {
                                            show: true,
                                            fontSize: '18px',
                                            color: isDark ? '#bfc9d4' : undefined,
                                            offsetY: 16,
                                            formatter: (val: any) => {
                                                return val;
                                            },
                                        },
                                        total: {
                                            show: true,
                                            label: 'Total',
                                            color: '#888ea8',
                                            fontSize: '18px',
                                            formatter: (w: any) => {
                                                return w.globals.seriesTotals.reduce(function (a: any, b: any) {
                                                    return a + b;
                                                }, 0);
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        labels: ['Converted', 'Not Converted'],
                        states: {
                            hover: {
                                filter: {
                                    type: 'none',
                                    value: 0.15,
                                },
                            },
                            active: {
                                filter: {
                                    type: 'none',
                                    value: 0.15,
                                },
                            },
                        },
                        series: [this.filterOptions[0].data.converted, this.filterOptions[0].data.not_converted_count],
                    };
                });

                // this.load_flag = false;

            }
        });
    }

    generateDateArray(startDate: Date, endDate: Date): string[] {
        const dateArray = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            dateArray.push(new Date(currentDate).toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dateArray;
    }

    newTargetGraph() {
        this.columnChart = {
            chart: {
                height: 200,
                type: 'bar',
                fontFamily: 'Arial Rounded MT Regular',
                toolbar: {
                    show: false,
                },
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                width: 2,
                colors: ['transparent'],
            },
            colors: ['#5c1ac3', '#1f5ace'],
            dropShadow: {
                enabled: true,
                blur: 3,
                color: '#515365',
                opacity: 0.4,
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    borderRadius: 10,
                    borderRadiusApplication: 'end',
                },
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
                fontSize: '9px',
                markers: {
                    width: 10,
                    height: 10,
                    offsetX: -2,
                },
                itemMargin: {
                    horizontal: 10,
                    vertical: 5,
                },
            },
            grid: {
                borderColor: '#e0e6ed',
                padding: {
                    left: 20,
                    right: 20,
                },
            },
            xaxis: {
                fontSize: '9px',
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                axisBorder: {
                    show: true,
                    color: '#e0e6ed',
                },
            },
            yaxis: {
                fontSize: '9px',
                tickAmount: 4,
                opposite: false,
                labels: {
                    offsetX: 0,
                },
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shade: 'light',
                    type: 'vertical',
                    shadeIntensity: 0.3,
                    inverseColors: false,
                    opacityFrom: 1,
                    opacityTo: 0.8,
                    stops: [0, 100],
                },
            },
            tooltip: {
                marker: {
                    show: true,
                },
                y: {
                    formatter: (val: any) => {
                        return val;
                    },
                },
            },
            series: [
                {
                    name: 'Target',
                    data: [
                        this.yeartarget[0].ts_newinbound,
                        this.yeartarget[1].ts_newinbound,
                        this.yeartarget[2].ts_newinbound,
                        this.yeartarget[3].ts_newinbound,
                        this.yeartarget[4].ts_newinbound,
                        this.yeartarget[5].ts_newinbound,
                        this.yeartarget[6].ts_newinbound,
                        this.yeartarget[7].ts_newinbound,
                        this.yeartarget[8].ts_newinbound,
                        this.yeartarget[9].ts_newinbound,
                        this.yeartarget[10].ts_newinbound,
                        this.yeartarget[11].ts_newinbound,
                    ],
                },
                {
                    name: 'Achieved',
                    data: [80, 45, 50, 57, 56, 61, 58, 63, 60, 66, 56, 30],
                },
            ],
        };
    }

    exstTargetGraph() {
        this.columnChart1 = {
            chart: {
                height: 200,
                type: 'bar',
                fontFamily: 'Arial Rounded MT Regular',
                toolbar: {
                    show: false,
                },
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                width: 2,
                colors: ['transparent'],
            },
            colors: ['#5c1ac3', '#1f5ace'],
            dropShadow: {
                enabled: true,
                blur: 3,
                color: '#515365',
                opacity: 0.4,
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    borderRadius: 10,
                    borderRadiusApplication: 'end',
                },
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
                fontSize: '9px',
                markers: {
                    width: 10,
                    height: 10,
                    offsetX: -2,
                },
                itemMargin: {
                    horizontal: 10,
                    vertical: 5,
                },
            },
            grid: {
                borderColor: '#e0e6ed',
                padding: {
                    left: 20,
                    right: 20,
                },
            },
            xaxis: {
                fontSize: '9px',
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                axisBorder: {
                    show: true,
                    color: '#e0e6ed',
                },
            },
            yaxis: {
                fontSize: '9px',
                tickAmount: 4,
                opposite: false,
                labels: {
                    offsetX: 0,
                },
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shade: 'light',
                    type: 'vertical',
                    shadeIntensity: 0.3,
                    inverseColors: false,
                    opacityFrom: 1,
                    opacityTo: 0.8,
                    stops: [0, 100],
                },
            },
            tooltip: {
                marker: {
                    show: true,
                },
                y: {
                    formatter: (val: any) => {
                        return val;
                    },
                },
            },
            series: [
                {
                    name: 'Target',
                    data: [
                        this.yeartarget[0].ts_exinbound,
                        this.yeartarget[1].ts_exinbound,
                        this.yeartarget[2].ts_exinbound,
                        this.yeartarget[3].ts_exinbound,
                        this.yeartarget[4].ts_exinbound,
                        this.yeartarget[5].ts_exinbound,
                        this.yeartarget[6].ts_exinbound,
                        this.yeartarget[7].ts_exinbound,
                        this.yeartarget[8].ts_exinbound,
                        this.yeartarget[9].ts_exinbound,
                        this.yeartarget[10].ts_exinbound,
                        this.yeartarget[11].ts_exinbound,
                    ],
                },
                {
                    name: 'Achieved',
                    data: [80, 45, 50, 57, 56, 61, 58, 63, 60, 66, 56, 30],
                },
            ],
        };
    }
}
