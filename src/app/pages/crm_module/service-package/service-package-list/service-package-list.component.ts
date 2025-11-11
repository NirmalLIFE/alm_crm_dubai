import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-service-package-list',
    templateUrl: './service-package-list.component.html',
    styleUrls: ['./service-package-list.component.css'],
})
export class ServicePackageListComponent implements OnInit {
    kilometer: any;
    modelCode: any;
    modelYear: any;
    variant: any;
    servicePackage: any = [];
    totalSPAmount: any;
    actualSPAmount: any;
    public load_flag: boolean = false;
    labourFactor: any;
    kilometers: any = [];
    public user_role: any = atob(atob(localStorage.getItem('us_role_id') || '{}'));
    public us_id: any = atob(atob(localStorage.getItem('us_id') || '{}'));
    modelCodes: any = [];
    selectedKmValue: any;
    public searched: boolean = true;
    visibleItemId: any;
    _searchMode: 'modelCode' | 'yearVariant' | 'regNo' = 'modelCode';
    modelId: any;
    regNo: any;
    regNumbers: any = [];
    typingTimer: any;
    typingDelay: number = 300;
    selectedRegNo: any = '';
    vin_no: any;

    constructor(public router: Router, private userServices: StaffPostAuthService, private activeRouter: ActivatedRoute, public datePipe: DatePipe) {
        let modal = this.activeRouter.snapshot.queryParamMap.get('modelCode');

        if (modal) {
            try {
                let decoded = atob(modal);
                // console.log('Decoded modelCode:', decoded);
                this.modelCode = decoded;
                this.validateAndCheckServicePackage();
            } catch (e) {
                // console.error('Invalid base64 in modelCode:', modal);
            }
        }
        // console.log('modl code', modal);
        this.userServices.getModelCodes().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.modelCodes = rData.modelCodes;
            }
        });

        this.userServices.getSPkilometer().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.kilometers = rData.kmData;
            }
        });

        this.userServices.getModelCodes().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.modelCodes = rData.modelCodes;
            }
        });

        this.userServices.getSPkilometer().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.kilometers = rData.kmData;
            }
        });
    }

    ngOnInit() {}

    validateAndCheckServicePackage() {
        this.selectedKmValue = null;

        const code = this.modelCode?.trim();
        const year = this.modelYear?.trim();
        const varnt = this.variant?.trim();
        const regNo = this.regNo?.trim();

        if (this.searchMode == 'modelCode') {
            if (!code) {
                this.coloredToast('danger', 'Model code is required to search for a service package.');
                return;
            }
            this.checkServicePackage(); // Existing flow
        } else if (this.searchMode == 'regNo') {
            if (!regNo) {
                this.coloredToast('danger', 'Reg No is required to search for a service package.');
                return;
            }
            this.checkByRegNo(this.regNo);
        } else {
            if (!year || !varnt) {
                this.coloredToast('danger', 'Please provide both model year and variant to proceed.');
                return;
            }
            this.checkByYearVariant(year, varnt);
        }
    }

    get searchMode(): 'modelCode' | 'yearVariant' | 'regNo' {
        return this._searchMode;
    }

    set searchMode(mode: 'modelCode' | 'yearVariant' | 'regNo') {
        this._searchMode = mode;
        this.clearSearchFields();
    }

    clearSearchFields() {
        this.modelCode = '';
        this.modelYear = '';
        this.variant = '';
        this.servicePackage = [];
    }

    checkByYearVariant(modelYear: string, variant: string) {
        this.load_flag = true;
        this.searched = true;
        const data = {
            modelYear,
            variant,
        };

        this.servicePackage = [];

        this.userServices.checkDuplicateModelCode(data).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                if (rData.duplicate_flag == 1) {
                    Swal.fire({
                        title: 'Multiple Model Codes Found',
                        html: `
                                    <p style="margin-bottom: 10px;">
                                    Please enter the <b>VIN Number</b> to fetch the correct service package.
                                            </p>
                                                <input id="vinNo" class="swal2-input" placeholder="Enter VIN Number" />`,
                        confirmButtonText: 'Fetch Package',
                        showCancelButton: true,
                        preConfirm: () => {
                            const vin = (document.getElementById('vinNo') as HTMLInputElement).value.trim();

                            if (!vin) {
                                Swal.showValidationMessage('VIN Number is required.');
                                return false;
                            }
                            return vin;
                        },
                    }).then((result) => {
                        if (result.isConfirmed && result.value) {
                            const vin = result.value;
                            this.getServicePackageByVin(vin);
                        }
                        this.load_flag = false;
                        this.searched = false;
                    });
                } else if (rData.duplicate_flag == 0) {
                    // this.servicePackage = rData.servicePackage;
                    this.labourFactor = rData.labourFactor;
                    this.modelId = rData.modelId;
                    this.servicePackage = rData.servicePackage
                        .sort((a: any, b: any) => (a.km_id || 0) - (b.km_id || 0))
                        .map((kmGroup: any) => {
                            const items = kmGroup.items
                                .map((item: any) => {
                                    const itemType = item.item_type;
                                    const price = parseFloat(item.pm_price) || 0;
                                    const qty = parseFloat(item.sp_spare_qty) || 0;
                                    const labourUnit = parseFloat(item.sp_spare_labour_unit) || 0;
                                    const labourFactor = this.labourFactor || 0;

                                    let total = 0;
                                    let group_seq = 0;

                                    if (itemType === 0) {
                                        total = price * qty + (labourUnit > 0 ? labourUnit * labourFactor : 0);
                                        group_seq = item.sp_spare_group_seq || 0;
                                    } else {
                                        const unit = parseFloat(item.sp_labour_unit) || 0;
                                        total = unit * labourFactor;
                                        group_seq = item.sp_labour_group_seq || 0;
                                    }

                                    return {
                                        ...item,
                                        checked: true,
                                        total,
                                        group_seq,
                                    };
                                })
                                .sort((a: any, b: any) => {
                                    const aSeq = Number(a.group_seq) || 0;
                                    const bSeq = Number(b.group_seq) || 0;

                                    if (aSeq === 0 && bSeq !== 0) return 1;
                                    if (aSeq !== 0 && bSeq === 0) return -1;
                                    return aSeq - bSeq;
                                });

                            const groupTotal = items.reduce((sum: any, i: any) => sum + (i.checked ? i.total : 0), 0);
                            const displayPrice = parseFloat(kmGroup.display_price) || 0;
                            const display_price = groupTotal > displayPrice ? groupTotal : displayPrice;

                            return {
                                ...kmGroup,
                                items,
                                totalSPAmount: groupTotal,
                                display_price: display_price,
                                actualSPAmount: groupTotal,
                            };
                        });

                    if (this.servicePackage.length > 0) {
                        this.selectedKmValue = this.servicePackage[0].km_value;
                        this.onKmSelectionChange(this.selectedKmValue);
                    }

                    // console.log('Final items in kmGroup:', this.servicePackage);
                    this.load_flag = false;
                    this.searched = false;
                }
            } else {
                this.load_flag = false;
                this.searched = false;
                this.coloredToast('danger', 'No service package found. Create one by searching with the model code.');
            }
        });
    }

    getServicePackageByVin(vin: string) {
        this.searched = false;
        this.load_flag = true;
        const data = { vin };

        this.userServices.getServicePackageByVin(data).subscribe((rData: any) => {
            this.load_flag = false;

            if (rData.ret_data === 'success' && rData.servicePackage?.length > 0) {
                // this.servicePackage = rData.servicePackage;
                this.labourFactor = rData.labourFactor;
                this.modelId = rData.modelId;
                this.servicePackage = rData.servicePackage
                    .sort((a: any, b: any) => (a.km_id || 0) - (b.km_id || 0))
                    .map((kmGroup: any) => {
                        const items = kmGroup.items
                            .map((item: any) => {
                                const itemType = item.item_type;
                                const price = parseFloat(item.pm_price) || 0;
                                const qty = parseFloat(item.sp_spare_qty) || 0;
                                const labourUnit = parseFloat(item.sp_spare_labour_unit) || 0;
                                const labourFactor = this.labourFactor || 0;

                                let total = 0;
                                let group_seq = 0;

                                if (itemType === 0) {
                                    total = price * qty + (labourUnit > 0 ? labourUnit * labourFactor : 0);
                                    group_seq = item.sp_spare_group_seq || 0;
                                } else {
                                    const unit = parseFloat(item.sp_labour_unit) || 0;
                                    total = unit * labourFactor;
                                    group_seq = item.sp_labour_group_seq || 0;
                                }

                                return {
                                    ...item,
                                    checked: true,
                                    total,
                                    group_seq,
                                };
                            })
                            .sort((a: any, b: any) => {
                                const aSeq = Number(a.group_seq) || 0;
                                const bSeq = Number(b.group_seq) || 0;

                                if (aSeq === 0 && bSeq !== 0) return 1;
                                if (aSeq !== 0 && bSeq === 0) return -1;
                                return aSeq - bSeq;
                            });

                        const groupTotal = items.reduce((sum: any, i: any) => sum + (i.checked ? i.total : 0), 0);
                        const displayPrice = parseFloat(kmGroup.display_price) || 0;
                        const display_price = groupTotal > displayPrice ? groupTotal : displayPrice;

                        return {
                            ...kmGroup,
                            items,
                            totalSPAmount: groupTotal,
                            display_price: display_price,
                            actualSPAmount: groupTotal,
                        };
                    });

                if (this.servicePackage.length > 0) {
                    this.selectedKmValue = this.servicePackage[0].km_value;
                    this.onKmSelectionChange(this.selectedKmValue);
                }

                this.load_flag = false;
            } else {
                this.load_flag = false;
                this.coloredToast('warning', 'No service package found for this VIN.');
            }
        });
    }

    checkServicePackage() {
        this.load_flag = true;
        this.servicePackage = [];
        this.searched = false;
        // if (!this.modelCode) {
        //     this.coloredToast('danger', 'Model code required to search for a service package.');
        //     this.load_flag = false;
        //     return;
        // }

        let data = {
            modelCode: this.modelCode ?? '',
            modelYear: this.modelYear ?? '',
            variant: this.variant ?? '',
            // kilometer: this.kilometer,
        };

        this.userServices.getServicePackage(data).subscribe((rData: any) => {
            if (rData.ret_data === 'success') {
                // 🔹 Helper: Bind service package and calculate prices
                const bindServicePackageData = (selectedModel: any) => {
                    if (!selectedModel || !selectedModel.servicePackage) return;

                    this.labourFactor = selectedModel.labourFactor;
                    this.modelId = selectedModel.modelId;

                    this.servicePackage = selectedModel.servicePackage
                        .sort((a: any, b: any) => (a.km_id || 0) - (b.km_id || 0))
                        .map((kmGroup: any) => {
                            const items = kmGroup.items.map((item: any) => {
                                const itemType = item.item_type;
                                const price = parseFloat(item.pm_price) || 0;
                                const qty = parseFloat(item.sp_spare_qty) || 0;
                                const labourUnit = parseFloat(item.sp_spare_labour_unit) || 0;
                                const labourFactor = this.labourFactor || 0;

                                let total = 0;
                                let group_seq = 0;

                                if (itemType === 0) {
                                    total = price * qty + (labourUnit > 0 ? labourUnit * labourFactor : 0);
                                    group_seq = item.sp_spare_group_seq || 0;
                                } else {
                                    const unit = parseFloat(item.sp_labour_unit) || 0;
                                    total = unit * labourFactor;
                                    group_seq = item.sp_labour_group_seq || 0;
                                }

                                return { ...item, checked: true, total, group_seq };
                            });

                            const groupTotal = items.reduce((sum: any, i: any) => sum + (i.checked ? i.total : 0), 0);
                            const displayPrice = parseFloat(kmGroup.display_price) || 0;
                            const display_price = groupTotal > displayPrice ? groupTotal : displayPrice;

                            return { ...kmGroup, items, totalSPAmount: groupTotal, display_price, actualSPAmount: groupTotal };
                        });

                    if (this.servicePackage?.length > 0) {
                        this.selectedKmValue = this.servicePackage[0].km_value;
                        this.onKmSelectionChange(this.selectedKmValue);
                    }

                    this.load_flag = false;
                };

                // 🔹 Handle selected package status
                const handlePackageSelection = (selectedModel: any) => {
                    if (!selectedModel) return;

                    const statusMessages: { [key: string]: string } = {
                        '0': 'Requested For Parts And Labour',
                        '1': 'Parts entered and Labour Not entered',
                        '2': 'Labour Entered and Parts not entered',
                        '3': 'Parts And Labour Entered',
                        '4': 'Waiting For Km Price Map',
                        '5': 'Final Approval By Admin',
                    };

                    const status = selectedModel.spmc_status_flag;

                    if (status == '5') {
                        // ✅ Status 5 → bind normally
                        bindServicePackageData(selectedModel);
                    } else {
                        // ⚠ Status not 5 → show Swal with only Cancel
                        Swal.fire({
                            icon: 'info',
                            title: 'Service Package Status',
                            html: `
                <p>${statusMessages[status] || 'Status unknown'}</p>
                <p>Please wait until the package is approved.</p>
            `,
                            showConfirmButton: false,
                            showCancelButton: true,
                            cancelButtonText: 'Close',
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            customClass: { popup: 'sweet-alerts rounded-icon-popup' },
                        });
                    }

                    this.load_flag = false;
                };

                // ✅ Main logic function
                const runLogic = () => {
                    const models = rData.models || [];
                    console.log('models:', models);

                    if (rData.spmcl_type == '1') {
                        const normalModel = models.find((m: any) => m.spmc_type === '0');
                        const faceliftModel = models.find((m: any) => m.spmc_type === '1');

                        const statusMessages: { [key: string]: string } = {
                            '0': 'Requested For Parts And Labour',
                            '1': 'Parts entered and Labour Not entered',
                            '2': 'Labour Entered and Parts not entered',
                            '3': 'Parts And Labour Entered',
                            '4': 'Waiting For Km Price Map',
                            '5': 'Final Approval By Admin',
                        };

                        // Case 1: Both facelift & normal found → show Swal to select
                        if (normalModel && faceliftModel) {
                            Swal.fire({
                                title: 'Select Service Package Type',
                                html: `
                    <div class="flex flex-col gap-3">
                        <button id="normalPkgBtn" class="swal2-confirm swal2-styled" style="background-color:#2563eb">
                            Normal Service Package
                            <div style="font-size:12px;margin-top:4px;color:#f1f1f1;">
                                ${statusMessages[normalModel.spmc_status_flag]}
                            </div>
                        </button>
                        <button id="faceliftPkgBtn" class="swal2-confirm swal2-styled" style="background-color:#9333ea">
                            Facelift Service Package
                            <div style="font-size:12px;margin-top:4px;color:#f1f1f1;">
                                ${statusMessages[faceliftModel.spmc_status_flag]}
                            </div>
                        </button>
                    </div>
                `,
                                showConfirmButton: false,
                                didOpen: () => {
                                    document.getElementById('normalPkgBtn')?.addEventListener('click', () => {
                                        Swal.close();
                                        handlePackageSelection(normalModel);
                                    });
                                    document.getElementById('faceliftPkgBtn')?.addEventListener('click', () => {
                                        Swal.close();
                                        handlePackageSelection(faceliftModel);
                                    });
                                },
                                allowOutsideClick: false,
                                allowEscapeKey: false,
                                customClass: { popup: 'sweet-alerts rounded-icon-popup' },
                            });
                            this.load_flag = false;
                            return;
                        }

                        // Case 2: Only facelift available → show same Swal
                        if (faceliftModel && !normalModel) {
                            Swal.fire({
                                title: 'Select Service Package Type',
                                html: `
                    <div class="flex flex-col gap-3">
                        <button id="normalPkgBtn" class="swal2-confirm swal2-styled" style="background-color:#2563eb">
                            Normal Service Package
                            <div style="font-size:12px;margin-top:4px;color:#f1f1f1;">
                                Create
                            </div>
                        </button>
                        <button id="faceliftPkgBtn" class="swal2-confirm swal2-styled" style="background-color:#9333ea">
                            Facelift Service Package
                            <div style="font-size:12px;margin-top:4px;color:#f1f1f1;">
                                ${statusMessages[faceliftModel.spmc_status_flag]}
                            </div>
                        </button>
                    </div>
                `,
                                showConfirmButton: false,
                                didOpen: () => {
                                    document.getElementById('normalPkgBtn')?.addEventListener('click', () => {
                                        Swal.close();
                                        this.showAlert(); // Normal clicked but not available
                                    });
                                    document.getElementById('faceliftPkgBtn')?.addEventListener('click', () => {
                                        Swal.close();
                                        handlePackageSelection(faceliftModel); // Facelift clicked → proceed
                                    });
                                },
                                allowOutsideClick: false,
                                allowEscapeKey: false,
                                customClass: { popup: 'sweet-alerts rounded-icon-popup' },
                            });
                            this.load_flag = false;
                            return;
                        }

                        // Case 3: Only normal available → show Swal with both buttons
                        if (normalModel && !faceliftModel) {
                            Swal.fire({
                                title: 'Select Service Package Type',
                                html: `
                    <div class="flex flex-col gap-3">
                        <button id="normalPkgBtn" class="swal2-confirm swal2-styled" style="background-color:#2563eb">
                            Normal Service Package
                            <div style="font-size:12px;margin-top:4px;color:#f1f1f1;">
                                ${statusMessages[normalModel.spmc_status_flag]}
                            </div>
                        </button>
                        <button id="faceliftPkgBtn" class="swal2-confirm swal2-styled" style="background-color:#9333ea">
                            Facelift Service Package
                            <div style="font-size:12px;margin-top:4px;color:#f1f1f1;">
                                Create
                            </div>
                        </button>
                    </div>
                `,
                                showConfirmButton: false,
                                didOpen: () => {
                                    document.getElementById('normalPkgBtn')?.addEventListener('click', () => {
                                        Swal.close();
                                        handlePackageSelection(normalModel); // Normal clicked → proceed
                                    });
                                    document.getElementById('faceliftPkgBtn')?.addEventListener('click', () => {
                                        Swal.close();
                                        this.faceliftShowAlert(); // Facelift clicked but not available
                                    });
                                },
                                allowOutsideClick: false,
                                allowEscapeKey: false,
                                customClass: { popup: 'sweet-alerts rounded-icon-popup' },
                            });
                            this.load_flag = false;
                            return;
                        }

                        // Case 4: No model found
                        this.showAlert();
                        this.load_flag = false;
                        return;
                    }

                    // Fallback for other spmcl_type values
                    const normalModel = models.find((m: any) => m.spmc_type === '0');
                    handlePackageSelection(normalModel);
                    return;
                };

                // 🔹 Safety: modelYear warning
                const year = Number(this.modelYear);
                if ([2016, 2017].includes(year) && this.searchMode === 'regNo') {
                    runLogic();
                    // Swal.fire({
                    //     icon: 'warning',
                    //     title: 'Attention',
                    //     html: '<span class="warning-text">For model years 2016 and 2017, please check the prices before proceeding.</span>',
                    //     iconColor: '#f59e0b',
                    //     confirmButtonText: 'Confirm',
                    //     showCancelButton: false,
                    //     padding: '2em',
                    //     allowOutsideClick: false,
                    //     allowEscapeKey: false,
                    //     customClass: { popup: 'sweet-alerts rounded-icon-popup' },
                    // }).then((result) => {
                    //     if (result.isConfirmed) runLogic();
                    //     else this.load_flag = false;
                    // });
                } else {
                    runLogic();
                }
            } else {
                this.load_flag = false;
                this.coloredToast('danger', 'No service package found. Create one by searching with the model code.');
                // this.showAlert();
                if (this._searchMode == 'modelCode') {
                    this.showAlert();
                }
            }
        });
    }

    // Called on every input in ng-autocomplete
    onRegNoTyping(value: string) {
        clearTimeout(this.typingTimer);

        if (value.length >= 2) {
            this.typingTimer = setTimeout(() => {
                this.fetchRegNoSuggestions(value);
            }, this.typingDelay);
        } else {
            this.regNumbers = [];
        }
    }

    // Fetch autocomplete suggestions
    fetchRegNoSuggestions(regNo: string) {
        this.userServices.getCustomerRegNo({ regNo }).subscribe((rData: any) => {
            if (rData.ret_data === 'success') {
                this.regNumbers = rData.suggestions || [];
            }
        });
    }

    // Called when user selects a suggestion
    onRegNoSelected(selectedRegNo: string) {
        this.regNo = selectedRegNo;
        // this.checkByRegNo(this.regNo); // Fetch model code
    }

    // Fetch the model code for a selected regNo
    checkByRegNo(regNo: any) {
        this.load_flag = true;
        this.vin_no = '';
        this.modelYear = '';
        this.servicePackage = [];
        this.userServices.getServicePackageByRegNo({ regNo }).subscribe((rData: any) => {
            if (rData.ret_data === 'success') {
                this.modelCode = rData.data.MODEL_CODE;
                this.vin_no = rData.data.CHASSIS_NO;
                this.modelYear = rData.data.MODEL_YEAR;
                if (this.modelCode) {
                    this.checkServicePackage();
                } else {
                    this.load_flag = false;
                    this.coloredToast('danger', 'No service package found. Create one by searching with the model code.');
                }
            }
        });
    }

    // // Prevent default Enter behavior in autocomplete
    // preventDefault() {
    //     event?.preventDefault();
    // }

    toCamelCase(text: string): string {
        if (!text) return '';
        return text
            .toLowerCase()
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    showAlert() {
        const isYearVariantSearch = this.searchMode === 'yearVariant';
        Swal.fire({
            icon: 'info',
            html: `
            <p class="mb-2">No service package found for
                <b>${isYearVariantSearch ? `${this.modelYear} / ${this.variant}` : this.modelCode}</b>.
            </p>
            <p class="mb-3">Do you want to create a service request?</p>

            <div style="display: flex; gap: 1px;">
                ${
                    isYearVariantSearch
                        ? `
                    <div style="display: flex; flex-direction: column; width: 30%;">
                        <label for="modelCode" style="font-weight: 400; margin-bottom: 2px;"><b>Model Code</b></label>
                        <input id="modelCode" class="swal2-input" placeholder="Enter Model Code">
                    </div>`
                        : ''
                }

                <div style="display: flex; flex-direction: column; width: 40%;">
                    <label for="vinNo" style="font-weight: 400; margin-bottom: 2px;"><b>VIN No</b></label>
                    <input id="vinNo" class="swal2-input" style="padding: 3px 3px; text-transform: uppercase;" placeholder="Enter VIN No">
                </div>

                <div style="display: flex; flex-direction: column; width: 20%;">
                    <label for="modelYear" style="font-weight: 400; margin-bottom: 2px;"><b>Model Year</b></label>
                    <input id="modelYear" class="swal2-input" style="text-transform: uppercase;" placeholder="Year" value="${this.modelYear || ''}">
                </div>

                <div style="display: flex; flex-direction: column; width: 40%; ">
                    <label for="variant" style="font-weight: 400; margin-bottom: 2px;"><b>Variant</b></label>
                    <input id="variant" class="swal2-input"  style="text-transform: uppercase;" placeholder="Enter Variant" value="${this.variant || ''}">
                </div>
            </div>
        `,
            width: '1000px',
            showCancelButton: true,
            confirmButtonText: 'Create Service Request',
            cancelButtonText: 'Cancel',
            focusConfirm: false,
            customClass: 'sweet-alerts',

            preConfirm: () => {
                const vinNo = (document.getElementById('vinNo') as HTMLInputElement).value.toUpperCase();
                const modelYear = (document.getElementById('modelYear') as HTMLInputElement).value;
                const variant = (document.getElementById('variant') as HTMLInputElement).value.toUpperCase();
                const modelCodeInput = isYearVariantSearch ? (document.getElementById('modelCode') as HTMLInputElement).value : this.modelCode;

                if (!vinNo || !modelYear || !variant || !modelCodeInput) {
                    Swal.showValidationMessage('All fields are required');
                    return false;
                }

                const data = {
                    modelCode: modelCodeInput,
                    vinNo,
                    modelYear,
                    variant,
                    type: 0,
                    spmc_branch: environment.branch_id, 
                    user_id: atob(atob(localStorage.getItem('us_id') || '{}')),
                };

                return new Promise((resolve) => {
                    this.userServices.createServicePackage(data).subscribe({
                        next: (rData: any) => {
                            if (rData.ret_data === 'success') {
                                resolve(data);
                            } else {
                                Swal.showValidationMessage('Service creation failed. Please try again.');
                            }
                        },
                        error: () => {
                            Swal.showValidationMessage('Something went wrong. Please try again.');
                        },
                    });
                });
            },
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                const msg = `Service request successfully created for model code <b>${result.value.modelCode}</b>`;
                this.coloredToast('success', msg);
            }
        });
    }

    faceliftShowAlert() {
        Swal.fire({
            icon: 'info',
            html: `
            <p class="mb-2">No service package found for
                <b>${this.modelCode}</b>.
            </p>
            <p class="mb-3">Do you want to create a facelift service request?</p>

            <div style="display: flex; gap: 1px;">
                <div style="display: flex; flex-direction: column; width: 40%;">
                    <label for="vinNo" style="font-weight: 400; margin-bottom: 2px;"><b>VIN No</b></label>
                    <input id="vinNo" class="swal2-input" style="padding: 3px 3px; text-transform: uppercase;" placeholder="Enter VIN No">
                </div>

                <div style="display: flex; flex-direction: column; width: 20%;">
                    <label for="modelYear" style="font-weight: 400; margin-bottom: 2px;"><b>Model Year</b></label>
                    <input id="modelYear" class="swal2-input" style="text-transform: uppercase;" placeholder="Year" value="${this.modelYear || ''}">
                </div>

                <div style="display: flex; flex-direction: column; width: 40%; ">
                    <label for="variant" style="font-weight: 400; margin-bottom: 2px;"><b>Variant</b></label>
                    <input id="variant" class="swal2-input"  style="text-transform: uppercase;" placeholder="Enter Variant" value="${this.variant || ''}">
                </div>
            </div>
        `,
            width: '1000px',
            showCancelButton: true,
            confirmButtonText: 'Create Service Request',
            cancelButtonText: 'Cancel',
            focusConfirm: false,
            customClass: 'sweet-alerts',

            preConfirm: () => {
                const vinNo = (document.getElementById('vinNo') as HTMLInputElement).value.toUpperCase();
                const modelYear = (document.getElementById('modelYear') as HTMLInputElement).value;
                const variant = (document.getElementById('variant') as HTMLInputElement).value.toUpperCase();
                const modelCodeInput = this.modelCode;

                if (!vinNo || !modelYear || !variant || !modelCodeInput) {
                    Swal.showValidationMessage('All fields are required');
                    return false;
                }

                const data = {
                    modelCode: modelCodeInput,
                    vinNo,
                    modelYear,
                    variant,
                    type: 1,
                    spmc_branch: environment.branch_id, 
                    user_id: atob(atob(localStorage.getItem('us_id') || '{}')),
                };

                return new Promise((resolve) => {
                    this.userServices.createServicePackage(data).subscribe({
                        next: (rData: any) => {
                            if (rData.ret_data === 'success') {
                                resolve(data);
                            } else {
                                Swal.showValidationMessage('Service creation failed. Please try again.');
                            }
                        },
                        error: () => {
                            Swal.showValidationMessage('Something went wrong. Please try again.');
                        },
                    });
                });
            },
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                const msg = `Service request successfully created for model code <b>${result.value.modelCode}</b>`;
                this.coloredToast('success', msg);
            }
        });
    }

    // NormalAndFaceliftshowAlert() {
    //     const isYearVariantSearch = this.searchMode === 'yearVariant';
    //     Swal.fire({
    //         icon: 'info',
    //         html: `
    //         <p class="mb-2">No service package found for
    //             <b>${isYearVariantSearch ? `${this.modelYear} / ${this.variant}` : this.modelCode}</b>.
    //         </p>
    //         <p class="mb-3">Do you want to create a service request?</p>

    //         <div style="display: flex; gap: 1px;">
    //             ${
    //                 isYearVariantSearch
    //                     ? `
    //                 <div style="display: flex; flex-direction: column; width: 30%;">
    //                     <label for="modelCode" style="font-weight: 400; margin-bottom: 2px;"><b>Model Code</b></label>
    //                     <input id="modelCode" class="swal2-input" placeholder="Enter Model Code">
    //                 </div>`
    //                     : ''
    //             }

    //             <div style="display: flex; flex-direction: column; width: 40%;">
    //                 <label for="vinNo" style="font-weight: 400; margin-bottom: 2px;"><b>VIN No</b></label>
    //                 <input id="vinNo" class="swal2-input" style="padding: 3px 3px; text-transform: uppercase;" placeholder="Enter VIN No">
    //             </div>

    //             <div style="display: flex; flex-direction: column; width: 20%;">
    //                 <label for="modelYear" style="font-weight: 400; margin-bottom: 2px;"><b>Model Year</b></label>
    //                 <input id="modelYear" class="swal2-input" style="text-transform: uppercase;" placeholder="Year" value="${this.modelYear || ''}">
    //             </div>

    //             <div style="display: flex; flex-direction: column; width: 40%; ">
    //                 <label for="variant" style="font-weight: 400; margin-bottom: 2px;"><b>Variant</b></label>
    //                 <input id="variant" class="swal2-input"  style="text-transform: uppercase;" placeholder="Enter Variant" value="${this.variant || ''}">
    //             </div>
    //         </div>
    //     `,
    //         width: '1000px',
    //         showCancelButton: true,
    //         confirmButtonText: 'Create Service Request',
    //         cancelButtonText: 'Cancel',
    //         focusConfirm: false,
    //         customClass: 'sweet-alerts',

    //         preConfirm: () => {
    //             const vinNo = (document.getElementById('vinNo') as HTMLInputElement).value.toUpperCase();
    //             const modelYear = (document.getElementById('modelYear') as HTMLInputElement).value;
    //             const variant = (document.getElementById('variant') as HTMLInputElement).value.toUpperCase();
    //             const modelCodeInput = isYearVariantSearch ? (document.getElementById('modelCode') as HTMLInputElement).value : this.modelCode;

    //             if (!vinNo || !modelYear || !variant || !modelCodeInput) {
    //                 Swal.showValidationMessage('All fields are required');
    //                 return false;
    //             }

    //             const data = {
    //                 modelCode: modelCodeInput,
    //                 vinNo,
    //                 modelYear,
    //                 variant,
    //                 type: 3,
    //                 user_id: atob(atob(localStorage.getItem('us_id') || '{}')),
    //             };

    //             return new Promise((resolve) => {
    //                 this.userServices.createServicePackage(data).subscribe({
    //                     next: (rData: any) => {
    //                         if (rData.ret_data === 'success') {
    //                             resolve(data);
    //                         } else {
    //                             Swal.showValidationMessage('Service creation failed. Please try again.');
    //                         }
    //                     },
    //                     error: () => {
    //                         Swal.showValidationMessage('Something went wrong. Please try again.');
    //                     },
    //                 });
    //             });
    //         },
    //     }).then((result) => {
    //         if (result.isConfirmed && result.value) {
    //             const msg = `Service request successfully created for model code <b>${result.value.modelCode}</b>`;
    //             this.coloredToast('success', msg);
    //         }
    //     });
    // }

    onItemCheckedChange(kmId: any, changedItem: any) {
        const changedGroupSeq = changedItem.group_seq;
        const isChecked = changedItem.checked;

        if (changedGroupSeq && changedGroupSeq > 0) {
            // Apply to all items in the same group
            this.servicePackage.forEach((kmGroup: any) => {
                kmGroup.items.forEach((item: any) => {
                    if (item.group_seq === changedGroupSeq) {
                        item.checked = isChecked;
                    }
                });
            });
        } else {
            // Not grouped (group_seq is 0, null, or undefined)
            changedItem.checked = isChecked;
        }

        this.updateTotalSPAmount();
    }

    onKmSelectionChange(kmValue: string) {
        this.selectedKmValue = kmValue;
        // When KM is selected, use display price directly
        const selectedGroup = this.servicePackage.find((group: any) => group.km_value == kmValue);
        this.totalSPAmount = selectedGroup?.display_price || 0;
        this.actualSPAmount = selectedGroup?.actualSPAmount || 0;

        this.servicePackage.forEach((group: any) => {
            group.items.forEach((item: any) => {
                item.checked = true;
            });
        });
    }

    getMaskedName(name: string): string {
        if (!name) return '';
        const visible = name.slice(0, 0);
        const masked = '*'.repeat(Math.max(name.length - 2, 0));
        return visible + masked;
    }

    toggleItemVisibility(itemId: number): void {
        this.visibleItemId = this.visibleItemId === itemId ? null : itemId;
    }

    updateTotalSPAmount(): number {
        const selectedGroup = this.servicePackage.find((group: any) => group.km_value == this.selectedKmValue);
        if (!selectedGroup) {
            this.totalSPAmount = 0;
            return 0;
        }

        const baseDisplayPrice = selectedGroup.display_price || 0;
        const baseActualPrice = selectedGroup.actualSPAmount || 0;

        const uncheckedTotal = selectedGroup.items.reduce((sum: number, item: any) => {
            return !item.checked ? sum + (item.total || 0) : sum;
        }, 0);

        const finalAmount = baseDisplayPrice - uncheckedTotal;
        const actualSPAmount = baseActualPrice - uncheckedTotal;

        this.totalSPAmount = finalAmount >= 0 ? finalAmount : 0;
        this.actualSPAmount = actualSPAmount >= 0 ? actualSPAmount : 0;
        return this.totalSPAmount;
    }

    getTotalDisplayPrice(): number {
        const selectedGroup = this.servicePackage.find((group: any) => group.km_value == this.selectedKmValue);

        const displayPrice = selectedGroup?.display_price || 0;
        this.totalSPAmount = displayPrice;
        return displayPrice;
    }

    getKilometerValue(): string {
        const km = this.kilometers.find((k: any) => k.km_id === this.kilometer);
        return km ? km.km_value : this.kilometer; // fallback if not found
    }

    createFaceliftPackage() {}

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

    /**
     * Opens a SweetAlert modal to prompt the user for a reference number,
     * then proceeds to print the KM Group with the entered reference.
     *
     * @param kmGroup - The KM Group object to be printed.
     */

    openPrintReferenceModal(kmGroup: any) {
        Swal.fire({
            title: 'Enter Reference No',
            input: 'text',
            inputLabel: 'Reference No',
            inputPlaceholder: 'Enter Reference Number',
            showCancelButton: true,
            confirmButtonText: 'Proceed to Print',
            cancelButtonText: 'Cancel',
            inputValidator: (value) => {
                if (!value) {
                    return 'Reference No is required!'; // Validation to ensure reference number is entered
                }
                return null;
            },
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                // If the user confirms and has entered a value, proceed to print
                this.printKmGroup(kmGroup, result.value);
            }
        });
    }

    /**
     * Prepares and opens a print URL with necessary encoded parameters like unchecked items and reference number.
     *
     * @param kmGroup - The KM Group object containing items to check for printing.
     * @param referenceNo - The user-provided reference number for printing.
     */
    printKmGroup(kmGroup: any, referenceNo: string) {
        let type: any;

        // Determine the print type based on user role
        if (['1', '2', '10', '13'].includes(this.user_role)) {
            type = 1; // Admin/Special roles
        } else {
            type = 0; // Regular user roles
        }

        // Arrays to hold IDs of unchecked spare and labour items
        const uncheckedSpareIds: number[] = [];
        const uncheckedLabourIds: number[] = [];

        // Loop through KM Group items to filter out unchecked spares and labours
        kmGroup.items.forEach((item: any) => {
            if (!item.checked) {
                if (item.item_type === 0 && item.sp_spare_id != null) {
                    uncheckedSpareIds.push(item.sp_spare_id);
                }
                if (item.item_type === 1 && item.sp_labour_id != null) {
                    uncheckedLabourIds.push(item.sp_labour_id);
                }
            }
        });

        // Encode the unchecked IDs and reference number for URL transmission
        const spareParam = btoa(btoa(uncheckedSpareIds.join(','))); // Double Base64 encode
        const labourParam = btoa(btoa(uncheckedLabourIds.join(','))); // Double Base64 encode
        const encodedRefNo = btoa(btoa(referenceNo)); // Double Base64 encode reference number
        const encodedus_id = btoa(btoa(this.us_id)); // Double Base64 encode user ID

        // Construct the URL with encoded parameters
        const url = `${environment.base_url}/HTMLPdfController/printServicePackagePDF?id=${btoa(btoa(this.modelId))}&km_id=${btoa(
            btoa(kmGroup.km_id)
        )}&type=${btoa(btoa(type))}&unselected_spare=${spareParam}&unselected_labour=${labourParam}&ref_no=${encodedRefNo}&us_id=${encodedus_id}`;

        // Open the print URL in a new browser tab
        window.open(url, '_blank');
    }

    preventDefault() {
        return false;
    }
}
