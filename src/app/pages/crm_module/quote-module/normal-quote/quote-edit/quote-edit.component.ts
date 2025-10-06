import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RoutesRecognized } from '@angular/router';
import { Observable, filter, of, pairwise } from 'rxjs';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-quote-edit',
    templateUrl: './quote-edit.component.html',
    styleUrls: ['./quote-edit.component.css'],
})
export class QuoteEditComponent implements OnInit {
    public quoteId: string;
    public source: string;
    public brandList = [];
    public userForm: FormGroup;
    public qt_data = [];
    public qt_items = [];
    public qt_item_spare: any = [];
    public qt_item_service: any = [];
    public qt_generic_item: any = [];
    public qt_versions: any = [];
    public printList: any = [];
    public item_version = {
        qvm_recommended_flag: 0, // Initially set to 0 for false
    };
    public data_load_flag: boolean = true;
    public spareSearch = 'item_name';
    public spareCodeSearch = 'item_name';
    public genericSearch = 'item_name';
    public labourSearch = 'item_name';
    public user_role: any = atob(atob(localStorage.getItem('us_role_id') || '{}'));
    public user_id: any = atob(atob(localStorage.getItem('us_id') || '{}'));
    activeTab = 'home';

    preServiceList = [];
    preSpareList = [];
    preSpareCodeList = [];
    preGenericList = [];

    saList: any = [];
    isChecked = false;
    sparePartsMargin: any = [];
    marginAppliedTotal: any = 0;
    public marginFlag: boolean = false;
    public success_flag: boolean = true;
    public margin_flag: boolean = true;

    userRoleMargins: any = [];
    public labourConditionList: any = [];
    public labourpriorityList: any = [];
    previousValue: any;
    public updateFlag: boolean = false;

    @ViewChild('sparePreview') sparePreview: any;
    @ViewChildren('inputField') inputFields: any;
    @ViewChildren('inputFieldGeneric') inputFieldGeneric: any;
    @ViewChildren('inputFieldLabour') inputFieldLabour!: any;

    constructor(private activeRouter: ActivatedRoute, private fb: FormBuilder, private userServices: StaffPostAuthService) {
        this.quoteId = atob(this.activeRouter.snapshot.paramMap.get('id') || '{}');
        this.source = this.activeRouter.snapshot.paramMap.get('source') || '';
        this.source == '1' ? (this.activeTab = 'home') : (this.activeTab = 'quote-versions');
        this.userForm = this.fb.group({
            qt_code: [''],
            customer: ['', [Validators.maxLength(80), Validators.pattern('[a-zA-Z][a-zA-Z ]+[a-zA-Z]$')]],
            chassis: ['', [Validators.required, Validators.maxLength(17), Validators.pattern('[(A-H|J-N|P|R-Z|0-9)]{17}')]],
            jobcard: ['', [Validators.maxLength(10)]],
            regno: ['', [Validators.maxLength(10)]],
            odometer: ['', [Validators.pattern('[0-9]+'), Validators.maxLength(7)]],
            mobile: ['', [Validators.pattern('[0-9]+'), Validators.maxLength(11)]],
            model: ['', [Validators.maxLength(30)]],
            qt_seq: [''],
            sa: [''],
            pa: [''],
            part_code_print: [false],
            avail_print: [false],
            part_type_print: [false],
            sa_id: null,
            marginAppliedTotal: [''],
            vehicle_value: [''],
        });

        this.userServices.userList().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.saList = rdata.userList.filter((item: any) => item.us_role_id == '11');
            }
        });
        this.userServices.getSparePartsMargin().subscribe((rdata: any) => {
            if ((rdata.ret_data = 'success')) {
                this.sparePartsMargin = rdata.sparePartsMargin;
            }
        });

        this.userServices.getUserRoleMargin().subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.userRoleMargins = rdata.userRoleMargins;
            }
        });
        // this.router.events
        //   .pipe(filter((e: any) => e instanceof RoutesRecognized),
        //     pairwise()
        //   ).subscribe((e: any) => {
        //     console.log(e[0].urlAfterRedirects);
        //   });
    }

    ngOnInit(): void {
        this.getQuoteDetails();
        this.userServices.getBrandList().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.brandList = rdata.brand;
            }
        });

        this.userServices.commonQuoteDetails().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.preSpareList = rdata.spare_items.map(function (i: any) {
                    return i.item_name;
                });
                this.preServiceList = rdata.service_items.map(function (i: any) {
                    return i.item_name;
                });
                this.preGenericList = rdata.generic_items.map(function (i: any) {
                    return i.item_name;
                });
                this.preSpareCodeList = rdata.spare_code.map(function (i: any) {
                    return i.item_name;
                });
                this.labourConditionList = rdata.labour_condition;
                this.labourpriorityList = rdata.labour_priority;
            }
        });
        this.registerHotkey();
    }

    getQuoteDetails() {
        this.marginFlag = false;
        this.userServices.getQuoteDetailsById(this.quoteId).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                const { quotation, qt_items } = rdata;
                this.qt_data = quotation;
                this.qt_items = qt_items;
                // if (quotation.qt_service_adv == '11' && this.user_id == '11' && this.user_role == '11' )
                if ((this.user_id == '52' || this.user_id == '10') && quotation.qt_margin_flag == '1') {
                    this.isChecked = true;
                    this.marginFlag = true;
                } else {
                    this.isChecked = false;
                    this.marginFlag = true;
                }
                qt_items.forEach((element: any) => {
                    if (element.qit_margin_price != '0' && element.qit_margin_price != '0.00') {
                        element.margin_total = element.qit_margin_price;
                        element.old_margin_total = element.qit_old_margin_price;
                    } else {
                        this.sparePartsMargin.forEach((element2: any) => {
                            let subtotal = element.item_qty * element.qit_unit_price;
                            if (subtotal >= element2.spm_start_price && subtotal <= element2.spm_end_price && subtotal != 0) {
                                if (this.isChecked) {
                                    element.margin_applied = element2.spm_price;
                                    element.margin_total = (
                                        parseFloat(element.item_qty.replace(/,/g, '')) *
                                        parseFloat(element.qit_unit_price.replace(/,/g, '')) *
                                        (1 + parseFloat(element.margin_applied) / 100)
                                    ).toFixed(2);
                                    element.old_margin_total = (
                                        parseFloat(element.item_qty.replace(/,/g, '')) *
                                        parseFloat(element.qit_unit_price.replace(/,/g, '')) *
                                        (1 + parseFloat(element.margin_applied) / 100)
                                    ).toFixed(2);
                                    this.marginAppliedTotal += parseFloat(element.margin_total);
                                    element.marginAppliedTotal += parseFloat(element.margin_total);
                                } else {
                                    element.margin_applied = '0';
                                    element.margin_total = '0';
                                    element.old_margin_total = '0';
                                }
                            }
                        });
                    }
                });
                const qtItemMap = new Map();
                const qtItemService: any = [];
                const qtGenericItem: any = [];
                qt_items.forEach((element: any) => {
                    const itemType = element.item_type;
                    const qtItem = {
                        item_type: element.item_type,
                        item_code: element.item_code,
                        item_name: element.item_name,
                        item_note: element.item_note,
                        item_qty: element.item_qty,
                        item_id: element.item_id,
                        item_delete_flag: element.item_delete_flag,
                        item_seq: element.item_seq,
                        unit_price: element.unit_price,
                        item_p_types: [],
                        margin_percentage: element.margin_applied,
                        margin_total: element.margin_total,
                        old_margin_total: element.old_margin_total,
                    };
                    if (itemType === '1') {
                        if (!qtItemMap.has(element.item_id)) {
                            qtItemMap.set(element.item_id, qtItem);
                        }
                    } else if (itemType === '2') {
                        qtItemService.push(element);
                    } else if (itemType === '3') {
                        qtGenericItem.push(element);
                    }
                });
                const qtItemSpare = Array.from(qtItemMap.values());
                qt_items.forEach((element: any) => {
                    if (element.item_type === '1' && element.qit_delete_flag == '0') {
                        const qtItem = qtItemMap.get(element.item_id);
                        qtItem.item_p_types.push({
                            qit_id: element.qit_id,
                            qit_item_id: element.qit_item_id,
                            qit_qt_id: element.qit_qt_id,
                            qit_brand: element.qit_brand,
                            qit_brand_name: element.brand_name,
                            qit_type: element.qit_type,
                            qit_availability: element.qit_availability,
                            qit_unit_price: element.qit_unit_price,
                            qit_discount: element.qit_discount,
                            qit_delete_flag: element.qit_delete_flag,
                            margin_percentage: element.margin_applied,
                            margin_total: element.margin_total,
                            old_margin_total: element.old_margin_total,
                        });
                    }
                });
                this.userForm.patchValue({
                    qt_code: quotation.qt_code,
                    customer: quotation.qt_cus_name,
                    chassis: quotation.qt_chasis,
                    jobcard: quotation.qt_jc_no,
                    regno: quotation.qt_reg_no,
                    odometer: quotation.qt_odometer,
                    mobile: quotation.qt_cus_contact,
                    part_code_print: quotation.part_code_print === '1',
                    avail_print: quotation.avail_print === '1',
                    part_type_print: quotation.part_type_print === '1',
                    model: quotation.qt_make,
                    sa: quotation.sa_name,
                    pa: quotation.pa_name,
                    sa_id: quotation.qt_service_adv,
                });
                this.qt_item_service = qtItemService;
                this.qt_generic_item = qtGenericItem;
                this.qt_item_spare = qtItemSpare;
                this.data_load_flag = false;
                this.updateFlag = false;
            } else {
                this.data_load_flag = false;
                this.updateFlag = true;
            }
        });
    }

    addSA(us_id: any) {
        // if (us_id == 11 && this.user_id == '11')
        if (this.user_id == '52' || this.user_id == '10') {
            this.isChecked = true;
            this.marginFlag = true;
            this.getSparePartsMargin();
        } else {
            this.marginFlag = false;
        }
    }

    getSparePartsMargin() {
        this.marginAppliedTotal = 0;
        this.qt_item_spare.forEach((item: any) => {
            item.item_p_types.forEach((element: any) => {
                this.sparePartsMargin.forEach((element2: any) => {
                    let subtotal = item.item_qty * element.qit_unit_price;
                    if (subtotal >= element2.spm_start_price && subtotal <= element2.spm_end_price && subtotal != 0) {
                        if (this.isChecked) {
                            element.margin_applied = element2.spm_price;
                        } else {
                            element.margin_applied = '0';
                        }
                        element.margin_total = (
                            parseFloat(item.item_qty.replace(/,/g, '')) *
                            parseFloat(element.qit_unit_price.replace(/,/g, '')) *
                            (1 + parseFloat(element.margin_applied) / 100)
                        ).toFixed(2);
                        element.old_margin_total = (
                            parseFloat(item.item_qty.replace(/,/g, '')) *
                            parseFloat(element.qit_unit_price.replace(/,/g, '')) *
                            (1 + parseFloat(element.margin_applied) / 100)
                        ).toFixed(2);
                        this.marginAppliedTotal = element.margin_total;
                        element.marginAppliedTotal = element.margin_total;
                    }
                });
            });
        });
        // this.show_flag = true;
        // this.load_flag = false;
        // let finalprice = 0;
        // let finalvat = 0;
        // this.inv_details.items.forEach((item: any) => {
        //     const quantity = parseFloat(item.ITEM_QTY);
        //     const unitPrice = parseFloat(item.UNIT_PRICE);
        //     const vat_amount = parseFloat(item.VAT_AMOUNT);
        //     const totalPrice = quantity * unitPrice;
        //     const totalvat = quantity * vat_amount;
        //     finalprice += totalPrice;
        //     finalvat += totalvat;
        // });
        // this.inv_details.details.TOTAL_AMOUNT = finalprice;
        // this.inv_details.details.TOTAL_VAT_AMOUNT = finalvat;
        // if (this.discountApplied != 0) {
        //     this.calculateTotal();
        // }
    }

    checkValue(event: any) {
        this.isChecked = event;
        this.getSparePartsMargin();
    }

    private focusOnLastInput(type: any) {
        setTimeout(() => {
            const inputElements = type == 1 ? this.inputFields.toArray() : type == 2 ? this.inputFieldGeneric.toArray() : this.inputFieldLabour.toArray();
            if (inputElements.length > 0) {
                const lastInputElement = inputElements[inputElements.length - 1];
                lastInputElement.focus();
            }
        });
    }

    private registerHotkey() {
        // Register a keyboard event listener
        document.addEventListener('keydown', (e) => {
            if ((e.key === 'p' || e.key === 'P') && e.altKey === true) {
                this.addItemSpare();
            }
            if ((e.key === 'g' || e.key === 'G') && e.altKey === true) {
                this.addGenericItem();
            }
            if ((e.key === 'l' || e.key === 'L') && e.altKey === true) {
                this.addItemLabour();
            }
        });
    }

    addItemTypeSpare(row_data: any) {
        let index = row_data.item_p_types.length - 1;
        if (index >= 0) {
            if (row_data.item_p_types[index].part_brand == 0 || row_data.item_p_types[index].part_type == '0' || row_data.item_p_types[index].unit_price == 0) {
                this.coloredToast('danger', 'Please fill all item details');
            } else {
                row_data.item_p_types.push({
                    qit_id: 0,
                    qit_item_id: row_data.item_id,
                    qit_brand: null,
                    qit_type: '0',
                    qit_availability: 'Stock',
                    qit_unit_price: 0,
                    qit_discount: 0,
                    qit_delete_flag: 0,
                });
            }
        } else {
            row_data.item_p_types.push({
                qit_id: 0,
                qit_item_id: row_data.item_id,
                qit_brand: null,
                qit_type: '0',
                qit_availability: 'Stock',
                qit_unit_price: 0,
                qit_discount: 0,
                qit_delete_flag: 0,
            });
        }
    }
    deleteItemSpare(item_data: any, i: number, master: any) {
        Swal.fire({
            icon: 'warning',
            title: 'You are about to delete a spare type, Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            padding: '2em',
            customClass: 'sweet-alerts',
        }).then((result) => {
            if (result.value) {
                if (item_data.qit_id > 0) {
                    item_data.qit_delete_flag = 1;
                } else {
                    master.splice(i, 1);
                }
            }
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
                if (element.item_id > 0) {
                    element.item_delete_flag = '1';
                } else {
                    this.qt_item_spare.splice(i, 1);
                }
            }
        });
    }
    addItemSpare() {
        this.qt_item_spare.push({
            item_type: '1',
            item_code: '',
            item_name: '',
            item_qty: 1,
            item_id: 0,
            item_delete_flag: 0,
            item_seq: this.qt_item_spare.length,
            unit_price: 0,
            item_p_types: [
                {
                    qit_id: 0,
                    qit_item_id: 0,
                    qit_brand: null,
                    qit_type: '0',
                    qit_availability: 'Stock',
                    qit_unit_price: 0,
                    qit_discount: 0,
                    qit_delete_flag: 0,
                },
            ],
        });
        this.focusOnLastInput(1);
    }
    deleteGenericItem(j: number, element: any) {
        Swal.fire({
            icon: 'warning',
            title: 'You are about to delete a generic item, Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            padding: '2em',
            customClass: 'sweet-alerts',
        }).then((result) => {
            if (result.value) {
                if (element.item_id > 0) {
                    element.item_delete_flag = '1';
                } else {
                    this.qt_generic_item.splice(j, 1);
                }
            }
        });
    }

    addGenericItem() {
        this.qt_generic_item.push({
            item_type: '3',
            item_code: '',
            item_name: '',
            item_qty: 1,
            item_id: 0,
            item_delete_flag: 0,
            item_seq: this.qt_generic_item.length,
            unit_price: 0,
            item_p_types: [],
            item_priority: null,
        });
        this.focusOnLastInput(2);
    }
    deleteLabour(j: number, element: any) {
        Swal.fire({
            icon: 'warning',
            title: 'You are about to delete a labour, Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            padding: '2em',
            customClass: 'sweet-alerts',
        }).then((result) => {
            if (result.value) {
                if (element.item_id > 0) {
                    element.item_delete_flag = '1';
                } else {
                    this.qt_item_service.splice(j, 1);
                }
            }
        });
    }
    addItemLabour() {
        this.qt_item_service.push({
            item_type: '2',
            item_code: '',
            item_name: '',
            item_qty: 1,
            item_id: 0,
            item_delete_flag: 0,
            item_seq: this.qt_item_service.length,
            unit_price: 0,
            item_p_types: [],
            item_condition: null,
            item_priority: null,
        });
        this.focusOnLastInput(3);
    }
    openPreview() {
        this.sparePreview.open();
    }

    getMarginPrice(i: any, j: any) {
        if (this.qt_item_spare[i]?.item_p_types?.[j]) {
            const item = this.qt_item_spare[i];
            const type = item.item_p_types[j];

            this.sparePartsMargin.forEach((margin: any) => {
                const subtotal = item.item_qty * type.qit_unit_price;

                if (subtotal >= margin.spm_start_price && subtotal <= margin.spm_end_price && subtotal !== 0) {
                    const appliedMargin = this.isChecked ? margin.spm_price : 0;
                    type.margin_applied = appliedMargin.toString();
                    const qty = parseFloat(item.item_qty);
                    const unitPrice = parseFloat(type.qit_unit_price);
                    const marginTotal = (qty * unitPrice * (1 + appliedMargin / 100)).toFixed(2);

                    type.margin_total = marginTotal;
                    type.old_margin_total = marginTotal;
                    type.marginAppliedTotal = marginTotal;
                }
            });
        } else {
            this.qt_item_spare.forEach((item: any) => {
                this.sparePartsMargin.forEach((element2: any) => {
                    let subtotal = item.item_qty * item.item_p_types.qit_unit_price;
                    if (subtotal >= element2.spm_start_price && subtotal <= element2.spm_end_price && subtotal != 0) {
                        if (this.isChecked) {
                            item.item_p_types.margin_applied = element2.spm_price;
                        } else {
                            item.item_p_types.margin_applied = '0';
                        }
                        let qty = parseFloat(item.item_qty);
                        let unitPrice = parseFloat(item.item_p_types.qit_unit_price);
                        let marginTotal = (qty * unitPrice * (1 + parseFloat(item.item_p_types[j].margin_applied) / 100)).toFixed(2);
                        item.item_p_types.margin_total = marginTotal;
                        item.item_p_types.old_margin_total = marginTotal;
                        item.item_p_types.marginAppliedTotal = marginTotal;
                    }
                });
            });
        }

        // this.qt_item_spare.forEach((item: any) => {
        //     this.sparePartsMargin.forEach((element2: any) => {
        //         let subtotal = item.item_qty * item.item_p_types[j].qit_unit_price;
        //         if (subtotal >= element2.spm_start_price && subtotal <= element2.spm_end_price && subtotal != 0) {
        //             if (this.isChecked) {
        //                 item.item_p_types[j].margin_applied = element2.spm_price;
        //             } else {
        //                 item.item_p_types[j].margin_applied = '0';
        //             }
        //             let qty = parseFloat(item.item_qty);
        //             let unitPrice = parseFloat(item.item_p_types[j].qit_unit_price);
        //             let marginTotal = (qty * unitPrice * (1 + parseFloat(item.item_p_types[j].margin_applied) / 100)).toFixed(2);
        //             item.item_p_types[j].margin_total = marginTotal;
        //             item.item_p_types[j].old_margin_total = marginTotal;
        //             item.item_p_types[j].marginAppliedTotal = marginTotal;
        //         }
        //     });
        // });
    }

    checkMarginPrice(price: any, totalprice: any, old_margin_total: any, j: any, i: any) {
        this.success_flag = true;
        if (this.isChecked) {
            if (this.userRoleMargins.length > 0) {
                this.userRoleMargins.forEach((element: any) => {
                    if (element.ml_role_id == this.user_role) {
                        const min_margin = element.ml_minimum_margin;
                        const max_margin = element.ml_maximum_margin;
                        const min_price = price + (price * min_margin) / 100;
                        const max_price = price + (price * max_margin) / 100;
                        if (min_margin != 9999) {
                            if (totalprice != old_margin_total) {
                                if (totalprice >= min_price) {
                                } else {
                                    this.success_flag = false;
                                    this.qt_item_spare[i].item_p_types[j].margin_total = '0.00';
                                    this.coloredToast('danger', "You don't have permission to reduce the price by that much");
                                }
                            }
                        }
                        if (max_margin != 9999) {
                            if (totalprice != old_margin_total) {
                                if (totalprice <= max_price) {
                                } else {
                                    this.success_flag = false;
                                    this.qt_item_spare[i].item_p_types[j].margin_total = '0.00';
                                    this.coloredToast('danger', "You don't have permission to increase the price by that much");
                                }
                            }
                        }
                    }
                });
            }
        } else {
            this.getMarginPrice(i, j);
        }
    }

    updateQuote() {
        this.success_flag = true;
        this.margin_flag = true;
        this.updateFlag = true;
        const qt_items: any[] = [];
        this.qt_item_spare.forEach((element: any) => {
            if (element.item_p_types.length === 0) {
                element.error_flag = true;
                this.success_flag = false;
                this.updateFlag = false;
                return;
            }

            // element.item_p_types.forEach((element2: any) => {
            //     if (
            //         element2.qit_brand == null ||
            //         element2.qit_brand === '' ||
            //         element2.qit_type === '0' ||
            //         element2.qit_unit_price === '' ||
            //         element2.qit_unit_price === '0' ||
            //         element.item_name === '' ||
            //         (element.item_qty) == '0' ||
            //         element.item_qty === '' ||
            //         element.item_qty == null
            //     ) {
            //         this.success_flag = false;
            //         element.error_flag = true;
            //         return;
            //     }
            // });

            element.item_p_types.forEach((element2: any) => {
                if (element2.qit_brand == null || element2.qit_brand === '') {
                    this.success_flag = false;
                    element.error_flag = true;
                    this.updateFlag = false;
                    return;
                } else if (element2.qit_type === '0') {
                    this.success_flag = false;
                    element.error_flag = true;
                    this.updateFlag = false;
                    return;
                } else if (
                    element2.qit_unit_price == '' ||
                    parseFloat(element2.qit_unit_price) == 0 ||
                    element2.qit_unit_price == null ||
                    element2.qit_unit_price == '0.00'
                ) {
                    this.success_flag = false;
                    element.error_flag = true;
                    this.updateFlag = false;
                    return;
                } else if (element.item_name === '') {
                    this.success_flag = false;
                    element.error_flag = true;
                    this.updateFlag = false;
                    return;
                } else if (element.item_qty == '0' || element.item_qty === '' || element.item_qty == null) {
                    this.success_flag = false;
                    element.error_flag = true;
                    this.updateFlag = false;
                    return;
                } else if (this.isChecked) {
                    if (element2.margin_total <= '0.00') {
                        // this.success_flag = false;
                        this.margin_flag = false;
                        this.coloredToast('danger', 'You have to set margin price');
                    }
                    if (this.userRoleMargins.length > 0) {
                        this.userRoleMargins.forEach((margin: any) => {
                            if (margin.ml_role_id == this.user_role) {
                                let total_price = element2.qit_unit_price * element.item_qty;
                                const min_margin = margin.ml_minimum_margin;
                                const max_margin = margin.ml_maximum_margin;
                                const min_price = total_price + (total_price * min_margin) / 100;
                                const max_price = total_price + (total_price * max_margin) / 100;
                                if (min_margin != 9999) {
                                    if (element2.margin_total >= min_price) {
                                    } else {
                                        this.margin_flag = false;
                                        // this.success_flag = false;
                                        element2.margin_total = '0.00';
                                        this.coloredToast('danger', "You don't have permission to reduce the price by that much");
                                    }
                                }
                                if (max_margin != 9999) {
                                    if (element2.margin_total <= max_price) {
                                    } else {
                                        this.margin_flag = false;
                                        // this.success_flag = false;
                                        element2.margin_total = '0.00';
                                        this.coloredToast('danger', "You don't have permission to increase the price by that much");
                                    }
                                }
                            }
                        });
                    }
                }
                // else {
                //     this.success_flag = true;
                //     element.error_flag = false;
                // }
            });

            if (this.success_flag) {
                qt_items.push(element);
                element.error_flag = false;
            }
        });

        if (!this.margin_flag) {
            this.coloredToast('danger', 'You have to set Margin Amount');
            this.updateFlag = false;
            return;
        }

        if (!this.success_flag) {
            this.coloredToast('danger', 'Please fill all the missing spare details');
            this.updateFlag = false;
            return;
        }

        this.qt_item_service.forEach((element2: any) => {
            if (
                (element2.item_name === '' ||
                    element2.unit_price === '' ||
                    element2.unit_price === 0 ||
                    element2.unit_price == '0' ||
                    element2.unit_price == '0.00' ||
                    element2.unit_price == null ||
                    element2.item_priority == '' ||
                    element2.item_priority == null ||
                    element2.item_condition == '' ||
                    element2.item_condition == null) &&
                element2.item_delete_flag != '1'
            ) {
                this.success_flag = false;
                element2.error_flag = true;
                this.updateFlag = false;
                return;
            }

            element2.error_flag = false;
            qt_items.push(element2);
        });

        if (!this.success_flag) {
            this.coloredToast('danger', 'Please fill all the missing labour details');
            this.updateFlag = false;
            return;
        }

        this.qt_generic_item.forEach((element3: any) => {
            if (
                element3.item_code === '' ||
                element3.item_qty === '' ||
                parseInt(element3.item_qty) < 0 ||
                element3.item_qty === '' ||
                element3.unit_price === '' ||
                element3.unit_price === 0 ||
                element3.unit_price === '0.00' ||
                element3.item_priority === '' ||
                element3.item_priority === null
            ) {
                this.success_flag = false;
                element3.error_flag = true;
                this.updateFlag = false;
                return;
            }

            element3.error_flag = false;
            qt_items.push(element3);
        });

        if (!this.success_flag) {
            this.coloredToast('danger', 'Please fill all the missing generic item details');
            this.updateFlag = false;
            return;
        }

        if ((this.userForm.get('chassis') || {}).value === '') {
            this.coloredToast('danger', 'Chassis number is mandatory');
            this.updateFlag = false;
            return;
        }

        if (qt_items.length === 0) {
            this.coloredToast('danger', 'At least one labour or part required');
            this.updateFlag = false;
            return;
        }
        // if (this.userForm.get()) {
        //     this.coloredToast('danger', 'At least one labour or part required');
        //     return;
        // }

        const senddata = {
            qt_id: this.quoteId,
            cust_name: this.userForm.value.customer,
            chasis_no: this.userForm.value.chassis,
            jc_no: this.userForm.value.jobcard,
            reg_no: this.userForm.value.regno,
            contact: this.userForm.value.mobile,
            make: this.userForm.value.model,
            odometer: this.userForm.value.odometer,
            quot_total: 0,
            tax_amount: 0,
            grand_total: 0,
            part_code_print: this.userForm.value.part_code_print,
            avail_print: this.userForm.value.avail_print,
            part_type_print: this.userForm.value.part_type_print,
            items: qt_items,
            qt_service_adv: this.userForm.value.sa_id,
            qt_code: this.userForm.controls['qt_code'].value,
            marginFlag: this.isChecked,
        };

        if (this.success_flag && this.margin_flag) {
            this.userServices.updateNormalQuotes(senddata).subscribe((rdata: any) => {
                if (rdata.ret_data === 'success') {
                    this.getQuoteDetails();
                    this.coloredToast('success', 'Updates saved successfully');
                } else {
                    this.updateFlag = false;
                    this.coloredToast('danger', 'Some error occurred, please try again later');
                }
            });
        }
    }

    parseNumber(value: string): string {
        // Remove commas and parse as float
        const parsedValue = parseFloat(value.replace(',', ''));
        return parsedValue.toFixed(2);
    }

    getNonDeletedItemsCount(itemData: any): number {
        return itemData.item_p_types.filter((p: any) => p.qit_delete_flag != 1).length;
    }

    disableScroll(event: WheelEvent): void {
        event.preventDefault();
    }

    clearNegativeValues(i: number, j: number) {
        if (this.qt_item_spare[i].item_p_types[j].qit_unit_price < 0) {
            this.qt_item_spare[i].item_p_types[j].qit_unit_price = '0.00';
        }
    }

    clearNegativeValuesGeneric(j: number) {
        if (this.qt_generic_item[j].unit_price < 0) {
            this.qt_generic_item[j].unit_price = '0.00';
        }
    }

    clearNegativeValuesLabour(j: number) {
        if (this.qt_item_service[j].unit_price < 0) {
            this.qt_item_service[j].unit_price = '0.00';
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
