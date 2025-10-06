import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-permitted-ip-list',
    templateUrl: './permitted-ip-list.component.html',
    styleUrls: ['./permitted-ip-list.component.css'],
})
export class PermittedIpListComponent {
    @ViewChild('addIPAddress') addIPAddress: any;
    @ViewChild('editIP') editIP: any;

    public load_flag: boolean = true;
    public search: string = '';
    public IpList: any = [];
    ipForm!: FormGroup;
    ipEditForm!: FormGroup;
    public permittedAction: any[] = [];

    public cols = [
        { field: 'pip_address', title: 'IP Address', isUnique: true },
        { field: 'pip_reason', title: 'IP Reason', isUnique: false },
        { field: 'action', title: 'Action', isUnique: false },
    ];

    constructor(private userServices: StaffPostAuthService, private fb: FormBuilder) {
        JSON.parse(atob(atob(localStorage.getItem('access_data') || '{}'))).forEach((element: any) => {
            if (element['ft_id'] == 13) {
                this.permittedAction = element['actions'];
            }
        });
    }

    ngOnInit() {
        this.ipForm = this.fb.group({
            reason: ['', [Validators.required, Validators.minLength(3)]],
            ip: [
                '',
                [
                    Validators.required,
                    // Regex for IPv4 like 192.168.0.1
                    Validators.pattern(/^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/),
                ],
            ],
        });
        this.getIpList();

        this.ipEditForm = this.fb.group({
            pip_id: [''],
            reason: ['', [Validators.required, Validators.minLength(3)]],
            ip: ['', [Validators.required, Validators.pattern(/^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/)]],
        });
    }

    getIpList() {
        this.load_flag = true;
        this.userServices.getIpList().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.IpList = rData.iplist;
                this.load_flag = false;
            } else {
                this.load_flag = false;
                this.coloredToast('danger', 'Some error occurred please try again');
            }
        });
    }

    addNewIp() {
        this.addIPAddress.open();
    }

    IpEdit(value: any) {
        this.ipEditForm.patchValue({
            reason: value.pip_reason,
            ip: value.pip_address,
            pip_id: value.pip_id,
        });
        this.editIP.open();
    }

    updateIPDetails() {
        if (this.ipEditForm.valid) {
            const formData = this.ipEditForm.value;
            this.userServices.updateIPAddress(formData).subscribe((rData: any) => {
                if (rData.ret_data == 'success') {
                    this.editIP.close();
                    this.coloredToast('success', 'IP Address Updated Successfully.');
                    this.getIpList();
                } else if (rData.ret_data === 'fail' && rData.msg) {
                    this.coloredToast('danger', rData.msg);
                } else {
                    this.coloredToast('danger', 'Failed to Update IP Address.');
                }
            });
        } else {
            this.ipEditForm.markAllAsTouched();
        }
    }

    IpDelete(value: any) {
        const data = {
            id: value.pip_id,
        };
        console.log('perimitted action', this.permittedAction);
        if (this.permittedAction.includes('3')) {
            Swal.fire({
                icon: 'warning',
                title: "You won't be able to revert this!",
                text: 'You are about to delete IP Address, Are you sure?',
                showCancelButton: true,
                confirmButtonText: 'Delete',
                padding: '2em',
                customClass: 'sweet-alerts',
            }).then((result) => {
                if (result.value) {
                    this.userServices.deleteIPAddress(data).subscribe((rdata: any) => {
                        if (rdata.ret_data === 'success') {
                            this.coloredToast('success', 'IP deleted successfully');
                            this.getIpList();
                        } else {
                            this.coloredToast('danger', "Can't delete IP Address.");
                        }
                    });
                }
            });
        } else {
            this.coloredToast('danger', "Can't delete role, permission denied");
        }
    }

    createIp(): void {
        if (this.ipForm.valid) {
            const formData = this.ipForm.value;
            console.log('Submitting new IP:', formData);
            this.userServices.createIPAddress(formData).subscribe((rData: any) => {
                if (rData.ret_data == 'success') {
                    this.addIPAddress.close();
                    this.coloredToast('success', 'IP Address added Successfully.');
                    this.getIpList();
                } else if (rData.ret_data == 'fail') {
                    this.coloredToast('danger', rData.msg);
                    this.addIPAddress.close();
                }
            });
            this.ipForm.reset();
        } else {
            this.ipForm.markAllAsTouched();
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
