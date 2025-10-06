import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import { ModalComponent } from 'angular-custom-modal';
import { filter } from 'rxjs';

@Component({
    selector: 'app-call-analysis-report',
    templateUrl: './call-analysis-report.component.html',
    styleUrls: ['./call-analysis-report.component.css'],
})
export class CallAnalysisReportComponent implements OnInit {
    public totalCalls: any[] = [];
    public totalUniqueCalls: any[] = [];
    public totalMarketingCalls: any[] = [];
    public MarketingExistingCustomers: any[] = [];
    public MarketingNewCustomers: any[] = [];
    public MarketingDupeCustomers: any[] = [];
    public MarketingMissedCustomers: any[] = [];
    public MarketingAttendedCustomers: any[] = [];
    public MarketingMissedConverted: any[] = [];
    public MarketingAttendedConverted: any[] = [];
    public MarketingExstMissedCustomers: any[] = [];
    public MarketingExstAttendedCustomers: any[] = [];
    public MarketingExstMissedConverted: any[] = [];
    public MarketingExstAttendedConverted: any[] = [];
    public totalNonMarketingCalls: any[] = [];
    public nonMarketingExistingCustomers: any[] = [];
    public nonMarketingNewCustomers: any[] = [];
    public nonMarketingDupeCustomers: any[] = [];
    public nonMarketingMissedCustomers: any[] = [];
    public nonMarketingAttendedCustomers: any[] = [];
    public nonMarketingMissedConverted: any[] = [];
    public nonMarketingAttendedConverted: any[] = [];
    public nonMarketingExstMissedCustomers: any[] = [];
    public nonMarketingExstAttendedCustomers: any[] = [];
    public nonMarketingExstMissedConverted: any[] = [];
    public nonMarketingExstAttendedConverted: any[] = [];
    public commonNumbers: any[] = [];
    public numberArrayMaster: any[] = [];
    public start_date: string = '';
    public end_date: string = '';

    // loader flags
    public load_flag: boolean = true;
    public mk_lvl_1: boolean = true;
    public mk_lvl_2: boolean = true;
    public nmk_lvl_1: boolean = true;
    public nmk_lvl_2: boolean = true;

    public loderForModal: boolean = false;
    public searchFlag: boolean = false;

    @ViewChild('modal5') modal!: ModalComponent;

    displaydetailsForModal: any;
    tempArrayofAllDetails: any;

    public cols = [
        { field: 'datetime', title: 'Datetime', isUnique: false },
        { field: 'src', title: 'Customer Number', isUnique: true },
        { field: 'customer_name', title: 'Customer Name', isUnique: false },
        { field: 'source', title: 'Lead Source', isUnique: false },
        { field: 'call_purpose', title: 'Purpose', isUnique: false },
        { field: 'converted', title: 'Converted', isUnique: false },
        { field: 'remarks', title: 'Customer Remarks', isUnique: false },
    ];

    public search: string = '';

    public purposeList: any;

    public filterdPurpose: any = {
        missing: [],
        Appointment: {},
        Campaign_Enquiry: {},
        ServiceRequestQuotation: {},
        PartsEnquiry: {},
        Complaint: {},
        FeedbackConcerns: {},
        Others: {},
        StatusEnquiry: {},
        WrongNumber: {},
        GeneralEnquiry: {},
    };
    public filterMissing: any = [];
    public filterAppointment: any = [];
    public filterGeneral: any = [];
    public filterCampaign: any = [];
    public filterQuotation: any = [];
    public filterOthers: any = [];
    public filterStatus: any = [];
    public filterParts: any = [];
    public filterWrong: any = [];
    public filterComplaint: any = [];
    public filterFeedback: any = [];

    public selectedFilterItem: any = '-1';

    constructor(private userServices: StaffPostAuthService, public datepipe: DatePipe) {
        const currentDate = new Date();
        currentDate.setDate(1);
        this.start_date = this.datepipe.transform(currentDate, 'yyyy-MM-dd') || '';
        this.end_date = this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '';
        this.userServices.getExcludedNumberList().subscribe((rData: any) => {
            this.commonNumbers = rData.numlist;
        });
    }

    ngOnInit(): void {
        this.getInboundCallDetails();
        this.getCallPurposesForListing();
    }

    getCallPurposesForListing() {
        this.userServices.getCallPurposeList().subscribe((data: any) => {
            this.purposeList = data.purpose;
        });
    }

    getInboundCallDetails() {
        this.searchFlag = true;
        this.load_flag = true;
        this.mk_lvl_1 = true;
        this.mk_lvl_2 = true;
        this.nmk_lvl_1 = true;
        this.nmk_lvl_2 = true;
        let data = {
            call_type: 'Inbound',
            start_day: this.start_date + ' 00:00:00',
            end_day: this.end_date + ' 23:59:59',
        };
        this.totalCalls = [];
        this.totalUniqueCalls = [];
        this.totalMarketingCalls = [];
        this.MarketingExistingCustomers = [];
        this.MarketingNewCustomers = [];
        this.MarketingDupeCustomers = [];
        this.MarketingAttendedCustomers = [];
        this.MarketingMissedCustomers = [];
        this.MarketingMissedConverted = [];
        this.MarketingAttendedConverted = [];
        this.MarketingExstAttendedCustomers = [];
        this.MarketingExstMissedCustomers = [];
        this.MarketingExstMissedConverted = [];
        this.MarketingExstAttendedConverted = [];
        this.totalNonMarketingCalls = [];
        this.nonMarketingExistingCustomers = [];
        this.nonMarketingNewCustomers = [];
        this.nonMarketingDupeCustomers = [];
        this.nonMarketingAttendedCustomers = [];
        this.nonMarketingMissedCustomers = [];
        this.nonMarketingMissedConverted = [];
        this.nonMarketingAttendedConverted = [];
        this.nonMarketingExstAttendedCustomers = [];
        this.nonMarketingExstMissedCustomers = [];
        this.nonMarketingExstMissedConverted = [];
        this.nonMarketingExstAttendedConverted = [];

        this.userServices.getLatestCallReportData(data).subscribe((rData: any) => {
            let tempNumberMaster = rData.call_data.filter((item: any) => item.dst == '6300' && item.src.length > 5 && item.src != 'Unknown');
            // const seen: Record<number, boolean> = {}; // or use Map<number, boolean>()
            // let totalUniqueCallsTemp = tempNumberMaster.filter((obj: any) => {
            //     if (seen[obj.src]) {
            //         return false;
            //     }
            //     seen[obj.src] = true;
            //     return true;
            // });

            // Step 2: Create a map to store the first call by src based on earliest datetime
            const firstCallsMap = new Map<string, any>();
            tempNumberMaster.forEach((call: any) => {
                const existing = firstCallsMap.get(call.src);
                if (!existing || new Date(call.datetime) < new Date(existing.datetime)) {
                    firstCallsMap.set(call.src, call);
                }
            });

            // Step 3: Convert map values to array
            const totalUniqueCallsTemp = Array.from(firstCallsMap.values());
            this.totalUniqueCalls = totalUniqueCallsTemp.filter((element: any) => {
                return !this.commonNumbers.some((element2) => {
                    return element.src.substring(element.src.length - 9) === element2.cn_number.substring(element2.cn_number.length - 9);
                });
            });
            this.totalMarketingCalls = this.totalUniqueCalls.filter((item: any) => item.srctrunk == '025503556' || item.srctrunk == '25503556');
            this.totalNonMarketingCalls = this.totalUniqueCalls.filter((item: any) => item.srctrunk != '025503556' && item.srctrunk != '25503556');
            this.load_flag = false;
            this.getMarketingCustomerDetails();
            this.getNonMarketingCustomerDetails();
            this.getNewCustomerWithoutCall();
        });
    }

    getMarketingCustomerDetails() {
        this.searchFlag = true;
        let numberArray: any[] = [];
        this.MarketingExistingCustomers = [];
        this.MarketingNewCustomers = [];
        this.MarketingDupeCustomers = [];
        this.totalMarketingCalls.forEach((element: any) => {
            numberArray.push(element.src.substring(element.src.length - 9));
            this.numberArrayMaster.push(element.src.substring(element.src.length - 9));
        });
        this.userServices.getCallsData({ numbers: numberArray, start_date: this.start_date, end_date: this.end_date }).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.totalMarketingCalls.forEach((element: any) => {
                    const foundObject = rData.customers.filter(
                        (obj: any) => obj.phone.substring(obj.phone.length - 9) === element.src.substring(element.src.length - 9)
                    );
                    if (foundObject.length > 1) {
                        this.MarketingDupeCustomers.push(element);
                    } else if (foundObject.length == 1) {
                        element.customer_details = foundObject[0];
                        if (new Date(foundObject[0].created_on) >= new Date(this.start_date)) {
                            this.MarketingNewCustomers.push(element);
                        } else {
                            this.MarketingExistingCustomers.push(element);
                        }
                    } else {
                        element.customer_details = null;
                        this.MarketingNewCustomers.push(element);
                    }
                });
                this.mk_lvl_1 = false;
                this.getMarketingConversion();
            } else {
                this.searchFlag = false;
            }
        });
    }
    getMarketingConversion() {
        this.searchFlag = true;
        this.MarketingAttendedCustomers = [];
        this.MarketingMissedCustomers = [];
        this.MarketingMissedConverted = [];
        this.MarketingAttendedConverted = [];
        this.MarketingExstAttendedCustomers = [];
        this.MarketingExstMissedCustomers = [];
        this.MarketingExstMissedConverted = [];
        this.MarketingExstAttendedConverted = [];
        this.MarketingMissedCustomers = this.MarketingNewCustomers.filter((obj: any) => obj.disposition != 'ANSWERED');
        this.MarketingAttendedCustomers = this.MarketingNewCustomers.filter((obj: any) => obj.disposition == 'ANSWERED');
        // this.MarketingMissedConverted = this.MarketingMissedCustomers.filter((obj: any) => obj.customer_details != null);
        // this.MarketingAttendedConverted = this.MarketingAttendedCustomers.filter((obj: any) => obj.customer_details != null);
        this.MarketingMissedConverted = this.MarketingMissedCustomers.filter(
            (obj: any) =>
                obj.customer_details != null &&
                obj.customer_details.job_cards &&
                obj.customer_details.job_cards.length > 0 &&
                obj.customer_details.job_cards[0].job_no != null &&
                obj.customer_details.job_cards[0].job_no !== ''
        );
        this.MarketingAttendedConverted = this.MarketingAttendedCustomers.filter(
            (obj: any) =>
                obj.customer_details != null &&
                obj.customer_details.job_cards &&
                obj.customer_details.job_cards.length > 0 &&
                obj.customer_details.job_cards[0].job_no != null &&
                obj.customer_details.job_cards[0].job_no !== ''
        );

        this.MarketingExstAttendedCustomers = this.MarketingExistingCustomers.filter((obj: any) => obj.disposition == 'ANSWERED');
        this.MarketingExstMissedCustomers = this.MarketingExistingCustomers.filter((obj: any) => obj.disposition != 'ANSWERED');

        this.MarketingExstAttendedCustomers.forEach((element: any) => {
            let new_jobs = element.customer_details.job_cards.filter(
                (obj: any) => obj.job_status == 'INV' && (this.stringToDate(obj.invoice_date) || '') >= new Date(this.start_date)
            );
            if (new_jobs.length > 0) {
                this.MarketingExstAttendedConverted.push(element);
            }
        });
        this.MarketingExstMissedCustomers.forEach((element: any) => {
            let new_jobs = element.customer_details.job_cards.filter(
                (obj: any) => obj.job_status == 'INV' && (this.stringToDate(obj.invoice_date) || '') >= new Date(this.start_date)
            );
            if (new_jobs.length > 0) {
                this.MarketingExstMissedConverted.push(element);
            }
        });

        //let missedcustomers = this.MarketingMissedCustomers.filter()

        // this.MarketingExstMissedConverted = this.MarketingExstMissedCustomers.filter((obj: any) => obj.customer_details != null);
        // this.MarketingExstAttendedConverted = this.MarketingExstAttendedCustomers.filter((obj: any) => obj.customer_details != null);
        this.mk_lvl_2 = false;
        this.searchFlag = false;
    }

    getNonMarketingCustomerDetails() {
        this.searchFlag = true;
        let numberArray: any[] = [];
        this.totalNonMarketingCalls.forEach((element: any) => {
            numberArray.push(element.src.substring(element.src.length - 9));
            this.numberArrayMaster.push(element.src.substring(element.src.length - 9));
        });
        this.userServices.getCallsData({ numbers: numberArray, start_date: this.start_date, end_date: this.end_date }).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.totalNonMarketingCalls.forEach((element: any) => {
                    const foundObject = rData.customers.filter(
                        (obj: any) => obj.phone.substring(obj.phone.length - 9) === element.src.substring(element.src.length - 9)
                    );
                    if (foundObject.length > 1) {
                        this.nonMarketingDupeCustomers.push(element);
                    } else if (foundObject.length == 1) {
                        element.customer_details = foundObject[0];
                        if (new Date(foundObject[0].created_on) >= new Date(this.start_date)) {
                            this.nonMarketingNewCustomers.push(element);
                        } else {
                            this.nonMarketingExistingCustomers.push(element);
                        }
                    } else {
                        element.customer_details = null;
                        this.nonMarketingNewCustomers.push(element);
                    }
                });
                this.nmk_lvl_1 = false;
                this.getNonMarketingConversion();
            } else {
                this.searchFlag = false;
            }
        });
    }
    getNonMarketingConversion() {
        this.nonMarketingMissedCustomers = this.nonMarketingNewCustomers.filter((obj: any) => obj.disposition != 'ANSWERED');
        this.nonMarketingAttendedCustomers = this.nonMarketingNewCustomers.filter((obj: any) => obj.disposition == 'ANSWERED');
        // this.nonMarketingMissedConverted = this.nonMarketingMissedCustomers.filter((obj: any) => obj.customer_details != null);
        // this.nonMarketingAttendedConverted = this.nonMarketingAttendedCustomers.filter((obj: any) => obj.customer_details != null);
        this.nonMarketingMissedConverted = this.nonMarketingMissedCustomers.filter(
            (obj: any) =>
                obj.customer_details != null &&
                obj.customer_details.job_cards &&
                obj.customer_details.job_cards.length > 0 &&
                obj.customer_details.job_cards[0].job_no != null &&
                obj.customer_details.job_cards[0].job_no !== ''
        );
        this.nonMarketingAttendedConverted = this.nonMarketingAttendedCustomers.filter(
            (obj: any) =>
                obj.customer_details != null &&
                obj.customer_details.job_cards &&
                obj.customer_details.job_cards.length > 0 &&
                obj.customer_details.job_cards[0].job_no != null &&
                obj.customer_details.job_cards[0].job_no !== ''
        );
        this.nonMarketingExstAttendedCustomers = this.nonMarketingExistingCustomers.filter((obj: any) => obj.disposition == 'ANSWERED');
        this.nonMarketingExstMissedCustomers = this.nonMarketingExistingCustomers.filter((obj: any) => obj.disposition != 'ANSWERED');

        this.nonMarketingExstAttendedCustomers.forEach((element: any) => {
            let new_jobs = element.customer_details.job_cards.filter(
                (obj: any) => obj.job_status == 'INV' && (this.stringToDate(obj.invoice_date) || '') >= new Date(this.start_date)
            );
            if (new_jobs.length > 0) {
                this.nonMarketingExstAttendedConverted.push(element);
            }
        });
        this.nonMarketingExstMissedCustomers.forEach((element: any) => {
            let new_jobs = element.customer_details.job_cards.filter(
                (obj: any) => obj.job_status == 'INV' && (this.stringToDate(obj.invoice_date) || '') >= new Date(this.start_date)
            );
            if (new_jobs.length > 0) {
                this.nonMarketingExstMissedConverted.push(element);
            }
        });

        // this.MarketingExstMissedConverted = this.MarketingExstMissedCustomers.filter((obj: any) => obj.customer_details != null);
        // this.MarketingExstAttendedConverted = this.MarketingExstAttendedCustomers.filter((obj: any) => obj.customer_details != null);
        this.nmk_lvl_2 = false;
        this.searchFlag = false;
    }

    getNewCustomerWithoutCall() {
        this.searchFlag = true;
        this.userServices
            .getCustomerWithoutCallsData({ numbers: this.numberArrayMaster, start_date: this.start_date, end_date: this.end_date })
            .subscribe((rData: any) => {
                if (rData.ret_data == 'success') {
                    this.searchFlag = false;
                } else {
                    this.searchFlag = false;
                }
            });
    }

    stringToDate(dateString: string): Date | null {
        const dateParts = dateString.split('-');
        const year = parseInt(dateParts[2]) + 2000; // Assuming 2-digit year represents 2000+years
        const month = dateParts[1];
        const day = parseInt(dateParts[0]);

        const date = new Date(year, getMonthNumber(month), day);

        function getMonthNumber(month: string): number {
            const months: { [key: string]: number } = {
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
            return months[month];
        }
        return date;
    }

    openModal(input: any) {
        let filterdDeatils: any = [];
        if (input == 'MarketingAttendedConverted') {
            if (this.MarketingAttendedConverted.length > 0) {
                this.loderForModal = true;
                this.modal.open();
                this.dataLoaderBackend(this.MarketingAttendedConverted);
            } else {
                this.displaydetailsForModal = null;
                this.modal.open();
            }
        }

        if (input == 'MarketingMissedConverted') {
            if (this.MarketingMissedConverted.length > 0) {
                this.loderForModal = true;
                this.modal.open();
                this.dataLoaderBackend(this.MarketingMissedConverted);
            } else {
                this.displaydetailsForModal = null;
                this.modal.open();
            }
        }

        if (input == 'MarketingExstMissedConverted') {
            if (this.MarketingExstMissedConverted.length > 0) {
                this.loderForModal = true;
                this.modal.open();
                this.dataLoaderBackend(this.MarketingExstMissedConverted);
            } else {
                this.displaydetailsForModal = null;
                this.modal.open();
            }
        }

        if (input == 'MarketingExstAttendedConverted') {
            if (this.MarketingExstAttendedConverted.length > 0) {
                this.loderForModal = true;
                this.modal.open();
                this.dataLoaderBackend(this.MarketingExstAttendedConverted);
            } else {
                this.displaydetailsForModal = null;
                this.modal.open();
            }
        }

        if (input == 'nonMarketingMissedConverted') {
            if (this.nonMarketingMissedConverted.length > 0) {
                this.loderForModal = true;
                this.modal.open();
                this.dataLoaderBackend(this.nonMarketingMissedConverted);
            } else {
                this.displaydetailsForModal = null;
                this.modal.open();
            }
        }

        if (input == 'nonMarketingAttendedConverted') {
            if (this.nonMarketingAttendedConverted.length > 0) {
                this.loderForModal = true;
                this.modal.open();
                this.dataLoaderBackend(this.nonMarketingAttendedConverted);
            } else {
                this.displaydetailsForModal = null;
                this.modal.open();
            }
        }

        if (input == 'nonMarketingExstMissedConverted') {
            if (this.nonMarketingExstMissedConverted.length > 0) {
                this.loderForModal = true;
                this.modal.open();
                this.dataLoaderBackend(this.nonMarketingExstMissedConverted);
            } else {
                this.displaydetailsForModal = null;
                this.modal.open();
            }
        }

        if (input == 'nonMarketingExstAttendedConverted') {
            if (this.nonMarketingExstAttendedConverted.length > 0) {
                this.loderForModal = true;
                this.modal.open();
                this.dataLoaderBackend(this.nonMarketingExstAttendedConverted);
            } else {
                this.displaydetailsForModal = null;
                this.modal.open();
            }
        }
    }

    callInfoFetch(input: string) {
        if (input == 'MarketingMissedCustomers') {
            this.loderForModal = true;
            this.modal.open();
            this.dataLoaderBackend(this.MarketingMissedCustomers);
        }

        if (input == 'MarketingAttendedCustomers') {
            this.loderForModal = true;
            this.modal.open();
            this.dataLoaderBackend(this.MarketingAttendedCustomers);
        }

        if (input == 'MarketingExstMissedCustomers') {
            this.loderForModal = true;
            this.modal.open();
            this.dataLoaderBackend(this.MarketingExstMissedCustomers);
        }

        if (input == 'MarketingExstAttendedCustomers') {
            this.loderForModal = true;
            this.modal.open();
            this.dataLoaderBackend(this.MarketingExstAttendedCustomers);
        }

        if (input == 'nonMarketingMissedCustomers') {
            this.loderForModal = true;
            this.modal.open();
            this.dataLoaderBackend(this.nonMarketingMissedCustomers);
        }

        if (input == 'nonMarketingAttendedCustomers') {
            this.loderForModal = true;
            this.modal.open();
            this.dataLoaderBackend(this.nonMarketingAttendedCustomers);
        }

        if (input == 'nonMarketingExstMissedCustomers') {
            this.loderForModal = true;
            this.modal.open();
            this.dataLoaderBackend(this.nonMarketingExstMissedCustomers);
        }

        if (input == 'nonMarketingExstAttendedCustomers') {
            this.loderForModal = true;
            this.modal.open();
            this.dataLoaderBackend(this.nonMarketingExstAttendedCustomers);
        }
    }

    closeModal() {
        this.search = '';
        this.modal.close();
        this.displaydetailsForModal = null;
    }

    dataLoaderBackend(dataArray: any) {
        let callId: any = [];
        let nums: any = [];

        dataArray.map((input: any, index: number) => {
            callId[index] = input.uniqueid;
        });
        dataArray.map((input: any, index: number) => {
            nums[index] = input.src;
        });

        let backdata = {
            callId: callId,
            nums: nums,
        };

        this.userServices.fetchCustomerDetailswithNumber(backdata).subscribe((data: any) => {
            let customer_with_id = data.customers_with_id;
            let customers_without_id = data.customers_without_id;

            dataArray.forEach((element: any) => {
                if (element.customer_details != null) {
                    element.converted = 'Converted';
                } else {
                    element.converted = 'Not Converted';
                }
                customers_without_id.forEach((customer: any) => {
                    if (element.src.slice(-9) == customer.phone.slice(-9)) {
                        if ('customer_details' in element) {
                            if (element.customer_details) {
                                element.customer_name = element.customer_details.customer_name;
                                element.customer_code = element.customer_details.customer_code;

                                if (element.customer_details.job_cards) {
                                    element.car_reg_no = element.customer_details.job_cards[0].car_reg_no;
                                }
                            }
                            if (!element.customer_details) {
                                element.customer_name = customer.customer_name;
                            }
                        } else {
                            element.customer_name = customer.customer_name;
                        }
                    } else {
                        //  element.customer_name = "New Customer"
                    }
                });

                this.displaydetailsForModal = dataArray;
            });

            dataArray.forEach((element: any) => {
                element.call_purpose = 'Missing';
                customer_with_id.forEach((customer: any) => {
                    if (customer.ystar_call_id == element.uniqueid) {
                        //&& customer.source_id == '1'
                        element.call_purpose = customer.call_purpose == null ? 'Missing' : customer.call_purpose;
                        element.remarks = customer.lead_note == null ? '' : customer.lead_note;
                        element.source = customer.ld_src == null ? '' : customer.ld_src;
                    }

                    // if (customer.phone.slice(-9) === element.src.slice(-9)) {
                    //     element.source_id = customer.source_id == null ? '' : customer.source_id;
                    //     element.lead_createdon = customer.lead_createdon == null ? '' : customer.lead_createdon;
                    // }
                });
            });
            this.displaydetailsForModal = dataArray;

            this.tempArrayofAllDetails = dataArray;
            //For Filtering missed Call
            this.filterMissing = dataArray.filter((data: any) => {
                return data.call_purpose.toLowerCase() == 'missing';
            });

            this.filterAppointment = dataArray.filter((data: any) => {
                return data.call_purpose.toLowerCase() == 'appointment';
            });

            this.filterGeneral = dataArray.filter((data: any) => {
                return data.call_purpose.split(' ')[0] == 'General';
            });

            this.filterCampaign = dataArray.filter((data: any) => {
                return data.call_purpose.split(' ')[0] == 'Campaign';
            });

            this.filterQuotation = dataArray.filter((data: any) => {
                return data.call_purpose.split(' ')[0] == 'Service';
            });

            this.filterOthers = dataArray.filter((data: any) => {
                return data.call_purpose.toLowerCase() == 'others';
            });

            this.filterWrong = dataArray.filter((data: any) => {
                return data.call_purpose.split(' ')[0] == 'Wrong';
            });

            this.filterStatus = dataArray.filter((data: any) => {
                return data.call_purpose.split(' ')[0] == 'Status';
            });

            this.filterParts = dataArray.filter((data: any) => {
                return data.call_purpose.split(' ')[0] == 'Parts';
            });

            this.filterFeedback = dataArray.filter((data: any) => {
                return data.call_purpose.split(' ')[0] == 'Feedback';
            });

            this.purposeList.filter((input: any) => {
                if (input.call_purpose == 'missing') {
                    input.LengthOfPurpose = this.filterMissing.length;
                }

                if (input.call_purpose.toLowerCase() == 'appointment') {
                    input.LengthOfPurpose = this.filterAppointment.length;
                }

                if (input.call_purpose.split(' ')[0] == 'General') {
                    input.LengthOfPurpose = this.filterGeneral.length;
                }

                if (input.call_purpose.split(' ')[0] == 'Campaign') {
                    input.LengthOfPurpose = this.filterCampaign.length;
                }

                if (input.call_purpose.split(' ')[0] == 'Service') {
                    input.LengthOfPurpose = this.filterQuotation.length;
                }

                if (input.call_purpose.toLowerCase() == 'others') {
                    input.LengthOfPurpose = this.filterOthers.length;
                }

                if (input.call_purpose.split(' ')[0] == 'Wrong') {
                    input.LengthOfPurpose = this.filterWrong.length;
                }

                if (input.call_purpose.split(' ')[0] == 'Status') {
                    input.LengthOfPurpose = this.filterStatus.length;
                }

                if (input.call_purpose.split(' ')[0] == 'Parts') {
                    input.LengthOfPurpose = this.filterParts.length;
                }

                if (input.call_purpose.split(' ')[0] == 'Feedback') {
                    input.LengthOfPurpose = this.filterFeedback.length;
                }
            });

            let not_converterd_app = this.filterAppointment.filter((item: any) => item.converted == 'Not Converted');
            let not_converterd_gen = this.filterGeneral.filter((item: any) => item.converted == 'Not Converted');
            let not_converterd_camp = this.filterCampaign.filter((item: any) => item.converted == 'Not Converted');
            let not_converterd_quote = this.filterQuotation.filter((item: any) => item.converted == 'Not Converted');

            this.loderForModal = false;
        });
    }

    filterClick(input: string, num: any) {
        this.selectedFilterItem = num;

        if (input == 'All') {
            this.displaydetailsForModal = this.tempArrayofAllDetails;
        }

        if (input == 'missing') {
            this.displaydetailsForModal = this.filterMissing;
        }

        if (input.toLowerCase() == 'appointment') {
            this.displaydetailsForModal = this.filterAppointment;
        }

        if (input.split(' ')[0] == 'General') {
            this.displaydetailsForModal = this.filterGeneral;
        }

        if (input.split(' ')[0] == 'Campaign') {
            this.displaydetailsForModal = this.filterCampaign;
        }

        if (input.split(' ')[0] == 'Service') {
            this.displaydetailsForModal = this.filterQuotation;
        }

        if (input.toLowerCase() == 'others') {
            this.displaydetailsForModal = this.filterOthers;
        }

        if (input.split(' ')[0] == 'Wrong') {
            this.displaydetailsForModal = this.filterWrong;
        }

        if (input.split(' ')[0] == 'Status') {
            this.displaydetailsForModal = this.filterStatus;
        }

        if (input.split(' ')[0] == 'Parts') {
            this.displaydetailsForModal = this.filterParts;
        }

        if (input.split(' ')[0] == 'Feedback') {
            this.displaydetailsForModal = this.filterFeedback;
        }
    }
}
