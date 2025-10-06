import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';

@Component({
    selector: 'app-service-pkg-parts-setup',
    templateUrl: './service-pkg-parts-setup.component.html',
    styleUrls: ['./service-pkg-parts-setup.component.css'],
})
export class ServicePkgPartsSetupComponent implements OnInit {
    public model_code: string;
    public engines: any = [];
    public engineNO: any;
    public descriptions: any[] = [];
    public partcodes: any[] = [];
    public partsList: any[] = [];
    public filteredList: any[] = [];
    public enginePartsList: any[] = [];
    public fullPartsData: any[] = [];
    public vin_no: any;
    public variant: any;
    public model_year: any;
    public requestedServicePackage: any;
    public saveFlag: boolean = false;
    public spareSearch = 'item_name';
    public spareCodeSearch = 'item_name';
    public brandList = [];
    public SPSpareParts = [];
    public draftFlag: boolean = false;
    public load_flag: boolean = true;
    public draftButtonFlag: boolean = false;
    public spStatus: any;
    public searchPartcode = new Subject<string>();
    searchText: any;

    @ViewChild('partsModal') partsModal: any;

    service_details: any = [];

    constructor(public router: Router, private userServices: StaffPostAuthService, public datePipe: DatePipe, private activeRouter: ActivatedRoute) {
        this.model_code = atob(this.activeRouter.snapshot.paramMap.get('id') || '');
        this.service_details = {
            model_code: this.model_code,
            engine_id: 0,
            TotalPrice: 0,
            user_id: 0,
            parts: [
                // {
                //     PART_NO: null,
                //     DESCRIPTION: null,
                //     Brand: null,
                //     applicable: '0',
                //     unit_type: '0',
                //     qty: null,
                //     PRICE: null,
                //     id: 0,
                //     old_price: 0,
                //     sp_spare_id: 0,
                // },
            ],
        };

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
                switch (this.requestedServicePackage.spmc_status_flag) {
                    case '0':
                        this.spStatus = 1;
                        break;
                    case '2':
                        this.spStatus = 3;
                        break;
                    case '7':
                        this.spStatus = 3;
                        break;
                    case '9':
                        this.spStatus = 8;
                        break;
                    default:
                        this.spStatus = this.requestedServicePackage.spmc_status_flag;
                }

                // this.getDraftIems();
                // this.getServicepackage();
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
        //                 this.spStatus = 1;
        //                 break;
        //             case '2':
        //                 this.spStatus = 3;
        //                 break;
        //             case '7':
        //                 this.spStatus = 3;
        //                 break;
        //             case '9':
        //                 this.spStatus = 8;
        //                 break;
        //             default:
        //                 this.spStatus = this.requestedServicePackage.spmc_status_flag;
        //         }

        //         this.getDraftIems();
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

        // this.userServices.getSparePartsDesandPart().subscribe((rdata: any) => {
        //     if (rdata.ret_data == 'success') {
        //         this.descriptions = rdata.descriptions.map(function (i: any) {
        //             return i.inv_item_description;
        //         });
        //         this.partcodes = rdata.partNo.map(function (i: any) {
        //             return i.inv_item_part_number;
        //         });
        //     } else {
        //         // this.coloredToast('danger', 'Some error occurred please try again');
        //     }
        // });

        this.userServices.getAllPartsList().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.partsList = rdata.parts;
            }
        });

        // this.userServices.getAllPartsDetails().subscribe((rdata: any) => {
        //     if (rdata.ret_data == 'success') {
        //         this.partsList = rdata.spareParts;
        //         // this.partcodes = this.partsList.map((part: any) => part.pm_code);
        //     }
        // });

        this.userServices.getServicePackageParts().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.partcodes = rdata.SPSpareParts.filter((part: any) => part.sp_pm_category == '0').map((part: any) => part.sp_pm_code);

                // Get accessible parts (access == '0') AND distinct by name
                const accessibleParts = this.distinctByName(
                    rdata.SPSpareParts.filter((part: any) => part.sp_pm_access === '0'),
                    'spim_name'
                ).sort((a: any, b: any) => a.sp_pm_ordering - b.sp_pm_ordering);

                // Step 2: Sort by ordering
                const sortedParts = accessibleParts.sort((a: any, b: any) => a.sp_pm_ordering - b.sp_pm_ordering);

                // Step 3: Map descriptions
                this.descriptions = sortedParts.map((i: any) => i.spim_name);

                // 1. Get the set of existing DESCRIPTION values
                const existingDescriptions = new Set(this.service_details.parts.map((part: any) => part.DESCRIPTION?.trim().toLowerCase()));

                // 2. Filter sortedParts to exclude any that already exist by DESCRIPTION
                const newParts = sortedParts
                    .filter((part: any) => {
                        const desc = part.spim_name?.trim().toLowerCase();
                        return !existingDescriptions.has(desc);
                    })
                    .map((part: any) => {
                        const groupSeqs =
                            part.group_seqs
                                ?.toString()
                                .split(',')
                                .map((g: any) => g.trim())
                                .filter((g: any) => g) || [];

                        const group_seq =
                            part.sp_spare_group_seq && part.sp_spare_group_seq !== 0 ? part.sp_spare_group_seq : groupSeqs.length === 1 ? groupSeqs[0] : 0;

                        return {
                            PART_NO: null,
                            DESCRIPTION: part.spim_name,
                            Brand: '1235',
                            applicable: this.requestedServicePackage.spmc_draft_flag !== '1' ? 1 : 0,
                            unit_type: part.sp_pm_unit_type || 0,
                            qty: null,
                            PRICE: null,
                            id: 0,
                            old_price: 0,
                            sp_spare_id: 0,
                            ordering: part.sp_pm_ordering || 0,
                            group_seq: group_seq, // ✅ Final value set here
                            sp_pm_id: part.sp_pm_id || 0,
                        };
                    });

                // 3. Append the new parts
                this.service_details.parts.push(...newParts);

                // If you want the whole parts array sorted by ordering again:
                this.service_details.parts.sort((a: any, b: any) => a.ordering - b.ordering);

                // this.getTotalServicePrice();

                // this.load_flag = false;

                this.getDraftIems();
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

        this.searchPartcode
            .pipe(
                debounceTime(1000), // Adjust this value to delay the API call (500ms is ideal)
                distinctUntilChanged()
            )
            .subscribe(() => {
                this.searchPartcodePrice();
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

    // getDraftIems() {
    //     const data = {
    //         modelId: this.requestedServicePackage.spmc_id,
    //     };
    //     this.userServices.getDraftItems(data).subscribe((rdata: any) => {
    //         if (rdata.ret_data == 'success') {
    //             this.draftFlag = true;
    //             this.engineNO = rdata.draftItems.engines.speng_eng_id;
    //             this.service_details.parts = rdata.draftItems.parts.map((part: any) => ({
    //                 applicable: part.sp_spare_applicable,
    //                 DESCRIPTION: part.pm_name ?? null,
    //                 PART_NO: part.pm_code,
    //                 Brand: part.pm_brand ?? null,
    //                 unit_type: part.pm_unit_type ?? null,
    //                 qty: part.sp_spare_qty > 0 ? part.sp_spare_qty : null,
    //                 PRICE: part.pm_new_price != '0' ? part.pm_new_price : part.pm_price,
    //                 id: part.pm_id ?? null,
    //                 old_price: part.pm_price ?? null,
    //                 sp_spare_id: part.sp_spare_id ?? 0,
    //             }));
    //             this.getServicepackage();
    //         } else {
    //             this.getServicepackage();
    //         }
    //     });
    // }

    // getServicepackage() {
    //     this.userServices.getServicePackageParts().subscribe((rdata: any) => {
    //         if (rdata.ret_data == 'success') {
    //             // Step 1: Filter by access
    //             const accessibleParts = rdata.SPSpareParts.filter((part: any) => part.sp_pm_access == '0');
    //             // Step 2: Sort by ordering
    //             const sortedParts = accessibleParts.sort((a: any, b: any) => a.sp_pm_ordering - b.sp_pm_ordering);
    //             // Step 3: Map descriptions
    //             this.descriptions = sortedParts.map((i: any) => i.sp_pm_name);
    //             console.log('this is service_details', this.service_details);
    //             console.log('this is draftFlag', this.draftFlag);

    //             // // Step 4: Assign to service_details.parts
    //             // if (this.draftFlag != true) {
    //             //     this.service_details.parts = sortedParts.map((part: any) => ({
    //             //         PART_NO: null,
    //             //         DESCRIPTION: part.sp_pm_name,
    //             //         Brand: '1235',
    //             //         applicable: '0',
    //             //         unit_type: part.sp_pm_unit_type || 0,
    //             //         qty: null,
    //             //         PRICE: null,
    //             //         id: 0,
    //             //         old_price: 0,
    //             //         sp_spare_id: 0,
    //             //     }));
    //             // }

    //             // 1. Get the set of existing DESCRIPTION values
    //             const existingDescriptions = new Set(this.service_details.parts.map((part: any) => part.DESCRIPTION?.trim().toLowerCase()));

    //             // 2. Filter sortedParts to exclude any that already exist by DESCRIPTION
    //             const newParts = sortedParts
    //                 .filter((part: any) => {
    //                     const desc = part.sp_pm_name?.trim().toLowerCase();
    //                     return !existingDescriptions.has(desc);
    //                 })
    //                 .map((part: any) => ({
    //                     PART_NO: null,
    //                     DESCRIPTION: part.sp_pm_name,
    //                     Brand: '1235',
    //                     applicable: '0',
    //                     unit_type: part.sp_pm_unit_type || 0,
    //                     qty: null,
    //                     PRICE: null,
    //                     id: 0,
    //                     old_price: 0,
    //                     sp_spare_id: 0,
    //                 }));

    //             // 3. Append the new parts
    //             this.service_details.parts.push(...newParts);

    //             this.getTotalServicePrice();

    //             this.load_flag = false;
    //         }
    //     });
    // }

    // getServicepackage() {
    //     this.userServices.getServicePackageParts().subscribe((rdata: any) => {
    //         if (rdata.ret_data == 'success') {

    //         } else {
    //             this.getDraftIems();
    //         }
    //     });
    // }

    getDraftIems() {
        const data = {
            modelId: this.requestedServicePackage.spmc_id,
        };
        this.userServices.getDraftItems(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.draftFlag = true;
                this.engineNO = rdata.draftItems.engines.speng_eng_id;
                if (
                    this.engineNO !== null &&
                    this.engineNO !== undefined &&
                    this.engineNO !== '' &&
                    this.engineNO !== 0 &&
                    this.engineNO !== '0' &&
                    this.engineNO !== false &&
                    this.requestedServicePackage.spmc_draft_flag != '1'
                ) {
                    this.getPartsForEngineNo();
                }

                // 1. Build a lookup of draft items by DESCRIPTION
                const draftByDesc: Record<string, any> = {};
                rdata.draftItems.parts
                    .filter((part: any) => part.sp_spare_category == '0')
                    .forEach((part: any) => {
                        const desc = part.spim_name ?? null;
                        draftByDesc[desc!] = part; // if there are duplicates, last one wins
                    });

                const hasDrafts = Object.keys(draftByDesc).length > 0;

                this.service_details.parts = this.service_details.parts.map((orig: any) => {
                    if (!hasDrafts) {
                        // No drafts at all, set applicable to 1
                        return {
                            ...orig,
                            applicable: 1,
                        };
                    }

                    const part = draftByDesc[orig.DESCRIPTION];
                    if (!part) {
                        // No match for this item, return as-is
                        return orig;
                    }

                    // Matched with draft, override with draft data
                    return {
                        applicable: part.sp_spare_applicable ?? 0,
                        DESCRIPTION: part.spim_name ?? null,
                        PART_NO: part.pm_code,
                        Brand: part.pm_brand ?? null,
                        unit_type: part.pm_unit_type !== '0' ? part.pm_unit_type : null,
                        qty: part.sp_spare_qty > 0 ? part.sp_spare_qty : null,
                        PRICE: part.pm_price ?? null,
                        id: part.pm_id ?? 0,
                        old_price: part.pm_new_price ?? null,
                        sp_spare_id: part.sp_spare_id ?? 0,
                        group_seq: part.sp_spare_group_seq || 0,
                        sp_pm_id: part.pm_sp_pm_id || 0,
                    };
                });

                // this.service_details.parts = rdata.draftItems.parts
                //     .filter((part: any) => part.sp_spare_category == '0')
                //     .map((part: any) => ({
                //         applicable: part.sp_spare_applicable,
                //         DESCRIPTION: part.spim_name ?? null,
                //         PART_NO: part.pm_code,
                //         Brand: part.pm_brand ?? null,
                //         unit_type: part.pm_unit_type != '0' ? part.pm_unit_type : null,
                //         qty: part.sp_spare_qty > 0 ? part.sp_spare_qty : null,
                //         PRICE: part.pm_price ?? null,
                //         id: part.pm_id ?? null,
                //         old_price: part.pm_new_price ?? null,
                //         sp_spare_id: part.sp_spare_id ?? 0,
                //         group_seq: part.sp_spare_group_seq || 0,
                //         sp_pm_id: part.pm_sp_pm_id || 0,
                //     }));
                // Merge draft parts into fullPartsData without duplicates
                // rdata.draftItems.parts.forEach((part: any) => {
                //     const partId = part.pm_id ?? null;
                //     const partCode = part.pm_code ?? '';
                //     const partName = part.pm_name?.trim().toLowerCase() ?? '';

                //     // Find matching item in fullPartsData
                //     const matchingFullPart = this.fullPartsData.find(
                //         (existing: any) =>
                //             (existing.pm_id && existing.pm_id === partId) ||
                //             (existing.pm_code && existing.pm_code === partCode) ||
                //             (existing.pm_name && existing.pm_name.trim().toLowerCase() === partName)
                //     );

                //     if (matchingFullPart) {
                //         // Check if this part is already in service_details.parts
                //         const alreadyInServiceDetails = this.service_details.parts.some(
                //             (existing: any) =>
                //                 (existing.id && existing.id === matchingFullPart.pm_id) ||
                //                 (existing.PART_NO && existing.PART_NO === matchingFullPart.pm_code) ||
                //                 (existing.DESCRIPTION && existing.DESCRIPTION.trim().toLowerCase() === (matchingFullPart.pm_name?.trim().toLowerCase() ?? ''))
                //         );

                //         if (!alreadyInServiceDetails) {
                //             // Add it to service_details.parts
                //             this.service_details.parts.push({
                //                 applicable: 1,
                //                 DESCRIPTION: matchingFullPart.pm_name ?? null,
                //                 PART_NO: matchingFullPart.pm_code,
                //                 Brand: matchingFullPart.pm_brand ?? null,
                //                 unit_type: matchingFullPart.pm_unit_type ?? null,
                //                 qty: matchingFullPart.sp_spare_qty > 0 ? matchingFullPart.sp_spare_qty : null,
                //                 PRICE: matchingFullPart.pm_price ?? null,
                //                 id: matchingFullPart.pm_id ?? null,
                //                 old_price: matchingFullPart.pm_price ?? null,
                //                 sp_spare_id: matchingFullPart.sp_spare_id ?? 0,
                //             });
                //         }
                //     }
                // });

                this.getTotalServicePrice();
                // this.getServicepackage();
            } else {
                this.getTotalServicePrice();
                this.load_flag = false;
                // this.getServicepackage();
            }
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
        // console.log("spare amd partlist",spare)
        // console.log(this.partsList);
        if (!spare?.PART_NO || this.partsList.length === 0) return;
        const matchedPart = this.partsList.find((part) => part.pm_code === spare.PART_NO);
        if (matchedPart) {
            // Patch values directly into the spare object
            spare.unit_type = matchedPart.pm_unit_type ?? null;
            spare.PRICE = matchedPart.pm_price ?? null;
            spare.id = matchedPart.pm_id ?? 0;
            // Optional: if qty should reset when patching
            spare.qty = null;
            // spare.sp_pm_id = matchedPart.sp_pm_id;
            // Optional: re-calculate total prices or other fields
            this.getPartPrice(this.service_details.parts);
        } else {
            spare.PRICE = null;
            spare.qty = null;
            spare.id = 0;
            this.getPartPrice(this.service_details.parts);
        }
    }

    onApplicableChange(spare: any, event: any) {
        spare.applicable = event ? '1' : '0';
        this.getTotalServicePrice();
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

    getPartcode(spare: any) {
        this.filteredList = this.descriptions.filter((item: any) => item === spare.DESCRIPTION);
        this.getPartPrice(spare);
    }

    getPartPrice(spare: any) {
        if (spare.DESCRIPTION && spare.PART_NO && spare.Brand && spare.qty == null) {
            const foundPart = this.partsList.find(
                (part) => part.pm_name === spare.DESCRIPTION && part.pm_code === spare.PART_NO && part.brand_name === spare.Brand
            );
            spare.qty = foundPart ? 1 : null;
            spare.PRICE = foundPart ? foundPart.pm_price : null;
            spare.id = foundPart ? foundPart.pm_id : 0;
        } else if (!spare.DESCRIPTION && !spare.PART_NO && !spare.Brand && !spare.qty) {
            spare.qty = null;
            spare.PRICE = null;
            spare.id = 0;
        }
        this.getTotalServicePrice();
    }

    onSearchTextChange(value: Event): void {
        this.searchText = value;
        this.searchPartcode.next(this.searchText);
    }

    public searchPartcodePrice() {
        if (!this.searchText) {
            return;
        } else {
            let data = {
                searchText: this.searchText,
            };
            const spare = this.service_details.parts.find((part: any) => part.PART_NO == this.searchText);

            this.userServices.getPartcodeprice(data).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    const matchedPart = rdata.partdetails.find((part: any) => part.pm_code == this.searchText);

                    if (matchedPart) {
                        spare.unit_type = matchedPart.pm_unit_type ?? null;
                        spare.PRICE = matchedPart.pm_price ?? null;
                        spare.id = matchedPart.pm_id ?? 0;
                        spare.qty = null;
                        this.getPartPrice(this.service_details.parts);
                    } else {
                        spare.PRICE = null;
                        spare.qty = null;
                        spare.id = 0;
                        this.getPartPrice(this.service_details.parts);
                    }
                } else {
                    spare.PRICE = null;
                    spare.qty = null;
                    spare.id = 0;
                    this.getPartPrice(this.service_details.parts);
                }
            });
        }
    }

    // addNewSpare() {
    //     this.service_details.parts.push({
    //         PART_NO: null,
    //         DESCRIPTION: null,
    //         Brand: null,
    //         applicable: 0,
    //         unit_type: '0',
    //         id: 0,
    //         qty: null,
    //         PRICE: null,
    //         old_price: 0,
    //         sp_spare_id: 0,
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
    //             this.service_details.parts.splice(i, 1);
    //             this.getTotalServicePrice();
    //         }
    //     });
    // }

    getPartsForEngineNo() {
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
                            spmc_model_year: item.spmc_model_year,
                            price: partTotal,
                        });
                    }
                });
                this.partsModal.open();
            }
        });
    }

    getTotalServicePrice() {
        this.service_details.TotalPrice = 0;

        this.service_details.parts.forEach((element: any) => {
            if (element.applicable == '1' && element.qty != null && element.qty != '' && element.PRICE != null && element.PRICE != '' && element.PRICE != 0) {
                this.service_details.TotalPrice += parseFloat(element.PRICE) * parseFloat(element.qty);
            }
        });
        this.service_details.TotalPrice = parseFloat(this.service_details.TotalPrice.toFixed(2));

        this.load_flag = false;
    }

    saveServicePackageParts(type: number) {
        if (type == 7) {
            this.draftButtonFlag = true;
            this.service_details.draft_flag = 1;
            this.service_details.spmc_status_flag = this.requestedServicePackage.spmc_status_flag;
        } else {
            this.service_details.draft_flag = 0;
            this.service_details.spmc_status_flag = this.spStatus;
            this.saveFlag = true;
        }

        if (this.engineNO == null || this.engineNO == '') {
            this.coloredToast('danger', 'Engine Number is mandatory!');
            this.saveFlag = false;
            return;
        }

        const seen = new Set<string>();
        let duplicatePartNo: string | null = null;

        for (const part of this.service_details.parts) {
            if (part?.PART_NO) {
                const partNo = String(part.PART_NO).trim().toLowerCase();
                if (seen.has(partNo)) {
                    duplicatePartNo = part.PART_NO;
                    break;
                }
                seen.add(partNo);
            }
        }

        if (duplicatePartNo) {
            this.coloredToast('danger', `Duplicate partcode found: ${duplicatePartNo}`);
            this.saveFlag = false;
            this.draftButtonFlag = false;
            return;
        }

        if (type != 7) {
            if (this.service_details.parts.length > 0) {
                const requiredFields = ['PART_NO', 'DESCRIPTION', 'Brand', 'unit_type', 'qty', 'PRICE'];

                const applicableParts = this.service_details.parts.filter((part: any) => part.applicable == '1');

                const allFieldsHaveValue = applicableParts.every((part: any) => {
                    const valuesFilled = requiredFields.every((field) => part[field] !== null && part[field] !== '' && part[field] !== undefined);
                    const priceValid = part.PRICE !== 0 && part.PRICE !== '0' && part.PRICE !== 0.0 && part.PRICE !== null && part.PRICE !== '';
                    return valuesFilled && priceValid;
                });

                if (applicableParts.length == 0) {
                    this.coloredToast('danger', 'At least one applicable part is required to create a service.');
                    this.saveFlag = false;
                    return;
                }

                if (!allFieldsHaveValue) {
                    this.coloredToast('danger', 'Please fill in all fields and ensure price and quantity is not zero for applicable parts.');
                    this.saveFlag = false;
                    return;
                }
            }
        }

        if (this.service_details.parts.length > 0) {
            this.service_details.user_id = atob(atob(localStorage.getItem('us_id') || '{}'));
            this.service_details.engine_id = this.engineNO;

            // this.saveFlag = false;
            // this.draftButtonFlag = false;
            // console.log('this.service_details', this.service_details);
            this.userServices.saveServicePackageParts(this.service_details).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    this.router.navigateByUrl('servicePackageRequested');
                    this.saveFlag = false;
                    this.draftButtonFlag = false;
                    if (type == 7) {
                        this.coloredToast('success', 'Service package parts have been successfully saved as a draft.');
                    } else {
                        this.coloredToast('success', 'Service package parts have been updated successfully.');
                    }
                } else {
                    this.saveFlag = false;
                    this.draftButtonFlag = false;
                    this.coloredToast('danger', 'Some error occurred , Please try again');
                }
            });
        }
    }

    copyPartsToServiceDetails(partSummary: any) {
        this.service_details.parts.forEach((p: any) => (p.applicable = 0));
        const partsToCopy = this.fullPartsData.filter((item) => item.spmc_value === partSummary.model_code);

        partsToCopy.forEach((item) => {
            const partCode = item.pm_code || '';
            const partName = item.spim_name?.trim() || '';
            const partId = item.pm_id || null;
            const sp_pm_id = item.sp_pm_id || null;

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
                existingPart.sp_pm_id = sp_pm_id;
            } else {
                // Add as new part
                this.service_details.parts.push({
                    PART_NO: partCode,
                    DESCRIPTION: partName,
                    Brand: item.pm_brand || null,
                    qty: Number(item.sp_spare_qty) || null,
                    PRICE: Number(item.pm_price) || null,
                    id: partId,
                    applicable: 1,
                    unit_type: item.pm_unit_type ?? '0',
                    old_price: item.pm_price ?? 0,
                    sp_pm_id: sp_pm_id,
                });
            }
        });

        this.getTotalServicePrice();
        this.partsModal.close();
    }

    getSelectedEngineNo(): string | undefined {
        const selected = this.engines.find((engine: any) => engine.eng_id == this.engineNO);
        return selected?.eng_no;
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
