import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-service-pkg-parts-master',
    templateUrl: './service-pkg-parts-master.component.html',
    styleUrls: ['./service-pkg-parts-master.component.css'],
})
export class ServicePkgPartsMasterComponent implements OnInit {
    @ViewChild('addParts') addParts: any;
    @ViewChild('editParts') editParts: any;
    @ViewChild('addGroup') addGroup: any;
    @ViewChild('editGroupModal') editGroupModal: any;

    public fullPartsData: any[] = [];
    public search: string = '';
    public partsDetails: any = [];
    public load_flag: boolean = true;
    public createFlag: boolean = false;
    public editFlag: boolean = true;
    public brandList: any = [];
    orderingChange$ = new Subject<any>();
    public partList: any = [];
    public consumableList: any = [];
    public labourList: any = [];

    selectedPartName: any = [];
    selectedConsumableName: any = [];
    selectedLabourName: any;
    groupName: any;
    public itemNameSearch: string = '';
    public itemNames: any[] = [];
    public tab12: any = 'home';
    public ServicePackageItemMaster: any = [];
    public groupDetails: any = [];
    public load_group_flag: boolean = false;
    public spItemMaster: any = [];
    public original_spim_name: string = '';
    public showNameChangeConfirmation: boolean = false;
    public groupedItems: any = [];
    public createButton: boolean = false;

    public cols = [
        { field: 'spim_name', title: 'Name', isUnique: false },
        { field: 'sp_pm_code', title: 'Code', isUnique: false },
        { field: 'sp_pm_brand_label', title: 'Brand', isUnique: false },
        { field: 'sp_pm_category_label', title: 'Resource Category', isUnique: false },
        { field: 'sp_pm_unit_type_label', title: 'Unit Type', isUnique: false },
        { field: 'sp_pm_access_label', title: 'Access', isUnique: false },
        { field: 'sp_pm_price', title: 'Price', isUnique: false },
        { field: 'sp_pm_ordering', title: 'Sequence', isUnique: false },
        { field: 'action', title: 'Actions', isUnique: false },
    ];

    public cols2 = [
        { field: 'spim_name', title: 'Name', isUnique: false },
        { field: 'spim_category_label', title: 'Category', isUnique: false },
        { field: 'spim_group_seq', title: 'Group No', isUnique: false },
        { field: 'action', title: 'Actions', isUnique: false },
    ];

    public cols3 = [
        { field: 'sp_ig_group_seq', title: 'Group Number', isUnique: false },
        { field: 'spim_name', title: 'Item Names', isUnique: false },
        { field: 'action', title: 'Actions', isUnique: false },
    ];

    constructor(public router: Router, private userServices: StaffPostAuthService, public datePipe: DatePipe, private activeRouter: ActivatedRoute) {
        this.partsDetails = {
            spim_name: '',
            sp_pm_code: null,
            sp_pm_brand: null,
            sp_pm_unit_type: null,
            sp_pm_access: null,
            sp_pm_price: null,
            id: '0',
            sp_pm_category: null,
            sp_pm_ordering: null,
        };

        this.groupDetails = {
            spim_id: 0,
            spim_name: '',
            spim_category: null,
            spim_group_seq: null,
        };

        this.userServices.getBrandList().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.brandList = rdata.brand;
            }
        });
    }

    ngOnInit() {
        this.getServicePackageParts();
        this.orderingChange$.pipe(debounceTime(500)).subscribe((partsDetails) => {
            this.checkDuplicateOrdering(partsDetails);
        });
    }

    onOrderingChange() {
        this.orderingChange$.next(this.partsDetails);
    }

    getItemGroup() {
        this.load_flag = true;
        this.groupedItems = [];
        this.userServices.getItemGroup().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.groupedItems = rdata.groupedItems;
                this.load_flag = false;
            } else {
                this.load_flag = false;
                // this.coloredToast('danger', 'Failed to Fetch Group Items.');
            }
        });
    }

    getServicePackageParts() {
        this.load_flag = true;

        this.userServices.getServicePackageParts().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                // this.itemNames = rdata.SPItems.map((part: any) => part.spim_name);
                this.ServicePackageItemMaster = rdata.SPItems.map((part: any) => {
                    return {
                        ...part,
                        spim_category_label:
                            part.spim_category == '0' ? 'Parts' : part.spim_category == '1' ? 'Consumables' : part.spim_category == '2' ? 'Operations' : '',
                    };
                }).sort((a: any, b: any) => {
                    // Sort logic: 0 goes below
                    const groupA = parseInt(a.spim_group_seq);
                    const groupB = parseInt(b.spim_group_seq);

                    // If groupA is 0, push it down
                    if (groupA === 0 && groupB !== 0) return 1;
                    if (groupB === 0 && groupA !== 0) return -1;

                    // Otherwise, sort by group number ascending
                    return groupA - groupB;
                });
                this.fullPartsData = rdata.SPSpareParts.map((part: any) => {
                    const brand = this.brandList.find((b: any) => b.brand_id == part.sp_pm_brand);
                    return {
                        ...part,
                        sp_pm_category_label:
                            part.sp_pm_category == '0' ? 'Parts' : part.sp_pm_category == '1' ? 'Consumables' : part.sp_pm_category == '2' ? 'Operations' : '',

                        sp_pm_unit_type_label: part.sp_pm_unit_type == '1' ? 'Unit' : part.sp_pm_unit_type == '2' ? 'Litre' : '',

                        sp_pm_access_label: part.sp_pm_access == '0' ? 'Parts Advisor' : 'Supervisor',

                        sp_pm_brand_label: brand ? brand.brand_name : '',
                    };
                });

                // this.partList = rdata.SPItems.filter((part: any) => part.spim_category == '0' && part.spim_group_seq == '0');
                this.partList = rdata.SPItems.filter((part: any) => part.spim_category == '0');

                // this.consumableList = rdata.SPItems.filter((part: any) => part.spim_category == '1' && part.spim_group_seq == '0');
                this.consumableList = rdata.SPItems.filter((part: any) => part.spim_category == '1');

                // this.labourList = rdata.SPItems.filter((part: any) => part.spim_category == '2' && part.spim_group_seq == '0');
                this.labourList = rdata.SPItems.filter((part: any) => part.spim_category == '2');

                this.load_flag = false;
                this.load_group_flag = false;
            } else {
                this.load_group_flag = false;
                this.load_flag = false;
            }
        });
        this.getItemGroup();
    }

    groupItems() {
        if (this.createButton == true) {
            return;
        }
        this.createButton = true;

        const emptyCount =
            (this.selectedPartName.length === 0 ? 1 : 0) +
            (this.selectedConsumableName.length === 0 ? 1 : 0) +
            (!this.selectedLabourName || this.selectedLabourName.length === 0 ? 1 : 0);

        if (emptyCount >= 2) {
            this.createButton = false;
            this.coloredToast('danger', 'Please select at least two fields before grouping.');
            return;
        }
        // [...new Set()]== this converts the array without duplicates, and the set is converted to array
        const groupItems = {
            // groupName: this.groupName,
            groupPartsId: [...new Set(this.selectedPartName)],
            groupConsumables: [...new Set(this.selectedConsumableName)],
            groupOperation: [...new Set(this.selectedLabourName)],
            user_id: atob(atob(localStorage.getItem('us_id') || '{}')),
        };

        this.userServices.createGroup(groupItems).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.addParts.close();
                this.load_group_flag = true;
                this.getServicePackageParts();
                this.resetGroupItems();
                this.addGroup.close();
                this.coloredToast('success', 'Group items is created.');
                this.createButton = false;
            } else if (rdata.ret_data == 'duplicate') {
                this.coloredToast('danger', rdata.message);
                this.createButton = false;
            } else {
                this.createButton = false;
                this.coloredToast('danger', 'Unable to Group Items.');
            }
        });

        // this.userServices.createItemGroup(groupItems).subscribe((rdata: any) => {
        //     if (rdata.ret_data === 'success') {
        //         this.addParts.close();
        //         this.load_group_flag = true;
        //         this.getServicePackageParts();
        //         this.resetGroupItems();
        //         this.addGroup.close();
        //         this.coloredToast('success', 'Group items is created.');
        //     } else {
        //         this.coloredToast('danger', 'Unable to create Group items.');
        //     }
        // });
    }

    checkItemHasGroup() {
        let data = {
            parts: this.selectedPartName || [],
            consumables: this.selectedConsumableName || [],
            operation: this.selectedLabourName || null,
        };

        this.userServices.CheckItemHasGroup(data).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.coloredToast('success', 'Group items is Already created.');
            } else {
                this.coloredToast('danger', 'Unable to create Group items.');
            }
        });
    }

    partsCreate() {
        // Proceed to create the part if all fields are valid.
        this.createFlag = true;
        this.editFlag = true;

        const { spim_name, sp_pm_category, sp_pm_access } = this.partsDetails;

        // Field-wise validation and show error for each missing field.
        if (!spim_name) {
            this.coloredToast('danger', 'Please enter the Item Name.');
            this.createFlag = false;
            return;
        }

        if (!sp_pm_category) {
            this.coloredToast('danger', 'Please select the Resource Category.');
            this.createFlag = false;
            return;
        }

        if (!sp_pm_access) {
            this.coloredToast('danger', 'Please select the Item Access.');
            this.createFlag = false;
            return;
        }

        // Assign logged-in user ID from localStorage (double decoding)
        this.partsDetails.user_id = atob(atob(localStorage.getItem('us_id') || '{}'));

        // Call the API to create the service package part.
        this.userServices.createServicePackageParts(this.partsDetails).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.addParts.close();
                this.coloredToast('success', 'New item has been successfully added to the Service Package.');
                this.resetPartsDetails();
                this.getServicePackageParts();
                this.createFlag = false;
            } else {
                this.coloredToast('danger', 'Unable to add the Service Package Item. Please try again.');
                this.createFlag = false;
            }
        });
    }

    checkDuplicateOrdering(partsDetails: any) {
        let data = {
            sp_pm_category: partsDetails.sp_pm_category,
            sp_pm_ordering: partsDetails.sp_pm_ordering,
            sp_pm_id: partsDetails.id,
        };

        this.userServices.checkDuplicateOrdering(data).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                const Message = rdata.message;
                this.coloredToast('warning', Message);
                this.createFlag = false;
                this.editFlag = false;
            } else {
                this.createFlag = true;
                this.editFlag = true;
            }
        });
    }

    partEdit(parts: any) {
        let data = {
            sp_pm_id: parts.sp_pm_id,
        };
        this.userServices.getServicePackagePartsById(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.partsDetails = {
                    spim_name: rdata.SPSparePart?.spim_name ?? '',
                    sp_pm_code: rdata.SPSparePart?.sp_pm_code ?? null,
                    sp_pm_brand: rdata.SPSparePart?.sp_pm_brand ?? null,
                    sp_pm_category: rdata.SPSparePart?.sp_pm_category ?? '',
                    sp_pm_unit_type: rdata.SPSparePart?.sp_pm_unit_type ?? null,
                    sp_pm_access: rdata.SPSparePart?.sp_pm_access ?? null,
                    sp_pm_price: rdata.SPSparePart?.sp_pm_price ?? null,
                    sp_pm_ordering: rdata.SPSparePart?.sp_pm_ordering ?? null,
                    id: rdata.SPSparePart?.sp_pm_id ?? '0',
                };

                this.original_spim_name = rdata.SPSparePart?.spim_name;
                this.showNameChangeConfirmation = false;

                this.editParts.open();
            }
        });
    }

    partsUpdate(parts: any) {
        const updateData = {
            sp_pm_id: parts.id,
            spim_name: parts.spim_name,
            sp_pm_code: parts.sp_pm_code,
            sp_pm_brand: parts.sp_pm_brand,
            sp_pm_unit_type: parts.sp_pm_unit_type,
            sp_pm_access: parts.sp_pm_access,
            sp_pm_price: parts.sp_pm_price,
            sp_pm_ordering: parts.sp_pm_ordering,
        };

        this.userServices.updateServicePackagePartsById(updateData).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.coloredToast('success', 'Item details were successfully updated.');
                this.editParts.close(); // Close the modal after update
                this.resetPartsDetails();
                this.getServicePackageParts();
            } else if (rdata.ret_data === 'duplicate') {
                this.coloredToast('danger', `${rdata.message}.`);
            } else {
                this.coloredToast('danger', 'Failed to update the Item. Please try again.');
            }
        });
    }

    checkForNameChange() {
        const currentName = (this.partsDetails.spim_name || '').trim().toLowerCase();
        const originalName = (this.original_spim_name || '').trim().toLowerCase();

        if (currentName !== originalName) {
            this.showNameChangeConfirmation = true;
        } else {
            this.partsUpdate(this.partsDetails);
        }
    }

    confirmNameChange() {
        this.showNameChangeConfirmation = false;
        this.partsUpdate(this.partsDetails);
    }

    cancelNameChange() {
        this.partsDetails.spim_name = this.original_spim_name;
        this.showNameChangeConfirmation = false;
    }

    deletePart(parts: any) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you really want to delete this Item?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                // Call your API here (replace with actual API service)
                this.userServices.deleteServicePackagePartsById({ sp_pm_id: parts.sp_pm_id }).subscribe({
                    next: (res: any) => {
                        Swal.fire('Deleted!', 'Item has been deleted.', 'success');
                        this.getServicePackageParts();
                    },
                    error: (err: any) => {
                        Swal.fire('Error!', 'Something went wrong while deleting.', 'error');
                    },
                });
            }
        });
    }

    resetGroupItems() {
        this.selectedPartName = [];
        this.selectedConsumableName = [];
        this.selectedLabourName = '';
        this.groupName = '';
    }

    resetPartsDetails() {
        this.partsDetails = {
            spim_name: '',
            sp_pm_code: null,
            sp_pm_brand: null,
            sp_pm_unit_type: null,
            sp_pm_access: null,
            sp_pm_price: null,
            id: '0',
        };
    }

    resetGroupDetails() {
        this.groupDetails = {
            spim_id: 0,
            spim_name: '',
            spim_category: null,
            spim_group_seq: null,
        };
    }

    groupEdit(item: any) {
        let data = {
            spim_id: item.spim_id,
        };
        this.userServices.getSPItemsById(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.groupDetails = {
                    spim_id: rdata.SPSItems?.spim_id ?? 0,
                    spim_name: rdata.SPSItems?.spim_name ?? '',
                    spim_category: rdata.SPSItems?.spim_category ?? null,
                    spim_group_seq: rdata.SPSItems?.spim_group_seq ?? null,
                };

                this.editGroupModal.open();
            }
        });
    }

    groupItemUpdate(item: any) {
        const updateData = {
            spim_id: item.spim_id,
            spim_group_seq: item.spim_group_seq,
        };

        this.userServices.updateSPGroupById(updateData).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.coloredToast('success', 'Item Group has been successfully updated.');
                this.editGroupModal.close(); // Close the modal after update
                this.load_group_flag = true;
                this.getServicePackageParts();
            } else {
                this.coloredToast('danger', 'Failed to update the Item. Please try again.');
            }
        });
    }

    // groupDelete(item: any) {
    //     const DeleteGroupData = {
    //         spim_id: item.spim_id,
    //         spim_group_seq: 0,
    //     };

    //     this.userServices.updateSPGroupById(DeleteGroupData).subscribe((rdata: any) => {
    //         if (rdata.ret_data === 'success') {
    //             this.coloredToast('success', 'Delete Group has been successfully updated.');
    //             this.editGroupModal.close(); // Close the modal after update
    //             this.load_group_flag = true;
    //             this.getServicePackageParts();
    //             this.getItemGroup();
    //         } else {
    //             this.coloredToast('danger', 'Failed to update the Item. Please try again.');
    //         }
    //     });
    // }

    // deleteGroup(item: any) {
    //     this.load_group_flag = true;
    //     const DeleteGroupData = {
    //         sp_ig_group_seq: item.sp_ig_group_seq,
    //     };

    //     this.userServices.deleteGroup(DeleteGroupData).subscribe((rdata: any) => {
    //         if (rdata.ret_data === 'success') {
    //             this.load_group_flag = false;
    //             this.coloredToast('success', ' Group has been successfully Deleted.');
    //             this.getServicePackageParts();
    //             this.getItemGroup();
    //         } else {
    //             this.load_group_flag = false;
    //             this.coloredToast('danger', 'Failed to delete the Item. Please try again.');
    //         }
    //     });
    // }

    deleteGroup(item: any) {
        // Show confirmation alert before deleting
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you really want to delete this group?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete it',
            cancelButtonText: 'Cancel',
            reverseButtons: true, // Optional: swaps positions of the buttons
        }).then((result) => {
            if (result.isConfirmed) {
                // ✅ Proceed with delete only if confirmed
                this.load_group_flag = true;
                const DeleteGroupData = {
                    sp_ig_group_seq: item.sp_ig_group_seq,
                };

                this.userServices.deleteGroup(DeleteGroupData).subscribe((rdata: any) => {
                    this.load_group_flag = false;
                    if (rdata.ret_data === 'success') {
                        this.coloredToast('success', 'Group has been successfully deleted.');
                        this.getServicePackageParts();
                        this.getItemGroup();
                    } else {
                        this.coloredToast('danger', 'Failed to delete the item. Please try again.');
                    }
                });
            }
            // ❌ If canceled, do nothing
        });
    }

    addNewItems() {
        this.spItemMaster = [];
        this.userServices.getServicePackageItems().subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.addParts.open();
                this.spItemMaster = rdata.ItemsList;
                this.itemNames = rdata.ItemsList.map((part: any) => part.spim_name);
            } else {
                this.coloredToast('danger', 'Failed to update the Item. Please try again.');
            }
        });
    }

    getItemNameBasedOnSearch(selectedName: string) {
        const matched = this.itemNames.find((name) => name?.toLowerCase() === selectedName?.toLowerCase());
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
