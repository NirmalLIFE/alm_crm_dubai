import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';
import { trigger, transition, style, animate } from '@angular/animations';
import { colDef } from '@bhplugin/ng-datatable';
import { filter } from 'rxjs';

@Component({
    selector: 'app-appointment-list',
    templateUrl: './appointment-list.component.html',
    styleUrls: ['./appointment-list.component.css'],
    animations: [
        trigger('toggleAnimation', [
            transition(':enter', [style({ opacity: 0, transform: 'scale(0.95)' }), animate('100ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))]),
            transition(':leave', [animate('75ms', style({ opacity: 0, transform: 'scale(0.95)' }))]),
        ]),
    ],
})
export class AppointmentListComponent implements OnInit {
    public search = '';
    public selectTab = 'all';
    public load_flag: boolean = true;
    public appointmentList: any = [];
    public allAppointment: any = [];
    public calllogphn: any = [];
    public userList: any[] = [];
    public overdueAppoints: any[] = [];
    public user_role: any = atob(atob(localStorage.getItem('us_role_id') || '{}'));
    // public dateFrom: any = this.datePipe.transform(moment(new Date()).startOf('month').toDate(), 'yyyy-MM-dd') || '';
    public dateFrom: any = this.datePipe.transform(moment().toDate(), 'yyyy-MM-dd') || '';
    public dateTo: any = null;
    public today: any = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
    public selectedStatus: any = '0';
    public appointmentCounts: any = {
        total_appts: 0,
        scheduled_appts: 0,
        confirmed_appts: 0,
        rescheduled_appts: 0,
        cancelled_appts: 0,
        visited_appts: 0,
    };
    public selected = 0;
    public totalPendingAppointments: any = [];
    public PenappointmentList: any = [];
    public allOverdueAppoints: any = [];
    public latestJobCards: any = [];
    public laabsLoader: boolean = true;
    public todaysAppointments: any = [];
    public pendingActionAppointments: any = [];

    @ViewChild('appointmentModal') appointmentModal: any;
    @ViewChild('calllogmodal') calllogmodal: any;

    cols = [
        { field: 'apptm_code', title: 'Code', isUnique: true, hide: false },
        ...(['13', '1', '19'].includes(this.user_role) ? [{ field: 'ld_verify_flag', title: 'Verified', hide: false }] : []),
        ...(this.selectTab != 'all' ? [{ field: 'actionTaken', title: 'Action Taken', hide: false }] : []),
        { field: 'call_from', title: 'Number', hide: false },
        { field: 'cust_name', title: 'Customer', hide: false },
        { field: 'customer_type', title: 'Customer Type', hide: false },
        { field: 'lead_source', title: 'Source' },
        { field: 'apptm_status_l', title: 'Status', hide: false },
        // { field: 'apptm_group_l', title: 'Type' },
        { field: 'appt_date', title: 'App Date', hide: false },
        { field: 'created_date', title: 'Created Date', hide: false },
        { field: 'timeGap', title: 'Time Gap', hide: false },
        { field: 'appoint_time', title: 'Time', hide: false },
        { field: 'reg_no', title: 'Reg.No', hide: false },
        { field: 'us_firstname', title: 'Assigned', hide: false },
        { field: 'apptm_created', title: 'Created', hide: false },
        { field: 'apptm_transport_service_l', title: 'Pick&Drop', hide: false },
        { field: 'pickup_mode', title: 'Pickup Mode ', hide: false },
        { field: 'appt_count', title: 'Attempt No', hide: true },
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
        this.load_flag = true;
        this.laabsLoader = true;
        this.appointmentCounts = {
            total_appts: 0,
            scheduled_appts: 0,
            confirmed_appts: 0,
            rescheduled_appts: 0,
            cancelled_appts: 0,
            visited_appts: 0,
            pending_appts: 0,
            Laabs_visited_appts: 0,
        };
        this.appointmentList = [];
        this.allAppointment = [];
        let data: any;
        let pendata: any;
        let penstatus = [1, 2, 3];
        let status = [1, 2, 3, 4, 5];
        this.allOverdueAppoints = [];
        this.todaysAppointments = [];
        this.pendingActionAppointments = [];
        this.overdueAppoints = [];

        if (this.selectedStatus != '0') {
            status = [this.selectedStatus];
        }
        if (this.user_role == '11') {
            data = {
                status: status,
                us_id: atob(atob(localStorage.getItem('us_id') || '')),
                type: 1,
                dateFrom: this.dateFrom,
                dateTo: this.dateTo,
            };
            pendata = {
                status: penstatus,
                us_id: atob(atob(localStorage.getItem('us_id') || '')),
                type: 1,
            };
        } else {
            data = {
                status: status,
                type: 0,
                dateFrom: this.dateFrom,
                dateTo: this.dateTo,
            };
            pendata = {
                status: penstatus,
                type: 0,
            };
        }
        this.userServices.getAppointmentList(data).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                // this.appointmentList = rData.appointments;
                // this.allAppointment = rData.appointments;
                const today = new Date();
                const todayDateString = today.toISOString().split('T')[0];
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                const tomorrowDateString = tomorrow.toISOString().split('T')[0];

                // this.todaysAppointments = this.allAppointment.filter((appointment: any) => appointment.appt_date === todayDateString);
                // this.pendingActionAppointments = this.allAppointment.filter(
                //     (appointment: any) =>
                //         appointment.appt_date == tomorrowDateString &&
                //         (appointment.apptm_status == '1' || appointment.apptm_status == '2' || appointment.apptm_status == '3')
                // );
                if (this.selectTab == 'all') {
                    this.allAppointment = rData.appointments;
                    this.appointmentList = this.allAppointment;
                    this.appointmentCounts.total_appts = this.allAppointment.length;
                } else if (this.selectTab == 'today') {
                    this.allAppointment = rData.appointments.filter((appointment: any) => appointment.appt_date === todayDateString);
                    this.allAppointment.forEach((element: any) => {
                        element.actionTaken = 'No action taken yet';
                        const apptDate = element.apptm_updated_on.substring(0, 10); // Or use split(' ')[0]
                        if (apptDate === todayDateString) {
                            element.actionTaken = 'Action taken';
                        }
                    });
                    this.todaysAppointments = this.allAppointment.sort((a: any, b: any) => {
                        return new Date(a.apptm_updated_on).getTime() - new Date(b.apptm_updated_on).getTime();
                    }); // Descending order -- b-a ,, Ascending order a-b
                    this.appointmentList = this.todaysAppointments;
                    this.appointmentCounts.total_appts = this.todaysAppointments.length;
                } else if (this.selectTab == 'pending') {
                    this.allAppointment = rData.appointments.filter(
                        (appointment: any) =>
                            appointment.appt_date == tomorrowDateString &&
                            (appointment.apptm_status == '1' || appointment.apptm_status == '2' || appointment.apptm_status == '3')
                    );
                    this.allAppointment.forEach((element: any) => {
                        element.actionTaken = 'No action taken yet';
                        const apptDate = element.apptm_updated_on.substring(0, 10); // Or use split(' ')[0]
                        if (apptDate === todayDateString) {
                            element.actionTaken = 'Action taken';
                        }
                    });
                    this.pendingActionAppointments = this.allAppointment;
                    this.pendingActionAppointments = this.allAppointment.sort((a: any, b: any) => {
                        return new Date(a.apptm_updated_on).getTime() - new Date(b.apptm_updated_on).getTime();
                    });
                    this.appointmentList = this.pendingActionAppointments;
                    this.appointmentCounts.total_appts = this.pendingActionAppointments.length;
                }

                this.cols = [
                    { field: 'apptm_code', title: 'Code', isUnique: true, hide: false },
                    ...(['13', '1', '19'].includes(this.user_role) ? [{ field: 'ld_verify_flag', title: 'Verified', hide: false }] : []),
                    ...(this.selectTab != 'all' ? [{ field: 'actionTaken', title: 'Action Taken', hide: false }] : []),
                    { field: 'call_from', title: 'Number', hide: false },
                    { field: 'cust_name', title: 'Customer', hide: false },
                    { field: 'customer_type', title: 'Customer Type', hide: false },
                    { field: 'lead_source', title: 'Source' },
                    { field: 'apptm_status_l', title: 'Status', hide: false },
                    // { field: 'apptm_group_l', title: 'Type' },
                    { field: 'appt_date', title: 'App Date', hide: false },
                    { field: 'created_date', title: 'Created Date', hide: false },
                    { field: 'timeGap', title: 'Time Gap', hide: false },
                    { field: 'appoint_time', title: 'Time', hide: false },
                    { field: 'reg_no', title: 'Reg.No', hide: false },
                    { field: 'us_firstname', title: 'Assigned', hide: false },
                    { field: 'apptm_created', title: 'Created', hide: false },
                    { field: 'apptm_transport_service_l', title: 'Pick&Drop', hide: false },
                    { field: 'pickup_mode', title: 'Pickup Mode ', hide: false },
                    { field: 'appt_count', title: 'Attempt No', hide: true },
                    { field: 'action', title: 'Action', hide: false },
                ];

                // this.appointmentCounts.total_appts = this.allAppointment.length;

                this.allAppointment.forEach((element: any) => {
                    element['LaabsVisited'] = false;
                    const apptmCreatedOn = element.apptm_created_on;
                    const dateOnly = apptmCreatedOn.substring(0, 10);
                    element['created_date'] = dateOnly;
                    const createdOn = new Date(element.apptm_created_on);
                    const apptDateTime = new Date(`${element.appt_date} ${element.appt_time}`);
                    const timeDiff = apptDateTime.getTime() - createdOn.getTime();
                    const hoursDiff = timeDiff / (1000 * 60 * 60);
                    const days = Math.floor(hoursDiff / 24);
                    const remainingHours = (hoursDiff % 24).toFixed(2);
                    if (days > 0) {
                        element['timeGap'] = `${days} day${days > 1 ? 's' : ''} ${remainingHours} hours`;
                    } else {
                        element['timeGap'] = `${parseFloat(remainingHours)} hours`;
                    }

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
                        this.appointmentCounts.scheduled_appts++;
                    } else if (element.apptm_status == '2') {
                        element['apptm_status_l'] = 'Confirmed';
                        this.appointmentCounts.confirmed_appts++;
                    } else if (element.apptm_status == '3') {
                        element['apptm_status_l'] = 'Rescheduled';
                        this.appointmentCounts.rescheduled_appts++;
                    } else if (element.apptm_status == '4') {
                        element['apptm_status_l'] = 'Cancelled';
                        this.appointmentCounts.cancelled_appts++;
                    } else if (element.apptm_status == '5') {
                        element['apptm_status_l'] = 'Visited';
                        this.appointmentCounts.visited_appts++;
                    }
                    if ((element.apptm_status == '1' || element.apptm_status == '2' || element.apptm_status == '3') && element.appt_date < this.today) {
                        this.overdueAppoints.push(element);
                        this.appointmentCounts.pending_appts++;
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
                        if (element2.us_id == element.apptm_created_by) {
                            element.apptm_created = element2.us_firstname;
                        }
                    });
                });

                let newcust = this.allAppointment.filter((appt: any) => appt.customer_type == 'NEW');
                let Calls = this.allAppointment.filter(
                    (appointment: any) => appointment.source_id == '9' || appointment.source_id == '8' || appointment.source_id == '4'
                );
                let WD = this.allAppointment.filter((appointment: any) => appointment.source_id == '9');
                let WC = this.allAppointment.filter((appointment: any) => appointment.source_id == '8');
                let CREW = this.allAppointment.filter((appointment: any) => appointment.source_id == '4');

                // console.log('this.today', this.today);
                // console.log('appointment visited from whatsapp WD', WD);
                // console.log('appointment visited from whatsapp WC', WC);
                // console.log('appointment visited from CRE whatsapp', CREW);

                let temp = this.allAppointment.filter(
                    (appointment: any) => (appointment.source_id == '8' || appointment.source_id == '9') && appointment.apptm_status == '5'
                );
                // console.log("appointment visited from whatsapp",temp)

                this.appointmentList = this.allAppointment;
                this.load_flag = false;
                const phones = rData.appointments.filter((appointment: any) => appointment.lphone).map((appointment: any) => appointment.lphone);
                this.userServices.getLatestJobCard({ phones: phones }).subscribe((rData: any) => {
                    if (rData.ret_data == 'success') {
                        this.latestJobCards = rData.jobcards;
                        this.allAppointment.forEach((element: any) => {
                            this.latestJobCards.forEach((element2: any) => {
                                if (this.latestJobCards.length > 0) {
                                    if (element.customer_code == element2.customer_no && element.apptm_status != '4') {
                                        const appt_date = new Date(element.appt_date);
                                        const jobOpenDate = new Date(element2.job_open_date);
                                        appt_date.setHours(0, 0, 0, 0);
                                        jobOpenDate.setHours(0, 0, 0, 0);
                                        element['job_open_date'] = element2.job_open_date;
                                        if (jobOpenDate >= appt_date) {
                                            element.LaabsVisited = true;
                                            this.appointmentCounts.Laabs_visited_appts++;
                                        }
                                    }
                                }
                            });
                        });
                        this.laabsLoader = false;
                    } else {
                        this.laabsLoader = false;
                    }
                });
            } else {
                this.coloredToast('danger', 'No appointments found');
                this.load_flag = false;
            }
        });
        this.userServices.getAppointmentList(pendata).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.allOverdueAppoints = [];
                this.PenappointmentList = rData.appointments;
                this.PenappointmentList.forEach((element: any) => {
                    if ((element.apptm_status == '1' || element.apptm_status == '2' || element.apptm_status == '3') && element.appt_date < this.today) {
                        this.allOverdueAppoints.push(element);
                    }
                });
            } else {
            }
        });
    }

    selectTabName(tabName: any) {
        this.selectTab = tabName;
        this.getAppointmentList();
        // this.appointmentCounts = {
        //     total_appts: 0,
        //     scheduled_appts: 0,
        //     confirmed_appts: 0,
        //     rescheduled_appts: 0,
        //     cancelled_appts: 0,
        //     visited_appts: 0,
        // };
        // if (tabName == 'all') {
        //     this.appointmentList = this.allAppointment;
        //     this.appointmentCounts.total_appts = this.allAppointment.length;
        //     this.allAppointment.forEach((element: any) => {
        //         if (element.apptm_status == '1') {
        //             this.appointmentCounts.scheduled_appts++;
        //         } else if (element.apptm_status == '2') {
        //             this.appointmentCounts.confirmed_appts++;
        //         } else if (element.apptm_status == '3') {
        //             this.appointmentCounts.rescheduled_appts++;
        //         } else if (element.apptm_status == '4') {
        //             this.appointmentCounts.cancelled_appts++;
        //         } else if (element.apptm_status == '5') {
        //             this.appointmentCounts.visited_appts++;
        //         }
        //     });
        // } else if (tabName == 'today') {
        //     this.appointmentList = this.todaysAppointments;
        //     this.appointmentCounts.total_appts = this.todaysAppointments.length;
        //     this.todaysAppointments.forEach((element: any) => {
        //         if (element.apptm_status == '1') {
        //             this.appointmentCounts.scheduled_appts++;
        //         } else if (element.apptm_status == '2') {
        //             this.appointmentCounts.confirmed_appts++;
        //         } else if (element.apptm_status == '3') {
        //             this.appointmentCounts.rescheduled_appts++;
        //         } else if (element.apptm_status == '4') {
        //             this.appointmentCounts.cancelled_appts++;
        //         } else if (element.apptm_status == '5') {
        //             this.appointmentCounts.visited_appts++;
        //         }
        //     });
        // } else if (tabName == 'pending') {
        //     this.appointmentList = this.pendingActionAppointments;
        //     this.appointmentCounts.total_appts = this.pendingActionAppointments.length;
        //     this.pendingActionAppointments.forEach((element: any) => {
        //         if (element.apptm_status == '1') {
        //             this.appointmentCounts.scheduled_appts++;
        //         } else if (element.apptm_status == '2') {
        //             this.appointmentCounts.confirmed_appts++;
        //         } else if (element.apptm_status == '3') {
        //             this.appointmentCounts.rescheduled_appts++;
        //         } else if (element.apptm_status == '4') {
        //             this.appointmentCounts.cancelled_appts++;
        //         } else if (element.apptm_status == '5') {
        //             this.appointmentCounts.visited_appts++;
        //         }
        //     });
        // }
    }

    filterAppointments(value: any) {
        this.selected = value;
        if (this.selectTab == 'all') {
            if (value == 0) {
                this.appointmentList = this.allAppointment;
            } else if (value == 10) {
                this.appointmentList = this.overdueAppoints;
            } else if (value == 11) {
                this.appointmentList = this.allAppointment.filter((item: any) => item.LaabsVisited == true);
            } else {
                this.appointmentList = this.allAppointment.filter((item: any) => item.apptm_status == value);
            }
        } else if (this.selectTab == 'today') {
            if (value == 0) {
                this.appointmentList = this.todaysAppointments;
            } else {
                this.appointmentList = this.todaysAppointments.filter((item: any) => item.apptm_status == value);
            }
        } else if (this.selectTab == 'pending') {
            if (value == 0) {
                this.appointmentList = this.pendingActionAppointments;
            } else {
                this.appointmentList = this.pendingActionAppointments.filter((item: any) => item.apptm_status == value);
            }
        }
    }
    totalOverDueAppoints() {
        this.router.navigateByUrl('overdueAppoints');
        // this.router.navigate(['overdueAppoints'], {
        //     queryParams: {
        //         allOverdueAppoints: allOverdueAppoints,
        //     },
        // });
    }

    viewAppointmentDetails(item: any) {
        this.router.navigateByUrl('leads/appointment/appointment-details/' + btoa(item.apptm_id));
    }

    createAppointment() {
        this.appointmentModal.open();
    }

    appointmentModalClose() {
        this.appointmentModal.close();
        this.getAppointmentList();
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

    updateColumn(col: colDef) {
        col.hide = !col.hide;
        this.cols = [...this.cols]; // Create a new reference of the array
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
