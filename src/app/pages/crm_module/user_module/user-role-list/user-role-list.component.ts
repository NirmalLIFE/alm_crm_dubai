import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-role-list',
  templateUrl: './user-role-list.component.html',
  styleUrls: ['./user-role-list.component.css']
})
export class UserRoleListComponent implements OnInit {

  public search: string = '';
  public load_flag: boolean = true;
  public roleList: any[] = [];
  public permittedAction: any[] = [];

  public cols = [
    { field: 'role_name', title: 'Role Name', isUnique: true },
    { field: 'role_description', title: 'Role Description', isUnique: false },
    { field: 'dept_name', title: 'Department', isUnique: false },
    { field: 'action', title: 'Actions', isUnique: false },
  ];

  constructor(
    private userServices: StaffPostAuthService,
    public router: Router,
  ) {
    JSON.parse(atob(atob(localStorage.getItem('access_data') || '{}'))).forEach((element: any) => {
      if (element['ft_id'] == 2) {
        this.permittedAction = element['actions'];
      }
    });
  }



  ngOnInit(): void {
    this.getUserRoles();
  }

  getUserRoles() {
    this.userServices.userRoleList().subscribe((rData: any) => {
      if (rData.ret_data == "success") {
        console.log(rData.roleList);
        this.roleList = rData.roleList;
        this.load_flag = false;
      } else {
        this.coloredToast("danger", "Cant fetch user roles, Please try again");
        this.load_flag = false;
      }
    });
  }

  userRoleEdit(item: any) {
    if ((this.permittedAction as string[]).includes('2')) {
      this.router.navigateByUrl('admin_staff/user/user_role_list/user_role_edit/' + encodeURIComponent((btoa(item.role_id))) + '/' + encodeURIComponent((btoa(item.role_dept_id))));
    }
    else {
      this.coloredToast("danger", "No Permission to Edit!");
    }
  }

  deleteUserRole(event: any): void {
    if (this.permittedAction.includes('3')) {
      Swal.fire({
        icon: 'warning',
        title: "You won't be able to revert this!",
        text: "You are about to delete a user role, Are you sure?",
        showCancelButton: true,
        confirmButtonText: 'Delete',
        padding: '2em',
        customClass: 'sweet-alerts',
      }).then((result) => {
        if (result.value) {
          this.userServices.userRoleDelete(btoa(event.role_id)).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
              this.coloredToast("success", "User deleted successfully");
              this.getUserRoles();
            } else {
              this.coloredToast("danger", "Can't delete user");
            }
          })
        }
      });
    } else {
      this.coloredToast("danger", "Can't delete role, permission denied");
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
