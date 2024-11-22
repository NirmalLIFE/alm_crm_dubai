import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import { ThirdPartyApisService } from 'src/app/service/third-party-apis.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit {

  public userId: string;
  public userForm: FormGroup;
  public roleList: any[] = [];
  public basic: FlatpickrOptions;
  public store: any;
  public userExtensions: object[] = [];

  public data_load_flag:boolean=true
  public data_submit_flag:boolean=false;

  constructor(
    private activeRouter: ActivatedRoute,
    private fb: FormBuilder,
    private userServices: StaffPostAuthService,
    public storeData: Store<any>,
    private third_party: ThirdPartyApisService
  ) {
    this.userId = this.activeRouter.snapshot.paramMap.get('id') || '';
    this.initStore();
    this.userForm = this.fb.group({
      us_id: ['', [Validators.required]],
      us_firstname: ['', [Validators.required, Validators.maxLength(50), Validators.pattern('[a-zA-Z][a-zA-Z ]+[a-zA-Z]$')]],
      us_phone: ['', [Validators.required, Validators.pattern('[0-9]+'), Validators.maxLength(10)]],
      us_email: ['', [Validators.required, Validators.maxLength(100), Validators.email]],
      us_role_id: ['0', [Validators.required]],
      us_date_of_joining: [''],
      us_extension: ['', [Validators.pattern('[0-9]+')]],
      us_ext_name: [''],
      us_laabs_id: ['', [Validators.pattern('[0-9]+')]],
    });
    this.userServices.GetYeaStarKeys().subscribe((rData: any) => {
      if (rData.ret_data == "success") {
        this.third_party.getExtensionList(atob(atob(atob(rData.yeastar_data.yeastar_token)))).subscribe((rDataN: any) => {
          this.userExtensions = rDataN.data;
        });
      }
    });
    this.basic = {
      defaultDate: new Date(),
      dateFormat: 'Y-m-d',
      maxDate: new Date(),
      position: this.store.rtlClass === 'rtl' ? 'auto right' : 'auto left',
    };
  }

  ngOnInit(): void {
    this.userServices.userRoleList().subscribe((rData: any) => {
      if (rData.ret_data == "success") {
        this.roleList = rData.roleList;
      }
    });
    this.userServices.getUserById(this.userId).subscribe((rdata: any) => {
      if (rdata.ret_data == "success") {
        // this.userdetails = rdata.user_details;
        this.userForm.patchValue({
          us_id: rdata.user_details.us_id,
          us_firstname: rdata.user_details.us_firstname,
          us_phone: rdata.user_details.us_phone,
          us_email: rdata.user_details.us_email,
          us_role_id: rdata.user_details.us_role_id,
          us_date_of_joining: rdata.user_details.us_date_of_joining,
          us_extension: rdata.user_details.ext_number,
          us_ext_name: rdata.user_details.us_ext_name,
          us_laabs_id: rdata.user_details.us_laabs_id
        });
        this.data_load_flag=false;
      }else{
        this.coloredToast("danger", "Cant fetch user details");
        this.data_load_flag=false;
      }
    });
  }

  updateUserData() {
    if (this.userForm.value.us_role_id > 0) {
      this.data_submit_flag=true;
      const stringified = JSON.stringify(this.userForm.value.us_date_of_joining);
      this.userForm.value.us_date_of_joining = stringified.substring(1, 11);
      this.userServices.updateUserData(this.userForm.value).subscribe((rdata: any) => {
        if (rdata.ret_data == "success") {
          this.coloredToast("success", "User  Details Updated Successfully");
          this.data_submit_flag=false;
        } else {
          this.coloredToast("danger", "Cant update user data");
          this.data_submit_flag=false;
        }
      });
    } else {
      this.coloredToast("danger", "Please Select user role");
    }
  }

  async initStore() {
    this.storeData
      .select((d) => d.index)
      .subscribe((d) => {
        this.store = d;
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
