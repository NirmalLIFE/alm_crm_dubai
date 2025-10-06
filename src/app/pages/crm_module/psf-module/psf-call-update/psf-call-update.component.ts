import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-psf-call-update',
    templateUrl: './psf-call-update.component.html',
    styleUrls: ['./psf-call-update.component.css'],
})
export class PsfCallUpdateComponent implements OnInit {
    @Input() callid: any;
    @Output() modalEvent = new EventEmitter<boolean>();

  action: { name: string; value: any }[] = [
    { name: 'Transfer the call', value: 1 },
    { name: 'Educated & Closed', value: 2 },
    { name: 'Closed with approval', value: 3 },
    { name: 'Revisit Requested', value: 4 },
    { name: 'Apology over phone/mail', value: 5 },
  ];

  callData: any = [];
  psfResponse: any = [];
  psfReason: any = [];
  specialUsers: any = [];
  psf_details: any = {};
  userList: any = [];
  TodaysDate: any
  is_wipjobcard = false;
  isChecked = true;
  public load_flag:boolean=true;
  constructor(private userServices: StaffPostAuthService) {

    this.userServices.userList().subscribe((rData: any) => {
      if (rData.ret_data == 'success') {
        this.userList = rData.userList;
      }
    });

  }

  ngOnInit(): void {
    let date = new Date();
    this.TodaysDate = date.toLocaleDateString();
    this.userServices.get_PSFresponseMaster().subscribe((rdata: any) => {
      if (rdata.ret_data == "success") {
        this.psfResponse = rdata.response_master;
      }
    });
    this.getPsfCallList();
  }

  getPsfCallList() {
    this.userServices.get_PSFrecord_info({ psf_id: this.callid })
      .subscribe((rdata: any) => {
        if (rdata.ret_data == "success") {
          this.psf_details = rdata.psf_info;
          this.is_wipjobcard = rdata.psf_info.current_jobcard.length > 0 ? true : false;
          this.psf_details.psf_history.forEach((element: any) => {
            let callItemData = {
              call_date: element.psf_call_date,
              call_response: element.psf_response,
              call_reason: element.psf_reason,
              call_response_text: element.rm_name,
              call_action: element.psf_action,
              call_reason_text: element.psfr_name,
              call_remark: element.psf_remark,
              call_rating: this.psf_details.psfm_sa_rating,
              call_disabled: 0,
              show_reason:
                element.psf_response == "4" || element.psf_response == "5"
                  ? true
                  : false,
              show_rating: element.psf_response == "1" ? true : false,
              show_action: element.psf_response == "5" ? true : false,
              call_transfer_to: "0",
            };
            this.callData.push(callItemData);
          });
          if (this.psf_details.psfm_num_of_attempts == 0) {
            let callItemData = {
              call_date: new Date().toISOString().split('T')[0],
              call_response: null,
              call_reason: "0",
              call_action: "0",
              call_remark: "",
              call_rating: "0",
              call_disabled: 1,
              show_reason: false,
              show_rating: false,
              show_action: false,
              reason_flag: false,
              call_transfer_to: "0",
            };
            this.callData.push(callItemData);
            let callItemDataDisable = {
              call_date: "",
              call_response: "0",
              call_reason: "0",
              call_action: "0",
              call_remark: "",
              call_rating: "0",
              call_disabled: 2,
              show_reason: false,
              show_rating: false,
              show_action: false,
              reason_flag: false,
              call_transfer_to: "0",
            };
            this.callData.push(callItemDataDisable);
            this.callData.push(callItemDataDisable);
          } else if (this.psf_details.psfm_num_of_attempts == 1) {
            let callItemData = {
              call_date: new Date().toISOString().split('T')[0],
              call_response: null,
              call_reason: "0",
              call_action: "0",
              call_remark: "",
              call_rating: "0",
              call_disabled: 1,
              show_reason: false,
              show_rating: false,
              show_action: false,
              reason_flag: false,
              call_transfer_to: "0",
            };
            this.callData.push(callItemData);
            let callItemDataDisable = {
              call_date: "",
              call_response: "0",
              call_reason: "0",
              call_action: "0",
              call_remark: "",
              call_rating: "0",
              call_disabled: 2,
              show_reason: false,
              show_rating: false,
              show_action: false,
              reason_flag: false,
              call_transfer_to: "0",
            };
            this.callData.push(callItemDataDisable);
          } else if (this.psf_details.psfm_num_of_attempts == 2) {
            let callItemData = {
              call_date: new Date().toISOString().split('T')[0],
              call_response: null,
              call_reason: "0",
              call_action: "0",
              call_remark: "",
              call_rating: "0",
              call_disabled: 1,
              show_reason: false,
              show_rating: false,
              show_action: false,
              reason_flag: false,
              call_transfer_to: "0",
            };
            this.callData.push(callItemData);
          }
          this.load_flag=false;
        } else {
          this.load_flag=false;
          this.coloredToast("danger", "Records not found");
        }
      });
  }

  updateResponseChange(itemData: any, response: any) {
    if (response == 0) {
      itemData.show_reason = false;
      this.coloredToast("danger", "Please select proper response");
    } else {
      if (response > 3 && response < 6) {
        itemData.call_reason = "0";
        itemData.show_reason = true;
        let data = {
          type_id: response,
        };
        this.userServices.get_PSFreasonMaster(data).subscribe((rdata: any) => {
          if (rdata.ret_data == "success") {
            this.psfReason = rdata.reason_master;
          }
        });
      } else {
        itemData.show_reason = false;
      }
      if (response == 2 || response == 3 || response == 6) {
        itemData.reason_flag = true;
      } else {
        itemData.reason_flag = false;
      }
    }
  }
  updateReasonChange(itemData: any, response: any) {
    if (response == 44) {
      itemData.reason_flag = true;
    } else {
      itemData.reason_flag = false;
    }
  }
  updateActionChange(itemData: any, response: any) {
    if (response == 1) {
      this.userServices.getSpecialUsers().subscribe((rdata: any) => {
        if (rdata.ret_data == "success") {
          this.specialUsers = rdata.userList;
        }
      });
      itemData.reason_flag = true;
    } else {
      itemData.reason_flag = false;
    }
  }

  updatePSFCall() {
    let call_index = this.psf_details.psfm_num_of_attempts;
    let data;
    if (this.callData[call_index].call_response != "0") {
      if (this.callData[call_index].call_response == "1") {
        // if (this.callData[call_index].call_rating != '0') {
        data = {
          psf_id: this.psf_details.psfm_id,
          call_response: this.callData[call_index].call_response,
          call_rating: 5,
          call_remark: this.callData[call_index].call_remark,
          psf_call_date: this.callData[call_index].call_date,
          psf_call_type: 0,
          psfm_num_of_attempts: this.psf_details.psfm_num_of_attempts,
        };
        // } else {
        //   this.coloredToast("danger", "Error!!!", "Please mark rating from customer");
        // }
      } else if (
        this.callData[call_index].call_response == "2" ||
        this.callData[call_index].call_response == "3"
      ) {
        if (this.callData[call_index].call_remark != "") {
          data = {
            psf_id: this.psf_details.psfm_id,
            call_response: this.callData[call_index].call_response,
            call_rating: this.callData[call_index].call_response == "2" ? 4 : 3,
            call_remark: this.callData[call_index].call_remark,
            psf_call_date: this.callData[call_index].call_date,
            psf_call_type: 0,
            psfm_num_of_attempts: this.psf_details.psfm_num_of_attempts,
          };
        } else {
          this.coloredToast(
            "danger",
            "Please provide customer remark"
          );
        }
      } else if (this.callData[call_index].call_response == "4") {
        if (this.callData[call_index].call_reason != "0") {
          data = {
            psf_id: this.psf_details.psfm_id,
            call_response: this.callData[call_index].call_response,
            response_reason: this.callData[call_index].call_reason,
            call_remark: this.callData[call_index].call_remark,
            psf_call_date: this.callData[call_index].call_date,
            psf_call_type: 0,
            psfm_num_of_attempts: this.psf_details.psfm_num_of_attempts,
          };
        } else {
          this.coloredToast("danger", "Response reason is mandatory");
        }
      } else if (this.callData[call_index].call_response == "5") {
        if (this.callData[call_index].call_reason != "0") {
          if (this.callData[call_index].call_reason == "44") {
            if (this.callData[call_index].call_remark != "") {
              if (this.callData[call_index].call_action != "0") {

                if (
                  this.callData[call_index].call_action == "1" &&
                  this.callData[call_index].call_transfer_to == "0"
                ) {
                  this.coloredToast(
                    "danger",
                    "Trnsferred user is required"
                  );
                } else if (
                  this.callData[call_index].call_action == "1" &&
                  this.callData[call_index].call_transfer_to != "0"
                ) {
                  data = {
                    psf_id: this.psf_details.psfm_id,
                    call_response: this.callData[call_index].call_response,
                    response_reason: this.callData[call_index].call_reason,
                    call_remark: this.callData[call_index].call_remark,
                    psf_call_date: this.callData[call_index].call_date,
                    call_action: this.callData[call_index].call_action,
                    transfer_id: this.callData[call_index].call_transfer_to,
                    psf_call_type: 0,
                    psfm_num_of_attempts: this.psf_details.psfm_num_of_attempts,
                  };
                } else {
                  data = {
                    psf_id: this.psf_details.psfm_id,
                    call_response: this.callData[call_index].call_response,
                    response_reason: this.callData[call_index].call_reason,
                    call_remark: this.callData[call_index].call_remark,
                    call_action: this.callData[call_index].call_action,
                    psf_call_date: this.callData[call_index].call_date,
                    psf_call_type: 0,
                    psfm_num_of_attempts: this.psf_details.psfm_num_of_attempts,
                  };
                }
              } else {
                this.coloredToast(
                  "danger",
                  "Action taken is mandatory"
                );
              }
            } else {
              this.coloredToast(
                "danger",
                "Customer remark is required"
              );
            }
          } else {
            if (this.callData[call_index].call_action != "0") {
              if (
                this.callData[call_index].call_action == "1" &&
                this.callData[call_index].call_transfer_to == "0"
              ) {
                this.coloredToast(
                  "danger",
                  "Trnsferred user is required"
                );
              } else if (
                this.callData[call_index].call_action == "1" &&
                this.callData[call_index].call_transfer_to != "0"
              ) {
                data = {
                  psf_id: this.psf_details.psfm_id,
                  call_response: this.callData[call_index].call_response,
                  response_reason: this.callData[call_index].call_reason,
                  call_remark: this.callData[call_index].call_remark,
                  call_action: this.callData[call_index].call_action,
                  psf_call_date: this.callData[call_index].call_date,
                  transfer_id: this.callData[call_index].call_transfer_to,
                  psf_call_type: 0,
                  psfm_num_of_attempts: this.psf_details.psfm_num_of_attempts,
                };
              } else {
                data = {
                  psf_id: this.psf_details.psfm_id,
                  call_response: this.callData[call_index].call_response,
                  response_reason: this.callData[call_index].call_reason,
                  call_action: this.callData[call_index].call_action,
                  call_remark: this.callData[call_index].call_remark,
                  psf_call_date: this.callData[call_index].call_date,
                  psf_call_type: 0,
                  psfm_num_of_attempts: this.psf_details.psfm_num_of_attempts,
                };
              }
              // data = {
              //   'psf_id': this.psf_details.psfm_id,
              //   'call_response': this.callData[call_index].call_response,
              //   'response_reason': this.callData[call_index].call_reason,
              //   'call_remark': this.callData[call_index].call_remark,
              //   'psf_call_date': this.callData[call_index].call_date,
              //   'call_action': this.callData[call_index].call_action,
              //   'psf_call_type': 0,
              //   'psfm_num_of_attempts': this.psf_details.psfm_num_of_attempts,
              // }
            } else {
              this.coloredToast("danger", "Action taken is mandatory");
            }
          }
        } else {
          this.coloredToast("danger", "Response reason is mandatory");
        }
      } else if (this.callData[call_index].call_response == "6") {

        if (this.callData[call_index].call_remark != "") {
          data = {
            psf_id: this.psf_details.psfm_id,
            call_response: this.callData[call_index].call_response,
            call_close_status: true,
            response_reason: this.callData[call_index].call_reason,
            call_remark: this.callData[call_index].call_remark,
            psf_call_date: this.callData[call_index].call_date,
            psf_call_type: 0,
            psfm_num_of_attempts: this.psf_details.psfm_num_of_attempts,
          };
        } else {
          this.coloredToast("danger", "Remark is mandatory");
        }
      } else if (this.callData[call_index].call_response == "7") {
        // if (this.callData[call_index].call_remark != '') {
        data = {
          psf_id: this.psf_details.psfm_id,
          call_response: this.callData[call_index].call_response,
          call_close_status: false,
          response_reason: this.callData[call_index].call_reason,
          call_remark: this.callData[call_index].call_remark,
          psf_call_date: this.callData[call_index].call_date,
          psf_call_type: 0,
          psfm_num_of_attempts: this.psf_details.psfm_num_of_attempts,
        };
        // } else {
        //   this.coloredToast("danger", "Error!!!", "Remark is mandatory");
        // }
      } else if (this.callData[call_index].call_response == "8") {
        if (this.callData[call_index].call_remark != "") {
          data = {
            psf_id: this.psf_details.psfm_id,
            call_response: this.callData[call_index].call_response,
            call_close_status: this.callData[call_index].call_close_status
              ? true
              : false,
            response_reason: this.callData[call_index].call_reason,
            call_remark: this.callData[call_index].call_remark,
            psf_call_date: this.callData[call_index].call_date,
            psf_call_type: 0,
            psfm_num_of_attempts: this.psf_details.psfm_num_of_attempts,
          };
        } else {
          this.coloredToast("danger", "Remark is mandatory");
        }
      }
      this.userServices.saveCallResponse(data).subscribe((rdata: any) => {
        if (rdata.ret_data == "success") {
          this.coloredToast("success", "Call remark saved successfully");
          this.modalEvent.emit(true);
        }
      });
    } else if (this.is_wipjobcard && this.isChecked) {
      data = {
        psf_id: this.psf_details.psfm_id,
        call_response: this.callData[call_index].call_response,
        call_close_status: true,
        response_reason: this.callData[call_index].call_reason,
        call_remark: this.callData[call_index].call_remark,
        psf_call_date: this.callData[call_index].call_date,
        psf_call_type: 0,
        psfm_num_of_attempts: this.psf_details.psfm_num_of_attempts,
        psf_is_wipjobcard: true,
      };

      this.userServices.saveCallResponse(data).subscribe((rdata: any) => {
        if (rdata.ret_data == "success") {
          this.coloredToast("success", "Call remark saved successfully");
        }
      });
    } else {
      this.coloredToast("danger", "Response is mandatory");
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
