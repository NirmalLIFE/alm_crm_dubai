import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-campaign-details',
    templateUrl: './campaign-details.component.html',
    styleUrls: ['./campaign-details.component.css'],
})
export class CampaignDetailsComponent implements OnInit {
    public lead_id: string;
    public load_flag: boolean = true;
    public userList: any[] = [];
    public quotecode: any[] = [];
    public campEnqLogs: any[] = [];
    public qt_list: any;
    public campEnq: any;
    public basic: FlatpickrOptions;
    public notesList: any[] = [];
    public noteSearch = 'lead_note';
    public campflag: boolean = true;
    public button_act_state = 0;
    public apptFlag: boolean = false;
    public apptm_id: any;
    public timeSlots: any = [];


    constructor(public router: Router, private userServices: StaffPostAuthService, public datepipe: DatePipe, private activeRouter: ActivatedRoute) {
        this.lead_id = atob(this.activeRouter.snapshot.paramMap.get('id') || ' ');

        this.basic = {
            dateFormat: 'Y-m-d',
            minDate: new Date(),
        };

        this.userServices.userList().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.userList = rData.userList;
            }
        });

        this.userServices.getQuoteDetails().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.qt_list = rdata.quotes;
                // this.filteredOptions = of(this.qt_list);
            }
        });

        this.userServices.getPreloadDatas().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.notesList = rData.notes.map(function (i: any) {
                    return i.lead_note;
                });
            } else {
                this.coloredToast('danger', 'Some error occurred, please try again later');
            }
        });

        let data = {
            id: this.lead_id,
        };
        this.userServices.getAppointment(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.apptm_id = rdata.appt_id.apptm_id;
                this.apptFlag = true;
            } else {
            }
        });
    }
    ngOnInit() {
        this.campLeads();
    }

    campLeads() {
        let data = {
            lead_id: this.lead_id,
        };

        this.userServices.getLeadCampaignDetails(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.campEnq = rdata.lead;
                this.campEnqLogs = rdata.lead_logs;
                this.campEnq.verify = null;
                this.campEnq.apptm_group = '1';
                this.campEnq.dateField = null;
                this.campEnq.appTime = null;
                this.campEnq.reg_no = null;
                this.campEnq.assigned_to = null;
                this.campEnq.transportation_service = null;
                this.campEnq.Remarks = null;
                this.campEnq.reason = null;
                this.campEnq.quote_type = null;
                this.campEnq.quote_no = null;
                this.campEnq.statusFlag = true;
                this.campEnq.quoteflag = true;

                if (this.campEnq.status_id == '1') {
                    this.campEnq.statusFlag = true;
                } else if (this.campEnq.status_id != '1') {
                    this.campEnq.statusFlag = false;
                }

                if (this.campEnq.register_number && this.campEnq.register_number != null && this.campEnq.register_number != '') {
                    this.campEnq.reg_no = this.campEnq.register_number;
                }
                if (this.campEnq.customer_name && this.campEnq.customer_name != null && this.campEnq.customer_name != '') {
                    this.campEnq.cust_name = this.campEnq.customer_name;
                } else if (this.campEnq.name && this.campEnq.name != null && this.campEnq.name != '') {
                    this.campEnq.cust_name = this.campEnq.name;
                } else {
                    this.campEnq.cust_name = '';
                }
                this.load_flag = false;
                this.campEnqLogs.forEach((element) => {
                    var a = element.lac_created_on.split(' ');
                    var date = a[0];
                    var time = a[1];
                    element['c_date'] = date;
                    element['c_time'] = moment(time, 'HHmmss').format('hh:mm:ss A');
                    // const activityDescription = element.lac_activity.toLowerCase();
                    // if (!activityDescription.startsWith('created lead')) {
                    //     this.campEnq.statusFlag = false;
                    // }
                    const activityDescription = element.lac_activity.toLowerCase();
                    if (activityDescription.startsWith('quotation provided')) {
                        this.campEnq.quoteflag = false;
                    }
                    this.userList.forEach((element2) => {
                        if (element.lac_activity_by == element2.us_id) {
                            element['user_assigned'] = element2.us_firstname;
                        }
                    });
                    // element['qt_code'] = "0";
                    // this.qt_list.forEach((element3:any) => {
                    //     if (element.lql_code == element3.qt_id) {
                    //         element['qt_code'] = element3.qt_code;
                    //     }
                    // });
                });
                if (rdata.lead.ld_appoint_date != null && rdata.lead.ld_appoint_date != '') {
                    // this.leadform = {
                    //   verify: "0",
                    //   cust_name: rdata.lead.name,
                    //   call_from: rdata.lead.phone,
                    //   lead_note: rdata.lead.lead_note,
                    //   dateField: new Date(rdata.lead.ld_appoint_date),
                    //   appTime: rdata.lead.ld_appoint_time,
                    //   assigned: rdata.lead.assigned,
                    //   quote_type:rdata.quoteLog[0].lql_type
                    // };
                } else {
                }
                this.load_flag = false;
            }
        });
    }

    changeTimeslots(appt_date: any) {
        this.timeSlots = [];
        this.timeSlots = this.createTimeSlots(new Date(appt_date));
    }

    createTimeSlots(appointmentDate: any) {
        const now = new Date();
        const isToday =
            now.getFullYear() === appointmentDate.getFullYear() && now.getMonth() === appointmentDate.getMonth() && now.getDate() === appointmentDate.getDate();

        const intervalMinutes = 15;

        const createSlotsRecursive = (startTime: Date, endTime: Date, timeSlots: any[]): any[] => {
            if (startTime >= endTime) {
                return timeSlots;
            }

            const timeSlotStart = new Date(startTime);
            startTime.setMinutes(startTime.getMinutes() + intervalMinutes);

            const formattedStart = timeSlotStart.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });

            timeSlots.push({ time_slots: formattedStart });

            return createSlotsRecursive(startTime, endTime, timeSlots);
        };

        const startHour = isToday ? now.getHours() + 1 : 0; // Start from next hour if today
        const endHour = 24;

        const startTime = new Date(appointmentDate);
        startTime.setHours(startHour, 0, 0);
        const endTime = new Date(appointmentDate);
        endTime.setHours(endHour, 0, 0);

        return createSlotsRecursive(startTime, endTime, []);
    }

    leadUpdate(campEnq: any) {
        this.button_act_state = 1;
        this.campflag = true;

        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const dd = String(today.getDate()).padStart(2, '0');
        const todayFormatted = `${yyyy}-${mm}-${dd}`;

        console.log(campEnq);
        console.log(todayFormatted);


        if (campEnq['verify'] != '0') {
            //campEnq['lead_id'] = this.lead_id;
            if (campEnq['dateField'] != '') {
                let datevalD = new Date(campEnq['dateField']);
                campEnq['dateField'] = datevalD.getFullYear() + '-' + ('0' + (datevalD.getMonth() + 1)).slice(-2) + '-' + ('0' + datevalD.getDate()).slice(-2);
            }
        }

        if (this.campEnq.verify == '1') {
            if (this.campEnq.apptm_group == '' || this.campEnq.apptm_group == null) {
                this.coloredToast('danger', 'Appointment Type is Required');
                this.button_act_state = 0;
                this.campflag = false;
            } else if (this.campEnq.dateField == '' || this.campEnq.dateField == null || this.campEnq.dateField == 'NaN-aN-aN') {
                this.coloredToast('danger', 'Appointment Date is Required');
                this.button_act_state = 0;
                this.campflag = false;
            } else if (this.campEnq.dateField < todayFormatted) {
                this.coloredToast('danger', 'Select an Proper Appointment Date ');
                this.button_act_state = 0;
                this.campflag = false;
            } else if (this.campEnq.appTime == '' || this.campEnq.appTime == null) {
                this.coloredToast('danger', 'Appointment Time is Required');
                this.button_act_state = 0;
                this.campflag = false;
            } else if (this.campEnq.assigned_to == '' || this.campEnq.assigned_to == null) {
                this.coloredToast('danger', 'A staff should be assigned');
                this.button_act_state = 0;
                this.campflag = false;
            } else if (this.campEnq.transportation_service == '' || this.campEnq.transportation_service == null) {
                this.coloredToast('danger', 'Pick & Drop Requirement Must Be Selected');
                this.button_act_state = 0;
                this.campflag = false;
            }
        }
        if (this.campEnq.verify == '2') {
            if (this.campEnq.quote_type == '' || this.campEnq.quote_type == null) {
                this.coloredToast('danger', 'Quotation Type is Required');
                this.button_act_state = 0;
                this.campflag = false;
            } else if (this.campEnq.quote_type != '3' && (this.campEnq.quote_no == '' || this.campEnq.quote_no == null)) {
                this.coloredToast('danger', 'Quotation Number is Required');
                this.button_act_state = 0;
                this.campflag = false;
            }
        }
        if (this.campEnq.Remarks == '' || this.campEnq.Remarks == null) {
            this.coloredToast('danger', 'Customer Remark Required');
            this.button_act_state = 0;
            this.campflag = false;
        }

        if (this.campflag) {
            this.userServices.updateLeadCampEnq(campEnq).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    this.coloredToast('success', 'Lead Update Successfully');
                    this.router.navigateByUrl('campaignLeads');
                    this.button_act_state = 0;
                }
            });
        }
    }

    typechange() {
        this.quotecode = [];
        if (this.campEnq.quote_type === '1') {
            this.quotecode = this.qt_list.filter((item: any) => item.qt_type != '2');
        } else if (this.campEnq.quote_type === '2') {
            this.quotecode = this.qt_list.filter((item: any) => item.qt_type != '1');
        }
    }
    viewAppointmentDetails() {
        this.router.navigateByUrl('leads/appointment/appointment-details/' + btoa(this.apptm_id));
    }

    preventDefault() {
        return false;
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
