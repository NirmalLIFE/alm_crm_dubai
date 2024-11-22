import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-lost-import-details',
  templateUrl: './lost-import-details.component.html',
  styleUrls: ['./lost-import-details.component.css']
})
export class LostImportDetailsComponent implements OnInit {

  @ViewChild('dataTable') dataTable: any;
  @ViewChild('assignLostCustomers') assignLostCustomers: any;

  public fileId: string = '';
  public lostCustomerListMaster: any[] = [];
  public lostCustomerList: any[] = [];
  public selectedCustomerList: any[] = [];
  public usersList: any[] = [];
  public file: any;
  public load_flag: boolean = true;
  public submit_flag: boolean = false;
  public search: string = '';
  public model_year_from: string = '';
  public model_year_to: string = '';
  public modelCode: string = '';
  public invoiceDateFrom: string = '';
  public invoiceDateTo: string = '';
  public assignForm: FormGroup;
  public filterCriteria: string = '';

  public month = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  cols = [
    { field: 'customer_code', title: 'Customer Code', isUnique: true },
    { field: 'customer_name', title: 'Customer Name' },
    { field: 'phone', title: 'Contact' },
    { field: 'reg_no', title: 'Reg. No' },
    { field: 'model_code', title: 'Model Code' },
    { field: 'model_name', title: 'Model Name' },
    { field: 'model_year', title: 'Model Year' },
    { field: 'invoice_date', title: 'Invoice date' },
    { field: 'assigned_user', title: 'Assigned To' },
  ];

  constructor(
    private userServices: StaffPostAuthService,
    private activeRouter: ActivatedRoute,
    private fb: FormBuilder,
  ) {
    this.fileId = decodeURIComponent(atob(this.activeRouter.snapshot.paramMap.get('id') || '{}'));
    this.assignForm = this.fb.group({
      assignUser: [null, [Validators.required]],
      assignDue: ['', [Validators.required]],
      assignDueTo: ['', [Validators.required]]
    })
  }

  ngOnInit(): void {
    this.viewCustomerList();
  }

  viewCustomerList() {
    this.userServices.getLostCustomerListByFileId({ "file_id": this.fileId }).subscribe((rData: any) => {
      if (rData.ret_data == "success") {
        this.lostCustomerList = rData.customer;
        this.lostCustomerListMaster = rData.customer;
        this.lostCustomerList.forEach((element: any) => {
          element.checked = false;
          element.assigned_user = element.lcst_assign != 0 ? element.us_firstname : "Not Assigned";
        });
        this.file = rData.file;
        this.filterCriteria = this.file['uf_filename'];
        this.load_flag = false;
      } else {
        this.coloredToast("danger", "Some error occurred please try again later");
        this.load_flag = false;
      }
    });
  }

  customSearchFilter() {
    let dt = this.lostCustomerListMaster;
    this.filterCriteria = this.file['uf_filename'] + ',';
    if (this.model_year_from != '' && this.model_year_from != null) {
      dt = dt.filter((d) => Number(d.model_year) >= Number(this.model_year_from));
      this.filterCriteria += 'Model year from ' + this.model_year_from + ' ,';
    }
    if (this.model_year_to != '' && this.model_year_to != null) {
      dt = dt.filter((d) => Number(d.model_year) <= Number(this.model_year_to));
      this.filterCriteria += 'Model year to ' + this.model_year_to + ' ,';
    }
    if (this.modelCode != '' && this.modelCode != null) {
      dt = dt.filter((d) => Number(d.model_code) == Number(this.modelCode));
      this.filterCriteria += 'Model code ' + this.modelCode + ' ,';
    }
    if (this.invoiceDateFrom != '' && this.invoiceDateFrom != null) {
      let date = new Date(this.invoiceDateFrom + " 00:00:00");
      dt = dt.filter((d) => new Date(d.invoice_date) >= date);
      this.filterCriteria += 'Invoiced from ' + this.invoiceDateFrom + ' ,';
    }
    if (this.invoiceDateTo != '' && this.invoiceDateTo != null) {
      let date = new Date(this.invoiceDateTo + " 00:00:00");
      dt = dt.filter((d) => new Date(d.invoice_date) <= date);
      this.filterCriteria += 'Invoiced from ' + this.invoiceDateFrom + ' ,';
    }
    this.filterCriteria = this.filterCriteria.slice(0, -1);
    this.lostCustomerList = dt;
  }

  updateCheckedList() {
    this.selectedCustomerList = this.dataTable.getSelectedRows();
  }

  assignCustomersToStaff() {
    const customersAssigned = this.selectedCustomerList.filter((item) => item.lcst_assign == 0);
    if (customersAssigned.length > 0) {
      this.userServices.userList().subscribe((rData: any) => {
        if (rData.ret_data == "success") {
          this.usersList = rData.userList;
        }
      });
      this.assignLostCustomers.open();
    } else {
      this.coloredToast("danger", "All selected customers are already assigned.");
    }
  }
  saveAssigningDetails() {
    if (this.assignForm.valid) {
      this.submit_flag=true;
      const datevalD = new Date(this.assignForm.value.assignDue);
      const datevalDT = new Date(this.assignForm.value.assignDueTo);
      const customerList = this.selectedCustomerList.filter((item) => item.lcst_assign == 0);
      const customerArray:any=[];
      customerList.forEach(element => {
        customerArray.push(element['lcst_id']);
      });
      const data = {
        Due: ('0' + datevalD.getDate()).slice(-2) + "/" + ('0' + (datevalD.getMonth() + 1)).slice(-2) + "/" + datevalD.getFullYear(),
        DueTo: ('0' + datevalDT.getDate()).slice(-2) + "/" + ('0' + (datevalDT.getMonth() + 1)).slice(-2) + "/" + datevalDT.getFullYear(),
        cust_id: customerArray,
        filter_by: this.filterCriteria,
        assignUser: this.assignForm.value.assignUser
      };
      this.userServices.assignLostCustomers(data).subscribe((rData: any) => {
        if (rData.ret_data == "success") {
          this.coloredToast("success", "Lost customers assigned successfully");
          this.viewCustomerList();
          this.assignLostCustomers.close();
          this.submit_flag=false;
        }
        else {
          this.coloredToast("danger", "Some error occurred, please try again later");
          this.submit_flag=false;
        }
      });
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
