import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-service-pkg-admin-update',
    templateUrl: './service-pkg-admin-update.component.html',
    styleUrls: ['./service-pkg-admin-update.component.css'],
})
export class ServicePkgAdminUpdateComponent implements OnInit {
    kilometer: any;
    modelCode: any;
    servicePackage: any = [];
    totalSPAmount: any;
    actualSPAmount: any;
    public load_flag: boolean = false;
    labourFactor: any;
    kilometers: any = [];
    public user_role: any = atob(atob(localStorage.getItem('us_role_id') || '{}'));
    modelCodes: any = [];
    selectedKmValue: any;
    public searched: boolean = true;

    constructor(public router: Router, private userServices: StaffPostAuthService, public datePipe: DatePipe) {}

    ngOnInit() {}

    checkServicePackage() {
        this.load_flag = true;
        this.servicePackage = [];
        this.searched = false;
        if (!this.modelCode) {
            this.coloredToast('danger', 'Model code required to search for a service package.');
            this.load_flag = false;
            return;
        }

        let data = {
            modelCode: this.modelCode,
        };

        this.userServices.getServicePackage(data).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                if (rData.servicePackage && rData.servicePackage.length > 0) {
                    const encodedModel = btoa(this.modelCode);
                    this.router.navigate(['servicePackageLabour', encodedModel]);
                } else if (rData.modelData) {
                    const statusFlag = rData.modelData.spmc_status_flag;
                    const statusMessages: { [key: string]: string } = {
                        '0': 'Waiting for parts to be entered.',
                        '1': 'Waiting for labour details to be added.',
                        '2': 'Waiting for kilometer data to be entered.',
                        '3': 'Waiting for Km price round-off.',
                    };

                    const message = statusMessages[statusFlag];
                    if (message) {
                        this.showServicePackageInProgressAlert(message);
                    }
                    this.load_flag = false;
                }
            } else if (rData.ret_data == 'fail') {
                this.coloredToast('danger', 'No Service Package For the Requested Model Code.');
            }
        });
    }

    showServicePackageInProgressAlert(message: string) {
        Swal.fire({
            icon: 'info',
            title: 'Service Package In Progress',
            html: `
          Service package found for <b>${this.modelCode}</b> is already under progress.<br><br>
          <b>Status:</b> ${message}
        `,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonText: '<i class="flaticon-cancel-circle"></i> Close',
            cancelButtonAriaLabel: 'Close this dialog',
            padding: '1.5em',
            customClass: 'sweet-alerts',
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
