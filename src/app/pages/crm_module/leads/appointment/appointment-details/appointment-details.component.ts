import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-appointment-details',
    templateUrl: './appointment-details.component.html',
    styleUrls: ['./appointment-details.component.css'],
})
export class AppointmentDetailsComponent implements OnInit {
    public appointmentId: string;
    public load_flag: boolean = true;
    public customerNumber: boolean = true;
    public userList: any[] = [];
    public appointmentDetails: any;
    public appointmentLogs: any[] = [];
    jobno: any;
    public appointmentCount: number = 0;
    public newStatus: string = '0';
    public basic: FlatpickrOptions;
    public appointmentUpdate: FormGroup;

    constructor(
        public router: Router,
        private userServices: StaffPostAuthService,
        public datepipe: DatePipe,
        private activeRouter: ActivatedRoute,
        private fb: FormBuilder
    ) {
        this.appointmentId = atob(this.activeRouter.snapshot.paramMap.get('id') || '');
        this.userServices.userList().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.userList = rData.userList;
            }
        });

        this.basic = {
            dateFormat: 'Y-m-d',
            minDate: new Date(),
        };
        this.appointmentUpdate = this.fb.group({
            rescheduleDate: [null],
            rescheduleTime: [null],
            rescheduleAssignee: [null],
            reschedulePickDrop: [null],
            confirmJobNo: [null],
            cancelReason: [null],
            appointment_status: [null],
            appointment_id: [null],
            appointment_lead: [null],
            customer_name: [null],
            register_number: [null],
            alternate_no: [null],
        });
    }
    ngOnInit() {
        this.getAppointmentDetails();
    }

    statuschange() {
        if (this.newStatus == '5') {
            this.userServices.getJobNumbers().subscribe((rData: any) => {
                if (rData.ret_data == 'success') {
                    this.jobno = rData.jobno;
                }
            });
        }
    }

    minDate(): string {
        const today = new Date();
        const year = today.getFullYear();
        let month = (today.getMonth() + 1).toString();
        month = month.length === 1 ? '0' + month : month;
        let day = today.getDate().toString();
        day = day.length === 1 ? '0' + day : day;
        return `${year}-${month}-${day}`;
    }

    getAppointmentDetails() {
        this.appointmentLogs = [];
        this.userServices.getAppointmentDetails({ apptm_id: this.appointmentId }).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.appointmentLogs = rData.log;
                this.appointmentDetails = rData.details;
                this.appointmentCount = rData.Appoints.length;

                if (this.appointmentDetails.apptm_group == '1' || this.appointmentDetails.apptm_group == '0') {
                    this.appointmentDetails['apptm_group_l'] = 'Normal';
                } else if (this.appointmentDetails.apptm_group == '2') {
                    this.appointmentDetails['apptm_group_l'] = 'Campaign';
                }

                if (this.appointmentDetails.customer_name != '' && this.appointmentDetails.customer_name != null) {
                    this.appointmentDetails['cust_name'] = this.appointmentDetails.customer_name;
                } else {
                    this.appointmentDetails['cust_name'] = this.appointmentDetails.name;
                }
                if (this.appointmentDetails.lphone != '' && this.appointmentDetails.lphone != null) {
                    this.appointmentDetails['call_from'] = this.appointmentDetails.lphone;
                } else {
                    this.appointmentDetails['call_from'] = this.appointmentDetails.cphone;
                }
                this.load_flag = false;
            } else {
                this.coloredToast('danger', "Could'nt fetch details, please try again later");
                this.load_flag = false;
            }
        });
    }

    updateAppointmentRegNo(regNo: any, leadId: any) {
        let data = {
            Reg_No: regNo,
            lead_id: leadId,
        };

        this.userServices.updateAppointmentRegNo(data).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.coloredToast('success', 'Registration Number Updated Successfully');
            }
        });
    }

    updateAppointmentDetails() {
        let submit_flag = true;
        if (this.newStatus == '3') {
            if (
                this.appointmentUpdate.controls['rescheduleDate'].value == null ||
                this.appointmentUpdate.controls['rescheduleTime'].value == null ||
                this.appointmentUpdate.controls['rescheduleAssignee'].value == null ||
                this.appointmentUpdate.controls['reschedulePickDrop'].value == null
            ) {
                this.coloredToast('danger', 'Please fill all the details for rescheduling');
                submit_flag = false;
            }
        } else if (this.newStatus == '4') {
            if (this.appointmentUpdate.controls['cancelReason'].value == null) {
                this.coloredToast('danger', 'Please enter cancelling reason');
                submit_flag = false;
            }
        } else if (this.newStatus == '5') {
            if (this.appointmentUpdate.controls['confirmJobNo'].value == null) {
                this.coloredToast('danger', 'Please enter job-card number');
                submit_flag = false;
            }
        }
        if (submit_flag == true) {
            this.appointmentUpdate.patchValue({
                appointment_status: this.newStatus,
                appointment_id: this.appointmentId,
                appointment_lead: this.appointmentDetails.apptm_lead_id,
                customer_name: this.appointmentDetails.cust_name,
                register_number: this.appointmentDetails.register_number,
                note: this.appointmentDetails.appt_note,
            });
            this.userServices.updateAppointmentDetails(this.appointmentUpdate.value).subscribe((rData: any) => {
                if (rData.ret_data == 'success') {
                    this.coloredToast('success', 'Appointment details updated successfully');
                    this.router.navigateByUrl('leads/appointment/appointment-list');
                }
            });
        }
    }

    checkCustomerNumber(phnumber: any, jobNo: any) {
        if (phnumber == null || jobNo == null || phnumber == '' || jobNo == '') {
            this.customerNumber = true;
        } else {
            this.jobno.forEach((element: any) => {
                if (element.job_no == jobNo) {
                    const phnumberLastNine = phnumber.slice(-9);
                    const elementPhoneLastNine = element.phone.slice(-9);
                    if (phnumberLastNine === elementPhoneLastNine) {
                        this.customerNumber = true;
                    } else {
                        this.appointmentUpdate.patchValue({
                            alternate_no: element.phone,
                        });
                        this.customerNumber = false;
                    }
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
