import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-lost-count-report',
    templateUrl: './lost-count-report.component.html',
    styleUrls: ['./lost-count-report.component.css'],
})
export class LostCountReportComponent implements OnInit {
    tab2 = 'home';
    public datelist: any[] = [];
    public temp_datelist: any[] = [];
    public load_flag:boolean=true;
    public fileType: string = '';

    constructor(private userServices: StaffPostAuthService, public datepipe: DatePipe, private router: Router) {
        var today = this.datepipe.transform(new Date(), 'yyyy-M-dd');
        var Stoday = moment().startOf('month').format('YYYY-MM-DD');
        var Etoday = moment().endOf('month').format('YYYY-MM-DD');
        console.log(Stoday);
        this.userServices.LcReportList().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.temp_datelist = rdata.datelist;
                this.datelist = rdata.datelist;
                this.datelist.forEach((element) => {
                    element['call_percentage'] = element.percentage + '%';
                });
                this.datelist = this.datelist.filter(({ duedate }) => duedate >= Stoday);
                this.onTabClick('home');
                this.load_flag=false;
            } else {
                this.load_flag=false;
                // this.showToast("danger","Error!!!","Some error occurred please try again");
            }
        });
    }

    ngOnInit(): void {
       
    }


   


    onTabClick(tab: string): void {
        
        var today = this.datepipe.transform(new Date(), 'yyyy-M-dd');
        var Stoday = moment().startOf('month').format('YYYY-MM-DD');
        var Etoday = moment().endOf('month').format('YYYY-MM-DD');
        this.datelist = this.temp_datelist;
        

        console.log('araay????????????????????', this.datelist);

        if (tab === 'home') {
            this.datelist = this.datelist.filter(({ duedate }) => duedate >= Stoday);
        } else if (tab === 'profile') {
            this.datelist = this.datelist.filter(({ duedate }) => duedate <= Stoday);
        }

        this.tab2 = tab;
    }

    viewInfo(start: any, due: any, filter: any, id: any, code: any) {
        console.log('start,due,filter,id,code', start, due, filter, id, code);
       
        this.router.navigate(['lost-customer/lost-report-details'], {
            queryParams: {
                code: code,
                start: start,
                due: due,
                filter: filter,
                id:id,
            },
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
        } else {
            this.fileType = '';
        }
        return this.fileType;
    }
}
