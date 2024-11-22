import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-dissatisfied-customers-list',
    templateUrl: './dissatisfied-customers-list.component.html',
    styleUrls: ['./dissatisfied-customers-list.component.css'],
})
export class DissatisfiedCustomersListComponent implements OnInit {
    public search = '';
    public load_flag: boolean = true;
    public dis_cust: any = [];
    public allDissatisfied: any = [];
    status: any = [];
    psfReason: any = [];
    userslist: any = [];
    saList: any = [];
    counts: any = [];
    public calllogphn: any = [];
    public user_role: any = atob(atob(localStorage.getItem('us_role_id') || '{}'));
    public dateFrom: any = this.datepipe.transform(moment(new Date()).startOf('month').toDate(), 'yyyy-MM-dd') || '';
    public dateTo: any = this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '';
    public selectedStatus: any = '0';

    @ViewChild('calllogmodal') calllogmodal: any;

    cols = [
        { field: 'call_from', title: 'Number', hide: false },
        { field: 'cust_name', title: 'Customer', hide: false },
        { field: 'c_date', title: 'Date' },
        { field: 'type', title: 'Dissatisfied Type', hide: false },
        { field: 'status', title: 'Status', hide: false },
        { field: 'assign', title: 'Assigned', hide: false },
        { field: 'response', title: 'Response', hide: false },
        { field: 'action_taken', title: 'Action Taken', hide: false },
        { field: 'ldl_note', title: 'Remarks', hide: false },
        { field: 'action', title: 'Action', hide: false },
    ];

    constructor(public router: Router, private userServices: StaffPostAuthService, public datepipe: DatePipe) {
        this.userServices.get_PSFreasonMaster({ type_id: 5 }).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.psfReason = rdata.reason_master;
            }
        });
        this.userServices.userList().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.userslist = rdata.userList;
                this.saList = rdata.userList.filter((item: any) => item.us_role_id == '11');
            }
        });
    }
    ngOnInit() {
        this.dissatisfiedcustomer();
    }

    dissatisfiedcustomer() {
        this.dis_cust = [];
        // if (this.user_role == '1' || this.user_role == '13' || this.user_role == '10') {
        //     this.status = [1, 2, 3, 4, 5];
        // } else {
        //     this.status = [1, 2, 3];
        // }

        if (this.selectedStatus == '0') {
            this.status = [1, 2, 3, 4, 5];
        } else {
            this.status = [this.selectedStatus];
        }
        let data = {
            status: this.status,
            dateFrom: this.dateFrom,
            dateTo: this.dateTo,
        };

        this.userServices.getdisatisfiedcust(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.dis_cust = rdata.cust;
                this.allDissatisfied = rdata.cust;
                this.counts.opened = this.dis_cust.filter((item: any) => item.ldm_status == '1').length;
                this.counts.Call_Transfered = this.dis_cust.filter((item: any) => item.ldm_status == '2').length;
                this.counts.Appointment = this.dis_cust.filter((item: any) => item.ldm_status == '3').length;
                this.counts.resolved = this.dis_cust.filter((item: any) => item.ldm_status == '4').length;
                this.counts.closed = this.dis_cust.filter((item: any) => item.ldm_status == '5').length;
                this.dis_cust.forEach((element: any) => {
                    var a = element.ldm_created_on.split(' ');
                    var date = a[0];
                    var time = a[1];
                    element['c_date'] = date;
                    element['c_time'] = moment(time, 'HHmmss').format('hh:mm:ss A');
                    if (element.customer_name != '' && element.customer_name != null) {
                        element['cust_name'] = element.customer_name;
                    } else {
                        element['cust_name'] = element.lname;
                    }
                    if (element.lphone != '' && element.lphone != null) {
                        element['phone'] = element.lphone;
                    } else {
                        element['phone'] = element.cphone;
                    }
                    if (element.lead_code != '' && element.lead_code != null) {
                        element['Distype'] = 'Inbound Call Dissatisfied';
                    } else {
                        element['Distype'] = 'PSF Dissatisfied';
                    }
                    if (element.ldl_action == 1) {
                        element['action_taken'] = 'Transfer the call';
                    } else if (element.ldl_action == 2) {
                        element['action_taken'] = 'Educated & Closed';
                    } else if (element.ldl_action == 3) {
                        element['action_taken'] = 'Closed with approval';
                    } else if (element.ldl_action == 4) {
                        element['action_taken'] = 'Revisit Requested';
                    } else if (element.ldl_action == 5) {
                        element['action_taken'] = 'Apology over phone/mail';
                    }

                    if (element.ldm_status == 1) {
                        element['status'] = 'Opened';
                    } else if (element.ldm_status == 2) {
                        element['status'] = 'Call Transfered';
                    } else if (element.ldm_status == 3) {
                        element['status'] = 'Appointment Scheduled';
                    } else if (element.ldm_status == 4) {
                        element['status'] = 'Resolved or completed';
                    } else if (element.ldm_status == 5) {
                        element['status'] = 'Closed';
                    }

                    this.psfReason.forEach((element2: any) => {
                        this.userslist.forEach((element3: any) => {
                            if (element.ldl_response == element2.psfr_id) {
                                element['response'] = element2.psfr_name;
                            }
                            if (element.ldm_assign == element3.us_id) {
                                element['assign'] = element3.us_firstname;
                            }
                        });
                    });
                });
                this.load_flag = false;
            } else {
                this.counts.opened = 0;
                this.counts.Call_Transfered = 0;
                this.counts.Appointment = 0;
                this.counts.resolved = 0;
                this.counts.closed = 0;
                this.load_flag = false;
            }
        });
    }

    filterDissatisfied(value: any) {
        if (value == 0) {
            this.dis_cust = this.allDissatisfied;
        } else {
            this.dis_cust = this.allDissatisfied.filter((item: any) => item.ldm_status == value);
        }
    }

    saveData(id: any) {
        this.router.navigateByUrl('dissatisfied/dissatisfied-details/' + btoa(id));
    }

    closeDissatisfied(id: any) {
        Swal.fire({
            //icon: "error",
            input: 'textarea',
            inputLabel: 'Note',
            inputPlaceholder: 'Note...',
            inputAttributes: {
                autocapitalize: 'off',
            },
            showCancelButton: true,
            confirmButtonText: 'Close Dissatisfied',
            showLoaderOnConfirm: false,
            reverseButtons: true,
            customClass: {
                confirmButton: 'confirm-button',
                cancelButton: 'btn btn-danger',
            },
            allowOutsideClick: () => !Swal.isLoading(),
        }).then((result) => {
            if (result.isConfirmed) {
                let data = {
                    id: id,
                    note: result.value,
                };
                this.userServices.closeDissatisfiedcust(data).subscribe((rdata: any) => {
                    if (rdata.ret_data === 'success') {
                        this.coloredToast('success', 'Dissatisfied Closed successfully');
                        this.dissatisfiedcustomer();
                    } else {
                        this.coloredToast('danger', "Can't Close Dissatisfied");
                    }
                });
            }
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
