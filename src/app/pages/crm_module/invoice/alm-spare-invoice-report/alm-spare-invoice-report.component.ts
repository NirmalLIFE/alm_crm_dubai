import { trigger, transition, style, animate } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { colDef } from '@bhplugin/ng-datatable';
import { Store } from '@ngrx/store';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-alm-spare-invoice-report',
    templateUrl: './alm-spare-invoice-report.component.html',
    styleUrls: ['./alm-spare-invoice-report.component.css'],
    animations: [
        trigger('toggleAnimation', [
            transition(':enter', [style({ opacity: 0, transform: 'scale(0.95)' }), animate('100ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))]),
            transition(':leave', [animate('75ms', style({ opacity: 0, transform: 'scale(0.95)' }))]),
        ]),
    ],
})
export class AlmSpareInvoiceReportComponent implements OnInit {
    inv_list: any = [];
    inv_list_without_jobcard: any[] = [];
    inv_list_with_jobcard: any[] = [];
    open_jobcard: any[] = [];
    wip_jobcard: any[] = [];
    can_jobcard: any[] = [];
    comp_jobcard: any[] = [];
    inv_jobcard: any[] = [];
    closed_jobcard: any[] = [];
    suspended_jobcard: any[] = [];
    tst_jobcard: any[] = [];
    total_inv_cost: any;
    total_inv_cost_without_jobcard: any;
    open_jobcardGrandTotal: any;
    wip_jobcardGrandTotal: any;
    can_jobcardGrandTotal: any;
    comp_jobcardGrandTotal: any;
    inv_jobcardGrandTotal: any;
    clos_jobcardGrandTotal: any;
    sus_jobcardGrandTotal: any;
    tst_jobcardGrandTotal: any;
    public load_flag: boolean = true;

    total_inv_cost_without_margin: any;
    total_inv_cost_without_jobcard_margin: any;
    totalGP: any;
    totalGP_without_Job_Card: any;
    totalGP_with_Job_Card: any;
    wip_jobcardsubTotal: any;
    open_jobcardsubTotal: any;
    can_jobcardsubTotal: any;
    comp_jobcardsubTotal: any;
    inv_jobcardsubTotal: any;
    clos_jobcardsubTotal: any;
    sus_jobcardsubTotal: any;
    tst_jobcardsubTotal: any;
    totalGP_amount_with_Job_Card: any;
    totalGP_amount: any;
    totalGP_amount_without_Job_Card: any;

    isChecked = false;

    // Tables
    bill_date_start: any = this.datepipe.transform(moment(new Date()).startOf('month').toDate(), 'yyyy-MM-dd') || '';
    bill_date_end: any = this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '';
    selectedSupplier: any = '0';
    purchaseType: any = '0';
    type: any = '0';
    selectedSA: any = '0';
    jbcardStatus: any = '0';

    userlist: any[] = [];
    startFormattedDate: any;
    endFormattedDate: any;

    public search: string = '';
    public spareInvoices: any[] = [];
    public permittedAction: [] = [];
    public invlogs: any[] = [];
    public suppliersList: any[] = [];

    public cols = [
        { field: 'inv_nm_inv_date', title: 'Date', hide: false },
        { field: 'supplier_Name', title: 'Supplier Name', hide: false },
        { field: 'inv_nm_id', title: 'Inv Number', hide: false },
        { field: 'nm_type', title: 'Type', hide: false },
        { field: 'inv_nm_description', title: 'Description', hide: false },
        { field: 'us_firstname', title: 'Service Advisor', hide: false },
        { field: 'inv_jobcard_no', title: 'Jobcard', hide: true },
        { field: 'job_status', title: 'Job Card Status', hide: false },
        { field: 'sold_inv_date', title: 'Post Invoice Date', hide: false },
        { field: 'finalsubtotal_credit', title: 'Credit Purchase', hide: false },
        { field: 'finalsubtotal_cash', title: 'Cash Purchase', hide: false },
        { field: 'totalPrice', title: 'Sold Amount', hide: false },
        { field: 'variation_margin', title: 'Variation Margin(%)', hide: false },
        { field: 'action', title: 'Actions', hide: false },
    ];

    @ViewChild('activityLogModal') activityLogModal: any;

    constructor(public storeData: Store<any>, private userServices: StaffPostAuthService, public router: Router, public datepipe: DatePipe) {
        JSON.parse(atob(atob(localStorage.getItem('access_data') || '{}'))).forEach((element: any) => {
            if (element['ft_id'] == 38) {
                this.permittedAction = element['actions'];
            }
        });

        this.userServices.userList().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.userlist = rdata.userList.filter((item: any) => item.us_laabs_id !== null);
            }
        });

        this.userServices.getSupplierDetails().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.suppliersList = rData.Suppliers;
            }
        });
    }

    ngOnInit() {
        this.getTotalInvoices();
    }

    // formatDate(date: string): string {
    //     const formattedDate = this.datepipe.transform(date, 'dd-MMM-yy');
    //     return formattedDate ? formattedDate.toUpperCase() : '';
    // }

    getTotalInvoices() {
        // if (this.bill_date_start && this.bill_date_end) {
        //     console.log('start date and end date', this.bill_date_start, this.bill_date_end);
        //     // const parsedDate = new Date(this.bill_date_start);
        //     // const enddate = new Date(this.bill_date_end);
        //     // this.startFormattedDate = this.datepipe.transform(parsedDate, 'dd-MMM-yy');
        //     // this.endFormattedDate = this.datepipe.transform(enddate, 'dd-MMM-yy');
        //     this.startFormattedDate = this.formatDate(this.bill_date_start);
        //     this.endFormattedDate = this.formatDate(this.bill_date_end);
        // }

        this.inv_list = [];
        this.inv_list_without_jobcard = [];
        this.inv_list_with_jobcard = [];
        this.open_jobcard = [];
        this.wip_jobcard = [];
        this.can_jobcard = [];
        this.comp_jobcard = [];
        this.inv_jobcard = [];
        this.closed_jobcard = [];
        this.suspended_jobcard = [];
        this.tst_jobcard = [];
        this.total_inv_cost = 0.0;
        this.total_inv_cost_without_margin = 0.0;
        this.total_inv_cost_without_jobcard = 0.0;
        this.total_inv_cost_without_jobcard_margin = 0.0;
        this.totalGP_with_Job_Card = {
            totalGP_with_Job_Card: 0.0,
            gp_open_jobcard: 0.0,
            gp_wip_jobcard: 0.0,
            gp_can_jobcard: 0.0,
            gp_comp_jobcard: 0.0,
            gp_inv_jobcard: 0.0,
            gp_clos_jobcard: 0.0,
            gp_sus_jobcard: 0.0,
            gp_tst_jobcard: 0.0,
        };
        this.totalGP_amount_with_Job_Card = {
            totalGP_amount_with_Job_Card: 0.0,
            gp_amount_open_jobcard: 0.0,
            gp_amount_wip_jobcard: 0.0,
            gp_amount_can_jobcard: 0.0,
            gp_amount_comp_jobcard: 0.0,
            gp_amount_inv_jobcard: 0.0,
            gp_amount_clos_jobcard: 0.0,
            gp_amount_sus_jobcard: 0.0,
            gp_amount_tst_jobcard: 0.0,
        };
        this.totalGP = 0.0;
        this.totalGP_amount = 0.0;
        this.totalGP_without_Job_Card = 0.0;
        this.totalGP_amount_without_Job_Card = 0.0;
        this.open_jobcardGrandTotal = 0.0;
        this.wip_jobcardGrandTotal = 0.0;
        this.can_jobcardGrandTotal = 0.0;
        this.comp_jobcardGrandTotal = 0.0;
        this.inv_jobcardGrandTotal = 0.0;
        this.clos_jobcardGrandTotal = 0.0;
        this.sus_jobcardGrandTotal = 0.0;
        this.tst_jobcardGrandTotal = 0.0;

        let data = {
            start_date: this.bill_date_start,
            end_date: this.bill_date_end,
            supplier_id: this.selectedSupplier,
            purchaseType: this.purchaseType,
            inv_type: this.type,
            selectedSA: this.selectedSA,
            jbstatus: this.jbcardStatus,
            checked: this.isChecked,
        };

        this.userServices.getTotalInvoices(data).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.inv_list = rData.invoices;
                if (this.inv_list && this.inv_list.length > 0) {
                    this.inv_list.forEach((element: any) => {
                        element.totalPrice = (parseFloat(element.inv_alm_margin_total) - parseFloat(element.inv_alm_discount)).toFixed(2);
                        element.finalsubtotal = (parseFloat(element.inv_nm_sub_total) + parseFloat(element.inv_nm_vat_total)).toFixed(2);
                        element.variation_margin = ((parseFloat(element.totalPrice) * 100) / parseFloat(element.finalsubtotal) - 100).toFixed(2);
                        if (element.inv_nm_status == '1') {
                            element.inv_status = 'Created';
                        } else if (element.inv_nm_status == '2') {
                            element.inv_status = 'Need Admin Approval';
                        } else if (element.inv_nm_status == '3') {
                            element.inv_status = 'Finalised';
                        } else if (element.inv_nm_status == '4') {
                            element.inv_status = 'Admin Rejected';
                        } else if (element.inv_nm_status == '5') {
                            element.inv_status = 'Admin Approved';
                        }
                        if (element.inv_nm_type == '1') {
                            element.nm_type = 'Consumables';
                        } else if (element.inv_nm_type == '2') {
                            element.nm_type = 'General';
                        } else if (element.inv_nm_type == '3') {
                            element.nm_type = 'Normal';
                        }

                        this.suppliersList.forEach((element2) => {
                            if (element.inv_nm_supplier_id == element2.ss_id) {
                                element.supplier_Name = element2.ss_name;
                            } else if (element.inv_nm_supplier_id == '0') {
                                element.supplier_Name = 'NASER MOHSIN AUTO SPARE';
                            }
                        });
                    });
                    this.inv_list_without_jobcard = rData.invoices.filter((item: any) => item.job_no == '' || item.job_no == null);
                    this.inv_list_with_jobcard = rData.invoices.filter((item: any) => item.job_no != '' && item.job_no != null);
                    this.open_jobcard = rData.invoices.filter((item: any) => item.job_status == 'OPN');
                    this.wip_jobcard = rData.invoices.filter((item: any) => item.job_status == 'WIP');
                    this.can_jobcard = rData.invoices.filter((item: any) => item.job_status == 'CAN');
                    this.comp_jobcard = rData.invoices.filter((item: any) => item.job_status == 'COMP');
                    this.inv_jobcard = rData.invoices.filter((item: any) => item.job_status == 'INV');
                    this.closed_jobcard = rData.invoices.filter((item: any) => item.job_status == 'CLO');
                    this.suspended_jobcard = rData.invoices.filter((item: any) => item.job_status == 'SUS');
                    this.tst_jobcard = rData.invoices.filter((item: any) => item.job_status == 'TST');

                    console.log('invoice list??????????????????', this.open_jobcard);

                    this.open_jobcardGrandTotal = this.calculateTotalGrandTotal(this.open_jobcard).toFixed(2);
                    this.wip_jobcardGrandTotal = this.calculateTotalGrandTotal(this.wip_jobcard).toFixed(2);
                    this.can_jobcardGrandTotal = this.calculateTotalGrandTotal(this.can_jobcard).toFixed(2);
                    this.comp_jobcardGrandTotal = this.calculateTotalGrandTotal(this.comp_jobcard).toFixed(2);
                    this.inv_jobcardGrandTotal = this.calculateTotalGrandTotal(this.inv_jobcard).toFixed(2);
                    this.clos_jobcardGrandTotal = this.calculateTotalGrandTotal(this.closed_jobcard).toFixed(2);
                    this.sus_jobcardGrandTotal = this.calculateTotalGrandTotal(this.suspended_jobcard).toFixed(2);
                    this.tst_jobcardGrandTotal = this.calculateTotalGrandTotal(this.tst_jobcard).toFixed(2);

                    this.open_jobcardsubTotal = this.calculateTotalSubtotal(this.open_jobcard).toFixed(2);
                    this.wip_jobcardsubTotal = this.calculateTotalSubtotal(this.wip_jobcard).toFixed(2);
                    this.can_jobcardsubTotal = this.calculateTotalSubtotal(this.can_jobcard).toFixed(2);
                    this.comp_jobcardsubTotal = this.calculateTotalSubtotal(this.comp_jobcard).toFixed(2);
                    this.inv_jobcardsubTotal = this.calculateTotalSubtotal(this.inv_jobcard).toFixed(2);
                    this.clos_jobcardsubTotal = this.calculateTotalSubtotal(this.closed_jobcard).toFixed(2);
                    this.sus_jobcardsubTotal = this.calculateTotalSubtotal(this.suspended_jobcard).toFixed(2);
                    this.tst_jobcardsubTotal = this.calculateTotalSubtotal(this.tst_jobcard).toFixed(2);

                    this.totalGP_with_Job_Card = {
                        totalGP_with_Job_Card: this.calculateGP(
                            rData.total_inv_cost_with_jobcard.total_inv_cost_with_jobcard,
                            rData.total_inv_cost_with_jobcard_margin.total_inv_cost_with_jobcard_margin
                        ),
                        gp_open_jobcard: this.calculateGP(this.open_jobcardGrandTotal, this.open_jobcardsubTotal),
                        gp_wip_jobcard: this.calculateGP(this.wip_jobcardGrandTotal, this.wip_jobcardsubTotal),
                        gp_can_jobcard: this.calculateGP(this.can_jobcardGrandTotal, this.can_jobcardsubTotal),
                        gp_comp_jobcard: this.calculateGP(this.comp_jobcardGrandTotal, this.comp_jobcardsubTotal),
                        gp_inv_jobcard: this.calculateGP(this.inv_jobcardGrandTotal, this.inv_jobcardsubTotal),
                        gp_clos_jobcard: this.calculateGP(this.clos_jobcardGrandTotal, this.clos_jobcardsubTotal),
                        gp_sus_jobcard: this.calculateGP(this.sus_jobcardGrandTotal, this.sus_jobcardsubTotal),
                        gp_tst_jobcard: this.calculateGP(this.tst_jobcardGrandTotal, this.tst_jobcardsubTotal),
                    };
                    this.totalGP_amount_with_Job_Card = {
                        totalGP_amount_with_Job_Card:
                            rData.total_inv_cost_with_jobcard.total_inv_cost_with_jobcard -
                            rData.total_inv_cost_with_jobcard_margin.total_inv_cost_with_jobcard_margin,
                        gp_amount_open_jobcard: this.open_jobcardGrandTotal - this.open_jobcardsubTotal,
                        gp_amount_wip_jobcard: this.wip_jobcardGrandTotal - this.wip_jobcardsubTotal,
                        gp_amount_can_jobcard: this.can_jobcardGrandTotal - this.can_jobcardsubTotal,
                        gp_amount_comp_jobcard: this.comp_jobcardGrandTotal - this.comp_jobcardsubTotal,
                        gp_amount_inv_jobcard: this.inv_jobcardGrandTotal - this.inv_jobcardsubTotal,
                        gp_amount_clos_jobcard: this.clos_jobcardGrandTotal - this.clos_jobcardsubTotal,
                        gp_amount_sus_jobcard: this.sus_jobcardGrandTotal - this.sus_jobcardsubTotal,
                        gp_amount_tst_jobcard: this.tst_jobcardGrandTotal - this.tst_jobcardsubTotal,
                    };

                    console.log('this.totalGP_with_Job_Card ', this.open_jobcardGrandTotal, this.open_jobcardsubTotal);

                    this.total_inv_cost = rData.total_inv_cost.total_inv_cost;
                    this.total_inv_cost_without_margin = rData.total_inv_cost_without_margin.total_inv_cost_without_margin;
                    this.total_inv_cost_without_jobcard = rData.total_inv_cost_without_jobcard.total_inv_cost_without_jobcard;
                    this.total_inv_cost_without_jobcard_margin = rData.total_inv_cost_without_jobcard_margin.total_inv_cost_without_jobcard_margin;
                    this.load_flag = false;
                    console.log('wip_jobcard', this.wip_jobcard);

                    this.totalGP = this.calculateGP(this.total_inv_cost, this.total_inv_cost_without_margin);
                    this.totalGP_amount = this.total_inv_cost - this.total_inv_cost_without_margin;
                    this.totalGP_without_Job_Card = this.calculateGP(this.total_inv_cost_without_jobcard, this.total_inv_cost_without_jobcard_margin);
                    this.totalGP_amount_without_Job_Card = this.total_inv_cost_without_jobcard - this.total_inv_cost_without_jobcard_margin;
                } else {
                    this.load_flag = false;
                }
            } else {
                this.load_flag = false;
            }
        });
    }

    calculateGP(totalInvCost: number, totalInvCostWithoutMargin: number): string {
        if (totalInvCost > 0 && totalInvCostWithoutMargin > 0) {
            const percentageDifference = (totalInvCost * 100) / totalInvCostWithoutMargin - 100;
            return percentageDifference.toFixed(2);
        } else {
            return '0.00';
        }
    }

    calculateTotalGrandTotal(orders: { grand_total: string }[]): number {
        return orders.reduce((total, order) => {
            const grandTotalNum = parseFloat(order.grand_total.replace(',', ''));
            return total + grandTotalNum;
        }, 0);
    }

    calculateTotalSubtotal(data: any[]): number {
        return data.reduce((total, item) => {
            const subtotal = parseFloat(item.inv_nm_sub_total.replace(',', '')) + parseFloat(item.inv_nm_vat_total.replace(',', ''));
            return total + subtotal;
        }, 0);
    }

    activityLogModalOpen(data: any) {
        this.userServices.getSpareInvoiceById({ spareInvId: data.inv_id }).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.invlogs = rdata.logs;
                if (this.invlogs.length > 0) {
                    this.activityLogModal.open();
                } else {
                    this.coloredToast('danger', 'Action denied, No Logs Found');
                }
            } else {
                this.coloredToast('danger', 'Action denied, No Logs Found');
            }
        });
    }

    activityLogModalClose() {
        this.activityLogModal.close();
    }
    updateColumn(col: colDef) {
        col.hide = !col.hide;
        this.cols = [...this.cols]; // Create a new reference of the array
    }

    viewSpareInvoice(item: any) {
        if ((this.permittedAction as string[]).includes('2')) {
            this.router.navigateByUrl('spare-invoice/spare-invoice-list/spare-edit/' + encodeURIComponent(btoa(item.inv_id)));
        } else {
            this.coloredToast('danger', 'Action denied, no permission to edit');
        }
    }

    refresh() {
        this.bill_date_start = this.datepipe.transform(moment(new Date()).startOf('month').toDate(), 'yyyy-MM-dd') || '';
        this.bill_date_end = this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '';
        this.selectedSupplier = '0';
        this.type = '0';
        this.selectedSA = '0';
        this.jbcardStatus = '0';
        this.isChecked = false;
        this.getTotalInvoices();
    }

    resetFields(value: any) {
        switch (value) {
            case 1:
                this.selectedSupplier = '0';
                this.purchaseType = '0';
                this.type = '0';
                this.selectedSA = '0';
                this.jbcardStatus = '0';
                break;
            case 2:
                this.purchaseType = '0';
                this.type = '0';
                this.selectedSA = '0';
                this.jbcardStatus = '0';
                break;
            case 3:
                this.type = '0';
                this.selectedSA = '0';
                this.jbcardStatus = '0';
                break;
            case 4:
                this.selectedSA = '0';
                this.jbcardStatus = '0';
                break;
            case 5:
                this.jbcardStatus = '0';
                break;
            default:
                break;
        }
    }
    printSpareInvoice(value: any) {
        window.open(environment.base_url + '/HTMLPdfController/printSpareInvoice?id=' + encodeURIComponent(btoa(value)), '_blank');
    }

    checkValue(event: any) {
        this.isChecked = event;
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
