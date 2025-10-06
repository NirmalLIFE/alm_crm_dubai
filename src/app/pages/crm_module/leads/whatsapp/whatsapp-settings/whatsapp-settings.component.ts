import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';
import { filter } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
    public whatsapp_auto_msg_hours: any;
    defaultUnit: any = 'Hours';

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
    customerNumber: any;
    public messageNames: any = [];
    messageNameId: any = '1';

    constructor(
        private userServices: StaffPostAuthService,
        private cdRef: ChangeDetectorRef,
        public router: Router,
        private activeRouter: ActivatedRoute,
        private sanitizer: DomSanitizer
    ) {
        this.userId = this.activeRouter.snapshot.paramMap.get('id') || '';
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

        this.messageNames = [{ id: '1', name: 'Non Working Hour Message' }];

        this.getLeadReopenHours();
    }

    ngOnInit(): void {
        this.getFollowUpAlertTime();
        this.getAwayMessage();
    }

    activeTab: 'config' | 'design' = 'config';

    setTab(tab: 'config' | 'design') {
        this.activeTab = tab;
    }

    get isTooLong(): boolean {
        return this.messageText.length > 248;
    }

    leaveAmessage: string = `💬 You can leave your message below.<br>
📝 Please include any relevant details such as the service you need, preferred timing, or your vehicle details. This will help us assist you more efficiently.<br>
⏰ One of our team members will get back to you during working hours.

<b>Thank you for your patience!</b>
`;

    workingHours: string = `Working Hours:

Monday - Thursday:
<b>⏰ 8:00 AM to 2:15 PM
⏰ 2:15 PM to 7:00 PM</b>

Friday:
<b>⏰ 8:00 AM to 12:30 PM
⏰ 2:15 PM to 7:00 PM</b>

Saturday:
<b>⏰ 8:00 AM to 2:15 PM
⏰ 2:15 PM to 7:00 PM</b>
`;

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

    getAwayMessage() {
        this.userServices.getAwayMessage().subscribe({
            next: (res: any) => {
                if (res.ret_data === 'success') {
                    this.messageTypes = res.data.map((m: any) => ({
                        id: m.wamc_id,
                        name: m.wamc_message_id,
                        content: m.wamc_message_content,
                    }));
                    this.messageTypeId = this.messageTypes[0].id;
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

    insertVariable(variable: string) {
        const textarea: HTMLTextAreaElement = document.querySelector('textarea')!;
        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;

        this.messageText = this.messageText.substring(0, startPos) + variable + this.messageText.substring(endPos);

        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = startPos + variable.length;
            textarea.focus();
        }, 0);
    }

    get formattedMessage(): SafeHtml {
        // Replace *something* with <strong>something</strong>
        let html = this.messageText.replace(/\*(.*?)\*/g, '<strong>$1</strong>');

        if (this.messageTypeId == 1) {
            html += '<br><br>📅 Book Appointment<br>💬 Leave a Message<br>🕒 View Working Hours';
        }
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }

    countryCode: string = '+971';

    isNumberValid(): boolean {
        if (!this.customerNumber) return false;
        const len = this.customerNumber.length;
        return (this.countryCode === '+971' && len === 9) || (this.countryCode === '+91' && len === 10);
    }
    onNumberInput(event: any) {
        this.customerNumber = event.target.value.replace(/[^0-9]/g, '');
    }

    sendCheckMessage() {
        if (!this.isNumberValid()) return;
        let custNumber = `${this.countryCode}${this.customerNumber}`;
        let msgContent = this.messageText;

        const data = {
            custNumber: custNumber,
            msgContent: msgContent,
        };
        // console.log('Sending message to:', custNumber);
        // console.log('Sending message to:', msgContent);

        // call your API here

        this.userServices.testMessageSend(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.coloredToast('success', 'Message send Succesfully.');
            } else {
                this.coloredToast('danger', 'Failed to sent message.');
            }
        });
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
                this.whatsapp_auto_msg_hours = rdata.leadReopenHours.whatsapp_auto_msg_hours;
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

    updateAutoMessageHours(hours: any) {
        let data = {
            whatsapp_auto_msg_hours: hours,
        };

        this.userServices.updateWhatsappAutoMessageHours(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.getLeadReopenHours();
                this.coloredToast('success', 'Non-Working Hours Auto Reply Updated Successfully');
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
