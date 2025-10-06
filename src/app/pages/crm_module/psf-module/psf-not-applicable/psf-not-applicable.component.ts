import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';

@Component({
  selector: 'app-psf-not-applicable',
  templateUrl: './psf-not-applicable.component.html',
  styleUrls: ['./psf-not-applicable.component.css']
})
export class PsfNotApplicableComponent implements OnInit {
  public search: string = '';
  public load_flag: boolean = true;
  startDate: any;
  endDate: any;
  psf_not_applicable_calls: any[] = [];
  user_psf_calls : any[] = [];
  codes : any[] = [];
  oldCallData: any[] = [];

  @ViewChild('psfcallhistory') psfcallhistory: any;

  cols = [
    { field: 'customer_name', title: 'Customer' },
    { field: 'phone', title: 'Phone Number' },
    { field: 'psfm_job_no', title: 'Job No' },
    { field: 'psfm_reg_no', title: 'Reg No' },
    { field: 'psfm_invoice_date', title: 'Inv. Date' },
    { field: 'psfm_psf_assign_date', title: 'PSF Assign Date' },
    { field: 'attempt_count', title: 'Attempts' },
    { field: 'lastsa_response', title: 'Last SA Response' },
    { field: 'sa_status', title: 'Current Status' },
    { field: 'Action', title: 'Action' },
];

  constructor(private activeRouter: ActivatedRoute, private userServices: StaffPostAuthService) {

    this.startDate = this.activeRouter.snapshot.queryParamMap.get('sDate');
    this.endDate = this.activeRouter.snapshot.queryParamMap.get('eDate');
  }

  ngOnInit(): void {
    this.getPSFcallreport();
  }

  getPSFcallreport() {
   // this.load_flag = true;
    let data = {
      startDate: this.startDate,
      endDate: this.endDate,
    };
    this.codes = [];
    this.psf_not_applicable_calls = [];
    this.user_psf_calls = [];
    this.userServices.getPSFCallReportData(data).subscribe((rData: any) => {
      if (rData.ret_data == "success") {
        this.user_psf_calls = rData.users_psf_list;
        this.user_psf_calls.forEach((element:any) => {
          element.user_psf_calls.forEach((psfCalls:any) => {
            if (parseInt(psfCalls.psfm_num_of_attempts) > 0) {
              if (
                psfCalls.last_call_status.pst_psf_status == "18" ||
                psfCalls.last_call_status.pst_psf_status == "19"
              ) {
                this.codes.push(psfCalls.psfm_customer_code);
                this.psf_not_applicable_calls.push(psfCalls);
              }
            }
          });
        });
        this.load_flag = false;
        this.customerdata();
      } else {
        this.load_flag = false;
      }
    });
  }

  customerdata() {
    this.load_flag = true;
    let data = {
      custcode: this.codes,
    };
    this.userServices.customerdatas(data).subscribe((rData: any) => {
      if (rData.ret_data == "success") {
        this.psf_not_applicable_calls.forEach((element:any) => {
          rData.customers[0].forEach((element2:any) => {
            if (element2.customer_code == element.psfm_customer_code) {
              element["customer_name"] = element2.customer_name;
              element["phone"] = element2.phone;
            }
            if (
              element.last_call_status.pst_response == "6" ||
              element.last_call_status.pst_psf_status == "18"
            ) {
              element["lastsa_response"] = "PSF NOT APPLICABLE";
              element["sa_status"] = "CLOSED";
              element.sastatuscolor = "#9a7c1f";
            } else if (element.last_call_status.pst_psf_status == "19") {
              element["lastsa_response"] = "VEHICLE WORK IN PROGRESS";
              element["sa_status"] = "CLOSED";
              element.sastatuscolor = "#9a7c1f";
            }
          });
        });
       this.load_flag = false;
      }else{
       this.load_flag = false;
      }
    });
  }


  getPsfCallList(psf_master_id:any) {
    this.userServices.get_PSFrecord_info({ psf_id: psf_master_id })
      .subscribe((rdata: any) => {
        if (rdata.ret_data == "success") {
          this.oldCallData = [];
          rdata.psf_info.psf_history.forEach((element:any) => {
            if (rdata.psf_info.psfm_psf_assign_date <= element.psf_call_date) {
              let callItemData = {
                call_date: element.psf_call_date,
                call_response: element.psf_response,
                call_reason: element.psf_reason,
                call_response_text: element.rm_name,
                call_action: element.psf_action,
                call_reason_text: element.psfr_name,
                call_remark: element.psf_remark,
                call_rating: rdata.psf_info.psfm_sa_rating,
                call_disabled: 0,
                show_reason:
                  element.psf_response == "4" || element.psf_response == "5"
                    ? true
                    : false,
                show_rating: element.psf_response == "1" ? true : false,
                show_action: element.psf_response == "5" ? true : false,
                us_firstname: element.us_firstname,
                call_transfer_to: "0",
                cus_name: rdata.psf_info.cus_name,
                psfm_job_no: rdata.psf_info.psfm_job_no,
              };
              this.oldCallData.push(callItemData);
            }
          });
          if (this.oldCallData) {

            this.openCallHistory();
            // this.dialogService
            //   .open(PsfCallHistoryComponent, {
            //     context: {
            //       psf_call_history: this.oldCallData,
            //     },
            //     closeOnBackdropClick: false,
            //   })
            //   .onClose.subscribe((data) => {
            //     this.oldCallData = [];
            //   });
          }
        } else {

        }
      });
  }

  openCallHistory() {
    this.psfcallhistory.open();
}

psfcallhistoryModal() {
    this.psfcallhistory.close();
}
     
}
