import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-post-invoice-create',
    templateUrl: './post-invoice-create.component.html',
    styleUrls: ['./post-invoice-create.component.css'],
})
export class PostInvoiceCreateComponent implements OnInit {
    inv_details: any = {
        items: [
            {
                PART_NO: '',
                DESCRIPTION: '',
                ITEM_QTY: 0,
                UNIT_PRICE: 0,
                VAT_AMOUNT: 0,
                DISCOUNT_AMOUNT: '0',
                vatflag: false,
            },
        ],
        details: {
            TOTAL_AMOUNT: 0,
            TOTAL_VAT_AMOUNT: 0,
            TOTAL_DISCOUNT: null,
        },
    };

    marginAppliedTotal: any = 0;
    grandTotal: number = 0;
    discountApplied: any = 0.0;
    sparePartsMargin: any[] = [];
    jobCardCustomer: any[] = [];
    Jobcards: any[] = [];
    filteredJobcards: any[] = [];
    type = null;
    chassis_no = null;
    selectedJobcard: string = '';
    selectedSupplier: string = '';
    purchaseType = null;
    invoiceNo = null;
    sendData: any;
    inv_date: any;
    selectedCustomer = null;
    selectedCustomerCode = null;
    selectedVehicle = null;

    suppliersList: any[] = [];
    descriptions: any[] = [];
    partcodes: any[] = [];

    public description = null;
    convertedDate: any;

    public descriptionSearch = 'inv_item_description';
    public partcodesSearch = 'inv_item_part_number';
    basic: FlatpickrOptions;

    isChecked = false;
    public user_role: any = atob(atob(localStorage.getItem('us_role_id') || '{}'));
    userRoleMargins: any = [];
    public marginFlag: boolean = true;

    constructor(public storeData: Store<any>, private userServices: StaffPostAuthService, public router: Router, public datepipe: DatePipe) {
        this.basic = {
            dateFormat: 'Y-m-d',
            //minDate: new Date(),
        };

        this.userServices.getSupplierDetails().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.suppliersList = rData.Suppliers;
            }
        });
        this.userServices.getSparePartsMargin().subscribe((rdata: any) => {
            if ((rdata.ret_data = 'success')) {
                this.sparePartsMargin = rdata.sparePartsMargin;
            } else {
                this.coloredToast('danger', 'Some error occurred please try again');
            }
        });
        this.userServices.getSparePartsDesandPart().subscribe((rdata: any) => {
            if ((rdata.ret_data = 'success')) {
                this.descriptions = rdata.descriptions.map(function (i: any) {
                    return i.inv_item_description;
                });
                this.partcodes = rdata.partNo.map(function (i: any) {
                    return i.inv_item_part_number;
                });
            } else {
                this.coloredToast('danger', 'Some error occurred please try again');
            }
        });
    }

    ngOnInit() {
        this.initDatas();
    }

    initDatas() {
        this.userServices.getAlmInvoiceComman().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.Jobcards = rData.jobCards;
                this.filteredJobcards = this.Jobcards.slice(0, 10);
                //  this.load_flag = false;
            } else {
                //this.load_flag = false;
                this.coloredToast('danger', 'Cant fetch details, Some error occurred please try again');
            }
        });
    }

    setMargin(item: any, spare: any, num: any) {
        const items = item.items;
        if (num == 1) {
            spare.vatflag = false;
        }

        for (let i = 0; i < items.length; i++) {
            const currentItem = items[i];

            if (currentItem.UNIT_PRICE !== 0 && currentItem.vatflag !== true) {
                currentItem.VAT_AMOUNT = (currentItem.UNIT_PRICE * 0.05).toFixed(2);
                currentItem.vatflag = true;
            }

            if (currentItem.UNIT_PRICE !== 0 && currentItem.ITEM_QTY !== '0' && currentItem.VAT_AMOUNT !== '0' && currentItem.ITEM_QTY > '0') {
                this.getSparePartsMargin();
            }
        }
    }

    addNewSpare() {
        this.inv_details.items.push({
            PART_NO: '',
            DESCRIPTION: '',
            ITEM_QTY: 0,
            UNIT_PRICE: 0,
            VAT_AMOUNT: 0,
            DISCOUNT_AMOUNT: '0',
            vatflag: false,
        });
    }

    deleteSpare(i: number, element: any) {
        Swal.fire({
            icon: 'warning',
            title: 'You are about to delete a spare, Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            padding: '2em',
            customClass: 'sweet-alerts',
        }).then((result) => {
            if (result.value) {
                this.inv_details.items.splice(i, 1);
                this.getSparePartsMargin();
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

    getSparePartsMargin() {
        this.marginAppliedTotal = 0;
        this.inv_details.items.forEach((element: any) => {
            this.sparePartsMargin.forEach((element2) => {
                let subtotal = element.ITEM_QTY * (element.UNIT_PRICE * 1 + element.VAT_AMOUNT * 1);
                if (subtotal >= element2.spm_start_price && subtotal <= element2.spm_end_price && subtotal != 0) {
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
        // this.show_flag = true;
        // this.load_flag = false;

        let finalprice = 0;
        let finalvat = 0;
        this.inv_details.items.forEach((item: any) => {
            const quantity = parseFloat(item.ITEM_QTY);
            const unitPrice = parseFloat(item.UNIT_PRICE);
            const vat_amount = parseFloat(item.VAT_AMOUNT);
            const totalPrice = quantity * unitPrice;
            const totalvat = quantity * vat_amount;
            finalprice += totalPrice;
            finalvat += totalvat;
        });
        this.inv_details.details.TOTAL_AMOUNT = finalprice;
        this.inv_details.details.TOTAL_VAT_AMOUNT = finalvat;
        if (this.discountApplied != 0) {
            this.calculateTotal();
        }
    }

    updateMargin(spare: any) {
        this.marginFlag = true;
        if (this.isChecked) {
            let subtotal = spare.ITEM_QTY * (spare.UNIT_PRICE * 1 + spare.VAT_AMOUNT * 1);
            if (spare.margin_total > 0 && subtotal > 0) {
                const percentageDifference = (spare.margin_total * 100) / subtotal - 100;
                spare.margin_applied = percentageDifference.toFixed(2);
            } else {
                spare.margin_applied = '0.00';
            }
            let margin_applied = spare.margin_applied;
            this.userServices.getUserRoleMargin().subscribe((rdata: any) => {
                if (rdata.ret_data === 'success') {
                    this.userRoleMargins = rdata.userRoleMargins;
                    if (this.userRoleMargins.length > 0) {
                        this.userRoleMargins.forEach((element: any) => {
                            if (element.ml_role_id == this.user_role) {
                                const min_margin = element.ml_minimum_margin;
                                const max_margin = element.ml_maximum_margin;

                                if (min_margin != 9999) {
                                    if (parseFloat(margin_applied) >= parseFloat(min_margin)) {
                                        this.marginAppliedTotal = 0;
                                        this.grandTotal = 0;
                                        // spare.margin_total = (
                                        //     parseFloat(spare.ITEM_QTY) *
                                        //     (parseFloat(spare.UNIT_PRICE) + parseFloat(spare.VAT_AMOUNT)) *
                                        //     (1 + parseFloat(spare.margin_applied) / 100)
                                        // ).toFixed(2);
                                        this.marginAppliedTotal += parseFloat(spare.margin_total);
                                        this.grandTotal = this.marginAppliedTotal;
                                        this.marginFlag = true;
                                    } else {
                                        this.marginFlag = false;
                                        this.coloredToast('danger', "You don't have permission to reduce the margin by that much");
                                    }
                                }
                                if (max_margin != 9999) {
                                    if (parseFloat(margin_applied) <= parseFloat(max_margin)) {
                                        this.marginAppliedTotal = 0;
                                        this.grandTotal = 0;
                                        // spare.margin_total = (
                                        //     parseFloat(spare.ITEM_QTY) *
                                        //     (parseFloat(spare.UNIT_PRICE) + parseFloat(spare.VAT_AMOUNT)) *
                                        //     (1 + parseFloat(spare.margin_applied) / 100)
                                        // ).toFixed(2);
                                        this.marginAppliedTotal += parseFloat(spare.margin_total);
                                        this.grandTotal = this.marginAppliedTotal;
                                        this.marginFlag = true;
                                    } else {
                                        this.marginFlag = false;
                                        this.coloredToast('danger', "You don't have permission to increase the margin by that much");
                                    }
                                }
                            }
                        });
                    }
                }
            });
        } else {
            this.getSparePartsMargin();
        }
    }

    calculateGP(totalInvCost: number, totalInvCostWithoutMargin: number): string {
        if (totalInvCost > 0 && totalInvCostWithoutMargin > 0) {
            const percentageDifference = (totalInvCost * 100) / totalInvCostWithoutMargin - 100;
            return percentageDifference.toFixed(2);
        } else {
            return '0.00';
        }
    }

    saveNMInvoice() {
        if (!this.selectedSupplier) {
            this.coloredToast('danger', 'Supplier is mandatory');
            return;
        }

        if (!this.type) {
            this.coloredToast('danger', 'Invoice Type is mandatory');
            return;
        }

        if (!this.purchaseType) {
            this.coloredToast('danger', 'Purchase Type is mandatory');
            return;
        }

        if (this.type === '3' && !this.selectedJobcard) {
            this.coloredToast('danger', 'Jobcard is mandatory');
            return;
        }
        const marginapplied = parseFloat(this.marginAppliedTotal).toFixed(2);
        const total = this.marginAppliedTotal - this.discountApplied;
        const totalAmountAndVat = parseFloat(this.inv_details.details.TOTAL_AMOUNT) + parseFloat(this.inv_details.details.TOTAL_VAT_AMOUNT);
        const invoiceStatus = this.type === '1' && total < totalAmountAndVat ? 2 : 1;

        let datevalD = new Date(this.inv_date[0]);
        let dateOnly = datevalD.getFullYear() + '-' + ('0' + (datevalD.getMonth() + 1)).slice(-2) + '-' + ('0' + datevalD.getDate()).slice(-2);
        let monthAbbreviation = this.datepipe.transform(dateOnly, 'MMM');
        let uppercaseMonthAbbreviation = monthAbbreviation ? monthAbbreviation.toUpperCase() : '';
        this.convertedDate = this.datepipe.transform(dateOnly, 'dd') + '-' + uppercaseMonthAbbreviation + '-' + this.datepipe.transform(dateOnly, 'yy');

        const sendData = {
            supplier_id: this.selectedSupplier,
            customerCode: this.selectedCustomerCode,
            vehicle_id: this.selectedVehicle,
            jc_no: this.selectedJobcard,
            nm_invoice: this.invoiceNo,
            nm_inv_date: this.convertedDate,
            nm_sub_total: parseFloat(this.inv_details.details.TOTAL_AMOUNT).toFixed(2),
            nm_vat_total: parseFloat(this.inv_details.details.TOTAL_VAT_AMOUNT).toFixed(2),
            nm_discount: this.inv_details.details.TOTAL_DISCOUNT,
            alm_margin_total: parseFloat(this.marginAppliedTotal).toFixed(2),
            alm_discount: parseFloat(this.discountApplied).toFixed(2),
            invoice_items: this.inv_details.items,
            invoice_status: invoiceStatus,
            invoice_type: this.type,
            invoice_purchase_type: this.purchaseType,
            invoice_description: this.description,
        };

        this.userServices.createSpareInvoice(sendData).subscribe((rData: any) => {
            if (rData.ret_data === 'success') {
                this.coloredToast('success', 'Spare Invoice saved successfully');
                this.router.navigate(['spare-invoice/spare-invoice-list']);
            } else {
                this.coloredToast('danger', "Can't create invoice. Contact administrator");
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

    checkValue(event: any) {
        this.isChecked = event;
        this.getSparePartsMargin();
    }

    resetFields(data: number) {
        switch (data) {
            case 1:
                this.isChecked = false;
                this.type = null;
                this.selectedJobcard = '';
                this.jobCardCustomer = [];
                break;
            case 2:
                if (this.type == 3) {
                    this.isChecked = true;
                } else {
                    this.isChecked = false;
                }
                this.selectedJobcard = '';
                this.jobCardCustomer = [];
                this.getSparePartsMargin();
                break;
            case 3:
                this.type = null;
                this.isChecked = false;
                this.purchaseType = null;
                this.invoiceNo = null;
                this.selectedJobcard = '';
                this.jobCardCustomer = [];
                this.inv_date = '';
                break;
            default:
                throw new Error('Invalid data value');
        }
    }

    filterJobcards(event: any) {
        const filtered = this.Jobcards.filter((product: any) => {
            return product.job_no.toLowerCase().includes(event.term.toLowerCase());
        });
        this.filteredJobcards = [...filtered.slice(0, 10)];
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
