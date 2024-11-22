import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';
import { filter } from 'rxjs';

@Component({
    selector: 'app-whatsapp-settings',
    templateUrl: './whatsapp-settings.component.html',
    styleUrls: ['./whatsapp-settings.component.css'],
})
export class WhatsappSettingsComponent implements OnInit {
    // public firstFollowUpAlert: any;
    // public secondFollowUpAlert: any;
    // public thirdFollowUpAlert: any;
    // public fourthFollowUpAlert: any;
    // public fifthFollowUpAlert: any;
    // public firstFollowUpAlertType: any;
    // public secondFollowUpAlertType: any;
    // public thirdFollowUpAlertType: any;
    // public fourthFollowUpAlertType: any;
    // public fifthFollowUpAlertType: any;

    public userList: any = [];
    public selectedStaff: any;
    public selectedStaffHead: any;
    public selectedChatStaff: any = [];
    public selectedHeadStaff: any = [];
    public intervalType: any = [];
    public followUpTimes: any = [];
    public load_flag: boolean = true;
    public inboundFollowUpTimes: any = [];
    public outboundFollowUpTimes: any = [];
    public whatsapp_lead_reopen_hours: any;
    defaultUnit: any = 'Hours';

    constructor(private userServices: StaffPostAuthService, private cdRef: ChangeDetectorRef, public router: Router) {
        this.intervalType = [
            { id: '0', type: 'Minutes' },
            { id: '1', type: 'Hours' },
            { id: '2', type: 'Day' },
        ];

        this.userServices.userList().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.userList = rdata.userList;
            }
        });

        this.getLeadReopenHours();
    }

    ngOnInit(): void {
        this.getFollowUpAlertTime();
    }

    getFollowUpAlertTime() {
        this.inboundFollowUpTimes = [];
        this.outboundFollowUpTimes = [];
        this.selectedChatStaff = [];
        this.selectedHeadStaff = [];
        this.followUpTimes = [];

        this.userServices.getFollowUpAlertTime().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.followUpTimes = rdata.followUpTimes;
                this.inboundFollowUpTimes = rdata.followUpTimes.filter((msg: any) => msg.wb_msg_fut_type === '0');
                this.outboundFollowUpTimes = rdata.followUpTimes.filter((msg: any) => msg.wb_msg_fut_type === '1');
                this.selectedChatStaff = rdata.staffs.filter((staff: any) => staff.was_assigned_staff_type === '0');
                this.selectedHeadStaff = rdata.staffs.filter((staff: any) => staff.was_assigned_staff_type === '1');
                this.load_flag = false;
            } else {
                this.load_flag = false;
            }
        });
    }

    updateFollowUpAlertTime(time: any, interval: any, id: any) {
        let data = {
            followUpAlertTime: time,
            followUpAlertInterval: interval,
            wb_msg_fut_id: id,
        };

        this.userServices.updateWhatsAppMessageExpiration(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.coloredToast('success', 'Follow Up Time Updated Successfully');
                this.getFollowUpAlertTime();
            } else {
                this.coloredToast('danger', 'Some error occurred, please try again');
            }
        });
    }

    addStaffToWhatsapp(value: any, staffId: any) {
        let data = {
            staff_id: staffId,
            type: value,
        };

        this.userServices.addStaffToWhatsapp(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.coloredToast('success', 'Staff Assigned Successfully');
                this.getFollowUpAlertTime();
            } else {
                this.coloredToast('danger', 'Some error occurred, please try again');
            }
        });
    }

    deleteAssignedStaff(staffData: any) {
        Swal.fire({
            icon: 'warning',
            title: 'You are about to delete a Assigned Staff, Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            padding: '2em',
            customClass: 'sweet-alerts',
        }).then((result) => {
            if (result.value) {
                let item = {
                    was_id: staffData.was_id,
                };
                this.userServices.deleteWhatsappAssignedStaff(item).subscribe((rdata: any) => {
                    if (rdata.ret_data === 'success') {
                        this.coloredToast('success', 'Assigned Staff Deleted Successfully');
                        this.getFollowUpAlertTime();
                    } else {
                        this.coloredToast('danger', 'Some error occurred, please try again');
                    }
                });
            }
        });
    }

    getOrdinalLabel(index: number): string {
        const ordinals = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'];
        return ordinals[index] || index + 1 + 'th'; // Add more if needed, or default to nth form
    }

    getPreviousItem(i: number) {
        if (i === 0 && this.inboundFollowUpTimes.length > 0) {
            // Use the last item from inboundFollowUpTimes for the first outbound item
            const lastInboundItem = this.inboundFollowUpTimes[this.inboundFollowUpTimes.length - 1];
            const lastInterval = this.intervalType.find((item: any) => item.id === lastInboundItem.was_mfut_interval)?.type || 'minute';
            return `${lastInboundItem.wb_msg_fut_time} ${lastInterval}`;
        } else if (i > 0) {
            // Use the previous item from outboundFollowUpTimes for subsequent items
            const prevItem = this.outboundFollowUpTimes[i - 1];
            const prevInterval = this.intervalType.find((item: any) => item.id === prevItem.was_mfut_interval)?.type || 'minute';
            return `${prevItem.wb_msg_fut_time} ${prevInterval}`;
        }
        return ''; // Default case if no valid previous item exists
    }

    getLeadReopenHours() {
        this.userServices.getWhatsappLeadReOpenHours().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.whatsapp_lead_reopen_hours = rdata.leadReopenHours.whatsapp_lead_reopen_hours;
            }
        });
    }

    updateLeadReopenHours(hours: any) {
        let data = {
            whatsapp_lead_reopen_hours: hours,
        };

        this.userServices.updateWhatsappLeadReOpenHours(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.getLeadReopenHours();
                this.coloredToast('success', 'Whatsapp Leads Reopen Hours Updated Successfully');
            } else {
                this.coloredToast('danger', 'Some error occurred, please try again');
            }
        });
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
