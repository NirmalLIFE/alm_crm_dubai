import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-assigned-lost-update',
    templateUrl: './assigned-lost-update.component.html',
    styleUrls: ['./assigned-lost-update.component.css'],
})
export class AssignedLostUpdateComponent implements OnInit {
    // customerdata: any = [];
    vehicle: any[] = [];
    jobcard: any[] = [];
    callidarray: any[] = [];
    log: any[] = [];
    latest_jobcard: any = [];
    lcst_id: any;
    phone: any;
    cust_code: any;
    inv_date: any;
    lostCustDetails: any;
    userList: any[] = [];
    basic: FlatpickrOptions;
    public lostflag: boolean = true;
    reg_no: any = [];

    customerdata: any = {
        apptm_group: '',
        status: null,
        dateField: null,
        appTime: null,
        assigned: null,
        transportation_service: null,
        call_remark: '',
        reg_no: '',
    };

    button_act_state=0;

    @Input() assignedLostData: any = [];
    @Output() modalEvent = new EventEmitter<boolean>();

    constructor(private userServices: StaffPostAuthService, public datepipe: DatePipe, private router: Router, private activeRouter: ActivatedRoute) {
        this.userServices.userList().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.userList = rData.userList;
            }
        });
        this.basic = {
            dateFormat: 'Y-m-d',
            minDate: new Date(),
        };

        this.lostCustDetails = {
            status: '',
        };
    }

    ngOnInit(): void {

        this.lcst_id = this.assignedLostData.id;
        this.phone = this.assignedLostData.phone;
        this.cust_code = this.assignedLostData.cst_id;
        this.inv_date = this.assignedLostData.inv_date;
        this.reg_no = this.assignedLostData.reg_no;
        let _that = this;
        let data = {
            phone: this.phone,
        };
        this.userServices.CallInfo(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.customerdata = rdata.customer;
                this.customerdata.apptm_group = '1';
                this.customerdata.status = null;
                this.customerdata.dateField = null;
                this.customerdata.appTime = null;
                this.customerdata.assigned = null;
                this.customerdata.transportation_service = null;
                this.customerdata.call_remark = '';
                this.customerdata.reg_no = this.reg_no;

                this.vehicle = rdata.vehicle;
                this.jobcard = rdata.jobcard; //slice(0, 1)
                this.latest_jobcard = rdata.JCS;

                // _that.isnNew = true;
                // _that.loading = false;
            } else {
                this.customerdata.apptm_group = '1';
                // this.isnNew = false;
                // this.loading = false;
            }
            this.getInbound();
        });
    }

    getInbound() {
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
                }
            }
        });
    }

    getLog() {
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
                }
            });
        }

        // console.log("LOG___________", this.log);
    }

    preventDefault() {
        return false;
    }

    saveLostCustDetails(data: any) {
        this.button_act_state=1;
        this.lostflag = true;
        const selectedDate: Date = new Date(data['dateField']);
        const currentDate: Date = new Date();
        selectedDate.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);
        if (data['call_remark'] != '') {
            if (data['dateField'] != '' || data['dateField'] == null) {
                let datevalD = new Date(data['dateField']);
                data['dateField'] = datevalD.getFullYear() + '-' + ('0' + (datevalD.getMonth() + 1)).slice(-2) + '-' + ('0' + datevalD.getDate()).slice(-2);
            } else {
                // this.lostflag = false;
                // this.coloredToast('danger', 'Select An Appointment Date');
            }
        } else {
            // this.lostflag = false;
            // this.coloredToast('danger', 'Please Enter Customer Remarks');
        }

        if (data['status'] == null || data['status'] == '') {
            this.lostflag = false;
            this.coloredToast('danger', 'Please select Response Type');
        } else if (data['call_remark'] == null || data['call_remark'] == '') {
            this.lostflag = false;
            this.button_act_state=0;
            this.coloredToast('danger', 'Please Enter Customer Remarks');
        } else if (data['status'] == 'Appointment') {
            data['customer_cat_type'] = '2';
            if (data['dateField'] == null || data['dateField'] == '') {
                this.lostflag = false;
                this.button_act_state=0;
                this.coloredToast('danger', 'Select An Appointment Date');
            } else if (data['apptm_group'] == null || data['apptm_group'] == '') {
                this.lostflag = false;
                this.button_act_state=0;
                this.coloredToast('danger', 'Please Select Appointment Type');
            } else if (data['appTime'] == null || data['appTime'] == '') {
                this.lostflag = false;
                this.button_act_state=0;
                this.coloredToast('danger', 'Please Select An Appointment Time');
            } else if (data['assigned'] == null || data['assigned'] == '') {
                this.lostflag = false;
                this.button_act_state=0;
                this.coloredToast('danger', 'Please Select An Assignee');
            } else if (data['transportation_service'] == null || data['transportation_service'] == '') {
                this.lostflag = false;
                this.button_act_state=0;
                this.coloredToast('danger', 'Please Select Pickup & Drop Details');
            } else if (data['dateField'] != null || data['dateField'] != '') {
                if (selectedDate >= currentDate) {
                    //console.log('Selected date is today or greater than today.currentDate,selectedDate', currentDate, selectedDate);
                } else {
                    this.lostflag = false;
                    this.button_act_state=0;
                    this.coloredToast('danger', 'Please Select An Proper Appointment Date');
                }
            }
        }
        if (this.lostflag) {
            data['lc_id'] = this.lcst_id;
            data['phone'] = this.phone;
            this.userServices.updateLostCustData(data).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    this.coloredToast('success', 'Note Added Successfully');
                    // this.ref.close(data);
                    this.modalEvent.emit();
                    this.button_act_state=0;
                } else if (rdata.ret_data == 'fail') {
                    this.coloredToast('danger', 'Some error occurred, please try again later');
                }
            });
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
}
