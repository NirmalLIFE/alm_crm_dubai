import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';

@Component({
  selector: 'app-user-report-cre',
  templateUrl: './user-report-cre.component.html',
  styleUrls: ['./user-report-cre.component.css']
})
export class UserReportCreComponent implements OnInit {
  public search: string = '';
  public load_flag: boolean = true;
  psf_user_id: any = 0;
  dateRange: any;
  startDate: any;
  endDate: any;
  usertype: any;
  searchTerm: any;
  userpsf_details: any;
  temp_userpsf_details: any;
  oldCallData: any = [];
  callData: any = [];

  cols = [
    { field: 'customer_name', title: 'Customer' },
    { field: 'phone', title: 'Phone Number' },
    { field: 'psfm_job_no', title: 'Job No' },
    { field: 'psfm_reg_no', title: 'Reg No' },
    { field: 'psfm_invoice_date', title: 'Inv. Date' },
    { field: 'psfm_psf_assign_date', title: 'PSF Assign Date' },
    { field: 'attempt_count', title: 'Attempts' },
    { field: 'lastsa_response', title: 'Last SA Response' },
    { field: 'RECEPTIONIST', title: 'Assigned CRE' },
    { field: 'lastcre_response', title: 'Last CRE Response' },
    { field: 'psfm_sa_rating', title: 'SA Rating' },
    { field: 'psfm_cre_rating', title: 'CRE Rating' },
    { field: 'sa_status', title: 'Current Status SA' },
    { field: 'cre_status', title: 'Current Status CRE' },
    { field: 'Action', title: 'Action' },
];

@ViewChild('psfcallhistory') psfcallhistory: any;

  constructor(private activeRouter: ActivatedRoute, private userServices: StaffPostAuthService) {}

    ngOnInit(): void {
      this.psf_user_id = this.activeRouter.snapshot.queryParamMap.get('id');
     // this.max = this.dateService.addDay(this.dateService.today(), 0);
      this.startDate = this.activeRouter.snapshot.queryParamMap.get('sDate');
      this.endDate = this.activeRouter.snapshot.queryParamMap.get('eDate');
      this.usertype = this.activeRouter.snapshot.queryParamMap.get('usertype');
      this.getUserPSFcallReport();
    }

    getUserPSFcallReport() {
      let data = {
        user_id: this.psf_user_id,
  
  
        startDate: this.startDate,
        endDate: this.endDate,
        usertype: this.usertype
      };
  
  
      this.userServices.getPSFUserCallsaReportData(data).subscribe((rData: any) => {
        if (rData.ret_data == "success") {
  
  
  
          this.userpsf_details = rData.user_psfdetails;
  
  
          this.userpsf_details.expired = 0;
          this.userpsf_details.ext_satisfied = 0;
          this.userpsf_details.fairlyHappy_psf_calls = 0;
          this.userpsf_details.happy_psf_calls = 0;
          this.userpsf_details.dissatisfied_psf_calls = 0;
          this.userpsf_details.pending_psf_calls = 0;
          this.userpsf_details.expired_psf_calls = 0;
          this.userpsf_details.expired_psf_calls_non_attempt = 0;
          this.userpsf_details.not_expired_pending = 0;
          this.userpsf_details.user_psf_calls.forEach((element:any) => {
            element.expired = false;
            element.ext_satisfied = false;
            element.fairlyHappy_psf_calls = false;
            element.happy_psf_calls = false;
            element.dis_satisfied = false;
            element.expired_psf_calls = true;
            element.not_expired_pending = true;
            let Lastsastatustracker = element.psf_calls.filter((pst_sourceid:any) => pst_sourceid.pst_sourceid != '19');
            if (atob(atob(this.usertype)) != '9') {
              element.attempt_count = Lastsastatustracker.filter(( pst_response :any) =>pst_response.pst_response != '0').length;
            }
  
            //let attempts = Lastsastatustracker.filter(({ pst_response }) => pst_response != '0');
            //element.sa_attempts=attempts.length;
            if (Lastsastatustracker && Lastsastatustracker.length > 0 && Lastsastatustracker[0].rm_name) {
  
  
              element.lastsa_response = Lastsastatustracker[0].rm_name;
              if (Lastsastatustracker[0].rm_id == '1') {
                element.sacolor = "#006400";
              } else if (Lastsastatustracker[0].rm_id == '2') {
                element.sacolor = "#4C9A2A";
              } else if (Lastsastatustracker[0].rm_id == '3') {
                element.sacolor = "#68BB59";
              } else if (Lastsastatustracker[0].rm_id == '4') {
                element.sacolor = "#FFA500";
              } else if (Lastsastatustracker[0].rm_id == '5') {
                element.sacolor = "#FF0000";
              } else {
                element.sacolor = "#0c42f5";
              }
              if (Lastsastatustracker[0].pst_psf_status == '0') {
                element.sa_status = "OPEN";
                element.sastatuscolor = "#6c757d";
  
              } else if (Lastsastatustracker[0].pst_psf_status == '1') {
                element.sa_status = "PENDING";
                element.sastatuscolor = "#ffc107";
  
              } else if (Lastsastatustracker[0].pst_psf_status == '3') {
                element.sa_status = "TRANSFERRED";
                element.sastatuscolor = "#6b51d5";
              } else if (Lastsastatustracker[0].pst_psf_status == '15') {
                element.sa_status = "REVISIT";
                element.sastatuscolor = "#194a7c";
              } else if (Lastsastatustracker[0].pst_psf_status == '18' && Lastsastatustracker[0].pst_response == '6') {
                element.sa_status = "CLOSED";
                element.sastatuscolor = "#9a7c1f";
              } else if (Lastsastatustracker[0].pst_response == '4') {
                element.sa_status = "UNREACHABLE";
                element.sastatuscolor = "#1eadc3";
              }
              else if (Lastsastatustracker[0].pst_psf_status == '2' || Lastsastatustracker[0].pst_psf_status == '7' || Lastsastatustracker[0].pst_psf_status == '12' || Lastsastatustracker[0].pst_psf_status == '13' || Lastsastatustracker[0].pst_psf_status == '14' || Lastsastatustracker[0].pst_psf_status == '16') {
                element.sa_status = "COMPLETED";
                element.sastatuscolor = "#28a745";
  
              }
            } else if (Lastsastatustracker && Lastsastatustracker.length > 0 && Lastsastatustracker[0].pst_response == '0' && Lastsastatustracker[0].pst_psf_status == "4") {
              element.lastsa_response = "CLOSED INCOMPLETE";
              element.sacolor = "#ff0000";
              element.sa_status = "CLOSED";
              element.sastatuscolor = "#9a7c1f";
            } else {
              element.lastsa_response = "PENDING";
              element.sacolor = "#ff0000";
              element.sa_status = "PENDING";
              element.sastatuscolor = "#ffc107";
            }
            let Lastcrestatustracker = element.psf_calls.filter((pst_sourceid :any) => pst_sourceid.pst_sourceid == '19');
            //let cre_attempts = Lastcrestatustracker.filter(({ pst_response }) => pst_response != '0');
            //element.cre_attempts=cre_attempts.length;
            if (atob(atob(this.usertype)) == '9') element.attempt_count = element.psf_calls.filter((pst_sourceid:any, pst_response:any ) => pst_sourceid.pst_sourceid == '19' && pst_response.pst_response != '0').length;
            if (Lastcrestatustracker && Lastcrestatustracker.length > 0 && Lastcrestatustracker[0].rm_name) {
             
              element.lastcre_response = Lastcrestatustracker[0].rm_name;
              if (Lastcrestatustracker[0].rm_id == '1') {
                element.crecolor = "#006400";
              } else if (Lastcrestatustracker[0].rm_id == '2') {
                element.crecolor = "#4C9A2A";
              } else if (Lastcrestatustracker[0].rm_id == '3') {
                element.crecolor = "#68BB59";
              } else if (Lastcrestatustracker[0].rm_id == '4') {
                element.crecolor = "#FFA500";
              } else if (Lastcrestatustracker[0].rm_id == '5') {
                element.crecolor = "#FF0000";
              } else {
                element.crecolor = "#0c42f5";
              }
              if (Lastcrestatustracker[0].pst_psf_status == '2') {
                element.cre_status = "OPEN";
                element.crestatuscolor = "#6c757d";
  
              } else if (Lastcrestatustracker[0].pst_psf_status == '15') {
                element.cre_status = "REVISIT";
                element.crestatuscolor = "#194a7c";
              } else if (Lastcrestatustracker[0].pst_psf_status == '18' && Lastcrestatustracker[0].pst_response == '6') {
                element.cre_status = "CLOSED";
                element.crestatuscolor = "#9a7c1f";
              } else if (Lastcrestatustracker[0].pst_response == '4') {
                element.cre_status = "UNREACHABLE";
                element.crestatuscolor = "#1eadc3";
              }
              else if (Lastcrestatustracker[0].pst_psf_status == '7' || Lastcrestatustracker[0].pst_psf_status == '12' || Lastcrestatustracker[0].pst_psf_status == '13' || Lastcrestatustracker[0].pst_psf_status == '14' || Lastcrestatustracker[0].pst_psf_status == '17') {
                element.cre_status = "COMPLETED";
                element.crestatuscolor = "#28a745";
  
              } else if (Lastcrestatustracker[0].pst_psf_status == '6') {
                element.cre_status = "PENDING";
                element.crestatuscolor = "#ffc107";
  
              }
            } else {
              element.lastcre_response = "PENDING";
              element.crecolor = "#ff0000";
              element.cre_status = "PENDING";
              element.crestatuscolor = "#ffc107";
            }
            //   if (parseInt(element.psfm_num_of_attempts) > 0) {
            //   if (element.psfm_lastresponse == '4' || element.psfm_lastresponse == '10') {
            //     element.expired=true;
            //     this.userpsf_details.expired =  this.userpsf_details.expired + 1;
            //   }
            //   if ((element.psfm_lastresponse == '2' || element.psfm_lastresponse == '7') && element.psf_calls[0].pst_response == '1') {
            //     element.ext_satisfied=true;
            //     this.userpsf_details.ext_satisfied = this.userpsf_details.ext_satisfied + 1;
            //   }
            //   if ((element.psfm_lastresponse == '2' || element.psfm_lastresponse == '7') && element.psf_calls[0].pst_response == '2') {
            //     element.fairlyHappy_psf_calls=true;
            //    this.userpsf_details.fairlyHappy_psf_calls = this.userpsf_details.fairlyHappy_psf_calls + 1;
            //   }
            //   if ((element.psfm_lastresponse == '2' || element.psfm_lastresponse == '7') &&  element.psf_calls[0].psfm_lastresponse == '3') {
            //     element.happy_psf_calls=true;
            //     this.userpsf_details.happy_psf_calls = this.userpsf_details.happy_psf_calls + 1;
            //   }
            //   if(element.psf_calls.length>0){
            //     if (element.psf_calls[0].pst_response == '5') {
            //       element.dis_satisfied = true;
            //       this.userpsf_details.dissatisfied_psf_calls = this.userpsf_details.dissatisfied_psf_calls + 1;
            //     }
            //   }
            // } else if (parseInt(element.psfm_num_of_attempts) == 0) {
            //   this.userpsf_details.pending_psf_calls = this.userpsf_details.pending_psf_calls + 1;
            //   if(element.psf_calls.length>0){
            //     if (element.psf_calls[0].pst_psf_status == '4') {
            //       element.expired_psf_calls = true;
            //       this.userpsf_details.expired_psf_calls = this.userpsf_details.expired_psf_calls + 1;
            //       this.userpsf_details.expired_psf_calls_non_attempt = this.userpsf_details.expired_psf_calls_non_attempt + 1;
            //     }
            //   }
            //    else {
            //     element.not_expired_pending = true;
            //     this.userpsf_details.not_expired_pending = this.userpsf_details.not_expired_pending + 1;
            //   }
            // }
          });
          this.temp_userpsf_details = this.userpsf_details;
          this.load_flag=false;
        }else{
          
        }
      });
    }
    getPsfCallList(psf_master_id:any) {
      this.userServices.get_PSFrecord_info({ 'psf_id': psf_master_id }).subscribe((rdata: any) => {
        if (rdata.ret_data == 'success') {
          this.oldCallData = [];
          rdata.psf_info.psf_history.forEach((element:any) => {
            let callItemData = {
              'call_date': element.psf_call_date,
              'call_response': element.psf_response,
              'call_reason': element.psf_reason,
              'call_response_text': element.rm_name,
              'call_action': element.psf_action,
              'call_reason_text': element.psfr_name,
              'call_remark': element.psf_remark,
              'call_rating': rdata.psf_info.psfm_sa_rating,
              'call_disabled': 0,
              'show_reason': element.psf_response == '4' || element.psf_response == '5' ? true : false,
              'show_rating': element.psf_response == '1' ? true : false,
              'show_action': element.psf_response == '5' ? true : false,
              'us_firstname': element.us_firstname,
              'call_transfer_to': '0',
              'cus_name': rdata.psf_info.cus_name,
              'psfm_job_no': rdata.psf_info.psfm_job_no,
            }
            this.oldCallData.push(callItemData);
  
  
          });
          if (this.oldCallData) {
            this.openCallHistory();
            // this.dialogService.open(PsfCallHistoryComponent, {
            //   context: {
            //     psf_call_history: this.oldCallData,
            //   },
            //   closeOnBackdropClick: false,
            // }).onClose.subscribe((data) => {
            //   this.oldCallData = [];
  
            // });
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

}
