import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { Observable, of } from 'rxjs';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-quotation-details',
    templateUrl: './quotation-details.component.html',
    styleUrls: ['./quotation-details.component.css'],
})
export class QuotationDetailsComponent implements OnInit {
    public lead_id: string;
    public load_flag: boolean = true;
    public userList: any[] = [];
    public quotationDetails: any;
    public quoteLog: any[] = [];
    public qt_list: any;
    public quotecode: any[] = [];
    public notesList: any[] = [];
    public noteSearch = 'lead_note';
    public naCount = 0;
    appt = false;
    public appt_id: any;
    public basic: FlatpickrOptions;
    public quoteflag: boolean = true;
    public timeSlots:any=[];
    //filteredOptions: Observable<string[]>;

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
                this.appt_id = rdata.appt_id;
                this.appt = true;
            } else {
            }
        });
    }
    ngOnInit() {
        this.getQuoteLeads();
    }

    typechange() {
        this.quotecode = [];
        this.quotationDetails.quote_no = null;
        if (this.quotationDetails.quote_type === '1') {
            this.quotecode = this.qt_list.filter((item: any) => item.qt_type != '2');
        } else if (this.quotationDetails.quote_type === '2') {
            this.quotecode = this.qt_list.filter((item: any) => item.qt_type != '1');
        } else if (this.quotationDetails.quote_type === '3') {
            const phoneLastFive = this.quotationDetails.phone.slice(-5);
            const quoteFirstFive = this.quotationDetails.quote_assigned.substring(0, 5);
            const generatedCode = `WA_${phoneLastFive}_${quoteFirstFive}`;
            this.quotationDetails.quote_no = generatedCode;
        }
    }

    getQuoteLeads() {
        let data = {
            lead_id: this.lead_id,
        };

        this.userServices.getLeadQuote(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.quotationDetails = rdata.lead;
                this.quotationDetails.apptm_group = '1';
                if (this.quotationDetails.register_number && this.quotationDetails.register_number != null && this.quotationDetails.register_number != '') {
                    this.quotationDetails.reg_no = this.quotationDetails.register_number;
                }
                this.quoteLog = rdata.quoteLog;
                this.naCount = rdata.naCount;
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
                    // this.leadform = {
                    //   verify: "0",
                    //   cust_name: rdata.lead.name,
                    //   call_from: rdata.lead.phone,
                    //   lead_note: rdata.lead.lead_note,
                    //   dateField: new Date(),
                    //   appTime: "",
                    //   assigned: rdata.lead.assigned,
                    //   quote_type:rdata.quoteLog[0].lql_type
                    // };
                }
                this.quoteLog.forEach((element) => {
                    var a = element.lql_created_on.split(' ');
                    var date = a[0];
                    var time = a[1];
                    element['c_date'] = date;
                    element['c_time'] = moment(time, 'HHmmss').format('hh:mm:ss A');
                    this.userList.forEach((element2) => {
                        if (element.lql_created_by == element2.us_id) {
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

    Quoteupdate(data: any) {
        this.quoteflag = true;
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const dd = String(today.getDate()).padStart(2, '0');
        const todayFormatted = `${yyyy}-${mm}-${dd}`;
        if (data['verify'] != '0') {
            data['lead_id'] = this.lead_id;

            if (data['dateField'] != '') {
                let datevalD = new Date(data['dateField']);
                data['dateField'] = datevalD.getFullYear() + '-' + ('0' + (datevalD.getMonth() + 1)).slice(-2) + '-' + ('0' + datevalD.getDate()).slice(-2);
            }
        }
        if (data['verify'] == '2') {
            if (data['apptm_group'] == null || data['apptm_group'] == '') {
                this.quoteflag = false;
                this.coloredToast('danger', 'Select An Appointment Type');
            } else if (data['dateField'] == null || data['dateField'] == '' || data['dateField'] == 'NaN-aN-aN') {
                this.quoteflag = false;
                this.coloredToast('danger', 'Select An Appointment Date');
            } else if (data['dateField'] < todayFormatted) {
                this.coloredToast('danger', 'Select an Proper Appointment Date ');
                this.quoteflag = false;
            } else if (data['appTime'] == null || data['appTime'] == '') {
                this.quoteflag = false;
                this.coloredToast('danger', 'Select An Appointment Time');
            } else if (data['reg_no'] == null || data['reg_no'] == '') {
                this.quoteflag = false;
                this.coloredToast('danger', 'Please Enter Vehicle Registration Number');
            } else if (data['assigned'] == null || data['assigned'] == '') {
                this.quoteflag = false;
                this.coloredToast('danger', 'Select An Assignee');
            } else if (data['transportation_service'] == null || data['transportation_service'] == '') {
                this.quoteflag = false;
                this.coloredToast('danger', 'Select Pickup & Drop Details');
            } else if (data['Remarks'] == null || data['Remarks'] == '') {
                this.quoteflag = false;
                this.coloredToast('danger', 'Please Enter Customer Comment');
            }
        }

        if (this.quoteflag) {
            this.userServices.leadQuoteUpdate(data).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    this.coloredToast('success', 'Quotation Status Updated Successfully');
                    this.router.navigateByUrl('leads/quotation/quotation-list');
                } else {
                    this.coloredToast('danger', 'Fill out fields to update');
                }
            });
        }
    }

    updateLeadVerification(lead: any, newFlag: number) {
        // Set the new verification flag
        lead.ld_verify_flag = newFlag;

        let data = {
            ld_verify_flag: newFlag,
            lead_id: lead.lead_id,
        };

        this.userServices.updateLeadVerificationFlag(data).subscribe(
            (rdata: any) => {
                if (rdata.ret_data == 'success') {
                    this.coloredToast('success', 'Lead Verify Flag Updated Successfully');
                    this.getQuoteLeads(); // Refresh the lead list if needed
                }
            },
            (error: any) => {
                // Roll back the flag in case of an error
                lead.ld_verify_flag = newFlag == 1 ? 0 : 1;
                console.error('Error updating lead verification:', error);
                this.coloredToast('error', 'Failed to Update Lead Verify Flag');
            }
        );
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

    preventDefault() {
        return false;
    }
}
