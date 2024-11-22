import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';

@Component({
    selector: 'app-crepsfupdate',
    templateUrl: './crepsfupdate.component.html',
    styleUrls: ['./crepsfupdate.component.css'],
})
export class CrepsfupdateComponent implements OnInit {
    psf_details: any = {};
    psfResponse: any = [];
    callData: any = [];
    oldCallData: any = [];
    psf_master_id: any;
    is_wipjobcard = false;
    psfReason: any = [];
    cre_questions: any = [];
    
    @ViewChild('psfcallhistory') psfcallhistory: any;

    rating: { value: any }[] = [{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5 }];
    action: { name: string; value: any }[] = [
        { name: 'Transfer the call', value: 1 },
        { name: 'Educated & Closed', value: 2 },
        { name: 'Closed with approval', value: 3 },
        { name: 'Revisit Requested', value: 4 },
        { name: 'Apology over phone/mail', value:5 },
    ];
    response: { name: string; value: any }[] = [
        { name: 'Answered', value: 1 },
        { name: 'Not Answered', value: 2 },
    ];

    constructor(private router: Router, 
      private activerouter: ActivatedRoute, 
      private userServices: StaffPostAuthService,
       private route: ActivatedRoute,
       public storeData: Store<any>,) {
        this.route.paramMap.subscribe((params) => {
            this.psf_master_id = params.get('id');
        });
    }

    ngOnInit(): void {
        this.userServices.get_PSFresponseMaster().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.psfResponse = rdata.response_master;
            }
        });
        this.getPsfCallList();
    }

    getPsfCallList() {
        this.userServices.get_CREPSFrecord_info({ 'psf_id': atob(this.psf_master_id) }).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
              this.callData = [];
              this.psf_details = rdata.psf_info;
              this.is_wipjobcard=rdata.psf_info.current_jobcard.length>0?true:false;
              this.psf_details.psf_history.forEach((element :any) => {
                let callItemData = {
                  'call_date': element.psf_call_date,
                  'call_response': element.psf_response,
                  'call_reason': element.psf_reason,
                  'call_response_text': element.rm_name,
                  'call_action': element.psf_action,
                  'call_reason_text': element.psfr_name,
                  'call_remark': element.psf_remark,
                  'call_rating': this.psf_details.psfm_sa_rating,
                  'call_disabled': 0,
                  'show_reason': element.psf_response == '4' || element.psf_response == '5' ? true : false,
                  'show_rating': element.psf_response == '1' ? true : false,
                  'show_action': element.psf_response == '5' ? true : false,
                  'us_firstname': element.us_firstname,
                  'call_transfer_to': '0',            
                  'cus_name':rdata.psf_info.cus_name,
                  'psfm_job_no':rdata.psf_info.psfm_job_no,
                }
                if (element.psf_user_id == '19') {
                  this.callData.push(callItemData);
      
                } else {
                  this.oldCallData.push(callItemData);
                }
      
              });
              if (this.psf_details.cre_attempts == 0) {
                let callItemData = {
                  'call_date': new Date().toISOString().split('T')[0],
                  'call_response': '0',
                  'call_reason': '0',
                  'call_action': '0',
                  'call_remark': "",
                  'call_rating': '0',
                  'call_disabled': 1,
                  'show_reason': false,
                  'show_rating': false,
                  'show_action': false,
                  'reason_flag': false,
                  'call_transfer_to': '0',
                  'cre_questions': [],
                }
                this.callData.push(callItemData);
                let callItemDataDisable = {
                  'call_date': '',
                  'call_response': '0',
                  'call_reason': '0',
                  'call_action': '0',
                  'call_remark': "",
                  'call_rating': '0',
                  'call_disabled': 2,
                  'show_reason': false,
                  'show_rating': false,
                  'show_action': false,
                  'reason_flag': false,
                  'call_transfer_to': '0',
                  'cre_questions': [],
                }
                this.callData.push(callItemDataDisable);
                this.callData.push(callItemDataDisable);
              } else if (this.psf_details.cre_attempts == 1) {
                let callItemData = {
                  'call_date': new Date().toISOString().split('T')[0],
                  'call_response': '0',
                  'call_reason': '0',
                  'call_action': '0',
                  'call_remark': "",
                  'call_rating': '0',
                  'call_disabled': 1,
                  'show_reason': false,
                  'show_rating': false,
                  'show_action': false,
                  'reason_flag': false,
                  'call_transfer_to': '0',
                  'cre_questions': [],
                }
                this.callData.push(callItemData);
                let callItemDataDisable = {
                  'call_date': '',
                  'call_response': '0',
                  'call_reason': '0',
                  'call_action': '0',
                  'call_remark': "",
                  'call_rating': '0',
                  'call_disabled': 2,
                  'show_reason': false,
                  'show_rating': false,
                  'show_action': false,
                  'reason_flag': false,
                  'call_transfer_to': '0',
                  'cre_questions': [],
                }
                this.callData.push(callItemDataDisable);
              } else if (this.psf_details.cre_attempts == 2) {
                let callItemData = {
                  'call_date': new Date().toISOString().split('T')[0],
                  'call_response': '0',
                  'call_reason': '0',
                  'call_action': '0',
                  'call_remark': "",
                  'call_rating': '0',
                  'call_disabled': 1,
                  'show_reason': false,
                  'show_rating': false,
                  'show_action': false,
                  'reason_flag': false,
                  'call_transfer_to': '0',
                  'cre_questions': [],
                }
                this.callData.push(callItemData);
      
              }
            } else {
              this.coloredToast("danger", "Records not found");
            }
        });
    }

    updateResponseChange(itemData : any, response : any) {
        if (response == 0) {
            itemData.call_reason = '0';
            itemData.show_reason = false;
            this.psfReason = [];
            this.coloredToast("danger", "Please select proper response");
        } else if (response == 1) {
            itemData.call_reason = '0';
            itemData.show_reason = false;
            this.psfReason = [];
            this.userServices.get_CREQuestions().subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    this.cre_questions = rdata.qlist;
                    this.cre_questions.forEach((element : any) => {
                        element.selected_option = '';
                    });
                    itemData.cre_questions = this.cre_questions;
                }
            });
        } else if (response == 2) {
            itemData.call_reason = '0';
            itemData.show_reason = true;
            let data = {
                type_id: 4,
            };
            this.userServices.get_PSFreasonMaster(data).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    this.psfReason = rdata.reason_master;
                }
            });
        }
    }

    updateReasonChange(itemData :any, response:any) {
      if (response == 44) {
        itemData.reason_flag = true;
      } else {
        itemData.reason_flag = false;
      }
    }

    updateCallRecord(attempts :any) {
      let call_index = this.psf_details.cre_attempts;
      let data :any;
      let call_status = 0;
      if (this.callData[call_index].call_response != '0') {
        if (this.callData[call_index].call_response == '1') {
          var resp_flag = true;
          var total_point = 100 * (this.callData[call_index].cre_questions.length);
          var current_point = 0;
          this.callData[call_index].cre_questions.forEach((element :any) => {
            if (element.selected_option ==='') {
              resp_flag = false;
              return;
            } else if (element.cqm_id == '5') {
              if (element.selected_option == '10') {
                call_status = 1;
              } else if (element.selected_option == '9') {
                call_status = 2;
              } else if (element.selected_option == '8') {
                call_status = 3;
              } else {
                call_status = 5;
  
              }
            }
            // else {
            //   if (element.selected_option == '0') {
            //     current_point = current_point + 25;
            //   } else if (element.selected_option == '1') {
            //     current_point = current_point + 50;
            //   } else {
            //     current_point = current_point + 100;
            //   }
            // }
          });
          if (resp_flag) {
            if (call_status == 1) {
              data = {
                'psf_id': this.psf_details.psfm_id,
                'call_response': 1,
                //'call_rating': this.callData[call_index].call_response == '2' ? 4 : 3,
                'call_remark': this.callData[call_index].call_remark,
                'psf_call_date': this.callData[call_index].call_date,
                'psf_call_type': 0,
                'psfm_num_of_attempts': this.psf_details.psfm_num_of_attempts,
                'qdata': this.callData[call_index].cre_questions,
                'attempts':attempts
              }
            } else {
              if (this.callData[call_index].call_remark != '') {
                //if (percent_point >= 75) {
                data = {
                  'psf_id': this.psf_details.psfm_id,
                  'call_response': call_status,
                  //'call_rating': this.callData[call_index].call_response == '2' ? 4 : 3,
                  'call_remark': this.callData[call_index].call_remark,
                  'psf_call_date': this.callData[call_index].call_date,
                  'psf_call_type': 0,
                  'psfm_num_of_attempts': this.psf_details.psfm_num_of_attempts,
                  'qdata': this.callData[call_index].cre_questions,
                  'attempts':attempts
                }
                // } else if (percent_point >= 50) {
                //   data = {
                //     'psf_id': this.psf_details.psfm_id,
                //     'call_response': 3,
                //     //'call_rating': this.callData[call_index].call_response == '2' ? 4 : 3,
                //     'call_remark': this.callData[call_index].call_remark,
                //     'psf_call_date': this.callData[call_index].call_date,
                //     'psf_call_type': 0,
                //     'psfm_num_of_attempts': this.psf_details.psfm_num_of_attempts,
                //     'qdata': this.callData[call_index].cre_questions,
                //   }
                // } else {
                //   data = {
                //     'psf_id': this.psf_details.psfm_id,
                //     'call_response': 5,
                //     //'call_rating': this.callData[call_index].call_response == '2' ? 4 : 3,
                //     'call_remark': this.callData[call_index].call_remark,
                //     'psf_call_date': this.callData[call_index].call_date,
                //     'psf_call_type': 0,
                //     'psfm_num_of_attempts': this.psf_details.psfm_num_of_attempts,
                //     'qdata': this.callData[call_index].cre_questions,
                //   }
                // }
              } else {
              this.coloredToast("danger", "Response reason is mandatory");
              }
  
            }
          } else {
          this.coloredToast("danger", "Response for each question is mandatory");
          }
        } else if (this.callData[call_index].call_response == '2') {
          if (this.callData[call_index].call_reason != '0') {
            data = {
              'psf_id': this.psf_details.psfm_id,
              'call_response': 4,
              'response_reason': this.callData[call_index].call_reason,
              'call_remark': this.callData[call_index].call_remark,
              'psf_call_date': this.callData[call_index].call_date,
              'psf_call_type': 0,
              'psfm_num_of_attempts': this.psf_details.psfm_num_of_attempts,
              'qdata': this.callData[call_index].cre_questions,
              'attempts':attempts
            }
          } else {
          this.coloredToast("danger", "Response reason is mandatory");
          }
        }
        this.userServices.saveCRECallResponse(data).subscribe((rdata: any) => {
          if (rdata.ret_data == 'success') {
          this.coloredToast("success","Call details updated successfully");
            if (data.call_response != 4) this.router.navigateByUrl('cre-psf');
            else this.getPsfCallList();
  
  
          }
        });
      } else {
      this.coloredToast("danger", "Response is mandatory");
      }
    }

    openCallHistory() { 
        // this.dialogService.open(PsfCallHistoryComponent, {
        //   context: {
        //     psf_call_history: this.oldCallData,
        //   },
        //   closeOnBackdropClick: false,
        // })
        this.psfcallhistory.open();
    }

    psfcallhistoryModal(){
      this.psfcallhistory.close();
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
