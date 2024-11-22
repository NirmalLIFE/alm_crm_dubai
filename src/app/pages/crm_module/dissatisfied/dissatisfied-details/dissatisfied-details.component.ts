import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-dissatisfied-details',
    templateUrl: './dissatisfied-details.component.html',
    styleUrls: ['./dissatisfied-details.component.css'],
})
export class DissatisfiedDetailsComponent implements OnInit {
    dis_id: any;
    lead_id: any;
    userslist: any = [];
    saList: any = [];
    allnotes: any = [];
    dis_cust: any = [];
    psfReason: any = [];
    log: any = [];
    public basic: FlatpickrOptions;
    public load_flag: boolean = true;

    // public leadform = {
    //     id: '',
    //     lead_note: '',
    //     appTime: '',
    //     assigned: '',
    //     psfr_id: '0',
    //     responseaction: '0',
    //     callresponse: '0',
    //     transportation_service: '0',
    //     forward_to: '',
    //     dateField: '',
    // };

    constructor(public router: Router, private userServices: StaffPostAuthService, public datepipe: DatePipe, private activeRouter: ActivatedRoute) {
        this.dis_id = atob(this.activeRouter.snapshot.paramMap.get('id') || ' ');
        this.userServices.userList().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.userslist = rdata.userList;
                this.saList = rdata.userList.filter((item: any) => item.us_role_id == '11');
            }
        });

        this.basic = {
            dateFormat: 'Y-m-d',
            minDate: new Date(),
        };
        // this.userServices.LdNotesList().subscribe((rdata: any) => {
        //   if (rdata.ret_data == "success") {
        //     this.allnotes = rdata.notes.filter(
        //       (status) => status.lead_note !== "" && status.lead_note !== null
        //     );
        //     this.filteredOptions = of(this.allnotes);
        //   }
        // });
        let data = {
            type_id: 5,
        };
        this.userServices.get_PSFreasonMaster(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.psfReason = rdata.reason_master;
            }
        });
    }
    ngOnInit() {
        this.getcustomer();
    }

    getcustomer() {
        let data = {
            id: this.dis_id,
        };
        this.userServices.getdissatisfiedcustbyid(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.dis_cust = rdata.cust;
                this.dis_cust.apptm_group = '1';
                this.log = rdata.log;
                this.log.forEach((element: any) => {
                    var a = element.ldl_created_on.split(' ');
                    var date = a[0];
                    var time = a[1];
                    element['c_date'] = date;
                    element['c_time'] = moment(time, 'HHmmss').format('hh:mm:ss A');
                    this.userslist.forEach((element2: any) => {
                        if (element.ldl_created_by == element2.us_id) {
                            element['user_assigned'] = element2.us_firstname;
                        }
                    });
                });

                if (this.dis_cust.lead_id != null && this.dis_cust.lead_id != '') {
                    this.lead_id = this.dis_cust.lead_id;
                }
                if (this.dis_cust.customer_name != '' && this.dis_cust.customer_name != null) {
                    this.dis_cust['cust_name'] = this.dis_cust.customer_name;
                } else {
                    this.dis_cust['cust_name'] = this.dis_cust.lname;
                }
                if (this.dis_cust.lphone != '' && this.dis_cust.lphone != null) {
                    this.dis_cust['phone'] = this.dis_cust.lphone;
                } else {
                    this.dis_cust['phone'] = this.dis_cust.cphone;
                }
                // if (element.ldl_action == 1) {
                //     element['action_taken'] = 'Transfer the call';
                // } else if (element.ldl_action == 2) {
                //     element['action_taken'] = 'Educated & Closed';
                // } else if (element.ldl_action == 3) {
                //     element['action_taken'] = 'Closed with approval';
                // } else if (element.ldl_action == 4) {
                //     element['action_taken'] = 'Revisit Requested';
                // } else if (element.ldl_action == 5) {
                //     element['action_taken'] = 'Apology over phone/mail';
                // }
                // this.psfReason.forEach((element2: any) => {
                //     this.userslist.forEach((element3: any) => {
                //         if (element.ldl_response == element2.psfr_id) {
                //             element['response'] = element2.psfr_name;
                //         }
                //         if (element.ldm_assign == element3.us_id) {
                //             element['assign'] = element3.us_firstname;
                //         }
                //     });
                // });
                // console.log("id fro  dissatisfied ===>>>>m", this.itemdata);
                // this.leadform.id = this.dis_cust.ldm_id;
                // if(this.dis_cust.lead_id != null && this.itemdata.lead_id != '' ){
                //   this.lead_id=this.itemdata.lead_id;
                // }
                this.load_flag = false;
            } else {
            }
        });
    }

    Update(data: any) {
        if (data['newresponseaction'] == '4') {
            if (data['newdateField'] != '') {
                let datevalD = new Date(data['newdateField']);
                if (!isNaN(datevalD.getTime())) {
                    data['newdateField'] =
                        datevalD.getFullYear() + '-' + ('0' + (datevalD.getMonth() + 1)).slice(-2) + '-' + ('0' + datevalD.getDate()).slice(-2);
                } else {
                    this.coloredToast('danger', 'Select a proper Appointment Date');
                    return;
                }
            }

            if (data['newdateField'] == null || data['newdateField'] == '' || data['newdateField'] == 'NaN-aN-aN') {
                this.coloredToast('danger', 'Select a proper Appointment Date');
                return;
            }

            if (!data['newappTime'] || data['newappTime'] == '' || data['newappTime'] == '') {
                this.coloredToast('danger', 'Select a proper Appointment Time');
                return;
            }
            if (!data['newassigned'] || data['newassigned'] == '' || data['newassigned'] == '') {
                this.coloredToast('danger', 'Select an Appointment Assign');
                return;
            }
        }

        if (data['newlead_note'] == null || data['newlead_note'] == '') {
            this.coloredToast('danger', 'Please Enter Customer Comment');
            return;
        }
        if (this.lead_id) {
            data['lead_id'] = this.lead_id;
        }
        data['dis_id'] = this.dis_id;
        this.userServices.disatisfiedUpdate(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.coloredToast('success', 'Dissatisfied Updated Successfully');
                this.router.navigateByUrl('dissatisfied/dissatisfied-customers-list');
            } else {
                this.coloredToast('danger', 'Fill the Deatil Field');
            }
        });
    }

    resetFields() {
        this.dis_cust.newresponseaction = null;
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
