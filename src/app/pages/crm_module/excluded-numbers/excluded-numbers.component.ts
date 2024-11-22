import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-excluded-numbers',
  templateUrl: './excluded-numbers.component.html',
  styleUrls: ['./excluded-numbers.component.css']
})
export class ExcludedNumbersComponent implements OnInit {

  @ViewChild('addExNumber') addExNumber: any;
  @ViewChild('editExNumber') editExNumber: any;
  public excludedNumbers: any[] = [];
  public load_flag: boolean = true;
  public search: string = '';
  public numberForm: FormGroup;

  public cols = [
    { field: 'cn_number', title: 'Number', isUnique: true },
    { field: 'cn_user', title: 'Name', isUnique: false },
    { field: 'cn_reason', title: 'Reason', isUnique: false },
    { field: 'action', title: 'Action', isUnique: false },
  ];

  constructor(
    private userServices: StaffPostAuthService,
    private fb: FormBuilder,
  ) {
    this.numberForm = this.fb.group({
      number: ['', [Validators.required, Validators.maxLength(10), Validators.pattern('[0-9]+')]],
      user: ['', [Validators.required, Validators.maxLength(50), Validators.pattern('[a-zA-Z][a-zA-Z ]+[a-zA-Z]$')]],
      reason: ['', [Validators.required, Validators.maxLength(100)]],
      id: ['0']
    })
  }

  ngOnInit(): void {
    this.getExcludedNumbers();
  }

  getExcludedNumbers() {
    this.userServices.getExcludedNumberList().subscribe((rData: any) => {
      if (rData.ret_data == "success") {
        this.excludedNumbers = rData.numlist;
        this.load_flag = false;
      } else {
        this.load_flag = false;
        this.coloredToast("danger", "Some error occurred please try again");
      }
    });
  }

  exNumberEdit(item: any) {
    this.numberForm.patchValue({
      number: item.cn_number,
      user: item.cn_user,
      reason: item.cn_reason,
      id: item.cn_id
    });
    this.editExNumber.open();
  }

  updateExNumberDetails() {
    if (this.numberForm.valid) {
      this.userServices.updateExNumberDetails(this.numberForm.value).subscribe((rData: any) => {
        if (rData.ret_data == "success") {
          this.coloredToast("success", "Excluded Number Updated Successfully");
          this.editExNumber.close();
          this.getExcludedNumbers();
        } else {
          this.coloredToast("danger", "Cant Update, Some error occurred please try again");
        }
      });
    } else {
      this.coloredToast("danger", "Please check validation errors");
    }
  }

  exNumberDelete(item: any) {
    Swal.fire({
      icon: 'warning',
      title: "You won't be able to revert this!",
      text: "You are about to delete an excluded number, Are you sure?",
      showCancelButton: true,
      confirmButtonText: 'Delete',
      padding: '2em',
      customClass: 'sweet-alerts',
    }).then((result) => {
      if (result.value) {
        this.userServices.deleteExcludedNumber(item.cn_id).subscribe((rData: any) => {
          if (rData.ret_data === 'success') {
            this.coloredToast("success", "Number deleted successfully");
            this.getExcludedNumbers();
          } else {
            this.coloredToast("danger", "Can't delete purpose");
          }
        })
      }
    });
  }

  exAddNewNumber() {
    this.numberForm.patchValue({
      number: '',
      user: '',
      reason: '',
      id: '0'
    });
    this.addExNumber.open();
  }

  submitNewExNumber() {
    if (this.numberForm.valid) {
      this.userServices.addExtensionNumber(this.numberForm.value).subscribe((rData: any) => {
        if (rData.ret_data == "success") {
          this.coloredToast("success", "Excluded Number Added Successfully");
          this.addExNumber.close();
          this.getExcludedNumbers();
        } else {
          this.coloredToast("danger", "Could'nt add excluded number. Please try again");
        }
      });
    } else {
      this.coloredToast("danger", "Please check validation errors");
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
