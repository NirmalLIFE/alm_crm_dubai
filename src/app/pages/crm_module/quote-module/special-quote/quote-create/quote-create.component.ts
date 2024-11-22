import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';
import { ToWords } from 'to-words';

@Component({
    selector: 'app-quote-create',
    templateUrl: './quote-create.component.html',
    styleUrls: ['./quote-create.component.css']
})
export class QuoteCreateComponent {
    public userForm: FormGroup;
    qt_items: any = [];
    qt_item_spare: any = [];
    qt_item_service: any = [];
    tot_amount = 0.0;
    tot_sp_amount = 0.0;
    tot_sp_tax = 0.0;
    tax_amount = 0.0;
    tot_words = "";
    tot_sp_words = "";
    user_role: any = atob(atob(localStorage.getItem('us_role_id') || "{}"));
    public toWords = new ToWords();
    public data_load_flag: boolean = true;

    constructor(private fb: FormBuilder, private userServices: StaffPostAuthService, public router: Router,) {
        this.userForm = this.fb.group({
            customer: ['', [Validators.required, Validators.maxLength(50), Validators.pattern('[a-zA-Z][a-zA-Z ]+[a-zA-Z]$')]],
            chassis: ['', [Validators.required, Validators.maxLength(17)]],
            jobcard: ['', [Validators.maxLength(10)]],
            regno: ['', [Validators.maxLength(10)]],
            odometer: ['', [Validators.pattern('[0-9]+'), Validators.maxLength(10)]],
            mobile: ['', [Validators.pattern('[0-9]+'), Validators.maxLength(11)]],
            model: ['', [Validators.maxLength(100)]],
        });
        this.qt_item_spare.push({
            type: "1",
            item_name: "",
            quantity: 1,
            unit_price: 0,
            discount_amt: 0,
            availability: "Stock",
            net_price: 0,
            dis_percent: 0
        });
        if (localStorage.getItem('us_role') == "1" || localStorage.getItem('us_role') == "2") {
            this.qt_item_service.push({
                type: "2",
                item_name: "Labour Charge",
                quantity: 1,
                unit_price: 0,
                discount_amt: 0,
                availability: "",
                net_price: 0,
                dis_percent: 0
            });
        }
        this.total_calc();
        this.data_load_flag = false;
    }

    ngOnInit() {

    }
    createQuote() {
        let success_flag = true;
        this.qt_items = [];
        this.qt_item_spare.forEach((element: any) => {
            if (element.item_name == "" || element.unit_price == "" || element.unit_price == 0) {
                success_flag = false;
            } else { this.qt_items.push(element); }
        });
        this.qt_item_service.forEach((element2: any) => {
            if (element2.item_name == "" || element2.unit_price == "" || element2.unit_price == 0) {
                success_flag = false;
            } else { this.qt_items.push(element2); }
        });
        if (this.userForm.value.chassis == "") {
            this.coloredToast("danger", "Chassis number is mandatory");
        } else if (this.qt_items.length == 0) {
            this.coloredToast("danger", "Atleast one item required");
        } else {
            if (success_flag) {
                let senddata = {
                    "cust_name": this.userForm.value.customer,
                    "chasis_no": this.userForm.value.chassis,
                    "jc_no": this.userForm.value.jobcard,
                    "reg_no": this.userForm.value.regno,
                    "contact": this.userForm.value.mobile,
                    "model": this.userForm.value.model,
                    "odometer": this.userForm.value.odometer,
                    'quot_total': this.tot_amount,
                    'tax_amount': this.tax_amount,
                    'grand_total': this.tot_amount + this.tax_amount,
                    'cus_created_by': localStorage.getItem('us_id'),
                    'items': this.qt_items,
                }
                let _that = this;
                this.userServices.createSplQuotation(senddata).subscribe((rdata: any) => {
                    if (rdata.ret_data == "success") {
                        this.coloredToast("success", "Quotation saved successfully");
                        this.router.navigate(["/quotation/special_quote/quote_list"]);
                    }
                });
            } else {
                this.coloredToast("danger", "Please delete all blank rows");
            }

        }

    }
    addItemLabour() {
        if (this.user_role == 1 || this.user_role == 11 || this.user_role == 2 || this.user_role == 9 ) {
            this.qt_item_service.push({
                type: "2",
                item_name: "Labour Charge",
                quantity: 1,
                unit_price: 0,
                discount_amt: 0,
                availability: "",
                net_price: 0,
                dis_percent: 0
            });
            this.total_calc();
        } else {
            this.coloredToast("warning", "Only Service Advisor and Admin can add Labour");
        }
    }
    addItemSpare() {
        console.log("hi");
        this.qt_item_spare.push({
            type: "1",
            item_name: "",
            quantity: 1,
            unit_price: 0,
            discount_amt: 0,
            availability: "Stock",
            net_price: 0,
            dis_percent: 0
        });
        this.total_calc();
    }
    deleteLabour(j: number) {
        this.qt_item_service.splice(j, 1);
        this.total_calc();
    }


    deleteSpare(i: number) {
        this.qt_item_spare.splice(i, 1);
        this.total_calc();
    }

    total_calc() {
        this.tot_amount = 0.00;
        this.tax_amount = 0.00;
        this.tot_sp_amount = 0.00;
        this.tot_sp_tax = 0.00;
        this.qt_item_spare.forEach((element: any) => {
            this.tot_amount = this.tot_amount + ((parseFloat(element.unit_price) - parseFloat(element.discount_amt)) * parseFloat(element.quantity));
            this.tot_sp_amount = this.tot_sp_amount + ((parseFloat(element.unit_price) - parseFloat(element.discount_amt)) * parseFloat(element.quantity))
        });
        this.qt_item_service.forEach((element: any) => {
            this.tot_amount = this.tot_amount + ((parseFloat(element.unit_price) - parseFloat(element.discount_amt)) * parseFloat(element.quantity));
        });
        this.tot_sp_tax = this.tot_sp_amount * 0.05;
        this.tax_amount = this.tot_amount * 0.05;
        this.tot_sp_words = this.toWords.convert(parseFloat((this.tot_sp_amount + this.tot_sp_tax).toFixed(2)), { ignoreDecimal: false });
        this.tot_words = this.toWords.convert(parseFloat((this.tot_amount + this.tax_amount).toFixed(2)), { ignoreDecimal: false });
    }

    total_disc(itemdata: any) {
        itemdata.dis_percent = (((itemdata.unit_price - (itemdata.unit_price - itemdata.discount_amt)) / itemdata.unit_price) * 100).toFixed(2);
        itemdata.net_price = (itemdata.unit_price - itemdata.discount_amt).toFixed(2);
        this.total_calc();
    }
    total_disc_per(itemdata: any) {
        itemdata.discount_amt = (itemdata.unit_price * (itemdata.dis_percent / 100)).toFixed(2);
        itemdata.net_price = (itemdata.unit_price - itemdata.discount_amt).toFixed(2);
        this.total_calc();
    }

    total_net(itemdata: any) {
        itemdata.discount_amt = (itemdata.unit_price - itemdata.net_price).toFixed(2);
        itemdata.dis_percent = (((itemdata.unit_price - (itemdata.unit_price - itemdata.discount_amt)) / itemdata.unit_price) * 100).toFixed(2);
        this.total_calc();
    }
    tot_unit(itemdata: any) {
        itemdata.net_price = (itemdata.unit_price - itemdata.discount_amt).toFixed(2);
        this.total_calc();
    }
    onKeyLabour($event:any) {
        this.addItemLabour();
    }
    onKeySpare($event:any) {
        this.addItemSpare();
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
