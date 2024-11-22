import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-appointment-create',
    templateUrl: './appointment-create.component.html',
    styleUrls: ['./appointment-create.component.css'],
})
export class AppointmentCreateComponent implements OnInit {
    public userList: any[] = [];
    public leads: any[] = [];
    public appointmentDetails: any;
    appoint_flag = false;
    public sourceList: any[] = [];
    public apptm_id: any;
    public appflag: boolean = true;
    public createFlag: boolean = false;
    public today: any = this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '';
    public socialMediaCampaignList: any[] = [];
    public socialMediaSourceList: any[] = [];
    timeSlots: any = [];
    // minTime: string | null = null;
    timeConfig: FlatpickrOptions;
    dateConfig: FlatpickrOptions;
    @Output() modalEvent = new EventEmitter<boolean>();
    constructor(public router: Router, private userServices: StaffPostAuthService, public datepipe: DatePipe) {
        this.dateConfig = {
            dateFormat: 'Y-m-d',
            minDate: new Date(),
        };
        this.appointmentDetails = {
            cust_name: '',
            phone: '',
            apptm_group: '1',
            appt_date: '',
            appt_time: '',
        };

        this.timeConfig = {
            enableTime: true,
            noCalendar: true, // Disable date selection
            time_24hr: true, // Display time in 24-hour format
        };

        this.userServices.userList().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.userList = rData.userList;
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
    }
    ngOnInit() {}

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

    // createTimeSlots(intervalMinutes: any) {
    //     const timeSlots = [];
    //     let startTime = new Date(0, 0, 0, 0, 0, 0); // Start at midnight

    //     // Limit the loop to a maximum of 96 iterations (24 hours * 4 slots per hour)
    //     for (let i = 0; i < 96; i++) {
    //         const timeSlotStart = new Date(startTime);
    //         startTime.setMinutes(startTime.getMinutes() + intervalMinutes);
    //         const timeSlotEnd = new Date(startTime);
    //         timeSlotEnd.setMinutes(timeSlotEnd.getMinutes() - intervalMinutes);

    //         // Format time slots as strings (adjust format as needed)
    //         const formattedStart = timeSlotStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    //         const formattedEnd = timeSlotEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    //         timeSlots.push(`${formattedStart}`);
    //     }

    //     return timeSlots;
    // }

    // calculateMinTime(): string {
    //     const now = new Date();
    //     const appointmentDate = new Date(this.appointmentDetails.appt_date);
    //     if (
    //         now.getFullYear() === appointmentDate.getFullYear() &&
    //         now.getMonth() === appointmentDate.getMonth() &&
    //         now.getDate() === appointmentDate.getDate()
    //     ) {
    //         console.log('Appointment is Today>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    //         const currentHour = now.getHours();
    //         const currentMinutes = now.getMinutes();
    //         const minHour = currentHour + 1;
    //         const minMinutes = currentMinutes;
    //         return `${minHour.toString().padStart(2, '0')}:${minMinutes.toString().padStart(2, '0')}`;
    //     } else {
    //         console.log('Appointment is NOT Today??????????????????????????????????????');
    //         return '00:00';
    //     }
    // }

    createAppointment(data: any) {
        this.appflag = true;
        this.createFlag = true;
        if (data['appt_date'] != '') {
            let datevalD = new Date(data['appt_date']);
            data['appt_date'] = datevalD.getFullYear() + '-' + ('0' + (datevalD.getMonth() + 1)).slice(-2) + '-' + ('0' + datevalD.getDate()).slice(-2);
        }

        if (this.appointmentDetails.phone == null || this.appointmentDetails.phone == '') {
            this.appflag = false;
            this.createFlag = false;
            this.coloredToast('danger', 'Customer Number Required');
        } else if (/\D/.test(this.appointmentDetails.phone)) {
            this.coloredToast('danger', 'Customer Number should be only numbers');
            this.appflag = false;
            this.createFlag = false;
        }

        // else if (this.appointmentDetails.cust_name == null || this.appointmentDetails.cust_name == '') {
        //     this.appflag = false;
        //     this.coloredToast('danger', 'Customer Name Required');
        // }
        else if (this.appointmentDetails.source == null || this.appointmentDetails.source == '') {
            this.appflag = false;
            this.createFlag = false;
            this.coloredToast('danger', 'Select An Appointment Source');
        } else if (this.appointmentDetails.apptm_group == null || this.appointmentDetails.apptm_group == '') {
            this.appflag = false;
            this.createFlag = false;
            this.coloredToast('danger', 'Select An Appointment Type');
        } else if (this.appointmentDetails.appt_date == null || this.appointmentDetails.appt_date == '') {
            this.appflag = false;
            this.createFlag = false;
            this.coloredToast('danger', 'Schedule An Appointment Date');
        } else if (this.appointmentDetails.appt_time == null || this.appointmentDetails.appt_time == '') {
            this.appflag = false;
            this.createFlag = false;
            this.coloredToast('danger', 'Schedule An Appointment Time');
        } else if (this.appointmentDetails.appt_assign_to == null || this.appointmentDetails.appt_assign_to == '') {
            this.appflag = false;
            this.createFlag = false;
            this.coloredToast('danger', 'A staff should be assigned ');
        } else if (this.appointmentDetails.appt_note == null || this.appointmentDetails.appt_note == '') {
            this.appflag = false;
            this.createFlag = false;
            this.coloredToast('danger', 'Customer Remark should be provided');
        }

        if (this.appointmentDetails.source == '2') {
            if (this.appointmentDetails.social_media_source == '' || this.appointmentDetails.social_media_source == null) {
                this.appflag = false;
                this.createFlag = false;
                this.coloredToast('danger', 'Social Media Source Required');
            }
        }
        if (this.appointmentDetails.social_media_source != '' && this.appointmentDetails.social_media_source != null && this.appointmentDetails.source == '2') {
            if (this.appointmentDetails.social_media_camp == '' || this.appointmentDetails.social_media_camp == null) {
                this.appflag = false;
                this.createFlag = false;
                this.coloredToast('danger', 'Social Media Campaign  Required');
            }
        }

        if (this.appflag && this.createFlag) {
            this.userServices.createAppointment(data).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    this.modalEvent.emit();
                } else {
                }
            });
        }
    }

    getSocialMediaCampaign(source: any) {
        this.socialMediaCampaignList = [];
        this.timeSlots = [];
        this.timeSlots = this.createTimeSlots(new Date(this.appointmentDetails.appt_date));
        // this.timeConfig = {
        //     enableTime: true,
        //     noCalendar: true, // Disable date selection
        //     time_24hr: true, // Display time in 24-hour format
        //     minTime: this.calculateMinTime(),
        // };

        console.log('this.timeSlots>>>>>>>>>>>>>>> ', this.timeSlots);

        if (source == '2') {
            let data = {
                today: this.today,
            };
            this.userServices.getActiveSocialMediaCampaigns(data).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    this.socialMediaCampaignList = rdata.activeCampaigns.map((campaign: any) => ({
                        ...campaign,
                        displayLabel: `${campaign.smc_message}(${campaign.smc_name})`,
                    }));
                } else {
                    this.socialMediaCampaignList = [];
                }
            });
        } else {
            this.appointmentDetails.social_media_camp = null;
            this.appointmentDetails.social_media_source = null;
        }
    }

    getSocialMediaCampaignSource(camp_source: any) {
        const foundCampaign = this.socialMediaCampaignList.find((campaign) => campaign.smc_id == camp_source);
        if (foundCampaign) {
            this.appointmentDetails.social_media_source = foundCampaign.smc_source;
        }
    }

    checkExistigCust(phone: any) {
        if (/\D/.test(phone)) {
            this.coloredToast('danger', 'Customer Number should be only numbers');
            this.appflag = false;
        } else {
            this.appflag = true;
            if (phone.length >= 9) {
                this.userServices.isExistingCustOrNot({ phone }).subscribe((rdata: any) => {
                    if (rdata.ret_data == 'success') {
                        this.appointmentDetails.cust_name = rdata.customer.cust_name;
                        this.leads = rdata.leads;
                        if (this.leads.length > 0 && this.leads[0].purpose_id == '1') {
                            this.appoint_flag = true;
                            this.apptm_id = this.leads[0].apptm_id;
                        }
                    } else {
                    }
                });
            } else {
            }
        }
    }

    viewAppointmentDetails() {
        this.router.navigateByUrl('leads/appointment/appointment-details/' + btoa(this.apptm_id));
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
