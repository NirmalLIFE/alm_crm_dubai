import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';

@Component({
  selector: 'app-call-log-detail',
  templateUrl: './call-log-detail.component.html',
  styleUrls: ['./call-log-detail.component.css']
})
export class CallLogDetailComponent implements OnInit {

  @Input() calllogphn: any;
  @Output() modalEvent = new EventEmitter<boolean>();

 // phone: any;
  incoming: any[] = [];
  outgoing: any[] = [];
  log : any[] = [];
  callidarray : any[] = [];
  public load_flag: boolean = true;
  // keydata: any;
  // cust_name = "";
 // public us_ext_no: any = atob(atob(localStorage.getItem('us_ext_no') || '{}'));
  constructor(private userServices: StaffPostAuthService,) {}

  ngOnInit(): void {
    this.getInbound();
  }

  getInbound() {
    this.log=[];
    let today = moment().format("DD/MM/YYYY");
    let yesterday = moment()
      .subtract(1, "days")
      .startOf("day")
      .format("DD/MM/YYYY")
      .toString();

    let data = {
      phoneNumber: this.calllogphn.phone,
    };
    this.userServices
      .getLatestCallReportByNumber(data)
      .subscribe((rdata: any) => {
        if (rdata.ret_data == "success") {
          if (rdata.call_data.length > 0) {
            let inbound = rdata.call_data.filter((item:any) => item.dst != "6300");

            let missed = rdata.call_data.filter(
              (item:any) => item.disposition == "NO ANSWER"
            );

            let inbound_temp = inbound.sort(function (a:any, b:any): any {
              return b.timestamp - a.timestamp;
            });

            let miss_temp = missed.sort(function (a:any, b:any): any {
              return b.timestamp - a.timestamp;
            });

            miss_temp = miss_temp.slice(0, 6);
            miss_temp.forEach((element:any) => {
              if (element["disposition"] == "NO ANSWER") {
                this.callidarray.push(0);
              }
              var a = element["datetime"].split(" ");
              var date = a[0];
              var time = a[1];
              if (date == today) element["call_date"] = "Today";
              else if (date == yesterday) element["call_date"] = "Yesterday";
              else element["call_date"] = date;

              element["call_time"] = moment(time, "HHmmss").format(
                "hh:mm:ss A"
              );
              this.log.push(element);
            });

            inbound_temp = inbound_temp.slice(0, 6);
            inbound_temp.forEach((element:any) => {
              if (element["disposition"] == "ANSWERED") {
                let arr = element["uniqueid"];
                this.callidarray.push(arr);
              } else {
                this.callidarray.push(0);
              }
              var a = element["datetime"].split(" ");
              var date = a[0];
              var time = a[1];
              if (date == today) element["call_date"] = "Today";
              else if (date == yesterday) element["call_date"] = "Yesterday";
              else element["call_date"] = date;

               if (element.calltype == "Inbound") {
                element["call_to"] = element.dst;
              } else {
                element["call_to"] = element.src;
              }

              element["call_time"] = moment(time, "HHmmss").format(
                "hh:mm:ss A"
              );
              this.log.push(element);
            });
            this.getLog();
          }
          this.load_flag=false;
        }
        
      });
  }

  getLog() {
    this.log = this.log.sort(function (a, b): any {
      return b.timestamp - a.timestamp;
    });
    let dataa = {
     // call_to: this.us_ext_no,
      call_id: this.callidarray,
      //ext_name: atob(atob(localStorage.getItem("us_ext_name"))),
    };

    if (this.callidarray.length > 0) {
      this.userServices.getLog(dataa).subscribe((rdata: any) => {
        if (rdata.ret_data == "success") {
          // let phone =
          //   atob(atob(localStorage.getItem("us_ext_name"))) +
          //   "<" +
          //   atob(atob(localStorage.getItem("us_ext_no"))) +
          //   ">";
          this.log.map(function (x) {
            let s = x.uniqueid; 
            let ext = x.dst;
            var result = rdata.leadlog.filter(
              (a1:any) => a1.ystar_call_id == s && a1.lcl_call_to == ext
            );
            if (result.length > 0) {
              x.leadlog = result[0].lcl_purpose_note;
              x.purpose = result[0].call_purpose;
            } else {
              x.leadlog = "fail";
              x.purpose = "fail";
            }

            return x;
          });
        }
      });
    }

   // console.log("LOG___3________", this.log);
  }

}
