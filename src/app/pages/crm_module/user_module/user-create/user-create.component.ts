import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import { ThirdPartyApisService } from 'src/app/service/third-party-apis.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css']
})
export class UserCreateComponent implements OnInit {

  public userForm: FormGroup;
  public roleList: any[] = [];
  public basic: FlatpickrOptions;
  public store: any;
  public userExtensions: object[] = [];

  public data_submit_flag: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userServices: StaffPostAuthService,
    public storeData: Store<any>,
    private third_party: ThirdPartyApisService,
    public router: Router
  ) {
    this.initStore();
    this.userForm = this.fb.group({
      us_firstname: ['', [Validators.required, Validators.maxLength(50), Validators.pattern('[a-zA-Z][a-zA-Z ]+[a-zA-Z]$')]],
      us_phone: ['', [Validators.required, Validators.pattern('[0-9]+'), Validators.maxLength(10)]],
      us_email: ['', [Validators.required, Validators.maxLength(100), Validators.email]],
      us_role_id: [, [Validators.required]],
      us_date_of_joining: [''],
      us_extension: [, [Validators.pattern('[0-9]+')]],
      us_ext_name: [''],
      us_laabs_id: ['', [Validators.pattern('[0-9]+')]],
      us_password:['',[Validators.required,Validators.minLength(3),Validators.maxLength(20)]],
      tgvalue:[false] ,
    });
    this.userServices.GetYeaStarKeys().subscribe((rData: any) => {
      if (rData.ret_data == "success") {
        this.third_party.getExtensionList(atob(atob(atob(rData.yeastar_data.yeastar_token)))).subscribe((rDataN: any) => {
          this.userExtensions = rDataN.data;
        });
      }
    });
    this.basic = {
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

  }

  createUser() {
    if (this.userForm.valid) {
      this.data_submit_flag = true;
      const stringified = JSON.stringify(this.userForm.value.us_date_of_joining);
      this.userForm.value.us_date_of_joining = stringified.substring(1, 11);
      this.userServices.createUser(this.userForm.value).subscribe((rdata: any) => {
        if (rdata.ret_data == "success") {
          this.coloredToast("success", "User  Created Successfully");
          this.router.navigateByUrl('admin_staff/user/user_list');
        } else {
          this.coloredToast("danger", "Some error occurred please try again");
        }
      });
    } else {
      this.coloredToast("danger", "Please fill all the required fields properly")
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
