import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import { ThirdPartyApisService } from 'src/app/service/third-party-apis.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-department-create',
  templateUrl: './department-create.component.html',
  styleUrls: ['./department-create.component.css']
})
export class DepartmentCreateComponent implements OnInit {

  public trunkList: any[] = [];
  public deptForm: FormGroup;
  public trunk: any[] = [];
  public featureData: any[] = [];
  public feature: any[] = [];

  public data_submit_flag: boolean = false;
  public data_load_flag: boolean = true;

  constructor(
    private fb: FormBuilder,
    private userServices: StaffPostAuthService,
    private third_party: ThirdPartyApisService,
    public router: Router,
  ) {
    this.deptForm = this.fb.group({
      dept_name: ['', [Validators.required, Validators.maxLength(50)]],
      dept_desc: ['', [Validators.minLength(3), Validators.maxLength(100)]],
      trunk: [[]],
    });
  }

  ngOnInit(): void {

    this.userServices.getFeatureList().subscribe((rData: any) => {
      if (rData.ret_data == "success") {
        rData.feature_list.forEach((element: any) => {
          element.checked = false;
        });
        this.featureData = rData.feature_list;
      } else {
        this.coloredToast("danger", "System features cant be fetched");
      }
    });
    this.userServices.GetYeaStarKeys().subscribe((rData: any) => {
      if (rData.ret_data == "success") {
        this.third_party.getTrunkList(atob(atob(atob(rData.yeastar_data.yeastar_token)))).subscribe((rData2: any) => {
          this.trunkList = rData2.data;
        });
        this.data_load_flag = false;
      } else {
        this.data_load_flag = false;
      }
    });
  }
  eventCheck(event: any, ft: any) {
    if (event.target.checked == true) {
      this.feature.push(ft);
    }
    else {
      const index: number = this.feature.indexOf(ft);
      if (index !== -1) {
        this.feature.splice(index, 1);
      }
    }
  }

  compareById(v1: any, v2: any): boolean {
    return v1 == v2;
  }

  createDepartment() {
    if (this.feature.length == 0) {
      this.coloredToast("danger", "Select Atleast one feature");
    }
    else {
      if (this.deptForm.valid) {
        this.data_submit_flag=true;
        let data = {
          "dept_name": this.deptForm.value.dept_name,
          "dept_desc": this.deptForm.value.dept_desc,
          "trunk": this.deptForm.value.trunk,
          "feature": this.feature
        }
        this.userServices.createDepartment(data).subscribe((rdata: any) => {
          if (rdata.ret_data == "success") {
            this.coloredToast("success", "Department Added Successfully");
            this.data_submit_flag=false;
            this.router.navigateByUrl('admin_staff/departments/list');
          } else {
            this.data_submit_flag=false;
            this.coloredToast("danger", "Could'nt add department. Please try again");
          }
        });
      } else {
        this.coloredToast("danger", "Please check validation errors");
      }

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
