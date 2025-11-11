import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment.prod';

@Component({
    selector: 'app-service-pkg-km-setup',
    templateUrl: './service-pkg-km-setup.component.html',
    styleUrls: ['./service-pkg-km-setup.component.css'],
})
export class ServicePkgKmSetupComponent implements OnInit {
    public model_code: any = atob(this.activeRouter.snapshot.paramMap.get('id') || '');
    public model_code_type: any = atob(this.activeRouter.snapshot.paramMap.get('type') || '');
    public engines: any = [];
    public engineNO: any;
    public kilometers: any = [];
    public spareAndLabourList: any = [];
    public load_flag: boolean = true;
    public vin_no: any;
    public variant: any;
    public model_year: any;
    public requestedServicePackage: any;
    public labourFactor: any;
    public saveFlag: boolean = false;
    public draftButtonFlag: boolean = false;
    public finalItems: any = [];
    public currentEngineNo: any;
    public spStatus: any;
    allChecked = false;

    limit = 8;
    offset = 0;
    loading = false;
    allLoaded = false;

    @ViewChild('KmMappingModal') KmMappingModal: any;

    constructor(public router: Router, private userServices: StaffPostAuthService, public datePipe: DatePipe, private activeRouter: ActivatedRoute) {
        this.model_code = atob(this.activeRouter.snapshot.paramMap.get('id') || '');

        let data = {
            modelCode: atob(this.activeRouter.snapshot.paramMap.get('id') || ''),
            type: atob(this.activeRouter.snapshot.paramMap.get('type') || ''),
        };

        this.userServices.getServicePackageByModelCode(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                const matched = rdata.requestedServicePackage;

                this.requestedServicePackage = matched.length > 0 ? matched[matched.length - 1] : null;

                this.vin_no = this.requestedServicePackage.spmc_vin_no;
                this.variant = this.requestedServicePackage.spmc_variant;
                this.model_year = this.requestedServicePackage.spmc_model_year;
                if (this.requestedServicePackage.spmc_draft_flag == '0') {
                    this.spStatus = this.requestedServicePackage.spmc_status_flag == '3' ? 4 : this.requestedServicePackage.spmc_status_flag;
                } else {
                    this.spStatus = this.requestedServicePackage.spmc_status_flag;
                }

                if (this.requestedServicePackage.spmc_status_flag == '5') {
                    this.spStatus = 5;
                }
            }
        });

        // this.userServices.getServicePackageRequested().subscribe((rdata: any) => {
        //     if (rdata.ret_data == 'success') {
        //         const matched = rdata.requestedServicePackage
        //             .filter((item: any) => item.spmc_value === this.model_code)
        //             .sort((a: any, b: any) => b.spmc_id - a.spmc_id);

        //         this.requestedServicePackage = matched.length > 0 ? matched[matched.length - 1] : null;

        //         this.vin_no = this.requestedServicePackage.spmc_vin_no;
        //         this.variant = this.requestedServicePackage.spmc_variant;
        //         this.model_year = this.requestedServicePackage.spmc_model_year;
        //         if (this.requestedServicePackage.spmc_draft_flag == '0') {
        //             this.spStatus = this.requestedServicePackage.spmc_status_flag == '3' ? 4 : this.requestedServicePackage.spmc_status_flag;
        //         } else {
        //             this.spStatus = this.requestedServicePackage.spmc_status_flag;
        //         }

        //         if (this.requestedServicePackage.spmc_status_flag == '5') {
        //             this.spStatus = 5;
        //         }
        //     }
        // });
        this.userServices.getEngineNo().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.engines = rdata.engineNo;
            }
        });

        this.userServices.getSPkilometer().subscribe((rdata: any) => {
            this.kilometers = rdata.kmData;
            this.kilometers = this.kilometers.map((km: any) => ({
                ...km,
                km_id: +km.km_id,
                label: km.km_id == '1' ? 'Quick Lube' : +km.km_value / 1000 + 'K',
                columnAllowed: 0,
                km_optionalflag: 0,
            }));
            this.getDatas();
        });

        // this.cols = [
        //     { prop: 'name', name: 'Parts & Labour' },
        //     { prop: 'price', name: 'Price' },
        //     ...this.kilometers.map((km: any) => ({
        //         name: `${km.km_value / 1000}K KM`,
        //         prop: km.km_id,
        //         cellTemplate: this.checkboxTemplate,
        //     })),
        // ];
    }

    ngOnInit() {}

    onScroll(event: any) {
        const el = event.target as HTMLElement;

        // Use a small buffer or Math.ceil to avoid fractions
        const buffer = 2; // or 5
        if (Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight - buffer) {
            if (!this.loading) {
                this.checkEngineHasSameSPItems();
            }
        }
    }

    getDatas() {
        this.userServices.getESLByModelCode({ model_code: this.model_code, spmc_type: this.model_code_type }).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.engineNO = rdata.engData.speng_eng_id;

                // this.spareAndLabourList = rdata.spareAndLabourData;

                // if (this.engineNO) {
                //     const engine = this.engines.find((e: any) => e.eng_id == this.engineNO);
                //     if (engine) {
                //         this.labourFactor = engine.eng_labour_factor;
                //     } else {
                //         this.labourFactor = 2.5; // or set a default value
                //     }
                // }

                const data = rdata.spareAndLabourData;
                this.labourFactor = data.labourFactor;

                this.spareAndLabourList = {
                    user_id: atob(atob(localStorage.getItem('us_id') || '{}')),
                    model_code: this.model_code,
                    items: [
                        ...data.spares.map((s: any) => {
                            const price = Number(s.pm_price) || 0;
                            const qty = Number(s.sp_spare_qty) || 0;

                            return {
                                name: s.pm_name?.trim() || '',
                                price: price * qty + s.sp_spare_labour_unit * this.labourFactor,
                                qty,
                                total: price * qty + s.sp_spare_labour_unit * this.labourFactor,
                                type: '0',
                                sp_spare_labour_unit: s.sp_spare_labour_unit,
                                item_id: s.sp_spare_id,
                                optional_flag: s.sp_spare_optional_flag == '1' ? 1 : s.sp_spare_optional_flag == null ? 0 : 1,
                                group_seq: s.sp_spare_group_seq != null ? s.sp_spare_group_seq : 0,
                                rowKmAllowed: 0,
                                row_optionalflag: 0,
                                km_options: [],
                            };
                        }),

                        ...data.labours.map((l: any) => {
                            const unit = Number(l.sp_labour_unit) || 0;
                            const qty = Number(l.sp_labour_qty) || 0;
                            const category = String(l.sp_pm_category);
                            const basePrice = Number(l.pm_price) || 0;

                            const labourCost = (this.labourFactor || 0) * unit;
                            const partCost = basePrice * qty;

                            const price = labourCost;

                            return {
                                name: l.sp_pm_name?.trim() || '',
                                price: price,
                                lm_unit: unit,
                                total: price,
                                type: '1',
                                item_id: l.sp_labour_id,
                                optional_flag: l.sp_labour_optional_flag == '1' ? 1 : l.sp_labour_optional_flag == null ? 0 : 1,
                                group_seq: l.sp_labour_group_seq != null ? l.sp_labour_group_seq : 0,
                                rowKmAllowed: 0,
                                row_optionalflag: 0,
                                km_options: [],
                            };
                        }),
                    ],
                };

                // this.spareAndLabourList.items = this.spareAndLabourList.items.map((item: any) => ({
                //     ...item,
                //     selectedKmIds: [], // Allow multiple selections
                // }));
                const allOptionalKmIds: number[] = [];

                this.spareAndLabourList.items = this.spareAndLabourList.items.map((item: any) => {
                    let matched;

                    if (item.type === '0') {
                        matched = data.spares.find((x: any) => x.sp_spare_id === item.item_id);
                    } else if (item.type === '1') {
                        matched = data.labours.find((x: any) => x.sp_labour_id === item.item_id);
                    }
                    const opKm = matched?.selected_km_ids;
                    const selectedKmIds = matched?.selected_km_ids?.map((k: any) => k.km_id) || [];
                    const kmOptions =
                        matched?.selected_km_ids?.filter((k: any) => k.optional_flag === '1' || k.optional_flag === 1).map((k: any) => k.km_id) || [];

                    const spkm_km_optional_flag: Record<number, 0 | 1> = {};
                    opKm.forEach((k: any) => {
                        spkm_km_optional_flag[k.km_id] = k.optional_flag == '1' || k.optional_flag === 1 ? 1 : 0;
                    });

                    // Collect optional_flag == 1 km_ids
                    allOptionalKmIds.push(...kmOptions);

                    return {
                        ...item,
                        selectedKmIds: [...selectedKmIds],
                        customerSelectedKmIds: [...kmOptions],
                        km_options: opKm,
                        spkm_km_optional_flag,
                    };
                });

                // Get unique km_ids where optional_flag == 1
                const uniqueOptionalKmIds = [...new Set(allOptionalKmIds)];

                // ✅ Update this.kilometers in-place
                this.kilometers = this.kilometers.map((km: any) => ({
                    ...km,
                    columnAllowed: uniqueOptionalKmIds.includes(km.km_id) ? 1 : 0,
                }));

                this.spareAndLabourList.items.sort((a: any, b: any) => {
                    const aSeq = a.group_seq ?? '0';
                    const bSeq = b.group_seq ?? '0';

                    // Push items with group_seq == 0 to the end
                    if (aSeq == '0' && bSeq != '0') return 1;
                    if (aSeq != '0' && bSeq == '0') return -1;

                    // Both are either grouped or both ungrouped — sort normally
                    return aSeq - bSeq;
                });

                // console.log('spare and labour list>>>>>>554>>>>>>>', this.spareAndLabourList);

                this.load_flag = false;

                // if (this.sparePartsList.length > 0) {
                //     this.service_details.parts = this.sparePartsList.map((part) => ({
                //         PART_NO: part.pm_code || null,
                //         DESCRIPTION: part.pm_name || null,
                //         Brand: part.brand_name || null,
                //         qty: part.sp_spare_qty || 0,
                //         PRICE: part.pm_price || 0,
                //         id: part.pm_id || null,
                //     }));
                //     this.getTotalServicePrice();
                // }
                const found = this.engines.find((e: any) => e.eng_id == this.engineNO);
                this.currentEngineNo = found ? found.eng_no : '';

                this.spareAndLabourList.selectedKmIds = this.spareAndLabourList.items
                    .flatMap((item: any) => item.selectedKmIds || [])
                    .filter((id: any, index: any, arr: any) => arr.indexOf(id) === index);

                if (!this.spareAndLabourList.selectedKmIds?.length) {
                    this.checkEngineHasSameSPItems();
                }
            }
        });
    }

    checkEngineHasSameSPItems() {
        if (this.loading || this.allLoaded) return;

        this.loading = true;

        let data = {
            eng_id: this.engineNO,
            items: this.spareAndLabourList.items,
            limit: this.limit,
            offset: this.offset,
        };

        this.userServices.checkEngineHasSameSPItems(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                if (rdata.matches.length < this.limit) {
                    this.allLoaded = true; // No more data
                }
                this.finalItems = [...this.finalItems, ...rdata.matches];
                this.KmMappingModal.open();
                this.offset = this.offset + rdata.matches.length;
                this.loading = false;
                // console.log('Final spareAndLabourList', this.spareAndLabourList);
            } else {
                this.loading = false;
            }
        });
    }

    isAllKmChecked(data: any): boolean {
        if (!data.selectedKmIds || data.selectedKmIds.length === 0) return false;

        const filteredKmIds = this.kilometers.filter((k: any) => k.km_id !== 1).map((k: any) => k.km_id);

        return filteredKmIds.every((kmId: any) => data.selectedKmIds.includes(kmId));
    }

    toggleAllKmsForItem(data: any, event: any): void {
        const isChecked = event.target.checked;
        const groupSeq = +data.group_seq;

        // Get all KM IDs excluding Quick Lube (km_id === 1)
        const filteredKmIds = this.kilometers.filter((k: any) => k.km_id !== 1).map((k: any) => k.km_id);

        // Visually enable all columns if checked
        if (isChecked) {
            this.kilometers.forEach((k: any) => {
                if (k.km_id !== 1) k.columnAllowed = 1;
            });
        }

        // GROUPED ITEMS
        if (groupSeq > 0) {
            const groupItems = this.spareAndLabourList.items.filter((item: any) => +item.group_seq === groupSeq);

            groupItems.forEach((item: any) => {
                item.selectedKmIds = isChecked ? [...filteredKmIds] : [];

                // Set check-all flag per item for UI sync
                item.isCheckAll = isChecked;
            });
        }

        // NON-GROUPED ITEM
        if (groupSeq === 0) {
            data.selectedKmIds = isChecked ? [...filteredKmIds] : [];

            // Update only this item's check all
            data.isCheckAll = isChecked;
        }

        // FINAL: Recalculate allowed columns based on selections
        this.kilometers.forEach((km: any) => {
            if (km.km_id === 1) return;

            const isUsed = this.spareAndLabourList.items.some((item: any) => item.selectedKmIds?.includes(km.km_id));

            km.columnAllowed = isUsed ? 1 : 0;
        });
    }

    copyKmMappingServiceDetails(KmMapping: any) {
        const allOptionalKmIds: string[] = [];

        this.spareAndLabourList.items = this.spareAndLabourList.items.map((item: any) => {
            const type = item.type;
            const itemId = item.item_id;

            // Find matching item from finalItems
            const matched = KmMapping.items.find((fi: any) => fi.type === type && fi.item_id === itemId);

            if (matched) {
                const selectedKmIds: number[] = (matched.selectedKmIds || []).map((id: any) => Number(id));
                const customerSelectedKmIds: number[] = (matched.customerSelectedKmIds || []).map((k: any) => Number(k));
                const spkm_km_optional_flag: { [key: string]: number } = matched.spkm_km_optional_flag || {};

                // Build km_options array
                const km_options: { km_id: string | number; optional_flag: number }[] = selectedKmIds.map((kmId) => ({
                    km_id: kmId,
                    optional_flag: spkm_km_optional_flag[kmId] ?? 0,
                }));

                // Collect optional km ids to control UI visibility
                allOptionalKmIds.push(...customerSelectedKmIds.map((km) => km.toString()));

                return {
                    ...item,
                    selectedKmIds,
                    customerSelectedKmIds,
                    spkm_km_optional_flag,
                    km_options,
                };
            }

            return item; // No matching backend item
        });

        // ✅ Set `columnAllowed` on kilometers
        const uniqueOptionalKmIds = [...new Set(allOptionalKmIds)];
        this.kilometers = this.kilometers.map((km: any) => ({
            ...km,
            columnAllowed: uniqueOptionalKmIds.includes(km.km_id.toString()) ? 1 : 0,
        }));

        this.KmMappingModal.close();
    }

    onKmCheckboxChange(data: any, kmId: number, event: Event) {
        const checked = (event.target as HTMLInputElement).checked;
        const id = +kmId;
        const groupSeq = +data.group_seq;

        const kmIndex = this.kilometers.findIndex((k: any) => k.km_id === id);
        if (kmIndex === -1) return;

        if (!data.selectedKmIds) data.selectedKmIds = [];

        // Row-level checkbox logic
        if (groupSeq === 0 || id === 1) {
            if (checked) {
                if (!data.selectedKmIds.includes(id)) {
                    data.selectedKmIds.push(id);
                }
                data.rowKmAllowed = 1;
                this.kilometers[kmIndex].columnAllowed = 1;
            } else {
                data.selectedKmIds = data.selectedKmIds.filter((kid: any) => kid !== id);
                data.rowKmAllowed = 0;

                const stillUsed = this.spareAndLabourList.items.some((it: any) => it.selectedKmIds?.includes(id));
                if (!stillUsed) {
                    this.kilometers[kmIndex].columnAllowed = 0;
                    this.kilometers[kmIndex].km_optionalflag = 0;
                } else {
                    this.kilometers[kmIndex].km_optionalflag = 1;
                }
            }
            return;
        }

        // Group-level checkbox logic
        this.spareAndLabourList.items.forEach((item: any) => {
            if (item.group_seq == groupSeq) {
                if (!item.selectedKmIds) item.selectedKmIds = [];

                if (checked) {
                    if (!item.selectedKmIds.includes(id)) {
                        item.selectedKmIds.push(id);
                    }
                    item.rowKmAllowed = 1;
                    this.kilometers[kmIndex].columnAllowed = 1;
                } else {
                    item.selectedKmIds = item.selectedKmIds.filter((kid: any) => kid !== id);
                    item.rowKmAllowed = 0;
                }
            }
        });

        this.kilometers.forEach((km: any) => {
            if (km.km_id == '1') return; // ✅ skip Quick Lube completely

            const isUsed = this.spareAndLabourList.items.some((item: any) => item.selectedKmIds?.includes(km.km_id));

            km.columnAllowed = isUsed ? 1 : 0;
            km.km_optionalflag = isUsed ? 1 : 0;
        });
    }

    onCustomerKmCheckboxChange(data: any, changedKm: any, event: Event) {
        const checked = (event.target as HTMLInputElement).checked;
        const kmId = changedKm.km_id;
        const groupSeq = data.group_seq;

        // 1) Always toggle the clicked row’s own flag:
        data.spkm_km_optional_flag[kmId] = checked ? 1 : 0;
        if (checked) {
            if (!data.customerSelectedKmIds.includes(kmId)) {
                data.customerSelectedKmIds.push(kmId);
            }
        } else {
            data.customerSelectedKmIds = data.customerSelectedKmIds.filter((id: number) => id !== kmId);
        }
        data.km_options = Object.entries(data.spkm_km_optional_flag).map(([id, flag]) => ({
            km_id: +id,
            optional_flag: flag as 0 | 1,
        }));

        // 2) If it’s the Quick Lube checkbox, stop here:
        if (kmId == 1 || groupSeq == 0) {
            return;
        }

        // 3) Otherwise, apply the same toggle to all other items in this item‐group:
        this.spareAndLabourList.items
            .filter((item: any) => item.group_seq === groupSeq)
            .forEach((item: any) => {
                if (!item.selectedKmIds.includes(kmId)) return;

                item.spkm_km_optional_flag[kmId] = checked ? 1 : 0;

                if (checked) {
                    if (!item.customerSelectedKmIds.includes(kmId)) {
                        item.customerSelectedKmIds.push(kmId);
                    }
                } else {
                    item.customerSelectedKmIds = item.customerSelectedKmIds.filter((id: number) => id !== kmId);
                }

                item.km_options = Object.entries(item.spkm_km_optional_flag).map(([id, flag]) => ({
                    km_id: +id,
                    optional_flag: flag as 0 | 1,
                }));
            });
    }

    saveServicePackageKm(type: number) {
        if (type == 1) {
            this.draftButtonFlag = true;
            this.saveFlag = false;
            this.spareAndLabourList.draft_flag = 1;
            this.spareAndLabourList.spmc_status_flag = 3;
            this.spareAndLabourList.model_code_type = this.model_code_type;
            this.spareAndLabourList.branch_id = environment.branch_id;
        } else {
            this.draftButtonFlag = false;
            this.saveFlag = true;
            this.spareAndLabourList.draft_flag = 0;
            this.spareAndLabourList.model_code_type = this.model_code_type;
            if (this.spStatus != 5) {
                this.spareAndLabourList.spmc_status_flag = 4;
            } else {
                this.spareAndLabourList.spmc_status_flag = 5;
            }
            const anySelected = this.spareAndLabourList.items.some((item: any) => item.selectedKmIds && item.selectedKmIds.length > 0);
            if (!anySelected) {
                this.coloredToast('danger', 'Please select at least one KM for any part.');
                this.saveFlag = false;
                return;
            }
        }

        this.userServices.saveSPKM({ spareAndLabourKMMapped: this.spareAndLabourList }).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                const encodedModel = btoa(this.model_code);
                const encodedModelType = btoa(this.model_code_type);

                if (type == 1) {
                    this.router.navigateByUrl('servicePackageRequested');
                    this.draftButtonFlag = false;
                    this.saveFlag = false;
                    this.coloredToast('info', 'Service package item KMs have been saved as draft.');
                } else {
                    this.router.navigate(['servicePackageKmPriceMap', encodedModel, encodedModelType]);
                    // this.router.navigateByUrl('servicePackageKmPriceMap');
                    this.saveFlag = false;
                    this.coloredToast('success', 'Service package KMs have been added.');
                }
            } else {
                this.saveFlag = false;
                this.coloredToast('danger', 'An error occurred. Please try again later.');
            }
        });
    }

    updateOptionalFlag(data: any, event: Event): void {
        const isChecked = (event.target as HTMLInputElement).checked;
        const newFlag = isChecked ? 1 : 0;

        const groupSeq = data.group_seq;

        if (groupSeq && groupSeq != '0') {
            // Update all items with same group_seq
            this.spareAndLabourList.items.forEach((item: any) => {
                if (item.group_seq === groupSeq) {
                    item.optional_flag = newFlag;
                }
            });
        } else {
            // Not grouped, just update the clicked item
            data.optional_flag = newFlag;
        }

        // Optionally save to server here
    }

    // updateOptionalFlag(data: any, event: Event): void {
    //     const isChecked = (event.target as HTMLInputElement).checked;
    //     data.optional_flag = isChecked ? 1 : 0;

    //     // Optionally save to server here
    // }

    // getTotalPriceForKm(kmId: number): number {
    //     let total = 0;
    //     for (let item of this.spareAndLabourList.items) {
    //         if (item.selectedKmIds?.includes(kmId)) {
    //             total += item.price || 0;
    //         }
    //     }
    //     return total;
    // }

    // onDisplayPriceChange(km: any) {
    //     // Example: Save or validate display price for a KM entry
    //     console.log('Updated Display Price:', km);
    //     // Optionally call an API or update local state
    // }

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
    goBack() {
        const model_code = atob(this.activeRouter.snapshot.paramMap.get('id') || '');
        this.router.navigate(['/servicePackageLabour', btoa(model_code), btoa(this.model_code_type)]);
    }
}
