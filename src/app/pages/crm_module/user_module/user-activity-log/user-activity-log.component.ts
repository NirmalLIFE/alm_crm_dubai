import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-activity-log',
  templateUrl: './user-activity-log.component.html',
  styleUrls: ['./user-activity-log.component.css']
})
export class UserActivityLogComponent implements OnInit {

  public log: any[] = [];
  public search: string = '';
  public load_flag: boolean = true;

  public cols = [
    { field: 'log_time', title: 'Date', isUnique: true },
    { field: 'log_ip', title: 'IP', isUnique: true },
    { field: 'us_firstname', title: 'User', isUnique: true },
    { field: 'log_activity', title: 'Activity', isUnique: true },
  ];

  constructor(
    private userServices: StaffPostAuthService,
  ) {

  }

  ngOnInit(): void {
    this.userServices.getUserLog().subscribe((rData: any) => {
      if (rData.ret_data == "success") {
        rData.actlog.forEach((element:any) => {
          element['log_time'] = moment(element['log_time'], 'YYYY-MM-DD hh:mm:ss').format("DD-MM-YYYY hh:mm:ss");
        });
        this.log = rData.actlog;
        this.load_flag=false;
      } else {
        this.coloredToast("danger", "Cant fetch user activity log");
        this.load_flag=false;
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
