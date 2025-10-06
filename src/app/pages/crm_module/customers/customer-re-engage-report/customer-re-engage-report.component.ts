import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-customer-re-engage-report',
    templateUrl: './customer-re-engage-report.component.html',
    styleUrls: ['./customer-re-engage-report.component.css'],
})
export class CustomerReEngageReportComponent implements OnInit {
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
    public fullcustomers: any[] = [];
    public hasJobOpencustomers: any[] = [];
    public customerChunks: any[] = [];

    cols = [
        { field: 'wb_cus_mobile', title: 'Number', hide: false },
        { field: 'wb_cus_name', title: 'Customer', hide: false },
        { field: 'messaegStatus', title: 'Message Status' },
        { field: 'response_status', title: 'Response', hide: false },
        // { field: 'alm_wb_camp_name', title: 'Campaign Name' },
        { field: 'message_date', title: 'Message Sent Date', hide: false },
        { field: 'job_status', title: 'Job Status', hide: false },
        { field: 'job_open_date', title: 'Job Open Date', hide: false },
        { field: 'action', title: 'Action', hide: false },
    ];

    constructor(private userServices: StaffPostAuthService, private cdRef: ChangeDetectorRef, public router: Router, public datePipe: DatePipe) {
        this.userServices.getCustomerReEngageCampaigns().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                // this.allCampaigns = rData.Campaigns;
                this.allCampaigns = rData.Campaigns.filter(
                    (campaign: any) => campaign.alm_wb_camp_type != 3 && campaign.alm_wb_camp_type != 4 && campaign.alm_wb_camp_type != 5
                );
            }
        });
    }

    ngOnInit(): void {
        this.getCustomerReEngageCampaignReport();
    }

    getCustomerReEngageCampaignReport() {
        this.load_flag = true;
        this.allcustomers = [];
        this.fullcustomers = [];
        this.totalCampaignMessageSent = [];
        this.totalCampaignMessageDelivered = [];
        this.totalCampaignMessageRead = [];
        this.totalCampaignMessageFailed = [];
        this.responseReceived = [];
        this.jobOpenedCustomers = [];
        this.percentageResponse = '0 %';
        let data = {
            dateFrom: this.dateFrom,
            dateTo: this.dateTo,
            campaign_id: this.selectedCampaign,
        };

        this.userServices.getCustomerReEngageCampaignReport(data).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.fullcustomers = rData.Campaigns.filter(
                    (camp: any) => camp.alm_wb_camp_type != '3' && camp.alm_wb_camp_type != '4' && camp.alm_wb_camp_type != '5'
                );
                this.fullcustomers.forEach((element) => {
                    // Format message date as DD-MM-YYYY
                    const messageDate = new Date(element.alm_wb_camp_msg_created_on);
                    const formattedDate = [
                        messageDate.getDate().toString().padStart(2, '0'),
                        (messageDate.getMonth() + 1).toString().padStart(2, '0'),
                        messageDate.getFullYear(),
                    ].join('-');

                    // Set campaign type based on alm_wb_camp_type using a mapping
                    const campaignTypes: { [key: string]: string } = {
                        '1': 'Unconverted Leads Campaign',
                        '2': 'Lost Customer Campaign',
                    };
                    element.campaign_type = campaignTypes[element.alm_wb_camp_type] || '';
                    // Set message status using a mapping
                    const messageStatus: { [key: string]: string } = {
                        '1': 'Sent',
                        '2': 'Delivered',
                        '3': 'Read',
                        '4': 'Failed',
                        '5': 'Deleted',
                    };
                    element.messaegStatus = messageStatus[element.message_status] || '';
                    element.job_status = 'Not Opened';
                    element.job_open_date = 'NIL';
                });
                // 1. Sent 2. Delivered 3. Read 4. Failed 5. Deleted
                this.totalCampaignMessageSent = this.fullcustomers;
                this.totalCampaignMessageDelivered = this.fullcustomers.filter((camp: any) => camp.message_status == '2');
                this.totalCampaignMessageRead = this.fullcustomers.filter((camp: any) => camp.message_status == '3');
                this.totalCampaignMessageFailed = this.fullcustomers.filter((camp: any) => camp.message_status == '4');
                this.responseReceived = this.fullcustomers.filter((camp: any) => camp.response_status == 'Responded');
                const totalMessages = this.totalCampaignMessageSent.length > 0 ? this.totalCampaignMessageSent.length : 0;
                const responses = this.responseReceived.length > 0 ? this.responseReceived.length : 0;

                // console.log('this.totalCampaignMessageFailed>>>>>>>>>>>>>>>>>>', this.totalCampaignMessageFailed);

                if (totalMessages > 0) {
                    const percentage = (responses <= totalMessages ? (responses / totalMessages) * 100 : 100).toFixed(2);
                    this.percentageResponse = `${percentage} %`;
                } else {
                    this.percentageResponse = '0 %';
                }

                this.hasJobOpencustomers = this.fullcustomers.map((customer) => ({
                    wb_cus_mobile: customer.wb_cus_mobile,
                    message_date: customer.message_date,
                }));

                this.getcustomerJobcards();
                // this.load_flag = false;
            } else {
                this.load_flag = false;
            }
        });
    }

    getcustomerJobcards() {
        this.load_flag = true;
        const chunkSize = 500; // Adjust based on server capacity
        this.customerChunks = []; // Reset before splitting to avoid duplicates

        // Split data into chunks
        for (let i = 0; i < this.hasJobOpencustomers.length; i += chunkSize) {
            this.customerChunks.push(this.hasJobOpencustomers.slice(i, i + chunkSize));
        }

        // Call async function
        this.sendChunksSequentially();
    }

    async sendChunksSequentially() {
        for (const chunk of this.customerChunks) {
            try {
                const encodedData = JSON.stringify({ customers: chunk });

                const rData: any = await lastValueFrom(this.userServices.getCampaignCustomerJobcards(encodedData));

                if (rData.ret_data === 'success' && Array.isArray(rData.JobcardCustomers)) {
                    const jobcardMap = new Map(
                        rData.JobcardCustomers.filter((job: any) => job.phone) // Ensure phone exists
                            .map((job: any) => [job.phone.slice(-9), { job_open_date: job.job_open_date }])
                    );

                    // Create a map to store the latest message date for each customer (keyed by last 9 digits)
                    const latestMessageMap = new Map<string, Date>();

                    this.fullcustomers.forEach((customer: any) => {
                        if (customer.wb_cus_mobile?.length >= 9 && customer.message_date) {
                            const last9Digits = customer.wb_cus_mobile.slice(-9);
                            const msgDate = new Date(customer.message_date);
                            // Update the map if no entry exists or if this message date is later than the stored one
                            if (!latestMessageMap.has(last9Digits) || msgDate > latestMessageMap.get(last9Digits)!) {
                                latestMessageMap.set(last9Digits, msgDate);
                            }
                        }
                    });

                    const recentMessageMap = new Map<string, { message_date: string; customer: any }>();

                    // Step 1: Find the latest message for each customer
                    this.fullcustomers.forEach((customer: any) => {
                        if (customer.wb_cus_mobile?.length >= 9 && customer.message_date) {
                            const last9Digits = customer.wb_cus_mobile.slice(-9);
                            const currentMsgDate = new Date(customer.message_date);

                            // Track the latest message for this customer
                            if (!recentMessageMap.has(last9Digits) || currentMsgDate > new Date(recentMessageMap.get(last9Digits)!.message_date)) {
                                recentMessageMap.set(last9Digits, { message_date: customer.message_date, customer });
                            }
                        }
                    });

                    // Step 2: Assign job status only to the latest message before/on job open date
                    recentMessageMap.forEach(({ message_date, customer }) => {
                        const last9Digits = customer.wb_cus_mobile.slice(-9);
                        if (jobcardMap.has(last9Digits)) {
                            const jobData = jobcardMap.get(last9Digits) as { job_open_date: string; job_status: string };
                            const jobOpenDate = new Date(jobData.job_open_date.replace(/-/g, ' '));
                            const latestMsgDate = new Date(message_date);

                            // Set job status "Opened" only if the latest message is before or on the job open date
                            if (latestMsgDate <= jobOpenDate) {
                                Object.assign(customer, {
                                    job_open_date: jobData.job_open_date,
                                    job_status: 'Opened',
                                });
                            } else {
                                Object.assign(customer, { job_open_date: jobData.job_open_date });
                            }
                        }
                    });

                    // Update `fullcustomers` if last 9 digits match
                    // this.fullcustomers.forEach((customer: any) => {
                    //     if (customer.wb_cus_mobile?.length >= 9) {
                    //         const last9Digits = customer.wb_cus_mobile.slice(-9);
                    //         if (jobcardMap.has(last9Digits)) {
                    //             const jobData = jobcardMap.get(last9Digits) as { job_open_date: string; job_status: string }; // Explicitly type jobData

                    //             const jobOpenDate = new Date(jobData.job_open_date.replace(/-/g, ' ')); // Convert to Date
                    //             const messageDate = new Date(customer.message_date); // Convert message_date to Date

                    //             if (jobOpenDate >= messageDate) {
                    //                 Object.assign(customer, { job_open_date: jobData.job_open_date, job_status: 'opened' });
                    //             } else {
                    //                 Object.assign(customer, { job_open_date: jobData.job_open_date }); // No job_status if date fails
                    //             }
                    //         }
                    //     }
                    // });

                    // this.fullcustomers.forEach((customer: any) => {
                    //     if (customer.wb_cus_mobile?.length >= 9) {
                    //         const last9Digits = customer.wb_cus_mobile.slice(-9);
                    //         if (jobcardMap.has(last9Digits)) {
                    //             Object.assign(customer, jobcardMap.get(last9Digits)); // Direct assignment
                    //         }
                    //     }
                    // });
                }
            } catch (error) {
                console.error('Error processing chunk:', error);
            }

            // Optional: Add a small delay to reduce API load
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
        this.jobOpenedCustomers = this.fullcustomers.filter((camp: any) => {
            if (!camp.job_open_date || camp.job_status?.toLowerCase() !== 'opened') return false;

            const messageDate = new Date(camp.message_date); // Convert message_date to Date
            const jobOpenDate = new Date(camp.job_open_date.replace(/-/g, ' ')); // Convert job_open_date to Date

            return messageDate <= jobOpenDate; // Ensure message date is before or on job open date
        });

        this.allcustomers = this.fullcustomers;

        this.load_flag = false; // Mark process as completed
    }

    filterMessages(num: any) {
        switch (num) {
            case 0:
                this.allcustomers = this.fullcustomers;
                break;
            case 1:
                this.allcustomers = this.totalCampaignMessageDelivered;
                break;
            case 2:
                this.allcustomers = this.totalCampaignMessageRead;
                break;
            case 3:
                this.allcustomers = this.totalCampaignMessageFailed;
                break;
            case 4:
                this.allcustomers = this.responseReceived;
                break;
            case 5:
                this.allcustomers = this.jobOpenedCustomers;
                break;
            default:
                console.warn('Invalid filter option:', num);
                this.fullcustomers = [];
        }
    }

    redirectToWhatsappChat(number: any) {
        sessionStorage.setItem('chatNumbers', JSON.stringify([number]));
        this.router.navigate(['whatsappchat']);
    }
}
