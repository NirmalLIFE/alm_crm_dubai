import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import { colDef } from '@bhplugin/ng-datatable';

@Component({
    selector: 'app-appointment-overdues',
    templateUrl: './appointment-overdues.component.html',
    styleUrls: ['./appointment-overdues.component.css'],
})
export class AppointmentOverduesComponent implements OnInit {
    public search = '';
    public load_flag: boolean = true;
    public user_role: any = atob(atob(localStorage.getItem('us_role_id') || '{}'));
    public dateFrom: any = null;
    public dateTo: any = null;
    public today: any = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
    public userList: any[] = [];
    public allOverdueAppoints: any = [];
    public calllogphn: any = [];

    @ViewChild('calllogmodal') calllogmodal: any;

    cols = [
        { field: 'apptm_code', title: 'Code', isUnique: true, hide: false },
        { field: 'call_from', title: 'Number', hide: false },
        { field: 'cust_name', title: 'Customer', hide: false },
        { field: 'lead_source', title: 'Source' },
        { field: 'apptm_group_l', title: 'Type' },
        { field: 'appt_date', title: 'Date', hide: false },
        { field: 'appoint_time', title: 'Time', hide: false },
        { field: 'reg_no', title: 'Reg.No', hide: false },
        { field: 'us_firstname', title: 'Assigned', hide: false },
        { field: 'apptm_created', title: 'Created', hide: false },
        { field: 'apptm_transport_service_l', title: 'Pick&Drop', hide: false },
        { field: 'appt_count', title: 'Attempt No', hide: true },
        { field: 'apptm_status_l', title: 'Status', hide: false },
        { field: 'action', title: 'Action', hide: false },
    ];
    constructor(public router: Router, private userServices: StaffPostAuthService, public datePipe: DatePipe) {
        this.userServices.userList().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.userList = rData.userList;
            }
        });
    }
    ngOnInit() {
        this.getAppointmentList();
    }

    getAppointmentList() {
        this.allOverdueAppoints = [];
        let pendata: any;
        let penstatus = [1, 2, 3];
        if (this.user_role == '11') {
            pendata = {
                status: penstatus,
                dateFrom: this.dateFrom,
                dateTo: this.dateTo,
                us_id: atob(atob(localStorage.getItem('us_id') || '')),
                type: 1,
            };
        } else {
            pendata = {
                status: penstatus,
                dateFrom: this.dateFrom,
                dateTo: this.dateTo,
                type: 0,
            };
        }
        this.userServices.getAppointmentList(pendata).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.allOverdueAppoints = rData.appointments.filter(
                    (item: any) => (item.apptm_status == '1' || item.apptm_status == '2' || item.apptm_status == '3') && item.appt_date < this.today
                );
                this.allOverdueAppoints.forEach((element: any) => {
                    element['appoint_time'] = moment(element['appt_time'], 'HHmmss').format('hh:mm A');
                    if (element.apptm_transport_service == '1') {
                        element['apptm_transport_service_l'] = 'Free Pick & Drop';
                    } else if (element.apptm_transport_service == '2') {
                        element['apptm_transport_service_l'] = 'Free Pick';
                    } else if (element.apptm_transport_service == '3') {
                        element['apptm_transport_service_l'] = 'Free Drop';
                    } else if (element.apptm_transport_service == '4') {
                        element['apptm_transport_service_l'] = 'Not Required';
                    } else if (element.apptm_transport_service == '5') {
                        element['apptm_transport_service_l'] = 'Paid Pick & Drop';
                    } else if (element.apptm_transport_service == '6') {
                        element['apptm_transport_service_l'] = 'Paid Pick Up';
                    } else if (element.apptm_transport_service == '7') {
                        element['apptm_transport_service_l'] = 'Paid Drop Off';
                    } else if (element.apptm_transport_service == '8') {
                        element['apptm_transport_service_l'] = 'Drop Off (Self)';
                    }

                    if (element.apptm_pickup_mode == '1') {
                        element['pickup_mode'] = 'Driver PickUp';
                    } else if (element.apptm_pickup_mode == '2') {
                        element['pickup_mode'] = 'Recovery PickUp';
                    } else {
                        element['pickup_mode'] = 'Nil';
                    }
                    
                    if (element.apptm_status == '1') {
                        element['apptm_status_l'] = 'Scheduled';
                    } else if (element.apptm_status == '2') {
                        element['apptm_status_l'] = 'Confirmed';
                    } else if (element.apptm_status == '3') {
                        element['apptm_status_l'] = 'Rescheduled';
                    }
                    if (element.apptm_type == '1') {
                        element['apptm_type_l'] = 'Inbound';
                    } else if (element.apptm_type == '2') {
                        element['apptm_type_l'] = 'Lost';
                    } else if (element.apptm_type == '3') {
                        element['apptm_type_l'] = 'Revisit';
                    } else if (element.apptm_type == '4') {
                        element['apptm_type_l'] = 'Direct';
                    } else if (element.apptm_type == '5') {
                        element['apptm_type_l'] = 'Campaign Enquiry';
                    } else if (element.apptm_type == '6') {
                        element['apptm_type_l'] = 'Parts Enquiry';
                    } else element['apptm_type_l'] = 'NIL';

                    if (element.apptm_group == '2') {
                        element['apptm_group_l'] = 'Campaign';
                    } else if (element.apptm_group == '0' || element.apptm_group == '1') {
                        element['apptm_group_l'] = 'Normal';
                    }
                    if (element.customer_name != '' && element.customer_name != null) {
                        element['cust_name'] = element.customer_name;
                    } else if (element.name != '' && element.name != null) {
                        element['cust_name'] = element.name;
                    }
                    if (element.cphone != '' && element.cphone != null) {
                        element['call_from'] = element.cphone;
                    } else if (element.lphone != '' && element.lphone != null) {
                        element['call_from'] = element.lphone;
                    }
                    if (element.register_number != '' && element.register_number != null) {
                        element['reg_no'] = element.register_number;
                    } else if (element.psfm_reg_no != '' && element.psfm_reg_no != null) {
                        element['reg_no'] = element.psfm_reg_no;
                    } else {
                        element['reg_no'] = '';
                    }
                    this.userList.forEach((element2) => {
                        if (element2.us_id == element.appt_created_by) {
                            element.apptm_created = element2.us_firstname;
                        }
                    });
                });
                this.load_flag = false;
            } else {
                this.load_flag = false;
            }
        });
    }

    viewAppointmentDetails(item: any) {
        this.router.navigateByUrl('leads/appointment/appointment-details/' + btoa(item.apptm_id));
    }

    updateColumn(col: colDef) {
        col.hide = !col.hide;
        this.cols = [...this.cols]; // Create a new reference of the array
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
