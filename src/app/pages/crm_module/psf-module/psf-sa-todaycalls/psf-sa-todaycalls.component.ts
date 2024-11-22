import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';

@Component({
    selector: 'app-psf-sa-todaycalls',
    templateUrl: './psf-sa-todaycalls.component.html',
    styleUrls: ['./psf-sa-todaycalls.component.css'],
})
export class PsfSaTodaycallsComponent implements OnInit {
    psf_calls = [];
    temp_psf_calls = [];
    userdetails = [];
    max: Date = new Date();
    totalCalls: any = 0;
    attemptedCalls: any = 0;
    openCalls: any = 0;
    Completed_calls: any = 0;
    expiringCalls: any = 0;
    status = '-1';
    selecteddate: any = new Date();
    expiredCalls: any = 0;
    completedCalls: any = 0;
    startdate: any;
    keydata: any;
    ext_num: any;
    psf_user_id: any = 0;
    us_role_id: any = 0;
    startDate: any;
    endDate: any;
    oldCallData: any = [];
    filteredRows = [];
    searchvalue: any;
    public search: string = '';

    public cols = [
        { field: 'customer_name', title: 'Customer' },
        { field: 'phone', title: 'Number' },
        { field: 'psfm_job_no', title: 'Job No' },
        { field: 'psfm_reg_no', title: 'Reg No' },
        { field: 'psfm_invoice_date', title: 'Invoice date' },
        { field: 'psfm_psf_assign_date', title: 'PSF Assign Date' },
        { field: 'attempt_count', title: 'Attempts' },
        { field: 'lastsa_response', title: 'Latest SA Response' },
        { field: 'psfm_sa_rating', title: 'Rating' },
        { field: 'sa_status', title: 'Current SA Status' },
        { field: 'Action', title: 'Actions' },
    ];

    @ViewChild('psfcallhistory') psfcallhistory: any;
    
    constructor(private userServices: StaffPostAuthService,
        public datepipe: DatePipe,
        private activeRouter: ActivatedRoute) {

    this.startdate = this.datepipe.transform(new Date(), "yyyy-MM-dd");
    this.psf_user_id = this.activeRouter.snapshot.queryParamMap.get("id");
    this.us_role_id = this.activeRouter.snapshot.queryParamMap.get("usertype");
    this.startDate = this.activeRouter.snapshot.queryParamMap.get("sDate");
    this.endDate = this.activeRouter.snapshot.queryParamMap.get("eDate");
    }

    ngOnInit(): void {
        this.getPSFCallsList(this.status);
    }

    getPSFCallsList(status:any) {
        this.psf_calls = [];
        this.temp_psf_calls = [];
        this.userdetails = [];
        let data = {
          date: this.startdate,
          id: this.psf_user_id,
          roleid: this.us_role_id,
          status: this.status,
        };
        this.userServices.getPSFTodayCallsData(data).subscribe((rdata: any) => {
          if (rdata.ret_data == "success") {
            this.psf_calls = rdata.usercalls;
            this.temp_psf_calls = rdata.usercalls;
            this.userdetails = rdata.userdetails;
    
            this.expiredCalls = rdata.user_closed_count;
            this.completedCalls = rdata.user_success_count;
            this.totalCalls = this.psf_calls.length;
            // this.openCalls = this.psf_calls.filter(
            //   (data) => data.psfm_num_of_attempts == 0
            // ).length;
            // this.attemptedCalls = this.psf_calls.filter(
            //   (data) => data.psfm_num_of_attempts > 0
            // ).length;
            let new_date = new Date();
            this.expiringCalls = this.psf_calls.filter(
              (data:any) =>
                Math.floor(
                  (Date.UTC(
                    new_date.getFullYear(),
                    new_date.getMonth(),
                    new_date.getDate()
                  ) -
                    Date.UTC(
                      new Date(data.psfm_psf_assign_date).getFullYear(),
                      new Date(data.psfm_psf_assign_date).getMonth(),
                      new Date(data.psfm_psf_assign_date).getDate()
                    )) /
                    (1000 * 60 * 60 * 24)
                ) >= 5
            ).length;
            this.psf_calls.forEach((element:any) => {
              if (
                Math.floor(
                  (Date.UTC(
                    new_date.getFullYear(),
                    new_date.getMonth(),
                    new_date.getDate()
                  ) -
                    Date.UTC(
                      new Date(element.psfm_psf_assign_date).getFullYear(),
                      new Date(element.psfm_psf_assign_date).getMonth(),
                      new Date(element.psfm_psf_assign_date).getDate()
                    )) /
                    (1000 * 60 * 60 * 24)
                ) >= 5
              ) {
                element.psf_expiry = true;
              } else {
                element.psf_expiry = false;
              }
            });
            this.psf_calls.forEach((element:any) => {
              if (element.psf_calls && element.psf_calls.length > 0) {
                element.attempt_count = element.psf_calls.filter(
                  (pst_response:any ) => pst_response.pst_response != "0"
                ).length;
                if (
                  element.psf_calls &&
                  element.psf_calls.length > 0 &&
                  element.psf_calls[0].rm_name
                ) {
                  element.lastsa_response = element.psf_calls[0].rm_name;
                  if (element.psf_calls[0].pst_psf_status == "0") {
                    element.sa_status = "OPEN";
                    element.sastatuscolor = "#6c757d";
                  } else if (element.psf_calls[0].pst_psf_status == "1") {
                    element.sa_status = "PENDING";
                    element.sastatuscolor = "#ffc107";
                  } else if (element.psf_calls[0].pst_psf_status == "3") {
                    element.sa_status = "TRANSFERRED";
                    element.sastatuscolor = "#6b51d5";
                  } else if (element.psf_calls[0].pst_psf_status == "15") {
                    element.sa_status = "REVISIT";
                    element.sastatuscolor = "#194a7c";
                  } else if (
                    element.psf_calls[0].pst_psf_status == "18" &&
                    element.psf_calls[0].pst_response == "6"
                  ) {
                    element.sa_status = "CLOSED";
                    element.sastatuscolor = "#9a7c1f";
                  } else if (element.psf_calls[0].pst_response == "4") {
                    element.sa_status = "UNREACHABLE";
                    element.sastatuscolor = "#1eadc3";
                  } else if (
                    element.psf_calls[0].pst_psf_status == "2" ||
                    element.psf_calls[0].pst_psf_status == "7" ||
                    element.psf_calls[0].pst_psf_status == "12" ||
                    element.psf_calls[0].pst_psf_status == "13" ||
                    element.psf_calls[0].pst_psf_status == "16" ||
                    (element.psf_calls[0].pst_psf_status == "14" &&
                      element.psf_calls[0].pst_response == "8")
                  ) {
                    element.sa_status = "COMPLETED";
                    element.sastatuscolor = "#28a745";
                  }
                } else if (
                  element.psf_calls &&
                  element.psf_calls.length > 0 &&
                  element.psf_calls[0].pst_response == "0" &&
                  element.psf_calls[0].pst_psf_status == "4"
                ) {
                  element.lastsa_response = "CLOSED INCOMPLETE";
                  element.sacolor = "#ff0000";
                  element.sa_status = "CLOSED";
                  element.sastatuscolor = "#9a7c1f";
                } else if (
                  element.psf_calls &&
                  element.psf_calls.length > 0 &&
                  element.psf_calls[0].pst_response == "0" &&
                  element.psf_calls[0].pst_psf_status == "19"
                ) {
                  element.lastsa_response = "PENDING";
                  element.sa_status = "WIP";
                  element.sastatuscolor = "#2ad25c";
                } else {
                  element.lastsa_response = "Not Yet Attempted";
                  element.sa_status = "OPEN";
                  element.sastatuscolor = "#6c757d";
                }
              } else {
                element.attempt_count = 0;
                element.lastsa_response = "Not Yet Attempted";
                element.sa_status = "OPEN";
                element.sastatuscolor = "#6c757d";
              }
            });
    
            this.openCalls = this.psf_calls.filter(
              (data:any) => data.attempt_count == 0
            ).length;
            this.attemptedCalls = this.psf_calls.filter(
              (data:any) => data.attempt_count > 0
            ).length;
            this.Completed_calls = this.psf_calls.filter(
              (data:any) => data.sa_status == "COMPLETED"
            ).length;
          }
        });
    }

    getPsfCallList(psf_master_id: any) {
        this.userServices.get_PSFrecord_info({ psf_id: psf_master_id }).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.oldCallData = [];
                rdata.psf_info.psf_history.forEach((element: any) => {
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
                            show_reason: element.psf_response == '4' || element.psf_response == '5' ? true : false,
                            show_rating: element.psf_response == '1' ? true : false,
                            show_action: element.psf_response == '5' ? true : false,
                            us_firstname: element.us_firstname,
                            call_transfer_to: '0',
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
                //this.showToast("danger", "Error!!!", "Records not found");
            }
        });
    }

    openCallHistory() {
        this.psfcallhistory.open();
    }

    psfcallhistoryModal() {
        this.psfcallhistory.close();
    }


      customSearchFilter() {
        // if (this.assigndate === '' || this.assigndate === null) {
        //     this.psf_calls = this.temp_psf_calls;
        //     this.filterCriteria = '';
        //     return;
        // }
        // let dt = this.psf_calls;
        // if (this.assigndate != '' || this.assigndate != null) {
        //     dt = dt.filter((d) => d.psfm_psf_assign_date === this.assigndate);
        //     this.filterCriteria = 'Assign Date: ' + this.assigndate + ' ,';
        // }
        // this.psf_calls = dt;
        // this.filterCriteria = this.filterCriteria.slice(0, -1);
    }

    // onSearch(searchValue: string) {
    //     console.log('searchvaluuuuuuuuuuuuuuuuue-->', searchValue);

    //     this.filteredRows = this.psf_calls.filter((row) => {
    //         // Convert each row's values to lowercase for case-insensitive search
    //         return Object.values(row).some((val) => (val ? val.toString().toLowerCase().includes(searchValue.toLowerCase()) : false));
    //     });
    // }
}
