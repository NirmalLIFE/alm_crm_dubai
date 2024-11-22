import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-spare-brand',
  templateUrl: './spare-brand.component.html',
  styleUrls: ['./spare-brand.component.css']
})
export class SpareBrandComponent implements OnInit {

  @ViewChild('editBrand') editBrand: any;
  @ViewChild('addBrand') addBrand: any;

  public load_flag: boolean = true;
  public search: string = '';
  public brandList: any[] = [];
  public permittedAction: any[] = [];
  public brandForm: FormGroup;

  public cols = [
    { field: 'brand_name', title: 'Brand Name', isUnique: true },
    { field: 'brand_code', title: 'Brand Code', isUnique: false },
    { field: 'action', title: 'Action', isUnique: false },
  ];

  constructor(
    private userServices: StaffPostAuthService,
    private fb: FormBuilder,
  ) {
    JSON.parse(atob(atob(localStorage.getItem('access_data') || '{}'))).forEach((element: any) => {
      if (element['ft_id'] == 8) {
        this.permittedAction = element['actions'];
      }
    });
    this.brandForm = this.fb.group({
      brand: ['', [Validators.required, Validators.maxLength(50)]],
      code: ['', [Validators.required, Validators.maxLength(4)]],
      id: ['0']
    })
  }

  ngOnInit(): void {
    this.getBrandList();
  }

  getBrandList() {
    this.userServices.getBrandList().subscribe((rData: any) => {
      if (rData.ret_data == "success") {
        this.brandList = rData.brand;
        this.load_flag = false;
      } else {
        this.load_flag = false;
        this.coloredToast("danger", "Some error occurred please try again");
      }
    });
  }

  addNewBrand() {
    this.brandForm.patchValue({
      brand: '',
      code: '',
      id: '0'
    });
    this.addBrand.open();
  }

  createNewBrand() {
    if (this.permittedAction.includes('1')) {
      if (this.brandForm.valid) {
        this.userServices.createNewBrand(this.brandForm.value).subscribe((rdata: any) => {
          if (rdata.ret_data == "success") {
            this.coloredToast("success", "Brand Created Successfully");
            this.getBrandList();
            this.addBrand.close();
          } else {
            this.coloredToast("danger", "Some error occurred please try again");
          }

        });
      } else {
        this.coloredToast("danger", "Please check validation errors");
      }
    } else {
      this.coloredToast("danger", "You do'nt have enough permission.");
    }
  }

  brandEdit(item: any) {
    if (this.permittedAction.includes('2')) {
      this.brandForm.patchValue({
        brand: item.brand_name,
        code: item.brand_code,
        id: item.brand_id
      });
      this.editBrand.open();
    } else {
      this.coloredToast("danger", "You do'nt have enough permission.");
    }
  }

  updateBrandDetails() {
    if (this.brandForm.valid) {
      this.userServices.updateBrandDetails(this.brandForm.value).subscribe((rData: any) => {
        if (rData.ret_data == "success") {
          this.coloredToast("success", "Brand Updated Successfully");
          this.getBrandList();
          this.editBrand.close();
        } else {
          this.coloredToast("danger", "ome error occurred please try again");
        }

      });
    } else {
      this.coloredToast("danger", "Please check validation errors");
    }
  }

  brandDelete(item: any) {
    if (this.permittedAction.includes('3')) {
      Swal.fire({
        icon: 'warning',
        title: "You won't be able to revert this!",
        text: "You are about to delete a brand, Are you sure?",
        showCancelButton: true,
        confirmButtonText: 'Delete',
        padding: '2em',
        customClass: 'sweet-alerts',
      }).then((result) => {
        if (result.value) {
          this.userServices.deleteBrandDetails({ "id": item.brand_id }).subscribe((rData: any) => {
            if (rData.ret_data === 'success') {
              this.coloredToast("success", "Brand deleted successfully");
              this.getBrandList();
            } else {
              this.coloredToast("danger", "Can't delete Brand");
            }
          })
        }
      });
    } else {
      this.coloredToast("danger", "You do'nt have enough permission.");
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
