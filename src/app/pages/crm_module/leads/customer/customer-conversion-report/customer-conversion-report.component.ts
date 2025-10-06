import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';

@Component({
    selector: 'app-customer-conversion-report',
    templateUrl: './customer-conversion-report.component.html',
    styleUrls: ['./customer-conversion-report.component.css'],
})
export class CustomerConversionReportComponent implements OnInit {
    public start_date: string = this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '';
    public end_date: string = this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '';
    public load_flag: boolean = true;
    public load_flag_2: boolean = true;

    year: any;
    month: any;
    mrkcnvtcust: any[] = [];
    extcustlist: any[] = [];
    customerReportGraph: any[] = [];
    monthlyGraph: any[] = [];
    phnnum: any[] = [];
    phnnum2: any[] = [];
    inv_temp: any[] = [];
    openjobcard: any[] = [];
    totalcustconvert: any[] = [];
    inboundCustomers: any[] = [];
    inboundCustomersinv: any[] = [];
    inboundCustomersMarkopnjc: any[] = [];
    inboundCustomersMarkinv: any[] = [];
    extcust: any[] = [];
    extcustinv: any[] = [];
    oldjobcard: any[] = [];
    customers: any[] = [];
    callarr: any[] = [];
    customersInvoiced: any[] = [];
    customerdata: any[] = [];
    mark_temp: any[] = [];
    customerReportData = {
        totalcustomer_openjobcard: 0,
        totalcustomer_converted: 0,
        totalmarketing_converted: 0,
    };
    totalcustomer_openjobcard = 0;
    totalcustomer_converted = 0;
    totalcustomer_inbound = 0;
    totalconverted_inbound = 0;
    totalmarketing_customer = 0;
    totalnonmarketing_customer = 0;
    totalmarketing_converted = 0;
    totalnonmarketing_converted = 0;
    totalexisting_openjobcard = 0;
    totalexisting_invoiced = 0;
    prvtotalmarketing_customer = 0;

    pieChart: any;

    //yearly Analysis
    oldcust: any[] = [];
    pcust_cnvt: any[] = [];
    count: any;
    columnChart: any;

    constructor(public router: Router, private userServices: StaffPostAuthService, public datepipe: DatePipe) {
        const currentDate = new Date();
        const formattedCurrentDate = currentDate.toISOString().slice(0, 10);
        const year = formattedCurrentDate.slice(0, 4);
        const month = formattedCurrentDate.slice(5, 7);
        this.year = year;
        this.month = month;
        currentDate.setDate(1);
        const formattedStartDate = this.datepipe.transform(currentDate, 'yyyy-MM-dd');
        this.start_date = formattedStartDate || '';
        this.end_date = this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '';
    }

    ngOnInit(): void {
        this.getCustomerData();
        this.getPreviousCustomer();
    }

    getCustomerData() {
        this.load_flag = true;
        this.openjobcard = [];
        this.totalcustconvert = [];
        let data = {
            start_date: this.start_date,
            end_date: this.end_date,
        };

        this.userServices.getlaabscustomerdata(data).subscribe((rdata: any) => {
            this.totalcustomer_openjobcard = 0;
            this.totalcustomer_converted = 0;
            if (rdata.ret_data === 'success') {
                this.customerdata = rdata.customers;
                this.phnnum = this.customerdata.map((customer: any) => customer.phn);
                this.openjobcard = this.customerdata.filter((job_status: any) => job_status.job_status != null);
                this.totalcustomer_openjobcard = this.openjobcard.length;
                this.inv_temp = this.customerdata.filter((job_status: any) => job_status.job_status == 'INV');
                if (this.inv_temp.length > 0) {
                    this.totalcustconvert = this.inv_temp;
                    this.totalcustomer_converted = this.inv_temp.length;
                    this.customerReportData.totalcustomer_converted = this.inv_temp.length;
                }

                this.getInboundCalldetails();
            } else {
                this.load_flag = false;
                // this.disableButton = false;
            }
        });
    }

    getInboundCalldetails() {
        this.totalcustomer_inbound = 0;
        this.totalconverted_inbound = 0;
        this.totalmarketing_customer = 0;
        this.totalnonmarketing_customer = 0;
        this.totalmarketing_converted = 0;
        this.totalnonmarketing_converted = 0;
        this.inboundCustomers = [];
        this.inboundCustomersinv = [];
        this.inboundCustomersMarkopnjc = [];
        this.inboundCustomersMarkinv = [];

        let inData = {
            start_date: this.start_date,
            end_date: this.end_date,
            customers: this.phnnum,
            call_type: 'Inbound',
        };
        this.userServices.getInboundCalldetails(inData).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.callarr = rdata.customer;
                // this.callarr.filter((data) => data.calltype= "Inbound");
                // console.log("callarayaahndjciujsjdejvkdm",this.callarr)
                this.customerdata.forEach((element) => {
                    element.inboundcalldata = [];
                    this.callarr.forEach((element2) => {
                        element2.forEach((element3: any) => {
                            const datetime = new Date(element3.datetime);
                            const month = datetime.getMonth() + 1;
                            if (element.phn == element3.src && element3.calltype == 'Inbound' && datetime.getMonth() + 1 == element.cmonth) {
                                element['inboundcalldata'].push(element3);
                            }
                        });
                    });
                });
                if (rdata.customer.length > 0) {
                    // this.totalcustomer_openjobcard = this.customerdata.length;
                    // //this.customerReportData.totalcustomer_openjobcard = this.customerdata.length;
                    // this.customerReportData.totalcustomer_openjobcard = this.customerdata.length;

                    this.customerdata.forEach((element) => {
                        if (element.inboundcalldata.length > 0) {
                            this.totalcustomer_inbound = this.totalcustomer_inbound + 1;
                            this.inboundCustomers.push(element);
                        }
                        if (element.job_status == 'INV' && element.inboundcalldata.length > 0) {
                            this.totalconverted_inbound = this.totalconverted_inbound + 1;
                            this.inboundCustomersinv.push(element);
                        }
                        this.mark_temp = [];

                        if (element.inboundcalldata.length > 0) {
                            if (
                                element.inboundcalldata[element.inboundcalldata.length - 1]['calltype'] == 'Inbound' &&
                                element.inboundcalldata[element.inboundcalldata.length - 1]['srctrunk'] == '025503556'
                            ) {
                                this.mark_temp = element.inboundcalldata;
                                this.inboundCustomersMarkopnjc.push(element);
                            }
                        }
                        // let mark_temp = element.inboundcalldata.filter(
                        //   ({ calltype, srctrunk }) =>
                        //     calltype == "Inbound" && srctrunk == "025503556"
                        // );
                        if (this.mark_temp.length > 0) {
                            this.totalmarketing_customer = this.totalmarketing_customer + 1;
                        }
                        if (this.mark_temp.length > 0 && element.job_status == 'INV') {
                            this.totalmarketing_converted = this.totalmarketing_converted + 1;
                            this.inboundCustomersMarkinv.push(element);
                        }
                        this.customerReportData.totalmarketing_converted = this.totalmarketing_converted;
                        let nonmark_temp = element.inboundcalldata.filter(
                            (calltype: any, srctrunk: any) => calltype.calltype == 'Inbound' && srctrunk.srctrunk != '025503556'
                        );
                        if (nonmark_temp.length > 0) this.totalnonmarketing_customer = this.totalnonmarketing_customer + 1;
                        if (nonmark_temp.length > 0 && element.job_status == 'INV') this.totalnonmarketing_converted = this.totalnonmarketing_converted + 1;
                    });
                    // console.log('inboundcustomers', this.inboundCustomers);
                    // console.log('inboundCustomersinv', this.inboundCustomersinv);
                    // console.log('inboundCustomersMarkopnjc', this.inboundCustomersMarkopnjc);
                    // console.log('inboundCustomersMarkinv', this.inboundCustomersMarkinv);

                    this.getexistingCustomerlist(rdata.customer);
                }
            } else {
                this.load_flag = false;
                // this.disableButton = false;
                this.getexistingCustomerlist(rdata.customer);
            }
        });
    }

    getexistingCustomerlist(custlist: any) {
        this.extcust = [];
        this.extcustinv = [];
        this.load_flag = true;
        // this.disableButton = true;
        this.totalexisting_openjobcard = 0;
        this.totalexisting_invoiced = 0;
        let data = {
            start_date: this.start_date,
            end_date: this.end_date,
        };

        this.userServices.getexistingCustomerlist(data).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.extcustlist = rdata.customers;
                rdata.customers.forEach((element: any, index: any) => {
                    if (custlist.some((e: any) => e.customer_code === element.customer_no)) {
                        this.extcustlist.splice(index, 1);
                    }
                });
                this.extcust = this.extcustlist;
                this.totalexisting_openjobcard = this.extcustlist.length;
                let invjc = this.extcustlist.filter((a1) => a1.job_status == 'INV');
                this.extcustinv = invjc;
                if (invjc) {
                    this.totalexisting_invoiced = invjc.length;
                }

                this.load_flag = false;
                //this.disableButton = false;
                //  this.getPreviousCustomer();
            } else {
                this.load_flag = false;
                //  this.disableButton = false;
            }
            this.pieChart = {
                series: [this.totalcustomer_openjobcard, this.totalcustomer_converted, this.totalmarketing_converted],
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
                labels: ['Total Customer', 'Total Converted Customers', 'Total Marketing Converted Customers'],
                //colors: ['#5DA9E9', '#55D6BE', '#D2BF55'],
                colors:['#00CDAC','#02AABD','#C6EA8D'], //#614385 →     → #FE90AF
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
            // this.pieChart = {
            //     chart: {
            //         type: 'donut',
            //         width: '100%',
            //         height: 400
            //     },
            //     dataLabels: {
            //       enabled: false,
            //     },
            //     plotOptions: {
            //       pie: {
            //         customScale: 0.8,
            //         donut: {
            //           size: '75%',
            //         },
            //         offsetY: 20,
            //       },
            //       stroke: {
            //         colors: undefined
            //       }
            //     },
            //     colors: ['#5DA9E9', '#55D6BE', '#D2BF55'],
            //     title: {
            //       text: 'New Customer Analysis',
            //       style: {
            //         fontSize: '18px'
            //       }
            //     },
            //     series: [this.totalcustomer_openjobcard, this.totalcustomer_converted, this.totalmarketing_converted],
            //     labels: ['Total Customer', 'Total Converted Customers', 'Total Marketing Converted Customers'],
            //     legend: {
            //       position: 'bottom',
            //       offsetY: 80
            //     }
            // };
        });
    }

    getPreviousCustomer() {
        this.customerReportGraph = [];
        this.load_flag_2 = true;
        let data = {
            year: this.year,
            month: this.month,
        };
        this.oldcust = [];
        this.count = [];
        this.pcust_cnvt = [];
        this.userServices.getPreviouscustomer(data).subscribe(async (rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.oldcust = rdata.previous_customers;
                let cust_count = 0;
                // for (let i = 0; i <= rdata.previous_customers.length; i++) {
                //   if (rdata.previous_customers && rdata.previous_customers[i]) {
                //     cust_count = rdata.previous_customers[i].length;
                //     this.count.push(cust_count);
                //   } else {
                //     cust_count = 0;
                //   }
                // }
                const extractPhoneNumbers = (data: any) => {
                    let phoneNumbers: any[] = [];
                    const extractNumbers = (arr: any) => {
                        arr.forEach((item: any) => {
                            if (Array.isArray(item)) {
                                extractNumbers(item);
                            } else if (item && item.phn) {
                                phoneNumbers.push(item.phn);
                            }
                        });
                    };
                    extractNumbers(data);
                    return phoneNumbers;
                };

                const extractedNumbers = extractPhoneNumbers(rdata.previous_customers);

                // const extractPhoneNumbers = (data) => {
                //   if (!Array.isArray(data)) {
                //     return [];
                //   }

                //   return data.map((item) => {
                //     if (Array.isArray(item)) {
                //       return extractPhoneNumbers(item);
                //     } else if (item && item.phn) {
                //       return item.phn;
                //     }
                //   });
                // };

                // const extractedNumbers = extractPhoneNumbers(rdata.previous_customers);
                // console.log("213216546846165484516548461654<<<<<<>>>>>>>>>>>?????????",extractedNumbers)
                rdata.previous_customers.forEach((element: any) => {
                    let inv_temp = element.filter((job_status: any) => job_status.job_status == 'INV');
                    if (inv_temp.length > 0) {
                        this.pcust_cnvt.push(inv_temp.length);
                    }
                });

                this.mrkcnvtcust = [];

                let months = extractedNumbers;
                // for (let i = 0; i < months.length; i++) {
                //   let month = months[i];
                let calldata = {
                    customers: months,
                    // month:this.month,
                    calltype: 'Inbound',
                    srctrunk: '025503556',
                };

                let prv_cust = await this.userServices.getInboundCall(calldata).toPromise();

                rdata.previous_customers.forEach((element: any) => {
                    const count = element.filter((element2: any) => element2.job_status != null).length;
                    if (count != 0) {
                        this.count.push(count);
                    }
                });

                rdata.previous_customers.forEach((element: any) => {
                    element.forEach((element2: any) => {
                        element2['inboundcalldata'] = [];
                        prv_cust.customer.forEach((element3: any) => {
                            element3.forEach((element4: any) => {
                                const datetime = new Date(element4.datetime);
                                const month = datetime.getMonth() + 1;
                                if (element2.phn == element4.src && element4.calltype == 'Inbound' && datetime.getMonth() + 1 == element2.cmonth) {
                                    element2['inboundcalldata'].push(element4);
                                }
                            });
                        });
                    });
                });

                rdata.previous_customers.forEach((element: any) => {
                    const count = element.filter(
                        (element2: any) =>
                            element2.inboundcalldata.length > 0 &&
                            element2.job_status === 'INV' &&
                            element2.inboundcalldata[element2.inboundcalldata.length - 1].calltype === 'Inbound' &&
                            element2.inboundcalldata[element2.inboundcalldata.length - 1].srctrunk === '025503556'
                    ).length;

                    //console.log("Count of previous month", count);

                    // if (count != 0) {
                    this.mrkcnvtcust.push(count);
                    // }
                });
                this.columnChart = {
                    series: [
                        {
                            name: 'Total Customer',
                            data: this.getDatasetData(this.count),
                        },
                        {
                            name: 'Total Converted Customers',
                            data: this.getDatasetData(this.pcust_cnvt),
                        },
                        {
                            name: 'Total Marketing Converted Customers',
                            data: this.getDatasetData(this.mrkcnvtcust),
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
                    colors:['#00CDAC','#02AABD','#C6EA8D'],
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
                        categories: this.getMonthNames(this.month),
                        axisBorder: {
                            color: '#e0e6ed',
                        },
                    },
                    // yaxis: {
                    //     opposite: isRtl ? true : false,
                    //     labels: {
                    //         offsetX: isRtl ? -10 : 0,
                    //     },
                    // },
                    tooltip: {
                        //theme: isDark ? 'dark' : 'light',
                        y: {
                            formatter: function (val: any) {
                                return val;
                            },
                        },
                    },
                };
                //   this.mrkcnvtcust.push(this.mrkcnvtcount);
                //  }
                // this.customerReportGraph.push(
                //   {
                //     value: this.month,
                //     name: "Month",
                //   },
                //   {
                //     value: this.customerReportData.totalcustomer_openjobcard,
                //     name: "Total Customer",
                //   },
                //   {
                //     value: this.customerReportData.totalcustomer_converted,
                //     name: "Total Converted Customers",
                //   },
                //   {
                //     value: this.customerReportData.totalmarketing_converted,
                //     name: "Total Marketing Converted Customers",
                //   },
                //   {
                //     value: this.count,
                //     name: "Total Previous month Customers Count",
                //   },
                //   {
                //     value: this.pcust_cnvt,
                //     name: "Total Previous month converted Customers Count",
                //   },
                //   {
                //     value: this.mrkcnvtcust,
                //     name: "Total Previous month Marketing converted Customers Count",
                //   }
                // );
                this.load_flag_2 = false;
            }
            this.load_flag_2 = false;
            // this.disableButton=false;
        });
    }

    getMonthNames(value: number): string[] {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        if (value >= 1 && value <= 12) {
            return monthNames.slice(0, value); // returing values based on selected month
        } else {
            return [];
        }
    }
    getDatasetData(chartDataValues: number[]): number[] {
        const reversedValues = chartDataValues.slice().reverse();
        //  reversedValues.push(lastValue);                  //here the values are pushed from 1st to last of array
        return reversedValues;
    }

    CustomerDetail(data: any) {}
}
