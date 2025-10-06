import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-role-edit',
  templateUrl: './user-role-edit.component.html',
  styleUrls: ['./user-role-edit.component.css']
})
export class UserRoleEditComponent implements OnInit {

  public roleId: string;
  public deptId: string;
  public userForm: FormGroup;
  public deptList: any[] = [];
  public featureData: any[] = [];
  public feature: any[] = [];

  public data_load_flag: boolean = true;
  public data_submit_flag: boolean = false;


  constructor(
    private userServices: StaffPostAuthService,
    private activeRouter: ActivatedRoute,
    private fb: FormBuilder,
    public router: Router,
  ) {
    this.roleId = decodeURIComponent(this.activeRouter.snapshot.paramMap.get('id') || '');
    this.deptId = decodeURIComponent(atob(this.activeRouter.snapshot.paramMap.get('dep_id') || ''));
    this.userForm = this.fb.group({
      roleid: [''],
      rname: ['', [Validators.required, Validators.maxLength(50), Validators.pattern('[a-zA-Z][a-zA-Z ]+[a-zA-Z]$')]],
      rdesc: ['', [Validators.maxLength(80)]],
      flag: false,
      rdept_id: ['', [Validators.required]],
      hdvalue: false
    })
  }
  ngOnInit(): void {
    this.userServices.getDeptList().subscribe((rData: any) => {
      if (rData.ret_data == "success") {
        this.deptList = rData.dept;
      } else {
        this.coloredToast("danger", "Cant fetch department list, please try again");
      }
    });

    let data = { "dept_id": this.deptId };
    this.userServices.FeatureListByDept(data).subscribe((rdata: any) => {
      if (rdata.ret_data == "success") {
        const featureList = rdata.feature_list.map((element: any) => ({
          "featureId": element.df_ft_id,
          "feature_name": element.ft_name,
          "feature_desc": element.ft_description,
          "add": false,
          "update": false,
          "delete": false,
          "view": false,
          "list": false,
          "export": false
        }));
        this.featureData.push(...featureList);
        this.userServices.getUseRoleById(this.roleId).subscribe((rdata: any) => {
          if (rdata.ret_data == "success") {
            this.feature = rdata.feature;
            const { feature, userrole } = rdata;
            this.userForm.patchValue({
              roleid: userrole.role_id,
              rname: userrole.role_name,
              rdesc: userrole.role_description,
              ug_groupid: userrole.role_groupid,
              rdept_id: userrole.role_dept_id,
              hdvalue: userrole.dept_head_status,
            });

            const tempfeaturedata = new Map();
            feature.forEach((element: any) => {
              if (!tempfeaturedata.has(element.ft_id)) {
                const temdata = feature
                  .filter((e2: any) => e2.ft_id === element.ft_id)
                  .map((e2: any) => e2.fa_id);
                tempfeaturedata.set(element.ft_id, {
                  ft_id: element.ft_id,
                  ft_name: element.ft_name,
                  actions: temdata
                });
              }
            });

            this.featureData.forEach((item: any) => {
              const item2 = tempfeaturedata.get(item.featureId);
              if (item2) {
                item.add = item2.actions.includes("1");
                item.update = item2.actions.includes("2");
                item.delete = item2.actions.includes("3");
                item.view = item2.actions.includes("4");
                item.list = item2.actions.includes("5");
                item.export = item2.actions.includes("6");
              }
            });
            this.data_load_flag = false;
          } else {
            this.coloredToast("danger", "Cant fetch role data");
            this.data_load_flag = false
          }
        });
      } else {
        this.coloredToast("danger", "Some error occurred please try again");
        this.data_load_flag = false;
      }
    });
    // this.userServices.getUserGroupList().subscribe((rdata: any) => {
    //   if (rdata.ret_data == "success") {
    //     this.grouplist = rdata.groupList;
    //   } else {
    //     this.showToast("danger", "Error!!!", "Some error occurred please try again");
    //   }
    // });
  }

  onSelectionChange(event: any) {
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

  updateUserRole() {
    let sendFeatures: any[] = [];
    this.featureData.forEach(element => {
      let tmpary = [];
      this.userForm.value.flag = false;
      if (element.add) { tmpary.push("1"); this.userForm.value.flag = true; };
      if (element.update) { tmpary.push("2"); this.userForm.value.flag = true; };
      if (element.delete) { tmpary.push("3"); this.userForm.value.flag = true; };
      if (element.view) { tmpary.push("4"); this.userForm.value.flag = true; };
      if (element.list) { tmpary.push("5"); this.userForm.value.flag = true; };
      if (element.export) { tmpary.push("6"); this.userForm.value.flag = true; };
      if (this.userForm.value.flag) {
        let tmpdata = {
          "featureId": element.featureId,
          "actions": tmpary
        }
        sendFeatures.push(tmpdata)
      }
    });
    let sendData = {
      "roleid": this.userForm.value.roleid,
      "rname": this.userForm.value.rname,
      "groupid": this.userForm.value.ug_groupid,
      "rdesc": this.userForm.value.rdesc,
      "rdeptid": this.userForm.value.rdept_id,
      "hdvalue": this.userForm.value.hdvalue,
      "features": sendFeatures
    }

    if (sendFeatures.length > 0) {
      this.userServices.updateUserRole(sendData).subscribe((rdata: any) => {
        if (rdata.ret_data == "success") {
          this.coloredToast("success", "User Role Updated Successfully");
          this.router.navigateByUrl('admin_staff/user/user_role_list');
        } else {
          this.coloredToast("danger", "Some error occurred please try again");
        }
      });

    } else {
      this.coloredToast("danger", "Error!!! Please select atleast one Feature Action");
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
