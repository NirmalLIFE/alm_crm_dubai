import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-dasboard-master',
    templateUrl: './dasboard-master.component.html',
    styleUrls: ['./dasboard-master.component.css'],
})
export class DasboardMasterComponent implements OnInit {
    us_role_id: any;
    public report: any = [];
    public arr_sample: any[] = []; // total inbound calls grouped
    public marketing_calls: any[] = []; // total inbound calls grouped
    public unique_inbound: any[] = [];
    public unique_inbound_marketing: any[] = [];

    public call_rep: any[] = [];
    public load_flag: boolean = true;
    public start_date: any;
    public end_date: any;
    totalmarkcount = 0;
    lostconvert = 0;
    dis_count = 0;
    nonMarketingCount = 0;
    marketingCount = 0;
    dissatisfied_cust: any[] = [];
    customerconverted: any[] = [];
    phnnum: any[] = [];
    callarr: any[] = [];
    marketpercentage: any;
    nonmarketpercentage: any;
    directleadpercentage: any;

    //customer Satisfaction
    radialBarChart: any;
    user_psf_calls: any[] = [];
    totalcsi = 0;
    org_psf_data = {
        extHappy_psf_calls: 0,
        fairlyHappy_psf_calls: 0,
        happy_psf_calls: 0,
        dissatisfied_psf_calls: 0,
    };

    //customer conversion
    pieChart: any;
    customerdata: any[] = [];
    totalcustomer_converted = 0;
    totalcust = 0;
    totalexisting_invoiced = 0;

    //inbound call purpose
    chartOptions: any;
    leads: any[] = [];
    appoint_leads = 0;
    camp_leads = 0;
    sRorQuote_leads = 0;
    partsEnq_leads = 0;
    feedbackORpsf_leads = 0;
    statusEnq_leads = 0;
    genralEnq_leads = 0;
    columnChart: any;

    //New Customer Marketing
    newcustomers: any[] = [];
    areaChart: any;
    public numarray: any[] = [];
    newcust_marketing_chart_flag: boolean = false;

    marketing_chart_flag: boolean = false;

    constructor(public storeData: Store<any>, private userServices: StaffPostAuthService, public datepipe: DatePipe) {
        this.us_role_id = atob(atob(localStorage.getItem('us_role_id') || '{}'));

        const currentDate = new Date();
        currentDate.setDate(1);
        const formattedStartDate = this.datepipe.transform(currentDate, 'yyyy-MM-dd');
        this.start_date = formattedStartDate || '';
        this.end_date = this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '';
    }

    ngOnInit() {
        if (this.us_role_id === '1' || this.us_role_id === '2' || this.us_role_id === '8' || this.us_role_id === '13') {
            this.getCalls();
            this.getCsi();
        }
    }

    getCalls() {
        let data = {
            call_type: 'Inbound',
            start_day: this.start_date + ' 00:00:00',
            end_day: this.end_date + ' 23:59:59',
        };
        this.userServices.getLatestCallReportData(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                let _that = this;
                if (rdata.call_data.length > 0) {
                    let filteredArr = rdata.call_data.filter((data: any) => data.src.length > 5 && data.src != 'Unknown'); // INBOUND CALLS FILTER
                    filteredArr = filteredArr.filter((data: any) => !(data.dst == '6300' && data.disposition == 'ANSWERED')); // REMOVE RINGGROUP AND ANSWERED
                    // console.log(filteredArr);
                    this.arr_sample = filteredArr.reduce((acc: any, call: any) => {
                        const existingGroup = acc.find((group: any) => group.uniqueid === call.uniqueid);

                        if (existingGroup) {
                            existingGroup.call_list.push(call);
                        } else {
                            const newGroup = {
                                call_from: call.src,
                                uniqueid: call.uniqueid,
                                uid: call.uid,
                                src_trunk: call.srctrunk,
                                call_list: [call],
                                date: call.datetime,
                            };
                            acc.push(newGroup);
                        }

                        return acc;
                    }, []);
                    //  console.log("array sample>>>>>>>>>>>>>>>",this.arr_sample);

                    this.userServices.getExcludedNumberList().subscribe((rdata: any) => {
                        if (rdata.ret_data == 'success') {
                            this.arr_sample = this.arr_sample.filter((element) => {
                                return !rdata.numlist.some((element2: any) => {
                                    return (
                                        element.call_from.substring(element.call_from.length - 7) ===
                                        element2.cn_number.substring(element2.cn_number.length - 7)
                                    );
                                });
                            });
                            this.getCount();
                        }
                    });

                    // console.log(this.arr_sample);
                } else {
                    this.load_flag = false;
                    this.coloredToast('danger', 'Issue With Yeastar Token. Try again after some time');
                }
            } else {
                this.load_flag = false;
                this.coloredToast('danger', 'Issue With Yeastar Token. Try again after some time');
            }
        });
    }

    getCount() {
        let data = {
            start_day: this.start_date + ' 00:00:00',
            end_day: this.end_date + ' 23:59:59',
        };
        this.userServices.getDashCounts(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.lostconvert = rdata.lostlistconverted;
                this.dissatisfied_cust = rdata.dissatisfied_cust;
                if (this.dissatisfied_cust) {
                    this.dis_count = this.dissatisfied_cust.filter((a1: any) => a1.ldm_status == 5).length;
                }
            }
        });
        // this.unique_inbound = [...new Set(this.arr_sample.map((group) => group.call_from))];
        // this.marketing_calls = this.arr_sample.filter((a1: any) => a1.src_trunk == '025503556');
        // this.unique_inbound_marketing = [...new Set(this.marketing_calls.map((group) => group.call_from))];
        // console.log('array sample>>>>>>>>>>>>>>>>>', this.arr_sample);
        this.unique_inbound = this.groupBy(this.arr_sample, 'call_from');
        this.arr_sample = this.arr_sample.map((element) => {
            const group = this.unique_inbound.find((g) => g.call_from === element.call_from);
            if (group) {
                if (group.src_trunk === '025503556') {
                    element['department'] = 'marketing';
                } else {
                    element['department'] = 'Non-marketing';
                }
            }
            return element;
        });
        //console.log('unique_inbound', this.unique_inbound);
        //  this.marketing_calls = this.arr_sample.filter((a1: any) => a1.src_trunk == '025503556');
        this.marketing_calls = this.arr_sample.filter((a1: any) => a1.department === 'marketing');
        this.unique_inbound_marketing = this.unique_inbound.filter((a1: any) => a1.src_trunk == '025503556');
        // console.log('unique_inbound>>>>>>>>unique_inbound>>>>>>>>>', this.unique_inbound);
        //  console.log('marketing_calls>>>>>>>>marketing_calls>>>>>>>>>', this.marketing_calls);
        this.totalmarkcount = this.unique_inbound_marketing.length;
        this.getInboundcallPurpose();
    }

    groupBy(arr: any[], key: string) {
        const groupedCalls: { [key: string]: { mainCall: any; callgroups: any[] } } = arr.reduce((result, item) => {
            const groupKey = item[key];
            if (!result[groupKey]) {
                result[groupKey] = { mainCall: item, callgroups: [] };
            } else {
                result[groupKey].callgroups.push(item);
                if (item.date < result[groupKey].mainCall.date) {
                    result[groupKey].mainCall = item;
                }
            }
            return result;
        }, {});
        const result = Object.values(groupedCalls).map(({ mainCall, callgroups }) => ({
            ...mainCall,
            callgroups,
        }));

        return result;
    }

    removeDuplicates(data: any[], property: string): any[] {
        const uniqueValues = new Set();

        return data.filter((item) => {
            const value = item[property];

            if (!uniqueValues.has(value)) {
                uniqueValues.add(value);
                return true;
            }

            return false;
        });
    }

    categorizeIntoWeeks(data: any[]): { [key: string]: any[] } {
        const groupedData: { [key: string]: any[] } = {};
        data.forEach((item) => {
            const createdDate = new Date(item.date);
            const weekNumber = Math.ceil(createdDate.getDate() / 7);

            const weekKey = `Week ${weekNumber}`;

            if (!groupedData[weekKey]) {
                groupedData[weekKey] = [];
            }

            groupedData[weekKey].push(item);
        });

        return groupedData;
    }

    getGraphs() {
        let unqMarketingInbound = this.unique_inbound_marketing; // this.removeDuplicates(this.marketing_calls, 'call_from');
        //  console.log('unqMarketingInbound', unqMarketingInbound);
        unqMarketingInbound.forEach((element: any) => {
            element.appointment = this.leads.some((item: any) => element.call_from === item.phone && item.purpose_id === '1');
            element.conversion = this.leads.some((item: any) => element.call_from === item.phone && item.purpose_id === '1' && item.status_id === '5');
        });
        let groupedData: any = this.categorizeIntoWeeks(unqMarketingInbound);
        // groupedData.forEach((element:any) => {
        //     console.log(element);
        //     // element.ap_count=element.reduce((count:any, item:any) => count + (item.appointment === true ? 1 : 0), 0);
        //     // element.conv_count=element.reduce((count:any, item:any) => count + (item.conversion === true ? 1 : 0), 0);
        // });
        let ap_count_1 = groupedData['Week 1'] ? groupedData['Week 1'].reduce((count: any, item: any) => count + (item.appointment === true ? 1 : 0), 0) : 0;
        let ap_count_2 = groupedData['Week 2'] ? groupedData['Week 2'].reduce((count: any, item: any) => count + (item.appointment === true ? 1 : 0), 0) : 0;
        let ap_count_3 = groupedData['Week 3'] ? groupedData['Week 3'].reduce((count: any, item: any) => count + (item.appointment === true ? 1 : 0), 0) : 0;
        let ap_count_4 = groupedData['Week 4'] ? groupedData['Week 4'].reduce((count: any, item: any) => count + (item.appointment === true ? 1 : 0), 0) : 0;
        let ap_count_5 = groupedData['Week 5'] ? groupedData['Week 5'].reduce((count: any, item: any) => count + (item.appointment === true ? 1 : 0), 0) : 0;
        // console.log(ap_count_5);
        let conv_count_1 = groupedData['Week 1'] ? groupedData['Week 1'].reduce((count: any, item: any) => count + (item.conversion === true ? 1 : 0), 0) : 0;
        let conv_count_2 = groupedData['Week 2'] ? groupedData['Week 2'].reduce((count: any, item: any) => count + (item.conversion === true ? 1 : 0), 0) : 0;
        let conv_count_3 = groupedData['Week 3'] ? groupedData['Week 3'].reduce((count: any, item: any) => count + (item.conversion === true ? 1 : 0), 0) : 0;
        let conv_count_4 = groupedData['Week 4'] ? groupedData['Week 4'].reduce((count: any, item: any) => count + (item.conversion === true ? 1 : 0), 0) : 0;
        let conv_count_5 = groupedData['Week 5'] ? groupedData['Week 5'].reduce((count: any, item: any) => count + (item.conversion === true ? 1 : 0), 0) : 0;

        this.columnChart = {
            series: [
                {
                    name: 'Total Marketing Calls',
                    data: [
                        groupedData['Week 1'] ? groupedData['Week 1'].length : 0,
                        groupedData['Week 2'] ? groupedData['Week 2'].length : 0,
                        groupedData['Week 3'] ? groupedData['Week 3'].length : 0,
                        groupedData['Week 4'] ? groupedData['Week 4'].length : 0,
                        groupedData['Week 5'] ? groupedData['Week 5'].length : 0,
                    ],
                },
                {
                    name: 'Total Marketing Appointments',
                    data: [ap_count_1, ap_count_2, ap_count_3, ap_count_4, ap_count_5],
                },
                {
                    name: 'Total Marketing Conversions',
                    data: [conv_count_1, conv_count_2, conv_count_3, conv_count_4, conv_count_5],
                },
            ],
            chart: {
                height: 300,
                type: 'bar',
                zoom: {
                    enabled: false,
                },
                toolbar: {
                    show: false,
                },
            },
            colors: ['#e2a03f', '#e7515a', '#654ca3'],
            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent'],
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    endingShape: 'rounded',
                },
            },
            grid: {
                borderColor: '#e0e6ed',
            },
            xaxis: {
                categories: ['1st -7th', '8th-14th', '15th-21nd', '22rd-28th', '29th-31st'],
                axisBorder: {
                    color: '#e0e6ed',
                },
            },
            yaxis: {
                opposite: false,
                labels: {
                    offsetX: 0,
                },
            },
            tooltip: {
                theme: 'light',
                y: {
                    formatter: function (val: any) {
                        return val;
                    },
                },
            },
        };

        this.marketing_chart_flag = true;
        this.load_flag = false;

        this.customerconverted = [];
        let data = {
            start_date: this.start_date,
            end_date: this.end_date,
        };
        this.userServices.getleadstocust(data).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.customerconverted = rdata.customers;
                this.phnnum = this.customerconverted.map((customer) => '05' + customer.phone.substr(-8));
                if (this.phnnum) {
                    let inData = {
                        customers: this.phnnum,
                        call_type: 'Inbound',
                    };

                    this.userServices.getInboundCalldetails(inData).subscribe((rdata: any) => {
                        if (rdata.ret_data === 'success') {
                            this.callarr = rdata.customer;
                            this.customerconverted.forEach((element) => {
                                element.inboundcalldata = [];
                                this.callarr.forEach((element2) => {
                                    element2.forEach((element3: any) => {
                                        if (element.phone.substr(-8) == element3.src.substr(-8)) {
                                            //|| element.phone.substr(-8) == element3.dst.substr(-8)
                                            //element3.calltype == "Inbound"
                                            element['inboundcalldata'].push(element3);
                                        }
                                    });
                                });
                            });

                            this.customerconverted.forEach((customer) => {
                                if (customer.inboundcalldata && customer.inboundcalldata.length > 0) {
                                    if (
                                        customer.inboundcalldata[customer.inboundcalldata.length - 1]['calltype'] == 'Inbound' &&
                                        customer.inboundcalldata[customer.inboundcalldata.length - 1]['srctrunk'] == '025503556' &&
                                        customer.source_id == '1'
                                    ) {
                                        this.marketingCount++;
                                    }

                                    if (
                                        customer.inboundcalldata[customer.inboundcalldata.length - 1]['calltype'] == 'Inbound' &&
                                        customer.inboundcalldata[customer.inboundcalldata.length - 1]['srctrunk'] != '025503556' &&
                                        customer.source_id == '1'
                                    ) {
                                        this.nonMarketingCount++;
                                    }
                                }
                            });
                            this.marketpercentage = ((this.marketingCount / this.customerconverted.length) * 100).toFixed(2) + '%';
                            this.nonmarketpercentage = ((this.nonMarketingCount / this.customerconverted.length) * 100).toFixed(2) + '%';
                            this.directleadpercentage =
                                ((this.customerconverted.filter((a1: any) => a1.source_id != 1).length / this.customerconverted.length) * 100).toFixed(2) + '%';
                        } else {
                            this.load_flag = false;
                        }
                    });
                }

                //this.loadingCustconvt=false;
            } else {
                this.load_flag = false;
            }
        });
    }

    getCsi() {
        this.org_psf_data = {
            extHappy_psf_calls: 0,
            fairlyHappy_psf_calls: 0,
            happy_psf_calls: 0,
            dissatisfied_psf_calls: 0,
        };
        let data = {
            startDate: this.start_date,
            endDate: this.end_date,
        };

        this.userServices.getPSFCallReportData(data).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.user_psf_calls = rData.users_psf_list;
                this.user_psf_calls.forEach((element) => {
                    element.ext_satisfied = 0;
                    element.fairly_satisfied = 0;
                    element.satisfied = 0;
                    element.dis_satisfied = 0;
                    element.user_psf_calls.forEach((psfCalls: any) => {
                        if (parseInt(psfCalls.psfm_num_of_attempts) > 0) {
                            if (psfCalls.last_call_status.pst_psf_status == '2' && psfCalls.last_call_status.pst_response == '1') {
                                element.ext_satisfied = element.ext_satisfied + 1;
                                this.org_psf_data.extHappy_psf_calls = this.org_psf_data.extHappy_psf_calls + 1;
                            }
                            if (psfCalls.last_call_status.pst_psf_status == '2' && psfCalls.last_call_status.pst_response == '2') {
                                element.fairly_satisfied = element.fairly_satisfied + 1;
                                this.org_psf_data.fairlyHappy_psf_calls = this.org_psf_data.fairlyHappy_psf_calls + 1;
                            }
                            if (psfCalls.last_call_status.pst_psf_status == '2' && psfCalls.last_call_status.pst_response == '3') {
                                element.satisfied = element.satisfied + 1;
                                this.org_psf_data.happy_psf_calls = this.org_psf_data.happy_psf_calls + 1;
                            }
                            if (psfCalls.last_call_status.pst_response == '5') {
                                element.dis_satisfied = element.dis_satisfied + 1;
                                this.org_psf_data.dissatisfied_psf_calls = this.org_psf_data.dissatisfied_psf_calls + 1;
                            }
                        } else if (parseInt(psfCalls.psfm_num_of_attempts) == 0) {
                        }
                    });
                });
                if (
                    this.org_psf_data.extHappy_psf_calls != 0 ||
                    this.org_psf_data.fairlyHappy_psf_calls != 0 ||
                    this.org_psf_data.happy_psf_calls != 0 ||
                    this.org_psf_data.dissatisfied_psf_calls != 0
                ) {
                    this.totalcsi =
                        this.org_psf_data.extHappy_psf_calls +
                        this.org_psf_data.fairlyHappy_psf_calls +
                        this.org_psf_data.happy_psf_calls +
                        this.org_psf_data.dissatisfied_psf_calls;
                    this.radialBarChart = {
                        series: [
                            parseFloat(((this.org_psf_data.extHappy_psf_calls / this.totalcsi) * 100).toFixed(2)),
                            parseFloat(((this.org_psf_data.fairlyHappy_psf_calls / this.totalcsi) * 100).toFixed(2)),
                            parseFloat(((this.org_psf_data.happy_psf_calls / this.totalcsi) * 100).toFixed(2)),
                            parseFloat(((this.org_psf_data.dissatisfied_psf_calls / this.totalcsi) * 100).toFixed(2)),
                        ],
                        chart: {
                            height: 265,
                            type: 'donut',
                            zoom: {
                                enabled: false,
                            },
                            toolbar: {
                                show: false,
                            },
                        },
                        colors: ['#2980b9', '#805dca', '#e2a03f', '#26b86e'],
                        // grid: {
                        //     borderColor: isDark ? '#191e3a' : '#e0e6ed',
                        // },
                        plotOptions: {
                            radialBar: {
                                dataLabels: {
                                    name: {
                                        fontSize: '22px',
                                    },
                                    value: {
                                        fontSize: '16px',
                                    },
                                    total: {
                                        show: true,
                                        label: 'Total',
                                        formatter: (w: any) => {
                                            return this.totalcsi.toString();
                                        },
                                    },
                                },
                            },
                        },
                        labels: ['Extremly Satisfied', 'Fairly Satisfied', 'Satisfied', 'Dissatisfied'],
                        fill: {
                            opacity: 0.85,
                        },
                    };
                }

                //this.loadingcsi = false;
                this.getConvertedCustomers();
            } else {
                this.load_flag = false;
            }
        });
    }

    getConvertedCustomers() {
        this.newcustomers = [];
        let data = {
            start_date: this.start_date,
            end_date: this.end_date,
        };

        this.userServices.getlaabscustomerdata(data).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.newcustomers = rdata.customers;
                this.customerdata = rdata.customers.filter((a1: any) => a1.job_status != null);
                let inv_temp = this.customerdata.filter((a1: any) => a1.job_status == 'INV');
                if (inv_temp.length > 0) {
                    this.totalcustomer_converted = inv_temp.length;
                }
                this.userServices.getexistingCustomer(data).subscribe((rdata: any) => {
                    if (rdata.ret_data === 'success') {
                        this.totalcust = rdata.customers.length;
                        if (this.totalcust != 0) {
                            this.totalexisting_invoiced = this.totalcust - this.totalcustomer_converted;
                        }
                        this.pieChart = {
                            series: [this.totalcustomer_converted, this.totalexisting_invoiced],
                            chart: {
                                height: 300,
                                type: 'pie',
                                zoom: {
                                    enabled: false,
                                },
                                toolbar: {
                                    show: false,
                                },
                            },
                            labels: ['NEW CUSTOMER CONVERTED', 'EXISTING CUSTOMER CONVERTED'],
                            colors: ['#4281A4', '#48A9A6'],
                            responsive: [
                                {
                                    breakpoint: 480,
                                    options: {
                                        chart: {
                                            width: 200,
                                        },
                                    },
                                },
                            ],
                            stroke: {
                                show: false,
                            },
                            legend: {
                                position: 'bottom',
                            },
                        };
                    } else {
                        this.load_flag = false;
                    }
                });
            } else {
                this.load_flag = false;
            }
            this.getNewCustomers();
        });
    }

    getInboundcallPurpose() {
        let data = {
            start_date: this.start_date,
            end_date: this.end_date,
        };
        this.appoint_leads = 0;
        this.camp_leads = 0;
        this.sRorQuote_leads = 0;
        this.partsEnq_leads = 0;
        this.feedbackORpsf_leads = 0;
        this.statusEnq_leads = 0;
        this.genralEnq_leads = 0;

        this.userServices.getAllLeads(data).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.leads = rdata.leads;
                if (this.leads.length > 0) {
                    this.appoint_leads = this.leads.filter((a1: any) => a1.purpose_id == 1).length;
                    this.camp_leads = this.leads.filter((a1: any) => a1.purpose_id == 2).length;
                    this.sRorQuote_leads = this.leads.filter((a1: any) => a1.purpose_id == 3).length;
                    this.partsEnq_leads = this.leads.filter((a1: any) => a1.purpose_id == 4).length;
                    this.feedbackORpsf_leads = this.leads.filter((a1: any) => a1.purpose_id == 6).length;
                    this.statusEnq_leads = this.leads.filter((a1: any) => a1.purpose_id == 8).length;
                    this.genralEnq_leads = this.leads.filter((a1: any) => a1.purpose_id == 10).length;

                    this.getGraphs();

                    this.chartOptions = {
                        series: [
                            this.appoint_leads,
                            this.camp_leads,
                            this.sRorQuote_leads,
                            this.partsEnq_leads,
                            this.feedbackORpsf_leads,
                            this.statusEnq_leads,
                            this.genralEnq_leads,
                        ],
                        chart: {
                            width: 500,
                            type: 'donut',
                        },
                        dataLabels: {
                            enabled: false,
                        },
                        fill: {
                            type: 'gradient',
                        },
                        labels: ['Appointments', 'Campaign', 'Service Request/Quotation', 'Parts Enquiry', 'Feedback/Psf', 'Status Enquiry', 'General Enquiry'],
                        colors: ['#4361ee', '#805dca', '#e2a03f', '#26b86e', '#ff5733', '#8c73e6', '#136a8a'],
                        legend: {
                            // formatter: function(val, opts) {
                            //   return val + " - " + opts.w.globals.series[opts.seriesIndex];
                            // }
                        },
                        responsive: [
                            {
                                breakpoint: 480,
                                options: {
                                    chart: {
                                        width: 200,
                                    },
                                    legend: {
                                        position: 'bottom',
                                    },
                                },
                            },
                        ],
                    };
                } else {
                    this.load_flag = false;
                }
            } else {
                this.load_flag = false;
            }
        });
    }

    getNewCustomers() {
        this.numarray = this.unique_inbound_marketing.map((number) => number.call_from.substring(number.call_from.length - 7));
        if (this.numarray.length > 0) {
            let dataa = {
                num_list: this.numarray,
                start_date: this.start_date + ' 00:00:00',
                end_date: this.end_date + ' 23:59:59',
            };

            this.userServices.getcustomerdata(dataa).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    var customers = rdata.customers;

                    this.unique_inbound_marketing.map(function (x: any) {
                        var result = rdata.customers.filter(
                            (a1: any) =>
                                a1.phon_uniq == x.call_from.substring(x.call_from.length - 7) ||
                                a1.alt_num_uniq == x.call_from.substring(x.call_from.length - 7) ||
                                a1.mob_uniq == x.call_from.substring(x.call_from.length - 7)
                        );
                        if (result.length > 0) {
                            x.customer = result[0].customer_name;
                        } else {
                            x.customer = 'new';
                        }
                    });

                    console.log('unique_inbound_marketing>>>>>>>unique_inbound_marketing>>>>>???', this.unique_inbound_marketing);

                    let unqMarketingInbound = this.unique_inbound_marketing; //this.removeDuplicates(this.unique_inbound_marketing, 'call_from');
                    // unqMarketingInbound.forEach((element: any) => {
                    //     element.cust_type = this.newcustomers.some(
                    //         (item: any) => element.call_from.substring(element.call_from.length - 8) === item.phn.substring(item.phn.length - 8)
                    //     );
                    // });
                    unqMarketingInbound = this.unique_inbound_marketing.filter((element: any) => element.customer === 'new');

                    let groupedData2: any = this.categorizeIntoWeeks(unqMarketingInbound);
                    //console.log('groupedData2>>>>>new>>groupedData2>>>>new>???', groupedData2['Week 1']);

                    let ap_count_1 = groupedData2['Week 1']
                        ? groupedData2['Week 1'].reduce((count: any, item: any) => count + (item.appointment === true && item.customer === 'new' ? 1 : 0), 0)
                        : 0;
                    let ap_count_2 = groupedData2['Week 2']
                        ? groupedData2['Week 2'].reduce((count: any, item: any) => count + (item.appointment === true && item.customer === 'new' ? 1 : 0), 0)
                        : 0;
                    let ap_count_3 = groupedData2['Week 3']
                        ? groupedData2['Week 3'].reduce((count: any, item: any) => count + (item.appointment === true && item.customer === 'new' ? 1 : 0), 0)
                        : 0;
                    let ap_count_4 = groupedData2['Week 4']
                        ? groupedData2['Week 4'].reduce((count: any, item: any) => count + (item.appointment === true && item.customer === 'new' ? 1 : 0), 0)
                        : 0;
                    let ap_count_5 = groupedData2['Week 5']
                        ? groupedData2['Week 5'].reduce((count: any, item: any) => count + (item.appointment === true && item.customer === 'new' ? 1 : 0), 0)
                        : 0;
                    // console.log(ap_count_5);
                    let conv_count_1 = groupedData2['Week 1']
                        ? groupedData2['Week 1'].reduce((count: any, item: any) => count + (item.conversion === true && item.customer === 'new' ? 1 : 0), 0)
                        : 0;
                    let conv_count_2 = groupedData2['Week 2']
                        ? groupedData2['Week 2'].reduce((count: any, item: any) => count + (item.conversion === true && item.customer === 'new' ? 1 : 0), 0)
                        : 0;
                    let conv_count_3 = groupedData2['Week 3']
                        ? groupedData2['Week 3'].reduce((count: any, item: any) => count + (item.conversion === true && item.customer === 'new' ? 1 : 0), 0)
                        : 0;
                    let conv_count_4 = groupedData2['Week 4']
                        ? groupedData2['Week 4'].reduce((count: any, item: any) => count + (item.conversion === true && item.customer === 'new' ? 1 : 0), 0)
                        : 0;
                    let conv_count_5 = groupedData2['Week 5']
                        ? groupedData2['Week 5'].reduce((count: any, item: any) => count + (item.conversion === true && item.customer === 'new' ? 1 : 0), 0)
                        : 0;

                    this.areaChart = {
                        series: [
                            {
                                name: 'Total Marketing Calls',
                                data: [
                                    groupedData2['Week 1'] ? groupedData2['Week 1'].length : 0,
                                    groupedData2['Week 2'] ? groupedData2['Week 2'].length : 0,
                                    groupedData2['Week 3'] ? groupedData2['Week 3'].length : 0,
                                    groupedData2['Week 4'] ? groupedData2['Week 4'].length : 0,
                                    groupedData2['Week 5'] ? groupedData2['Week 5'].length : 0,
                                ],
                            },
                            {
                                name: 'Total Marketing Appointments',
                                data: [ap_count_1, ap_count_2, ap_count_3, ap_count_4, ap_count_5],
                            },
                            {
                                name: 'Total Marketing Conversions',
                                data: [conv_count_1, conv_count_2, conv_count_3, conv_count_4, conv_count_5],
                            },
                        ],
                        chart: {
                            type: 'area',
                            height: 300,
                            zoom: {
                                enabled: false,
                            },
                            toolbar: {
                                show: false,
                            },
                        },
                        colors: ['#805dca', '#ffd997', '#e53e49'],
                        dataLabels: {
                            enabled: false,
                        },
                        stroke: {
                            width: 2,
                            curve: 'smooth',
                        },
                        xaxis: {
                            // axisBorder: {
                            //     color: isDark ? '#191e3a' : '#e0e6ed',
                            // },
                        },
                        // yaxis: {
                        //     opposite: isRtl ? true : false,
                        //     labels: {
                        //         offsetX: isRtl ? -40 : 0,
                        //     },
                        // },
                        labels: ['1st -7th', '8th-14th', '15th-21nd', '22rd-28th', '29th-31st'],
                        legend: {
                            horizontalAlign: 'left',
                        },
                        // grid: {
                        //     borderColor: isDark ? '#191e3a' : '#e0e6ed',
                        // },
                        // tooltip: {
                        //     theme: isDark ? 'dark' : 'light',
                        // },
                    };

                    this.newcust_marketing_chart_flag = true;
                    // console.log('unqMarketingInbound?>>>>>>unqMarketingInbound>>>>>>???', unqMarketingInbound);
                } else {
                    this.coloredToast('danger', 'Some error occurred please try again');
                    this.load_flag = false;
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
