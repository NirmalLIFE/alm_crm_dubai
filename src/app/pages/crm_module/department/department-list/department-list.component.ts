import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-department-list',
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.css']
})
export class DepartmentListComponent implements OnInit {

  public search: string = '';
  public load_flag: boolean = true;
  public permittedAction: [] = [];
  public departmentList: any[] = [];

  public cols = [
    { field: 'dept_name', title: 'Department Name', isUnique: false },
    { field: 'dept_desc', title: 'Department Description', isUnique: false },
    { field: 'action', title: 'Actions', isUnique: false },
  ];

  constructor(
    private userServices: StaffPostAuthService,
    public router: Router,
  ) {
    JSON.parse(atob(atob(localStorage.getItem('access_data') || '{}'))).forEach((element: any) => {
      if (element['ft_id'] == 17) {
        this.permittedAction = element['actions'];
      }
    });
  }

  ngOnInit(): void {
    this.getDepartmentList();
  }
  getDepartmentList() {
    this.userServices.getDepartmentList().subscribe((rData: any) => {
      if (rData.ret_data == "success") {
        this.departmentList = rData.dept;
        this.load_flag = false;
      } else {
        this.load_flag = false;
        this.coloredToast("danger", "Department List Cant be fetched");
      }
    });
  }

  departmentCreate() {
    if ((this.permittedAction as string[]).includes('1')) {
      this.router.navigateByUrl('admin_staff/departments/list/create');
    }
    else {
      this.coloredToast("danger", "No Permission to Create!");
    }
  }

  departmentEdit(item: any) {
    if ((this.permittedAction as string[]).includes('2')) {
      this.router.navigateByUrl('admin_staff/departments/list/edit/' + (btoa(item.dept_id)));
    }
    else {
      this.coloredToast("danger", "No Permission to Edit!");
    }
  }

  deleteDepartment(item: any) {
    if ((this.permittedAction as string[]).includes('3')) {
      Swal.fire({
        icon: 'warning',
        title: "You won't be able to revert this!",
        text: "You are about to delete a department, Are you sure?",
        showCancelButton: true,
        confirmButtonText: 'Delete',
        padding: '2em',
        customClass: 'sweet-alerts',
      }).then((result) => {
        if (result.value) {
          this.userServices.deleteTrunkDepartment(item.dept_id).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
              this.coloredToast("success", "Department deleted successfully");
              this.getDepartmentList();
            } else {
              this.coloredToast("danger", "Can't delete department");
            }
          })
        }
      });
    } else {
      this.coloredToast("danger", "Can't delete department, permission denied");
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
