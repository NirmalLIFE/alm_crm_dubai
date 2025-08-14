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
    _searchMode: 'modelCode' | 'yearVariant' = 'modelCode';
    modelId: any;

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

        if (this.searchMode === 'modelCode') {
            if (!code) {
                this.coloredToast('danger', 'Model code is required to search for a service package.');
                return;
            }
            this.checkServicePackage(); // Existing flow
        } else {
            if (!year || !varnt) {
                this.coloredToast('danger', 'Please provide both model year and variant to proceed.');
                return;
            }
            this.checkByYearVariant(year, varnt);
        }
    }

    get searchMode(): 'modelCode' | 'yearVariant' {
        return this._searchMode;
    }

    set searchMode(mode: 'modelCode' | 'yearVariant') {
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
            if (rData.ret_data == 'success') {
                if (rData.servicePackage && rData.servicePackage.length > 0) {
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
                                display_price: display_price, // Bind this to input
                                actualSPAmount: groupTotal,
                            };
                        });
                    if (this.servicePackage.length > 0) {
                        this.selectedKmValue = this.servicePackage[0].km_value;
                        this.onKmSelectionChange(this.selectedKmValue);
                    }

                    this.load_flag = false;

                    // console.log('servicePackage>>>>>>>>>>>>>>>>>', this.servicePackage);
                } else if (rData.modelData) {
                    const statusFlag = rData.modelData.spmc_status_flag;
                    const statusMessages: { [key: string]: string } = {
                        '0': 'Waiting for both parts and labour details to be entered.',
                        '1': 'Waiting for labour details to be entered by the Supervisor.',
                        '2': 'Waiting for parts details to be entered by the Parts Advisor.',
                        '3': 'Waiting for KM mapping to be completed by the Admin.',
                        '4': 'Waiting for KM-wise price mapping to be completed by the Admin.',
                    };

                    const message = statusMessages[statusFlag];
                    if (message) {
                        this.showServicePackageInProgressAlert(message);
                    }
                    this.load_flag = false;
                } else {
                    this.load_flag = false;
                    if (this._searchMode == 'modelCode') {
                        this.showAlert();
                    }
                    // this.showAlert();
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
                    <input id="vinNo" class="swal2-input" style="padding: 3px 3px;" placeholder="Enter VIN No">
                </div>

                <div style="display: flex; flex-direction: column; width: 20%;">
                    <label for="modelYear" style="font-weight: 400; margin-bottom: 2px;"><b>Model Year</b></label>
                    <input id="modelYear" class="swal2-input" placeholder="Year" value="${this.modelYear || ''}">
                </div>

                <div style="display: flex; flex-direction: column; width: 40%;">
                    <label for="variant" style="font-weight: 400; margin-bottom: 2px;"><b>Variant</b></label>
                    <input id="variant" class="swal2-input" placeholder="Enter Variant" value="${this.variant || ''}">
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
                const vinNo = (document.getElementById('vinNo') as HTMLInputElement).value;
                const modelYear = (document.getElementById('modelYear') as HTMLInputElement).value;
                const variant = (document.getElementById('variant') as HTMLInputElement).value;
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

    // showAlert() {
    //     Swal.fire({
    //         icon: 'info',
    //         html: `
    //          <p class="mb-2">No service package found for <b>${this.modelCode}</b>.</p>
    //          <p class="mb-3">Do you want to create a service request for <b>${this.modelCode}</b> ?</p>
    //         <div style="display: flex; gap: 5px; justify-content: center;">
    //             <div style="display: flex; flex-direction: column; width: 33%;">
    //                 <label for="vinNo" style="font-weight: 400; margin-bottom: 2px;"><b>VIN No</b></label>
    //                 <input id="vinNo" class="swal2-input" placeholder="Enter VIN No">
    //             </div>
    //             <div style="display: flex; flex-direction: column; width: 33%;">
    //                 <label for="modelYear" style="font-weight: 400; margin-bottom: 2px;"><b>Model Year</b></label>
    //                 <input id="modelYear" class="swal2-input" placeholder="Enter Model Year">
    //             </div>
    //             <div style="display: flex; flex-direction: column; width: 33%;">
    //                 <label for="variant" style="font-weight: 400; margin-bottom: 2px;"><b>Variant</b></label>
    //                 <input id="variant" class="swal2-input" placeholder="Enter Variant">
    //             </div>
    //         </div>
    //     `,
    //         width: '1000px',
    //         showCancelButton: true,
    //         confirmButtonText: 'Create Service Request',
    //         cancelButtonText: 'Cancel',
    //         focusConfirm: false,
    //         customClass: 'sweet-alerts',

    //         // ✅ Handle validation + API call here
    //         preConfirm: () => {
    //             const vinNo = (document.getElementById('vinNo') as HTMLInputElement).value;
    //             const modelYear = (document.getElementById('modelYear') as HTMLInputElement).value;
    //             const variant = (document.getElementById('variant') as HTMLInputElement).value;

    //             if (!vinNo || !modelYear || !variant) {
    //                 Swal.showValidationMessage('All fields are required');
    //                 return false;
    //             }

    //             const data = {
    //                 modelCode: this.modelCode,
    //                 // kilometer: this.kilometer,
    //                 vinNo: vinNo,
    //                 modelYear: modelYear,
    //                 variant: variant,
    //                 user_id: atob(atob(localStorage.getItem('us_id') || '{}')),
    //             };

    //             return new Promise((resolve) => {
    //                 this.userServices.createServicePackage(data).subscribe({
    //                     next: (rData: any) => {
    //                         if (rData.ret_data === 'success') {
    //                             resolve(data); // ✅ Close modal
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
    //             const msg = `Service request has been successfully created for model code <b>${this.modelCode}</b>`;
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
