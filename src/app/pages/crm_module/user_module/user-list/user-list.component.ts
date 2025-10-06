import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {
    public usersList: [] = [];
    public search: string = '';
    public load_flag: boolean = true;
    public permittedAction: [] = [];
    public passwordChangeUser: any;

    public userPasswordForm: FormGroup;

    @ViewChild('changePass') changePass: any;

    public cols = [
        { field: 'us_id', title: 'ID', isUnique: true },
        { field: 'us_firstname', title: 'Name', isUnique: false },
        { field: 'role_name', title: 'Role', isUnique: false },
        { field: 'us_email', title: 'Email', isUnique: true },
        { field: 'us_phone', title: 'Mobile', isUnique: false },
        { field: 'us_date_of_joining', title: 'Joining Date', isUnique: false },
        { field: 'us_status_flag', title: 'Status', isUnique: false },
        { field: 'tr_grp_status', title: 'Trusted Group', isUnique: false },
        { field: 'action', title: 'Actions', isUnique: false },
    ];

    constructor(private userServices: StaffPostAuthService, public router: Router, private fb: FormBuilder) {
        JSON.parse(atob(atob(localStorage.getItem('access_data') || '{}'))).forEach((element: any) => {
            if (element['ft_id'] == 1) {
                this.permittedAction = element['actions'];
            }
        });
        this.userPasswordForm = this.fb.group({
            password: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
            us_confirm_password: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
        });
    }

    ngOnInit(): void {
        this.getUserData();
    }

    getUserData() {
        this.userServices.userList().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                rData.userList.forEach((element: any) => {
                    element['us_date_of_joining'] = moment(element['us_date_of_joining'], 'YYYY-MM-DD').format('DD-MM-YYYY');
                    element['us_status_flag'] = element['us_status_flag'] == '0' ? true : false;
                    element['tr_grp_status'] = element['tr_grp_status'] == '0' ? false : true;
                });
                this.usersList = rData.userList;
                this.load_flag = false;
            } else {
                this.coloredToast('danger', 'Cant fetch users');
                this.load_flag = false;
            }
        });
    }

    userEdit(item: any) {
        if ((this.permittedAction as string[]).includes('2')) {
            this.router.navigateByUrl('admin_staff/user/user_list/user_edit/' + btoa(item.us_id));
        } else {
            this.coloredToast('danger', 'No Permission to Edit!');
        }
    }

    changePassword(item: any) {
        this.passwordChangeUser = item;
        this.changePass.open();
    }

    userTimeSchedule(item: any) {
        if ((this.permittedAction as string[]).includes('2')) {
            this.router.navigateByUrl('admin_staff/user/user_list/user_schedule/' + btoa(item.us_id));
        } else {
            this.coloredToast('danger', 'No Permission to Edit!');
        }
    }

    updateUserPassword(us_id: any) {
        if (this.userPasswordForm.valid) {
            if (this.userPasswordForm.value.password == this.userPasswordForm.value.us_confirm_password) {
                const formData = {
                    ...this.userPasswordForm.value,
                    user_id: btoa(us_id), // Ensure you have this value available
                };
                this.userServices.changeUserPassword(formData).subscribe((rdata: any) => {
                    if (rdata.ret_data == 'success') {
                        this.changePass.close();
                        this.coloredToast('success', 'Password Changed Successfully');
                    } else {
                        this.coloredToast('danger', 'Cant Update Password');
                    }
                });
            } else {
                this.coloredToast('danger', 'Password Mismatch Found');
            }
        }
    }

    updateUserStatus(item: any) {
        if (item.us_status_flag == true) {
            Swal.fire({
                icon: 'warning',
                title: 'Are you sure?',
                text: 'You are about to change the user status to active',
                showCancelButton: true,
                confirmButtonText: 'CHANGE',
                padding: '2em',
                customClass: 'sweet-alerts',
            }).then((result) => {
                if (result.value) {
                    let inData = {
                        us_id: btoa(item.us_id),
                        status: !item.us_status_flag,
                    };
                    this.userServices.changeUserStatus(inData).subscribe((rdata: any) => {
                        if (rdata.ret_data == 'success') {
                            this.coloredToast('success', 'User Status Changed Successfully');
                        } else {
                            item.us_status_flag = false;
                            this.coloredToast('danger', 'Cant update status');
                        }
                    });
                }
            });
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Are you sure?',
                text: 'You are about to change the user to inactive active',
                showCancelButton: true,
                confirmButtonText: 'CHANGE',
                padding: '2em',
                customClass: 'sweet-alerts',
            }).then((result) => {
                if (result.value) {
                    let inData = {
                        us_id: btoa(item.us_id),
                        status: !item.us_status_flag,
                    };
                    this.userServices.changeUserStatus(inData).subscribe((rdata: any) => {
                        if (rdata.ret_data == 'success') {
                            this.coloredToast('success', 'User Status Changed Successfully');
                        } else {
                            item.us_status_flag = true;
                            this.coloredToast('danger', 'Cant update status');
                        }
                    });
                }
            });
        }
    }

    updateUserTrustedStatus(item: any) {
        if (item.tr_grp_status == true) {
            Swal.fire({
                icon: 'warning',
                title: 'Are you sure?',
                text: 'You are about to add the user to trusted group',
                showCancelButton: true,
                confirmButtonText: 'CHANGE',
                padding: '1em',
                customClass: 'sweet-alerts',
            }).then((result) => {
                if (result.value) {
                    let inData = {
                        us_id: btoa(item.us_id),
                        status: item.tr_grp_status,
                    };
                    this.userServices.changeTrustedGroupStatus(inData).subscribe((rdata: any) => {
                        if (rdata.ret_data == 'success') {
                            this.coloredToast('success', 'User Status Changed Successfully');
                        } else {
                            item.us_status_flag = false;
                            this.coloredToast('danger', 'Cant update status');
                        }
                    });
                }
            });
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Are you sure?',
                text: 'You are about to remove the user from trusted group ',
                showCancelButton: true,
                confirmButtonText: 'CHANGE',
                padding: '2em',
                customClass: 'sweet-alerts',
            }).then((result) => {
                if (result.value) {
                    let inData = {
                        us_id: btoa(item.us_id),
                        status: item.tr_grp_status,
                    };
                    this.userServices.changeTrustedGroupStatus(inData).subscribe((rdata: any) => {
                        if (rdata.ret_data == 'success') {
                            this.coloredToast('success', 'User Status Changed Successfully');
                        } else {
                            item.us_status_flag = true;
                            this.coloredToast('danger', 'Cant update status');
                        }
                    });
                }
            });
        }
    }

    deleteUser(item: any) {
        Swal.fire({
            icon: 'warning',
            title: 'You are about to delete a user, Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            padding: '2em',
            customClass: 'sweet-alerts',
        }).then((result) => {
            if (result.value) {
                this.userServices.userDelete(btoa(item.us_id)).subscribe((rdata: any) => {
                    if (rdata.ret_data === 'success') {
                        this.coloredToast('success', 'User deleted successfully');
                        this.getUserData();
                    } else {
                        this.coloredToast('danger', "Can't delete user");
                    }
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
