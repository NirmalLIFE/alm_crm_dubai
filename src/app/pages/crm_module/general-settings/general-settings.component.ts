import { Component, OnInit } from '@angular/core';
import { CheckboxRequiredValidator, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { messagesDict } from 'ngx-tippy-wrapper/lib/consts';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-general-settings',
    templateUrl: './general-settings.component.html',
    styleUrls: ['./general-settings.component.css'],
})
export class GeneralSettingsComponent implements OnInit {
    public permittedAction: any[] = [];
    public userList: any[] = [];
    public load_flag: boolean = true;
    public psf_flag: boolean = false;
    activeTab = 'home';

    public workStart: string = '08:00';
    public workEnd: string = '20:00';
    public missedBuffer: string = '00:00';
    public landLineInclude: boolean = false;
    public verificationNumber: string = '';
    public bufferMask = [/\d/, /\d/, ':', /\d/, /\d/];
    public partsMargin: any;
    public partsMarginFlag: boolean = true;

    public numberChangeFlag: boolean = true;
    public landLineFlag: boolean = false;
    public workTimeFlag: boolean = false;
    public bufferChangeFlag: boolean = true;

    public psf_forms: FormGroup;
    public psf_allowed_flag: boolean = true;
    public psf_buffer_flag: boolean = true;

    public selectedThirdDayStaff: any[] = [];
    public selectedTenthDayStaffs: any[] = [];
    public selectedStaff: any = null;
    public selectedTenthDayStaff: any = null;

    //spare parts Margin
    public sparePartsMargin: any[] = [];
    public roleList: any[] = [];
    public user_role: any = {
        role_id: null,
        minimum_margin: null,
        maximum_margin: null,
    };
    public userRoleMargins: any = [];
    public userRoleMarginLimit: any = [];
    public update_flag: boolean = false;

    //Service Remainder Campaigns
    public serviceRemainderDaysPhase1: any;
    public serviceRemainderDaysPhase2: any;
    public serviceRemainderDaysPhase3: any;
    public intervalType: any = [];
    public interval: any = '2';

    ruleName = 'Away Message';
    // automation-rule.component.ts
    messageTypes = [{ id: '1', name: '', content: '' }];

    // default selection
    messageTypeId: any;
    active = true;
    triggerEvent = 'User Connected';
    delay = '01';
    messageText = '';
    previewMessage: string = '';

    selectedMessageId: string = ''; 
    userId: any;

    constructor(private userServices: StaffPostAuthService, private fb: FormBuilder,private activeRouter: ActivatedRoute,
    ) {
        this.userId = this.activeRouter.snapshot.paramMap.get('id') || '';
        JSON.parse(atob(atob(localStorage.getItem('access_data') || '{}'))).forEach((element: any) => {
            if (element['ft_id'] == 21) {
                this.permittedAction = element['actions'];
            } else if (element['ft_id'] == 36) {
                this.psf_flag = true;
            }
        });
        this.psf_forms = this.fb.group({
            psf_allowed_days: ['0', [Validators.required, Validators.pattern('[1-9]+')]],
            psf_buffer_days: ['0', [Validators.required, Validators.pattern('[1-9]+')]],
            psf_assign_type: ['0'],
            type: ['0'],
            psf_feedback_assign_days: [''],
            psf_feedback_assign_days_after_sa: [''],
        });
        this.intervalType = [
            { id: '0', type: 'Minutes' },
            { id: '1', type: 'Hours' },
            { id: '2', type: 'Days' },
        ];
    }

    workshopDays = [
        { name: 'Monday', start: '', noonStart: '', noonEnd: '', end: '', open: true },
        { name: 'Tuesday', start: '', noonStart: '', noonEnd: '', end: '', open: true },
        { name: 'Wednesday', start: '', noonStart: '', noonEnd: '', end: '', open: true },
        { name: 'Thursday', start: '', noonStart: '', noonEnd: '', end: '', open: true },
        { name: 'Friday', start: '', noonStart: '', noonEnd: '', end: '', open: true },
        { name: 'Saturday', start: '', noonStart: '', noonEnd: '', end: '', open: true },
        { name: 'Sunday', start: '', noonStart: '', noonEnd: '', end: '', open: false },
    ];

    updateWorkshopTiming() {
        const payload = { workshopDays: this.workshopDays };
        console.log('Updated!', payload);
        this.userServices.updateWorkshopDays(payload).subscribe((rData: any) => {
            if (rData.ret_data === 'success') {
                this.coloredToast('success', 'Working days Updated Successfully.');
            } else {
                this.coloredToast('danger', 'Failed to update Working days.');
            }
        });
    }

    getWorksdaysTiming() {
        this.userServices.getWorksdaysTiming().subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.workshopDays = rdata.workdays;
            }
        });
        this.getSelectedDates();
    }

    ngOnInit(): void {
        this.userServices.userRoleList().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.roleList = rData.roleList;
            }
        });
        this.userServices.getCommonSettings().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.workStart = rData.settings.working_time_start;
                this.workEnd = rData.settings.working_time_end;
                this.missedBuffer = rData.settings.mis_buffer_time;
                this.landLineInclude = rData.settings.landline_include_status == '1' ? true : false;
                this.verificationNumber = rData.settings.verification_number;
                this.partsMargin = rData.settings.parts_margin;
                this.load_flag = false;
            } else {
                this.load_flag = false;
                this.coloredToast('danger', 'Cant fetch details, Some error occurred please try again');
            }
        });
        this.getPSFSettingsData();
        this.userServices.userList().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.userList = rdata.userList;
            }
        });
        this.userServices.getServiceRemainderDays().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.serviceRemainderDaysPhase1 = rdata.serviceRemainderDays.first_service_remainder_days;
                this.serviceRemainderDaysPhase2 = rdata.serviceRemainderDays.second_service_remainder_days;
                this.serviceRemainderDaysPhase3 = rdata.serviceRemainderDays.third_service_remainder_days;
            }
        });
        this.getSparePartsMargin();
    }

    getPSFSettingsData() {
        this.userServices.retrievePSFSettingsData().subscribe((rdata: any) => {
            if ((rdata.ret_data = 'success')) {
                this.psf_forms.patchValue({
                    psf_allowed_days: rdata.psf_data.psf_allowed_days,
                    psf_assign_type: rdata.psf_data.psf_assign_type,
                    psf_buffer_days: rdata.psf_data.psf_buffer_days,
                    psf_feedback_assign_days: rdata.psf_data.psf_feedback_assign_days,
                    psf_feedback_assign_days_after_sa: rdata.psf_data.psf_feedback_assign_days_after_sa,
                });
                this.selectedThirdDayStaff = rdata.psf_staff.filter((data: any) => data.psfs_psf_type == '0');
                this.selectedTenthDayStaffs = rdata.psf_staff.filter((data: any) => data.psfs_psf_type == '1');
            } else {
                this.coloredToast('danger', 'Some error occurred please try again');
            }
        });
    }

    updateVerificationNumber() {
        if (this.verificationNumber.length > 9) {
            this.numberChangeFlag = true;
            this.userServices.addVerificationNumber({ number: this.verificationNumber }).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    this.coloredToast('success', 'Verification Number updated successfully');
                } else {
                    this.coloredToast('danger', 'Some error occurred please try again');
                }
            });
        } else {
            this.numberChangeFlag = true;
            this.coloredToast('danger', 'Enter valid mobile number');
        }
    }

    addNewMargin() {
        let newMargin = {
            spm_start_price: 0,
            spm_end_price: 0,
            spm_price: 0,
        };
        this.sparePartsMargin.push(newMargin);
    }

    numberEditDetection() {
        this.numberChangeFlag = false;
    }

    bufferEditDetection() {
        this.bufferChangeFlag = false;
    }
    partsMarginEditDetection() {
        this.partsMarginFlag = false;
    }

    psfInputChange(type: number) {
        type == 0 ? (this.psf_allowed_flag = false) : (this.psf_buffer_flag = false);
    }

    updatePSFDays(type: number) {
        if (this.psf_forms.controls['psf_allowed_days'].value != '' && this.psf_forms.controls['psf_buffer_days'].value != '') {
            this.psf_forms.patchValue({
                type: type,
            });
            this.psf_allowed_flag = true;
            this.psf_buffer_flag = true;
            this.userServices.updateMaxPSFDays(this.psf_forms.value).subscribe((rdata: any) => {
                if ((rdata.ret_data = 'success')) {
                    this.coloredToast('success', 'PSF allowed days & buffer days updated');
                } else {
                    this.coloredToast('danger', 'Some error occurred please try again');
                }
            });
        } else if (this.psf_forms.controls['psf_feedback_assign_days'].value != '' && type == 2) {
            this.psf_forms.patchValue({
                type: type,
            });
            this.userServices.updateMaxPSFDays(this.psf_forms.value).subscribe((rdata: any) => {
                if ((rdata.ret_data = 'success')) {
                    this.coloredToast('success', 'PSF feedback assign days updated');
                } else {
                    this.coloredToast('danger', 'Some error occurred please try again');
                }
            });
        } else if (this.psf_forms.controls['psf_feedback_assign_days_after_sa'].value != '' && type == 3) {
            this.psf_forms.patchValue({
                type: type,
            });
            this.userServices.updateMaxPSFDays(this.psf_forms.value).subscribe((rdata: any) => {
                if ((rdata.ret_data = 'success')) {
                    this.coloredToast('success', 'PSF feedback assign days updated');
                } else {
                    this.coloredToast('danger', 'Some error occurred please try again');
                }
            });
        } else {
            this.coloredToast('danger', 'Please fill allowed days & not driven buffer');
        }
    }

    addStaffToPSF(type: number) {
        if (type == 0) {
            if (this.selectedStaff != 0) {
                let filtered_array = this.selectedThirdDayStaff.filter((data) => data.psfs_assigned_staff == this.selectedStaff);
                if (filtered_array.length > 0) {
                    this.coloredToast('danger', 'Error!!! Staff already assigned');
                } else {
                    let data = {
                        psf_type: type,
                        psf_assigned_staff: this.selectedStaff,
                    };
                    this.userServices.assignPSFStaff(data).subscribe((rdata: any) => {
                        if ((rdata.ret_data = 'success')) {
                            this.selectedStaff = null;
                            this.getPSFSettingsData();
                            this.coloredToast('success', 'Success!!! staff added successfully');
                        } else {
                            this.coloredToast('danger', 'Some error occurred please try again');
                        }
                    });
                }
            } else {
                this.coloredToast('danger', 'Please choose a staff');
            }
        } else if (type == 1) {
            if (this.selectedTenthDayStaff != 0) {
                let filtered_array = this.selectedTenthDayStaffs.filter((data) => data.psfs_assigned_staff == this.selectedTenthDayStaff);
                if (filtered_array.length > 0) {
                    this.coloredToast('danger', 'Error!!! Staff already assigned');
                } else {
                    let data = {
                        psf_type: type,
                        psf_assigned_staff: this.selectedTenthDayStaff,
                    };
                    this.userServices.assignPSFStaff(data).subscribe((rdata: any) => {
                        if ((rdata.ret_data = 'success')) {
                            this.selectedTenthDayStaff = null;
                            this.getPSFSettingsData();
                            this.coloredToast('success', 'Success!!! staff added successfully');
                        } else {
                            this.coloredToast('danger', 'Some error occurred please try again');
                        }
                    });
                }
            } else {
                this.coloredToast('danger', 'Error!!! Please choose a staff');
            }
        }
    }
    deleteAssignedStaff(staffData: any) {
        this.userServices.removePSFStaff(staffData).subscribe((rdata: any) => {
            if ((rdata.ret_data = 'success')) {
                this.getPSFSettingsData();
                this.coloredToast('success', 'Staff removed successfully');
            } else {
                this.coloredToast('danger', 'Some error occurred please try again');
            }
        });
    }

    updateMissedCallBuffer() {
        this.bufferChangeFlag = true;
        this.userServices.updateMissedCallBufferTime({ bTime: this.missedBuffer }).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.coloredToast('success', 'Verification Number updated successfully');
            } else {
                this.coloredToast('danger', 'Some error occurred please try again');
            }
        });
    }
    updatePartsMargin() {
        this.partsMarginFlag = true;
        this.userServices.updatePartsMargin({ margin: this.partsMargin }).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.coloredToast('success', 'Parts Margin updated successfully');
            } else {
                this.coloredToast('danger', 'Some error occurred please try again');
            }
        });
    }

    onLandlineLogChange() {
        this.landLineFlag = true;
        this.userServices.changeLandlineIncludeStatus({ instatus: this.landLineInclude }).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.coloredToast('success', 'Updated land line include status');
                this.landLineFlag = false;
            } else {
                this.coloredToast('danger', 'Something went wrong,please try again later');
                this.landLineFlag = false;
            }
        });
    }

    updateWOrkshopTiming() {
        this.workTimeFlag = true;
        let data = {
            starttime: this.workStart,
            endtime: this.workEnd,
        };
        this.userServices.updateWOrkshopTiming(data).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.coloredToast('success', 'Workshop Timing Updated Successfully');
                this.workTimeFlag = false;
            } else {
                this.coloredToast('danger', 'Something went wrong,please try again later');
                this.workTimeFlag = false;
            }
        });
    }

    updateAssignStatus() {
        this.userServices.updatePSFMethod({ psf_assign_type: this.psf_forms.controls['psf_assign_type'].value }).subscribe((rdata: any) => {
            if ((rdata.ret_data = 'success')) {
                this.getPSFSettingsData();
                this.coloredToast('success', 'Assign type changed successfully');
            } else {
                this.coloredToast('danger', 'Some error occurred please try again');
            }
        });
    }

    getSparePartsMargin() {
        this.userServices.getSparePartsMargin().subscribe((rdata: any) => {
            if ((rdata.ret_data = 'success')) {
                this.sparePartsMargin = rdata.sparePartsMargin;
            } else {
                this.coloredToast('danger', 'Some error occurred please try again');
            }
        });
        this.getUserRoleMargin();
        this.getWorksdaysTiming();
    }

    savePartsMargin(data: any) {
        this.userServices.saveSparePartsMargin({ sparepartsmargin: data }).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.coloredToast('sucess', 'Spare Parts Margin Saved Successfully');
                this.getSparePartsMargin();
            } else {
                this.coloredToast('danger', 'Some error occurred, please try again');
            }
        });
    }

    deleteSpareMargin(item: any) {
        Swal.fire({
            icon: 'warning',
            title: 'You are about to delete a Spare Parts Margin, Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            padding: '2em',
            customClass: 'sweet-alerts',
        }).then((result) => {
            if (result.value) {
                //deleteSparePartsMargin
                if (item.spm_id) {
                    item.spm_delete_flag = 1;
                    this.userServices.deleteSparePartsMargin(item).subscribe((rdata: any) => {
                        if (rdata.ret_data === 'success') {
                            this.coloredToast('sucess', 'Spare Parts Margin Deleted Successfully');
                            this.getSparePartsMargin();
                        } else {
                            this.coloredToast('danger', 'Some error occurred, please try again');
                        }
                    });
                    // this.sparePartsMargin = this.sparePartsMargin.filter((element) => element.spm_delete_flag !== 1);
                } else {
                    this.sparePartsMargin = this.sparePartsMargin.filter((element) => {
                        if (
                            element.spm_start_price === item.spm_start_price &&
                            element.spm_end_price === item.spm_end_price &&
                            element.spm_price === item.spm_price
                        ) {
                            return false;
                        } else {
                            return true;
                        }
                    });
                }
            }
        });
    }

    saveUserRoleMargin(user_role: any) {
        this.userServices.saveUserRoleMargin(user_role).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.coloredToast('success', 'User Role Margin Saved Successfully');
                this.getUserRoleMargin();
                this.user_role = {
                    role_id: null,
                    minimum_margin: null,
                    maximum_margin: null,
                };
                this.update_flag = false;
            } else {
                this.coloredToast('danger', 'Some error occurred, please try again');
            }
        });
    }

    getUserRoleMargin() {
        this.userServices.getUserRoleMargin().subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.userRoleMargins = rdata.userRoleMargins;
            } else {
                this.coloredToast('danger', 'Some error occurred, please try again');
            }
        });
    }

    getUserRoleMarginLimit(role_id: any) {
        this.update_flag = false;
        this.userServices.getUserRoleMarginLimit({ ml_role_id: role_id }).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.userRoleMarginLimit = rdata.userRoleMargin;
                if (this.userRoleMarginLimit) {
                    this.update_flag = true;
                    this.user_role.minimum_margin = this.userRoleMarginLimit.ml_minimum_margin;
                    this.user_role.maximum_margin = this.userRoleMarginLimit.ml_maximum_margin;
                } else {
                    this.update_flag = false;
                    this.user_role.minimum_margin = null;
                    this.user_role.maximum_margin = null;
                }
            } else {
                this.update_flag = false;
            }
        });
    }

    deleteUserRoleMargin(item: any) {
        Swal.fire({
            icon: 'warning',
            title: 'You are about to delete a User Role Margin Limit, Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            padding: '2em',
            customClass: 'sweet-alerts',
        }).then((result) => {
            if (result.value) {
                //deleteUserRoleMarginLimit
                item.ml_id = 1;
                this.userServices.deleteUserRoleMargin(item).subscribe((rdata: any) => {
                    if (rdata.ret_data === 'success') {
                        this.coloredToast('sucess', 'User Role Margin Limit Deleted Successfully');
                        this.getUserRoleMargin();
                    } else {
                        this.coloredToast('danger', 'Some error occurred, please try again');
                    }
                });
            }
        });
    }

    updateServiceRemainderDays(phase: any) {
        let data = {
            service_remainder_days: null,
            phase: phase,
        };

        switch (phase) {
            case 1:
                data.service_remainder_days = this.serviceRemainderDaysPhase1;
                break;
            case 2:
                data.service_remainder_days = this.serviceRemainderDaysPhase2;
                break;
            case 3:
                data.service_remainder_days = this.serviceRemainderDaysPhase3;
                break;
            default:
                return;
        }

        const suffix = phase === 1 ? 'st' : phase === 2 ? 'nd' : phase === 3 ? 'rd' : 'th';
        this.userServices.updateServiceRemainderDays(data).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.coloredToast('success', `${phase}${suffix} serviceRemainderDays Updated Successfully`);
                this.userServices.getServiceRemainderDays().subscribe((rdata: any) => {
                    if (rdata.ret_data == 'success') {
                        this.serviceRemainderDaysPhase1 = rdata.serviceRemainderDays.first_service_remainder_days;
                        this.serviceRemainderDaysPhase2 = rdata.serviceRemainderDays.second_service_remainder_days;
                        this.serviceRemainderDaysPhase3 = rdata.serviceRemainderDays.third_service_remainder_days;
                    }
                });
            } else {
                this.coloredToast('error', 'Failed to update service remainder days');
            }
        });
    }

    saveAwayMessage() {
        const payload = {
            messageText: this.messageText,
            messageId: this.selectedMessageId,
            userId: this.userId,
        };


        this.userServices.saveAwayMessage(payload).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.getAwayMessage();
                this.coloredToast('success', 'Message stored Successfully.');
            } else {
            }
        });
    }

    // general-settings.component.ts
    tempDate: string | null = null;
    selectedDates: string[] = [];

    addDate() {
        // Only add if a date is picked and not already in the list
        if (this.tempDate && !this.selectedDates.includes(this.tempDate)) {
            this.selectedDates.push(this.tempDate);
            this.tempDate = null; // clear the input
        }
    }

    removeDate(i: number) {
        this.selectedDates.splice(i, 1);
    }

    saveSelectedDays() {
        // TODO: send to backend via your service
        // Example: this.http.post('/api/special-days', { dates: this.selectedDates })
        console.log('Saving dates:', this.selectedDates);

        this.userServices.saveOffDays({ dates: this.selectedDates }).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.coloredToast('success', 'Dates saved Successfully.');
            } else {
                this.coloredToast('danger', 'Failed to store days');
            }
        });
    }

    getSelectedDates() {
        this.userServices.getOffDays().subscribe({
            next: (res: any) => {
                if (res.ret_data === 'success' && Array.isArray(res.dates)) {
                    this.selectedDates = res.dates;
                }
            },
            error: () => this.coloredToast('danger', 'Failed to load off days'),
        });
        // this.getAwayMessage();
    }

    getAwayMessage() {
        this.userServices.getAwayMessage().subscribe({
            next: (res: any) => {
                if (res.ret_data === 'success') {
                    this.messageTypes = res.data.map((m: any) => ({
                        id: m.wamc_id,
                        name: m.wamc_message_id,
                        content: m.wamc_message_content,
                    }));
                    this.selectedMessageId = this.messageTypes[0].id;
                    this.messageText = res.data[0].wamc_message_content;
                    this.previewMessage = res.data[0].wamc_message_content;
                }
            },
            error: () => this.coloredToast('danger', 'Failed to load off days'),
        });
    }

    onMessageTypeChange() {
        const msg = this.messageTypes.find((m) => m.id === this.messageTypeId);
        if (msg) {
            this.messageText = msg.content;
            this.previewMessage = msg.content;
        }
    }

    sampleValues: { [key: string]: string } = {
        name: 'John Doe',
        company: 'Al-Maraghi',
        email: 'john.doe@example.com',
        phone: '+91 98765 43210',
        service: 'Car Wash',
        date: '2025-09-22',
        time: '10:30 AM',
    };

    // get previewMessage(): string {
    //     let preview = this.messageText || 'Your message will appear here...';

    //     // Replace each {variable} with sample value
    //     for (const key in this.sampleValues) {
    //         const regex = new RegExp(`\\{${key}\\}`, 'g'); // match {name}, {company}, etc.
    //         preview = preview.replace(regex, this.sampleValues[key]);
    //     }
    //     return preview;
    // }

    insertVariable(variable: string) {
        const textarea: HTMLTextAreaElement = document.querySelector('textarea')!;
        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;

        this.messageText = this.messageText.substring(0, startPos) + variable + this.messageText.substring(endPos);

        // Move cursor after the inserted variable
        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = startPos + variable.length;
            textarea.focus();
        }, 0);
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
