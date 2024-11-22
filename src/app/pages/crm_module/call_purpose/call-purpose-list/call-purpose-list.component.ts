import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-call-purpose-list',
  templateUrl: './call-purpose-list.component.html',
  styleUrls: ['./call-purpose-list.component.css']
})
export class CallPurposeListComponent implements OnInit {

  @ViewChild('editPurpose') editPurpose: any;
  @ViewChild('addPurpose') addPurpose: any;

  public purposeList: any[] = [];
  public search: string = '';
  public load_flag: boolean = true;
  public roleList: any[] = [];
  public permittedAction: any[] = [];
  public purposeForm: FormGroup;

  public cols = [
    { field: 'call_purpose', title: 'Call Purpose', isUnique: false },
    { field: 'cp_desc', title: 'Purpose Description', isUnique: false },
    { field: 'action', title: 'Actions', isUnique: false },
  ];

  constructor(
    private userServices: StaffPostAuthService,
    private fb: FormBuilder,
  ) {
    JSON.parse(atob(atob(localStorage.getItem('access_data') || '{}'))).forEach((element: any) => {
      if (element['ft_id'] == 5) {
        this.permittedAction = element['actions'];
      }
    });
    this.purposeForm = this.fb.group({
      purpose: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(100)]],
      checkvalue: [false],
      flag: false,
      id: ['0']
    })
  }

  ngOnInit(): void {
    this.getCallPurposes();
  }

  getCallPurposes() {
    this.userServices.getCallPurposeList().subscribe((rData: any) => {
      if (rData.ret_data == "success") {
        this.purposeList = rData.purpose;
        this.load_flag = false;
      } else {
        this.load_flag = false;
        this.coloredToast("danger", "Some error occurred please try again");
      }
    });
  }

  callPurposeCreate() {
    this.purposeForm.patchValue({
      purpose: '',
      description: '',
      checkvalue: false,
      id: '0'
    });
    this.addPurpose.open();
  }

  callPurposeEdit(item: any) {
    this.purposeForm.patchValue({
      purpose: item.call_purpose,
      description: item.cp_desc,
      checkvalue: item.veh_need == "1" ? true : false,
      id: item.cp_id
    });
    this.editPurpose.open();
  }

  createPurposeDetails() {
    if (this.purposeForm.valid) {
      this.userServices.createCallPurpose(this.purposeForm.value).subscribe((rdata: any) => {
        if (rdata.ret_data == "success") {
          this.coloredToast("success", "Call Purpose Created Successfully");
          this.addPurpose.close();
          this.getCallPurposes();
        } else {
          this.coloredToast("danger", "Could'nt add call purpose. Please try again");
        }
      });
    } else {
      this.coloredToast("danger", "Please check validation errors");
    }
  }

  updatePurposeDetails() {
    if (this.purposeForm.valid) {
      this.userServices.updateCallPurpose(this.purposeForm.value).subscribe((rdata: any) => {
        if (rdata.ret_data == "success") {
          this.coloredToast("success", "Call Purpose Updated Successfully");
          this.editPurpose.close();
          this.getCallPurposes();
        } else {
          this.coloredToast("danger", "Cant update call purpose");
        }
      });
    } else {
      this.coloredToast("danger", "Please check validation errors");
    }
  }

  deleteCallPurpose(item: any) {
    if (this.permittedAction.includes('3')) {
      Swal.fire({
        icon: 'warning',
        title: "You won't be able to revert this!",
        text: "You are about to delete a call purpose, Are you sure?",
        showCancelButton: true,
        confirmButtonText: 'Delete',
        padding: '2em',
        customClass: 'sweet-alerts',
      }).then((result) => {
        if (result.value) {
          this.userServices.deleteCallPurpose(item.cp_id).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
              this.coloredToast("success", "Purpose deleted successfully");
              this.getCallPurposes();
            } else {
              this.coloredToast("danger", "Can't delete purpose");
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
