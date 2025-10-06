import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalComponent } from 'angular-custom-modal';
import * as moment from 'moment';
import { elementAt } from 'rxjs';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-new-customer-dash',
    templateUrl: './new-customer-dash.component.html',
    styleUrls: ['./new-customer-dash.component.css'],
})
export class NewCustomerDashComponent implements OnInit {
    // JOb Cards Tab
    public search = '';
    public load_flag: boolean = true;
    public dateFrom: any = this.datePipe.transform(moment(new Date()).startOf('month').toDate(), 'yyyy-MM-dd') || '';
    public dateTo: any = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
    public sourceList: any[] = [];
    public source = '0';
    public newCustomerList: any[] = [];
    public allNewCustomerList: any[] = [];
    public directCustomers: any[] = [];
    chartOptions: any;
    public graph_flag = false;
    public counts: any[] = [];
    public overallcounts: any[] = [];
    public leadsList: any[] = [];
    public leadsFlag: boolean = false;
    public leadSearch = '';
    public wipCount: any = 0;
    public invoicedCount: any = 0;
    public phnnum: any[] = [];
    public marketingCall: any[] = [];
    public nonMarketingCall: any[] = [];
    public phoneCall: any[] = [];
    public socialMedia: any[] = [];
    public saDirect: any[] = [];
    public creWhatsapp: any[] = [];
    public directLead: any[] = [];
    public lostCustomer: any[] = [];
    public googleMarketing: any[] = [];
    public whatsappCampaign: any[] = [];
    public whatsappDirect: any[] = [];
    public whatsappSerDue: any[] = [];
    public currentMonthCust: any = 0;
    public previousMonthCust: any = 0;
    public tab4: any = 'jobcard';
    public selectedCustomer: any;
    public invCurrentMonthCust: any[] = [];
    public invPreviousMonthCust: any[] = [];
    public invDirectCustomers: any[] = [];
    public allInvNewCustomers: any[] = [];
    public invMarketingCall: any[] = [];
    public invNonMarketingCall: any[] = [];
    public invPhoneCall: any[] = []; // Phone Call
    public invSocialMedia: any[] = []; // Social Media
    public invSADirect: any[] = []; // SA Direct
    public invCreWhatsapp: any[] = []; // CRE WhatsApp
    public invDirectLead: any[] = []; // Direct Lead
    public invLostCustomer: any[] = []; // Lost Customer
    public invGoogleMarketing: any[] = []; // Google Marketing
    public invWhatsappCampaign: any[] = []; // Whatsapp Campaign
    public invWhatsappDirect: any[] = []; // Whatsapp Direct
    public invWhatsappSerDue: any[] = []; // WhatsApp Ser Due

    // Leads Tab
    public l_load_flag: boolean = true;
    public allNewLeadsList: any[] = [];
    public ldateFrom: any = this.datePipe.transform(moment(new Date()).startOf('month').toDate(), 'yyyy-MM-dd') || '';
    public ldateTo: any = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
    public lsource = '0';
    public lopenjobcards: any = 0;
    public linvoicedjobcard: any = 0;
    public lmarketingCall: any = [];
    public lnonMarketingCall: any = [];
    public lphoneCall: any = [];
    public lsocialMedia: any = [];
    public lsaDirect: any = [];
    public lcreWhatsapp: any = [];
    public ldirectLead: any = [];
    public llostCustomer: any = [];
    public lgoogleMarketing: any = [];
    public lwhatsappCampaign: any = [];
    public lwhatsappDirect: any = [];
    public lwhatsappSerDue: any = [];
    public lcurrentMonthCust: any = [];
    public lpreviousMonthCust: any = [];
    public lnewCustomerList: any[] = [];
    public newLeadList: any[] = [];
    public selectedCustomerType: any;
    public lwhatsappLeads: any[] = [];
    public lHotLeads: any[] = [];
    public lWarmLeads: any[] = [];
    public lColdLeads: any[] = [];
    public misMatchCustomers: any[] = [];
    public callLeadHotCustomers: any[] = [];
    public callColdCustomers: any[] = [];
    public whOpenedjobcards: any[] = [];
    public callOpenedjobcards: any[] = [];

    @ViewChild('leadModal') leadModal!: ModalComponent;

    cols = [
        { field: 'phone', title: 'Number', hide: false },
        { field: 'customer_name', title: 'Customer', hide: false },
        { field: 'job_open_date', title: 'First Job Open Date', hide: false },
        { field: 'job_status', title: 'Job Status', hide: false },
        { field: 'lead_code', title: 'Lead Code', hide: false },
        { field: 'lead_createdon', title: 'Lead Created Date', hide: false },
        { field: 'lead_source_detail', title: 'Source' },
        { field: 'lead_note', title: 'Lead Note', hide: false },
        { field: 'lead_purpose', title: 'Purpose' },
        // { field: 'created', title: 'Lead Created', hide: false },
        // { field: 'us_firstname', title: 'Assigned', hide: false },
        // { field: 'action', title: 'Action', hide: false },
    ];

    leadCols = [
        { field: 'lead_code', title: 'Lead Code', hide: false },
        { field: 'call_purpose', title: 'Purpose' },
        { field: 'ld_src', title: 'Source', hide: false },
        { field: 'ld_sts', title: 'Status', hide: false },
        { field: 'lead_createdon', title: 'Created Date', hide: false },
        { field: 'lead_note', title: 'Note', hide: false },
    ];

    leadsColumn = [
        { field: 'phone', title: 'Number', hide: false },
        { field: 'customer_name', title: 'Customer', hide: false },
        { field: 'lead_code', title: 'Lead Code', hide: false },
        { field: 'lead_createdon', title: 'Lead Created Date', hide: false },
        { field: 'lead_source_detail', title: 'Source' },
        { field: 'lead_note', title: 'Lead Note', hide: false },
        { field: 'lead_purpose', title: 'Purpose' },
        { field: 'first_job_date', title: 'First Job Open Date', hide: false },
        { field: 'job_status', title: 'Job Status', hide: false },
        // { field: 'created', title: 'Lead Created', hide: false },
        // { field: 'us_firstname', title: 'Assigned', hide: false },
        // { field: 'action', title: 'Action', hide: false },
    ];

    constructor(public router: Router, private userServices: StaffPostAuthService, public datePipe: DatePipe) {
        this.userServices.getLeadSource().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.sourceList = rData.source;
            }
        });
    }
    ngOnInit() {
        this.fetchAllNewCustomers();
    }

    fetchAllNewCustomers() {
        this.load_flag = true;
        this.newCustomerList = [];
        this.allNewCustomerList = [];
        this.wipCount = 0;
        this.invoicedCount = 0;
        this.phnnum = [];
        this.marketingCall = [];
        this.nonMarketingCall = [];
        this.phoneCall = [];
        this.socialMedia = [];
        this.saDirect = [];
        this.creWhatsapp = [];
        this.directLead = [];
        this.lostCustomer = [];
        this.googleMarketing = [];
        this.whatsappCampaign = [];
        this.whatsappDirect = [];
        this.whatsappSerDue = [];
        this.currentMonthCust = [];
        this.previousMonthCust = [];
        this.invCurrentMonthCust = [];
        this.invPreviousMonthCust = [];
        this.directCustomers = [];

        this.allInvNewCustomers = [];
        this.invDirectCustomers = [];
        this.invMarketingCall = [];
        this.invNonMarketingCall = [];
        this.invPhoneCall = []; // Phone Call
        this.invSocialMedia = []; // Social Media
        this.invSADirect = []; // SA Direct
        this.invCreWhatsapp = []; // CRE WhatsApp
        this.invDirectLead = []; // Direct Lead
        this.invLostCustomer = []; // Lost Customer
        this.invGoogleMarketing = []; // Google Marketing
        this.invWhatsappCampaign = []; // Whatsapp Campaign
        this.invWhatsappDirect = []; // Whatsapp Direct
        this.invWhatsappSerDue = []; // WhatsApp Ser Due
        this.misMatchCustomers = [];
        // this.counts = [];
        let data = {
            dateFrom: this.dateFrom,
            dateTo: this.dateTo,
            sourceId: this.source ? this.source : 0,
        };

        this.userServices.fetchAllNewCustomers(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.selectedCustomer = 0;
                const leadSourceMap = this.sourceList.reduce((acc: any, item: any) => {
                    acc[item.ld_src_id] = item.ld_src;
                    return acc;
                }, {});

                const purposeMapping: any = {
                    '1': 'Appointment',
                    '2': 'Campaign Enquiry',
                    '3': 'Service Request / Quotation',
                    '4': 'Parts Enquiry',
                    '6': 'Feedback / PSF',
                    '7': 'Others',
                    '8': 'Status Enquiry',
                    '9': 'Wrong Number',
                    '10': 'General Enquiry',
                };

                // Assign lead source details
                rdata.customers.forEach((element: any) => {
                    element.lead_purpose = purposeMapping[element.purpose_id] || 'NIL';
                    element.lead_source_detail = leadSourceMap[element.source_id] || 'NIL';
                });

                // Assign lead source details
                rdata.invCustomers.forEach((element: any) => {
                    element.lead_purpose = purposeMapping[element.purpose_id] || 'NIL';
                    element.lead_source_detail = leadSourceMap[element.source_id] || 'NIL';
                });

                // this.newCustomerList = rdata.customers;
                this.allNewCustomerList = rdata.customers;
                this.allInvNewCustomers = rdata.invCustomers;
                this.directCustomers = rdata.customers.filter((cust: any) => cust.lead_id == null || cust.lead_id == '');
                this.invDirectCustomers = rdata.invCustomers.filter((cust: any) => (cust.lead_id == null || cust.lead_id == '') && cust.job_status === 'INV');
                this.misMatchCustomers = rdata.invCustomers.filter(
                    (cust: any) => (cust.lead_id == null || cust.lead_id == '') && cust.cust_flag_mismatch == '1'
                );
                this.phnnum = this.allNewCustomerList.filter((customer: any) => customer.source_id === '1').map((customer: any) => customer.phone);
                let inData = {
                    customers: this.phnnum,
                    call_type: 'Inbound',
                };
                this.userServices.getInboundCalldetails(inData).subscribe((rdata: any) => {
                    if (rdata.ret_data === 'success') {
                        this.allNewCustomerList.forEach((element) => {
                            element.department = 'Non-Marketing';
                            element.departmentId = '2';
                            rdata.customer.forEach((element2: any) => {
                                const lastElement3 = element2[element2.length - 1]; // get last object in the inner array
                                if (
                                    lastElement3 &&
                                    lastElement3.calltype === 'Inbound' &&
                                    lastElement3.srctrunk === '025503556' &&
                                    element.phone?.slice(-9) === lastElement3.src?.slice(-9)
                                ) {
                                    element.department = 'Marketing';
                                    element.departmentId = '1';
                                }
                            });
                        });

                        if (this.allNewCustomerList.length > 0) {
                            this.counts = [];

                            this.counts = [];
                            this.overallcounts = []; // New array for overall counts

                            const now = new Date();
                            const currentMonth = now.getMonth();
                            const currentYear = now.getFullYear();

                            const dateFrom = this.normalizeToDateOnly(new Date(this.dateFrom));

                            // 🌐 Overall counts from all new customers
                            const invCust = this.allNewCustomerList.filter((cust: any) => cust.job_status === 'INV').length;

                            const jobOpenCust = this.allNewCustomerList.filter((cust: any) => cust.job_open_date).length;

                            this.wipCount = this.allNewCustomerList.filter((cust: any) => cust.job_status === 'WIP').length;
                            this.invoicedCount = invCust;

                            // const currentMonthCust = this.allNewCustomerList.filter((cust: any) => {
                            //     const leadDate = new Date(cust.lead_createdon);
                            //     return leadDate >= dateFrom;
                            // }).length;

                            const currentMonthCust = this.allNewCustomerList.filter((cust: any) => {
                                if (!cust.lead_createdon) return false;

                                const leadDate = new Date(cust.lead_createdon);

                                // convert to YYYYMM format
                                const leadYearMonth = leadDate.getFullYear() * 100 + leadDate.getMonth();
                                const fromYearMonth = dateFrom.getFullYear() * 100 + dateFrom.getMonth();

                                // keep only customers from same or later months
                                return leadYearMonth >= fromYearMonth;
                            }).length;

                            const previousMonthCust = this.allNewCustomerList.filter((cust: any) => {
                                if (!cust.lead_createdon) return false;

                                const leadDate = new Date(cust.lead_createdon);
                                const today = new Date();

                                // Get current and previous month/year
                                const currentMonth = today.getMonth(); // 0 = Jan
                                const currentYear = today.getFullYear();

                                let prevMonth = currentMonth - 1;
                                let prevYear = currentYear;

                                if (prevMonth < 0) {
                                    prevMonth = 11; // December
                                    prevYear -= 1; // Go back one year
                                }

                                return leadDate.getMonth() === prevMonth && leadDate.getFullYear() === prevYear;
                            }).length;

                            // const previousMonthCust = this.allNewCustomerList.filter((cust: any) => {
                            //     if (!cust.lead_createdon) return false;

                            //     const leadDate = new Date(cust.lead_createdon);
                            //     return leadDate < dateFrom;
                            // }).length;

                            // const invcurrentMonthCust = this.allInvNewCustomers.filter((cust: any) => {
                            //     const leadDate = new Date(cust.lead_createdon);
                            //     return leadDate >= dateFrom && cust.job_status === 'INV';
                            // });

                            // const invpreviousMonthCust = this.allInvNewCustomers.filter((cust: any) => {
                            //     if (!cust.lead_createdon) return false;
                            //     const leadDate = new Date(cust.lead_createdon);
                            //     return leadDate < dateFrom && cust.job_status === 'INV';
                            // });

                            // const currentMonthCust = this.allNewCustomerList.filter((cust: any) => {
                            //     const leadDate = new Date(cust.lead_createdon);
                            //     return leadDate.getMonth() === currentMonth && leadDate.getFullYear() === currentYear;
                            // }).length;

                            // const previousMonthCust = this.allNewCustomerList.filter((cust: any) => {
                            //     if (!cust.lead_createdon) return false; // Ensure lead_createdon exists

                            //     const leadDate = new Date(cust.lead_createdon);
                            //     const currentDate = new Date();
                            //     const currentMonth = currentDate.getMonth();
                            //     const currentYear = currentDate.getFullYear();

                            //     const isPrevMonth = leadDate.getMonth() === (currentMonth === 0 ? 11 : currentMonth - 1);
                            //     const isSameYear = leadDate.getFullYear() === (currentMonth === 0 ? currentYear - 1 : currentYear);
                            //     const isNotCurrentMonth = leadDate.getMonth() !== currentMonth;

                            //     return (isPrevMonth && isSameYear) || isNotCurrentMonth;
                            // }).length;

                            this.currentMonthCust = currentMonthCust;
                            this.previousMonthCust = previousMonthCust;
                            // this.invCurrentMonthCust = invcurrentMonthCust;
                            // this.invPreviousMonthCust = invpreviousMonthCust;

                            // Add to a new array instead of counts
                            this.overallcounts = [
                                { id: 15, label: 'Invoiced Customers', count: invCust },
                                { id: 16, label: 'Job Opened Customers', count: jobOpenCust },
                                { id: 17, label: 'Current Month Leads', count: currentMonthCust },
                                { id: 18, label: 'Previous Month Leads', count: previousMonthCust },
                            ];

                            // 🔁 Per-source counts
                            this.sourceList.forEach((src: any) => {
                                const customersForSource = this.allNewCustomerList.filter((cust: any) => cust.source_id == src.ld_src_id);
                                const count = customersForSource.length;

                                this.counts.push({
                                    id: src.ld_src_id,
                                    name: src.ld_src,
                                    count: count,
                                });
                            });

                            this.marketingCall = this.allNewCustomerList.filter((element: any) => element.source_id == '1' && element.departmentId == '1');
                            this.nonMarketingCall = this.allNewCustomerList.filter((element: any) => element.source_id == '1' && element.departmentId == '2');
                            this.phoneCall = this.allNewCustomerList.filter((element: any) => element.source_id == '1'); // Phone Call
                            this.socialMedia = this.allNewCustomerList.filter((element: any) => element.source_id == '2'); // Social Media
                            this.saDirect = this.allNewCustomerList.filter((element: any) => element.source_id == '3'); // SA Direct
                            this.creWhatsapp = this.allNewCustomerList.filter((element: any) => element.source_id == '4'); // CRE WhatsApp
                            this.directLead = this.allNewCustomerList.filter((element: any) => element.source_id == '5'); // Direct Lead
                            this.lostCustomer = this.allNewCustomerList.filter((element: any) => element.source_id == '6'); // Lost Customer
                            this.googleMarketing = this.allNewCustomerList.filter((element: any) => element.source_id == '7'); // Google Marketing
                            this.whatsappCampaign = this.allNewCustomerList.filter((element: any) => element.source_id == '8'); // Whatsapp Campaign
                            this.whatsappDirect = this.allNewCustomerList.filter((element: any) => element.source_id == '9'); // Whatsapp Direct
                            this.whatsappSerDue = this.allNewCustomerList.filter((element: any) => element.source_id == '10'); // WhatsApp Ser Due

                            // this.invMarketingCall = this.allInvNewCustomers.filter(
                            //     (element: any) => element.source_id == '1' && element.departmentId == '1' && element.job_status == 'INV'
                            // );
                            // this.invNonMarketingCall = this.allInvNewCustomers.filter(
                            //     (element: any) => element.source_id == '1' && element.departmentId == '2' && element.job_status == 'INV'
                            // );
                            // this.invPhoneCall = this.allInvNewCustomers.filter((element: any) => element.source_id == '1' && element.job_status == 'INV'); // Phone Call
                            // this.invSocialMedia = this.allInvNewCustomers.filter((element: any) => element.source_id == '2' && element.job_status == 'INV'); // Social Media
                            // this.invSADirect = this.allInvNewCustomers.filter((element: any) => element.source_id == '3' && element.job_status == 'INV'); // SA Direct
                            // this.invCreWhatsapp = this.allInvNewCustomers.filter((element: any) => element.source_id == '4' && element.job_status == 'INV'); // CRE WhatsApp
                            // this.invDirectLead = this.allInvNewCustomers.filter((element: any) => element.source_id == '5' && element.job_status == 'INV'); // Direct Lead
                            // this.invLostCustomer = this.allInvNewCustomers.filter((element: any) => element.source_id == '6' && element.job_status == 'INV'); // Lost Customer
                            // this.invGoogleMarketing = this.allInvNewCustomers.filter((element: any) => element.source_id == '7' && element.job_status == 'INV'); // Google Marketing
                            // this.invWhatsappCampaign = this.allInvNewCustomers.filter(
                            //     (element: any) => element.source_id == '8' && element.job_status == 'INV'
                            // ); // Whatsapp Campaign
                            // this.invWhatsappDirect = this.allInvNewCustomers.filter((element: any) => element.source_id == '9' && element.job_status == 'INV'); // Whatsapp Direct
                            // this.invWhatsappSerDue = this.allInvNewCustomers.filter((element: any) => element.source_id == '10' && element.job_status == 'INV'); // WhatsApp Ser Due

                            this.newCustomerList = this.allNewCustomerList;
                            this.load_flag = false;
                        } else {
                        }
                    } else {
                        if (this.allNewCustomerList.length > 0) {
                            this.counts = [];

                            this.counts = [];
                            this.overallcounts = []; // New array for overall counts

                            const now = new Date();
                            const currentMonth = now.getMonth();
                            const currentYear = now.getFullYear();

                            const dateFrom = this.normalizeToDateOnly(new Date(this.dateFrom));

                            // 🌐 Overall counts from all new customers
                            const invCust = this.allNewCustomerList.filter((cust: any) => cust.job_status === 'INV').length;

                            const jobOpenCust = this.allNewCustomerList.filter((cust: any) => cust.job_open_date).length;

                            this.wipCount = this.allNewCustomerList.filter((cust: any) => cust.job_status === 'WIP').length;
                            this.invoicedCount = invCust;

                            const currentMonthCust = this.allNewCustomerList.filter((cust: any) => {
                                const leadDate = new Date(cust.lead_createdon);

                                // convert to YYYYMM format
                                const leadYearMonth = leadDate.getFullYear() * 100 + leadDate.getMonth();
                                const fromYearMonth = dateFrom.getFullYear() * 100 + dateFrom.getMonth();

                                // keep only customers from same or later months
                                return leadYearMonth >= fromYearMonth;
                            }).length;

                            const previousMonthCust = this.allNewCustomerList.filter((cust: any) => {
                                if (!cust.lead_createdon) return false;

                                const leadDate = new Date(cust.lead_createdon);
                                return leadDate < dateFrom;
                            }).length;

                            // const invcurrentMonthCust = this.allInvNewCustomers.filter((cust: any) => {
                            //     const leadDate = new Date(cust.lead_createdon);
                            //     return leadDate >= dateFrom && cust.job_status === 'INV';
                            // });

                            // const invpreviousMonthCust = this.allInvNewCustomers.filter((cust: any) => {
                            //     if (!cust.lead_createdon) return false;

                            //     const leadDate = new Date(cust.lead_createdon);
                            //     return leadDate < dateFrom && cust.job_status === 'INV';
                            // });

                            this.currentMonthCust = currentMonthCust;
                            this.previousMonthCust = previousMonthCust;
                            // this.invCurrentMonthCust = invcurrentMonthCust;
                            // this.invPreviousMonthCust = invpreviousMonthCust;

                            // Add to a new array instead of counts
                            this.overallcounts = [
                                { id: 15, label: 'Invoiced Customers', count: invCust },
                                { id: 16, label: 'Job Opened Customers', count: jobOpenCust },
                                { id: 17, label: 'Current Month Leads', count: currentMonthCust },
                                { id: 18, label: 'Previous Month Leads', count: previousMonthCust },
                            ];

                            // 🔁 Per-source counts
                            this.sourceList.forEach((src: any) => {
                                const customersForSource = this.allNewCustomerList.filter((cust: any) => cust.source_id == src.ld_src_id);
                                const count = customersForSource.length;

                                this.counts.push({
                                    id: src.ld_src_id,
                                    name: src.ld_src,
                                    count: count,
                                });
                            });

                            this.marketingCall = this.allNewCustomerList.filter((element: any) => element.source_id == '1' && element.departmentId == '1');
                            this.nonMarketingCall = this.allNewCustomerList.filter((element: any) => element.source_id == '1' && element.departmentId == '2');
                            this.phoneCall = this.allNewCustomerList.filter((element: any) => element.source_id == '1'); // Phone Call
                            this.socialMedia = this.allNewCustomerList.filter((element: any) => element.source_id == '2'); // Social Media
                            this.saDirect = this.allNewCustomerList.filter((element: any) => element.source_id == '3'); // SA Direct
                            this.creWhatsapp = this.allNewCustomerList.filter((element: any) => element.source_id == '4'); // CRE WhatsApp
                            this.directLead = this.allNewCustomerList.filter((element: any) => element.source_id == '5'); // Direct Lead
                            this.lostCustomer = this.allNewCustomerList.filter((element: any) => element.source_id == '6'); // Lost Customer
                            this.googleMarketing = this.allNewCustomerList.filter((element: any) => element.source_id == '7'); // Google Marketing
                            this.whatsappCampaign = this.allNewCustomerList.filter((element: any) => element.source_id == '8'); // Whatsapp Campaign
                            this.whatsappDirect = this.allNewCustomerList.filter((element: any) => element.source_id == '9'); // Whatsapp Direct
                            this.whatsappSerDue = this.allNewCustomerList.filter((element: any) => element.source_id == '10'); // WhatsApp Ser Due

                            // this.invMarketingCall = this.allInvNewCustomers.filter(
                            //     (element: any) => element.source_id == '1' && element.departmentId == '1' && element.job_status == 'INV'
                            // );
                            // this.invNonMarketingCall = this.allInvNewCustomers.filter(
                            //     (element: any) => element.source_id == '1' && element.departmentId == '2' && element.job_status == 'INV'
                            // );
                            // this.invPhoneCall = this.allInvNewCustomers.filter((element: any) => element.source_id == '1' && element.job_status == 'INV'); // Phone Call
                            // this.invSocialMedia = this.allInvNewCustomers.filter((element: any) => element.source_id == '2' && element.job_status == 'INV'); // Social Media
                            // this.invSADirect = this.allInvNewCustomers.filter((element: any) => element.source_id == '3' && element.job_status == 'INV'); // SA Direct
                            // this.invCreWhatsapp = this.allInvNewCustomers.filter((element: any) => element.source_id == '4' && element.job_status == 'INV'); // CRE WhatsApp
                            // this.invDirectLead = this.allInvNewCustomers.filter((element: any) => element.source_id == '5' && element.job_status == 'INV'); // Direct Lead
                            // this.invLostCustomer = this.allInvNewCustomers.filter((element: any) => element.source_id == '6' && element.job_status == 'INV'); // Lost Customer
                            // this.invGoogleMarketing = this.allInvNewCustomers.filter((element: any) => element.source_id == '7' && element.job_status == 'INV'); // Google Marketing
                            // this.invWhatsappCampaign = this.allInvNewCustomers.filter(
                            //     (element: any) => element.source_id == '8' && element.job_status == 'INV'
                            // ); // Whatsapp Campaign
                            // this.invWhatsappDirect = this.allInvNewCustomers.filter((element: any) => element.source_id == '9' && element.job_status == 'INV'); // Whatsapp Direct
                            // this.invWhatsappSerDue = this.allInvNewCustomers.filter((element: any) => element.source_id == '10' && element.job_status == 'INV'); // WhatsApp Ser Due

                            this.newCustomerList = this.allNewCustomerList;
                            this.load_flag = false;
                        }
                    }
                });

                let num = this.allInvNewCustomers.filter((customer: any) => customer.source_id === '1').map((customer: any) => customer.phone);

                let inVData = {
                    customers: num,
                    call_type: 'Inbound',
                };
                this.userServices.getInboundCalldetails(inVData).subscribe((rdata: any) => {
                    if (rdata.ret_data === 'success') {
                        this.allInvNewCustomers.forEach((element) => {
                            element.department = 'Non-Marketing';
                            element.departmentId = '2';
                            rdata.customer.forEach((element2: any) => {
                                const lastElement3 = element2[element2.length - 1]; // get last object in the inner array
                                if (
                                    lastElement3 &&
                                    lastElement3.calltype === 'Inbound' &&
                                    lastElement3.srctrunk === '025503556' &&
                                    element.phone?.slice(-9) === lastElement3.src?.slice(-9)
                                ) {
                                    element.department = 'Marketing';
                                    element.departmentId = '1';
                                }
                            });
                        });

                        if (this.allInvNewCustomers.length > 0) {
                            const now = new Date();
                            const currentMonth = now.getMonth();
                            const currentYear = now.getFullYear();

                            const dateFrom = this.normalizeToDateOnly(new Date(this.dateFrom));

                            const invcurrentMonthCust = this.allInvNewCustomers.filter((cust: any) => {
                                const leadDate = new Date(cust.lead_createdon);
                                return leadDate >= dateFrom && cust.job_status === 'INV';
                            });

                            const invpreviousMonthCust = this.allInvNewCustomers.filter((cust: any) => {
                                if (!cust.lead_createdon) return false;
                                const leadDate = new Date(cust.lead_createdon);
                                return leadDate < dateFrom && cust.job_status === 'INV';
                            });

                            this.invCurrentMonthCust = invcurrentMonthCust;
                            this.invPreviousMonthCust = invpreviousMonthCust;

                            this.invMarketingCall = this.allInvNewCustomers.filter(
                                (element: any) => element.source_id == '1' && element.departmentId == '1' && element.job_status == 'INV'
                            );
                            this.invNonMarketingCall = this.allInvNewCustomers.filter(
                                (element: any) => element.source_id == '1' && element.departmentId == '2' && element.job_status == 'INV'
                            );
                            this.invPhoneCall = this.allInvNewCustomers.filter((element: any) => element.source_id == '1' && element.job_status == 'INV'); // Phone Call
                            this.invSocialMedia = this.allInvNewCustomers.filter((element: any) => element.source_id == '2' && element.job_status == 'INV'); // Social Media
                            this.invSADirect = this.allInvNewCustomers.filter((element: any) => element.source_id == '3' && element.job_status == 'INV'); // SA Direct
                            this.invCreWhatsapp = this.allInvNewCustomers.filter((element: any) => element.source_id == '4' && element.job_status == 'INV'); // CRE WhatsApp
                            this.invDirectLead = this.allInvNewCustomers.filter((element: any) => element.source_id == '5' && element.job_status == 'INV'); // Direct Lead
                            this.invLostCustomer = this.allInvNewCustomers.filter((element: any) => element.source_id == '6' && element.job_status == 'INV'); // Lost Customer
                            this.invGoogleMarketing = this.allInvNewCustomers.filter((element: any) => element.source_id == '7' && element.job_status == 'INV'); // Google Marketing
                            this.invWhatsappCampaign = this.allInvNewCustomers.filter(
                                (element: any) => element.source_id == '8' && element.job_status == 'INV'
                            ); // Whatsapp Campaign
                            this.invWhatsappDirect = this.allInvNewCustomers.filter((element: any) => element.source_id == '9' && element.job_status == 'INV'); // Whatsapp Direct
                            this.invWhatsappSerDue = this.allInvNewCustomers.filter((element: any) => element.source_id == '10' && element.job_status == 'INV'); // WhatsApp Ser Due

                            this.load_flag = false;
                        } else {
                        }
                    } else {
                        if (this.allInvNewCustomers.length > 0) {
                            const now = new Date();
                            const currentMonth = now.getMonth();
                            const currentYear = now.getFullYear();

                            const dateFrom = this.normalizeToDateOnly(new Date(this.dateFrom));

                            const invcurrentMonthCust = this.allInvNewCustomers.filter((cust: any) => {
                                const leadDate = new Date(cust.lead_createdon);
                                return leadDate >= dateFrom && cust.job_status === 'INV';
                            });

                            const invpreviousMonthCust = this.allInvNewCustomers.filter((cust: any) => {
                                if (!cust.lead_createdon) return false;
                                const leadDate = new Date(cust.lead_createdon);
                                return leadDate < dateFrom && cust.job_status === 'INV';
                            });

                            this.invCurrentMonthCust = invcurrentMonthCust;
                            this.invPreviousMonthCust = invpreviousMonthCust;

                            this.invMarketingCall = this.allInvNewCustomers.filter(
                                (element: any) => element.source_id == '1' && element.departmentId == '1' && element.job_status == 'INV'
                            );
                            this.invNonMarketingCall = this.allInvNewCustomers.filter(
                                (element: any) => element.source_id == '1' && element.departmentId == '2' && element.job_status == 'INV'
                            );
                            this.invPhoneCall = this.allInvNewCustomers.filter((element: any) => element.source_id == '1' && element.job_status == 'INV'); // Phone Call
                            this.invSocialMedia = this.allInvNewCustomers.filter((element: any) => element.source_id == '2' && element.job_status == 'INV'); // Social Media
                            this.invSADirect = this.allInvNewCustomers.filter((element: any) => element.source_id == '3' && element.job_status == 'INV'); // SA Direct
                            this.invCreWhatsapp = this.allInvNewCustomers.filter((element: any) => element.source_id == '4' && element.job_status == 'INV'); // CRE WhatsApp
                            this.invDirectLead = this.allInvNewCustomers.filter((element: any) => element.source_id == '5' && element.job_status == 'INV'); // Direct Lead
                            this.invLostCustomer = this.allInvNewCustomers.filter((element: any) => element.source_id == '6' && element.job_status == 'INV'); // Lost Customer
                            this.invGoogleMarketing = this.allInvNewCustomers.filter((element: any) => element.source_id == '7' && element.job_status == 'INV'); // Google Marketing
                            this.invWhatsappCampaign = this.allInvNewCustomers.filter(
                                (element: any) => element.source_id == '8' && element.job_status == 'INV'
                            ); // Whatsapp Campaign
                            this.invWhatsappDirect = this.allInvNewCustomers.filter((element: any) => element.source_id == '9' && element.job_status == 'INV'); // Whatsapp Direct
                            this.invWhatsappSerDue = this.allInvNewCustomers.filter((element: any) => element.source_id == '10' && element.job_status == 'INV'); // WhatsApp Ser Due

                            this.load_flag = false;
                        } else {
                        }
                    }
                });
            } else {
                this.coloredToast('danger', 'No new customers found for the selected filters. Try changing the date range or lead source.');
                this.load_flag = false;
            }
        });
    }

    fetchAllLeadsByPhone(phone: any) {
        this.leadsList = [];
        this.leadModal.open();
        this.leadsFlag = true;
        let data = {
            phone: phone,
        };

        this.userServices.fetchAllLeadsByPhone(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.leadsList = rdata.LeadList;
                this.leadsFlag = false;
            } else {
                this.leadsFlag = false;
                this.coloredToast('danger', 'No Leads History Found');
            }
        });
    }

    closeModal() {
        this.leadModal.close();
        this.leadsList = [];
    }

    // customerSourceGraphs() {
    //     this.chartOptions = {
    //         series: [
    //             {
    //                 name: 'Customer Source Analysis',
    //                 data: [
    //                     this.newCustomerList.filter((element: any) => element.source_id == '1').length, // Phone Call
    //                     this.newCustomerList.filter((element: any) => element.source_id == '2').length, // Social Media
    //                     this.newCustomerList.filter((element: any) => element.source_id == '3').length, // SA Direct
    //                     this.newCustomerList.filter((element: any) => element.source_id == '4').length, // CRE WhatsApp
    //                     this.newCustomerList.filter((element: any) => element.source_id == '5').length, // Direct Lead
    //                     this.newCustomerList.filter((element: any) => element.source_id == '6').length, // Lost Customer
    //                     this.newCustomerList.filter((element: any) => element.source_id == '7').length, // Google Marketing
    //                     this.newCustomerList.filter((element: any) => element.source_id == '8').length, // Whatsapp Campaign
    //                     this.newCustomerList.filter((element: any) => element.source_id == '9').length, // Whatsapp Direct
    //                     this.newCustomerList.filter((element: any) => element.source_id == '10').length, // WhatsApp Ser Due
    //                 ],
    //             },
    //         ],
    //         chart: {
    //             height: 350,
    //             type: 'bar',
    //         },
    //         colors: [
    //             '#4bb6e3', // Phone Call
    //             '#28714e', // Social Media
    //             '#375b62', // SA Direct
    //             '#317edd', // CRE WhatsApp
    //             '#922628', // Direct Lead
    //             '#f39c12', // Lost Customer
    //             '#8e44ad', // Google Marketing
    //             '#16a085', // Whatsapp Campaign
    //             '#e67e22', // Whatsapp Direct
    //             '#2c3e50', // WhatsApp Ser Due
    //         ],
    //         plotOptions: {
    //             bar: {
    //                 columnWidth: '45%',
    //                 distributed: true,
    //             },
    //         },
    //         dataLabels: {
    //             enabled: false,
    //         },
    //         legend: {
    //             show: true,
    //         },
    //         grid: {
    //             show: true,
    //         },
    //         xaxis: {
    //             categories: [
    //                 ['Phone', 'Call'],
    //                 ['Social', 'Media'],
    //                 ['SA', 'Direct'],
    //                 ['CRE', 'WhatsApp'],
    //                 ['Direct', 'Lead'],
    //                 ['Lost', 'Customer'],
    //                 ['Google', 'Marketing'],
    //                 ['Whatsapp', 'Campaign'],
    //                 ['Whatsapp', 'Direct'],
    //                 ['WhatsApp', 'Ser Due'],
    //             ],
    //             labels: {
    //                 style: {
    //                     colors: ['#4bb6e3', '#28714e', '#375b62', '#317edd', '#922628', '#f39c12', '#8e44ad', '#16a085', '#e67e22', '#2c3e50'],
    //                     fontSize: '12px',
    //                 },
    //             },
    //         },
    //     };
    // }

    // filterCustomers(Num: any) {
    //     if (this.tab4 == 'jobcard') {
    //         if (Num == 0) {
    //             this.newCustomerList = this.allNewCustomerList;
    //         } else if (Num == 20) {
    //             this.newCustomerList = this.directCustomers;
    //         } else if (Num == 15) {
    //             this.newCustomerList = this.allNewCustomerList.filter((cust: any) => cust.job_status === 'INV');
    //         } else if (Num == 16) {
    //             this.newCustomerList = this.allNewCustomerList.filter((cust: any) => cust.job_open_date);
    //         } else if (Num == 17) {
    //             const dateFrom = this.normalizeToDateOnly(new Date(this.dateFrom));
    //             this.newCustomerList = this.allNewCustomerList.filter((cust: any) => {
    //                 const leadDate = new Date(cust.lead_createdon);
    //                 return leadDate >= dateFrom;
    //             });
    //         } else if (Num == 18) {
    //             const dateFrom = this.normalizeToDateOnly(new Date(this.dateFrom));
    //             this.newCustomerList = this.allNewCustomerList.filter((cust: any) => {
    //                 if (!cust.lead_createdon) return false;
    //                 const leadDate = new Date(cust.lead_createdon);
    //                 return leadDate < dateFrom;
    //             });
    //         } else if (Num == 21) {
    //             this.newCustomerList = this.allNewCustomerList.filter((element: any) => element.source_id == '1' && element.departmentId == '1');
    //         } else if (Num == 22) {
    //             this.newCustomerList = this.allNewCustomerList.filter((element: any) => element.source_id == '1' && element.departmentId == '2');
    //         } else {
    //             this.newCustomerList = this.allNewCustomerList.filter((customer) => customer.source_id == Num);
    //         }
    //     } else {
    //         if (Num == 25) {
    //             this.newLeadList = this.allNewLeadsList;
    //         } else if (Num == 26) {
    //             this.newLeadList = this.allNewLeadsList.filter((cust: any) => cust.first_job_date);
    //         } else if (Num == 27) {
    //             this.newLeadList = this.allNewLeadsList.filter((cust: any) => cust.job_status === 'INV');
    //         } else if (Num == 29) {
    //             this.newLeadList = this.allNewLeadsList.filter((element: any) => element.source_id == '1' && element.departmentId == '1');
    //         } else if (Num == 30) {
    //             this.newLeadList = this.allNewLeadsList.filter((element: any) => element.source_id == '1' && element.departmentId == '2');
    //         } else {
    //             this.newLeadList = this.allNewLeadsList.filter((customer) => customer.source_id == Num);
    //         }
    //     }
    // }
    filterCustomers(Num: any) {
        const dateFrom = this.normalizeToDateOnly(new Date(this.dateFrom));
        const applyFilter = (list: any[], type: 'jobcard' | 'lead') => {
            switch (Num) {
                case 0:
                    return this.allNewCustomerList;
                case 20:
                    return this.directCustomers;
                case 15:
                    return list.filter((cust: any) => cust.job_status === 'INV');
                case 16:
                    return list.filter((cust: any) => !!cust.job_open_date);
                case 17:
                    return list.filter((cust: any) => {
                        if (!cust.lead_createdon) return false;

                        const leadDate = new Date(cust.lead_createdon);

                        // compare year + month as a single number (YYYYMM)
                        const leadYearMonth = leadDate.getFullYear() * 100 + leadDate.getMonth();
                        const fromYearMonth = dateFrom.getFullYear() * 100 + dateFrom.getMonth();

                        return leadYearMonth >= fromYearMonth;
                    });

                case 18:
                    return list.filter((cust: any) => {
                        if (!cust.lead_createdon) return false;

                        const leadDate = new Date(cust.lead_createdon);

                        // convert both to YYYYMM format
                        const leadYearMonth = leadDate.getFullYear() * 100 + leadDate.getMonth();
                        const fromYearMonth = dateFrom.getFullYear() * 100 + dateFrom.getMonth();

                        // include all months earlier than dateFrom
                        return leadYearMonth < fromYearMonth;
                    });
                case 21:
                    return list.filter((cust: any) => cust.source_id == '1' && cust.departmentId == '1');
                case 22:
                    return list.filter((cust: any) => cust.source_id == '1' && cust.departmentId == '2');
                case 25: // Lead Tab: All Leads
                    return this.allNewLeadsList;
                case 26:
                    return list.filter((cust: any) => !!cust.first_job_date);
                case 27:
                    return list.filter((cust: any) => cust.job_status === 'INV');
                case 29:
                    return list.filter((cust: any) => cust.source_id == '1' && cust.departmentId == '1');
                case 30:
                    return list.filter((cust: any) => cust.source_id == '1' && cust.departmentId == '2');
                case 40:
                    return this.invCurrentMonthCust;
                case 41:
                    return this.invPreviousMonthCust;
                case 42:
                    return this.invDirectCustomers;
                case 43:
                    return this.invWhatsappDirect;
                case 44:
                    return this.invWhatsappCampaign;
                case 45:
                    return this.invGoogleMarketing;
                case 46:
                    return this.invSocialMedia;
                case 47:
                    return this.invMarketingCall;
                case 48:
                    return this.invSADirect;
                case 49:
                    return this.invDirectLead;
                case 50:
                    return this.invLostCustomer;
                case 51:
                    return this.invCreWhatsapp;
                case 52:
                    return this.invWhatsappSerDue;
                case 53:
                    return this.invNonMarketingCall;
                case 54:
                    return this.lHotLeads;
                case 55:
                    return this.lWarmLeads;
                case 56:
                    return this.lColdLeads;
                case 57:
                    return this.misMatchCustomers;
                case 58:
                    return [...this.lHotLeads, ...this.lWarmLeads, ...this.callLeadHotCustomers];
                case 59:
                    return [...this.lHotLeads, ...this.callLeadHotCustomers];
                case 60:
                    return this.lWarmLeads;
                case 61:
                    return [...this.lColdLeads, ...this.callColdCustomers];
                // case 62:
                //     return this.misMatchCustomers;
                // case 63:
                //     return this.misMatchCustomers;
                case 64:
                    return [...this.lHotLeads, ...this.lWarmLeads];
                case 65:
                    return this.lHotLeads;
                case 66:
                    return this.lWarmLeads;
                case 67:
                    return this.lColdLeads;
                case 68:
                    return this.lColdLeads;
                case 69:
                    return this.lColdLeads;
                case 70:
                    return this.callLeadHotCustomers;
                case 71:
                    return this.callColdCustomers;
                case 99:
                    return this.allInvNewCustomers;
                default:
                    return list.filter((cust: any) => cust.source_id == Num);
            }
        };

        if (this.tab4 === 'jobcard') {
            this.newCustomerList = applyFilter(this.allNewCustomerList, 'jobcard');
            this.selectedCustomer = Num;
        } else {
            this.newLeadList = applyFilter(this.allNewLeadsList, 'lead');
            this.selectedCustomerType = Num;
        }
    }

    //Leads

    fetchAllNewCustomerLeads() {
        this.l_load_flag = true;
        this.allNewLeadsList = [];
        this.newLeadList = [];
        this.lmarketingCall = [];
        this.lnonMarketingCall = [];
        this.lphoneCall = [];
        this.lsocialMedia = [];
        this.lsaDirect = [];
        this.lcreWhatsapp = [];
        this.ldirectLead = [];
        this.llostCustomer = [];
        this.lgoogleMarketing = [];
        this.lwhatsappCampaign = [];
        this.lwhatsappDirect = [];
        this.lwhatsappSerDue = [];
        this.lcurrentMonthCust = [];
        this.lpreviousMonthCust = [];
        this.lnewCustomerList = [];
        this.lwhatsappLeads = [];
        this.lHotLeads = [];
        this.lWarmLeads = [];
        this.lColdLeads = [];
        this.callLeadHotCustomers = [];
        this.whOpenedjobcards = [];

        let data = {
            dateFrom: this.ldateFrom,
            dateTo: this.ldateTo,
            sourceId: this.lsource ? this.lsource : 0,
        };

        this.userServices.fetchAllNewCustomerLeads(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.selectedCustomerType = 25;
                const leadSourceMap = this.sourceList.reduce((acc: any, item: any) => {
                    acc[item.ld_src_id] = item.ld_src;
                    return acc;
                }, {});

                const purposeMapping: any = {
                    '1': 'Appointment',
                    '2': 'Campaign Enquiry',
                    '3': 'Service Request / Quotation',
                    '4': 'Parts Enquiry',
                    '6': 'Feedback / PSF',
                    '7': 'Others',
                    '8': 'Status Enquiry',
                    '9': 'Wrong Number',
                    '10': 'General Enquiry',
                };

                // Assign lead source details
                rdata.customers.forEach((element: any) => {
                    element.lead_purpose = purposeMapping[element.purpose_id] || 'NIL';
                    element.lead_source_detail = leadSourceMap[element.source_id] || 'NIL';
                    if (!element.customer_name || element.customer_name.trim() === '') {
                        element.customer_name = element.name;
                    }
                });

                let phnnum = rdata.customers.filter((customer: any) => customer.source_id === '1').map((customer: any) => customer.phone);
                let inData = {
                    customers: phnnum,
                    call_type: 'Inbound',
                };
                this.allNewLeadsList = rdata.customers;

                // let whatsappLeads = rdata.customers.filter(
                //     (customer: any) =>
                //         (customer.source_id == '8' || customer.source_id == '9') );

                // console.log("whatsapp leads>>>>>>>>>>>>>>>>>>",whatsappLeads)

                this.lwhatsappLeads = rdata.customers.filter(
                    (customer: any) =>
                        (customer.source_id == '8' || customer.source_id == '9') &&
                        (customer.lead_category == '0' || customer.lead_category == '1' || customer.lead_category == '2')
                );
                this.lHotLeads = rdata.customers.filter(
                    (customer: any) => (customer.source_id == '8' || customer.source_id == '9') && customer.lead_category == '2'
                );
                this.lWarmLeads = rdata.customers.filter(
                    (customer: any) => (customer.source_id == '8' || customer.source_id == '9') && customer.lead_category == '1'
                );
                this.lColdLeads = rdata.customers.filter(
                    (customer: any) => (customer.source_id == '8' || customer.source_id == '9') && customer.lead_category == '0'
                );
                this.callLeadHotCustomers = rdata.customers.filter((customer: any) => customer.source_id == '1' && customer.lead_category == '2');
                this.callColdCustomers = rdata.customers.filter((customers: any) => customers.source_id == '1' && customers.lead_category == '0');

                this.userServices.getInboundCalldetails(inData).subscribe((rdata: any) => {
                    if (rdata.ret_data === 'success') {
                        this.allNewLeadsList.forEach((lead) => {
                            // Set default
                            lead.department = 'Non-Marketing';
                            lead.departmentId = '2';

                            // Flatten all call records from rdata.customer
                            const allCalls = rdata.customer.flat();

                            // Find a matching call
                            const matchedCall = allCalls.find(
                                (call: any) =>
                                    call &&
                                    call.calltype === 'Inbound' &&
                                    call.srctrunk === '025503556' &&
                                    call.uniqueid == lead.ystar_call_id &&
                                    lead.phone?.slice(-9) === call.src?.slice(-9) &&
                                    lead.source_id === '1' &&
                                    call.dst !== '6300'
                            );

                            // If a match is found, update to Marketing
                            if (matchedCall) {
                                lead.department = 'Marketing';
                                lead.departmentId = '1';
                            }
                        });
                        // this.allNewLeadsList.forEach((element) => {
                        //     element.department = 'Non-Marketing';
                        //     element.departmentId = '2';
                        //     rdata.customer.forEach((element2: any) => {
                        //         element2.forEach((calls: any) => {
                        //             if (calls && calls.calltype === 'Inbound' && calls.srctrunk === '025503556' && calls.uniqueid == element.ystar_call_id &&
                        //                 element.phone?.slice(-9) === calls.src?.slice(-9) && element.source_id == '1' && calls.dst != '6300'
                        //             ) {
                        //                 element.department = 'Marketing';
                        //                 element.departmentId = '1';
                        //             }
                        //         });
                        //     });
                        // });
                        this.newLeadList = this.allNewLeadsList;
                        this.whOpenedjobcards = this.allNewLeadsList.filter(
                            (customer: any) =>
                                (customer.source_id == '8' || customer.source_id == '9') && customer.first_job_date != null && customer.first_job_date != ''
                        );
                        this.lopenjobcards = this.allNewLeadsList.filter((customer: any) => customer.first_job_date != null && customer.first_job_date != '');
                        this.linvoicedjobcard = this.allNewLeadsList.filter(
                            (customer: any) => customer.first_job_date != null && customer.first_job_date != '' && customer.job_status == 'INV'
                        );

                        if (this.allNewLeadsList.length > 0) {
                            this.lmarketingCall = this.allNewLeadsList.filter((element: any) => element.source_id == '1' && element.departmentId == '1');
                            this.lnonMarketingCall = this.allNewLeadsList.filter((element: any) => element.source_id == '1' && element.departmentId == '2');
                            this.lphoneCall = this.allNewLeadsList.filter((element: any) => element.source_id == '1'); // Phone Call
                            this.lsocialMedia = this.allNewLeadsList.filter((element: any) => element.source_id == '2'); // Social Media
                            this.lsaDirect = this.allNewLeadsList.filter((element: any) => element.source_id == '3'); // SA Direct
                            this.lcreWhatsapp = this.allNewLeadsList.filter((element: any) => element.source_id == '4'); // CRE WhatsApp
                            this.ldirectLead = this.allNewLeadsList.filter((element: any) => element.source_id == '5'); // Direct Lead
                            this.llostCustomer = this.allNewLeadsList.filter((element: any) => element.source_id == '6'); // Lost Customer
                            this.lgoogleMarketing = this.allNewLeadsList.filter((element: any) => element.source_id == '7'); // Google Marketing
                            this.lwhatsappCampaign = this.allNewLeadsList.filter((element: any) => element.source_id == '8'); // Whatsapp Campaign
                            this.lwhatsappDirect = this.allNewLeadsList.filter((element: any) => element.source_id == '9'); // Whatsapp Direct
                            this.lwhatsappSerDue = this.allNewLeadsList.filter((element: any) => element.source_id == '10'); // WhatsApp Ser Due
                            // this.callLeadHotCustomers = this.allNewLeadsList.filter((element: any) => element.source_id == '1' && element.lead_category == '2'); //customers with hot lead in calls

                            this.lnewCustomerList = this.allNewLeadsList;
                            this.l_load_flag = false;
                        }
                    } else {
                        this.newLeadList = this.allNewLeadsList;
                        this.whOpenedjobcards = this.allNewLeadsList.filter(
                            (customer: any) =>
                                (customer.source_id == '8' || customer.source_id == '9') && customer.first_job_date != null && customer.first_job_date != ''
                        );
                        this.lopenjobcards = this.allNewLeadsList.filter((customer: any) => customer.first_job_date != null && customer.first_job_date != '');
                        this.linvoicedjobcard = this.allNewLeadsList.filter(
                            (customer: any) => customer.first_job_date != null && customer.first_job_date != '' && customer.job_status == 'INV'
                        );

                        if (this.allNewLeadsList.length > 0) {
                            this.lmarketingCall = this.allNewLeadsList.filter((element: any) => element.source_id == '1' && element.departmentId == '1');
                            this.lnonMarketingCall = this.allNewLeadsList.filter((element: any) => element.source_id == '1' && element.departmentId == '2');
                            this.lphoneCall = this.allNewLeadsList.filter((element: any) => element.source_id == '1'); // Phone Call
                            this.lsocialMedia = this.allNewLeadsList.filter((element: any) => element.source_id == '2'); // Social Media
                            this.lsaDirect = this.allNewLeadsList.filter((element: any) => element.source_id == '3'); // SA Direct
                            this.lcreWhatsapp = this.allNewLeadsList.filter((element: any) => element.source_id == '4'); // CRE WhatsApp
                            this.ldirectLead = this.allNewLeadsList.filter((element: any) => element.source_id == '5'); // Direct Lead
                            this.llostCustomer = this.allNewLeadsList.filter((element: any) => element.source_id == '6'); // Lost Customer
                            this.lgoogleMarketing = this.allNewLeadsList.filter((element: any) => element.source_id == '7'); // Google Marketing
                            this.lwhatsappCampaign = this.allNewLeadsList.filter((element: any) => element.source_id == '8'); // Whatsapp Campaign
                            this.lwhatsappDirect = this.allNewLeadsList.filter((element: any) => element.source_id == '9'); // Whatsapp Direct
                            this.lwhatsappSerDue = this.allNewLeadsList.filter((element: any) => element.source_id == '10'); // WhatsApp Ser Due

                            this.lnewCustomerList = this.allNewLeadsList;
                            this.l_load_flag = false;
                        }
                    }
                });
            } else {
                this.coloredToast('danger', 'No new leads found for the selected filters. Try changing the date range or lead source.');
                this.l_load_flag = false;
            }
        });
    }

    parseJobDate(dateStr: string): Date | null {
        const monthMap: { [key: string]: number } = {
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

        if (!dateStr) return null;
        const parts = dateStr.split('-');
        if (parts.length !== 3) return null;

        const day = parseInt(parts[0], 10);
        const month = monthMap[parts[1].toUpperCase()];
        let year = parseInt(parts[2], 10);

        if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

        // Assume year like "25" = 2025
        year += year < 50 ? 2000 : 1900;

        return new Date(year, month, day);
    }

    normalizeToDateOnly(date: Date): Date {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
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
