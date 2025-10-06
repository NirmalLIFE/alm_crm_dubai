import { Component, OnInit } from '@angular/core';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-job-status-master',
  templateUrl: './job-status-master.component.html',
  styleUrls: ['./job-status-master.component.css']
})
export class JobStatusMasterComponent implements OnInit {

  public load_flag = true;
  public master_status = null;
  public sub_status: string = "";
  public statusMap: { [key: string]: any[] } = {
    'OPN': [],
    'WIP': [],
    'TST': [],
    'SUS': [],
    'COM': [],
    'CAN': [],
    'CLO': [],
    'INV': []
  };

  constructor(private userServices: StaffPostAuthService) {

  }

  ngOnInit(): void {
    this.load_flag = false;
    this.getAllSubStatuses();
  }

  getAllSubStatuses() {
    this.statusMap={
      'OPN': [],
      'WIP': [],
      'TST': [],
      'SUS': [],
      'COM': [],
      'CAN': [],
      'CLO': [],
      'INV': []
    };
    this.userServices.getSubStatus().subscribe((rData: any) => {
      if (rData.ret_data == 'success') {
        rData.status_list.forEach((element: any) => {
          const status = element.jbs_master_status;
          if (this.statusMap.hasOwnProperty(status)) {
            this.statusMap[status].push(element);
          }
        });

      }
    });
  }

  saveSubStatus() {
    if (this.master_status != "" && this.master_status != null && this.sub_status != "") {
      this.userServices.saveSubStatus({ "master_status": this.master_status, "sub_status": this.sub_status }).subscribe((rData: any) => {
        if (rData.ret_data == 'success') {
          this.master_status = null;
          this.sub_status = "";
          this.getAllSubStatuses();
          this.coloredToast("success", "New sub status added successfully");
        } else {
          this.coloredToast("danger", "Some error occurred.Please try again.");
        }
      });
    } else {
      this.coloredToast("danger", "Both master status and sub status required");
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
