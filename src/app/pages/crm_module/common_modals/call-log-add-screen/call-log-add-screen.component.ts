import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-call-log-add-screen',
    templateUrl: './call-log-add-screen.component.html',
    styleUrls: ['./call-log-add-screen.component.css'],
})
export class CallLogAddScreenComponent implements OnInit {
    @Input() callData: any;
    @Output() modalEvent = new EventEmitter<boolean>();

    public leadLog: FormGroup;
    public noteSearch = 'lead_note';
    public basic: FlatpickrOptions;

    public notesList: any[] = [];
    public purposeList: any[] = [];
    public saCreList: any[] = [];
    public campaignList: any[] = [];
    public data_load_flag: boolean = true;
    public newPurposeList: any[] = [];
    public customerDetails: any;
    public savedLogs: any[] = [];
    public yeaStarCallLog: any[] = [];
    public current_lead: any = null;
    public timeSlots: any = [];
    button_act_state = 0;
    public filteredNotesList: any = [];


    constructor(private userServices: StaffPostAuthService, private fb: FormBuilder) {
        this.userServices.getPreloadDatas().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.notesList = rData.notes.map(function (i: any) {
                    return i.lead_note;
                });
                this.purposeList = rData.purpose;
                this.newPurposeList = rData.purpose.filter((item: any) => item.new_cus_display == '1');
            } else {
                this.coloredToast('danger', 'Some error occurred, please try again later');
            }
        });
        this.userServices.userList().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.saCreList = rData.userList.filter((item: any) => item.us_role_id == '11' || item.us_role_id == '9');
            }
        });

        this.leadLog = this.fb.group({
            call_purpose: [null, [Validators.required]],
            customerName: [null, [Validators.maxLength(50)]], //Validators.pattern('[a-zA-Z][a-zA-Z ]+[a-zA-Z]$')
            call_note: [null],
            vehicle_model: [null, [Validators.maxLength(60)]],
            reg_no: [null, [Validators.maxLength(12)]],
            assigned_to: [null],
            appointment_date: [null],
            appointment_time: [null],
            pick_drop: [null],
            campaign_data: [null],
            campaign_date: [null],
            lead_id: [null], //[this.callData.leadId]
            rec_call_id: [null], //[this.callData.rec_call_id]
            call_log_id: [null], //[this.callData.call_log_id]
            lead_status: [null],
            lead_code: [null],
            apptm_group: ['1'],
        });
        this.basic = {
            dateFormat: 'Y-m-d',
            minDate: new Date(),
            utc: true,
        };
    }
    ngOnInit(): void {
        this.leadLog.patchValue({
            lead_id: this.callData.leadId,
            rec_call_id: this.callData.rec_call_id,
            call_log_id: this.callData.call_log_id,
        });
        console.log('data  after opening modal?????????????', this.callData);
        this.getCallDetails();
    }

    getCallDetails() {
        this.customerDetails = [];
        this.savedLogs = [];
        this.current_lead = [];
        this.userServices.fetchDetailsByPhoneNumber({ phone: this.callData.phone, leadid: this.callData.leadId }).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.customerDetails = rData.customer_details;
                this.savedLogs = rData.lead_log;
                this.current_lead = rData.current_lead;
                if (this.customerDetails != null) {
                    this.leadLog.patchValue({
                        customerName: [this.customerDetails.customer_name],
                    });
                } else {
                    this.leadLog.patchValue({
                        customerName: [this.current_lead.name],
                    });
                }
                if (this.current_lead.status_id == '1') {
                    this.leadLog.patchValue({
                        call_purpose: [this.current_lead.purpose_id],
                    });
                }
                if (this.current_lead.lead_code != '' || this.current_lead.lead_code != null) {
                    this.leadLog.patchValue({
                        lead_code: this.current_lead.lead_code,
                    });
                }
                this.data_load_flag = false;

                this.userServices.getLatestCallReportByNumber({ phoneNumber: this.callData.phone }).subscribe((rData: any) => {
                    if (rData.ret_data == 'success') {
                        if (rData.call_data.length > 0) {
                            let inbound_temp: any[] = [];
                            rData.call_data.forEach((element: any) => {
                                if (element.dst != '6300' && element.disposition != 'NOT ANSWERED') {
                                    inbound_temp.push(element);
                                }
                            });
                            inbound_temp.sort(function (a: any, b: any) {
                                return b.timestamp - a.timestamp;
                            });
                            inbound_temp = inbound_temp.slice(0, 6);
                            inbound_temp.forEach((item: any) => {
                                // console.log(item.uniqueid + "-----" + this.savedLogs[0].ystar_call_id);
                                let temp: any[] = this.savedLogs.filter((element: any) => element.ystar_call_id == item.uniqueid);
                                if (temp.length > 0) {
                                    item.leadlog = temp[0].lcl_purpose_note;
                                    item.purpose = temp[0].call_purpose;
                                } else {
                                    item.leadlog = 'nil';
                                    item.purpose = 'nil';
                                }
                            });
                            this.yeaStarCallLog = inbound_temp;
                        }
                    }
                });
            } else {
                this.coloredToast('danger', 'Cant fetch details, Some error occured');
                this.data_load_flag = false;
            }
        });
    }

    purposeChangeDataFetch() {
        this.leadLog.controls['appointment_date'].setValue(null);
        this.leadLog.controls['appointment_time'].setValue(null);
        this.leadLog.controls['assigned_to'].setValue(null);
        this.leadLog.controls['call_note'].setValue(null);
        this.leadLog.controls['campaign_data'].setValue(null);

        if (this.leadLog.controls['call_purpose'].value == '2') {
            this.userServices.getCampaignList().subscribe((rData: any) => {
                if (rData.ret_data == 'success') {
                    this.campaignList = rData.camp;
                }
            });
        }
    }
    saveLeadDetails() {
        this.button_act_state = 1;
        if (this.leadLog.valid) {
            const submit_flag = true;
            if (this.current_lead.status_id == '1') {
                this.leadLog.patchValue({
                    appointment_date: this.current_lead.ld_appoint_date,
                    appointment_time: this.current_lead.ld_appoint_time,
                    reg_no: this.current_lead.register_number,
                    assigned_to: this.current_lead.assigned,
                });
                if (this.leadLog.controls['call_note'].value == '' || this.leadLog.controls['call_note'].value == null) {
                    this.coloredToast('danger', 'Customer Remarks Required');
                    this.button_act_state = 0;
                    return;
                }
            } else {
                if (
                    this.leadLog.controls['call_purpose'].value == '1' &&
                    (this.leadLog.controls['appointment_date'].value == '' ||
                        this.leadLog.controls['appointment_date'].value == null ||
                        this.leadLog.controls['appointment_time'].value == '' ||
                        this.leadLog.controls['appointment_time'].value == null ||
                        this.leadLog.controls['assigned_to'].value == '' ||
                        this.leadLog.controls['assigned_to'].value == null ||
                        this.leadLog.controls['apptm_group'].value == '' ||
                        this.leadLog.controls['apptm_group'].value == null ||
                        this.leadLog.controls['call_note'].value == '' ||
                        this.leadLog.controls['call_note'].value == null)
                ) {
                    this.coloredToast('danger', 'Appointment Date,Time,Assigned staff and  Customer Remark is required');
                    this.button_act_state = 0;
                    return;
                }
                if (
                    this.leadLog.controls['call_purpose'].value == '2' &&
                    (this.leadLog.controls['campaign_data'].value == '' || this.leadLog.controls['campaign_data'].value == null)
                ) {
                    this.coloredToast('danger', 'Enquired campaign should be selected');
                    this.button_act_state = 0;
                    return;
                }
                if (
                    this.leadLog.controls['call_purpose'].value == '2' &&
                    (this.leadLog.controls['assigned_to'].value == '' ||
                        this.leadLog.controls['assigned_to'].value == null ||
                        this.leadLog.controls['call_note'].value == '' ||
                        this.leadLog.controls['call_note'].value == null)
                ) {
                    this.coloredToast('danger', 'A staff should be assigned and customer remark should be provided');
                    this.button_act_state = 0;
                    return;
                }
                if (
                    this.leadLog.controls['call_purpose'].value == '3' &&
                    (this.leadLog.controls['assigned_to'].value == '' ||
                        this.leadLog.controls['assigned_to'].value == null ||
                        this.leadLog.controls['call_note'].value == '' ||
                        this.leadLog.controls['call_note'].value == null)
                ) {
                    this.coloredToast('danger', 'A staff should be assigned and customer remark should be provided');
                    this.button_act_state = 0;
                    return;
                }
                if (
                    this.leadLog.controls['call_purpose'].value == '4' &&
                    (this.leadLog.controls['call_note'].value == '' ||
                        this.leadLog.controls['call_note'].value == null ||
                        this.leadLog.controls['lead_status'].value == '' ||
                        this.leadLog.controls['lead_status'].value == null) //this.leadLog.controls['vehicle_model'].value == '' || this.leadLog.controls['vehicle_model'].value == null ||
                ) {
                    this.coloredToast('danger', 'Customer Remark and Lead Status required');
                    this.button_act_state = 0;
                    return;
                }
                if (
                    (this.leadLog.controls['call_purpose'].value == '6' ||
                        this.leadLog.controls['call_purpose'].value == '7' ||
                        this.leadLog.controls['call_purpose'].value == '9' ||
                        this.leadLog.controls['call_purpose'].value == '10') &&
                    (this.leadLog.controls['call_note'].value == '' || this.leadLog.controls['call_note'].value == null)
                ) {
                    this.coloredToast('danger', 'Customer remark is required');
                    this.button_act_state = 0;
                    return;
                }
            }
            if (this.leadLog.value.appointment_date != '' || this.leadLog.value.appointment_date != null) {
                let datevalD = new Date(this.leadLog.value.appointment_date);
                this.leadLog.value.appointment_date =
                    datevalD.getFullYear() + '-' + ('0' + (datevalD.getMonth() + 1)).slice(-2) + '-' + ('0' + datevalD.getDate()).slice(-2);
            }
            this.userServices.updateLeadData(this.leadLog.value).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    this.coloredToast('success', 'Lead details saved successfully');
                    this.modalEvent.emit();
                    // this.button_act_state = 0;
                } else {
                    this.coloredToast('danger', 'Some error occured, please try again later');
                    this.button_act_state = 0;
                }
            });
        } else {
            this.coloredToast('danger', 'Please Enter Valid Details');
            this.button_act_state = 0;
        }
    }

    changeTimeslots(appointmentDate: any) {
        this.timeSlots = [];
        this.timeSlots = this.createTimeSlots(new Date(appointmentDate));
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

    onSearchChange(searchTerm: string) {
        // Filter the notes based on the search term
        this.filteredNotesList = this.notesList.filter((note) => note.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 15); // Limit to 15 results
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
