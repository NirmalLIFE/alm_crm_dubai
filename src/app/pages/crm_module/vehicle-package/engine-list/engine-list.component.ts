import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-engine-list',
    templateUrl: './engine-list.component.html',
    styleUrls: ['./engine-list.component.css'],
})
export class EngineListComponent implements OnInit {
    @ViewChild('addEngine') addEngine: any;
    @ViewChild('editEngine') editEngine: any;

    public engineList: any = [];
    public search: string = '';
    addEngineNo: string = '';
    editEngineNo: string = '';
    editEngineId: string = '';
    originalEngineNo: string = '';
    public load_flag: boolean = true;
    public createFlag: boolean = false;
    public editFlag: boolean = true;
    public showNameChangeConfirmation: boolean = false;

    public cols = [
        { field: 'eng_no', title: 'Engine No', isUnique: false },
        // { field: 'eng_labour_factor', title: 'Engine Labour factor', isUnique: false },
        { field: 'action', title: 'Actions', isUnique: false },
    ];

    constructor(public router: Router, private userServices: StaffPostAuthService, public datePipe: DatePipe) {}

    ngOnInit() {
        this.getEngineMasterList();
    }

    getEngineMasterList() {
        this.userServices.getAllEnginesList().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.engineList = rdata.enginesList;
                this.load_flag = false;
            }
        });
    }

    engineCreate() {
        this.addEngine.open();
    }

    createEngine() {
        if (this.createFlag || !this.addEngineNo || this.addEngineNo.length !== 3) return;

        this.createFlag = true;
        let data = {
            engineNo: this.addEngineNo,
        };

        this.userServices.createEnginesList(data).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.addEngine.close();
                this.coloredToast('success', 'New item has been successfully added to the Engine Number.');
                this.getEngineMasterList();
                this.createFlag = false;
                this.addEngineNo = '';
            } else if (rdata.ret_data === 'duplicate') {
                this.coloredToast('warning', 'Engine number already exists.');
                this.createFlag = false;
            } else {
                this.coloredToast('danger', 'Unable to add the Engine Number. Please try again.');
                this.createFlag = false;
            }
        });
    }

    engineEdit(item: any) {
        this.editEngineId = item.eng_id;
        this.editEngineNo = item.eng_no;
        this.originalEngineNo = item.eng_no;
        this.editEngine.open();
        this.showNameChangeConfirmation = false;
    }

    checkForNameChange() {
        const currentName = (this.editEngineNo || '').trim().toLowerCase();
        const originalName = (this.originalEngineNo || '').trim().toLowerCase();

        if (currentName !== originalName) {
            this.showNameChangeConfirmation = true;
        } else {
            this.editEngineNumber();
        }
    }

    confirmNameChange() {
        this.showNameChangeConfirmation = false;
        this.editEngineNumber();
    }

    cancelNameChange() {
        this.editEngineNo = this.originalEngineNo;
        this.showNameChangeConfirmation = false;
    }

    editEngineNumber() {
        let data = {
            engineNo: this.editEngineNo,
            engineid: this.editEngineId,
        };

        this.userServices.updateEnginelist(data).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.coloredToast('success', 'Engine number updated successfully.');
                this.editEngine.close();
                this.getEngineMasterList();
            } else if (rdata.ret_data === 'duplicate') {
                this.coloredToast('warning', 'Engine number already exists.');
            } else {
                this.coloredToast('danger', 'Failed to update engine number.');
            }
        });
    }

    deleteEngine(item: any) {
        Swal.fire({
            title: 'Are you sure?',
            html: `
             <p style="color: #d9534f; font-weight: bold; font-size: 24px;">Warning!</p>
             <p style="font-size: 16px; font-weight: 800;">
             Deleting this engine number may impact service package items that have already been created.
             </p>
             <br>
             <p style="font-size: 16px;">
             Do you really want to delete this item?
             </p>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                // Call your API here (replace with actual API service)
                this.userServices.deleteEnginelist({ eng_id: item.eng_id }).subscribe({
                    next: (res: any) => {
                        Swal.fire('Deleted!', 'Item has been deleted.', 'success');
                        this.getEngineMasterList();
                    },
                    error: (err: any) => {
                        Swal.fire('Error!', 'Something went wrong while deleting.', 'error');
                    },
                });
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
