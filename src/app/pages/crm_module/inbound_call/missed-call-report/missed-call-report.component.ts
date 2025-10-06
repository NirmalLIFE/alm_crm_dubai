import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-missed-call-report',
    templateUrl: './missed-call-report.component.html',
    styleUrls: ['./missed-call-report.component.css'],
})
export class MissedCallReportComponent implements OnInit {
    public start_date: string = this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '';
    public end_date: string = this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '';

    arr_sample: any;
    public search: string = '';
    public load_flag: boolean = true;

    bTime: any;
    wstart: any;
    wend: any;
    wbTime: any;
    holiday: any[] = [];
    holi_dates: any[] = [];
    userlist: any[] = [];
    numarray: any[] = [];
    report: any[] = [];
    temp: any[] = [];
    callnum: any[] = [];
    comlist: any[] = [];
    calls_common: any[] = [];
    allmisscall: any[] = [];
    ext_number: any;
    ystarcallid: any[] = [];
    report_temp: any[] = [];


  // Worktime call
  wtCn = 0;
  wtCne = 0;
  wtCnn = 0;
  wtCnAp = 0;
  wtCnApe = 0;
  wtCnApn = 0;
  wtCnCbe = 0;
  wtCnCbn = 0;
  wtCnCb = 0;
  //Non Worktme
  nwtCn = 0;
  nwtCne = 0;
  nwtCnn = 0;
  nwtCnCbe = 0;
  nwtCnCbn = 0;
  nwtCnAp = 0;
  nwtCnApe = 0
  nwtCnApn = 0;


    totalcall = 0;
    nwtCnCb = 0;

    ncbCn = 0;
    cbCn = 0;
    necall = 0;
    excall = 0;

    cols = [
        { field: 'src', title: 'Call From', isUnique: true, hide: false },
        { field: 'customer', title: 'Customer', hide: false },
        { field: 'Callback', title: 'Callback', hide: false },
        { field: 'call_list', title: 'Call List' },
        { field: 'note', title: 'Note', hide: false },
        { field: 'app_date', title: 'Appointment Date', hide: true },
        { field: 'action', title: 'Actions', hide: false },
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
    phone: any;
    incoming: any[] = [];
    outgoing: any[] = [];
    log: any[] = [];
    callidarray: any[] = [];
    selectedCard: string | null = null;

    @ViewChild('custDetailModal') custDetailModal: any;

    constructor(private userServices: StaffPostAuthService, public datepipe: DatePipe, private router: Router, public storeData: Store<any>) {}

    ngOnInit(): void {
        this.getCalls();
        this.selectedCard = 'TOTALCALL';
    }

    getCalls() {
        this.selectedCard = 'TOTALCALL';
        this.userServices.getCommonSettings().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.bTime = rdata.settings.mis_buffer_time;
                this.wbTime = rdata.settings.workhour_mis_buffer_time;
                this.wstart = rdata.settings.working_time_start;
                this.wend = rdata.settings.working_time_end;
            } else {
                this.coloredToast('danger', 'Some error occurred please try again');
                this.load_flag = false;
            }
        });
        // let senddata = {
        //     month: '03',
        //     year: '2023',
        // };
        // this.userServices.getHoliday_report(senddata).subscribe((rdata: any) => {
        //     if (rdata.ret_data == 'success') {
        //         this.holiday = rdata.holi;
        //         this.holi_dates = rdata.dates;
        //     } else {
        //         // this.coloredToast(
        //         //   "danger",
        //         //   "Error!!!",
        //         //   "Some error occurred please try again"
        //         // );
        //         // this.load_flag = false;
        //     }
        // });
        this.userServices.userList().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.userlist = rdata.userList;
                this.callData();
            } else {
                this.load_flag = false;
            }
        });
    }

    callData() {
        this.load_flag = true;
        this.numarray = [];
        this.temp = [];
        let that = this;
        this.report = [];
        this.nwtCn = 0;
        this.wtCn = 0;
        this.wtCne = 0;
        this.wtCnn = 0;
        this.nwtCne = 0;
        this.nwtCnn = 0;
        this.wtCnCbe = 0;
        this.wtCnCbn = 0;
        this.wtCnApe = 0;
        this.wtCnApn = 0;
        this.nwtCnCbe = 0;
        this.nwtCnCbn = 0;
        this.nwtCnApe = 0;
        this.nwtCnApn = 0;


        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        // var enddate: any;
        // var start_date: any;

        // enddate = moment(this.end_date, 'DD/MM/YYYY').toDate();
        // enddate = moment(enddate).format('YYYY-MM-DD');

        // start_date = moment(this.start_date, 'DD/MM/YYYY').toDate();
        // start_date = moment(start_date).format('YYYY-MM-DD');

        let dataOut = {
            call_type: 'Outbound',
            start_day: this.start_date + ' 00:00:00',
            end_day: this.end_date + ' 23:59:59',
        };
        this.userServices.getLatestCallReportData(dataOut).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                let i = 0;
                if (rdata.call_data.length > 0) {
                    let call_re = rdata.call_data.filter((data: any) => data.calltype == 'Outbound' && data.disposition == 'ANSWERED' && data.dst.length > 3);
                    this.temp = rdata.call_data.filter((dataa: any) => dataa.calltype == 'Outbound' && dataa.disposition == 'ANSWERED' && dataa.dst.length > 3);
                }
            } else {
                this.load_flag = false;
            }
            let data = {
                call_type: 'Inbound',
                start_day: this.start_date + ' 00:00:00',
                end_day: this.end_date + ' 23:59:59',
                disposition: 'NO ANSWER',
            };
            this.userServices.getLatestCallReportData(data).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    this.callnum = [];
                    if (rdata.call_data.length > 0) {
                        this.calls_common = rdata.call_data.filter((data: any) => data.src != 'Unknown'); //data.dst.length > 3 &&    used to display only misscalls to 6300 but now shows all miscalls
                        this.userServices.getExcludedNumberList().subscribe((rdata: any) => {
                            if (rdata.ret_data == 'success') {
                                this.comlist = rdata.numlist;
                                this.report = this.calls_common.filter((element) => {
                                    return !this.comlist.some((element2) => {
                                        return element.src.substring(element.src.length - 7) === element2.cn_number.substring(element2.cn_number.length - 7);
                                    });
                                });
                                // console.log('report dataatatattatatatat', this.report);
                                this.allmisscall = this.report;
                                // console.log("allmisscall", this.allmisscall);

                                this.report = this.getUniqueListBy(this.report, 'src');
                                this.callnum = this.report.map((number) => number.src);
                                this.totalcall = this.report.length;
                                this.report = this.report.sort(function (a, b): any {
                                    return b.timestamp - a.timestamp;
                                });
                                if (this.ext_number) {
                                    let filteredArr = this.report.filter((data) => data.src == this.ext_number);
                                    this.report = filteredArr;
                                    this.totalcall = this.report.length;
                                }

                                if (atob(atob(localStorage.getItem('us_role_id') || '{}')) != '1') {
                                    this.report.forEach((element) => {
                                        var a = element['datetime'].split(' ');
                                        var tdate = a[0];
                                        var time = a[1];
                                        element['call_time'] = moment(time, 'HHmmss').format('hh:mm:ss A');
                                        element['call_date'] = tdate;
                                        element['call_from_strip'] = '****' + element['src'].substring(element['src'].length - 6);
                                        var callto = element['call_to'] + ' ';
                                        this.numarray.push(element['src'].substring(element['src'].length - 7));
                                        this.userlist.forEach((element2) => {
                                            if (element2.ext_number == callto.substring(0, 3)) {
                                                element['user'] = element2.us_firstname;
                                            }
                                        });

                                        var iday = moment(element['datetime'], 'DD/MM/YYYY').day();

                                        if (time >= that.wstart && time <= that.wend) {
                                            element['wt'] = 'true';
                                            that.wtCn++;
                                        } else {
                                            element['wt'] = 'false';
                                            that.nwtCn++;
                                        }
                                        // this.worktimeList.forEach(element3 => {
                                        //   if((element3.uwt_user_ext)==callto.substring(0,3) && element['time'].getTime()){
                                        //     element['user']=element2.us_firstname;
                                        //   }
                                        // });
                                    });
                                } else {
                                    this.report.forEach((element) => {
                                        var a = element['datetime'].split(' ');
                                        var tdate = a[0];
                                        var time = a[1];
                                        element['call_time'] = moment(time, 'HHmmss').format('hh:mm:ss A');
                                        element['call_date'] = tdate;
                                        element['call_from_strip'] = '****' + element['src'].substring(element['src'].length - 6);
                                        this.numarray.push(element['src'].substring(element['src'].length - 7));

                                        var callto = element['call_to'] + ' ';
                                        this.userlist.forEach((element2) => {
                                            if (element2.ext_number == callto.substring(0, 3)) {
                                                element['user'] = element2.us_firstname;
                                            }
                                        });
                                        var iday = moment(element['datetime'], 'DD/MM/YYYY').day();

                                        if (time >= that.wstart && time <= that.wend) {
                                            element['wt'] = 'true';
                                            that.wtCn++;
                                        } else {
                                            element['wt'] = 'false';
                                            that.nwtCn++;
                                        }
                                    });
                                }
                                this.report.forEach((element) => {
                                    element['misscallarr'] = [];
                                    this.allmisscall.forEach((element2) => {
                                        var a = element2['datetime'].split(' ');
                                        var tdate = a[0];
                                        var time = a[1];
                                        element2['call_time'] = moment(time, 'HHmmss').format('hh:mm:ss A');
                                        element2['call_date'] = tdate;
                                        if (element.src == element2.src) {
                                            element['misscallarr'].push(element2);
                                        }
                                    });
                                });
                                let inData = {
                                    customers: this.callnum,
                                };
                                this.ystarcallid = [];
                                this.userServices.getInboundCalldetails(inData).subscribe((rdata: any) => {
                                    if (rdata.ret_data == 'success') {
                                        this.report.forEach((element) => {
                                            element['callarr'] = [];
                                            rdata.customer.forEach((element2: any) => {
                                                element2.forEach((element3: any) => {
                                                    var a = element3['datetime'].split(' ');
                                                    var tdate = a[0];
                                                    var time = a[1];
                                                    element3['call_time'] = moment(time, 'HHmmss').format('hh:mm:ss A');
                                                    element3['call_date'] = tdate;
                                                    var uu = this.userlist.filter((au) => au.ext_number == element3.src.substring(0, 3));

                                                    if (uu.length > 0) {
                                                        element3.call_back_user = uu[0].us_firstname;
                                                    } else {
                                                        element3.call_back_user = 'Unknown';
                                                    }
                                                    if ((element.src == element3.src || element.src == element3.dst) && element.datetime < element3.datetime) {
                                                        if (element3.calltype == 'Outbound') {
                                                            element3.username = 'Callback';
                                                        } else {
                                                            element3.username = 'Inbound';
                                                        }

                                                        if (
                                                            (element3.calltype === 'Inbound' && element3.disposition === 'ANSWERED') ||
                                                            (element3.calltype === 'Outbound' && element3.disposition === 'ANSWERED') ||
                                                            (element3.calltype === 'Outbound' && element3.disposition === 'NO ANSWER')
                                                        ) {
                                                            element['callarr'].push(element3);
                                                            this.ystarcallid.push(element3.uniqueid);
                                                        }
                                                    }
                                                });
                                            });
                                        });
                                        console.log('report>>>>>>>>>>>>>>>>>>>>>', this.report);
                                    } else {
                                        //console.log('report>>>>>>>>>>>>>>>>>>>>>', this.report);
                                        this.load_flag = false;
                                    }
                                    this.getCustomerinfo();
                                });

                                //  this.load_flag = false;
                            }
                        });
                    } else {
                        this.load_flag = false;
                    }
                } else {
                    this.load_flag = false;
                    // this.coloredToast("danger", "Yeastar Token Expired..Login Again");
                    this.coloredToast('danger', 'Some error occurred please try again');
                }
            });
        });
    }

    getCustomerinfo() {
        this.load_flag = true;
        let ne = 0;
        let ex = 0;
        let that = this;
        this.ncbCn = 0;
        this.nwtCnCb = 0;
        this.nwtCnCbe = 0;
        this.nwtCnCbn = 0;

        this.nwtCnAp = 0;
        this.wtCnAp = 0;
        this.wtCnCbe = 0;
        this.wtCnCbn = 0;

        this.ncbCn = 0;
        this.cbCn = 0;
        let data = {
            num_list: this.numarray,
            startdate: this.start_date,
            enddate: this.end_date,
            ycallid: this.ystarcallid,
        };

        if (this.numarray.length > 0) {
            this.userServices.getMisscallDetails(data).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    this.report.map(function (x) {
                        var resu = that.temp.filter((a1) => a1.dst == x.src && a1.datetime > x.datetime);
                        // && a1.datetime.substring(0, 10) == x.call_date

                        if (resu.length > 0) {
                            that.cbCn++;
                            x.call_back = 'success';
                            var a = resu[0].datetime.split(' ');
                            var date = a[0];
                            var time = a[1];
                            var hrr;

                            x.call_to_time = moment(time, 'HHmmss').format('hh:mm:ss A');
                            x.call_to_date = date;
                            var ms = moment(resu[0].datetime, 'YYYY-MM-DD HH:mm:ss').diff(moment(x.datetime, 'YYYY-MM-DD HH:mm:ss'));
                            var d = moment.duration(ms);
                            var hr = Math.floor(d.asHours());
                            if (hr < 10) hrr = '0' + hr;

                            var s = hrr + moment.utc(ms).format(':mm:ss');
                            var ss = moment.utc(ms).format('mm:ss');
                            // x.time_diff = s;

                            if (that.holi_dates.includes(date)) {
                                if (s > that.wbTime) {
                                    if (hr === 0) x.time_diff = ss + ' minutes';
                                    else x.time_diff = hrr + ' hours';
                                } else {
                                    x.time_diff = 0;
                                }
                            } else {
                                if (s > that.bTime) {
                                    if (hr === 0) x.time_diff = ss + ' minutes';
                                    else x.time_diff = hrr + ' hours';
                                } else {
                                    x.time_diff = 0;
                                }
                            }

                            var uu = that.userlist.filter((au) => au.ext_number == resu[0].src.substring(0, 3));

                            if (uu.length > 0) {
                                x.call_back_user = uu[0].us_firstname;
                            } else {
                                x.call_back_user = 'Unknown';
                            }
                        } else {
                            that.ncbCn++;
                            x.call_back = 'fail';
                            x.time_diff = ':00:00';
                            x.call_back_user = 'NIL';
                        }

                        // var result = rdata.customers.filter(a1 => a1.phon_uniq == ((x.call_from).substring((x.call_from).length - 7)));
                        // if (result.length > 0) {
                        //   x.customer = result[0].customer_name;
                        //   x.customertype = result[0].type;
                        //   ex++;
                        // } else {
                        //   x.customer = "new";
                        //   ne++;
                        // }

                        var result = rdata.customers.filter(
                            (a1: any) => a1.phon_uniq == x.src.substring(x.src.length - 7) || a1.mob_uniq == x.src.substring(x.src.length - 7)
                        );
                        if (result.length > 0) {
                            x.customer = result[0].customer_name;
                            x.customertype = result[0].type;
                            ex++;
                        } else {
                            x.customer = 'new';
                            ne++;
                        }
                        var result = rdata.note.filter((a1: any) => a1.phon_uniq == x.src.substring(x.src.length - 7) && a1.miss_call_time == x.datetime);
                        if (result.length > 0) {
                            x.note = result[0].cagn_note;
                            x.status = result[0].cagn_status;
                            x.app_date = result[0].cagn_appoint_date;
                        } else {
                            //x.note="fail";
                        }
                        return x;
                    });

                    this.necall = ne;
                    this.excall = ex;
                    this.report_temp = this.report;
                    // this.load_flag = false;
                    this.report.forEach((element) => {

                        if(element.wt == "true"){
                        
                            if(element.customer =='new'){
                               
                               this.wtCnn++;

                               if (
                                (element.call_back == 'success') ||
                                (
                                    element.call_back == 'fail' &&
                                    element.callarr &&
                                    element.callarr.length > 0 &&
                                    element.callarr[element.callarr.length - 1].username == 'Inbound' &&
                                    element.callarr[element.callarr.length - 1].disposition == 'ANSWERED'
                                )
                            ) 
                            {this.wtCnCbn++;}

                            else{this.wtCnApn++;}
                               
                            
                            
                            }else{
                                this.wtCne++;
                                if ((element.call_back == 'success') ||
                                    (element.call_back == 'fail' &&
                                        element.callarr &&
                                        element.callarr.length > 0 &&
                                        element.callarr[element.callarr.length - 1].username === 'Inbound' &&
                                        element.callarr[element.callarr.length - 1].disposition === 'ANSWERED'
                                    )
                                ) {this.wtCnCbe++;}
                                else{this.wtCnApe++;}

                                  
                            }
                        } else {
                            if(element.customer =='new'){
                                this.nwtCnn++;
                                if (
                                    (element.call_back == 'success') ||
                                    (
                                        element.call_back == 'fail' &&
                                        element.callarr &&
                                        element.callarr.length > 0 &&
                                        element.callarr[element.callarr.length - 1].username === 'Inbound' &&
                                        element.callarr[element.callarr.length - 1].disposition === 'ANSWERED'
                                    )
                                ) {
                                    this.nwtCnCbn++;
                                }else{
                                    this.nwtCnApn++;
                                }
                             
                            }else{
                                this.nwtCne++;

                                if (
                                    (element.call_back === 'success') ||
                                    (
                                        element.call_back === 'fail' &&
                                        element.callarr &&
                                        element.callarr.length > 0 &&
                                        element.callarr[element.callarr.length - 1].username === 'Inbound' &&
                                        element.callarr[element.callarr.length - 1].disposition === 'ANSWERED'
                                    )
                                ) {
                                    this.nwtCnCbe++
                                } else {
                                    this.nwtCnApe++
                                }
                              
                            }
                        }




                        if (element.callarr && element.callarr.length > 0) {
                            element.callarr.forEach((element3: any) => {
                                rdata.outcallnote.forEach((element4: any) => {
                                    if (element3.uniqueid == element4.ystar_call_id) {
                                        element3['note'] = element4.lcl_purpose_note;
                                        element3['purpose'] = element4.call_purpose;
                                    }
                                });
                            });
                        }
                    });
                    this.load_flag = false;
                    //  console.log("??????????????????????", this.report);
                } else {
                    this.coloredToast('danger', 'Cant fetch customer data');
                    this.load_flag = false;
                }
            });
        } else {
            this.load_flag = false;
        }
        this.necall = 0;
        this.excall = 0;
    }

    cardFilter(type: any) {
        this.selectedCard = type;
        this.report = this.report_temp;

        if (type == 'WTMISS') {
            this.report = this.report.filter(({ wt }) => wt == 'true');
        } else if (type == 'NWTMISS') {
            this.report = this.report.filter(({ wt }) => wt != 'true');
        }
        else if(type =='WTEXTCUSMISS'){
            this.report = this.report.filter(({ wt, customer }) => wt == 'true' && customer != 'new');
        
        } else if(type =='WTNEWCUSMISS'){
            this.report = this.report.filter(({ wt, customer }) => wt == 'true' && customer == 'new');
      
        } else if(type == 'NWTEXTCUSMISS'){
            this.report = this.report.filter(({ wt, customer }) => wt != 'true' && customer != 'new');
        }
        else if(type =='NWTNEWCUSMISS'){
            this.report = this.report.filter(({ wt, customer }) => wt != 'true' && customer == 'new');
      
        } 
        
        else if(type == 'WTEXTCUSCBMISS') {
            this.report = this.report.filter(({ wt, customer, call_back,callarr }) => wt == 'true' && customer != 'new' && (call_back == 'success' || (call_back == 'fail' && callarr.length > 0 && callarr[callarr.length - 1].username === 'Inbound' &&callarr[callarr.length - 1].disposition === 'ANSWERED' )));

        } else if(type == 'WTEXTCUSAPMISS'){
                       
                this.report = this.report.filter(({ wt, customer, call_back, callarr }) => 
                    wt == 'true' && 
                    customer != 'new' && 
                    call_back == 'fail' && 
                    (callarr.length == 0  || (callarr.length > 0 && callarr[callarr.length - 1].disposition == 'NO ANSWER')));
               
                
            
        } else if(type =='WTNEWCUSCBMISS'){
            this.report = this.report.filter(({ wt, customer, call_back,callarr }) => wt == 'true' && customer == 'new' && (call_back == 'success' || (call_back == 'fail' && callarr.length > 0 && callarr[callarr.length - 1].username === 'Inbound' &&callarr[callarr.length - 1].disposition === 'ANSWERED' )));
          
        }
        else if(type =='WTNEWCUSAPMISS'){
            this.report = this.report.filter(({ wt, customer, call_back, callarr}) => wt == 'true' && customer == 'new' && call_back != 'success' &&  (callarr.length == 0  || (callarr.length > 0 && callarr[callarr.length - 1].disposition == 'NO ANSWER')));
        } 
        else if(type =='NWTEXTCUSCBMISS'){
            this.report = this.report.filter(({ wt, customer, call_back, callarr }) => wt != 'true' && customer != 'new' && (call_back == 'success' || (call_back == 'fail' && callarr.length > 0 && callarr[callarr.length - 1].username === 'Inbound' &&callarr[callarr.length - 1].disposition === 'ANSWERED' )));
        }else if(type =='NWTEXTCUSAPMISS'){
            this.report = this.report.filter(({ wt, customer, call_back,callarr }) => wt != 'true' && customer != 'new' && call_back != 'success' && (callarr.length == 0  || (callarr.length > 0 && callarr[callarr.length - 1].disposition == 'NO ANSWER')));
        }else if(type =='NWTNEWCUSCBMISS'){
            this.report = this.report.filter(({ wt, customer, call_back ,callarr}) => wt != 'true' && customer == 'new' && call_back == 'success' && (call_back == 'success' || (call_back == 'fail' && callarr.length > 0 && callarr[callarr.length - 1].username === 'Inbound' &&callarr[callarr.length - 1].disposition === 'ANSWERED' )));
        }       
        else if(type =='NWTNEWCUSAPMISS'){
            this.report = this.report.filter(({ wt, customer,call_back, callarr }) => wt != 'true' && customer == 'new' && call_back != 'success' &&  (callarr.length == 0  || (callarr.length > 0 && callarr[callarr.length - 1].disposition == 'NO ANSWER')));
        }
        
        
    }

    getUniqueListBy(arr: any, key: any) {
        const uniqueMap = new Map();
        for (let i = 0; i < arr.length; i++) {
            const item = arr[i];
            if (!uniqueMap.has(item[key])) {
                uniqueMap.set(item[key], item);
            }
        }
        return [...uniqueMap.values()];
    }

    ViewDetails(phone: any) {
        this.phone = phone;
        this.customerdata = [];
        this.custvehicle = [];
        this.custjobcard = [];
        this.custtotalLead = [];
        this.custpendLead = [];
        this.custpenLeadId = [];
        this.custleads = [];
        this.custleadLog = [];
        this.userServices.getcustomerData({ phone: phone }).subscribe((rdata: any) => {
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
                //this.coloredToast('danger', 'No data for this Number');
            }
            this.getInbound();
            this.custDetailModal.open();
        });
    }

    getInbound() {
        this.log = [];
        let today = moment().format('DD/MM/YYYY');
        let yesterday = moment().subtract(1, 'days').startOf('day').format('DD/MM/YYYY').toString();

        let data = {
            phoneNumber: this.phone,
        };
        this.userServices.getLatestCallReportByNumber(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                if (rdata.call_data.length > 0) {
                    let inbound = rdata.call_data.filter((item: any) => item.dst != '6300');

                    let missed = rdata.call_data.filter((item: any) => item.disposition == 'NO ANSWER');

                    let inbound_temp = inbound.sort(function (a: any, b: any): any {
                        return b.timestamp - a.timestamp;
                    });

                    let miss_temp = missed.sort(function (a: any, b: any): any {
                        return b.timestamp - a.timestamp;
                    });

                    miss_temp = miss_temp.slice(0, 6);
                    miss_temp.forEach((element: any) => {
                        if (element['disposition'] == 'NO ANSWER') {
                            this.callidarray.push(0);
                        }
                        var a = element['datetime'].split(' ');
                        var date = a[0];
                        var time = a[1];
                        if (date == today) element['call_date'] = 'Today';
                        else if (date == yesterday) element['call_date'] = 'Yesterday';
                        else element['call_date'] = date;

                        element['call_time'] = moment(time, 'HHmmss').format('hh:mm:ss A');
                        this.log.push(element);
                    });

                    inbound_temp = inbound_temp.slice(0, 6);
                    inbound_temp.forEach((element: any) => {
                        if (element['disposition'] == 'ANSWERED') {
                            let arr = element['uniqueid'];
                            this.callidarray.push(arr);
                        } else {
                            this.callidarray.push(0);
                        }
                        var a = element['datetime'].split(' ');
                        var date = a[0];
                        var time = a[1];
                        if (date == today) element['call_date'] = 'Today';
                        else if (date == yesterday) element['call_date'] = 'Yesterday';
                        else element['call_date'] = date;

                        if (element.calltype == 'Inbound') {
                            element['call_to'] = element.dst;
                        } else {
                            element['call_to'] = element.src;
                        }

                        element['call_time'] = moment(time, 'HHmmss').format('hh:mm:ss A');
                        this.log.push(element);
                    });
                    this.getLog();
                } else {
                    //  this.load_flag = false;
                }
            }
        });
    }

    getLog() {
        //this.load_flag = true;
        this.log = this.log.sort(function (a, b): any {
            return b.timestamp - a.timestamp;
        });
        let dataa = {
            // call_to: this.us_ext_no,
            call_id: this.callidarray,
            //ext_name: atob(atob(localStorage.getItem("us_ext_name"))),
        };

        if (this.callidarray.length > 0) {
            this.userServices.getLog(dataa).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    // let phone =
                    //   atob(atob(localStorage.getItem("us_ext_name"))) +
                    //   "<" +
                    //   atob(atob(localStorage.getItem("us_ext_no"))) +
                    //   ">";
                    this.log.map(function (x) {
                        let s = x.uniqueid;
                        let ext = x.dst;
                        var result = rdata.leadlog.filter((a1: any) => a1.ystar_call_id == s && a1.lcl_call_to == ext);
                        if (result.length > 0) {
                            x.leadlog = result[0].lcl_purpose_note;
                            x.purpose = result[0].call_purpose;
                        } else {
                            x.leadlog = 'fail';
                            x.purpose = 'fail';
                        }

                        return x;
                    });
                    // this.load_flag = false;
                } else {
                    // this.load_flag = false;
                }
            });
        }

        // console.log("LOG___3________", this.log);
    }

    custDetailModalClose() {
        this.custDetailModal.close();
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
