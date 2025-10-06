import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-service-pkg-km-price-map',
    templateUrl: './service-pkg-km-price-map.component.html',
    styleUrls: ['./service-pkg-km-price-map.component.css'],
})
export class ServicePkgKmPriceMapComponent implements OnInit {
    public model_code: string;
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
    public kmPriceMap: any = [];
    public user_id: any = atob(atob(localStorage.getItem('us_id') || '{}'));
    public enginePartsList: any[] = [];
    public kmPriceMapFromServer: any[] = [];
    public variablePrice: any[] = [];
    allChecked = false;

    @ViewChild('copyPriceModal') copyPriceModal: any;

    constructor(public router: Router, private userServices: StaffPostAuthService, public datePipe: DatePipe, private activeRouter: ActivatedRoute) {
        this.model_code = atob(this.activeRouter.snapshot.paramMap.get('id') || '');

        let data = {
            modelCode: atob(this.activeRouter.snapshot.paramMap.get('id') || ''),
        };

        this.userServices.getServicePackageByModelCode(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                const matched = rdata.requestedServicePackage;

                this.requestedServicePackage = matched.length > 0 ? matched[matched.length - 1] : null;

                this.vin_no = this.requestedServicePackage.spmc_vin_no;
                this.variant = this.requestedServicePackage.spmc_variant;
                this.model_year = this.requestedServicePackage.spmc_model_year;
                this.getServicePackagebyKm();
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
        //         this.getServicePackagebyKm();
        //     }
        // });
        this.userServices.getEngineNo().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.engines = rdata.engineNo;
            }
        });

        this.userServices.getSPkilometer().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.kilometers = rdata.kmData;
                this.kilometers = this.kilometers.map((km: any) => ({
                    ...km,
                    km_id: +km.km_id, // ensure numeric ID
                    label: +km.km_id == 1 ? 'Quick Lube' : +km.km_value / 1000 + 'K',
                }));

                // console.log('model code and engine no are>>in admin page>>>>>>', this.kilometers);
            }
        });
    }

    ngOnInit() {
        // this.getServicePackagebyKm();
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                // User is navigating away — unlock
                this.updateSPSessionLock(this.model_code);
            }
        });
    }

    @ViewChild('scrollContainer') private scrollContainer!: ElementRef<HTMLDivElement>;
    // Keep your scroll function as is
    private scrollToBottom(): void {
        try {
            this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        } catch (err) {
            // console.error('Scroll error:', err);
        }
    }

    getServicePackagebyKm() {
        this.userServices.getSPByKm({ model_id: this.requestedServicePackage.spmc_id }).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.engineNO = rdata.engData.speng_eng_id;
                // this.spareAndLabourList = rdata.spareAndLabourData;

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
                                optional_flag: s.sp_spare_optional_flag,
                                selectedKmIds: (s.kilometer_data || []).map((k: any) => k.km_id),
                                optional_kmIds: (s.kilometer_data || []).filter((k: any) => k.optional_flag === 1).map((k: any) => k.km_id),
                                group_seq: s.sp_spare_group_seq != null ? s.sp_spare_group_seq : 0,
                            };
                        }),
                        ...data.labours.map((l: any) => {
                            const unit = Number(l.sp_labour_unit) || 0;
                            const qty = Number(l.sp_labour_qty) || 0;
                            const category = String(l.sp_pm_category);
                            const basePrice = Number(l.pm_price) || 0;

                            const labourCost = (this.labourFactor || 0) * unit;
                            const partCost = qty * basePrice;

                            const price = category === '1' ? partCost + labourCost : labourCost;

                            return {
                                name: l.sp_pm_name?.trim() || '',
                                price: price,
                                lm_unit: unit,
                                total: price,
                                type: '1',
                                item_id: l.sp_labour_id,
                                optional_flag: l.sp_labour_optional_flag ?? 1,
                                selectedKmIds: (l.kilometer_data || []).map((k: any) => k.km_id),
                                optional_kmIds: (l.kilometer_data || []).filter((k: any) => k.optional_flag === 1).map((k: any) => k.km_id),
                                group_seq: l.sp_labour_group_seq != null ? l.sp_labour_group_seq : 0,
                            };
                        }),
                    ],
                };

                this.spareAndLabourList.items.sort((a: any, b: any) => {
                    const aSeq = a.group_seq ?? '0';
                    const bSeq = b.group_seq ?? '0';

                    // Push items with group_seq == 0 to the end
                    if (aSeq == '0' && bSeq != '0') return 1;
                    if (aSeq != '0' && bSeq == '0') return -1;

                    // Both are either grouped or both ungrouped — sort normally
                    return aSeq - bSeq;
                });

                const kmPriceMapFromServer = rdata.spareAndLabourData.kmPiceMap || [];

                if (kmPriceMapFromServer.length > 0) {
                    const km_price_map = [];
                    for (const km of this.kilometers) {
                        const priceEntry = kmPriceMapFromServer.find((p: any) => +p.spkmp_spkm_id === +km.km_id);

                        if (priceEntry) {
                            // Update your local km object
                            const markup_price = parseFloat(priceEntry.spkmp_markup_price) || 0;
                            const display_price = parseFloat(priceEntry.spkmp_display_price) || 0;

                            // Store into km object (if needed)
                            km.markup_price = markup_price;
                            km.display_price = display_price;

                            // Compute variable price
                            const totalPrice = this.getTotalPriceForKm(km.km_id) || 0;
                            const variable = +(totalPrice + markup_price - display_price).toFixed(2);
                            km.variable_price = Math.round(variable * 100) / 100;

                            // Push to final map
                            km_price_map.push({
                                km_id: km.km_id,
                                markup_price,
                                display_price,
                                variable_price: Math.round(variable * 100) / 100,
                                variable_checked: false,
                            });
                        }
                    }

                    // Final object structure
                    this.kmPriceMap = {
                        model_id: this.requestedServicePackage?.spmc_id || null,
                        user_id: this.user_id,
                        km_price_map: km_price_map,
                    };
                }
                this.load_flag = false;

                // Scroll to bottom **after DOM updates**
                setTimeout(() => {
                    this.scrollToBottom();
                }, 0);

                if (!rdata.spareAndLabourData.kmPiceMap?.length) {
                    this.getPricesForEngNo(this.engineNO, this.requestedServicePackage.spmc_id);
                }
            }
        });
    }

    getPricesForEngNo(engineNO: any, spmc_id: any) {
        let data = {
            engineNO: this.engineNO,
            model_id: spmc_id,
        };

        this.userServices.getPricesForEngNo(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.enginePartsList = rdata.matched_models;
                this.kmPriceMapFromServer = rdata.prices || [];
                this.copyPriceModal.open();
            } else {
            }
        });
    }

    getSelectedEngineNo(): string | undefined {
        const selected = this.engines.find((engine: any) => engine.eng_id == this.engineNO);
        return selected?.eng_no;
    }

    copyPricetoKm(parts: any) {
        if (this.kmPriceMapFromServer.length > 0) {
            const km_price_map = [];
            for (const km of this.kilometers) {
                const priceEntry = this.kmPriceMapFromServer.find((p: any) => +p.spkmp_spkm_id === +km.km_id && +p.spkmp_spmc_id === +parts.id);

                if (priceEntry) {
                    // Update your local km object
                    const markup_price = parseFloat(priceEntry.spkmp_markup_price) || 0;
                    const display_price = parseFloat(priceEntry.spkmp_display_price) || 0;

                    // Store into km object (if needed)
                    km.markup_price = markup_price;
                    km.display_price = display_price;

                    // Compute variable price
                    const totalPrice = this.getTotalPriceForKm(km.km_id) || 0;
                    const variable = totalPrice + markup_price - display_price;
                    km.variable_price = Math.round(variable * 100) / 100;

                    // Push to final map
                    km_price_map.push({
                        km_id: km.km_id,
                        markup_price,
                        display_price,
                        variable_price: Math.round(variable * 100) / 100,
                        variable_checked: false,
                    });

                    // Assign to km directly 👇
                    km.variable_price = Math.round(variable * 100) / 100;
                    km.variable_checked = false;
                }
            }

            // Final object structure
            this.kmPriceMap = {
                model_id: this.requestedServicePackage?.spmc_id || null,
                user_id: this.user_id,
                km_price_map: km_price_map,
            };

            this.variablePrice = this.copyPriceModal.close();
        }
    }

    toggleAllVariableChecks(event: any): void {
        this.allChecked = event.target.checked;

        for (let km of this.selectedKilometers) {
            if (km.variable_price) {
                km.variable_checked = this.allChecked;
                this.onVariableCheckboxChange(km);
            }
        }
    }

    hasAnyVariablePrice(): boolean {
        return this.selectedKilometers?.some((km: any) => km.variable_price);
    }

    get selectedKilometers() {
        const selectedKmSet = new Set<number>();

        // Go through each part/labour item and collect their selected KM IDs
        for (const item of this.spareAndLabourList.items || []) {
            (item.selectedKmIds || []).forEach((id: number) => selectedKmSet.add(id));
        }

        // Return only the KM entries from kilometers[] that are selected
        return this.kilometers.filter((km: any) => selectedKmSet.has(km.km_id));
    }

    setKmPricesFromMap(kmPriceMap: any[]) {
        for (const priceEntry of kmPriceMap) {
            const km = this.kilometers.find((k: any) => k.km_id == priceEntry.spkmp_spkm_id);
            if (km) {
                km.markup_price = parseFloat(priceEntry.spkmp_markup_price) || 0;
                km.display_price = parseFloat(priceEntry.spkmp_display_price) || 0;
            }
        }
    }

    saveServicePackageKmPriceMap() {
        if (this.saveFlag == true) return;
        this.saveFlag = true;

        // console.log('this is the kmPriceMap', this.kmPriceMap);

        if (this.kmPriceMap.length == 0) {
            this.coloredToast('danger', 'Please enter display prices for all selected KMs before saving.');
            this.saveFlag = false;
            return;
        }

        const allDisplayPricesSet = this.kmPriceMap.km_price_map.every((item: any) => Number(item.display_price) > 0);

        if (!allDisplayPricesSet) {
            this.coloredToast('danger', 'Please enter display prices for all selected KMs before saving.');
            this.saveFlag = false;
            return;
        }

        // this.saveFlag = false;
        console.log('this is kmprice map', this.kmPriceMap);
        this.userServices.saveServicePackageKmPriceMap(this.kmPriceMap).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.router.navigateByUrl('servicePackageRequested');
                this.saveFlag = false;
                this.coloredToast('success', 'Service package KM prices have been saved successfully.');
            } else {
                this.saveFlag = false;
                this.coloredToast('danger', 'Failed to save. Please try again later.');
            }
        });
    }

    getTotalPriceForKm(kmId: number): number {
        let total = 0;
        for (let item of this.spareAndLabourList.items) {
            if (item.selectedKmIds?.includes(kmId)) {
                total += item.price || 0;
            }
        }
        return total;
    }

    getVariablePriceForKm(km: any): number {
        const total = this.getTotalPriceForKm(km.km_id) || 0;
        const markup = +km.markup_price || 0;
        const display = +km.display_price || 0;

        const diff = total + markup - display;
        return diff;
    }

    shouldShowVariablePriceCheckbox(km: any): boolean {
        const total = this.getTotalPriceForKm(km.km_id) || 0;
        const markup = +km.markup_price || 0;
        const display = +km.display_price || 0;

        const expected = total + markup;
        const epsilon = 0.001; // Tolerance for floating point error

        return Math.abs(display - expected) > epsilon;
    }

    onVariableCheckboxChange(km: any): void {
        const total = this.getTotalPriceForKm(km.km_id) || 0;
        const markup = +km.markup_price || 0;

        // Store original display only once
        if (km._original_display === undefined) {
            km._original_display = +km.display_price || 0;
        }

        // Calculate variable price correctly (same formula as copyPricetoKm)
        const variable = total + markup - km._original_display;
        km.variable_price = Math.round(variable * 100) / 100;

        if (km.variable_checked) {
            // Apply the variable discount
            km.display_price = +(km._original_display + km.variable_price).toFixed(2);
            this.onDisplayPriceChange(km, 'display');
        } else {
            // Restore original display
            km.display_price = km._original_display;
            this.onDisplayPriceChange(km, 'display');
        }

        // console.log('Checked:', km.variable_checked);
        // console.log('Display price:', km.display_price);
        // console.log('Variable price:', km.variable_price);
    }

    onDisplayPriceChange(km: any, field: 'markup' | 'display') {
        if (field === 'markup') {
            const totalPrice = this.getTotalPriceForKm(km.km_id);
            const markup = +km.markup_price || 0;
            // Round display price to 2 decimal places
            km.display_price = +(totalPrice + markup).toFixed(2);
        }

        const km_price_map = [];

        for (const kmEntry of this.kilometers) {
            const kmId = kmEntry.km_id;

            const isSelected = this.spareAndLabourList.items.some((item: any) => item.selectedKmIds?.includes(kmId));

            if (isSelected) {
                km_price_map.push({
                    km_id: kmId,
                    markup_price: +kmEntry.markup_price || 0,
                    display_price: +kmEntry.display_price || 0,
                });
            }
        }

        this.kmPriceMap = {
            model_id: this.requestedServicePackage.spmc_id,
            km_price_map: km_price_map,
            user_id: this.user_id,
        };

        // console.log('KM Price Data:', this.kmPriceMap);
    }

    onMarkupPriceChange(km: any) {
        const totalPrice = this.getTotalPriceForKm(km.km_id);
        const markup = +km.markup_price || 0;
        km.display_price = totalPrice + markup;

        this.kmPriceMap = {
            model_id: this.requestedServicePackage.spmc_id,
            km_price_map: markup,
            user_id: this.user_id,
        };
    }

    unloadHandler(event: any) {
        const navType = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navType?.type !== 'reload') {
            this.updateSPSessionLock(this.model_code);
        }
    }

    updateSPSessionLock(spmc_value: any) {
        let data = {
            modelCode: spmc_value,
            sessionLock: 0,
        };

        this.userServices.setSPSessionLock(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
            }
        });
    }

    goBack() {
        const model_code = atob(this.activeRouter.snapshot.paramMap.get('id') || '');
        this.router.navigate(['/servicePackageKm', btoa(model_code)]);
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
