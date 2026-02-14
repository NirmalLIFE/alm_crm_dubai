import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-svc-list',
  templateUrl: './svc-list.component.html',
  styleUrls: ['./svc-list.component.css']
})
export class SvcListComponent implements OnInit {
  public load_flag: boolean = false;
  public create_flag: boolean = false;

  public cols = [
    { field: 'sct_name', title: 'Name' },
    { field: 'sct_services', title: 'Service Limit' },
    { field: 'sct_pickup_and_drop', title: 'Pick Up & Drop Amount' },
    { field: 'sct_excess_discount', title: 'Excess for Discount %' },
    { field: 'sct_sa_incentive', title: 'SA Incentive' },
    { field: 'sct_discount', title: 'Discount %' },
    { field: 'sct_visit_frequency_month', title: 'Frequency Month' },
    { field: 'action', title: 'Action' },
  ];
  public serviceContractList: any = [];
  public contractDetails: any = [];
  search: string = '';
  @ViewChild('editContractTier') editContractTier: any;
  @ViewChild('addContractTier') addContractTier: any;
  constructor(public router: Router, private userServices: StaffPostAuthService, private activeRouter: ActivatedRoute, public datePipe: DatePipe) { }

  ngOnInit() {
    this.getServiceContractTiers();
  }

  getServiceContractTiers() {
    this.load_flag = true;

    this.userServices.getServiceContractTiers().subscribe((rData: any) => {
      if (rData.ret_data == 'success') {
        this.serviceContractList = rData.tier;
      }
      this.load_flag = false;
    });
  }

  onEditContractTier(value: any) {
    this.contractDetails = {
      sct_id: value.sct_id || '',
      sct_name: value.sct_name || '',
      sct_services: value.sct_services || '',
      sct_pickup_and_drop: value.sct_pickup_and_drop || '',
      sct_excess_discount: value.sct_excess_discount || '',
      sct_sa_incentive: value.sct_sa_incentive || '',
      sct_discount: value.sct_discount || '',
      sct_visit_frequency_month: value.sct_visit_frequency_month || '',
    };
    this.editContractTier.open();
  }

  updateContractTierDetails() {
    this.userServices.updateContractTierDetails(this.contractDetails).subscribe((rData: any) => {
      if (rData.ret_data == 'success') {
        this.editContractTier.close();
        this.getServiceContractTiers();
      } else {
        this.load_flag = false;
      }
    });
  }

  addContractTierModal() {
    this.contractDetails = {
      sct_id: '',
      sct_name: '',
      sct_services: '',
      sct_pickup_and_drop: '',
      sct_excess_discount: '',
      sct_sa_incentive: '',
      sct_discount: '',
      sct_visit_frequency_month: '',
    };
    this.addContractTier.open();
  }

  createContractTier() {
    this.create_flag = true;
    const fieldsToCheck = [
      { key: 'sct_name', message: 'Please enter the Contract Name.' },
      { key: 'sct_services', message: 'Please enter the number of Services.' },
      { key: 'sct_pickup_and_drop', message: 'Please specify Pickup and Drop Amount.' },
      { key: 'sct_excess_discount', message: 'Please enter the Excess Discount in Percentage.' },
      { key: 'sct_sa_incentive', message: 'Please enter the SA Incentive Amount.' },
      { key: 'sct_discount', message: 'Please enter the Discount in Percentage.' },
      { key: 'sct_visit_frequency_month', message: 'Please enter the Visit Frequency (in months).' },
    ];

    for (const field of fieldsToCheck) {
      const value = this.contractDetails[field.key];
      if (!value || value.trim() === '') {
        this.coloredToast('warning', field.message);
        this.create_flag = false;
        return;
      }
    }

    this.userServices.createServiceContractTier(this.contractDetails).subscribe((rData: any) => {
      if (rData.ret_data == 'success') {
        this.create_flag = false;
        this.addContractTier.close();
        this.getServiceContractTiers();
      } else {
        this.create_flag = false;
        this.load_flag = false;
      }
    });
  }

  onDeleteContractTier(value: any) {
    Swal.fire({
      title: 'Are you sure?',
      html: `
            <p>Deleting this <b>Service Contract Tier</b> may affect any existing
            <b>Service Contracts</b> created under it.</p>
            <p>Do you still want to proceed?</p>
        `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        // Proceed only after user confirms
        this.userServices.deleteServiceContractTier({ sct_id: value.sct_id }).subscribe((rData: any) => {
          if (rData.ret_data === 'success') {
            Swal.fire({
              title: 'Deleted!',
              text: 'The contract tier has been deleted successfully.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
            });
            this.addContractTier.close();
            this.getServiceContractTiers();
          } else {
            this.load_flag = false;
            Swal.fire('Error', 'Something went wrong while deleting.', 'error');
          }
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Cancelled',
          text: 'Deletion cancelled.',
          icon: 'info',
          timer: 1200,
          showConfirmButton: false,
        });
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
