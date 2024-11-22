import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-spare-suppliers-list',
    templateUrl: './spare-suppliers-list.component.html',
    styleUrls: ['./spare-suppliers-list.component.css'],
})
export class SpareSuppliersListComponent implements OnInit {
    public search: string = '';
    public load_flag: boolean = false;
    public suppliersList: any[] = [];
    public permittedAction: any[] = [];
    public supplierForm: FormGroup;

    public cols = [
        { field: 'ss_name', title: 'Name', isUnique: false },
        { field: 'type', title: 'Type', isUnique: false },
        { field: 'ss_contact_no', title: 'Contact No', isUnique: false },
        { field: 'ss_address', title: 'Address', isUnique: false },
        { field: 'ss_trn_no', title: 'Trn_No', isUnique: false },
        { field: 'action', title: 'Actions', isUnique: false },
    ];

    @ViewChild('createSupplier') createSupplier: any;
    @ViewChild('editSupplier') editSupplier: any;

    constructor(public storeData: Store<any>, private userServices: StaffPostAuthService, public router: Router, private fb: FormBuilder) {
        JSON.parse(atob(atob(localStorage.getItem('access_data') || '{}'))).forEach((element: any) => {
            if (element['ft_id'] == 40) {
                this.permittedAction = element['actions'];
            }
        });

        this.supplierForm = this.fb.group({
            supplierName: [''],
            contact_no: [''],
            supplierType: ['0'],
            Trn_No: [''],
            Address: [''],
            id: [''],
        });
    }

    ngOnInit() {
        this.getSuppliers();
    }

    getSuppliers() {
        this.load_flag = true;
        this.suppliersList = [];
        this.userServices.getSupplierDetails().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.suppliersList = rData.Suppliers;
                this.suppliersList.forEach((element) => {
                    if (element.ss_type == '1') {
                        element.type = 'Service';
                    } else if (element.ss_type == '2') {
                        element.type = 'Spare Parts';
                    }
                });
                this.load_flag = false;
            }
        });
    }

    suppliersCreate() {
        this.supplierForm = this.fb.group({
            supplierName: [''],
            contact_no: [''],
            supplierType: ['0'],
            Trn_No: [''],
            Address: [''],
            id: [''],
        });
        this.createSupplier.open();
    }

    createSupplierDetails() {
        this.userServices.createSupplierDetails(this.supplierForm.value).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.createSupplier.close();
                this.coloredToast('success', 'Supplier Created successfully');
                this.getSuppliers();
            } else {
                this.coloredToast('danger', 'Some Error Occured Please Try Again');
            }
        });
    }

    deletesupplier(item: any) {
        if (this.permittedAction.includes('3')) {
            Swal.fire({
                icon: 'warning',
                title: "You won't be able to revert this!",
                text: 'You are about to delete a Supplier, Are you sure?',
                showCancelButton: true,
                confirmButtonText: 'Delete',
                padding: '2em',
                customClass: 'sweet-alerts',
            }).then((result) => {
                if (result.value) {
                    this.userServices.deleteSupplier({ id: item.ss_id }).subscribe((rdata: any) => {
                        if (rdata.ret_data === 'success') {
                            this.coloredToast('success', 'Supplier deleted successfully');
                            this.getSuppliers();
                        } else {
                            this.coloredToast('danger', "Can't delete Supplier");
                        }
                    });
                }
            });
        } else {
            this.coloredToast('danger', "Can't delete role, permission denied");
        }
    }

    supplierEdit(item: any) {
        this.supplierForm.patchValue({
            supplierName: item.ss_name,
            contact_no: item.ss_contact_no,
            supplierType: item.ss_type,
            Trn_No: item.ss_trn_no,
            Address: item.ss_address,
            id: item.ss_id,
        });
        this.editSupplier.open();
    }

    updateSupplier() {
        this.userServices.updateSupplier(this.supplierForm.value).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.coloredToast('success', 'Call Purpose Updated Successfully');
                this.editSupplier.close();
                this.getSuppliers();
            } else {
                this.coloredToast('danger', 'Cant update call purpose');
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
}
