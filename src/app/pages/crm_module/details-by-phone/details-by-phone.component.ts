import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-details-by-phone',
    templateUrl: './details-by-phone.component.html',
    styleUrls: ['./details-by-phone.component.css'],
})
export class DetailsByPhoneComponent implements OnInit {
    phone: any;
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

    incoming: any[] = [];
    outgoing: any[] = [];
    log: any[] = [];
    callidarray: any[] = [];
    public load_flag: boolean = true;

    @ViewChild('custDetailModal') custDetailModal: any;

    constructor(
        private userServices: StaffPostAuthService,
        public datepipe: DatePipe,
        public storeData: Store<any>,
        public fb: FormBuilder
    ) {}

    ngOnInit(): void {}

    ViewDetails(phone: any) {
        this.customerdata = [];
        this.custvehicle = [];
        this.custjobcard = [];
        this.custtotalLead = [];
        this.custpendLead = [];
        this.custpenLeadId = [];
        this.custleads = [];
        this.custleadLog = [];
        this.load_flag = true;
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

                if (rdata.customer['customer_name'] != null && rdata.customer['customer_name'] != '' ) {
                    this.custDetailModal.open();
                    this.getInbound();
                } else {
                    this.coloredToast('danger', 'No data for this Number');
                    this.load_flag = false;
                }
                //   this.isnNew = true;
                //   this.loading = false;
            } else {
                this.coloredToast('danger', 'No data for this Number');
            }
        });
    }

    getInbound() {
        this.log = [];
        this.load_flag = true;
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
                    this.load_flag = false;
                }
            }else{
                this.load_flag = false;
            }
        });
    }

    getLog() {
        this.load_flag = true;
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
                    this.load_flag = false;
                } else {
                    this.load_flag = false;
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
