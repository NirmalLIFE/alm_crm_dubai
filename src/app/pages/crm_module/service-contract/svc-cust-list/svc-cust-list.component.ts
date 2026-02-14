import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-svc-cust-list',
  templateUrl: './svc-cust-list.component.html',
  styleUrls: ['./svc-cust-list.component.css']
})
export class SvcCustListComponent implements OnInit {
  public load_flag: boolean = false;
  public serviceContractCustomers: any = [];
  search: string = '';
  public vin_No: any;
  public Kilometer: any;
  public reg_No: any;
  public _searchMode: 'vinNo' | 'regNo' = 'vinNo';
  public Model: any;
  public ModelYear: any;
  public customerName: any;
  public customerId: any;

  public cols = [
    { field: 'customer_name', title: 'Customer', isUnique: false },
    { field: 'phone', title: 'Phone', isUnique: false },
    { field: 'scv_reg_no', title: 'Reg No', isUnique: false },
    { field: 'scv_vehicle_model', title: 'Model', isUnique: false },
    { field: 'scv_model_year', title: 'Model Year', isUnique: false },
    { field: 'scv_vin_no', title: 'Vin No', isUnique: false },
    { field: 'sct_name', title: 'Contract Tier', isUnique: false },
    { field: 'sc_contract_duration', title: 'Duration', isUnique: false },
    { field: 'sc_valid_from', title: 'Contract From', isUnique: false },
    { field: 'sc_valid_upto', title: 'Contract UpTo', isUnique: false },
    { field: 'scv_kilometer_from', title: 'Kilometer From', isUnique: false },
    { field: 'sc_contract_price', title: 'Price', isUnique: false },
    { field: 'action', title: 'Action', isUnique: false },
    // { field: 'facelift', title: 'Facelift', slot: 'facelift' },
  ];

  constructor(public router: Router, private userServices: StaffPostAuthService, private activeRouter: ActivatedRoute, public datePipe: DatePipe) { }

  ngOnInit() {
    this.getContractCustomers();
  }

  getContractCustomers() {
    this.load_flag = true;
    this.userServices.getServiceContractCustomers().subscribe((rData: any) => {
      if (rData.ret_data == 'success') {
        this.serviceContractCustomers = rData.cutomersContracts;
      }
      this.load_flag = false;
    });
  }

  checkServiceContractPrice() {
    this.router.navigate(['searchServiceContract']);
  }

  deleteCustomer(event: any) {
    this.load_flag = true;
    let data = {
      sc_id: event.sc_id,
      sc_v_id: event.sc_v_id,

    };
    this.userServices.deleteServiceContractCustomers(data).subscribe((rData: any) => {
      if (rData.ret_data == 'success') {
        this.coloredToast('success', 'Service Contract Deleted Successfully');
      } else {
        this.coloredToast('danger', 'Something went wrong');
      }
      this.getContractCustomers();

      this.load_flag = false;
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
