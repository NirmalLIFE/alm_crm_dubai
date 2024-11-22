import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';
import { FlatpickrOptions } from 'ng2-flatpickr';

@Component({
    selector: 'app-lead-update',
    templateUrl: './lead-update.component.html',
    styleUrls: ['./lead-update.component.css'],
})
export class LeadUpdateComponent implements OnInit {
    public lead_id: string;
    public load_flag: boolean = true;
    public lead: any = [];
    public userList: any[] = [];
    public lead_log: any[] = [];
    public notesList: any[] = [];
    public basic: FlatpickrOptions;
    public noteSearch = 'lead_note';
    public naCount: any;
    public updateflag: boolean = false;

    constructor(public router: Router, private userServices: StaffPostAuthService, public datepipe: DatePipe, private activeRouter: ActivatedRoute) {
        this.lead_id = atob(this.activeRouter.snapshot.paramMap.get('id') || ' ');

        this.basic = {
            dateFormat: 'Y-m-d',
            minDate: new Date(),
        };

        this.userServices.userList().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.userList = rData.userList;
            }
        });
        this.userServices.getPreloadDatas().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.notesList = rData.notes.map(function (i: any) {
                    return i.lead_note;
                });
            } else {
                this.coloredToast('danger', 'Some error occurred, please try again later');
            }
        });
    }
    ngOnInit() {
        this.getLeadsById();
    }

    getLeadsById() {
        const leadid = this.lead_id;
        this.userServices.getLeadsById(leadid).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.lead = rdata.lead;
                if(this.lead.cp_id == 2){
                    this.lead.apptm_group = '2';
                }else{
                    this.lead.apptm_group = '1';
                }
                this.load_flag = false;
                this.userServices.getLeadActivityLog({ id: this.lead_id }).subscribe((rdata: any) => {
                    if (rdata.ret_data == 'success') {
                        this.lead_log = rdata.leadlog;
                        this.naCount = rdata.leadNotAnsCount;
                        this.lead_log.forEach((element) => {
                            var a = element.lac_created_on.split(' ');
                            var date = a[0];
                            var time = a[1];
                            element['c_date'] = date;
                            element['c_time'] = moment(time, 'HHmmss').format('hh:mm:ss A');
                        });
                    }
                });
            }
        });
    }

    leadUpdate(data: any) {
        console.log('data>>>>>>>>>>>>>>>>>>', data.cancelReason);
        if (data['dateField'] != '') {
            let datevalD = new Date(data['dateField']);
            data['dateField'] = datevalD.getFullYear() + '-' + ('0' + (datevalD.getMonth() + 1)).slice(-2) + '-' + ('0' + datevalD.getDate()).slice(-2);
        }

        if (data.new_status == '2' && !data.cancelReason) {
            this.coloredToast('danger', 'Please Enter Lead Cancel Reason');
        } else if (data.new_status == '1' && (!data.dateField || !data.appTime || !data.new_assigned || !data.transportation_service || !data.Remarks)) {
            this.coloredToast('danger', 'Please Enter All fields');
        } else {
            this.updateflag = true;
        }

        if (this.updateflag) {
            this.userServices.leadUpdate(data).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    this.coloredToast('success', 'Lead Update Successfully');
                    this.router.navigateByUrl('leads/lead-list');
                }
            });
        } else {
            // this.coloredToast('danger', 'Some error occurred, please try again later');
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

    preventDefault() {
        return false;
    }
}
