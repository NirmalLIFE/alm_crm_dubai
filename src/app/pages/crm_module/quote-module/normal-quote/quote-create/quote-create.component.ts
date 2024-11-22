import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-quote-create',
    templateUrl: './quote-create.component.html',
    styleUrls: ['./quote-create.component.css'],
})
export class QuoteCreateComponent implements OnInit {
    public brandList = [];
    public userForm: FormGroup;
    public qt_data = [];
    public qt_items = [];
    public qt_item_spare: any = [];
    public qt_item_service: any = [];
    public qt_generic_item: any = [];

    public data_load_flag: boolean = true;

    public preServiceList = [];
    public preSpareList = [];
    public preSpareCodeList = [];
    public preGenericList = [];
    public labourConditionList: any = [];
    public labourpriorityList: any = [];

    public spareSearch = 'item_name';
    public spareCodeSearch = 'item_name';
    public labourSearch = 'item_name';
    public genericSearch = 'item_name';

    public user_role: any = atob(atob(localStorage.getItem('us_role_id') || '{}'));

    @ViewChild('sparePreview') sparePreview: any;
    @ViewChildren('inputField') inputFields: any;
    @ViewChildren('inputFieldGeneric') inputFieldGeneric: any;
    @ViewChildren('inputFieldLabour') inputFieldLabour!: any;

    constructor(private fb: FormBuilder, private userServices: StaffPostAuthService, public router: Router) {
        this.userForm = this.fb.group({
            qt_code: [''],
            customer: ['', [Validators.maxLength(80), Validators.pattern('[a-zA-Z][a-zA-Z ]+[a-zA-Z]$')]],
            chassis: ['', [Validators.required, Validators.maxLength(17), Validators.pattern('[A-HJ-NPR-Z0-9]{17}')]],
            jobcard: ['', [Validators.maxLength(10), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]],
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
            vehicle_value: [''],
        });
    }
    ngOnInit() {
        this.registerHotkey();
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
                this.data_load_flag = false;
            } else {
                this.data_load_flag = false;
            }
        });

        this.qt_item_spare.push({
            item_type: '1',
            item_code: '',
            item_name: '',
            item_note: '',
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

        // this.qt_generic_item.push({
        //     item_type: '3',
        //     item_code: '',
        //     item_name: '',
        //     item_qty: 1,
        //     item_id: 0,
        //     item_delete_flag: 0,
        //     item_seq: this.qt_generic_item.length,
        //     unit_price: 0,
        //     item_p_types: [],
        // });
        // this.qt_item_service.push({
        //     item_type: '2',
        //     item_code: '',
        //     item_name: '',
        //     item_qty: 1,
        //     item_id: 0,
        //     item_delete_flag: 0,
        //     item_seq: this.qt_item_service.length,
        //     unit_price: 0,
        //     item_p_types: [],
        // });
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
    openPreview() {
        this.sparePreview.open();
    }
    addItemTypeSpare(row_data: any) {
        let index = row_data.item_p_types.length - 1;
        if (index >= 0) {
            if (row_data.item_p_types[index].part_brand == 0 || row_data.item_p_types[index].part_type == '0' || row_data.item_p_types[index].unit_price == 0) {
                this.coloredToast('danger', 'Please fill all item details');
            } else {
                row_data.item_p_types.push({
                    qit_id: 0,
                    qit_item_id: row_data.item_p_types[index].item_id,
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
                qit_item_id: row_data.item_p_types[index].item_id,
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
                master.splice(i, 1);
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
                this.qt_item_spare.splice(i, 1);
            }
        });
    }
    addItemSpare() {
        this.qt_item_spare.push({
            item_type: '1',
            item_code: '',
            item_name: '',
            item_note: '',
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
        // this.focusOnLastInput(1);
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
                this.qt_generic_item.splice(j, 1);
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
            priority: null,
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
                this.qt_item_service.splice(j, 1);
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
            condition: null,
            priority: null,
        });
        this.focusOnLastInput(3);
    }

    updateQuote() {
        let success_flag = true;
        const qt_items: any[] = [];

        this.qt_item_spare.forEach((element: any) => {
            element.item_p_types.forEach((element2: any) => {
                if (
                    element2.qit_brand == null ||
                    element2.qit_brand === '' ||
                    element2.qit_type === '0' ||
                    element2.qit_unit_price === '' ||
                    element2.qit_unit_price === '0' ||
                    parseFloat(element2.qit_unit_price) == 0 ||
                    element.item_name === '' ||
                    element.item_name === null ||
                    parseInt(element.item_qty) == 0 ||
                    element.item_qty === '' ||
                    element.item_qty === null ||
                    element.item_qty == '0'
                ) {
                    success_flag = false;
                    element.error_flag = true;
                    return;
                }
            });
            if (success_flag) {
                qt_items.push(element);
                element.error_flag = false;
            }
        });

        if (!success_flag) {
            this.coloredToast('danger', 'Please fill all the missing spare details');
            return;
        }

        this.qt_item_service.forEach((element2: any) => {
            if (
                element2.item_name === '' ||
                element2.unit_price === '' ||
                element2.unit_price === 0 ||
                parseInt(element2.unit_price) === 0 ||
                element2.condition == '' ||
                element2.condition == null ||
                element2.priority == '' ||
                element2.priority == null
            ) {
                success_flag = false;
                element2.error_flag = true;
                return;
            }

            element2.error_flag = false;
            qt_items.push(element2);
        });

        if (!success_flag) {
            this.coloredToast('danger', 'Please fill all the missing labour details');
            return;
        }

        this.qt_generic_item.forEach((element3: any) => {
            if (
                element3.item_code === '' ||
                element3.item_qty === '' ||
                parseInt(element3.item_qty) <= 0 ||
                element3.item_qty === '' ||
                element3.unit_price === '' ||
                element3.unit_price === 0 ||
                element3.priority === '' ||
                element3.priority === null
            ) {
                success_flag = false;
                element3.error_flag = true;
                return;
            }

            element3.error_flag = false;
            qt_items.push(element3);
        });

        if (!success_flag) {
            this.coloredToast('danger', 'Please fill all the missing generic item details');
            return;
        }

        if ((this.userForm.get('chassis') || {}).value === '') {
            this.coloredToast('danger', 'Chassis number is mandatory');
            return;
        }

        if (qt_items.length === 0) {
            this.coloredToast('danger', 'At least one labour or part required');
            return;
        }

        const senddata = {
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
        };

        this.userServices.createNormalQuotation(senddata).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.coloredToast('success', 'Updates saved successfully');
                this.router.navigate(['/quotation/normal_quote/quote_list']);
            } else {
                this.coloredToast('danger', "Can't create quote. Contact administrator");
            }
        });

        // this.userServices.updateNormalQuotes(senddata).subscribe((rdata: any) => {
        //   if (rdata.ret_data === "success") {
        //     this.getQuoteDetails();
        //     this.coloredToast("success", "Updates saved successfully");
        //   } else {
        //     this.coloredToast(
        //       "danger",
        //       "Some error occurred, please try again later"
        //     );
        //   }
        // });
    }

    getNonDeletedItemsCount(itemData: any): number {
        return itemData.item_p_types.filter((p: any) => p.qit_delete_flag != 1).length;
    }

    disableScroll(event: WheelEvent): void {
        event.preventDefault();
    }
}
