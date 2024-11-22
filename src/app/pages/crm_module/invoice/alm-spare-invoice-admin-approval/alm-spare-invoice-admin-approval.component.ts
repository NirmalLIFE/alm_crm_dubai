import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { colDef } from '@bhplugin/ng-datatable';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';
import { trigger, transition, style, animate } from '@angular/animations';


@Component({
    selector: 'app-alm-spare-invoice-admin-approval',
    templateUrl: './alm-spare-invoice-admin-approval.component.html',
    styleUrls: ['./alm-spare-invoice-admin-approval.component.css'],
    animations: [
        trigger('toggleAnimation', [
            transition(':enter', [style({ opacity: 0, transform: 'scale(0.95)' }), animate('100ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))]),
            transition(':leave', [animate('75ms', style({ opacity: 0, transform: 'scale(0.95)' }))]),
        ]),
    ],
})
export class AlmSpareInvoiceAdminApprovalComponent implements OnInit {
    public search: string = '';
    public load_flag: boolean = true;
    public spareInvoices: any[] = [];
    public permittedAction: [] = [];
    public suppliersList:any[]=[];

    public cols = [
        { field: 'inv_nm_inv_date', title: 'Date', hide: false},
        { field: 'supplier_Name', title: 'Supplier Name', hide: false },
        { field: 'inv_nm_id', title: 'Inv Number', hide: false },
        { field: 'nm_type', title: 'Type', hide: false },
        { field: 'inv_nm_description', title: 'Description', hide: false },
        { field: 'us_firstname', title: 'Service Advisor', hide: false },
        { field: 'inv_jobcard_no', title: 'Jobcard', hide: true },
        { field: 'job_status', title: 'Job Card Status', hide: false },
        { field: 'sold_inv_date', title: 'Sold Invoice Date', hide: false },
        { field: 'finalsubtotal_credit', title: 'Credit Purchase', hide: false },
        { field: 'finalsubtotal_cash', title: 'Cash Purchase', hide: false },
        { field: 'totalPrice', title: 'Sold Amount', hide: false },
        { field: 'variation_margin', title: 'Variation Margin(%)', hide: false },
        { field: 'action', title: 'Actions', hide: false },
    ];

    constructor(private userServices: StaffPostAuthService, public router: Router,) {
        JSON.parse(atob(atob(localStorage.getItem('access_data') || '{}'))).forEach((element: any) => {
            if (element['ft_id'] == 38) {
              this.permittedAction = element['actions'];
            }
        });

        this.userServices.getSupplierDetails().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.suppliersList = rData.Suppliers;
            }
        });
    }

    ngOnInit(): void {
        this.getSpareInvoiceList();
    }

    updateColumn(col: colDef) {
        col.hide = !col.hide;
        this.cols = [...this.cols]; // Create a new reference of the array
    }

    getSpareInvoiceList() {
        if ((this.permittedAction as string[]).includes('5')) {
            //need to change this API

           

            this.userServices.getAdminApprovalInvoices().subscribe((rData: any) => {
                if (rData.ret_data == 'success') { 
                    this.spareInvoices = rData.invoice.filter((item: any) => item.inv_nm_status == "2");
                    this.spareInvoices.forEach((element: any) => {
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

    viewSpareInvoice(item: any) {
        if ((this.permittedAction as string[]).includes('2')) {
            this.router.navigateByUrl('admin_spare_invoice-edit/' + encodeURIComponent(btoa(item.inv_id)));
        } else {
            this.coloredToast('danger', 'Action denied, no permission to edit');
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
