import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment.prod';

@Component({
    selector: 'app-service-pkg-cns-lbr',
    templateUrl: './service-pkg-cns-lbr.component.html',
    styleUrls: ['./service-pkg-cns-lbr.component.css'],
})
export class ServicePkgCnsLbrComponent implements OnInit {
    public model_code: string;
    public model_code_type: string;
    public engines: any = [];
    public engineNO: any;
    public descriptions: any[] = [];
    public partcodes: any[] = [];
    public partsList: any[] = [];
    public filteredList: any[] = [];
    public labourList: any[] = [];
    public sparePartsList: any[] = [];
    public service_details: any = [];
    public enginePartsList: any[] = [];
    public fullPartsData: any[] = [];
    public load_flag: boolean = false;
    public labourFactor: any;
    public vin_no: any;
    public variant: any;
    public model_year: any;
    public requestedServicePackage: any;
    public laboursList: any[] = [];
    public user_role: any = atob(atob(localStorage.getItem('us_role_id') || '{}'));
    public saveFlag: boolean = false;
    public spareSearch = 'item_name';
    public spareCodeSearch = 'item_name';
    public consumableSearch = 'item_name';
    public consumableCodeSearch = 'item_name';
    public brandList = [];
    public spareData = [];
    public draftFlag: boolean = false;
    public draftButtonFlag: boolean = false;
    public labourData = [];
    public labourNames: any[] = [];
    public consumablesData: any[] = [];
    public consumablesNames: any[] = [];
    public spStatus: any;
    public copiedModelCode: any = '';
    @ViewChild('partsModal') partsModal: any;

    constructor(public router: Router, private userServices: StaffPostAuthService, public datePipe: DatePipe, private activeRouter: ActivatedRoute) {
        this.model_code = atob(this.activeRouter.snapshot.paramMap.get('id') || '');
        this.model_code_type = atob(this.activeRouter.snapshot.paramMap.get('type') || '');

        this.service_details = {
            model_code: this.model_code,
            engine_id: 0,
            TotalPrice: 0,
            user_id: 0,
            user_role: 0,
            unit: 0,
            parts: [
                // {
                //     PART_NO: null,
                //     DESCRIPTION: null,
                //     Brand: null,
                //     applicable: 0,
                //     unit_type: null,
                //     qty: 0,
                //     PRICE: 0,
                //     old_price: 0,
                //     sp_spare_labour_unit: null,
                //     sp_spare_delete_flag: 0,
                //     sp_pm_category: null,
                //     sp_spare_id: 0,
                //     id: 0,
                //     spim_group_seq: 0,
                // },
            ],
            consumables: [
                // {
                //     PART_NO: null,
                //     DESCRIPTION: null,
                //     Brand: null,
                //     applicable: 0,
                //     unit_type: null,
                //     qty: 0,
                //     PRICE: 0,
                //     old_price: 0,
                //     sp_spare_labour_unit: null,
                //     sp_spare_delete_flag: 0,
                //     sp_spare_id: 0,
                //     sp_pm_category: null,
                //     id: 0,
                //     spim_group_seq: 0,
                // },
            ],
            Labour: [
                // {
                //     Name: null,
                //     applicable: 0,
                //     unit_type: null,
                //     qty: null,
                //     PRICE: null,
                //     Description: null,
                //     unit: null,
                //     id: null,
                //     sp_labour_delete_flag: 0,
                //     sp_labour_id: 0,
                //     sp_pm_category: null,
                //     old_price: 0,
                //     spim_group_seq: 0,
                // },
            ],
        };

        this.userServices.getServicePackageParts().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.partcodes = rdata.SPSpareParts.filter((part: any) => part.sp_pm_code && part.sp_pm_id) // remove null/empty
                    .map((part: any) => ({
                        pm_sp_pm_id: part.sp_pm_id,
                        sp_pm_code: part.sp_pm_code,
                        sp_pm_brand: part.sp_pm_brand,
                        partcode: `${part.sp_pm_code} (${part.brand_name})`,
                    }));
                this.spareData = rdata.SPSpareParts.filter((spare: any) => spare.sp_pm_access == '0' && spare.sp_pm_category == '0');
                this.labourData = rdata.SPSpareParts.filter((spare: any) => spare.sp_pm_access == '1' && spare.sp_pm_category == '2');
                this.consumablesData = rdata.SPSpareParts.filter((spare: any) => spare.sp_pm_access == '1' && spare.sp_pm_category == '1');
                this.getEngineAndSparesByModelCode();
            }
        });

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
                switch (this.requestedServicePackage.spmc_status_flag) {
                    case '0':
                        this.spStatus = 2;
                        break;
                    case '1':
                        this.spStatus = 3;
                        break;
                    case '8':
                        this.spStatus = 3;
                        break;
                    case '9':
                        this.spStatus = 7;
                        break;
                    default:
                        this.spStatus = this.requestedServicePackage.spmc_status_flag;
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
        //         switch (this.requestedServicePackage.spmc_status_flag) {
        //             case '0':
        //                 this.spStatus = 2;
        //                 break;
        //             case '1':
        //                 this.spStatus = 3;
        //                 break;
        //             case '8':
        //                 this.spStatus = 3;
        //                 break;
        //             case '9':
        //                 this.spStatus = 7;
        //                 break;
        //             default:
        //                 this.spStatus = this.requestedServicePackage.spmc_status_flag;
        //         }
        //     }
        // });

        this.userServices.getEngineNo().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.engines = rdata.engineNo;
            }
        });

        this.userServices.getBrandList().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.brandList = rdata.brand;
            }
        });

        this.userServices.getAllPartsDetails().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.partsList = rdata.spareParts;
            }
        });
    }

    ngOnInit() {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                // User is navigating away — unlock
                this.updateSPSessionLock(this.model_code);
            }
        });
    }

    distinctByName(arr: any[], key: string): any[] {
        const seen = new Set();
        return arr.filter((item) => {
            const name = item[key];
            if (seen.has(name)) return false;
            seen.add(name);
            return true;
        });
    }

    getEngineAndSparesByModelCode() {
        this.load_flag = false;
        this.userServices.getEngineAndSparesByModelCode({ model_code: this.model_code, spmc_type: this.model_code_type }).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                if (rdata?.engData?.speng_eng_id) {
                    this.engineNO = rdata.engData.speng_eng_id;
                }

                if (rdata?.spareData) {
                    this.sparePartsList = rdata.spareData;
                }

                if (rdata?.labourData) {
                    this.laboursList = rdata.labourData;
                }

                this.labourFactor = rdata.labourFactor;

                // const uniqueParts = this.distinctByName(this.spareData, 'spim_name').sort((a: any, b: any) => a.sp_pm_ordering - b.sp_pm_ordering);
                // // const sortedParts = this.spareData.sort((a: any, b: any) => a.sp_pm_ordering - b.sp_pm_ordering);
                // this.descriptions = uniqueParts.map((i: any) => i.spim_name);
                // // Now map to service_details.parts
                // if (this.spareData.length > 0) {
                //     this.service_details.parts = uniqueParts.map((part: any) => ({
                //         PART_NO: null,
                //         DESCRIPTION: part.spim_name,
                //         Brand: '1235',
                //         applicable: 0,
                //         unit_type: part.sp_pm_unit_type || null, // fallback if undefined
                //         qty: null,
                //         PRICE: null,
                //         id: 0,
                //         old_price: 0,
                //         sp_spare_labour_unit: null,
                //         sp_spare_delete_flag: 0,
                //         sp_pm_category: part.sp_pm_category,
                //         sp_spare_id: 0,
                //         spim_group_seq: part.spim_group_seq,
                //         sp_pm_id: part.sp_pm_id || 0,
                //     }));
                // }

                // Intialisation of consumables
                const uniqueConsumables = this.distinctByName(this.consumablesData, 'spim_name').sort((a: any, b: any) => a.sp_pm_ordering - b.sp_pm_ordering);
                this.consumablesNames = uniqueConsumables.map((i: any) => i.spim_name);
                // Now map to service_details.parts
                if (this.consumablesData.length > 0) {
                    this.service_details.consumables = uniqueConsumables.map((part: any) => {
                        const groupSeqs =
                            part.group_seqs
                                ?.toString()
                                .split(',')
                                .map((g: any) => g.trim())
                                .filter((g: any) => g) || [];

                        const spim_group_seq =
                            part.sp_spare_group_seq && part.sp_spare_group_seq != '0' ? part.sp_spare_group_seq : groupSeqs.length === 1 ? groupSeqs[0] : 0;

                        return {
                            PART_NO: null,
                            DESCRIPTION: part.spim_name,
                            Brand: '1235',
                            applicable: 1,
                            unit_type: part.sp_pm_unit_type || null,
                            qty: null,
                            PRICE: null,
                            id: 0,
                            old_price: 0,
                            sp_spare_labour_unit: null,
                            sp_spare_delete_flag: 0,
                            sp_pm_category: part.sp_pm_category,
                            sp_spare_id: 0,
                            spim_group_seq: spim_group_seq, // ✅ Correct logic applied here
                            sp_pm_id: part.sp_pm_id || 0,
                        };
                    });
                }

                // Intialisation of Labour
                const uniqueLabour = this.distinctByName(this.labourData, 'spim_name').sort((a: any, b: any) => a.sp_pm_ordering - b.sp_pm_ordering);
                this.labourNames = uniqueLabour
                    .sort((a: any, b: any) => Number(a.sp_pm_ordering) - Number(b.sp_pm_ordering))
                    .map((i: any) => ({
                        sp_pm_id: i.sp_pm_id.toString(),
                        sp_pm_name: i.spim_name,
                        sp_pm_ordering: i.sp_pm_ordering,
                    }));

                // Now map to service_details.labour
                if (this.labourData.length > 0) {
                    this.service_details.Labour = uniqueLabour.map((labour: any) => {
                        const groupSeqs =
                            labour.group_seqs
                                ?.toString()
                                .split(',')
                                .map((g: any) => g.trim())
                                .filter((g: any) => g) || [];

                        const spim_group_seq =
                            labour.sp_labour_group_seq && labour.sp_labour_group_seq != '0'
                                ? labour.sp_labour_group_seq
                                : groupSeqs.length === 1
                                    ? groupSeqs[0]
                                    : 0;

                        return {
                            Name: labour.sp_pm_id,
                            Description: labour.spim_name,
                            applicable: 1,
                            unit_type: labour.sp_pm_unit_type || null,
                            qty: null,
                            PRICE: null,
                            unit: null,
                            id: null,
                            sp_labour_delete_flag: 0,
                            sp_labour_id: 0,
                            sp_pm_category: labour.sp_pm_category,
                            old_price: 0,
                            spim_group_seq: spim_group_seq, // ✅ logic applied
                        };
                    });
                }

                // Draft data
                if (this.sparePartsList.length > 0 || this.laboursList.length > 0) {
                    if (this.sparePartsList?.length) {
                        const partsMap = new Map(this.service_details.parts.map((p: any) => [p.DESCRIPTION?.trim().toLowerCase(), p]));
                        const consumablesMap = new Map(this.service_details.consumables.map((c: any) => [c.DESCRIPTION?.trim().toLowerCase(), c]));

                        this.sparePartsList.forEach((sp: any) => {
                            const key = sp.spim_name?.trim().toLowerCase();
                            const targetList = sp.sp_spare_category == '1' ? this.service_details.consumables : this.service_details.parts;
                            const targetMap = sp.sp_spare_category == '1' ? consumablesMap : partsMap;

                            const groupSeqs =
                                sp.group_seqs
                                    ?.toString()
                                    .split(',')
                                    .map((g: any) => g.trim())
                                    .filter((g: any) => g) || [];

                            const spim_group_seq =
                                sp.sp_spare_group_seq && sp.sp_spare_group_seq != '0' ? sp.sp_spare_group_seq : groupSeqs.length === 1 ? groupSeqs[0] : 0;

                            const newData = {
                                PART_NO: sp.pm_code || null,
                                DESCRIPTION: sp.spim_name || null,
                                Brand: sp.pm_brand || null,
                                applicable: Number(sp.sp_spare_applicable) || 0,
                                unit_type: sp.pm_unit_type || null,
                                qty: sp.sp_spare_qty || null,
                                sp_spare_labour_unit: sp.sp_spare_labour_unit > 0 ? sp.sp_spare_labour_unit : null,
                                PRICE: sp.pm_price ? parseFloat(sp.pm_price).toFixed(2) : null,
                                id: sp.pm_id ?? null,
                                sp_spare_delete_flag: sp.sp_spare_delete_flag ?? 0,
                                sp_spare_id: sp.sp_spare_id ?? 0,
                                sp_pm_category: sp.sp_spare_category ?? null,
                                old_price: 0,
                                spim_group_seq: spim_group_seq,
                                sp_pm_id: sp.pm_sp_pm_id || 0,
                            };

                            const existing = targetMap.get(key);
                            if (existing) {
                                // update the existing entry in-place
                                Object.assign(existing, newData);
                            } else {
                                // new entry—push onto correct list and add to its map
                                targetList.push(newData);
                                targetMap.set(key, newData);
                            }
                        });
                    }

                    if (this.laboursList && this.laboursList.length > 0) {
                        const labourFactor = rdata.labourFactor;

                        const labourMap = new Map<string, any>(
                            this.service_details.Labour.map((item: any) => [(item.Description || '').trim().toLowerCase(), item])
                        );

                        this.service_details.Labour.forEach((item: any) => {
                            item.applicable = 0;
                        });

                        // 3. Iterate your master labour list and merge into service_details.Labour
                        this.laboursList.forEach((labour: any) => {
                            const key = (labour.spim_name || '').trim().toLowerCase();
                            const groupSeqs =
                                labour.group_seqs
                                    ?.toString()
                                    .split(',')
                                    .map((g: any) => g.trim())
                                    .filter((g: any) => g) || [];

                            const spim_group_seq =
                                labour.sp_labour_group_seq && labour.sp_labour_group_seq != '0'
                                    ? labour.sp_labour_group_seq
                                    : groupSeqs.length === 1
                                        ? groupSeqs[0]
                                        : 0;

                            // Build the fresh data object
                            const newData = {
                                Name: labour.sp_pm_id || null,
                                Description: labour.spim_name || null,
                                applicable: Number(labour.sp_labour_applicable) || 0,
                                unit_type: labour.sp_pm_unit_type || null,
                                qty: labour.sp_labour_qty || null,
                                PRICE: labour.sp_pm_category === '1' ? labour.pm_price : null,
                                unit: labour.sp_labour_unit || null,
                                id: labour.pm_id ?? 0,
                                sp_labour_delete_flag: labour.sp_labour_delete_flag ?? 0,
                                sp_labour_id: labour.sp_labour_id ?? 0,
                                sp_pm_category: labour.sp_pm_category || null,
                                old_price: 0,
                                spim_group_seq: spim_group_seq,
                            };

                            const existing = labourMap.get(key);
                            if (existing) {
                                // Merge all new fields into the existing row
                                Object.assign(existing, newData);
                            } else {
                                // New labour entry—push it and add to the map
                                this.service_details.Labour.push(newData);
                                labourMap.set(key, newData);
                            }
                        });
                    }

                    this.getTotalServicePrice();
                }

                if (rdata.modelData && rdata.modelData.spmc_draft_flag !== undefined && rdata.modelData.spmc_draft_flag != '1') {
                    this.getPartsForEngineNo(this.engineNO);
                }

                this.load_flag = true;
            } else {
                const uniqueParts = this.distinctByName(this.spareData, 'spim_name').sort((a: any, b: any) => a.sp_pm_ordering - b.sp_pm_ordering);
                // const sortedParts = this.spareData.sort((a: any, b: any) => a.sp_pm_ordering - b.sp_pm_ordering);
                this.descriptions = uniqueParts.map((i: any) => i.spim_name);
                // Now map to service_details.parts
                if (this.spareData.length > 0) {
                    this.service_details.parts = uniqueParts.map((part: any) => {
                        const groupSeqs =
                            part.group_seqs
                                ?.toString()
                                .split(',')
                                .map((g: any) => g.trim())
                                .filter((g: any) => g) || [];

                        const spim_group_seq =
                            part.spim_group_seq && part.spim_group_seq !== 0 ? part.spim_group_seq : groupSeqs.length === 1 ? groupSeqs[0] : 0;

                        return {
                            PART_NO: null,
                            DESCRIPTION: part.spim_name,
                            Brand: '1235',
                            applicable: 0,
                            unit_type: part.sp_pm_unit_type || null,
                            qty: null,
                            PRICE: null,
                            id: 0,
                            old_price: 0,
                            sp_spare_labour_unit: null,
                            sp_spare_delete_flag: 0,
                            sp_pm_category: part.sp_pm_category,
                            sp_spare_id: 0,
                            spim_group_seq: spim_group_seq, // ✅ Proper fallback
                            sp_pm_id: part.sp_pm_id || 0,
                        };
                    });
                }

                // Intialisation of consumablesData
                const uniqueConsumables = this.distinctByName(this.consumablesData, 'spim_name').sort((a: any, b: any) => a.sp_pm_ordering - b.sp_pm_ordering);
                this.consumablesNames = uniqueConsumables.map((i: any) => i.spim_name);
                // Now map to service_details.parts
                if (this.consumablesData.length > 0) {
                    this.service_details.consumables = uniqueConsumables.map((part: any) => {
                        const groupSeqs =
                            part.group_seqs
                                ?.toString()
                                .split(',')
                                .map((g: any) => g.trim())
                                .filter((g: any) => g) || [];

                        const spim_group_seq =
                            part.sp_spare_group_seq && part.sp_spare_group_seq != '0' ? part.sp_spare_group_seq : groupSeqs.length === 1 ? groupSeqs[0] : 0;

                        return {
                            PART_NO: null,
                            DESCRIPTION: part.spim_name,
                            Brand: '1235',
                            applicable: 1,
                            unit_type: part.sp_pm_unit_type || null,
                            qty: null,
                            PRICE: null,
                            id: 0,
                            old_price: 0,
                            sp_spare_labour_unit: null,
                            sp_spare_delete_flag: 0,
                            sp_pm_category: part.sp_pm_category,
                            sp_spare_id: 0,
                            spim_group_seq: spim_group_seq, // ✅ Correct logic applied here
                            sp_pm_id: part.sp_pm_id || 0,
                        };
                    });
                }

                // Intialisation of consumablesData

                const uniqueLabour = this.distinctByName(this.labourData, 'spim_name').sort((a: any, b: any) => a.sp_pm_ordering - b.sp_pm_ordering);
                this.labourNames = uniqueLabour
                    .sort((a: any, b: any) => Number(a.sp_pm_ordering) - Number(b.sp_pm_ordering))
                    .map((i: any) => ({
                        sp_pm_id: i.sp_pm_id.toString(),
                        sp_pm_name: i.spim_name,
                        sp_pm_ordering: i.sp_pm_ordering,
                    }));

                // Now map to service_details.labour
                if (this.labourData.length > 0) {
                    this.service_details.Labour = uniqueLabour.map((labour: any) => {
                        const groupSeqs =
                            labour.group_seqs
                                ?.toString()
                                .split(',')
                                .map((g: any) => g.trim())
                                .filter((g: any) => g) || [];

                        const spim_group_seq =
                            labour.sp_labour_group_seq && labour.sp_labour_group_seq != '0'
                                ? labour.sp_labour_group_seq
                                : groupSeqs.length === 1
                                    ? groupSeqs[0]
                                    : 0;

                        return {
                            Name: labour.sp_pm_id,
                            Description: labour.spim_name,
                            applicable: 1,
                            unit_type: labour.sp_pm_unit_type || null,
                            qty: null,
                            PRICE: null,
                            unit: null,
                            id: null,
                            sp_labour_delete_flag: 0,
                            sp_labour_id: 0,
                            sp_pm_category: labour.sp_pm_category,
                            old_price: 0,
                            spim_group_seq: spim_group_seq, // ✅ Correct logic used here
                        };
                    });
                }
                this.getPartsForEngineNo(this.engineNO);
                this.load_flag = true;
            }
        });
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

    getPartsBasedOnPartcode(spare: any) {
        if (!spare?.PART_NO || this.partsList.length === 0) return;
        const matchedPart = this.partsList.find((part) => part.pm_code === spare.PART_NO);
        if (matchedPart) {
            // Patch values directly into the spare object
            spare.unit_type = matchedPart.pm_unit_type ?? null;
            spare.PRICE = matchedPart.pm_price ?? null;
            spare.id = matchedPart.pm_id ?? 0;
            // Optional: if qty should reset when patching
            spare.qty = null;
            // Optional: re-calculate total prices or other fields
            this.getPartPrice(this.service_details.parts);
        } else {
            spare.PRICE = null;
            spare.id = 0;
            spare.qty = null;
            this.getPartPrice(this.service_details.parts);
        }
    }

    getPartcode(spare: any) {
        this.filteredList = this.descriptions.filter((item: any) => item === spare.DESCRIPTION);
        this.getPartPrice(spare);
    }

    getConsumablePrice(item: any) {
        let data = { part_no: item.PART_NO };

        this.userServices.getConsumablePrice(data).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                if (Array.isArray(rdata.partsData) && rdata.partsData.length > 1) {
                    // Multiple brands - show Swal for selection
                    Swal.fire({
                        title: 'Select Brand',
                        input: 'select',
                        inputOptions: rdata.partsData.reduce((opts: any, part: any) => {
                            opts[part.sp_pm_id] = `${part.brand_name} - ₹${part.sp_pm_price}`;
                            return opts;
                        }, {}),
                        inputPlaceholder: 'Choose a brand',
                        showCancelButton: true,
                    }).then((result) => {
                        if (result.isConfirmed && result.value) {
                            const selectedPart = rdata.partsData.find((p: any) => p.sp_pm_id == result.value);
                            // console.log('thisis selceted part', selectedPart);
                            if (selectedPart) {
                                item.PRICE = selectedPart.sp_pm_price;
                                item.sp_pm_id = selectedPart.sp_pm_id;
                                item.Brand = selectedPart.sp_pm_brand;
                                item.id = selectedPart.pm_id;
                                // console.log('item after brand selection', item);
                            } else {
                            }
                        }
                    });
                } else {
                    // Only one brand - directly map
                    const part = rdata.partsData[0];
                    item.PRICE = part.sp_pm_price;
                    item.sp_pm_id = part.sp_pm_id;
                    item.Brand = part.sp_pm_brand;
                    item.id = part.pm_id;
                }
            } else {
                item.PRICE = null;
            }
        });
    }

    getPartPrice(spare: any) {
        if (spare.DESCRIPTION && spare.PART_NO && spare.Brand && spare.qty == null) {
            const foundPart = this.partsList.find(
                (part) => part.pm_name === spare.DESCRIPTION && part.pm_code === spare.PART_NO && part.brand_name === spare.Brand
            );
            spare.qty = foundPart ? 1 : null;
            spare.id = foundPart ? foundPart.pm_id : 0;
            spare.PRICE = foundPart ? foundPart.pm_price : null;
        } else if (!spare.DESCRIPTION && !spare.PART_NO && !spare.Brand && !spare.qty) {
            spare.qty = null;
            spare.PRICE = null;
            spare.id = 0;
        }
        this.getTotalServicePrice();
    }

    getPartsForEngineNo(engineNO: any) {
        let data = {
            eng_id: this.engineNO,
        };
        this.userServices.getSpareForEngineNo(data).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.enginePartsList = [];
                this.fullPartsData = rdata.partsList;

                const allParts = [...(rdata.partsList.consumables || []), ...(rdata.partsList.labours || [])];

                allParts.forEach((item: any) => {
                    const modelCode = item.spmc_value;
                    const engNo = this.getSelectedEngineNo();

                    const isConsumable = item.sp_spare_category === '1';
                    const isLabour = !item.sp_spare_category;

                    const price = Number(item.pm_price || 0) * Number(item.sp_spare_qty || 0);
                    const labourUnit = Number(item.sp_labour_unit || 0);

                    let existing = this.enginePartsList.find((p) => p.model_code === modelCode && p.eng_no === engNo);

                    if (existing) {
                        if (isConsumable) existing.totalConsumablesPrice += price;
                        if (isLabour) existing.totalLabourUnit += labourUnit;

                        existing.parts.push(item);
                    } else {
                        this.enginePartsList.push({
                            eng_no: engNo,
                            model_code: modelCode,
                            spmc_model_year: item.spmc_model_year,
                            totalConsumablesPrice: isConsumable ? price : 0,
                            totalLabourUnit: isLabour ? labourUnit : 0,
                            parts: [item],
                        });
                    }
                });

                if (this.enginePartsList.length > 0) {
                    this.partsModal.open();
                }
            }
        });
    }

    // getSPItemsCategory(selectedItem: any) {
    //     const matchedLabour = this.labourData.find((labour: any) => labour.sp_pm_id === selectedItem.Name) as any;
    //     // console.log('matched labour ,', matchedLabour);
    //     if (matchedLabour) {
    //         selectedItem.Description = matchedLabour.sp_pm_name;
    //         selectedItem.sp_pm_category = matchedLabour.sp_pm_category;
    //         if (matchedLabour.sp_pm_category == '1') {
    //             selectedItem.unit_type = matchedLabour.sp_pm_unit_type;
    //         }
    //     } else {
    //         selectedItem.Description = '';
    //         selectedItem.sp_pm_category = null;
    //     }
    // }

    // getLabourCodeAndDescription(labour: any) {
    //     // console.log('test>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    //     if (labour.Name) {
    //         const foundPart = this.labourList.find((lb) => lb.sp_pm_name === labour.Name);
    //         labour.Description = foundPart ? foundPart.sp_pm_name : '';
    //         labour.id = foundPart ? foundPart.sp_pm_id : 0;
    //         labour.unit = null;
    //         const price = foundPart ? this.labourFactor * labour.unit : 0;
    //         labour.PRICE = price.toFixed(2);
    //     } else {
    //         labour.Description = '';
    //         labour.id = 0;
    //         labour.unit = null;
    //         labour.PRICE = null;
    //     }
    //     this.getTotalServicePrice();
    // }

    getTotalServicePrice() {
        this.service_details.TotalPrice = 0;
        // console.log('this.service_details>>>>>>>>>>>>>>.', this.service_details);
        this.service_details.parts.forEach((element: any) => {
            if (element.applicable == 1) {
                const price = parseFloat(element.PRICE) || 0;
                const qty = parseFloat(element.qty) || 0;
                this.service_details.TotalPrice += price * qty;
            }
        });
        this.service_details.consumables.forEach((element: any) => {
            if (element.applicable == 1) {
                const price = parseFloat(element.PRICE) || 0;
                const qty = parseFloat(element.qty) || 0;
                this.service_details.TotalPrice += price * qty;
            }
        });
        // console.log('this.service_details.TotalPrice', this.service_details.TotalPrice);
        this.service_details.unit = 0; // Initialize before accumulating

        this.service_details.Labour.forEach((element2: any) => {
            if (element2.applicable == 1) {
                const unit = parseFloat(element2.unit) || 0;
                this.service_details.unit += unit;
            }
        });
        this.service_details.TotalPrice = parseFloat(this.service_details.TotalPrice.toFixed(2));
        this.load_flag = true;
        // console.log('this.service_details.TotalPrice', this.service_details.TotalPrice);
    }

    getSelectedEngineNo(): string | undefined {
        const selected = this.engines.find((engine: any) => engine.eng_id == this.engineNO);
        return selected?.eng_no;
    }

    onApplicableChange(labour: any, event: Event) {
        const checked = (event.target as HTMLInputElement).checked;
        labour.applicable = checked ? 1 : 0;

        const groupSeq = labour.spim_group_seq;

        // Only proceed if it's being checked and has a valid group
        if (checked && groupSeq && groupSeq != 0) {
            const allItems = [...this.service_details.consumables, ...this.service_details.Labour];

            allItems.forEach((item: any) => {
                if (item.spim_group_seq == groupSeq) {
                    item.applicable = 1; // Force checked
                }
            });
        }

        this.getTotalServicePrice();
    }

    copyConsuamblesOperations(partSummary: any) {
        // 0) reset all existing consumables & labours to not-applicable
        this.service_details.consumables.forEach((c: any) => (c.applicable = 0));
        this.service_details.Labour.forEach((l: any) => (l.applicable = 0));

        this.copiedModelCode = partSummary.model_code;
        const parts = partSummary.parts;

        const consumables = parts.filter((p: any) => p.sp_spare_category == '1');
        const labours = parts.filter((p: any) => p.sp_spare_category == undefined || p.sp_spare_category == null);

        // ---------- CONSUMABLES ----------
        if (consumables?.length) {
            const consumablesMap = new Map(this.service_details.consumables.map((c: any) => [c.DESCRIPTION?.trim().toLowerCase(), c]));

            consumables.forEach((sp: any) => {
                const key = sp.spim_name?.trim().toLowerCase();
                const targetList = this.service_details.consumables;

                const newData = {
                    PART_NO: sp.pm_code || null,
                    DESCRIPTION: sp.spim_name || null,
                    Brand: sp.pm_brand || null,
                    applicable: Number(sp.sp_spare_applicable) || 0,
                    unit_type: sp.pm_unit_type || null,
                    qty: sp.sp_spare_qty || null,
                    sp_spare_labour_unit: sp.sp_spare_labour_unit > 0 ? sp.sp_spare_labour_unit : null,
                    PRICE: sp.pm_price ? parseFloat(sp.pm_price).toFixed(2) : null,
                    id: sp.pm_id ?? null,
                    sp_spare_delete_flag: sp.sp_spare_delete_flag ?? 0,
                    // sp_spare_id: 0,
                    sp_pm_category: sp.sp_spare_category ?? null,
                    old_price: 0,
                    spim_group_seq: sp.sp_spare_group_seq ?? 0,
                    sp_pm_id: sp.pm_sp_pm_id || 0,
                };

                const existing = consumablesMap.get(key);
                if (existing) {
                    Object.assign(existing, newData);
                } else {
                    targetList.push(newData);
                    consumablesMap.set(key, newData);
                }
            });
        }

        // ---------- LABOURS ----------
        if (labours?.length) {
            const labourMap = new Map(this.service_details.Labour.map((item: any) => [(item.Description || '').trim().toLowerCase(), item]));

            labours.forEach((labour: any) => {
                const key = (labour.spim_name || '').trim().toLowerCase();

                const newData = {
                    Name: labour.sp_pm_id || null,
                    Description: labour.spim_name || null,
                    applicable: Number(labour.sp_labour_applicable) || 0,
                    unit_type: labour.sp_pm_unit_type || null,
                    qty: labour.sp_labour_qty || null,
                    PRICE: labour.sp_pm_category === '1' ? labour.pm_price : null,
                    unit: labour.sp_labour_unit || null,
                    id: labour.pm_id ?? 0,
                    sp_labour_delete_flag: labour.sp_labour_delete_flag ?? 0,
                    // sp_labour_id: 0,
                    sp_pm_category: labour.sp_pm_category || null,
                    old_price: 0,
                    spim_group_seq: labour.sp_labour_group_seq ?? 0,
                };

                const existing = labourMap.get(key);
                if (existing) {
                    Object.assign(existing, newData);
                } else {
                    this.service_details.Labour.push(newData);
                    labourMap.set(key, newData);
                }
            });
        }

        this.getTotalServicePrice();
        this.partsModal.close();
    }

    saveServicePackage(type: number) {
        if (type == 8) {
            this.service_details.spmc_status_flag = this.requestedServicePackage.spmc_status_flag;
            this.draftButtonFlag = true;
            this.service_details.draft_flag = 1;
        } else {
            this.service_details.spmc_status_flag = this.spStatus;
            this.service_details.draft_flag = 0;
            this.saveFlag = true;
        }

        if (type != 8) {
            if (this.engineNO == null || this.engineNO == '') {
                this.coloredToast('danger', 'Engine Number is mandatory!');
                this.saveFlag = false;
                this.draftButtonFlag = false;
                return;
            }

            // Consumbales Validation check
            if (this.service_details.consumables.length > 0) {
                // ✅ Filter only applicable parts (where applicable == 1)
                const applicableParts = this.service_details.consumables.filter((part: any) => part.applicable == 1);
                // ✅ Check if all required fields are filled in applicable parts
                const allFieldsHaveValue = applicableParts.every((part: any) => {
                    const valuesFilled = Object.entries(part)
                        .filter(([key, _]) => key != 'sp_spare_labour_unit')
                        .every(([_, value]) => value !== null && value !== '' && value !== undefined);

                    const priceValid = part.PRICE !== 0 && part.PRICE !== '0' && part.PRICE !== 0.0;

                    return valuesFilled && priceValid;
                });

                if (!allFieldsHaveValue) {
                    this.coloredToast('danger', 'Please fill in all fields and ensure price is not zero for applicable consumables.');
                    this.saveFlag = false;
                    this.draftButtonFlag = false;
                    return;
                }
            } else {
                this.coloredToast('danger', 'At least one consumable is required to create a service.');
                this.saveFlag = false;
                this.draftButtonFlag = false;
                return;
            }

            // Labour check
            if (this.service_details.Labour.length > 0) {
                // ✅ Step 1: Filter only applicable labour entries
                const applicableLabours = this.service_details.Labour.filter((labour: any) => labour.applicable == 1);

                // ✅ Step 2: Validate each applicable labour entry
                const labourValid = applicableLabours.every((labour: any) => {
                    const spCategory = labour.sp_pm_category;

                    if (spCategory == 0 || spCategory == 1) {
                        return (
                            labour.unit_type !== null &&
                            labour.unit_type !== '' &&
                            labour.qty !== null &&
                            labour.qty !== '' &&
                            labour.qty != 0 &&
                            labour.PRICE !== null &&
                            labour.PRICE !== '' &&
                            labour.PRICE != 0
                        );
                    }

                    if (spCategory == 2) {
                        return labour.unit !== null && labour.unit !== '' && labour.unit != 0;
                    }

                    // ✅ If category is 3 or other, skip unit/qty/PRICE validation
                    return true;
                });

                if (!labourValid) {
                    this.coloredToast('danger', 'Please fill in all applicable Labour entries');
                    this.saveFlag = false;
                    this.draftButtonFlag = false;
                    return;
                }
            }
        }

        this.service_details.user_id = atob(atob(localStorage.getItem('us_id') || '{}'));
        this.service_details.engine_id = this.engineNO;
        this.service_details.user_role = atob(atob(localStorage.getItem('us_role_id') || '{}'));
        this.service_details.vin_no = this.vin_no;
        this.service_details.spmc_type = this.model_code_type;
        this.service_details.branch_id = environment.branch_id;
        this.service_details.copyModel = this.copiedModelCode;


        // this.draftButtonFlag = false;
        // this.saveFlag = false;
        // console.log('datas>>>>>>>>>>>>>>>>', this.service_details);

        this.userServices.saveServicePackageLabours(this.service_details).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                const allowedRoles = [1, 2, 10, 13];
                if (allowedRoles.includes(Number(this.user_role))) {
                    if (type == 8) {
                        this.router.navigateByUrl('servicePackageRequested');
                        this.draftButtonFlag = false;
                        this.saveFlag = false;
                        this.coloredToast('info', 'Service package Consumable And Labour have been saved as draft.');
                    } else {
                        const encodedModel = btoa(this.model_code);
                        this.router.navigate(['servicePackageKm', encodedModel]);
                        this.draftButtonFlag = false;
                        this.saveFlag = false;
                        this.coloredToast('success', 'Service package Consumables And Labour saved successfully.');
                    }
                } else {
                    if (type == 8) {
                        this.router.navigateByUrl('servicePackageRequested');
                        this.draftButtonFlag = false;
                        this.saveFlag = false;
                        this.coloredToast('info', 'Service package Consumable And Labour have been saved as draft.');
                    } else {
                        this.router.navigateByUrl('servicePackageRequested');
                        this.draftButtonFlag = false;
                        this.saveFlag = false;
                        this.coloredToast('success', 'Service package Consumables And Labour saved successfully.');
                    }
                }
            } else {
                this.saveFlag = false;
                this.draftButtonFlag = false;
                this.coloredToast('danger', 'Some error occurred , Please try again');
            }
        });
        if (this.service_details.Labour.length > 0) {
        } else {
            this.coloredToast('danger', 'Labours are Required For Service Package');
        }
    }

    toTitleCase(str: string): string {
        if (!str) return '';
        return str
            .toLowerCase()
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    onLabourUnitChange(labour: any) {
        // console.log('labourFactor>>>>>>>>>>>>', this.labourFactor);
        const unit = parseFloat(labour.unit) || 0;
        const price = this.labourFactor * unit;
        labour.PRICE = price.toFixed(2); // for numeric value like 105.00
        this.getTotalServicePrice();
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
