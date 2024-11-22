import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-parts-list',
    templateUrl: './parts-list.component.html',
    styleUrls: ['./parts-list.component.css'],
})
export class PartsListComponent implements OnInit {
    public partsList: [] = [];
    public search: string = '';
    public load_flag: boolean = true;
    public brandList = [];
    public spareCategory = [];

    partsDetails: any = [];
    updateParts: any = [];

    public permittedAction: any[] = [];
    public part_flag: boolean = true;

    public cols = [
        { field: 'pm_code', title: 'Code' },
        { field: 'pm_name', title: 'Name' },
        { field: 'brand_name', title: 'Brand' },
        { field: 'spc_name', title: 'Category' },
        { field: 'pm_price', title: 'Price' },
        { field: 'action', title: 'Action' },
    ];

    @ViewChild('partsModal') partsModal: any;
    @ViewChild('partsEditModal') partsEditModal: any;
    @Output() modalEvent = new EventEmitter<boolean>();

    constructor(private userServices: StaffPostAuthService, public router: Router) {
        JSON.parse(atob(atob(localStorage.getItem('access_data') || '{}'))).forEach((element: any) => {
            if (element['ft_id'] == 42) {
                this.permittedAction = element['actions'];
            }
        });

        this.userServices.getBrandList().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.brandList = rdata.brand;
            }
        });
        this.userServices.getSpareCategory().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.spareCategory = rdata.SpareCategory;
            }
        });
        this.partsDetails = {
            part_code: '',
            part_name: '',
            part_brand: null,
            part_category: null,
            part_price: '',
        };
    }
    ngOnInit(): void {
        this.getAllPartsList();
    }

    getAllPartsList() {
        this.partsList = [];
        this.userServices.getAllPartsList().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.partsList = rdata.parts;
                this.load_flag = false;
            } else {
                this.load_flag = false;
            }
        });
    }

    createParts(parts: any) {
        this.part_flag = true;

        // const requiredAttributes = ['part_code', 'part_name', 'part_price', 'part_brand', 'part_category'];
        // let missingAttribute = '';

        // requiredAttributes.forEach((attribute) => {
        //     if (parts[attribute] == null || parts[attribute] === '') {
        //         this.part_flag = false;
        //         missingAttribute = attribute.replace('_', ' ');
        //         return;
        //     }
        // });

        // if (!this.part_flag) {
        //     this.coloredToast('danger', `Spare Part ${missingAttribute.charAt(0).toUpperCase() + missingAttribute.slice(1)} is Required!!!`);
        // }

        if (parts.part_code == null || parts.part_code == '') {
            this.part_flag = false;
            this.coloredToast('danger', 'Spare Part Code is Required!!!');
        } else if (parts.part_name == null || parts.part_name == '') {
            this.part_flag = false;
            this.coloredToast('danger', 'Spare Part Name is Required!!!');
        } else if (parts.part_price == null || parts.part_price == '') {
            this.part_flag = false;
            this.coloredToast('danger', 'Spare Part Price is Required!!!');
        } else if (parts.part_brand == null || parts.part_brand == '') {
            this.part_flag = false;
            this.coloredToast('danger', 'Spare Part Brand is Required!!!');
        } else if (parts.part_category == null || parts.part_category == '') {
            this.part_flag = false;
            this.coloredToast('danger', 'Spare Part Category is Required!!!');
        }

        if (this.part_flag == true) {
            this.userServices.SavePartsDetails(parts).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    this.partsModal.close();
                    this.getAllPartsList();
                    this.coloredToast('success', 'Spare Parts Saved Successfully');
                }
            });
        }
    }

    partsModalOpen() {
        this.partsDetails = {
            part_code: '',
            part_name: '',
            part_brand: null,
            part_category: null,
            part_price: '',
        };
        this.partsModal.open();
    }

    partsModalClose() {
        this.partsDetails = {
            part_code: '',
            part_name: '',
            part_brand: null,
            part_category: null,
            part_price: '',
        };
        this.partsModal.close();
    }

    editParts(value: any) {
        this.updateParts = value;
        this.partsEditModal.open();
    }

    updatePartsDetails(part: any) {
        this.userServices.UpdateSpareParts(part).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.partsEditModal.close();
                this.getAllPartsList();
                this.coloredToast('success', 'Spare Parts Updated Successfully');
            }
        });
    }
    partsEditModalClose() {
        this.updateParts = [];
        this.partsEditModal.close();
        this.getAllPartsList();
    }

    deleteParts(value: any) {
        if (this.permittedAction.includes('3')) {
            Swal.fire({
                icon: 'warning',
                title: "You won't be able to revert this!",
                text: 'You are about to delete a Spare Parts, Are you sure?',
                showCancelButton: true,
                confirmButtonText: 'Delete',
                padding: '2em',
                customClass: 'sweet-alerts',
            }).then((result) => {
                if (result.value) {
                    this.userServices.deleteSpare({ pm_id: value.pm_id }).subscribe((rdata: any) => {
                        if (rdata.ret_data === 'success') {
                            this.coloredToast('success', 'Spare Parts Deleted Successfully');
                            this.getAllPartsList();
                        } else {
                            this.coloredToast('danger', "Can't Delete Spare Parts");
                        }
                    });
                }
            });
        } else {
            this.coloredToast('danger', "Can't Delete Service, Permission Denied");
        }
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
