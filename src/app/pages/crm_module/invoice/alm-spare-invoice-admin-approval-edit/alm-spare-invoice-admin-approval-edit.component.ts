import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-alm-spare-invoice-admin-approval-edit',
    templateUrl: './alm-spare-invoice-admin-approval-edit.component.html',
    styleUrls: ['./alm-spare-invoice-admin-approval-edit.component.css'],
})
export class AlmSpareInvoiceAdminApprovalEditComponent implements OnInit {
    public load_flag: boolean = true;
    public spare_inv_id: string;
    public invoiceDetails: any = {};
    indata: any;
    inv_id: any;

    constructor(private userServices: StaffPostAuthService, private activeRouter: ActivatedRoute,public router: Router) {
        this.spare_inv_id = atob(this.activeRouter.snapshot.paramMap.get('id') || '{}');
    }

    ngOnInit(): void {
        this.getSpareInvoiceById();
    }

    getSpareInvoiceById() {
        this.userServices.getSpareInvoiceById({ spareInvId: this.spare_inv_id }).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.invoiceDetails = rdata.invoice;
                this.inv_id = rdata.invoice.inv_id;
                this.load_flag = false;
            } else {
                this.load_flag = false;
                this.coloredToast('danger', 'Coulldnt fetch spare invoice details');
            }
        });
    }

    updateNMInvoice(data: any) {
        if (data == '1') {
            this.indata = {
                nm_inv_status: '4',
                inv_id: this.inv_id,
            };
        } else {
            this.indata = {
                nm_inv_status: '5',
                inv_id: this.inv_id,
            };
        }

        this.userServices.UpdateSpareInvoiceById(this.indata).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.coloredToast('success', 'Updated spare invoice details');
                this.router.navigateByUrl('admin_spare_invoice');
            } else {
              this.coloredToast('danger', 'Spare Invoice details cant be updated, please try again later');
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
