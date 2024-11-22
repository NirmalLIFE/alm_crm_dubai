import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-labour-list',
    templateUrl: './labour-list.component.html',
    styleUrls: ['./labour-list.component.css'],
})
export class LabourListComponent implements OnInit {
    public labourList: [] = [];
    public search: string = '';
    public load_flag: boolean = true;
    public labour_flag: boolean = true;

    labourDetails: any = [];

    public cols = [
        { field: 'lm_code', title: 'Code' },
        { field: 'lm_name', title: 'Name' },
        { field: 'lm_description', title: 'Description' },
    ];

    @ViewChild('labourModal') labourModal: any;
    @Output() modalEvent = new EventEmitter<boolean>();
    constructor(private userServices: StaffPostAuthService, public router: Router) {
        this.labourDetails = {
            labour_name: '',
            labour_code: '',
            labour_description: '',
        };
    }
    ngOnInit(): void {
        this.getAllLabourList();
    }
    getAllLabourList() {
        this.userServices.getAllLabourList().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.labourList = rdata.labour;
                this.load_flag = false;
            } else {
                this.load_flag = false;
            }
        });
    }

    labourModalOpen() {
        this.labourDetails = {
            labour_name: '',
            labour_code: '',
            labour_description: '',
        };
        this.labourModal.open();
    }

    labourModalClose() {
        this.labourDetails = {
            labour_name: '',
            labour_code: '',
            labour_description: '',
        };
        this.labourModal.close();
    }

    createLabour(labours: any) {
        this.labour_flag = true;
        if (labours.labour_description == '' || labours.labour_description == null) {
            this.labour_flag = false;
            this.coloredToast('danger', 'Labour Description is Required !!!');
        }

        if (labours.labour_name == '' || labours.labour_name == null) {
            this.labour_flag = false;
            this.coloredToast('danger', 'Labour Name is Required !!!');
        }

        if (this.labour_flag == true) {
            this.userServices.SaveLabourDetails(labours).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    this.labourModal.close();
                    this.getAllLabourList();
                    this.coloredToast('success', 'Labour Saved Successfully');
                }
            });
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
