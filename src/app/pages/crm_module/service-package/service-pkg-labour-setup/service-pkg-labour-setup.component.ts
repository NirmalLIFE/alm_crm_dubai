import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';
import { ModalComponent } from 'angular-custom-modal';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment.prod';

@Component({
    selector: 'app-service-pkg-labour-setup',
    templateUrl: './service-pkg-labour-setup.component.html',
    styleUrls: ['./service-pkg-labour-setup.component.css'],
})
export class ServicePkgLabourSetupComponent implements OnInit {
    public model_code: string;
    public model_code_type: string;
    public engines: any = [];
    public engineNO: any;
    public descriptions: any[] = [];
    public partcodes: any[] = [];
    public consumablecodes: any[] = [];
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
    public unselectedSpareParts: any[] = [];
    public unselectedLabour: any[] = [];
    public isSubmittingPart = false;
    public isSubmittingLabour = false;

    @ViewChild('partsModal') partsModal: any;
    public selectedPartNames: any[];
    public selectedLabourNames: any[] = [];
    @ViewChild('unselectedPartsModal') unselectedPartsModal: any;
    @ViewChild('unselectedLabourModal') unselectedLabourModal: any;
    public noteToSupervisor: string = '';
    public allItems: any[] = []; // The full list of items
    public notApplicableItems: any[] = []; // Filtered list of items not marked applicable
    public selectedItemNames: string[] = [];
    @ViewChild('markApplicableModal') markApplicableModal!: ModalComponent;

    public groupedItems: { [groupId: string]: any[] } = {};
    public selectedGroupItemNames: string[] = [];
    @ViewChild('groupItemsModal') public groupItemsModal: any;

    public groupSelection: { [groupId: string]: boolean } = {};
    public selectedItemsWithIds: { spim_id: number; name: string }[] = [];
    public buttonFlag: boolean = false;
    finalSelectedItems: any[] = [];
    currentGroupTargetSpare: any = null;
    pendingWarningBypass: boolean = false;

    constructor(public router: Router, private userServices: StaffPostAuthService, public datePipe: DatePipe, private activeRouter: ActivatedRoute) {
        this.model_code = atob(this.activeRouter.snapshot.paramMap.get('id') || '');
        this.model_code_type = atob(this.activeRouter.snapshot.paramMap.get('type') || '');

        this.selectedPartNames = [];
        this.service_details = {
            model_code: this.model_code,
            labour_unit: 0,
            engine_id: 0,
            TotalPrice: 0,
            user_id: 0,
            user_role: 0,
            parts: [
                {
                    PART_NO: null,
                    DESCRIPTION: null,
                    Brand: null,
                    applicable: 0,
                    unit_type: null,
                    qty: 0,
                    PRICE: 0,
                    old_price: 0,
                    sp_spare_labour_unit: null,
                    sp_spare_delete_flag: 0,
                    sp_pm_category: null,
                    sp_spare_id: 0,
                    id: 0,
                    spim_group_seq: 0,
                    group_seq: '',
                    spim_id: '',
                },
            ],
            consumables: [
                {
                    PART_NO: null,
                    DESCRIPTION: null,
                    Brand: null,
                    applicable: 0,
                    unit_type: null,
                    qty: 0,
                    PRICE: 0,
                    old_price: 0,
                    sp_spare_labour_unit: null,
                    sp_spare_delete_flag: 0,
                    sp_spare_id: 0,
                    sp_pm_category: null,
                    id: 0,
                    group_seq: '',
                    spim_group_seq: 0,
                    spim_id: '',
                },
            ],
            Labour: [
                {
                    Name: null,
                    applicable: 0,
                    unit_type: null,
                    qty: null,
                    PRICE: null,
                    Description: null,
                    unit: null,
                    id: null,
                    // PRICE: 0,
                    sp_labour_delete_flag: 0,
                    sp_labour_id: 0,
                    sp_pm_category: null,
                    old_price: 0,
                    group_seq: '',
                    spim_group_seq: 0,
                    spim_id: '',
                },
            ],
        };

        this.userServices.getServicePackageParts().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.partcodes = rdata.SPSpareParts.filter((part: any) => part.sp_pm_category == '0').map((part: any) => part.sp_pm_code);
                this.spareData = rdata.SPSpareParts.filter((spare: any) => spare.sp_pm_access == '0' && spare.sp_pm_category == '0');
                this.labourData = rdata.SPSpareParts.filter((spare: any) => spare.sp_pm_access == '1' && spare.sp_pm_category == '2');
                this.consumablesData = rdata.SPSpareParts.filter((spare: any) => spare.sp_pm_access == '1' && spare.sp_pm_category == '1');
                this.consumablecodes = rdata.SPSpareParts.filter((spare: any) => spare.sp_pm_access == '1' && spare.sp_pm_category == '1').map(
                    (part: any) => part.sp_pm_code
                );
                this.getEngineAndSparesByModelCode();
            }
        });

        let data = {
            modelCode: this.model_code,
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

                switch (this.requestedServicePackage.spmc_status_flag) {
                    case '7':
                        this.isSubmittingPart = true;
                        break;
                    case '8':
                        this.isSubmittingLabour = true;
                        break;
                    case '9':
                        this.isSubmittingPart = true;
                        this.isSubmittingLabour = true;
                        break;
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

        //         switch (this.requestedServicePackage.spmc_status_flag) {
        //             case '7':
        //                 this.isSubmittingPart = true;
        //                 break;
        //             case '8':
        //                 this.isSubmittingLabour = true;
        //                 break;
        //             case '9':
        //                 this.isSubmittingPart = true;
        //                 this.isSubmittingLabour = true;
        //                 break;
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

        // this.userServices.getAllLabourList().subscribe((rdata: any) => {
        //     if (rdata.ret_data == 'success') {
        //         this.labourList = rdata.labour;
        //     }
        // });

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

        // this.userServices.getSparePartsDesandPart().subscribe((rdata: any) => {
        //     if (rdata.ret_data == 'success') {
        //         // this.descriptions = rdata.descriptions.map(function (i: any) {
        //         //     return i.inv_item_description;
        //         // });
        //         // this.partcodes = rdata.partNo.map(function (i: any) {
        //         //     return i.inv_item_part_number;
        //         // });
        //     } else {
        //         // this.coloredToast('danger', 'Some error occurred please try again');
        //     }
        // });

        // this.userServices.getAllPartsList().subscribe((rdata: any) => {
        //     if (rdata.ret_data == 'success') {
        //         this.partsList = rdata.parts;
        //     }
        // });
    }
    // CONSTRUCTOR ENDDDDDDDDD--------------------------------------------------------------------

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

    toTitleCase(str: string): string {
        if (!str) return '';
        return str
            .toLowerCase()
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
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

                const singleGroupSpims = this.sparePartsList
                    .filter((spare) => {
                        const groupSeq = spare.group_seqs;
                        return groupSeq && groupSeq.toString().split(',').length === 1;
                    })
                    .map((spare) => spare.spim_id);

                // console.log('🧪 Spim IDs with single group:', singleGroupSpims);
                if (singleGroupSpims.length > 0) {
                    this.fetchGroupItems(singleGroupSpims);
                }

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
                            spim_group_seq: groupSeqs.length == 1 ? groupSeqs[0] : 0,
                            group_seq: part.group_seqs,
                            sp_pm_id: part.sp_pm_id || 0,
                            spim_id: part.spim_id,
                        };
                    });
                }

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
                            spim_group_seq: groupSeqs.length === 1 ? groupSeqs[0] : 0,
                            group_seq: part.group_seqs,
                            sp_pm_id: part.sp_pm_id || 0,
                            spim_id: part.spim_id,
                        };
                    });
                }

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

                        return {
                            Name: labour.sp_pm_id,
                            Description: labour.spim_name,
                            applicable: 0,
                            unit_type: labour.sp_pm_unit_type || null,
                            qty: null,
                            PRICE: null,
                            unit: null,
                            id: null,
                            sp_labour_delete_flag: 0,
                            sp_labour_id: 0,
                            sp_pm_category: labour.sp_pm_category,
                            old_price: 0,
                            spim_group_seq: groupSeqs.length === 1 ? groupSeqs[0] : 0,
                            group_seq: labour.group_seqs,
                            spim_id: labour.spim_id,
                        };
                    });
                }

                if (this.sparePartsList.length > 0 || this.laboursList.length > 0) {
                    // if (this.sparePartsList && this.sparePartsList.length > 0) {
                    //     const existingPartsMap = new Map(this.service_details.parts.map((part: any) => [part.DESCRIPTION?.trim().toLowerCase(), part]));

                    //     this.sparePartsList.forEach((sparePart) => {
                    //         const descKey = sparePart.pm_name?.trim().toLowerCase();

                    //         const newData = {
                    //             PART_NO: sparePart.pm_code || null,
                    //             DESCRIPTION: sparePart.pm_name || null,
                    //             Brand: sparePart.pm_brand || null,
                    //             applicable: 1,
                    //             unit_type: sparePart.pm_unit_type || null,
                    //             qty: sparePart.sp_spare_qty != null && sparePart.sp_spare_qty != 0 ? sparePart.sp_spare_qty : null,
                    //             sp_spare_labour_unit:
                    //                 sparePart.sp_spare_labour_unit == 0 || sparePart.sp_spare_labour_unit == null || sparePart.sp_spare_labour_unit === ''
                    //                     ? null
                    //                     : sparePart.sp_spare_labour_unit,
                    //             PRICE: sparePart.pm_price ? parseFloat(sparePart.pm_price).toFixed(2) : null,
                    //             id: sparePart.pm_id ?? null,
                    //             sp_spare_delete_flag: sparePart.sp_spare_delete_flag ?? 0,
                    //             sp_spare_id: sparePart.sp_spare_id ?? 0,
                    //             old_price: 0,
                    //         };

                    //         const existing = existingPartsMap.get(descKey);
                    //         if (existing) {
                    //             Object.assign(existing, newData);
                    //         } else {
                    //             this.service_details.parts.push(newData);
                    //         }
                    //     });
                    // }

                    if (this.sparePartsList?.length) {
                        // Build two lookup maps, keyed by normalized DESCRIPTION
                        const partsMap = new Map(this.service_details.parts.map((p: any) => [p.DESCRIPTION?.trim().toLowerCase(), p]));
                        const consumablesMap = new Map(this.service_details.consumables.map((c: any) => [c.DESCRIPTION?.trim().toLowerCase(), c]));

                        this.sparePartsList.forEach((sp: any) => {
                            const key = sp.spim_name?.trim().toLowerCase();
                            const targetList = sp.sp_spare_category == '1' ? this.service_details.consumables : this.service_details.parts;
                            const targetMap = sp.sp_spare_category == '1' ? consumablesMap : partsMap;

                            // Parse group_seqs safely
                            const groupSeqs =
                                sp.group_seqs
                                    ?.toString()
                                    .split(',')
                                    .map((g: any) => g.trim())
                                    .filter((g: any) => g) || [];

                            // Use the same fallback logic
                            const spim_group_seq = groupSeqs.length === 1 ? groupSeqs[0] : 0;

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
                                group_seq: sp.group_seqs,
                                spim_group_seq: spim_group_seq,
                                sp_pm_id: sp.pm_sp_pm_id || 0,
                                spim_id: sp.spim_id,
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

                        // 3. Iterate your master labour list and merge into service_details.Labour
                        this.laboursList.forEach((labour: any) => {
                            const key = (labour.spim_name || '').trim().toLowerCase();
                            const groupSeqs =
                                labour.group_seqs
                                    ?.toString()
                                    .split(',')
                                    .map((g: any) => g.trim())
                                    .filter((g: any) => g) || [];

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
                                spim_group_seq: groupSeqs.length === 1 ? groupSeqs[0] : 0,
                                group_seq: labour.group_seqs,
                                spim_id: labour.spim_id,
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

                        // this.service_details.Labour = this.laboursList
                        //     .sort((a, b) => (a.sp_pm_ordering || 0) - (b.sp_pm_ordering || 0))
                        //     .map((labour) => {
                        //         // const unit = parseFloat(labour.sp_labour_unit) || 0;
                        //         // const price = labourFactor * unit;

                        //         return {
                        //             Name: labour.sp_pm_id || null,
                        //             Description: labour.sp_pm_name || null,
                        //             applicable: labour.sp_labour_applicable || 0,
                        //             unit_type: labour.sp_pm_unit_type || null,
                        //             qty: labour.sp_labour_qty || null,
                        //             PRICE: labour.sp_pm_category == '1' ? labour.pm_price : null,
                        //             unit: labour.sp_labour_unit || null,
                        //             id: labour.pm_id ?? 0,
                        //             // PRICE: 0,
                        //             sp_labour_delete_flag: labour.sp_labour_delete_flag ?? 0,
                        //             sp_labour_id: labour.sp_labour_id ?? 0,
                        //             sp_pm_category: labour.sp_pm_category || 2,
                        //             old_price: 0,
                        //         };
                        //     });
                    }

                    this.getTotalServicePrice();
                }

                const allItems = [
                    ...(this.service_details?.parts || []),
                    ...(this.service_details?.consumables || []),
                    ...(this.service_details?.Labour || []),
                ];

                // console.log('service detailsss.parts', this.service_details.parts);

                // Step 1: Flatten all applicable group_seq values into individual IDs
                const applicableGroupSeqs = new Set(
                    allItems
                        .filter((item) => item.applicable === 1 && item.group_seq)
                        .flatMap((item) =>
                            item.group_seq
                                .toString()
                                .split(',')
                                .map((id: any) => id.trim())
                        )
                );

                // Step 2: Filter not applicable items whose *any* group ID is in applicableGroupSeqs
                this.notApplicableItems = allItems
                    .filter((item) => item.applicable === 0 && item.group_seq)
                    .filter((item) => {
                        const groupIds = item.group_seq
                            .toString()
                            .split(',')
                            .map((id: any) => id.trim());
                        return groupIds.some((id: any) => applicableGroupSeqs.has(id));
                    });

                // console.log('Not applicable items with applicable group siblings:', this.notApplicableItems);

                this.notApplicableItems = this.notApplicableItems.map((item) => ({
                    ...item,
                    selected: false,
                }));

                // Auto-open the modal if there are any unmarked items
                // if (this.notApplicableItems.length > 0) {
                //     this.selectedItemNames = [];
                //     this.markApplicableModal.open();
                // }

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

                        return {
                            PART_NO: null,
                            DESCRIPTION: part.spim_name,
                            Brand: '1235',
                            applicable: 0,
                            unit_type: part.sp_pm_unit_type || null, // fallback if undefined
                            qty: null,
                            PRICE: null,
                            id: 0,
                            old_price: 0,
                            sp_spare_labour_unit: null,
                            sp_spare_delete_flag: 0,
                            sp_pm_category: part.sp_pm_category,
                            sp_spare_id: 0,
                            spim_group_seq: groupSeqs.length === 1 ? groupSeqs[0] : 0,
                            group_seq: part.groupSeqs,
                            sp_pm_id: part.sp_pm_id || 0,
                            spim_id: part.spim_id,
                        };
                    });
                }

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

                        return {
                            PART_NO: null,
                            DESCRIPTION: part.spim_name,
                            Brand: '1235',
                            applicable: 0,
                            unit_type: part.sp_pm_unit_type || null,
                            qty: null,
                            PRICE: part.sp_pm_price,
                            id: 0,
                            old_price: 0,
                            sp_spare_labour_unit: null,
                            sp_spare_delete_flag: 0,
                            sp_pm_category: part.sp_pm_category,
                            sp_spare_id: 0,
                            spim_group_seq: groupSeqs.length === 1 ? groupSeqs[0] : 0,
                            group_seq: part.groupSeqs,
                            sp_pm_id: part.sp_pm_id || 0,
                            spim_id: part.spim_id,
                        };
                    });
                }

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

                        return {
                            Name: labour.sp_pm_id,
                            Description: labour.spim_name,
                            applicable: 0,
                            unit_type: labour.sp_pm_unit_type || null,
                            qty: null,
                            PRICE: null,
                            unit: null,
                            id: null,
                            sp_labour_delete_flag: 0,
                            sp_labour_id: 0,
                            sp_pm_category: labour.sp_pm_category,
                            old_price: 0,
                            group_seq: labour.groupSeqs,
                            spim_group_seq: groupSeqs.length === 1 ? groupSeqs[0] : 0,
                            spim_id: labour.spim_id,
                        };
                    });
                }
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
        let data = {
            part_no: item.PART_NO,
        };

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

        // this.userServices.getConsumablePrice(data).subscribe((rdata: any) => {
        //     if (rdata.ret_data == 'success') {
        //         item.PRICE = rdata.partsData.sp_pm_price || 0;
        //     } else {
        //         item.PRICE = null;
        //     }
        // });
    }

    checkPartPrice(spare: any) {
        let data = {
            part_id: spare.id,
            pm_price: spare.PRICE,
        };

        this.userServices.checkPartPrice(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                if (rdata.old_price != spare.PRICE) {
                    spare.old_price = rdata.old_price;
                }
            }
        });

        this.getPartPrice(spare);
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

    // addNewSpare() {
    //     this.service_details.parts.push({
    //         PART_NO: null,
    //         DESCRIPTION: null,
    //         Brand: null,
    //         applicable: 0,
    //         unit_type: null,
    //         qty: null,
    //         PRICE: null,
    //         old_price: 0,
    //         sp_spare_labour_unit: null,
    //         sp_spare_delete_flag: '0',
    //         sp_spare_id: '0',
    //         id: 0,
    //     });
    // }

    // deleteSpare(i: number, element: any) {
    //     Swal.fire({
    //         icon: 'warning',
    //         title: 'You are about to delete a spare, Are you sure?',
    //         text: "You won't be able to revert this!",
    //         showCancelButton: true,
    //         confirmButtonText: 'Delete',
    //         padding: '2em',
    //         customClass: 'sweet-alerts',
    //     }).then((result) => {
    //         if (result.value) {
    //             if (element.sp_spare_id != '0') {
    //                 element.sp_spare_delete_flag = '1';
    //             } else {
    //                 this.service_details.parts.splice(i, 1);
    //             }

    //             // this.service_details.parts.splice(i, 1);
    //             this.getTotalServicePrice();
    //         }
    //     });
    // }

    // getPartsForEngineNo(eng_id: any) {
    //     let data = {
    //         eng_id: this.engineNO,
    //     };
    //     this.userServices.getPartsForEngineNo(data).subscribe((rdata: any) => {
    //         if (rdata.ret_data == 'success') {
    //             this.enginePartsList = [];
    //             this.fullPartsData = rdata.partsList;
    //             rdata.partsList.forEach((item: any) => {
    //                 const existing = this.enginePartsList.find((e) => e.model_code === item.spmc_value);

    //                 const partTotal = Number(item.sp_spare_qty) * Number(item.pm_price);

    //                 if (existing) {
    //                     existing.price += partTotal;
    //                 } else {
    //                     this.enginePartsList.push({
    //                         eng_no: this.getSelectedEngineNo(),
    //                         model_code: item.spmc_value,
    //                         price: partTotal,
    //                     });
    //                 }
    //             });
    //             this.partsModal.open();
    //             this.changeLabourFactor(eng_id);
    //         } else {
    //             this.changeLabourFactor(eng_id);
    //             // this.coloredToast('danger', 'Some error occurred please try again');
    //         }
    //     });
    // }

    getPartsForEngineNo(eng_id: any) {
        let data = {
            eng_id: this.engineNO,
        };
        this.userServices.getPartsForEngineNo(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.enginePartsList = [];
                this.fullPartsData = rdata.partsList;
                rdata.partsList.forEach((item: any) => {
                    const existing = this.enginePartsList.find((e) => e.model_code === item.spmc_value);
                    const partTotal = Number(item.sp_spare_qty) * Number(item.pm_price);

                    if (existing) {
                        existing.price += partTotal;
                    } else {
                        this.enginePartsList.push({
                            eng_no: this.getSelectedEngineNo(),
                            model_code: item.spmc_value,
                            price: partTotal,
                        });
                    }
                });
                this.partsModal.open();
            }
        });

        // this.changeLabourFactor(eng_id);
    }

    // changeLabourFactor(eng_id: any) {
    //     if (eng_id) {
    //         const engine = this.engines.find((e: any) => e.eng_id == eng_id);
    //         // if (engine) {
    //         //     this.labourFactor = engine.eng_labour_factor;
    //         //     if (this.service_details.Labour && this.service_details.Labour.length > 0) {
    //         //         this.service_details.Labour = this.service_details.Labour.map((labour: any) => {
    //         //             const unit = parseFloat(labour.unit) || 0;
    //         //             const price = this.labourFactor * unit;

    //         //             return {
    //         //                 ...labour,
    //         //                 PRICE: price.toFixed(2),
    //         //             };
    //         //         });
    //         //     }

    //         //     this.getTotalServicePrice();
    //         // }
    //     }
    // }

    // addNewLabour() {
    //     this.service_details.Labour.push({
    //         Name: null,
    //         applicable: 0,
    //         unit_type: null,
    //         qty: null,
    //         PRICE: null,
    //         Description: null,
    //         unit: null,
    //         id: null,
    //         // PRICE: 0,
    //         sp_labour_delete_flag: 0,
    //         sp_labour_id: 0,
    //         sp_pm_category: null,
    //         sp_spare_delete_flag: 0,
    //         sp_spare_id: 0,
    //         old_price: 0,
    //     });
    // }

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

    // deleteLabour(i: number, element: any) {
    //     Swal.fire({
    //         icon: 'warning',
    //         title: 'You are about to delete a Labour, Are you sure?',
    //         text: "You won't be able to revert this!",
    //         showCancelButton: true,
    //         confirmButtonText: 'Delete',
    //         padding: '2em',
    //         customClass: 'sweet-alerts',
    //     }).then((result) => {
    //         if (result.value) {
    //             if (element.sp_labour_id != '0') {
    //                 element.sp_labour_delete_flag = '1';
    //             } else {
    //                 this.service_details.Labour.splice(i, 1);
    //             }
    //             // this.service_details.Labour.splice(i, 1);
    //             this.getTotalServicePrice();
    //         }
    //     });
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
        this.service_details.labour_unit = 0;
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
        // console.log('this.service_details.Labour', this.service_details.Labour);
        this.service_details.Labour.forEach((element2: any) => {
            if (element2.applicable == 1) {
                const labour_unit = parseFloat(element2.unit) || 0;
                if (!isNaN(labour_unit)) {
                    this.service_details.labour_unit += labour_unit;
                }
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

    // copyPartsToServiceDetails(partSummary: any) {
    //     const partsToCopy = this.fullPartsData.filter((item: any) => item.spmc_value == partSummary.model_code && item.sp_spare_delete_flag == 0);
    //     this.service_details.parts = partsToCopy.map((item: any) => ({
    //         PART_NO: item.pm_code || null,
    //         DESCRIPTION: item.pm_name?.trim() || null,
    //         Brand: item.brand_name || null,
    //         qty: Number(item.sp_spare_qty) || 0,
    //         PRICE: Number(item.pm_price) || 0,
    //         id: item.pm_id || null,
    //         sp_spare_labour_unit: item.sp_spare_labour_unit || 0,
    //         sp_spare_delete_flag: item.sp_spare_delete_flag || 0,
    //         sp_spare_id: 0,
    //     }));

    //     this.getTotalServicePrice();
    //     this.partsModal.close();
    // }

    onApplicableChange(labour: any, event: Event) {
        const checked = (event.target as HTMLInputElement).checked;
        labour.applicable = checked ? 1 : 0;

        const groupSeq = labour.spim_group_seq;

        // Only proceed if it's being checked and has a valid group
        if (checked && groupSeq && groupSeq != 0) {
            const allItems = [...this.service_details.parts, ...this.service_details.consumables, ...this.service_details.Labour];

            allItems.forEach((item: any) => {
                if (item.spim_group_seq == groupSeq) {
                    item.applicable = 1; // Force checked
                }
            });
        }

        this.getTotalServicePrice();
    }

    copyPartsToServiceDetails(partSummary: any) {
        // console.log('copy parts are>>>>>>>>>>>>>>>>>>', this.fullPartsData);
        const partsToCopy = this.fullPartsData.filter((item) => item.spmc_value === partSummary.model_code);

        partsToCopy.forEach((item) => {
            const partCode = item.pm_code || '';
            const partName = item.pm_name?.trim() || '';
            const partId = item.pm_id || null;

            const existingPart = this.service_details.parts.find(
                (p: any) => p.PART_NO === partCode || p.DESCRIPTION?.trim().toLowerCase() === partName.toLowerCase() || p.id === partId
            );

            if (existingPart) {
                // Patch the existing part
                existingPart.DESCRIPTION = partName;
                existingPart.Brand = item.pm_brand || existingPart.Brand;
                existingPart.qty = Number(item.sp_spare_qty) || existingPart.qty;
                existingPart.PRICE = Number(item.pm_price) || existingPart.PRICE;
                existingPart.id = partId;
                existingPart.PART_NO = partCode;
                existingPart.applicable = 1;
            } else {
                // Add as new part
                this.service_details.parts.push({
                    PART_NO: partCode,
                    DESCRIPTION: partName,
                    Brand: item.pm_brand || null,
                    qty: Number(item.sp_spare_qty) || 0,
                    PRICE: Number(item.pm_price) || 0,
                    id: partId,
                    applicable: 1,
                    unit_type: item.pm_unit_type ?? null,
                    old_price: item.pm_price ?? 0,
                    sp_spare_labour_unit: item.sp_spare_labour_unit || null,
                    sp_spare_delete_flag: item.sp_spare_delete_flag || 0,
                    sp_pm_category: 1,
                    sp_spare_id: 0,
                    spim_group_seq: 0,
                    group_seq: item.group_seqs,
                    spim_id: item.spim_id,
                });
            }
        });

        this.getTotalServicePrice();
        this.partsModal.close();
    }

    saveServicePackage(type: number) {
        // --- Pending warnings (red SVG) check (run only if not bypassed) ---
        if (!this.pendingWarningBypass && type != 6) {
            const warningIcons = document.querySelectorAll('svg[title="Multiple group items"][fill="red"]');
            if (warningIcons.length > 1) {
                Swal.fire({
                    html: `
  <!-- Icon row -->
  <div style="display:flex;justify-content:center;margin-bottom:12px;">
    <svg viewBox="0 0 24 24" width="48" height="48" style="width:48px;height:48px;" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="#d32f2f"
        d="M1.45 20.16c-.75.9-.09 2.19 1.02 2.19h19.06c1.11 0 1.77-1.29 1.02-2.19L13.14 4.34c-.75-.9-2.07-.9-2.82 0L1.45 20.16zM12 8.5c.41 0 .75.34.75.75v4.5a.75.75 0 0 1-1.5 0v-4.5c0-.41.34-.75.75-.75zm0 8.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
    </svg>
  </div>

  <!-- Title row -->
  <div style="text-align:center;color:#d32f2f;font-weight:700;font-size:20px;margin-bottom:8px;">
    Multiple Group Item Warning
  </div>

  <!-- Message row -->
  <div style="text-align:center;font-size:15px;color:#444;line-height:1.4;">
    There are multiple group item warnings on this page. Please clear them before proceeding.
  </div>
`,

                    showCancelButton: true,
                    confirmButtonText: 'Proceed Anyway',
                    cancelButtonText: 'Cancel',
                    allowOutsideClick: false,
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Bypass the pending-warning check for this immediate re-call
                        this.pendingWarningBypass = true;
                        // Re-run saveServicePackage so the rest of the validation (including the second swal) runs
                        this.saveServicePackage(type);
                    }
                    // If cancelled, do nothing
                });

                return; // Stop here until user chooses
            }
        }

        if (type == 6) {
            this.draftButtonFlag = true;
            this.service_details.draft_flag = 1;
            this.service_details.spmc_status_flag = 3;
        } else {
            this.service_details.draft_flag = 0;
            if (this.spStatus != 5) {
                this.service_details.spmc_status_flag = 3;
            } else {
                this.service_details.spmc_status_flag = 5;
            }
            this.saveFlag = true;
        }

        if (type != 6) {
            if (this.engineNO == null || this.engineNO == '') {
                this.coloredToast('danger', 'Engine Number is mandatory!');
                this.saveFlag = false;
                this.draftButtonFlag = false;
                this.pendingWarningBypass = false; // reset
                return;
            }

            if (this.service_details.parts.length === 0) {
                this.coloredToast('danger', 'At least one part is required to create a service.');
                this.saveFlag = false;
                this.draftButtonFlag = false;
                this.pendingWarningBypass = false; // reset
                return;
            }
            // Parts check
            // if (this.service_details.parts.length > 0) {
            //     // ✅ Filter only applicable parts (where applicable == 1)
            //     const applicableParts = this.service_details.parts.filter((part: any) => part.applicable == 1);
            //     // ✅ Check if all required fields are filled in applicable parts
            //     const allFieldsHaveValue = applicableParts.every((part: any) => {
            //         const valuesFilled = Object.entries(part)
            //             .filter(([key, _]) => key != 'sp_spare_labour_unit')
            //             .every(([_, value]) => value !== null && value !== '' && value !== undefined);

            //         const priceValid = part.PRICE !== 0 && part.PRICE !== '0' && part.PRICE !== 0.0;
            //         return valuesFilled && priceValid;
            //     });
            //     console.log("service detailsssss",this.service_details)
            //     console.log("all fields have value",allFieldsHaveValue)

            //     if (!allFieldsHaveValue) {
            //         this.coloredToast('danger', 'Please fill in all fields and ensure price is not zero for applicable parts.');
            //         this.saveFlag = false;
            //         this.draftButtonFlag = false;
            //         return;
            //     }
            // }
            if (this.service_details.parts.length > 0) {
                // ✅ Filter only applicable parts (where applicable == 1 or '1')
                const applicableParts = this.service_details.parts.filter((part: any) => part.applicable == 1 || part.applicable === '1');

                // console.log('✅ Applicable Parts:', applicableParts);

                // ✅ Find parts that are failing validation
                const failedParts = applicableParts.filter((part: any, index: number) => {
                    // Exclude this field from the value checks
                    const ignoredKeys = ['sp_spare_labour_unit', 'group_seq'];

                    // Check all required fields are filled (except ignored keys)
                    const valuesFilled = Object.entries(part)
                        .filter(([key]) => !ignoredKeys.includes(key))
                        .every(([key, value]) => {
                            const isValid = value !== null && value !== '' && value !== undefined;
                            if (!isValid) {
                                // console.warn(`❌ Field '${key}' is invalid in part #${index}:`, value);
                            }
                            return isValid;
                        });

                    // Check if price is a positive number
                    const priceValid = parseFloat(part.PRICE) > 0;
                    if (!priceValid) {
                        // console.warn(`❌ PRICE is invalid in part #${index}:`, part.PRICE);
                    }

                    // Return parts that fail either check
                    return !(valuesFilled && priceValid);
                });

                // ✅ If any parts failed, show the toast
                if (failedParts.length > 0) {
                    // console.error('❌ Failed Parts Validation:', failedParts);

                    this.coloredToast('danger', 'Please fill in all fields and ensure price is not zero for applicable parts.');
                    this.saveFlag = false;
                    this.draftButtonFlag = false;
                    this.pendingWarningBypass = false; // reset
                    return;
                }

                // console.log('✅ All applicable parts passed validation.');
            } else {
                this.coloredToast('danger', 'At least one part is required to create a service.');
                this.saveFlag = false;
                this.draftButtonFlag = false;
                this.pendingWarningBypass = false; // reset
                return;
            }

            // Consumbales Validation check
            if (this.service_details.consumables.length > 0) {
                const applicableParts = this.service_details.consumables.filter((part: any) => part.applicable == 1);

                const allFieldsHaveValue = applicableParts.every((part: any, index: number) => {
                    const ignoredKeys = ['sp_spare_labour_unit', 'group_seq'];

                    let isValid = true;

                    Object.entries(part)
                        .filter(([key, _]) => !ignoredKeys.includes(key))
                        .forEach(([key, value]) => {
                            if (value === null || value === '' || value === undefined) {
                                console.warn(`❌ Missing or invalid field in part #${index + 1} [${key}]:`, value);
                                isValid = false;
                            }
                        });

                    const priceValid = part.PRICE !== 0 && part.PRICE !== '0' && part.PRICE !== 0.0;
                    if (!priceValid) {
                        console.warn(`❌ Invalid PRICE in part #${index + 1}:`, part.PRICE);
                        isValid = false;
                    }

                    return isValid;
                });

                // console.log('allFieldsHaveValue>>>>>>>>>>', allFieldsHaveValue);

                if (!allFieldsHaveValue) {
                    this.coloredToast('danger', 'Please fill in all fields and ensure price is not zero for applicable consumables.');
                    this.saveFlag = false;
                    this.draftButtonFlag = false;
                    this.pendingWarningBypass = false; // reset
                    return;
                }
            } else {
                this.coloredToast('danger', 'At least one consumable is required to create a service.');
                this.saveFlag = false;
                this.draftButtonFlag = false;
                this.pendingWarningBypass = false; // reset
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
                    this.pendingWarningBypass = false; // reset
                    return;
                }
            }
        }

        // if (this.service_details.Labour.length > 0) {
        //     const labourValid = this.service_details.Labour.every(
        //         (labour: any) =>
        //             Object.values(labour).every((value) => value !== null && value !== '' && value !== undefined) &&
        //             labour.unit !== 0 &&
        //             labour.unit !== null &&
        //             labour.unit !== ''
        //     );

        //     if (!labourValid) {
        //         this.coloredToast('danger', 'Please fill in all fields and ensure unit is not 0 for each labour entry.');
        //         this.saveFlag = false;
        //         this.draftButtonFlag = false;
        //         return;
        //     }
        // }

        this.service_details.user_id = atob(atob(localStorage.getItem('us_id') || '{}'));
        this.service_details.engine_id = this.engineNO;
        this.service_details.user_role = atob(atob(localStorage.getItem('us_role_id') || '{}'));
        this.service_details.vin_no = this.vin_no;
        this.service_details.spmc_type = this.model_code_type;
        this.service_details.branch_id = environment.branch_id;

        // this.service_details.spmc_status_flag = type;

        const allItems = [
            ...this.service_details.parts.map((item: any) => ({ ...item, type: 'part', name: item.DESCRIPTION || item.Description })),
            ...this.service_details.consumables.map((item: any) => ({ ...item, type: 'consumable', name: item.DESCRIPTION || item.Description })),
            ...this.service_details.Labour.map((item: any) => ({ ...item, type: 'labour', name: item.DESCRIPTION || item.Description })),
        ];

        const applicableGroupSeqs = new Set(
            allItems.filter((item: any) => item.applicable == 1 && item.spim_group_seq != '0').map((item: any) => item.spim_group_seq)
        );

        const mismatchedItems = allItems.filter(
            (item: any) => item.applicable != 1 && item.spim_group_seq != '0' && applicableGroupSeqs.has(item.spim_group_seq)
        );

        // console.log('this.mismatchedItems>>>>>>>>>>>>', mismatchedItems);
        const groupedItems: Record<string, string[]> = {};
        let itemListHtml = '';

        const finalSpimIds = this.finalSelectedItems.map((item: any) => item.spim_id);

        const missingItems = finalSpimIds.filter((spim_id: any) => {
            const match = allItems.find((item: any) => item.spim_id == spim_id && item.applicable == 1);
            return !match;
        });

        const mismatchedItemsId = this.finalSelectedItems.filter((item: any) => missingItems.includes(item.spim_id));
        // console.log('mismatchedItemsId', mismatchedItemsId);

        if (missingItems.length > 0) {
            this.coloredToast('danger', 'Some selected items are not marked as applicable.');

            // Build HTML list of mismatched item names
            itemListHtml = `
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-bottom: 15px;">
        ${mismatchedItemsId
            .map(
                (item: any, index: number) => `
            <div style="flex: 0 0 calc(33.33% - 10px); font-weight: 700; font-size: 13.5px; text-align: left;">
                ${index + 1}. ${item.spim_name}
            </div>
        `
            )
            .join('')}
        </div>`;

            Swal.fire({
                title: 'Attention: Grouped Items are Left Unchecked.',
                html: `${itemListHtml}
            <div style="margin-top: 15px; font-size: 14.5px; font-weight: 700; color: #222; text-align: center;">
                Some items are not marked as applicable. <br/>Proceed or mark them as applicable?
            </div>`,
                width: '700px',
                icon: 'warning',
                allowOutsideClick: false,
                showCancelButton: true,
                showDenyButton: true,
                confirmButtonText: 'Proceed',
                denyButtonText: 'Mark as Applicable',
                cancelButtonText: 'Cancel',
            }).then((result) => {
                if (result.isConfirmed) {
                    this.saveLabourAndParts(this.service_details, type);
                } else if (result.isDenied) {
                    const mismatchedNames = new Set(mismatchedItemsId.map((item: any) => item.spim_name));

                    ['parts', 'Labour', 'consumables'].forEach((key: string) => {
                        this.service_details[key] = this.service_details[key].map((item: any) => {
                            const itemName = item.DESCRIPTION || item.Description || item.spim_name;
                            if (mismatchedNames.has(itemName) && item.spim_group_seq != '0') {
                                return { ...item, applicable: 1 };
                            }
                            return item;
                        });
                    });
                    this.saveFlag = false;
                    this.draftButtonFlag = false;
                } else {
                    // user cancelled the second swal
                    // reset bypass so future saves check the red SVG again
                    this.pendingWarningBypass = false;
                    this.saveFlag = false;
                    this.draftButtonFlag = false;
                }
            });
            this.saveFlag = false;
        } else {
            this.saveLabourAndParts(this.service_details, type);
        }

        // some items of same group are not selected as applicable....
        //         if (mismatchedItems.length > 0 && type != 6) {
        //             itemListHtml = `
        //     <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-bottom: 15px;">
        //     ${mismatchedItems
        //         .map(
        //             (item: any, index: number) => `
        //         <div style="flex: 0 0 calc(33.33% - 10px); font-weight: 700; font-size: 13.5px; text-align: left;">
        //             ${index + 1}. ${item.name}
        //         </div>
        //     `
        //         )
        //         .join('')}
        // </div>`;

        //             Swal.fire({
        //                 title: 'Attention: Incomplete Service Package Items',
        //                 html: `${itemListHtml} <div style="margin-top: 15px; font-size: 14.5px; font-weight: 700; color: #222; text-align: center;">
        //             Some items are not marked as applicable. <br/>Proceed or mark them as applicable?
        //         </div>`,
        //                 width: '700px',
        //                 icon: 'warning',
        //                 allowOutsideClick: false,
        //                 showCancelButton: true,
        //                 showDenyButton: true,
        //                 confirmButtonText: 'Proceed',
        //                 denyButtonText: 'Mark as Applicable',
        //                 cancelButtonText: 'Cancel',
        //             }).then((result) => {
        //                 if (result.isConfirmed) {
        //                     //FUNCTION IS CALLED TO SAVE THE ITEMSSS
        //                     this.saveLabourAndParts(this.service_details, type);
        //                     // console.log('Proceeding without changes.');
        //                 } else if (result.isDenied) {
        //                     const mismatchedNames = new Set(mismatchedItems.map((item: any) => item.name));

        //                     ['parts', 'Labour', 'consumables'].forEach((key: string) => {
        //                         this.service_details[key] = this.service_details[key].map((item: any) => {
        //                             const itemName = item.DESCRIPTION || item.Description;
        //                             if (mismatchedNames.has(itemName) && item.spim_group_seq != '0') {
        //                                 return { ...item, applicable: 1 };
        //                             }
        //                             return item;
        //                         });
        //                     });
        //                 } else {
        //                 }
        //             });
        //             this.saveFlag = false;
        //         }

        if (this.service_details.Labour.length > 0) {
        } else {
            this.coloredToast('danger', 'Labours are Required For Service Package');
        }
    }

    saveLabourAndParts(service_details: any, type: number) {
        // console.log('hgfhgfhgfhfhgdfh', service_details);
        this.userServices.saveServicePackageLabours(service_details).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                const allowedRoles = [1, 2, 10, 13];
                if (allowedRoles.includes(Number(this.user_role))) {
                    if (type == 6) {
                        this.router.navigateByUrl('servicePackageRequested');
                        this.draftButtonFlag = false;
                        this.saveFlag = false;
                        this.coloredToast('info', 'Service package Parts And Labour have been saved as draft.');
                    } else {
                        const encodedModel = btoa(this.model_code);
                        const encodedModelType = btoa(this.model_code_type);

                        this.router.navigate(['servicePackageKm', encodedModel, encodedModelType]);
                        this.draftButtonFlag = false;
                        this.saveFlag = false;
                        this.coloredToast('success', 'Service package Parts And Labour have been updated successfully.');
                    }
                } else {
                    this.router.navigateByUrl('servicePackageRequested');
                    this.draftButtonFlag = false;
                    this.saveFlag = false;
                    if (type == 6) {
                        this.coloredToast('info', 'Service package Parts And Labour have been saved as draft.');
                    } else {
                        this.coloredToast('success', 'Service package Parts And Labour have been updated successfully.');
                    }
                }
            } else {
                this.saveFlag = false;
                this.draftButtonFlag = false;
                this.coloredToast('danger', 'Some error occurred , Please try again');
            }
            this.pendingWarningBypass = false;
        });
    }

    // Collect names of selected items (used in modal display)
    onItemSelectionChange(): void {
        this.selectedItemNames = this.notApplicableItems
            .filter((item) => item.selected)
            .map((item) => item.DESCRIPTION || item.Description || item.name || 'Unnamed');
    }

    // User clicked "Mark All as Applicable"
    markAllItemsAsApplicable(): void {
        this.notApplicableItems.forEach((item) => {
            item.applicable = 1;
        });

        this.updateApplicableItems(this.notApplicableItems);
        this.closeApplicableModal();
    }

    // User clicked "Mark Selected as Applicable"
    submitSelectedApplicableItems(): void {
        const selectedItems = this.notApplicableItems.filter((item) => item.selected);

        selectedItems.forEach((item) => {
            item.applicable = 1;
        });

        this.updateApplicableItems(selectedItems);
        this.closeApplicableModal();
    }

    // Hook to update backend or state, if needed
    updateApplicableItems(updatedItems: any[]): void {
        // console.log('✅ Items marked as applicable:', updatedItems);

        // Example: update main service_details object
        this.service_details.parts = this.updateItems(this.service_details.parts, updatedItems);
        this.service_details.consumables = this.updateItems(this.service_details.consumables, updatedItems);
        this.service_details.Labour = this.updateItems(this.service_details.Labour, updatedItems);

        // TODO: Optionally sync with backend via API call
    }

    // Replace items in original arrays with updated applicable values
    updateItems(original: any[] = [], updated: any[] = []): any[] {
        return original.map((item) => {
            const updatedItem = updated.find((u) => u.id === item.id);
            return updatedItem ? { ...item, applicable: updatedItem.applicable } : item;
        });
    }

    // Cancel or close modal
    closeApplicableModal(): void {
        this.markApplicableModal.close();
        this.selectedItemNames = [];
    }

    onLabourUnitChange(labour: any) {
        // console.log('labourFactor>>>>>>>>>>>>', this.labourFactor);
        const unit = parseFloat(labour.unit) || 0;
        const price = this.labourFactor * unit;
        labour.PRICE = price.toFixed(2); // for numeric value like 105.00
        this.getTotalServicePrice();
    }

    openUnselectedPartsModal(modalRef: any): void {
        this.unselectedSpareParts = this.service_details.parts.filter((part: any) => part.applicable == 0);
        modalRef.open();
    }

    onPartSelectionChange(): void {
        this.selectedPartNames = this.unselectedSpareParts.filter((p) => p.selected).map((p) => p.DESCRIPTION || p.PART_NO || 'Unnamed Part');
    }

    submitPartsToAdvisor(): void {
        if (this.isSubmittingPart) return; // block multiple clicks

        this.isSubmittingPart = true;
        const selectedParts = this.unselectedSpareParts.filter((p) => p.selected);
        if (selectedParts.length === 0) {
            this.isSubmittingPart = false;
            this.coloredToast('danger', 'Please select at least one part to return.');
            return;
        }
        let selectpartsName = selectedParts.filter((parts: any) => parts.DESCRIPTION).map((parts: any) => parts.DESCRIPTION);

        const data = {
            modelcode: this.model_code,
            model_code_type: this.model_code_type,
            selectpartsName: selectpartsName,
            note: this.noteToSupervisor,
            returnType: '1', //LABOUR
        };

        this.userServices.returnToSupervisor(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.coloredToast('success', 'Parts returned to Part Advisor.');
            } else {
                this.coloredToast('danger', 'Error returning Labours.');
            }
        });

        this.unselectedPartsModal.close();
    }
    //PARTS END

    //  LABOURS AND CONSUMABLESSSSSSSSS....
    openunselectedLabourModal(modalRef: any): void {
        this.unselectedLabour = [
            ...this.service_details.Labour.filter((part: any) => part.applicable == 0),
            ...this.service_details.consumables.filter((part: any) => part.applicable == 0),
        ];

        modalRef.open();
    }

    onLabourSelectionChange(): void {
        this.selectedLabourNames = this.unselectedLabour.filter((p) => p.selected).map((p) => p.Description || p.DESCRIPTION || 'Unnamed Part');
    }

    submitLabourToSupervisor(): void {
        if (this.isSubmittingLabour) return;

        this.isSubmittingLabour = true;

        const selectedLabour = this.unselectedLabour.filter((p) => p.selected);
        if (selectedLabour.length === 0) {
            this.isSubmittingLabour = false;
            this.coloredToast('danger', 'Please select at least one Labour to return.');
            return;
        }

        let selectLabourName = selectedLabour.filter((parts: any) => parts.Description).map((parts: any) => parts.Description);
        const data = {
            modelcode: this.model_code,
            model_code_type: this.model_code_type,
            selectLabourName: selectLabourName,
            note: this.noteToSupervisor,
            returnType: '2', //LABOUR
        };

        this.userServices.returnToSupervisor(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.coloredToast('success', 'Labours returned to Supervisor.');
            } else {
                this.coloredToast('danger', 'Error returning Labours.');
            }
        });

        this.unselectedLabourModal.close();
    }

    fetchGroupDetails(spim_id: string, spare: any) {
        this.currentGroupTargetSpare = spare;
        this.groupSelection = {}; // 👈 Add this line
        this.selectedItemsWithIds = []; // Also reset previously selected group

        const data = {
            sp_pm_id: spim_id,
        };
        this.userServices.getGroupsByPmId(data).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                // Prepare grouped items with `.selected` flags
                this.groupedItems = rdata.groupedItems;

                // for (const groupId in rdata.groupedItems) {
                //     this.groupedItems[groupId] = rdata.groupedItems[groupId].map((item: any) => ({
                //         ...item,
                //         selected: false,
                //     }));
                // }

                // Clear previous selections
                this.selectedGroupItemNames = [];

                // Open the modal
                if (this.groupedItems) {
                    this.groupItemsModal.open();
                }
            }
        });
    }

    getItemNamesForGroup(groupId: any): string {
        const group = this.groupedItems?.[groupId];
        if (!Array.isArray(group)) return '';
        return group.map((item) => item.spim_name).join(', ');
    }

    // onGroupToggle(groupId: any): void {
    //     // this.buttonFlag=true
    //     // if(this.buttonFlag) return;

    //     const selected = this.groupSelection[groupId];
    //     const groupItems = this.groupedItems[groupId];

    //     console.log('selected:', selected);
    //     console.log('groupItems:', groupItems);

    //     // Make sure groupItems is an array of objects with spim_id and name
    //     if (!Array.isArray(groupItems) || groupItems.length === 0 || typeof groupItems[0] !== 'object') {
    //         console.warn('Invalid groupItems format for groupId:', groupId);
    //         return;
    //     }

    //     if (selected) {
    //         // Add items that are not already selected
    //         groupItems.forEach((item) => {
    //             const exists = this.selectedItemsWithIds.some((i) => i.spim_id === item.spim_id);
    //             if (!exists) {
    //                 this.selectedItemsWithIds.push({
    //                     spim_id: item.spim_id,
    //                     name: item.name || item.spim_name || 'Unnamed Item',
    //                 });
    //             }
    //         });
    //         // this.buttonFlag=false
    //     } else {
    //         // Remove all items from this group
    //         const groupIds = new Set(groupItems.map((gItem) => gItem.spim_id));
    //         this.selectedItemsWithIds = this.selectedItemsWithIds.filter((item) => !groupIds.has(item.spim_id));
    //         // this.buttonFlag=false
    //     }

    //     console.log('✅ selectedItemsWithIds:', this.selectedItemsWithIds);
    // }

    // onSingleGroupSelect(groupId: any): void {
    //     // Deselect all groups
    //     Object.keys(this.groupSelection).forEach((key) => {
    //         this.groupSelection[key] = false;
    //     });

    //     // Select the clicked one
    //     this.groupSelection[groupId] = true;

    //     // Get the group items
    //     const groupItems = this.groupedItems[groupId];
    //     if (!Array.isArray(groupItems)) return;

    //     // Set only this group's items
    //     this.selectedItemsWithIds = groupItems.map((item: any) => ({
    //         ...item,
    //         group_id: groupId,
    //     }));
    //     console.log('this.selectedItemsWithIds', this.selectedItemsWithIds);

    //     console.log('this.selectedItemsWithIds 11123', this.selectedItemsWithIds);
    //     console.log('this.service_details 1223', this.service_details);

    //     const selectedMap = new Map(this.selectedItemsWithIds.map((item: any) => [item.spim_id, item.group_id]));

    //     // Loop through all service items
    //     ['parts', 'consumables', 'Labour'].forEach((key) => {
    //         const items = this.service_details[key];
    //         if (!Array.isArray(items)) return;

    //         items.forEach((item: any) => {
    //             const groupId = selectedMap.get(item.spim_id);
    //             if (groupId) {
    //                 item.spim_group_seq = groupId; // Set the group ID
    //             }
    //         });
    //     });

    //     this.selectedItemsWithIds.forEach((item) => {
    //         const exists = this.finalSelectedItems.some((i) => i.spim_id === item.spim_id);
    //         if (!exists) {
    //             this.finalSelectedItems.push(item);
    //         }
    //     });

    //     // ✅ Update the correct spare’s group_seq
    //     if (this.currentGroupTargetSpare) {
    //         this.currentGroupTargetSpare.group_seq = groupId;
    //         console.log('🔁 Updated group_seq of current item:', groupId);
    //     }
    // }

    onSingleGroupSelect(groupId: any): void {
        // Deselect all groups
        Object.keys(this.groupSelection).forEach((key) => {
            this.groupSelection[key] = false;
        });

        this.groupSelection[groupId] = true;

        const groupItems = this.groupedItems[groupId];
        if (!Array.isArray(groupItems)) return;

        this.selectedItemsWithIds = groupItems.map((item: any) => ({
            ...item,
            group_id: groupId,
        }));

        const selectedMap = new Map(this.selectedItemsWithIds.map((item: any) => [item.spim_id, item.group_id]));

        ['parts', 'consumables', 'Labour'].forEach((key) => {
            const items = this.service_details[key];
            if (!Array.isArray(items)) return;

            items.forEach((item: any) => {
                const mappedGroupId = selectedMap.get(item.spim_id);
                if (mappedGroupId) {
                    item.spim_group_seq = mappedGroupId;
                }
            });
        });

        // Optional: clear existing selected ones from this group before pushing
        this.finalSelectedItems = this.finalSelectedItems.filter((i) => !selectedMap.has(i.spim_id));
        this.finalSelectedItems.push(...this.selectedItemsWithIds);

        if (this.currentGroupTargetSpare) {
            this.currentGroupTargetSpare.group_seq = groupId;
        }
    }

    toggleGroupSelection(groupId: string, event: any) {
        const isChecked = event.target.checked;

        // Deselect all first
        Object.keys(this.groupSelection).forEach((key) => {
            this.groupSelection[key] = false;
        });

        // Set current selection
        this.groupSelection[groupId] = isChecked;

        if (isChecked) {
            // this.onSingleGroupSelect(groupId);
        } else {
            this.selectedItemsWithIds = [];
        }
    }

    onSubmitSelectedItems(): void {
        const selectedGroupId = Object.keys(this.groupSelection).find((key) => this.groupSelection[key] === true);

        if (selectedGroupId) {
            this.onSingleGroupSelect(selectedGroupId);
        } else {
            // console.warn('No group selected');
        }

        // console.log('✅ Final Selected Items:', this.finalSelectedItems);
        this.groupItemsModal.close();
    }

    fetchGroupItems(singleGroupSpims: any[]) {
        this.userServices.getItemsBySpimIds({ spim_ids: singleGroupSpims }).subscribe((resp: any) => {
            if (resp.ret_data === 'success' && Array.isArray(resp.data)) {
                const newItems = resp.data;

                // 🧼 Step 3: Add to finalSelectedItems, avoiding duplicates by spim_id
                const existingIds = new Set(this.finalSelectedItems.map((item) => item.spim_id));
                const uniqueItems = newItems.filter((item: any) => !existingIds.has(item.spim_id));

                this.finalSelectedItems.push(...uniqueItems);
            } else {
                // console.warn('⚠️ Failed to fetch items for single-group spims:', resp);
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

    getGroupKeys(obj: any): string[] {
        return Object.keys(obj);
    }
}
