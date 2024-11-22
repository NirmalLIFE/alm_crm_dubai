import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';
import { colDef } from '@bhplugin/ng-datatable';
import { trigger, transition, style, animate } from '@angular/animations';
import * as moment from 'moment';
import { environment } from 'src/environments/environment.prod';

@Component({
    selector: 'app-alm-spare-invoice-list',
    templateUrl: './alm-spare-invoice-list.component.html',
    styleUrls: ['./alm-spare-invoice-list.component.css'],
    animations: [
        trigger('toggleAnimation', [
            transition(':enter', [style({ opacity: 0, transform: 'scale(0.95)' }), animate('100ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))]),
            transition(':leave', [animate('75ms', style({ opacity: 0, transform: 'scale(0.95)' }))]),
        ]),
    ],
})
export class AlmSpareInvoiceListComponent implements OnInit {
    public search: string = '';
    public load_flag: boolean = true;
    public spareInvoices: any[] = [];
    public permittedAction: [] = [];
    public invlogs: any[] = [];
    public suppliersList: any[] = [];

    bill_date_start: any = this.datepipe.transform(moment(new Date()).startOf('month').toDate(), 'yyyy-MM-dd') || '';
    bill_date_end: any = this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '';
    selectedSupplier: any;
    purchaseType: any;
    type: any;
    selectedSA: any;
    jbcardStatus: any;
    userlist: any[] = [];
    startFormattedDate: any;
    endFormattedDate: any;

    isChecked = false;

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

    constructor(private userServices: StaffPostAuthService, public router: Router, public datepipe: DatePipe) {
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
        this.selectedSupplier = '0';
        this.purchaseType = '0';
        this.type = '0';
        this.selectedSA = '0';
        this.jbcardStatus = '0';
    }

    ngOnInit(): void {
        this.getSpareInvoiceList();
    }

    formatDate(date: Date): string {
        // Format date to yyyy-MM-dd (required format for input type date)
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
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

    getSpareInvoiceList() {
        this.load_flag = true;
        if ((this.permittedAction as string[]).includes('5')) {
            if (this.bill_date_start && this.bill_date_end) {
                // const parsedDate = new Date(this.bill_date_start);
                // const enddate = new Date(this.bill_date_end);
                // this.startFormattedDate = this.datepipe.transform(parsedDate, 'dd-MMM-yy');
                // this.endFormattedDate = this.datepipe.transform(enddate, 'dd-MMM-yy');
            }

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

            this.userServices.getSpareInvoices(data).subscribe((rData: any) => {
                if (rData.ret_data == 'success') {
                    this.spareInvoices = rData.invoice;
                    this.spareInvoices.forEach((element: any) => {
                        element.totalPrice = (parseFloat(element.inv_alm_margin_total) - parseFloat(element.inv_alm_discount)).toFixed(2);
                        element.finalsubtotal = (
                            parseFloat(element.inv_nm_sub_total) +
                            parseFloat(element.inv_nm_vat_total) -
                            parseFloat(element.inv_nm_return_total)
                        ).toFixed(2);
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

                    this.load_flag = false;
                } else {
                    this.coloredToast('danger', 'Spare Invoice details cant be fetched, please try again later');
                    this.load_flag = false;
                }
            });
        } else {
            this.coloredToast('danger', 'Action denied, no permission to view');
        }
    }

    checkValue(event: any) {
        this.isChecked = event;
    }
    refresh() {
        this.bill_date_start = this.datepipe.transform(moment(new Date()).startOf('month').toDate(), 'yyyy-MM-dd') || '';
        this.bill_date_end = this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '';
        this.selectedSupplier = '0';
        this.type = '0';
        this.selectedSA = '0';
        this.jbcardStatus = '0';
        this.isChecked = false;
        this.getSpareInvoiceList();
    }

    createNewSpareInvoice() {
        if ((this.permittedAction as string[]).includes('1')) {
            // this.router.navigateByUrl('spare-invoice/spare-invoice-list/spare-create');
            this.router.navigateByUrl('spare-invoice/nm-spare-invoice-list');
        } else {
            this.coloredToast('danger', 'Action Denied, no permission to create');
        }
    }
    postNewSpareInvoice() {
        if ((this.permittedAction as string[]).includes('1')) {
            this.router.navigateByUrl('post_spare_invoice_creation');
        } else {
            this.coloredToast('danger', 'Action Denied, no permission to create');
        }
    }

    viewSpareInvoice(item: any) {
        if ((this.permittedAction as string[]).includes('2')) {
            this.router.navigateByUrl('spare-invoice/spare-invoice-list/spare-edit/' + encodeURIComponent(btoa(item.inv_id)));
        } else {
            this.coloredToast('danger', 'Action denied, no permission to edit');
        }
    }

    printSpareInvoice(value: any) {
        window.open(environment.base_url + '/HTMLPdfController/printSpareInvoice?id=' + encodeURIComponent(btoa(value)), '_blank');
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

    // filterData() {
    //     console.log('this.bill_date,this.selectedSupplier,this.purchaseType>>', this.bill_date, this.selectedSupplier, this.purchaseType);
    //     console.log('tythis.type,this.selectedSA,this.jbcardStatuspe>>', this.type, this.selectedSA, this.jbcardStatus);
    //     console.log(' this.spareInvoices>?/656+26565>', this.spareInvoices);

    //     this.spareInvoices = this.spareInvoices.filter((data) => {
    //         return (
    //             (!this.isNotEmptyOrNull(this.bill_date) || data.inv_nm_inv_date === this.bill_date) &&
    //             (!this.isNotEmptyOrNull(this.selectedSupplier) || data.inv_nm_supplier_id === this.selectedSupplier) &&
    //             (!this.isNotEmptyOrNull(this.purchaseType) || data.inv_nm_purchase_type === this.purchaseType) &&
    //             (!this.isNotEmptyOrNull(this.type) || data.nm_type === this.type) &&
    //             (!this.isNotEmptyOrNull(this.selectedSA) || data.inv_nm_inv_date === this.selectedSA) &&
    //             (!this.isNotEmptyOrNull(this.jbcardStatus) || data.job_status === this.jbcardStatus)
    //         );
    //     });

    //     console.log('this.bill_date,this.selectedSupplier,this.purchaseType>>', this.bill_date, this.selectedSupplier, this.purchaseType);
    //     console.log('tythis.type,this.selectedSA,this.jbcardStatuspe>>', this.type, this.selectedSA, this.jbcardStatus);
    //     console.log(' this.spareInvoices>?/656+26565>', this.spareInvoices);

    //     // this.spareInvoices = this.spareInvoices.filter((data) => data.department === 'marketing');
    // }

    isNotEmptyOrNull(value: any) {
        return value != null && value != '';
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
