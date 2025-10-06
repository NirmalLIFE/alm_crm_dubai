import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import { CountUpModule } from 'ngx-countup';

@Component({
    selector: 'app-service-remainder-report',
    templateUrl: './service-remainder-report.component.html',
    styleUrls: ['./service-remainder-report.component.css'],
})
export class ServiceRemainderReportComponent implements OnInit {
    [x: string]: any;
    public dateFrom: any = this.datePipe.transform(moment(new Date()).startOf('month').toDate(), 'yyyy-MM-dd') || '';
    public dateTo: any = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
    public search = '';
    public allCampaigns: any[] = [];
    public selectedCampaign: any = '0';
    public allcustomers: any[] = [];
    public totalCampaignMessageSent: any[] = [];
    public totalCampaignMessageDelivered: any[] = [];
    public totalCampaignMessageRead: any[] = [];
    public totalCampaignMessageFailed: any[] = [];
    public responseReceived: any[] = [];
    public load_flag: boolean = true;
    public jobOpenedCustomers: any[] = [];
    public percentageResponse: any = '0 %';
    public customerDetails: { mobile: string; message_date: string }[] = [];
    public apptCustomers: any[] = [];
    public apptCount: any;
    public originalCustomers: any;
    public appotCustomers: any;
    public firstReminderCust: any;
    public secondReminderCust: any;
    public thirdReminderCust: any;
    public selectedFilterIndex: any = 0;
    public secondServiceCust: any;
    public firstServiceCust: any;
    public thirdServiceCust: any;

    Fcustwithapp: any[] = [];
    Fcustwithoutapp: any[] = [];
    Fcustwithpendingapp: any[] = [];
    Scustwithapp: any[] = [];
    Scustwithoutapp: any[] = [];
    Scustwithpendingapp: any[] = [];
    Tcustwithapp: any[] = [];
    Tcustwithoutapp: any[] = [];
    Tcustwithpendingapp: any[] = [];

    cols = [
        { field: 'wb_cus_mobile', title: 'Number', hide: false },
        { field: 'wb_cus_name', title: 'Customer', hide: false },
        { field: 'campaign_type', title: 'Reminder Type', hide: false },
        { field: 'messaegStatus', title: 'Message Status' },
        { field: 'customer_responded', title: 'Response', hide: false },
        { field: 'message_date', title: 'Message Sent Date', hide: false },
        { field: 'job_open_date', title: 'Job Opened Date', hide: false },
        { field: 'appstatus', title: 'Appointment', hide: false },
        { field: 'job_status', title: 'Job Card', hide: false },
        { field: 'action', title: 'Action', hide: false },
    ];

    constructor(private userServices: StaffPostAuthService, private cdRef: ChangeDetectorRef, public router: Router, public datePipe: DatePipe) {}

    ngOnInit(): void {
        this.getSRCReport();
    }

    getSRCReport() {
        this.load_flag = true;
        this.allCampaigns = [];
        this.allcustomers = [];
        this.totalCampaignMessageSent = [];
        this.totalCampaignMessageDelivered = [];
        this.totalCampaignMessageRead = [];
        this.totalCampaignMessageFailed = [];
        this.responseReceived = [];
        this.jobOpenedCustomers = [];
        this.percentageResponse = '0 %';
        this.customerDetails = [];
        this.apptCustomers = [];
        this.apptCount = 0;
        this.originalCustomers = [];
        this.appotCustomers = [];
        this.firstReminderCust = [];
        this.secondReminderCust = [];
        this.thirdReminderCust = [];


        let data = {
            dateFrom: this.dateFrom,
            dateTo: this.dateTo,
            campaign_id: this.selectedCampaign,
            type: [3, 4, 5],
        };

        this.userServices.getSRCReport(data).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.allcustomers = rData.Campaigns.filter(
                    (camp: any) => camp.alm_wb_camp_type == '3' || camp.alm_wb_camp_type == '4' || camp.alm_wb_camp_type == '5'
                );


                const customerGroups = this.allcustomers.reduce((groups: any, element: any) => {
                    const mobile = element.wb_cus_mobile;
                    if (mobile) {
                        if (!groups[mobile]) {
                            groups[mobile] = [];
                        }
                        // // Map campaign type and message status using provided mappings
                        // element.campaign_type = campaignTypes[element.alm_wb_camp_type] || '';
                        // element.messaegStatus = messageStatus[element.alm_wb_msg_status] || '';

                        // // Extract only the date part from alm_wb_camp_msg_created_on (assumes first part is "DD-MM-YYYY")
                        // element.message_date = element.alm_wb_camp_msg_created_on.split(' ')[0];

                        // Set default statuses
                        element.appstatus = 'Not Scheduled';
                        element.job_status = 'Not Opened';
                        element.appstatusid = 0;

                        groups[mobile].push(element);
                    }
                    return groups;
                }, {});

                // Process each customer's messages to determine which one should be marked as "Opened"
                Object.values(customerGroups).forEach((messages: any) => {
                    // Sort messages by their sent date (parsed from "message_date")
                    messages.sort((a: any, b: any) => this.parseMessageDate(a.message_date).getTime() - this.parseMessageDate(b.message_date).getTime());

                    // Find a job open date for the customer.
                    // Here we assume that if any message contains a job_open_date, we take the first one found.
                    let jobOpenDate: any = '';
                    for (const msg of messages) {
                        if (msg.job_open_date && msg.job_open_date.trim() !== '') {
                            // Split by space to isolate the date portion (assumes "DD-MMM-YY" format)
                            jobOpenDate = this.parseJobOpenDate(msg.job_open_date.split(' ')[0]);
                            break;
                        }
                    }

                    // If a job open date exists, then mark the appropriate message as "Opened"
                    if (jobOpenDate) {
                        // Find the message with the latest sent date that is still on or before the job open date
                        let selectedMessage: any = null;
                        messages.forEach((msg: any) => {
                            const msgDate = this.parseMessageDate(msg.message_date);
                            if (msgDate <= jobOpenDate) {
                                if (!selectedMessage || msgDate > this.parseMessageDate(selectedMessage.message_date)) {
                                    selectedMessage = msg;
                                }
                            }
                        });
                        // Update job_status: mark the selected message as "Opened" and all others as "Not Opened"
                        messages.forEach((msg: any) => {
                            msg.job_status = msg === selectedMessage ? 'Opened' : 'Not Opened';
                        });
                    }
                });

                this.customerDetails = this.allcustomers
                    .filter((element) => element.wb_cus_mobile)
                    .map(({ wb_cus_mobile, message_date }) => ({ mobile: wb_cus_mobile, message_date }));

                // let thirdCamp = this.allcustomers.filter( (camp: any) =>  camp.alm_wb_camp_type == '5');
                // console.log("third service reminder>>>>>>>>>>>>>>",thirdCamp)

                this.originalCustomers = [...this.allcustomers]; // Backup original list before filtering

                // 1. Sent 2. Delivered 3. Read 4. Failed 5. Deleted
                this.totalCampaignMessageSent = this.allcustomers.filter((camp: any) => camp.alm_wb_msg_status == '1'); //filter((camp: any) => camp.alm_wb_msg_status != '4' && camp.alm_wb_msg_status != '5')
                this.totalCampaignMessageDelivered = this.allcustomers.filter((camp: any) => camp.alm_wb_msg_status == '2');
                this.totalCampaignMessageRead = this.allcustomers.filter((camp: any) => camp.alm_wb_msg_status == '3');
                this.totalCampaignMessageFailed = this.allcustomers.filter((camp: any) => camp.alm_wb_msg_status == '4');
                this.responseReceived = this.allcustomers.filter((camp: any) => camp.customer_responded == 'true');
                this.jobOpenedCustomers = this.allcustomers.filter((camp: any) => camp.job_status === 'Opened');

                this.firstServiceCust = this.allcustomers.filter((cust: any) => cust.alm_wb_camp_type == '3');
                this.secondServiceCust = this.allcustomers.filter((cust: any) => cust.alm_wb_camp_type == '4');
                this.thirdServiceCust = this.allcustomers.filter((cust: any) => cust.alm_wb_camp_type == '5');
                
                // ---------------------------------------------------------------------------------
                this.firstReminderCust = this.jobOpenedCustomers.filter((cust: any) => cust.alm_wb_camp_type == '3');

                this.secondReminderCust = this.jobOpenedCustomers.filter((cust: any) => cust.alm_wb_camp_type == '4');

                this.thirdReminderCust = this.jobOpenedCustomers.filter((cust: any) => cust.alm_wb_camp_type == '5');

                const totalMessages = this.totalCampaignMessageSent.length > 0 ? this.totalCampaignMessageSent.length : 0;
                const responses = this.responseReceived.length > 0 ? this.responseReceived.length : 0;

                if (totalMessages > 0) {
                    const percentage = (responses <= totalMessages ? (responses / totalMessages) * 100 : 100).toFixed(2);
                    this.percentageResponse = `${percentage} %`;
                } else {
                    this.percentageResponse = '0 %';
                }
                this.userServices.getAppointmentCustomersFromSRC({ customerDetails: this.customerDetails }).subscribe((data: any) => {
                    if (data.ret_data == 'success') {
                        // Corrected response check
                        this.load_flag = false;
                        this.apptCustomers = data.customer; // Ensure it's always an array
                        this.allcustomers.forEach((element) => {
                            this.apptCustomers.forEach((element2) => {
                                // Compare only the last 9 digits
                                if (element.wb_cus_mobile?.slice(-9) === element2.phone?.slice(-9)) {
                                    element['apptm_type'] = element2.apptm_type;
                                    if (
                                        (element.alm_wb_camp_type == '3' && element2.apptm_type == '7') ||
                                        (element.alm_wb_camp_type == '4' && element2.apptm_type == '8') ||
                                        (element.alm_wb_camp_type == '5' && element2.apptm_type == '9')
                                    ) {
                                        element.appstatusid = 1;
                                        element.appstatus = 'Appointment Scheduled';
                                    }
                                }
                            });
                        });

                        this.apptCount = this.allcustomers.filter((appt: any) => appt.appstatusid == 1).length;

                        this.Fcustwithoutapp = this.firstReminderCust.filter((cust: any) => cust.appstatusid == 0);
                        this.Fcustwithapp = this.firstReminderCust.filter((cust: any) => cust.appstatusid == 1);
                        this.Fcustwithpendingapp = this.allcustomers.filter(
                            (appt: any) => appt.alm_wb_camp_type == '3' && appt.apptm_type == '7' && appt.job_open_date == null
                        );

                        this.Scustwithoutapp = this.secondReminderCust.filter((cust: any) => cust.appstatusid == 0);
                        this.Scustwithapp = this.secondReminderCust.filter((cust: any) => cust.appstatusid == 1);
                        this.Scustwithpendingapp = this.allcustomers.filter(
                            (appt: any) => appt.alm_wb_camp_type == '4' && appt.apptm_type == '8' && appt.job_open_date == null
                        );

                        this.Tcustwithoutapp = this.thirdReminderCust.filter((cust: any) => cust.appstatusid == 0);
                        this.Tcustwithapp = this.thirdReminderCust.filter((cust: any) => cust.appstatusid == 1);
                        this.Tcustwithpendingapp = this.allcustomers.filter(
                            (appt: any) => appt.alm_wb_camp_type == '5' && appt.apptm_type == '9' && appt.job_open_date == null
                        );
                    } else {
                        this.load_flag = false;
                    }
                });
            } else {
                this.load_flag = false;
            }
        });
    }

    filterMessages(num: any) {
        this.selectedFilterIndex = num;
        switch (num) {
            case 0:
                this.allcustomers = this.originalCustomers;
                break;
            case 1:
                this.allcustomers = this.totalCampaignMessageDelivered;
                break;
            case 2:
                this.allcustomers = this.totalCampaignMessageSent;
                break;
            case 3:
                this.allcustomers = this.totalCampaignMessageRead;
                break;
            case 4:
                this.allcustomers = this.totalCampaignMessageFailed;
                break;
            case 5:
                this.allcustomers = this.jobOpenedCustomers;
                break;
            case 6:
                this.allcustomers = this.firstReminderCust;
                break;
            case 7:
                this.allcustomers = this.secondReminderCust;
                break;
            case 8:
                this.allcustomers = this.thirdReminderCust;
                break;
            case 9:
                this.allcustomers = this.jobOpenedCustomers.filter((element: any) => {
                    return (
                        (element.alm_wb_camp_type === '3' && element.apptm_type === '7') ||
                        (element.alm_wb_camp_type === '4' && element.apptm_type === '8') ||
                        (element.alm_wb_camp_type === '5' && element.apptm_type === '9')
                    );
                });
                break;
            case 10:
                this.allcustomers = this.Fcustwithapp;
                break;
            case 11:
                this.allcustomers = this.Scustwithapp;
                break;
            case 12:
                this.allcustomers = this.Tcustwithapp;
                break;
            case 13:
                this.allcustomers = this.jobOpenedCustomers.filter((element: any) => {
                    return (
                        (element.alm_wb_camp_type === '3' && element.appstatus == 'Not Scheduled') ||
                        (element.alm_wb_camp_type === '4' && element.appstatus == 'Not Scheduled') ||
                        (element.alm_wb_camp_type === '5' && element.appstatus == 'Not Scheduled')
                    );
                });
                break;
            case 14:
                this.allcustomers = this.Fcustwithoutapp;
                break;
            case 15:
                this.allcustomers = this.Scustwithoutapp;
                break;
            case 16:
                this.allcustomers = this.Tcustwithoutapp;
                break;
            case 17:
                this.allcustomers = this.originalCustomers.filter((appt: any) => {
                    return (
                        ((appt.alm_wb_camp_type === '3' && appt.apptm_type === '7') ||
                            (appt.alm_wb_camp_type === '4' && appt.apptm_type === '8') ||
                            (appt.alm_wb_camp_type === '5' && appt.apptm_type === '9')) &&
                        appt.job_open_date == null
                    );
                });
                break;
            case 18:
                this.allcustomers = this.Fcustwithpendingapp;
                break;
            case 19:
                this.allcustomers = this.Scustwithpendingapp;
                break;
            case 20:
                this.allcustomers = this.Tcustwithpendingapp;
                break;
            default:
                console.warn('Invalid filter option:', num);
                this.originalCustomers = [];
        }
    }
    redirectToWhatsappChat(number: any) {
        sessionStorage.setItem('chatNumbers', JSON.stringify([number]));
        this.router.navigate(['whatsappchat']);
    }

    parseMessageDate(dateStr: any) {
        const parts = dateStr.split('-');
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month index starts at 0 in JavaScript Date
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
    }

    parseJobOpenDate(dateStr: any) {
        const monthMap = {
            JAN: 0,
            FEB: 1,
            MAR: 2,
            APR: 3,
            MAY: 4,
            JUN: 5,
            JUL: 6,
            AUG: 7,
            SEP: 8,
            OCT: 9,
            NOV: 10,
            DEC: 11,
        };
        const parts = dateStr.split('-');
        const day = parseInt(parts[0], 10);
        const monthAbbr = parts[1].toUpperCase();
        // Cast monthAbbr as a key of monthMap to resolve the implicit 'any' type error
        const month = monthMap[monthAbbr as keyof typeof monthMap];
        let year = parts[2];
        if (year.length === 2) {
            year = '20' + year;
        }
        return new Date(parseInt(year, 10), month, day);
    }
}
