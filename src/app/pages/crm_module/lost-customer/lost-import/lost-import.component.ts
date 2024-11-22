import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-lost-import',
    templateUrl: './lost-import.component.html',
    styleUrls: ['./lost-import.component.css'],
})
export class LostImportComponent implements OnInit {
    public fileList: any[] = [];
    public search: string = '';
    public load_flag: boolean = true;
    public uploadLCForm: FormGroup;
    public imageUrl: string = './assets/images/no_file.png';
    public uploadedFile: any;

    @ViewChild('uploadLCList') uploadLCList: any;

    public filterOptions = [
        { id: '0', name: 'Select Type' },
        { id: '1', name: 'Lost Customer' },
        { id: '2', name: 'Service Reminder' },
        { id: '3', name: 'Discontinued Customer' },
        { id: '4', name: 'Extended Warranty Customer' },
        { id: '5', name: 'Campaign Data' },
    ];

    public cols = [
        { field: 'uf_id', title: 'ID', isUnique: true },
        { field: 'uf_filename', title: 'File Name', isUnique: false },
        { field: 'us_firstname', title: 'Uploaded By', isUnique: false },
        { field: 'uf_rec_count', title: 'Total Customers', isUnique: false },
        { field: 'uf_created_on', title: 'Created On', isUnique: false },
        { field: 'action', title: 'Actions', isUnique: false },
    ];

    constructor(private userServices: StaffPostAuthService, private fb: FormBuilder, public router: Router) {
        this.uploadLCForm = this.fb.group({
            attach: ['', [Validators.required]],
            attach_name: ['', [Validators.required, Validators.maxLength(60)]],
            attach_type: ['0', [Validators.required]],
        });
    }

    ngOnInit(): void {
        this.userServices.lostCustomerUploadedList().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                rData.filelist.forEach((element: any) => {
                    element['uf_created_on'] = moment(element['uf_created_on'], 'YYYY-MM-DD').format('DD-MM-YYYY');
                });
                this.fileList = rData.filelist;
                this.load_flag = false;
            } else {
                this.load_flag = false;
                this.coloredToast('danger', 'Some error occurred please try again');
            }
        });
    }

    lostListView(item: any) {
        this.router.navigateByUrl('admin_staff/lost_customer/lc_import/details/' + btoa(item.uf_id));
    }

    deleteLostList(item: any) {
        this.coloredToast('danger', 'No permission');
    }

    openUploadModal() {
        this.uploadLCList.open();
    }

    uploadLostCustomers() {
        if (this.uploadedFile && this.uploadLCForm.value.attach_name != '') {
            const inData = new FormData();
            inData.append('attachment', this.uploadedFile);
            inData.append('file_name', this.uploadLCForm.value.attach_name);
            inData.append('file_type', this.uploadLCForm.value.attach_type);
            this.userServices.uploadLostCustomerExcel(inData).subscribe((rdata: any) => {
                if (rdata.ret_data === 'success') {
                    if (rdata.count > 0) {
                        this.imageUrl = './assets/images/no_file.png';
                        this.coloredToast('success', rdata.count + ' Rows Uploaded');
                        this.uploadLCList.close();
                    } else {
                        this.coloredToast('danger', 'Duplicate Entry in Excel File');
                    }
                } else {
                    this.coloredToast('Duplicate', 'File Name Already Uploaded');
                }
            });
        } else {
            this.coloredToast('danger', 'Empty Inputs not allowed');
        }
    }

    onFileChanged(event: any) {
        let filetype = event.target.files[0].name.split('.').pop();
        if (filetype == 'csv') {
            this.uploadedFile = event.target.files[0];
            this.imageUrl = './assets/images/excel_icon.png';
        } else {
            this.coloredToast('danger', 'CSV files only supported');
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
