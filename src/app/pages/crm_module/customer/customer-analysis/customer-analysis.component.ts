import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';

@Component({
    selector: 'app-customer-analysis',
    templateUrl: './customer-analysis.component.html',
    styleUrls: ['./customer-analysis.component.css'],
})
export class CustomerAnalysisComponent implements OnInit {
    @ViewChild('calllogmodal') calllogmodal: any;
    tab7 = 'home';
    public dateFrom: any = this.datePipe.transform(moment(new Date()).startOf('month').toDate(), 'yyyy-MM-dd') || '';
    public dateTo: any = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
    // public userList: any[] = [];
    public customers: any[] = [];
    public allCustomers: any[] = [];
    // public existingCustomers: any[] = [];
    // public newCustomers: any[] = [];
    public search = '';
    public load_flag: boolean = true;
    public selectedSource: any;
    public calllogphn: any = [];
    // public filteredCustomersBySource: any = [];
    public sourceCounts: any = [];
    public load_flag_2: boolean = true;
    public columnChart: any;
    public chartFlag: boolean = false;

    public leadSources: { [key: number]: string } = {
        // 0: 'Existing',
        1: 'Phone Call',
        2: 'Social Media',
        3: 'Website',
        4: 'Campaigns',
        5: 'Direct Lead',
        6: 'Lost Customer',
        7: 'Google Marketing',
        8: 'Whatsapp Campaign',
        9: 'Whatsapp Direct',
    };

    public jobcardStatus: any = {
        openJobcard: [],
        wipJobcard: [],
        invJobcard: [],
        closedJobcard: [],
    };

    cols = [
        { field: 'customer_no', title: 'Code', isUnique: true, hide: false },
        { field: 'cust_phone', title: 'Number', hide: false },
        { field: 'customer_name', title: 'Customer', hide: false },
        // { field: 'customer_Type', title: 'Type', hide: false },
        { field: 'created_on', title: 'Created Date', hide: false },
        { field: 'job_open_date', title: 'Job Open Date', hide: false },
        { field: 'ld_src', title: 'Source' },
        { field: 'job_no', title: 'Job No' },
        { field: 'job_status', title: 'Job Status', hide: false },
        { field: 'user_name', title: 'Job Assigned', hide: false },
        { field: 'invoice_date', title: 'Invoice Date', hide: false },
        // { field: 'action', title: 'Action', hide: false },
    ];

    constructor(private userServices: StaffPostAuthService, private cdRef: ChangeDetectorRef, public router: Router, public datePipe: DatePipe) {
        // this.userServices.userList().subscribe((rData: any) => {
        //     if (rData.ret_data == 'success') {
        //         this.userList = rData.userList; //.filter((item: any) => item.us_laabs_id !== null)
        //     }
        // });
    }

    ngOnInit(): void {
        this.getCustomerAnalysisReport(0);
    }

    getCustomerAnalysisReport(num: any) {
        this.load_flag = true;
        this.allCustomers = [];
        this.customers = [];
        this.jobcardStatus = {
            openJobcard: [],
            wipJobcard: [],
            invJobcard: [],
            closedJobcard: [],
        };
        let data = {};
        if (num == 0) {
            data = {
                dateFrom: this.dateFrom,
                dateTo: this.dateTo,
                source: 0,
            };
        } else {
            data = {
                dateFrom: this.dateFrom,
                dateTo: this.dateTo,
                source: 1,
            };
        }

        this.userServices.getCustomerAnalysisReport(data).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.allCustomers = rData.customers;
                // this.existingCustomers = rData.customers.filter((customers: any) => customers.cust_source == 0);
                // this.newCustomers = rData.customers.filter((customers: any) => customers.cust_source != 0);
                // if (this.tab7 == 'home') {
                //     this.allCustomers = this.existingCustomers;
                // } else {
                //     this.allCustomers = this.newCustomers;
                // }

                this.customers = this.allCustomers;

                this.jobcardStatus.openJobcard = this.allCustomers.filter((jobcard) => jobcard.job_status === 'OPN');
                this.jobcardStatus.wipJobcard = this.allCustomers.filter((jobcard) => jobcard.job_status === 'WIP');
                this.jobcardStatus.invJobcard = this.allCustomers.filter((jobcard) => jobcard.job_status === 'INV');
                this.jobcardStatus.closedJobcard = this.allCustomers.filter(
                    (jobcard) => jobcard.job_status === 'SUS' || jobcard.job_status === 'CAN' || jobcard.job_status === 'CLO'
                );

                this.calculateSourceCounts();

                this.load_flag = false;
            } else {
                this.allCustomers = [];
                this.customers = [];
                this.load_flag = false;
            }
        });
    }

    calculateSourceCounts() {
        for (let i = 0; i <= 9; i++) {
            this.sourceCounts[i] = 0;
        }

        for (const customer of this.allCustomers) { //this.jobcardStatus.invJobcard
            const source = customer.cust_source;
            console.log('source>>>>>>>>>>>', source);
            switch (source) {
                // case '0':
                //     this.sourceCounts[0]++;
                //     break;
                case '1':
                    this.sourceCounts[1]++;
                    break;
                case '2':
                    this.sourceCounts[2]++;
                    break;
                case '3':
                    this.sourceCounts[3]++;
                    break;
                case '4':
                    this.sourceCounts[4]++;
                    break;
                case '5':
                    this.sourceCounts[5]++;
                    break;
                case '6':
                    this.sourceCounts[6]++;
                    break;
                case '7':
                    this.sourceCounts[7]++;
                    break;
                case '8':
                    this.sourceCounts[8]++;
                    break;
                case '9':
                    this.sourceCounts[9]++;
                    break;
                default:
                    break;
            }
        }

        this.chartFlag = this.sourceCounts.some((count: any) => count != 0);

        this.columnChart = {
            series: [
                {
                    name: 'distibuted',
                    data: [
                        // this.sourceCounts[0],
                        this.sourceCounts[1],
                        this.sourceCounts[2],
                        this.sourceCounts[3],
                        this.sourceCounts[4],
                        this.sourceCounts[5],
                        this.sourceCounts[6],
                        this.sourceCounts[7],
                        this.sourceCounts[8],
                        this.sourceCounts[9],
                    ],
                },
            ],
            chart: {
                height: 350,
                type: 'bar',
                events: {
                    click: function (chart: any, w: any, e: any) {
                        // console.log(chart, w, e)
                    },
                },
            },
            colors: [
                // '#4CAF50', // Existing
                '#2196F3', // Phone Call
                '#FF5722', // Social Media
                '#FFC107', // Website
                '#9C27B0', // Campaigns
                '#3F51B5', // Direct Lead
                '#FF9800', // Lost Customer
                '#009688', // Google Marketing
                '#607D8B', // Whatsapp Campaign
                '#795548', // Whatsapp Direct
            ],
            plotOptions: {
                bar: {
                    columnWidth: '45%',
                    distributed: true,
                },
            },
            dataLabels: {
                enabled: false,
            },
            legend: {
                show: false,
            },
            grid: {
                show: false,
            },
            xaxis: {
                // categories: [
                //     ['John', 'Doe'],
                //     ['Joe', 'Smith'],
                //     ['Jake', 'Williams'],
                //     'Amber',
                //     ['Peter', 'Brown'],
                //     ['Mary', 'Evans'],
                //     ['David', 'Wilson'],
                //     ['Lily', 'Roberts'],
                // ],
                categories: Object.values(this.leadSources),
                labels: {
                    style: {
                        colors: [
                            // '#4CAF50', // Existing
                            '#2196F3', // Phone Call
                            '#FF5722', // Social Media
                            '#FFC107', // Website
                            '#9C27B0', // Campaigns
                            '#3F51B5', // Direct Lead
                            '#FF9800', // Lost Customer
                            '#009688', // Google Marketing
                            '#607D8B', // Whatsapp Campaign
                            '#795548', // Whatsapp Direct
                        ],
                        fontSize: '12px',
                    },
                },
            },
        };

        this.load_flag_2 = false;

        // this.columnChart = {
        //     series: [
        //         {
        //             name: 'Total Customer',
        //             data: this.getDatasetData(this.count),
        //         },
        //         {
        //             name: 'Total Converted Customers',
        //             data: this.getDatasetData(this.pcust_cnvt),
        //         },
        //         {
        //             name: 'Total Marketing Converted Customers',
        //             data: this.getDatasetData(this.mrkcnvtcust),
        //         },
        //     ],
        //     chart: {
        //         height: 300,
        //         type: 'bar',
        //         zoom: {
        //             enabled: false,
        //         },
        //         toolbar: {
        //             show: false,
        //         },
        //     },
        //     colors: ['#00CDAC', '#02AABD', '#C6EA8D'],
        //     dataLabels: {
        //         enabled: false,
        //     },
        //     stroke: {
        //         show: true,
        //         width: 2,
        //         colors: ['transparent'],
        //     },
        //     plotOptions: {
        //         bar: {
        //             horizontal: false,
        //             columnWidth: '55%',
        //             endingShape: 'rounded',
        //         },
        //     },
        //     grid: {
        //         borderColor: '#e0e6ed',
        //     },
        //     xaxis: {
        //         categories: this.getMonthNames(this.month),
        //         axisBorder: {
        //             color: '#e0e6ed',
        //         },
        //     },
        //     // yaxis: {
        //     //     opposite: isRtl ? true : false,
        //     //     labels: {
        //     //         offsetX: isRtl ? -10 : 0,
        //     //     },
        //     // },
        //     tooltip: {
        //         //theme: isDark ? 'dark' : 'light',
        //         y: {
        //             formatter: function (val: any) {
        //                 return val;
        //             },
        //         },
        //     },
        // };

        console.log(this.sourceCounts); // Log the counts array
    }

    openCallLogs(data: any) {
        this.calllogphn = {
            phone: data,
        };
        this.calllogmodal.open();
    }

    callhistoryModal() {
        this.calllogmodal.close();
    }

    getCustomerCountBySource(source: any) {
        return this.customers.filter((customer) => customer.cust_source === source).length;
    }

    filterCustomers(source: any): void {
        this.customers = [];
        this.selectedSource = source;
        if (source == 15) {
            this.customers = this.allCustomers;
        } else if (source == 16) {
            this.customers = this.jobcardStatus.openJobcard;
        } else if (source == 17) {
            this.customers = this.jobcardStatus.invJobcard;
        } else if (source == 18) {
            this.customers = this.jobcardStatus.wipJobcard;
        } else if (source == 19) {
            this.customers = this.jobcardStatus.closedJobcard;
        } else {
            this.customers = this.allCustomers.filter((customer) => customer.cust_source == source);
        }
    }

    formatSourceClass(value: string): string {
        return value.toLowerCase().replace(/ /g, '-');
    }
}
