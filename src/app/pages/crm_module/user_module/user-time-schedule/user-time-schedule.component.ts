import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-time-schedule',
  templateUrl: './user-time-schedule.component.html',
  styleUrls: ['./user-time-schedule.component.css']
})
export class UserTimeScheduleComponent implements OnInit {

  public userId: string;
  public workTime: any[] = [];
  public userData: any;
  public store: any;

  public preloadingTime: FlatpickrOptions;

  public data_load_flag: boolean = true;
  public data_submit_flag: boolean = false;

  constructor(
    private activeRouter: ActivatedRoute,
    private userServices: StaffPostAuthService,
    public storeData: Store<any>,
    public datePipe: DatePipe
  ) {
    this.userId = this.activeRouter.snapshot.paramMap.get('id') || '';
    this.initStore();
    this.preloadingTime = {

      noCalendar: true,
      enableTime: true,
      dateFormat: 'H:i',
      position: this.store.rtlClass === 'rtl' ? 'auto right' : 'auto left',
    };
  }

  ngOnInit(): void {
    this.userServices.getUserById(this.userId).subscribe((rData: any) => {
      if (rData.ret_data == "success") {
        this.userData = rData.user_details;
        this.data_load_flag = false;
      } else {
        this.coloredToast("danger", "Cant fetch user details");
        this.data_load_flag = false;
      }
    });
    this.userServices.getUserWorkingTime(atob(this.userId)).subscribe((rData: any) => {
      if (rData.ret_data == "success") {
        rData.worktime.forEach((element: any) => {
          // let fn_start=new Date(element.fnstart).toLocaleString('en', {timeZone: 'Asia/Dubai'});
          // console.log(fn_start);
          element.fnstart = this.datePipe.transform(new Date(element.fnstart), 'HH:mm');
          element.fnend = this.datePipe.transform(new Date(element.fnend), 'HH:mm');
          element.anstart = this.datePipe.transform(new Date(element.anstart), 'HH:mm');
          element.anend = this.datePipe.transform(new Date(element.anend), 'HH:mm');
          this.workTime.push(element);
        });
      }
    });

  }
  addTimeSchedule() {
    this.workTime.push({
      fnstart: "",
      fnend: "",
      anstart: "",
      anend: "",
      day: null,
    });
  }

  updateWorkTime() {
    let success_flag = true;
    let work: any[] = [];
    this.workTime.forEach(element => {
      if (element.day == "" || element.start == "" || element.end == "") {

      } else {
        let dateval = new Date(element.fnstart);
        let h = (dateval.getHours() > 9 ? dateval.getHours() : '0' + dateval.getHours());
        let m = (dateval.getMinutes() > 9 ? dateval.getMinutes() : '0' + dateval.getMinutes());
        let s = (dateval.getSeconds() > 9 ? dateval.getSeconds() : '0' + dateval.getSeconds());
        element.fnstart = h + ":" + m + ":" + s;

        let enddateval = new Date(element.fnend);
        let eh = (enddateval.getHours() > 9 ? enddateval.getHours() : '0' + enddateval.getHours());
        let em = (enddateval.getMinutes() > 9 ? enddateval.getMinutes() : '0' + enddateval.getMinutes());
        let es = (enddateval.getSeconds() > 9 ? enddateval.getSeconds() : '0' + enddateval.getSeconds());
        element.fnend = eh + ":" + em + ":" + es;

        let andateval = new Date(element.anstart);
        let ah = (andateval.getHours() > 9 ? andateval.getHours() : '0' + andateval.getHours());
        let am = (andateval.getMinutes() > 9 ? andateval.getMinutes() : '0' + andateval.getMinutes());
        let as = (andateval.getSeconds() > 9 ? andateval.getSeconds() : '0' + andateval.getSeconds());
        element.anstart = ah + ":" + am + ":" + as;

        let anenddateval = new Date(element.anend);
        let aeh = (anenddateval.getHours() > 9 ? anenddateval.getHours() : '0' + anenddateval.getHours());
        let aem = (anenddateval.getMinutes() > 9 ? anenddateval.getMinutes() : '0' + anenddateval.getMinutes());
        let aes = (anenddateval.getSeconds() > 9 ? anenddateval.getSeconds() : '0' + anenddateval.getSeconds());
        element.anend = aeh + ":" + aem + ":" + aes;

        work.push(element);
      }
    });
    if (work.length == 0) {
      this.coloredToast("danger", "Error!!! Atleast one item required");
    } else {
      if (success_flag) {
        let senddata = {
          'user': this.userId,
          'work': work,
        }
        this.userServices.updateUserWorktime(senddata).subscribe((rdata: any) => {
          if (rdata.ret_data == "success") {
            this.coloredToast("success", "Worktime Updated successfully");
            //setTimeout(() =>  _that.router.navigate(['/pages/quotes/quote-list']), 1000);
          }
        });
      } else {
        this.coloredToast("danger", "Please delete blank rows");
      }

    }
  }

  deleteItem(item: number) {
    this.workTime.splice(item, 1);
  }

  async initStore() {
    this.storeData
      .select((d) => d.index)
      .subscribe((d) => {
        this.store = d;
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
