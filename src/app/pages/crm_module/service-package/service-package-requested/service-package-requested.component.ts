import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-service-package-requested',
    templateUrl: './service-package-requested.component.html',
    styleUrls: ['./service-package-requested.component.css'],
})
export class ServicePackageRequestedComponent implements OnInit {
    public user_role: any = atob(atob(localStorage.getItem('us_role_id') || '{}'));
    public requestedServicePackage: any = [];
    public load_flag: boolean = true;
    public filteredPackages: any = [];

    servicePackageRequested = [
        { model_Code: '117.343', kilometer: 45000 },
        { model_Code: '117.344', kilometer: 50000 },
        { model_Code: '117.345', kilometer: 55000 },
        { model_Code: '117.346', kilometer: 60000 },
        { model_Code: '117.347', kilometer: 65000 },
    ];

    constructor(public router: Router, private userServices: StaffPostAuthService, public datePipe: DatePipe) {}

    ngOnInit() {
        this.getServicePackageRequested();
    }

    getServicePackageRequested() {
        this.load_flag = true;
        this.userServices.getServicePackageRequested().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.requestedServicePackage = rdata.requestedServicePackage;
                if (this.user_role == '17') {
                    this.filteredPackages = this.requestedServicePackage.filter(
                        (pkg: any) =>
                            (pkg.spmc_status_flag == '0' || pkg.spmc_status_flag == '2' || pkg.spmc_status_flag == '7' || pkg.spmc_status_flag == '9') &&
                            (pkg.spmc_draft_flag == '0' || pkg.spmc_draft_flag == '1')
                    );
                } else if (this.user_role == '20') {
                    this.filteredPackages = this.requestedServicePackage.filter(
                        (pkg: any) =>
                            (pkg.spmc_status_flag == '0' || pkg.spmc_status_flag == '1' || pkg.spmc_status_flag == '8' || pkg.spmc_status_flag == '9') &&
                            (pkg.spmc_draft_flag == '0' || pkg.spmc_draft_flag == '1')
                    );
                } else if (this.user_role == '1' || this.user_role == '10' || this.user_role == '13' || this.user_role == '2') {
                    this.filteredPackages = this.requestedServicePackage.filter(
                        (pkg: any) =>
                            pkg.spmc_status_flag === '0' ||
                            pkg.spmc_status_flag === '1' ||
                            pkg.spmc_status_flag === '2' ||
                            pkg.spmc_status_flag === '3' ||
                            pkg.spmc_status_flag === '4' ||
                            pkg.spmc_status_flag === '7' ||
                            pkg.spmc_status_flag === '8' ||
                            pkg.spmc_status_flag === '9'
                    );
                }
                this.load_flag = false;
            } else {
                this.load_flag = false;
                this.coloredToast('danger', 'No pending service package requests available.');
            }
        });
    }

    async onYes(pkg: any) {
        const encodedModel = btoa(pkg.spmc_value); // e.g., '117.343'

        const isSessionAvailable = await this.checkSPSessionLock(pkg.spmc_value);

        if (!isSessionAvailable) {
            this.coloredToast('danger', 'Someone is already updating this package.');
            return;
        }

        if (this.user_role == 17) {
            this.router.navigate(['servicePackageParts', encodedModel]);
            this.updateSPSessionLock(pkg.spmc_value);
        } else if (this.user_role == 20) {
            this.router.navigate(['servicePkgCnsLbr', encodedModel]);
            this.updateSPSessionLock(pkg.spmc_value);
        } else if (this.user_role == 1 || this.user_role == 10 || this.user_role == 13 || this.user_role == 2) {
            if ((pkg.spmc_status_flag == '3' || pkg.spmc_status_flag == '4') && (pkg.spmc_draft_flag == '0' || pkg.spmc_draft_flag == '1')) {
                if (pkg.spmc_status_flag == '4') {
                    this.router.navigate(['servicePackageKmPriceMap', encodedModel]);
                } else if (pkg.spmc_status_flag != '9') {
                    this.router.navigate(['servicePackageLabour', encodedModel]);
                }
                this.updateSPSessionLock(pkg.spmc_value);
            } else {
                this.coloredToast(
                    'danger',
                    'Package cannot be opened. Please ensure parts are entered by the Parts Advisor and labour/consumables are added by the Supervisor.'
                );
            }

            // this.router.navigate(['servicePackageKm', encodedModel]);
        }

        // servicePackageParts
    }

    checkSPSessionLock(spmc_value: any): Promise<boolean> {
        let data = {
            modelCode: spmc_value,
        };

        return new Promise((resolve) => {
            this.userServices.checkSPSessionLock(data).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    resolve(false); // Someone else is using it
                } else {
                    resolve(true); // Session is free
                }
            });
        });
    }

    updateSPSessionLock(spmc_value: any) {
        let data = {
            modelCode: spmc_value,
            sessionLock: 1,
        };

        this.userServices.setSPSessionLock(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
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

    getPackageStatus(pkg: any): string {
        const name = pkg.updated_by_name?.trim();
        const byText = name ? ` by ${name}` : '';

        // Handle special draft combos first
        if (pkg.spmc_status_flag === '1' && pkg.spmc_draft_flag === '1') {
            return `Parts entered; Labour saved as draft${byText}`;
        } else if (pkg.spmc_status_flag === '2' && pkg.spmc_draft_flag === '1') {
            return `Labour entered; Parts saved as draft${byText}`;
        }

        // Status-based handling
        switch (pkg.spmc_status_flag) {
            case '0':
                return 'Awaiting Parts and Labour entry';
            case '1':
                return `Parts entered${byText}; Labour pending`;
            case '2':
                return `Labour entered${byText}; Parts pending`;
            case '3':
                return `Parts and Labour entered`;
            case '4':
                return 'Awaiting service package KM price mapping';
            case '7':
                return 'Returned to Parts Advisor';
            case '8':
                return 'Returned to Supervisor';
            case '9':
                return 'Parts and Labour returned';
        }

        // Fallback to draft
        if (pkg.spmc_draft_flag === '1') {
            return `Saved as draft${byText}`;
        }

        // Default fallback
        return `Parts and labour entered${byText}`;
    }
}
