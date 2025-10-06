import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-whatsapp-lead-create',
    templateUrl: './whatsapp-lead-create.component.html',
    styleUrls: ['./whatsapp-lead-create.component.css'],
})
export class WhatsappLeadCreateComponent {
    @Input() leadDetails: any;
    basic: FlatpickrOptions;
    public notesList: any[] = [];
    public purposeList: any[] = [];
    public saCreList: any[] = [];
    public campaignList: any[] = [];
    public leadLog: FormGroup;
    public noteSearch = 'lead_note';
    public leads: any[] = [];
    public sourceList: any[] = [];
    public appoint_flag: boolean = false;
    public appoint_id: any;
    public today: any = this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '';
    public socialMediaCampaignList: any[] = [];
    public socialMediaSourceList: any[] = [];
    public timeSlots: any = [];
    public filteredNotesList: any = [];

    button_act_state = 0;

    @Output() modalEvent = new EventEmitter<boolean>();
    constructor(public router: Router, private userServices: StaffPostAuthService, public datepipe: DatePipe, private fb: FormBuilder) {
        this.userServices.getPreloadDatas().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.notesList = rData.notes.map(function (i: any) {
                    return i.lead_note;
                });
                this.purposeList = rData.purpose;
                //this.newPurposeList = rData.purpose.filter((item: any) => item.new_cus_display == "1");
            } else {
                this.coloredToast('danger', 'Some error occurred, please try again later');
            }
        });
        this.userServices.userList().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.saCreList = rData.userList.filter((item: any) => item.us_role_id == '11' || item.us_role_id == '9' || item.us_role_id == '19');
            }
        });
        this.userServices.getLeadSource().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.sourceList = rData.source;
            }
        });
        this.userServices.socialMediaCampaignsource().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.socialMediaSourceList = rData.sourceList;
            }
        });

        this.leadLog = this.fb.group({
            lead_id: [null],
            call_purpose: [null, [Validators.required]],
            customerName: [null, [Validators.maxLength(50)]], // Validators.pattern('[a-zA-Z][a-zA-Z ]+[a-zA-Z]$')
            customerNumber: [null, [Validators.maxLength(12), Validators.pattern(/^\d{12}$/)]],
            call_note: [null],
            vehicle_model: [null, [Validators.maxLength(60)]],
            reg_no: [null, [Validators.maxLength(12)]],
            assigned_to: [null],
            appointment_date: [null],
            appointment_time: [null],
            pick_drop: [null],
            campaign_data: [null],
            campaign_date: [null],
            lead_status: [null],
            apptm_group: ['1'],
        });
        this.basic = {
            dateFormat: 'Y-m-d',
            minDate: new Date(),
        };
    }
    ngOnInit() {
        this.leadLog.patchValue({
            lead_id: this.leadDetails.lead_id,
            call_purpose: this.leadDetails.purpose_id,
            customerName: this.leadDetails.name,
            customerNumber: this.leadDetails.phone,
        });
    }

    purposeChangeDataFetch() {
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
        // if (this.leadLog.valid) {
        const submit_flag = true;
        if (this.leadLog.controls['appointment_date'].value != '') {
            let datevalD = new Date(this.leadLog.controls['appointment_date'].value);
            this.leadLog.value['appointment_date'] =
                datevalD.getFullYear() + '-' + ('0' + (datevalD.getMonth() + 1)).slice(-2) + '-' + ('0' + datevalD.getDate()).slice(-2);
        }
        if (this.leadLog.controls['customerNumber'].value == '' || this.leadLog.controls['customerNumber'].value == null) {
            this.coloredToast('danger', 'Customer Number Required');
            this.button_act_state = 0;
            return;
        }
        if (this.leadLog.controls['call_note'].value == '' || this.leadLog.controls['call_note'].value == null) {
            this.coloredToast('danger', 'Customer Remark Required');
            this.button_act_state = 0;
            return;
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
        this.userServices.updateWhatsappLead(this.leadLog.value).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.coloredToast('success', 'Lead details saved successfully');
                this.modalEvent.emit();
                this.button_act_state = 0;
            } else {
                this.coloredToast('danger', 'Some error occured, please try again later');
            }
        });
        // } else {
        //     this.coloredToast('danger', 'Please enter valid purpose & name');
        // }
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

    onSearchChange(searchTerm: any): void {
        // Filter notes based on user input
        this.filteredNotesList = this.notesList.filter((note) => note.toLowerCase().includes(searchTerm.term.toLowerCase())).slice(0, 15);
    }

    onAddNewNote(newNote: any): void {
        if (newNote && !this.notesList.includes(newNote)) {
            this.notesList.push(newNote); // Add to the main list
            this.filteredNotesList = [...this.notesList]; // Update the filtered list
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

    preventDefault() {
        return false;
    }
}
