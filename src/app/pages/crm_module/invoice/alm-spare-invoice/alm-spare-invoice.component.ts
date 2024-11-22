import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';
import { ToWords } from 'to-words';

@Component({
    selector: 'app-alm-spare-invoice',
    templateUrl: './alm-spare-invoice.component.html',
    styleUrls: ['./alm-spare-invoice.component.css'],
})
export class AlmSpareInvoiceComponent implements OnInit {
    public us_role_id: any;
    public invoiceNo: any;
    public branchCode: any;
    public load_flag: boolean = false;
    public show_flag: boolean = false;
    public veh_flag: boolean = false;
    public inv_details: any = {};
    public partsMargin: string = '0';
    public marginAppliedTotal: number = 0.0;
    public grandTotal: number = 0.0;
    public discountApplied: number = 0.0;
    public customers: any[] = [];
    public customerVehicles: any[] = [];
    public filteredCustomers: any[] = [];
    public selectedCustomer = null;
    public selectedCustomerCode = null;
    public selectedVehicle = null;
    public purchaseType: any;
    public type = null;
    public chassis_no = null;
    public description = null;
    public selectedJobcard: string = '';
    public sparePartsMargin: any[] = [];
    public Jobcards: any[] = [];
    public filteredJobcards: any[] = [];
    public jobCardCustomer: any[] = [];
    sendData: any;
    isChecked = false;

    sample_data: any = {
        details: {
            DOC_DATE: '20-JAN-24',
            TOTAL_AMOUNT: '1365',
            TOTAL_DISCOUNT: null,
            TOTAL_VAT_AMOUNT: '68.25',
            SALE_TYPE: 'D',
        },
        items: [
            {
                COMP_CODE: '10',
                BRANCH_CODE: '11',
                DOC_NO: '145668',
                DOC_TYPE: 'PROV',
                SRNO: '7',
                BRAND_CODE: 'BEN',
                PART_NO: '0009894404-11',
                ITEM_QTY: '7',
                UNIT_PRICE: '45',
                AVG_COST: '39.098',
                CURRENT_RSP: '43',
                ITEM_QTY_RTN: null,
                RETURN_REASON: null,
                NET_PRICE: '45',
                VAT_AMOUNT: '2.25',
                DISCOUNT_AMOUNT: '0',
                DESCRIPTION: 'TRANSMISSION OIL',
            },
            {
                COMP_CODE: '10',
                BRANCH_CODE: '11',
                DOC_NO: '145668',
                DOC_TYPE: 'PROV',
                SRNO: '4',
                BRAND_CODE: 'BEN',
                PART_NO: '0009895605',
                ITEM_QTY: '1',
                UNIT_PRICE: '60',
                AVG_COST: '30.001',
                CURRENT_RSP: '56.612',
                ITEM_QTY_RTN: null,
                RETURN_REASON: null,
                NET_PRICE: '60',
                VAT_AMOUNT: '3',
                DISCOUNT_AMOUNT: '0',
                DESCRIPTION: 'BRAKE FLUID DOT4',
            },
            {
                COMP_CODE: '10',
                BRANCH_CODE: '11',
                DOC_NO: '145668',
                DOC_TYPE: 'PROV',
                SRNO: '2',
                BRAND_CODE: 'BEN',
                PART_NO: '1668307201',
                ITEM_QTY: '1',
                UNIT_PRICE: '290',
                AVG_COST: '224.161',
                CURRENT_RSP: '297.237',
                ITEM_QTY_RTN: null,
                RETURN_REASON: null,
                NET_PRICE: '290',
                VAT_AMOUNT: '14.5',
                DISCOUNT_AMOUNT: '0',
                DESCRIPTION: 'AC FILTER',
            },
            {
                COMP_CODE: '10',
                BRANCH_CODE: '11',
                DOC_NO: '145668',
                DOC_TYPE: 'PROV',
                SRNO: '6',
                BRAND_CODE: 'BEN',
                PART_NO: '2202710380',
                ITEM_QTY: '1',
                UNIT_PRICE: '55',
                AVG_COST: '45.223',
                CURRENT_RSP: '85.335',
                ITEM_QTY_RTN: null,
                RETURN_REASON: null,
                NET_PRICE: '55',
                VAT_AMOUNT: '2.75',
                DISCOUNT_AMOUNT: '0',
                DESCRIPTION: 'GASKET ',
            },
            {
                COMP_CODE: '10',
                BRANCH_CODE: '11',
                DOC_NO: '145668',
                DOC_TYPE: 'PROV',
                SRNO: '5',
                BRAND_CODE: 'BEN',
                PART_NO: '2222772800',
                ITEM_QTY: '1',
                UNIT_PRICE: '115',
                AVG_COST: '98.76',
                CURRENT_RSP: '141.029',
                ITEM_QTY_RTN: null,
                RETURN_REASON: null,
                NET_PRICE: '115',
                VAT_AMOUNT: '5.75',
                DISCOUNT_AMOUNT: '0',
                DESCRIPTION: 'GEAR FILTER',
            },
            {
                COMP_CODE: '10',
                BRANCH_CODE: '11',
                DOC_NO: '145668',
                DOC_TYPE: 'PROV',
                SRNO: '3',
                BRAND_CODE: 'BEN',
                PART_NO: '2701590600',
                ITEM_QTY: '6',
                UNIT_PRICE: '45',
                AVG_COST: '34.608',
                CURRENT_RSP: '65.305',
                ITEM_QTY_RTN: null,
                RETURN_REASON: null,
                NET_PRICE: '45',
                VAT_AMOUNT: '2.25',
                DISCOUNT_AMOUNT: '0',
                DESCRIPTION: 'SPARK PLUG',
            },
            {
                COMP_CODE: '10',
                BRANCH_CODE: '11',
                DOC_NO: '145668',
                DOC_TYPE: 'PROV',
                SRNO: '1',
                BRAND_CODE: 'BEN',
                PART_NO: '2760940504',
                ITEM_QTY: '2',
                UNIT_PRICE: '130',
                AVG_COST: '104.777',
                CURRENT_RSP: '149.622',
                ITEM_QTY_RTN: null,
                RETURN_REASON: null,
                NET_PRICE: '130',
                VAT_AMOUNT: '6.5',
                DISCOUNT_AMOUNT: '0',
                DESCRIPTION: 'AIR FILTER ELEMENT',
            },
        ],
        ret_data: 'success',
    };

    public toWords = new ToWords();
    tot_words = '';
    constructor(public storeData: Store<any>, private userServices: StaffPostAuthService, public router: Router, private activeRouter: ActivatedRoute) {
        this.us_role_id = atob(atob(localStorage.getItem('us_role_id') || '{}'));
        this.invoiceNo = this.activeRouter.snapshot.queryParamMap.get('INV_NO')!;
        this.branchCode = this.activeRouter.snapshot.queryParamMap.get('BRANCH_CODE');
        let saleType = this.activeRouter.snapshot.queryParamMap.get('SALE_TYPE');
        if (saleType == 'D') {
            this.purchaseType = '2';
        } else {
            this.purchaseType = '1';
        }
    }

    ngOnInit() {
        this.initDatas();
    }

    initDatas() {
        this.load_flag = true;
        this.userServices.getAlmInvoiceComman().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                // this.partsMargin = rData.settings.parts_margin;
                this.customers = rData.customers;
                this.filteredCustomers = this.customers.slice(0, 10);
                this.Jobcards = rData.jobCards;
                this.filteredJobcards = this.Jobcards.slice(0, 10);
                // this.load_flag = false;
                this.getSpareInvoice(this.invoiceNo, this.branchCode);
            } else {
                this.load_flag = false;
                this.coloredToast('danger', 'Cant fetch details, Some error occurred please try again');
            }
        });
    }

    filterCustomer(event: any) {
        const filtered = this.customers.filter((product: any) => {
            return product.customer.toLowerCase().includes(event.term.toLowerCase());
        });
        this.filteredCustomers = [...filtered.slice(0, 10)];
    }
    filterJobcards(event: any) {
        const filtered = this.Jobcards.filter((product: any) => {
            return product.job_no.toLowerCase().includes(event.term.toLowerCase());
        });
        this.filteredJobcards = [...filtered.slice(0, 10)];
    }

    getCustomerVehicles() {
        this.veh_flag = false;
        this.customerVehicles = [];
        this.selectedVehicle = null;
        this.userServices.getCustomerVehicles({ customerCode: this.jobCardCustomer[0].customer_no }).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.customerVehicles = rData.vehicles;
                this.veh_flag = true;
            }
        });
    }

    getCustomerJobcards(event: any) {
        this.jobCardCustomer = [];
        this.userServices.getCustomerJobcards({ jobcardno: event }).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.jobCardCustomer = rData.customer;
                this.selectedCustomer = rData.customer[0].customer_name;
                this.selectedCustomerCode = rData.customer[0].customer_no;
                this.selectedVehicle = rData.customer[0].vehicle_id;
                this.chassis_no = rData.customer[0].chassis_no;
            }
        });
    }

    getSpareInvoice(invoiceNumber: any, branchCode: any) {
        this.load_flag = true;
        if (invoiceNumber != '' && branchCode != '') {
            let data = {
                inv_no: invoiceNumber,
                branchcode: branchCode,
            };
            // this.show_flag = true;
            // this.inv_details = this.sample_data;
            // this.getSparePartsMargin();
            this.userServices.getInvoiceDetails(data).subscribe((rData: any) => {
                if (rData.ret_data == 'success') {
                    this.inv_details = rData.booking; //rData.booking
                    // this.inv_details.items.forEach((element: any) => {
                    //     element.margin_applied = this.partsMargin;
                    //     element.margin_total = (
                    //         parseFloat(element.ITEM_QTY) * (parseFloat(element.UNIT_PRICE) + parseFloat(element.VAT_AMOUNT)) * (1 + parseFloat(this.partsMargin) / 100)
                    //     ).toFixed(2);
                    //     this.marginAppliedTotal += parseFloat(element.margin_total);
                    //     console.log(this.marginAppliedTotal);
                    // });
                    // this.grandTotal = this.marginAppliedTotal;
                    this.show_flag = true;
                    this.getSparePartsMargin();
                    this.load_flag = true;
                } else {
                    this.load_flag = false;
                    this.show_flag = false;
                    this.coloredToast('danger', 'Some error occurred, provided invoice not found');
                }
            });
        } else {
            this.coloredToast('danger', 'Invoice number & Branch code required');
        }
    }

    updateMargin(element: any) {
        element.margin_total = (
            parseFloat(element.ITEM_QTY) *
            (parseFloat(element.UNIT_PRICE) + parseFloat(element.VAT_AMOUNT)) *
            (1 + parseFloat(element.margin_applied) / 100)
        ).toFixed(2);
        this.calculateTotal();
    }

    getSparePartsMargin() {
        this.userServices.getSparePartsMargin().subscribe((rdata: any) => {
            if ((rdata.ret_data = 'success')) {
                this.sparePartsMargin = rdata.sparePartsMargin;
                this.marginAppliedTotal = 0;
                this.inv_details.items.forEach((element: any) => {
                    this.sparePartsMargin.forEach((element2) => {
                        let subtotal = element.ITEM_QTY * (element.UNIT_PRICE * 1 + element.VAT_AMOUNT * 1);
                        if (subtotal >= element2.spm_start_price && subtotal <= element2.spm_end_price) {
                            if (this.isChecked) {
                                element.margin_applied = element2.spm_price;
                            } else {
                                element.margin_applied = '0';
                            }
                            element.margin_total = (
                                parseFloat(element.ITEM_QTY) *
                                (parseFloat(element.UNIT_PRICE) + parseFloat(element.VAT_AMOUNT)) *
                                (1 + parseFloat(element.margin_applied) / 100)
                            ).toFixed(2);
                            this.marginAppliedTotal += parseFloat(element.margin_total);
                            this.grandTotal = this.marginAppliedTotal;
                        }
                    });
                });
                this.show_flag = true;
                this.load_flag = false;
            } else {
                this.coloredToast('danger', 'Some error occurred please try again');
            }
        });
    }

    calculateTotal() {
        this.marginAppliedTotal = 0.0;
        this.grandTotal = 0.0;
        this.inv_details.items.forEach((element: any) => {
            this.marginAppliedTotal += parseFloat(element.margin_total);
        });
        let total = this.marginAppliedTotal - this.discountApplied;
        if (total >= parseFloat(this.inv_details.details.TOTAL_AMOUNT) + parseFloat(this.inv_details.details.TOTAL_VAT_AMOUNT)) {
            this.grandTotal = this.marginAppliedTotal - this.discountApplied;
        } else {
            //this.discountApplied=0;
            this.grandTotal = this.marginAppliedTotal - this.discountApplied;
            this.coloredToast('danger', 'Invoice Need Admin Approval');
        }
    }

    saveNMInvoice() {
        if (this.type == null || this.type == '') {
            this.coloredToast('danger', 'Invoice Type is mandatory');
            return;
        }

        let total = this.marginAppliedTotal - this.discountApplied;
        let totalAmountAndVat = parseFloat(this.inv_details.details.TOTAL_AMOUNT) + parseFloat(this.inv_details.details.TOTAL_VAT_AMOUNT);

        if (this.type == '1') {
            if (total >= totalAmountAndVat) {
                this.sendData = {
                    supplier_id: 0,
                    customerCode: this.selectedCustomerCode,
                    vehicle_id: this.selectedVehicle,
                    jc_no: this.selectedJobcard,
                    nm_invoice: this.invoiceNo,
                    nm_branch: this.branchCode,
                    nm_sub_total: this.inv_details.details.TOTAL_AMOUNT,
                    nm_vat_total: this.inv_details.details.TOTAL_VAT_AMOUNT,
                    nm_discount: this.inv_details.details.TOTAL_DISCOUNT,
                    nm_inv_date: this.inv_details.details.DOC_DATE,
                    alm_margin_total: this.marginAppliedTotal,
                    alm_discount: this.discountApplied,
                    invoice_items: this.inv_details.items,
                    invoice_status: 1,
                    invoice_type: this.type,
                    invoice_purchase_type: this.purchaseType,
                    invoice_description: this.description,
                };
            } else {
                this.sendData = {
                    supplier_id: 0,
                    customerCode: this.selectedCustomerCode,
                    vehicle_id: this.selectedVehicle,
                    jc_no: this.selectedJobcard,
                    nm_invoice: this.invoiceNo,
                    nm_branch: this.branchCode,
                    nm_sub_total: this.inv_details.details.TOTAL_AMOUNT,
                    nm_vat_total: this.inv_details.details.TOTAL_VAT_AMOUNT,
                    nm_discount: this.inv_details.details.TOTAL_DISCOUNT,
                    nm_inv_date: this.inv_details.details.DOC_DATE,
                    alm_margin_total: this.marginAppliedTotal,
                    alm_discount: this.discountApplied,
                    invoice_items: this.inv_details.items,
                    invoice_status: 2,
                    invoice_type: this.type,
                    invoice_purchase_type: this.purchaseType,
                    invoice_description: this.description,
                };
            }
        } else {
            if (this.selectedVehicle == null) {
                this.coloredToast('danger', 'Customer & Chassis number is mandatory');
                return;
            }

            if (this.selectedJobcard == '') {
                this.coloredToast('danger', 'Jobcard number is mandatory');
                return;
            }

            if (total >= totalAmountAndVat) {
                this.sendData = {
                    supplier_id: 0,
                    customerCode: this.selectedCustomerCode,
                    vehicle_id: this.selectedVehicle,
                    jc_no: this.selectedJobcard,
                    nm_invoice: this.invoiceNo,
                    nm_branch: this.branchCode,
                    nm_sub_total: this.inv_details.details.TOTAL_AMOUNT,
                    nm_vat_total: this.inv_details.details.TOTAL_VAT_AMOUNT,
                    nm_discount: this.inv_details.details.TOTAL_DISCOUNT,
                    nm_inv_date: this.inv_details.details.DOC_DATE,
                    alm_margin_total: this.marginAppliedTotal,
                    alm_discount: this.discountApplied,
                    invoice_items: this.inv_details.items,
                    invoice_status: 1,
                    invoice_type: this.type,
                    invoice_purchase_type: this.purchaseType,
                    invoice_description: this.description,
                };
            } else {
                this.sendData = {
                    supplier_id: 0,
                    customerCode: this.selectedCustomerCode,
                    vehicle_id: this.selectedVehicle,
                    jc_no: this.selectedJobcard,
                    nm_invoice: this.invoiceNo,
                    nm_branch: this.branchCode,
                    nm_sub_total: this.inv_details.details.TOTAL_AMOUNT,
                    nm_vat_total: this.inv_details.details.TOTAL_VAT_AMOUNT,
                    nm_discount: this.inv_details.details.TOTAL_DISCOUNT,
                    nm_inv_date: this.inv_details.details.DOC_DATE,
                    alm_margin_total: this.marginAppliedTotal,
                    alm_discount: this.discountApplied,
                    invoice_items: this.inv_details.items,
                    invoice_status: 2,
                    invoice_type: this.type,
                    invoice_purchase_type: this.purchaseType,
                    invoice_description: this.description,
                };
            }
        }

        this.userServices.createSpareInvoice(this.sendData).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.coloredToast('success', 'Spare Invoice saved successfully');
                this.router.navigate(['spare-invoice/spare-invoice-list']);
            } else {
                this.coloredToast('danger', "Can't create invoice. Contact administrator");
            }
        });
    }

    checkValue(event: any) {
        this.isChecked = event;
        this.getSparePartsMargin();
    }

    resetfields(data: any) {
        if (data == 1) {
            this.type = null;
            this.isChecked = false;
            this.selectedJobcard = '';
            this.jobCardCustomer = [];
        } else if (data == 2) {
            if (this.type == 3) {
                this.isChecked = true;
            } else {
                this.isChecked = false;
            }
            this.selectedJobcard = '';
            this.jobCardCustomer = [];
            this.getSparePartsMargin();
        }
    }

    // saveNMInvoice() {
    //     if (this.type == null || this.type == '') {
    //         this.coloredToast('danger', 'Invoice Type is mandatory');
    //     } else if (this.type == '1') {
    //         let total = this.marginAppliedTotal - this.discountApplied;
    //         if (total >= parseFloat(this.inv_details.details.TOTAL_AMOUNT) + parseFloat(this.inv_details.details.TOTAL_VAT_AMOUNT)) {
    //             console.log('total amount after discount>>>>>>>>>>>>>>>>>', total);
    //             this.sendData = {
    //                 customerCode: this.selectedCustomerCode,
    //                 vehicle_id: this.selectedVehicle,
    //                 jc_no: this.selectedJobcard,
    //                 nm_invoice: this.invoiceNo,
    //                 nm_branch: this.branchCode,
    //                 nm_sub_total: this.inv_details.details.TOTAL_AMOUNT,
    //                 nm_vat_total: this.inv_details.details.TOTAL_VAT_AMOUNT,
    //                 nm_discount: this.inv_details.details.TOTAL_DISCOUNT,
    //                 nm_inv_date: this.inv_details.details.DOC_DATE,
    //                 alm_margin_total: this.marginAppliedTotal,
    //                 alm_discount: this.discountApplied,
    //                 invoice_items: this.inv_details.items,
    //                 invoice_status: 1,
    //                 invoice_type: this.type,
    //                 invoice_purchase_type: this.purchaseType,
    //             };
    //         } else {
    //             this.sendData = {
    //                 customerCode: this.selectedCustomerCode,
    //                 vehicle_id: this.selectedVehicle,
    //                 jc_no: this.selectedJobcard,
    //                 nm_invoice: this.invoiceNo,
    //                 nm_branch: this.branchCode,
    //                 nm_sub_total: this.inv_details.details.TOTAL_AMOUNT,
    //                 nm_vat_total: this.inv_details.details.TOTAL_VAT_AMOUNT,
    //                 nm_discount: this.inv_details.details.TOTAL_DISCOUNT,
    //                 nm_inv_date: this.inv_details.details.DOC_DATE,
    //                 alm_margin_total: this.marginAppliedTotal,
    //                 alm_discount: this.discountApplied,
    //                 invoice_items: this.inv_details.items,
    //                 invoice_status: 2,
    //                 invoice_type: this.type,
    //                 invoice_purchase_type: this.purchaseType,
    //             };
    //         }

    //         this.userServices.createSpareInvoice(this.sendData).subscribe((rData: any) => {
    //             if (rData.ret_data == 'success') {
    //                 this.coloredToast('success', 'Spare Invoice saved successfully');
    //                 this.router.navigate(['spare-invoice/spare-invoice-list']);
    //             } else {
    //                 this.coloredToast('danger', "Can't create invoice. Contact administrator");
    //             }
    //         });
    //     } else {
    //         if (this.selectedVehicle == null) {
    //             this.coloredToast('danger', 'Customer & Chassis number is mandatory');
    //         } else if (this.selectedJobcard == '') {
    //             this.coloredToast('danger', 'Jobcard number is mandatory');
    //         } else {
    //             let total = this.marginAppliedTotal - this.discountApplied;
    //             if (total >= parseFloat(this.inv_details.details.TOTAL_AMOUNT) + parseFloat(this.inv_details.details.TOTAL_VAT_AMOUNT)) {
    //                 console.log('total amount after discount>>>>>>>>>>>>>>>>>', total);
    //                 this.sendData = {
    //                     customerCode: this.selectedCustomerCode,
    //                     vehicle_id: this.selectedVehicle,
    //                     jc_no: this.selectedJobcard,
    //                     nm_invoice: this.invoiceNo,
    //                     nm_branch: this.branchCode,
    //                     nm_sub_total: this.inv_details.details.TOTAL_AMOUNT,
    //                     nm_vat_total: this.inv_details.details.TOTAL_VAT_AMOUNT,
    //                     nm_discount: this.inv_details.details.TOTAL_DISCOUNT,
    //                     nm_inv_date: this.inv_details.details.DOC_DATE,
    //                     alm_margin_total: this.marginAppliedTotal,
    //                     alm_discount: this.discountApplied,
    //                     invoice_items: this.inv_details.items,
    //                     invoice_status: 1,
    //                     invoice_type: this.type,
    //                     invoice_purchase_type: this.purchaseType,
    //                 };
    //             } else {
    //                 this.sendData = {
    //                     customerCode: this.selectedCustomerCode,
    //                     vehicle_id: this.selectedVehicle,
    //                     jc_no: this.selectedJobcard,
    //                     nm_invoice: this.invoiceNo,
    //                     nm_branch: this.branchCode,
    //                     nm_sub_total: this.inv_details.details.TOTAL_AMOUNT,
    //                     nm_vat_total: this.inv_details.details.TOTAL_VAT_AMOUNT,
    //                     nm_discount: this.inv_details.details.TOTAL_DISCOUNT,
    //                     nm_inv_date: this.inv_details.details.DOC_DATE,
    //                     alm_margin_total: this.marginAppliedTotal,
    //                     alm_discount: this.discountApplied,
    //                     invoice_items: this.inv_details.items,
    //                     invoice_status: 2,
    //                     invoice_type: this.type,
    //                     invoice_purchase_type: this.purchaseType,
    //                 };
    //             }

    //             this.userServices.createSpareInvoice(this.sendData).subscribe((rData: any) => {
    //                 if (rData.ret_data == 'success') {
    //                     this.coloredToast('success', 'Spare Invoice saved successfully');
    //                     this.router.navigate(['spare-invoice/spare-invoice-list']);
    //                 } else {
    //                     this.coloredToast('danger', "Can't create invoice. Contact administrator");
    //                 }
    //             });
    //         }
    //     }
    // }

    // calculateMarginAmount(spare: any): number {
    //     const marginPercentage = this.partsMargin ? this.partsMargin / 100 : 0;
    //     const unitPrice = +spare.UNIT_PRICE || 0;
    //     const vatAmount = +spare.VAT_AMOUNT || 0;
    //     const quantity = +spare.ITEM_QTY || 1;
    //     let totalUnitPrice = unitPrice * quantity;
    //     if (quantity === 2) {
    //         totalUnitPrice = unitPrice * quantity;
    //     }
    //     return (totalUnitPrice + vatAmount) * marginPercentage;
    // }
    // calculateTotalMarginAmount(data: any): number {
    //     const marginPercentage = this.partsMargin ? this.partsMargin / 100 : 0;
    //     const TOTAL_AMOUNT = +data.TOTAL_AMOUNT || 0;
    //     const TOTAL_DISCOUNT = +data.TOTAL_DISCOUNT || 0;
    //     const TOTAL_VAT_AMOUNT = +data.TOTAL_VAT_AMOUNT || 0;
    //     return (TOTAL_AMOUNT + TOTAL_DISCOUNT + TOTAL_VAT_AMOUNT) * marginPercentage;
    // }

    // calculateTaxableAmount(): number {
    //     return this.inv_details.items.reduce((total: number, spare: any) => {
    //         const subtotal = +spare.UNIT_PRICE * +spare.ITEM_QTY;
    //         return total + subtotal;
    //     }, 0);
    // }

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
