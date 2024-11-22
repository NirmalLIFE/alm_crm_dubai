import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StaffLoginService } from 'src/app/service/staff-login.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-staff-login',
  templateUrl: './staff-login.component.html',
  styleUrls: ['./staff-login.component.css']
})
export class StaffLoginComponent implements OnInit {

  loginForm: FormGroup;
  isSubmitForm1 = false;
  otpRequired: boolean = false;
  userData: any;
  accessData: any;

  constructor(
    public router: Router,
    private fb: FormBuilder,
    private auth_ser: StaffLoginService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern('.+@.+\..+')]],
      password: ['', [Validators.required]],
      fcm_token: ['']
    });
  }

  ngOnInit(): void {
    if (localStorage.getItem('us_token') != null) {
      this.router.navigate(['/dashboard']);
    }
  }

  staffLogin() {
    this.isSubmitForm1 = true;
    this.auth_ser.user_login(this.loginForm.value).subscribe((rdata: any) => {
      if (rdata.ret_data == "success") {
        if (rdata.verify == "true") {
          this.otpRequired = false;
          this.userData = rdata.user_details;
          this.accessData = rdata.access;
          localStorage.setItem("us_token", btoa(btoa(btoa(this.userData.us_token))));
          localStorage.setItem("us_id", btoa(btoa(this.userData.us_id)));
          localStorage.setItem("us_firstname", btoa(btoa(this.userData.us_firstname)));
          localStorage.setItem("us_email", btoa(btoa(this.userData.us_email)));
          localStorage.setItem("us_phone", btoa(btoa(this.userData.us_phone)));
          localStorage.setItem("us_role_id", btoa(btoa(this.userData.us_role_id)));
          if (this.userData.us_role_id != "9") {
            localStorage.setItem("us_ext_no", btoa(btoa(this.userData.ext_number ?? "")));
            localStorage.setItem("us_ext_name", btoa(btoa(this.userData.us_ext_name ?? "")));
          }

          localStorage.setItem("us_role_grp", btoa(btoa(this.userData.us_role_grp)));
          localStorage.setItem("us_laabs_id", btoa(btoa(this.userData.us_laabs_id)));
          this.coloredToast("success", "Login Verified. Access Granted !");

          const temp_array: any[] = this.accessData.reduce((acc: any[], element: any) => {
            const found = acc.find((tempele: any) => tempele.ft_id == element.ft_id);
            if (!found) {
              const temdata: any[] = this.accessData
                .filter((element2: any) => element2.ft_id == element.ft_id)
                .map((element2: any) => element2.fa_id);
              acc.push({ ft_id: element.ft_id, actions: temdata });
            }
            return acc;
          }, []);

          console.log(temp_array);
          localStorage.setItem("access_data", btoa(btoa(JSON.stringify(temp_array))));
          setTimeout(() => this.router.navigate(['/dashboard']), 500);
        } else {
          this.otpRequired = true;
          this.userData = rdata.user_details;
          this.accessData = rdata.access;
          this.coloredToast("warning", "Login Successful, Verify OTP");
          // var result = rdata.access;
          // var acessdata = [];
          // localStorage.setItem("access_data",btoa(btoa(JSON.stringify(temp_array))));
        }
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
