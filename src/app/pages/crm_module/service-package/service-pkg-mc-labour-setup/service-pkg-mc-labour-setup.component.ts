import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-service-pkg-mc-labour-setup',
    templateUrl: './service-pkg-mc-labour-setup.component.html',
    styleUrls: ['./service-pkg-mc-labour-setup.component.css'],
})
export class ServicePkgMcLabourSetupComponent implements OnInit {
    public modelCodeList: any = [];
    public search: string = '';
    public load_flag: boolean = true;
    public modelCodeDetails: any = {
        family_code: '',
        model_code: '',
        brand_code: '',
        labour_rate: '',
        spmcl_inc_pct: '',
        spmcl_id: null,
        spmcl_delete_flag: 0,
    };

    public labourPercentage: any = {
        family_code: null,
        spmcf_family_name: null,
        spmcl_inc_pct: null,
    };
    public familyCodes: any = [];
    public familyNames: any = [];
    public button_flag: boolean = false;

    @ViewChild('editModelCode') editModelCode: any;
    @ViewChild('labourPercentageModelCode') labourPercentageModelCode: any;

    public cols = [
        { field: 'family_code', title: 'Family Code', isUnique: false },
        { field: 'spmcf_family_name', title: 'Family Name', isUnique: false },
        { field: 'model_code', title: 'Model Code', isUnique: false },
        { field: 'brand_code', title: 'Brand Code', isUnique: false },
        { field: 'labour_rate', title: 'Labour Rate', isUnique: false },
        { field: 'spmcl_inc_pct', title: 'Increased Labour Percentage', isUnique: false },
        { field: 'action', title: 'Actions', isUnique: false },
    ];

    constructor(public router: Router, private userServices: StaffPostAuthService, public datePipe: DatePipe, private activeRouter: ActivatedRoute) {}

    ngOnInit() {
        this.getModelCodeLabourRates();
    }

    getModelCodeLabourRates() {
        this.load_flag = false;
        this.userServices.getModelCodeLabourRates().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.modelCodeList = rdata.modelCodeList;
                const map = new Map<string, { family_code: string; spmcf_family_name: string; spmcl_inc_pct: any }>();
                for (const item of this.modelCodeList) {
                    if (!map.has(item.family_code)) {
                        map.set(item.family_code, {
                            family_code: item.family_code,
                            spmcf_family_name: item.spmcf_family_name,
                            spmcl_inc_pct: item.spmcl_inc_pct, // ← include the percentage
                        });
                    }
                }
                this.familyCodes = Array.from(map.values());
                this.load_flag = false;
            }
        });
    }

    modelCodeEdit(value: any) {
        // console.log("this is the modelcode edit",value)
        this.modelCodeDetails = {
            model_code: value.model_code || '',
            spmcf_family_name: value.spmcf_family_name || '',
            brand_code: value.brand_code || '',
            labour_rate: value.labour_rate || '',
            spmcl_inc_pct: value.spmcl_inc_pct || '',
            spmcl_id: value.spmcl_id || null,
            spmcl_delete_flag: value.spmcl_delete_flag ?? 0,
            family_code: value.spmcf_family_code || '',
        };

        this.editModelCode.open();
    }

    increaseLabourPercentage() {
        this.labourPercentage = {
            family_code: null,
            spmcl_inc_pct: null,
        };
        this.labourPercentageModelCode.open();
    }

    updateIncreaseLabourPercentage() {
        this.button_flag = false;
        if (!this.labourPercentage.family_code || !this.labourPercentage.spmcl_inc_pct) {
            this.coloredToast('error', 'Please enter both Family Code and Labour Percentage.');
            this.button_flag = true;
            return;
        }
        this.labourPercentage.user_id = atob(atob(localStorage.getItem('us_id') || '{}'));
        this.userServices.increaseLabourRatesByFamilyCode(this.labourPercentage).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.labourPercentageModelCode.close();
                this.resetlabourPercentage();
                this.button_flag = false;
                this.coloredToast('success', 'New increased labour rate has been applied.');
                this.getModelCodeLabourRates();
            }
        });
    }

    resetlabourPercentage() {
        this.labourPercentage = {
            family_code: null,
            spmcf_family_name: null,
            spmcl_inc_pct: null,
        };
    }

    resetModelCodeEdit() {
        this.modelCodeDetails = {
            model_code: '',
            family_code: '',
            spmcf_family_name: '',
            brand_code: '',
            labour_rate: '',
            spmcl_inc_pct: '',
            spmcl_id: null,
            spmcl_delete_flag: 0,
        };
    }

    updateModelCodeDetails() {
        this.modelCodeDetails.user_id = atob(atob(localStorage.getItem('us_id') || '{}'));
        this.userServices.updateModelCodeDetails(this.modelCodeDetails).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.editModelCode.close();
                this.resetModelCodeEdit();
                this.button_flag = false;
                this.coloredToast('success', 'Model code has been updated successfully.');
                this.getModelCodeLabourRates();
            }
        });
    }

    onNameChange(lp: { spmcf_family_name: any; family_code?: any; spmcl_inc_pct?: any | null }): void {
        // Find the matching entry
        const match = this.familyCodes.find((x: any) => x.spmcf_family_name === lp.spmcf_family_name);

        if (match) {
            // Auto‑set the code
            this.labourPercentage.family_code = match.family_code;
            // Coerce "0.00" to null, otherwise set the percentage
            this.labourPercentage.spmcl_inc_pct = match.spmcl_inc_pct && match.spmcl_inc_pct != '0.00' ? match.spmcl_inc_pct : null;
        } else {
            // Reset if no match (defensive)
            this.labourPercentage.family_code = '';
            this.labourPercentage.spmcl_inc_pct = null;
        }
    }

    syncDataFromLaabs() {
        this.load_flag = true;

        this.userServices.updateModelCodeFromLaabs().subscribe({
            next: (rdata: any) => {
                this.load_flag = false;

                if (rdata.ret_data === 'success') {
                    // Show proper success toast
                    this.coloredToast(
                        'success',
                        `Model codes have been updated successfull`
                    );
                    this.getModelCodeLabourRates();
                } else {
                    // Info toast if API responds but no data
                    this.coloredToast('info', 'No new model codes to update.');
                }
            },
            error: (err) => {
                this.load_flag = false;
                // Error toast
                this.coloredToast('error', 'Failed to update model codes. Please try again.');
            },
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
