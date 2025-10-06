import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';

@Component({
    selector: 'app-assigned-lost-count',
    templateUrl: './assigned-lost-count.component.html',
    styleUrls: ['./assigned-lost-count.component.css'],
})
export class AssignedLostCountComponent implements OnInit {
    tab2 = 'home';
    public datelist: any[] = [];
    public temp_datelist: any[] = [];
 
    public fileType: string = '';
    constructor(private userServices: StaffPostAuthService, public datepipe: DatePipe, private router: Router) {}

    ngOnInit(): void {
        this.getList();
    }




    getList() {
        var today = this.datepipe.transform(new Date(), 'yyyy-M-dd');
        var Stoday = moment().startOf('month').format('YYYY-MM-DD');
        var Etoday = moment().endOf('month').format('YYYY-MM-DD');

        this.userServices.LcAssignedDateList().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.temp_datelist = rdata.datelist;
                this.datelist = rdata.datelist;
                this.datelist = this.datelist.filter((duedate: any) => duedate.duedate >= Stoday);
                this.temp_datelist.forEach((element) => {
                    element['call_percentage'] = element.percentage + '%';
                  
                  
                });
                
            } else {
                // this.showToast(
                //   "danger",
                //   "Error!!!",
                //   "Some error occurred please try again"
                // );
            }
        });
    }

    onTabClick(tab: string): void {
        var today = this.datepipe.transform(new Date(), 'yyyy-M-dd');
        var Stoday = moment().startOf('month').format('YYYY-MM-DD');
        var Etoday = moment().endOf('month').format('YYYY-MM-DD');
        this.datelist = this.temp_datelist;
        // this.datelist.forEach((element) => {
        //     element['call_percentage'] = element.percentage + '%';
        // });

        if (tab === 'home') {
            this.datelist = this.datelist.filter(({ duedate }) => duedate >= Stoday);
        } else if (tab === 'profile') {
            this.datelist = this.datelist.filter(({ duedate }) => duedate <= Stoday);
        }
        this.tab2 = tab;
    }

    viewInfo(start: any, due: any, filter: any, code: any) {
        this.router.navigate(['lost-customer/assigned-lost-details'], {
            queryParams: {
                code: code,
                start: start,
                due: due,
                filter: filter,
            },
        });

        // this.router.navigateByUrl(
        //     'pages/customer/assigned_lc_list/' +
        //         encodeURIComponent(btoa(start)) +
        //         '/' +
        //         encodeURIComponent(btoa(due)) +
        //         '/' +
        //         encodeURIComponent(btoa(filter)) +
        //         '/' +
        //         encodeURIComponent(btoa(code))
        // );
    }

    // updateSingleSelectGroupValue(event: any) {
    //     var today = this.datepipe.transform(new Date(), 'yyyy-M-dd');
    //     var Stoday = moment().startOf('month').format('YYYY-MM-DD');
    //     var Etoday = moment().endOf('month').format('YYYY-MM-DD');
    //     this.datelist = this.temp_datelist;
    //     if (event == 'activelist') {
    //         this.datelist = this.datelist.filter(({ duedate }) => duedate >= Stoday);
    //     } else {
    //         this.datelist = this.datelist.filter(({ duedate }) => duedate <= Stoday);
    //     }
    // }


    getFileType(val: any): string{
        if(val =='0'){
          this.fileType = '';
        } else if (val == '1') {
          this.fileType= 'Lost Customer';
        } else if(val == '2'){
            this.fileType= 'Service Reminder';
        } else if(val == '3'){
            this.fileType = 'Discontinued Customer'
        } else if(val == '4'){
            this.fileType = 'Extended Warranty Customer'
        } else if(val =='5'){
            this.fileType = 'Campaign Data'
        } else{
            this.fileType = '';
        }
        return this.fileType;
    }
}
