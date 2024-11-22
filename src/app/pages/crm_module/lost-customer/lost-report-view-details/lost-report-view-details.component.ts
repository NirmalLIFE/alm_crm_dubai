import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';

@Component({
    selector: 'app-lost-report-view-details',
    templateUrl: './lost-report-view-details.component.html',
    styleUrls: ['./lost-report-view-details.component.css'],
})
export class LostReportViewDetailsComponent implements OnInit {
    userlist: any[] = [];
    report: any[] = [];
    customerdata: any = [];
    vehicle: any[] = [];
    jobcard: any[] = [];
    latest_jobcard: any = [];

    keydata: any;
    custphone: any;

    @Input() reportLostData: any = [];
    @Output() modalEvent = new EventEmitter<boolean>();

    constructor(private userServices: StaffPostAuthService, public datepipe: DatePipe, private activeRouter: ActivatedRoute) {
        this.userServices.userList().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.userlist = rdata.userList;
            }
        });
        // this.start_date = this.activeRouter.snapshot.queryParamMap.get('start');
        // this.due_date = this.activeRouter.snapshot.queryParamMap.get('due');
        // this.filter = this.activeRouter.snapshot.queryParamMap.get('filter');
        // this.code = this.activeRouter.snapshot.queryParamMap.get('code');
        // this.userId = this.activeRouter.snapshot.queryParamMap.get('id') || '';
    }

    ngOnInit(): void {
        // this.callData(this.userId);
        console.log('re[portlostdata>>>>>>>>>>>>>>>>>>>>', this.reportLostData);
        let _that = this;
        let data = {
            phone: this.reportLostData.phone,
        };
        this.userServices.CallInfo(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.customerdata = rdata.customer;
                this.vehicle = rdata.vehicle;
                this.jobcard = rdata.jobcard.slice(0, 1);
                this.latest_jobcard = rdata.JCS;
 
                // _that.isnNew = true;
                // _that.loading = false;
            } else {
                // this.isnNew = false;
                // this.loading = false;
            }
        });
        this.userServices.Getyeastarkeys().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.keydata = rdata.yeastar_data;

                this.getLog();
            }
        });
    }

    getLog() {
        // this.start_date = "18/10/2022";
        // this.due_date = "19/10/2022";
        // this.phone = "5551333";
        this.report = [];
        var startdate;
        var enddate;

        enddate = moment(this.reportLostData.due_date, 'DD/MM/YYYY').toDate();
        enddate = moment(enddate).format('YYYY-MM-DD');

        startdate = moment(this.reportLostData.start_date, 'DD/MM/YYYY').toDate();
        startdate = moment(startdate).format('YYYY-MM-DD');

        this.custphone = '05' + this.reportLostData.phone.substring(this.reportLostData.phone.length - 8);
        let dataOut = {
            phoneNumber: this.custphone,
            start_day: startdate + ' 00:00:00',
            end_day: enddate + ' 23:59:59',
        };
        this.userServices.getLatestCallReportByNumber(dataOut).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                if (rdata.call_data.length > 0) {
                    let filteredArr = rdata.call_data.filter(
                        (data: any) => data.calltype == 'Outbound' && data.dst.length > 3 && data.src == this.reportLostData.us_ext
                    );
                    this.report = filteredArr;
                    this.report = this.report.sort(function (a: any, b: any): any {
                        return b.timestamp - a.timestamp;
                    });

                    this.report.forEach((element) => {
                        const minutes: number = Math.floor(element['talkduration'] / 60);
                        element['talk_minutes'] =
                            minutes.toString().padStart(2, '0') + ' Mins  ' + (element['talkduration'] - minutes * 60).toString().padStart(2, '0') + ' Sec';
                        // element['talk_minutes'] = Math.floor((element['talk_duration'] % 3600) / 60);

                        var callto = element['dst'] + ' ';
                        this.userlist.forEach((element2) => {
                            if (element2.ext_number == callto.substring(0, 3)) {
                                element['user'] = element2.us_firstname;
                            }
                        });
                    });
                   console.log('this.report-------------',this.report);
                }
                // console.log('this.report-------------',this.report);
            }
        });
    }
}
