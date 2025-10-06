import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-alm-spare-invoice-edit',
    templateUrl: './alm-spare-invoice-edit.component.html',
    styleUrls: ['./alm-spare-invoice-edit.component.css'],
})
export class AlmSpareInvoiceEditComponent implements OnInit {
    public load_flag: boolean = true;
    public spare_inv_id: string;
    public invoiceDetails: any = {};
    public invlogs: any[] = [];
    public sparePartsMargin: any[] = [];
    public descriptions: any[] = [];
    public descriptionSearch = 'inv_item_description';
    public partcodesSearch = 'inv_item_part_number';
    public partcodes: any[] = [];
    public user_role: any = atob(atob(localStorage.getItem('us_role_id') || '{}'));
    userRoleMargins: any = [];
    public marginFlag: boolean = false;
    public isChecked: boolean = false;

    constructor(private userServices: StaffPostAuthService, private activeRouter: ActivatedRoute, public router: Router) {
        this.spare_inv_id = atob(this.activeRouter.snapshot.paramMap.get('id') || '{}');

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

    ngOnInit(): void {
        this.getSpareInvoiceById();
    }

    getSpareInvoiceById() {
        this.userServices.getSpareInvoiceById({ spareInvId: this.spare_inv_id }).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.invoiceDetails = rdata.invoice;
                this.invlogs = rdata.logs;
                this.invoiceDetails.items.forEach((element: any) => {
                    element.inv_item_return_qty = element.inv_item_return_qty ? element.inv_item_return_qty : '0';
                    let return_amount = element.inv_item_return_qty * (element.inv_item_nm_unit_price * 1 + element.inv_item_nm_vat * 1);
                    element.return_amount = return_amount.toFixed(2);
                    let total = element.inv_item_qty * (element.inv_item_nm_unit_price * 1 + element.inv_item_nm_vat * 1);
                    element.total = total.toFixed(2);
                    if (element.inv_item_margin != '0') {
                        this.isChecked = true;
                    }
                });
                //this.invoiceDetails.inv_nm_return_total = '0.00';
                this.load_flag = false;
            } else {
                this.load_flag = false;
                this.coloredToast('danger', 'Coulldnt fetch spare invoice details');
            }
        });
    }

    addNewSpare() {
        this.invoiceDetails.items.push({
            inv_item_id: 0,
            inv_item_part_number: '',
            inv_item_description: '',
            inv_item_qty: 0,
            inv_item_nm_unit_price: 0,
            inv_item_nm_vat: 0,
            inv_item_return_qty: 0,
            return_amount: 0,
            inv_item_margin_amount: 0,
            inv_item_nm_discount: '0',
            vatflag: false,
        });
    }

    setMargin(item: any, spare: any, num: any) {

        const items = item.items;
        if (num == 1) {
            spare.vatflag = false;
        }

        for (let i = 0; i < items.length; i++) {
            const currentItem = items[i];

            if (currentItem.inv_item_nm_unit_price !== 0 && currentItem.vatflag !== true) {
                currentItem.inv_item_nm_vat = (currentItem.inv_item_nm_unit_price * 0.05).toFixed(2);
                currentItem.vatflag = true;
            }

            if (
                currentItem.inv_item_nm_unit_price !== 0 &&
                currentItem.inv_item_qty !== '0' &&
                currentItem.inv_item_nm_vat !== '0' &&
                currentItem.inv_item_qty > '0'
            ) {
                this.getSparePartsMargin();
            }
        }
    }

    getSparePartsMargin() {
        this.invoiceDetails.inv_alm_margin_total = 0;

        this.invoiceDetails.items.forEach((element: any) => {
            this.sparePartsMargin.forEach((element2) => {
                let qty = element.inv_item_qty - element.inv_item_return_qty;
                let subtotal = qty * (element.inv_item_nm_unit_price * 1 + element.inv_item_nm_vat * 1);
                let return_amount = element.inv_item_return_qty * (element.inv_item_nm_unit_price * 1 + element.inv_item_nm_vat * 1);
                element.return_amount = return_amount.toFixed(2);
                if (subtotal >= element2.spm_start_price && subtotal <= element2.spm_end_price && subtotal != 0) {
                    if (this.isChecked) {
                        element.inv_item_margin = element2.spm_price;
                    } else {
                        element.inv_item_margin = '0';
                    }

                    element.inv_item_margin_amount = (qty *
                        (parseFloat(element.inv_item_nm_unit_price) + parseFloat(element.inv_item_nm_vat)) *
                        (1 + parseFloat(element.inv_item_margin) / 100)
                    ).toFixed(2);
                    this.invoiceDetails.inv_alm_margin_total += parseFloat(element.inv_item_margin_amount);
                    //this.grandTotal = this.marginAppliedTotal;
                }
            });
        });


        let finalprice = 0;
        let finalvat = 0;
        let marginprice = 0;
        this.invoiceDetails.items.forEach((item: any) => {
            if (item.inv_item_delete_flag != '1') {
                const quantity = parseFloat(item.inv_item_qty);
                const unitPrice = parseFloat(item.inv_item_nm_unit_price);
                const vat_amount = parseFloat(item.inv_item_nm_vat);
                const marginAmount = parseFloat(item.inv_item_margin_amount);
                const totalPrice = quantity * unitPrice;
                const totalvat = quantity * vat_amount;
                finalprice += totalPrice;
                finalvat += totalvat;
                marginprice += marginAmount;
            }
        });
        this.invoiceDetails.inv_alm_margin_total = marginprice;
        this.invoiceDetails.inv_nm_sub_total = finalprice;
        this.invoiceDetails.inv_nm_vat_total = finalvat;
        if (this.invoiceDetails.inv_alm_discount != 0) {
            // this.calculateTotal();   check for total
        }
    }

    calculateTotal() {
        this.invoiceDetails.inv_alm_margin_total = 0.0;
        // this.grandTotal = 0.0;
        this.invoiceDetails.items.forEach((element: any) => {
            this.invoiceDetails.inv_alm_margin_total += parseFloat(element.inv_item_margin_amount);
        });
        let total = this.invoiceDetails.inv_alm_margin_total - this.invoiceDetails.inv_alm_discount;
        if (total >= parseFloat(this.invoiceDetails.details.inv_nm_sub_total) + parseFloat(this.invoiceDetails.details.inv_nm_vat_total)) {
            // this.grandTotal = this.marginAppliedTotal - this.discountApplied;
        } else {
            //this.discountApplied=0;
            // this.grandTotal = this.marginAppliedTotal - this.discountApplied;
            this.coloredToast('danger', 'Invoice Need Admin Approval');
        }
    }

    checkReturnQTY(spare: any) {


        if (spare.inv_item_return_qty >= 0) {
            if (spare.inv_item_return_qty <= spare.inv_item_qty) {
                let return_amount = spare.inv_item_return_qty * (spare.inv_item_nm_unit_price * 1 + spare.inv_item_nm_vat * 1);
                spare.return_amount = return_amount.toFixed(2);
                let item_qty = spare.inv_item_qty - spare.inv_item_return_qty;

                if (item_qty != 0) {
                    let subtotal = spare.inv_item_qty * (spare.inv_item_nm_unit_price * 1 + spare.inv_item_nm_vat * 1) - spare.return_amount;
                    this.sparePartsMargin.forEach((element) => {

                        if (subtotal >= element.spm_start_price && subtotal <= element.spm_end_price) {
                            spare.inv_item_margin = element.spm_price;
                            spare.margin_total = (
                                item_qty *
                                (parseFloat(spare.inv_item_nm_unit_price) + parseFloat(spare.inv_item_nm_vat)) *
                                (1 + parseFloat(spare.inv_item_margin) / 100)
                            ).toFixed(2);
                            spare.inv_item_margin_amount = parseFloat(spare.margin_total).toFixed(2);
                            // this.invoiceDetails.inv_alm_margin_total = +spare.inv_item_margin_amount;
                        }
                    });
                } else {
                    spare.inv_item_margin = '0';
                    spare.margin_total = '0.00';
                    spare.inv_item_margin_amount = '0.00';
                }

                this.invoiceDetails.inv_nm_return_total = this.calculateTotalReturnAmount(this.invoiceDetails.items);
                this.invoiceDetails.inv_alm_margin_total = this.calculateTotalMarginAmount(this.invoiceDetails.items);
            } else {
                spare.inv_item_return_qty = '0';
                spare.return_amount = '0.00';
                this.invoiceDetails.inv_nm_return_total = this.calculateTotalReturnAmount(this.invoiceDetails.items);
                this.coloredToast('danger', 'Return Quantity Is Greater Than Selected Quantity');
            }
        } else {
            this.coloredToast('danger', 'Return Quantity Cannot Be Less Than Zero');
        }
    }

    calculateTotalMarginAmount(items: any) {
        let totalAmount = 0;
        for (let item of items) {
            totalAmount += parseFloat(item.inv_item_margin_amount);
        }
        return totalAmount;
    }

    calculateTotalReturnAmount(orders: { return_amount: string }[]): number {
        return orders.reduce((total, order) => {
            const grandTotalNum = parseFloat(order.return_amount.replace(',', ''));
            return total + grandTotalNum;
        }, 0);
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
                if (element.inv_item_id != '0') {
                    element.inv_item_delete_flag = 1;
                } else {
                    this.invoiceDetails.items.splice(i, 1);
                }
                //this.inv_details.items.splice(i, 1);
                this.getSparePartsMargin();
            }
        });
    }

    printSpareInvoice() {
        window.open(environment.base_url + '/HTMLPdfController/printSpareInvoice?id=' + encodeURIComponent(btoa(this.spare_inv_id)), '_blank');
    }

    updateMargin(spare: any) {
        this.marginFlag = true;
        // let inv_item_margin = spare.inv_item_margin;
        let item_qty = spare.inv_item_qty - spare.inv_item_return_qty;
        if (item_qty != 0) {
            let subtotal = item_qty * (spare.inv_item_nm_unit_price * 1 + spare.inv_item_nm_vat * 1);
            if (spare.inv_item_margin_amount > 0 && subtotal > 0) {
                const percentageDifference = (spare.inv_item_margin_amount * 100) / subtotal - 100;
                spare.inv_item_margin = percentageDifference.toFixed(2);
            } else {
                spare.inv_item_margin = '0.00';
            }
            const margin_applied = parseFloat(spare.inv_item_margin);

            this.userServices.getUserRoleMargin().subscribe((rdata: any) => {
                if (rdata.ret_data === 'success') {
                    this.userRoleMargins = rdata.userRoleMargins;
                    if (this.userRoleMargins.length > 0) {
                        this.userRoleMargins.forEach((element: any) => {
                            if (element.ml_role_id == this.user_role) {
                                const min_margin = element.ml_minimum_margin;
                                const max_margin = element.ml_maximum_margin;

                                if (min_margin != 9999) {
                                    if (margin_applied >= min_margin) {
                                        // spare.margin_total = (
                                        //     item_qty *
                                        //     (parseFloat(spare.inv_item_nm_unit_price) + parseFloat(spare.inv_item_nm_vat)) *
                                        //     (1 + parseFloat(spare.inv_item_margin) / 100)
                                        // ).toFixed(2);
                                        // spare.inv_item_margin_amount = parseFloat(spare.margin_total).toFixed(2);
                                        this.invoiceDetails.inv_alm_margin_total = this.calculateTotalMarginAmount(this.invoiceDetails.items);
                                        this.marginFlag = true;
                                    } else {
                                        this.marginFlag = false;
                                        this.coloredToast('danger', "You don't have permission to reduce the margin by that much");
                                    }
                                }
                                if (max_margin != 9999) {
                                    if (margin_applied <= max_margin) {
                                        // spare.margin_total = (
                                        //     item_qty *
                                        //     (parseFloat(spare.inv_item_nm_unit_price) + parseFloat(spare.inv_item_nm_vat)) *
                                        //     (1 + parseFloat(spare.inv_item_margin) / 100)
                                        // ).toFixed(2);
                                        // spare.inv_item_margin_amount = parseFloat(spare.margin_total).toFixed(2);
                                        this.invoiceDetails.inv_alm_margin_total = this.calculateTotalMarginAmount(this.invoiceDetails.items);
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
            this.invoiceDetails.inv_alm_margin_total = '0.00';
            spare.inv_item_margin = '0.00';
            spare.inv_item_margin_amount = '0.00';
        }
    }

    updateInvoice() {
        console.log('final invoice details>>>>>', this.invoiceDetails);

        const sendData = {
            inv_id: this.invoiceDetails.inv_id,
            inv_alm_discount: parseFloat(this.invoiceDetails.inv_alm_discount).toFixed(2),
            inv_nm_sub_total: parseFloat(this.invoiceDetails.inv_nm_sub_total).toFixed(2),
            inv_nm_vat_total: parseFloat(this.invoiceDetails.inv_nm_vat_total).toFixed(2),
            inv_alm_margin_total: parseFloat(this.invoiceDetails.inv_alm_margin_total).toFixed(2),
            inv_nm_branch: this.invoiceDetails.inv_nm_branch,
            inv_nm_return_total: parseFloat(this.invoiceDetails.inv_nm_return_total).toFixed(2),
            invoice_items: this.invoiceDetails.items,
        };

        this.userServices.updateSpareInvoice(sendData).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.router.navigate(['spare-invoice/spare-invoice-list']);
                this.coloredToast('success', 'Invoice updated Successfully');
            }
        });
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
