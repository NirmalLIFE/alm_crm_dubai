import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { colDef } from '@bhplugin/ng-datatable';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';

@Component({
    selector: 'app-campaign-time-exceeded',
    templateUrl: './campaign-time-exceeded.component.html',
    styleUrls: ['./campaign-time-exceeded.component.css'],
})
export class CampaignTimeExceededComponent implements OnInit {
    public search = '';
    public load_flag: boolean = true;
    public campaignList: any = [];
    public dateFrom: any = null;
    public dateTo: any = null;
    public calllogphn: any = [];
    allPhnNum: any = [];
    calls: any = [];
    cdrstartDate: any;
    cdrendDate: any;
    public userList: any[] = [];
    public timeExceededCampaignList: any = [];
    public AllTimeExceedCamp: any = [];

    @ViewChild('calllogmodal') calllogmodal: any;

    cols = [
        { field: 'lead_code', title: 'Lead Code', isUnique: true, hide: false },
        { field: 'phone', title: 'Number', hide: false },
        { field: 'name', title: 'Customer', hide: false },
        { field: 'lead_source', title: 'Source' },
        { field: 'camp_name', title: 'Campaign Name' },
        { field: 'reg_no', title: 'Reg.No', hide: false },
        { field: 'us_firstname', title: 'Assigned', hide: false },
        { field: 'lead_note', title: 'Note', hide: false },
        { field: 'created', title: 'Created', hide: false },
        { field: 'action', title: 'Action', hide: false },
    ];

    constructor(public router: Router, private userServices: StaffPostAuthService, public datePipe: DatePipe) {
        this.cdrstartDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
        this.cdrendDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    }

    ngOnInit() {
        this.userServices.userList().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.userList = rData.userList;
            }
        });

        this.getCampaignEnquiry();
    }

    getCampaignEnquiry() {
        this.load_flag = true;
        this.timeExceededCampaignList = [];

        let pendata = {
            dateFrom: this.dateFrom,
            dateTo: this.dateTo,
            purpose_id: '2',
        };

        this.userServices.getCampaignEnquiry(pendata).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.timeExceededCampaignList = rdata.CampaignList.filter((data: any) => data.status_id == '1');
                this.allPhnNum = this.timeExceededCampaignList.map((customer: any) => customer.phone);
                this.load_flag = false;
                this.getALLcalldetails();
            } else {
                this.load_flag = false;
            }
        });
    }

    getALLcalldetails() {
        this.load_flag = true;
        let inData = {
            start_date: this.cdrstartDate + ' 00:00:00',
            end_date: this.cdrendDate + ' 23:59:59',
            call_to: this.allPhnNum,
            //call_type: "Outbound",
        };
        this.userServices.getOutboundCalls(inData).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.timeExceededCampaignList.forEach((element: any) => {
                    rdata.customer.forEach((element2: any) => {
                        element2.forEach((element3: any) => {
                            if (element.call_from == element3.dst && element3.calltype === 'Outbound') {
                                if (element.lcl_created_on <= element3.datetime) {
                                    const calldate = new Date(element3.datetime);
                                    const lclcreatedon = new Date(element.lcl_created_on);
                                    const difference = calldate.getTime() - lclcreatedon.getTime();
                                    if (difference < 3 * 60 * 60 * 1000) {
                                        // The element 3 datetime is within the 3 hours of lcl_created_on datetime
                                        element.callbackstatus = true;
                                    }
                                }
                            }
                        });
                    });
                });
                this.AllTimeExceedCamp = this.timeExceededCampaignList.filter((data: any) => data.callbackstatus == false);
                this.load_flag = false;
            } else {
                this.load_flag = false;
            }
        });
    }

    viewCampaignDetails(value: any) {
        this.router.navigateByUrl('campaign-details/' + btoa(value.lead_id));
    }

    openCallLogs(data: any) {
        this.calllogphn = {
            phone: data,
        };
        this.calllogmodal.open();
    }
    callhistoryModal() {
        this.calllogmodal.close();
    }

    updateColumn(col: colDef) {
        col.hide = !col.hide;
        this.cols = [...this.cols]; // Create a new reference of the array
    }
}
