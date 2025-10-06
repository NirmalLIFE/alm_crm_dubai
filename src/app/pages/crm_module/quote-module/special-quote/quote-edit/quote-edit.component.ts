import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';
import { ToWords } from 'to-words';

@Component({
    selector: 'app-quote-edit',
    templateUrl: './quote-edit.component.html',
    styleUrls: ['./quote-edit.component.css']
})
export class QuoteEditComponent {
    quoteId: string;
    public userForm: FormGroup;
    qt_data: any = [];
    qt_items: any = [];
    qt_itemsSend: any = [];
    qt_item_spare: any = [];
    qt_item_service: any = [];
    tot_amount = 0.0;
    tax_amount = 0.0;
    tot_sp_amount = 0.0;
    tot_sp_tax = 0.0;
    tot_words = "";
    tot_sp_words = "";
    user_role: any = atob(atob(localStorage.getItem('us_role_id') || "{}"));

    public toWords = new ToWords();
    public data_load_flag: boolean = true;
    public labourSearch = 'item_name';
    public spareSearch = 'item_name';
    public spareCodeSearch = 'item_name';
    public genericSearch = 'item_name';
    preServiceList = [];
    preSpareList = [];
    preSpareCodeList = [];
    preGenericList = [];

    constructor(private fb: FormBuilder, private userServices: StaffPostAuthService, public router: Router, private activerouter: ActivatedRoute) {
        this.quoteId = atob(this.activerouter.snapshot.paramMap.get('id') || "{}");
        this.userForm = this.fb.group({
            customer: ['', [Validators.required, Validators.maxLength(50), Validators.pattern('[a-zA-Z][a-zA-Z ]+[a-zA-Z]$')]],
            chassis: ['', [Validators.required, Validators.maxLength(17)]],
            jobcard: ['', [Validators.maxLength(10)]],
            regno: ['', [Validators.maxLength(10)]],
            odometer: ['', [Validators.pattern('[0-9]+'), Validators.maxLength(10)]],
            mobile: ['', [Validators.pattern('[0-9]+'), Validators.maxLength(11)]],
            model: ['', [Validators.maxLength(100)]],
            qt_seq: [''],
            sa: [''],
            pa: ['']
        });
    }

    ngOnInit() {
        this.userServices.commonQuoteDetails().subscribe((rdata: any) => {
            if (rdata.ret_data == "success") {
                this.preSpareList = rdata.spare_items.map(function (i: any) { return i.item_name; });
                this.preServiceList = rdata.service_items.map(function (i: any) { return i.item_name; });
                this.preGenericList = rdata.generic_items.map(function (i: any) { return i.item_name; });
                this.preSpareCodeList = rdata.spare_code.map(function (i: any) { return i.item_name; });
            }
        });
        this.loadQuotationDetails();
    }
    loadQuotationDetails() {
        this.qt_data = [];
        this.qt_items = [];
        this.qt_itemsSend = [];
        this.qt_item_spare = [];
        this.qt_item_service = [];
        this.userServices.getSpecialQuote(this.quoteId).subscribe((rdata: any) => {
            if (rdata.ret_data == "success") {
                this.qt_data = rdata.quotation;
                this.qt_items = rdata.qt_items;
                this.userForm.patchValue({
                    customer: this.qt_data.qt_cus_name,
                    chassis: this.qt_data.qt_chasis,
                    jobcard: this.qt_data.qt_jc_no,
                    regno: this.qt_data.qt_reg_no,
                    odometer: this.qt_data.qt_odometer,
                    mobile: this.qt_data.qt_cus_contact,
                    model: this.qt_data.qt_make,
                    qt_seq: this.qt_data.qt_code,
                    sa: this.qt_data.sa_name,
                    pa: this.qt_data.pa_name
                });
                this.qt_items.forEach((element: any) => {
                    if (element.item_type == "1") {
                        element.dis_percent = Math.round(((element.unit_price - (element.unit_price - element.disc_amount)) / element.unit_price) * 100);
                        element.net_price = (element.unit_price - element.disc_amount).toFixed(2)
                        this.qt_item_spare.push(element);
                    } else if (element.item_type == "2") {
                        element.dis_percent = Math.round(((element.unit_price - (element.unit_price - element.disc_amount)) / element.unit_price) * 100);
                        element.net_price = (element.unit_price - element.disc_amount).toFixed(2)
                        this.qt_item_service.push(element);
                    }
                });
                this.total_calc();
                this.data_load_flag = false;
            } else {
                this.data_load_flag = false;
                this.coloredToast("danger", "Some error occured, please try again later");
            }
        });
    }


    total_calc() {
        this.tot_amount = 0.00;
        this.tax_amount = 0.00;
        this.tot_sp_amount = 0.00;
        this.tot_sp_tax = 0.00;
        this.qt_item_spare.forEach((element: any) => {
            this.tot_amount = this.tot_amount + ((parseFloat(element.unit_price) - parseFloat(element.disc_amount)) * parseFloat(element.item_qty));
            this.tot_sp_amount = this.tot_sp_amount + ((parseFloat(element.unit_price) - parseFloat(element.disc_amount)) * parseFloat(element.item_qty));
        });
        this.qt_item_service.forEach((element: any) => {
            this.tot_amount = this.tot_amount + ((parseFloat(element.unit_price) - parseFloat(element.disc_amount)) * parseFloat(element.item_qty));
        });
        this.tax_amount = this.tot_amount * 0.05;
        this.tot_sp_tax = this.tot_sp_amount * 0.05;
        this.tot_sp_words = this.toWords.convert(parseFloat((this.tot_sp_amount + this.tot_sp_tax).toFixed(2)), { ignoreDecimal: false });
        this.tot_words = this.toWords.convert(parseFloat((this.tot_amount + this.tax_amount).toFixed(2)), { ignoreDecimal: false });
    }

    onQtyChange(itemdata: any) {
        if (itemdata.item_qty != 0 && itemdata.item_qty != null) {
            this.total_calc();
        }
    }

    tot_unit(itemdata: any) {
        itemdata.net_price = (itemdata.unit_price - itemdata.disc_amount).toFixed(2);
        this.total_calc();
    }

    total_disc(itemdata: any) {
        itemdata.dis_percent = (((itemdata.unit_price - (itemdata.unit_price - itemdata.disc_amount)) / itemdata.unit_price) * 100).toFixed(2);
        itemdata.net_price = (itemdata.unit_price - itemdata.disc_amount).toFixed(2);
        this.total_calc();
    }
    total_disc_per(itemdata: any) {
        itemdata.disc_amount = Math.round(itemdata.unit_price * (itemdata.dis_percent / 100));
        itemdata.net_price = (itemdata.unit_price - itemdata.disc_amount).toFixed(2);
        this.total_calc();
    }
    total_net(itemdata: any) {
        itemdata.disc_amount = (itemdata.unit_price - itemdata.net_price).toFixed(2);
        itemdata.dis_percent = (((itemdata.unit_price - (itemdata.unit_price - itemdata.disc_amount)) / itemdata.unit_price) * 100).toFixed(2);
        this.total_calc();
    }

    onKeyLabour($event: any) {
        this.addItemLabour();
    }
    onKeySpare($event: any) {
        this.addItemSpare();
    }

    addItemLabour() {
        if (this.user_role == "1" || this.user_role == "11" || this.user_role == "2" || this.user_role == "9" ) {
            this.qt_item_service.push({
                item_id: 0,
                item_type: "2",
                item_name: "Labour Charge",
                item_qty: 1,
                unit_price: 0,
                disc_amount: 0,
                item_special_avail: "",
                net_price: 0,
                dis_percent: 0,
                qt_id: 0,
                item_delete_flag: 0
            });
            this.total_calc();
        } else {
            this.coloredToast("warning", "Permission Denied");
        }
    }
    addItemSpare() {
        this.qt_item_spare.push({
            item_id: 0,
            item_type: "1",
            item_name: "",
            item_qty: 1,
            unit_price: 0,
            disc_amount: 0,
            item_special_avail: "",
            net_price: 0,
            dis_percent: 0,
            qt_id: 0,
            item_delete_flag: 0
        });
        this.total_calc();
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
                var foundIndex = this.qt_items.findIndex((x: any) => x.item_id == element.item_id);
                this.qt_items[foundIndex].item_delete_flag = "1";
                this.total_calc();
            }
        });

    }

    updateQuote() {
        let success_flag = true;
        this.qt_itemsSend = [];
        this.qt_item_spare.forEach((element: any) => {
            if (element.item_name == "" || element.unit_price == "" || element.unit_price == 0) {
                success_flag = false;
            } else { this.qt_itemsSend.push(element); }
        });
        this.qt_item_service.forEach((element2: any) => {
            if (element2.item_name == "" || element2.unit_price == "" || element2.unit_price == 0) {
                success_flag = false;
            } else {
                this.qt_itemsSend.push(element2);
            }
        });
        this.qt_items.forEach((element3: any) => {
            if (element3.item_delete_flag == "1") {
                this.qt_itemsSend.push(element3);
            }
        });
        if (this.userForm.value.chassis == "") {
            this.coloredToast("danger", "Chassis number is mandatory");
        } else if (this.qt_itemsSend.length == 0) {
            this.coloredToast("danger", "Atleast one item required");
        } else {
            if (success_flag) {
                let senddata = {
                    "cust_name": this.userForm.value.customer,
                    "chasis_no": this.userForm.value.chassis,
                    "jc_no": this.userForm.value.jobcard,
                    "reg_no": this.userForm.value.regno,
                    "contact": this.userForm.value.mobile,
                    "make": this.userForm.value.model,
                    "odometer": this.userForm.value.odometer,
                    "quot_total": this.tot_amount,
                    "tax_percent": "5",
                    "tax_amount": this.tax_amount,
                    "grand_total": this.tot_amount + this.tax_amount,
                    "qt_id": this.qt_data.qt_id,
                    "items": this.qt_itemsSend
                }
                let _that = this;
               // console.log("value of calucated data>>>>>>>>>>>",senddata)
                this.userServices.updateSplQuote(senddata).subscribe((rdata: any) => {
                    if (rdata.ret_data == "success") {
                        this.coloredToast("success", "Updates saved successfully");
                        this.loadQuotationDetails();
                    }
                });
            } else {
                this.coloredToast("danger", "Please delete blank rows");
            }
        }
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
                var foundIndex = this.qt_items.findIndex((x: any) => x.item_id == element.item_id);
                this.qt_items[foundIndex].item_delete_flag = "1";
                this.total_calc();
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