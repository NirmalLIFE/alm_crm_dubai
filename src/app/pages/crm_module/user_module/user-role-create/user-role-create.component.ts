import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-role-create',
  templateUrl: './user-role-create.component.html',
  styleUrls: ['./user-role-create.component.css']
})
export class UserRoleCreateComponent implements OnInit {

  public deptList: any[] = [];
  public userForm: FormGroup;
  public featureData: any[] = [];
  public feature: any[] = [];

  public data_load_flag: boolean = true;
  public data_submit_flag: boolean = false;

  constructor(
    private userServices: StaffPostAuthService,
    public router: Router,
    private fb: FormBuilder,
  ) {
    this.userForm = this.fb.group({
      rname: ['', [Validators.required, Validators.maxLength(50), Validators.pattern('[a-zA-Z][a-zA-Z ]+[a-zA-Z]$')]],
      rdesc: ['', [Validators.maxLength(80)]],
      flag: false,
      dept_id: [null, [Validators.required]],
      hdvalue: ['0', [Validators.required]]
    })
  }

  ngOnInit(): void {
    this.userServices.getDeptList().subscribe((rData: any) => {
      if (rData.ret_data == "success") {
        this.deptList = rData.dept;
        this.data_load_flag = false
      } else {
        this.coloredToast("danger", "Cant fetch department list, please try again");
        this.data_load_flag = false
      }
    });
  }

  onSelectionChange(event: any) {
    console.log("--->", event)
    let data = { "dept_id": event.dept_id };
    this.featureData = [];
    this.userServices.FeatureListByDept(data).subscribe((rdata: any) => {
      if (rdata.ret_data == "success") {
        // Create a map of feature IDs and their corresponding actions
        const featuresMap = new Map();
        this.feature.forEach((element: any) => {
          if (!featuresMap.has(element.ft_id)) {
            featuresMap.set(element.ft_id, []);
          }
          featuresMap.get(element.ft_id).push(element.fa_id);
        });

        rdata.feature_list.forEach((element: any) => {
          let singleitem = {
            "featureId": element.df_ft_id,
            "feature_name": element.ft_name,
            "feature_desc": element.ft_description,
            "add": false,
            "update": false,
            "delete": false,
            "view": false,
            "list": false,
            "export": false
          };

          const actions = featuresMap.get(element.df_ft_id);
          if (actions) {
            singleitem.add = actions.includes("1");
            singleitem.update = actions.includes("2");
            singleitem.delete = actions.includes("3");
            singleitem.view = actions.includes("4");
            singleitem.list = actions.includes("5");
            singleitem.export = actions.includes("6");
          }

          this.featureData.push(singleitem);
        });

        // ...
      } else {
        this.coloredToast("danger", "Some error occurred please try again");
      }
    });
  }

  createUserRole() {
    if (this.userForm.valid) {
      const sendfeatures: any[] = [];
      let flag = false;
      this.data_submit_flag = true;
      this.featureData.forEach((element: any) => {
        const tmpary = [];
        if (element.add) {
          tmpary.push("1");
          flag = true;
        }
        if (element.update) {
          tmpary.push("2");
          flag = true;
        }
        if (element.delete) {
          tmpary.push("3");
          flag = true;
        }
        if (element.view) {
          tmpary.push("4");
          flag = true;
        }
        if (element.list) {
          tmpary.push("5");
          flag = true;
        }
        if (element.export) {
          tmpary.push("6");
          flag = true;
        }

        if (flag) {
          const tmpdata = {
            "featureId": element.featureId,
            "actions": tmpary
          };
          sendfeatures.push(tmpdata);
          flag=false;
        }
      });
      const senddata = {
        "rname": this.userForm.value.rname,
        "rdesc": this.userForm.value.rdesc,
        "rdept_id": this.userForm.value.dept_id,
        "hdvalue": this.userForm.value.hdvalue,
        "features": sendfeatures,
      };

      if (sendfeatures.length > 0) {
        this.userServices.createUserRole(senddata).subscribe((rdata: any) => {
          if (rdata.ret_data == "success") {
            this.data_submit_flag = false;
            this.coloredToast("success", "User Role Created Successfully");
            this.router.navigateByUrl('admin_staff/user/user_role_list');
          } else {
            this.data_submit_flag = false;
            this.coloredToast("danger", "Some error occurred please try again");
          }
        });
      } else {
        this.data_submit_flag = false;
        this.coloredToast("danger", "Please select at least one Feature Action");
      }
    } else {
      this.coloredToast("danger", "Please fill all the required fields");
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
