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
    public userList: any[] = [];
    public customers: any[] = [];
    public allCustomers: any[] = [];
    // public existingCustomers: any[] = [];
    // public newCustomers: any[] = [];
    public search = '';
    public load_flag: boolean = true;
    public selectedSource: any = 15;
    public calllogphn: any = [];
    // public filteredCustomersBySource: any = [];
    public sourceCounts: any = [];
    public load_flag_2: boolean = true;
    public columnChart: any;
    public chartFlag: boolean = false;
    public selectedSA: any = '0';
    public sourceNilCustomers: any = '0';
    public tableHeading: string = this.tab7 == 'home' ? 'Existing Customer Details' : 'New Customer Details';

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

    public customerSources = [
        { id: 1, name: 'Phone Call', convertedCount: 0, totalCount: [] as any[] },
        { id: 2, name: 'Social Media', convertedCount: 0, totalCount: [] as any[] },
        { id: 3, name: 'Website', convertedCount: 0, totalCount: [] as any[] },
        { id: 4, name: 'Campaigns', convertedCount: 0, totalCount: [] as any[] },
        { id: 5, name: 'Direct Lead', convertedCount: 0, totalCount: [] as any[] },
        { id: 6, name: 'Lost Customer', convertedCount: 0, totalCount: [] as any[] },
        { id: 7, name: 'Google Marketing', convertedCount: 0, totalCount: [] as any[] },
        { id: 8, name: 'Whatsapp Campaign', convertedCount: 0, totalCount: [] as any[] },
        { id: 9, name: 'Whatsapp Direct', convertedCount: 0, totalCount: [] as any[] },
    ];

    public jobcardStatus: any = {
        openJobcard: [],
        wipJobcard: [],
        invJobcard: [],
        closedJobcard: [],
        tstJobcard: [],
        susJobcard: [],
        canJobcard: [],
        comJobcard: [],
    };

    cols = [
        { field: 'customer_no', title: 'Code', isUnique: true, hide: false },
        { field: 'phone', title: 'Number', hide: false },
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
        this.userServices.userList().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.userList = rData.userList.filter((item: any) => item.us_laabs_id !== null);
            }
        });
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
            tstJobcard: [],
            susJobcard: [],
            canJobcard: [],
            comJobcard: [],
        };
        this.customerSources = [
            { id: 1, name: 'Phone Call', convertedCount: 0, totalCount: [] as any[] },
            { id: 2, name: 'Social Media', convertedCount: 0, totalCount: [] as any[] },
            { id: 3, name: 'Website', convertedCount: 0, totalCount: [] as any[] },
            { id: 4, name: 'Campaigns', convertedCount: 0, totalCount: [] as any[] },
            { id: 5, name: 'Direct Lead', convertedCount: 0, totalCount: [] as any[] },
            { id: 6, name: 'Lost Customer', convertedCount: 0, totalCount: [] as any[] },
            { id: 7, name: 'Google Marketing', convertedCount: 0, totalCount: [] as any[] },
            { id: 8, name: 'Whatsapp Campaign', convertedCount: 0, totalCount: [] as any[] },
            { id: 9, name: 'Whatsapp Direct', convertedCount: 0, totalCount: [] as any[] },
        ];
        let data = {};
        if (num == 0) {
            this.tableHeading = 'Existing Customer Details';
            data = {
                dateFrom: this.dateFrom,
                dateTo: this.dateTo,
                source: 0,
                us_id: this.selectedSA,
            };
        } else {
            this.tableHeading = 'New Customer Details';
            data = {
                dateFrom: this.dateFrom,
                dateTo: this.dateTo,
                source: 1,
                us_id: this.selectedSA,
            };
        }

        this.userServices.getCustomerAnalysisReport(data).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                if (num == 0) {
                    this.allCustomers = rData.customers.filter((job: any) => job.old_jobcard != null);
                } else {
                    this.allCustomers = rData.customers.filter((job: any) => job.old_jobcard == null);
                }
                //this.allCustomers = rData.customers;
                // this.existingCustomers = rData.customers.filter((customers: any) => customers.cust_source == 0);
                // this.newCustomers = rData.customers.filter((customers: any) => customers.cust_source != 0);
                // if (this.tab7 == 'home') {
                //     this.allCustomers = this.existingCustomers;
                // } else {
                //     this.allCustomers = this.newCustomers;
                // }

                this.allCustomers = this.allCustomers.map((element) => {
                    if (element.cust_source in this.leadSources) {
                        element['ld_src'] = this.leadSources[element.cust_source];
                    } else {
                        element['ld_src'] = 'NIL';
                    }
                    return element;
                });

                this.customers = this.allCustomers;

                this.jobcardStatus.openJobcard = this.allCustomers.filter((jobcard) => jobcard.job_status === 'OPN');
                this.jobcardStatus.wipJobcard = this.allCustomers.filter((jobcard) => jobcard.job_status == 'WIP');
                this.jobcardStatus.invJobcard = this.allCustomers.filter((jobcard) => jobcard.job_status === 'INV');
                this.jobcardStatus.closedJobcard = this.allCustomers.filter((jobcard) => jobcard.job_status === 'CLO');
                this.jobcardStatus.tstJobcard = this.allCustomers.filter((jobcard) => jobcard.job_status === 'TST');
                this.jobcardStatus.susJobcard = this.allCustomers.filter((jobcard) => jobcard.job_status === 'SUS');
                this.jobcardStatus.canJobcard = this.allCustomers.filter((jobcard) => jobcard.job_status === 'CAN');
                this.jobcardStatus.comJobcard = this.allCustomers.filter((jobcard) => jobcard.job_status === 'COM');

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
        // for (let i = 0; i <= 9; i++) {
        //     this.sourceCounts[i] = 0;
        // }

        // for (const customer of this.allCustomers) {
        //     //this.jobcardStatus.invJobcard
        //     const source = customer.cust_source;
        //     console.log('source>>>>>>>>>>>', source);
        //     switch (source) {
        //         // case '0':
        //         //     this.sourceCounts[0]++;
        //         //     break;
        //         case '1':
        //             this.sourceCounts[1]++;
        //             break;
        //         case '2':
        //             this.sourceCounts[2]++;
        //             break;
        //         case '3':
        //             this.sourceCounts[3]++;
        //             break;
        //         case '4':
        //             this.sourceCounts[4]++;
        //             break;
        //         case '5':
        //             this.sourceCounts[5]++;
        //             break;
        //         case '6':
        //             this.sourceCounts[6]++;
        //             break;
        //         case '7':
        //             this.sourceCounts[7]++;
        //             break;
        //         case '8':
        //             this.sourceCounts[8]++;
        //             break;
        //         case '9':
        //             this.sourceCounts[9]++;
        //             break;
        //         default:
        //             break;
        //     }
        // }

        for (let i = 0; i < this.allCustomers.length; i++) {
            let customer = this.allCustomers[i];
            let source = parseInt(customer.cust_source, 10);
            let jobStatus = customer.job_status;
            let sourceData = this.customerSources.find((src) => src.id === source);

            if (sourceData) {
                sourceData.totalCount.push(customer);
                if (jobStatus === 'INV') {
                    sourceData.convertedCount++;
                }
            }
        }
        this.sourceNilCustomers = this.allCustomers.filter((customer) => customer.cust_source == null || customer.cust_source == 0).length;

        this.chartFlag = this.customerSources.some((count: any) => count.convertedCount != 0);


        this.columnChart = {
            series: [
                {
                    // name: 'distibuted',
                    data: [
                        // this.sourceCounts[0],
                        this.customerSources[0].convertedCount,
                        this.customerSources[1].convertedCount,
                        this.customerSources[2].convertedCount,
                        this.customerSources[3].convertedCount,
                        this.customerSources[4].convertedCount,
                        this.customerSources[5].convertedCount,
                        this.customerSources[6].convertedCount,
                        this.customerSources[7].convertedCount,
                        this.customerSources[8].convertedCount,
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
        if (source == 12) {
            this.customers = this.allCustomers;
            this.tableHeading = this.tab7 == 'home' ? 'Existing Customer Details' : 'New Customer Details';
        } else if (source == 13) {
            this.customers = this.jobcardStatus.openJobcard;
            this.tableHeading = 'Open Jobcard Customer Details';
        } else if (source == 14) {
            this.customers = this.jobcardStatus.tstJobcard;
            this.tableHeading = 'Tst Jobcard Customer Details';
        } else if (source == 15) {
            this.customers = this.jobcardStatus.wipJobcard;
            this.tableHeading = 'Wip Jobcard Customer Details';
        } else if (source == 16) {
            this.customers = this.jobcardStatus.invJobcard;
            this.tableHeading = 'Inv Jobcard Customer Details';
        } else if (source == 17) {
            this.customers = this.jobcardStatus.comJobcard;
            this.tableHeading = 'Com Jobcard Customer Details';
        } else if (source == 18) {
            this.customers = this.jobcardStatus.canJobcard;
            this.tableHeading = 'Can Jobcard Customer Details';
        } else if (source == 19) {
            this.customers = this.jobcardStatus.susJobcard;
            this.tableHeading = 'Sus Jobcard Customer Details';
        } else if (source == 20) {
            this.customers = this.jobcardStatus.closedJobcard;
            this.tableHeading = 'Closed Jobcard Customer Details';
        } else if (source == 21) {
            this.customers = this.allCustomers.filter((customer) => customer.cust_source == null || customer.cust_source == 0);
        } else {
            this.customers = this.allCustomers.filter((customer) => customer.cust_source == source);
        }
    }

    formatSourceClass(value: string): string {
        return value.toLowerCase().replace(/ /g, '-');
    }
}
