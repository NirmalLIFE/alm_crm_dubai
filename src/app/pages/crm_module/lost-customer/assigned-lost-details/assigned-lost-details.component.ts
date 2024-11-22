import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { colDef } from '@bhplugin/ng-datatable';
import { stat } from 'fs';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';


@Component({
    selector: 'app-assigned-lost-details',
    templateUrl: './assigned-lost-details.component.html',
    styleUrls: ['./assigned-lost-details.component.css'],
})
export class AssignedLostDetailsComponent implements OnInit {
    start_date: any;
    due_date: any;
    code: any;
    filter: any;
    keydata: any;
    out_temp: any[] = [];
    custlist: any[] = [];
    lclist: any[] = [];
    alllist: any[] = [];
    input_arr: any[] = [];
    total_row: any = 0;
    converted_count: any = 0;
    attempted_converted_count: any = 0;
    nonattempted_converted_count: any = 0;
    not_converted_count: any = 0;
    not_attempted_call: any = 0;
    attempted_call: any = 0;
    catcount = 0;
    isChecked: any = false;
    search = '';
    assignedLostData: any = [];
    public calllogphn: any = [];
    cust_phone: any;

    public load_flag: boolean = true;

    @ViewChild('assignedlostupdate') assignedlostupdate: any;
    @ViewChild('calllogmodal') calllogmodal: any;
    cols = [
        { field: 'phone', title: 'Number', hide: false },
        { field: 'customer_name', title: 'Customer', hide: false },
        { field: 'reg_no', title: 'Reg.No', hide: false },
        // { field: 'model_code', title: 'Model Code', hide: false },
        // { field: 'model_year', title: 'Model Year', hide: false },
        { field: 'assigned', title: 'Assigned', hide: true },
        { field: 'updated', title: 'Updated By', hide: false },
        { field: 'Categorized', title: 'Last Response', hide: false },
        { field: 'lcst_status', title: 'Response Type', hide: false },
        { field: 'appointment_date', title: 'Appointment Date', hide: true },
        { field: 'lcst_note', title: 'Notes', hide: false },
        { field: 'cust_status', title: 'Conversion', hide: false },
        { field: 'ring_status', title: 'Call Status', hide: false },
    ];




    constructor(private userServices: StaffPostAuthService, public datepipe: DatePipe, private router: Router, private activeRouter: ActivatedRoute) {
        this.start_date = this.activeRouter.snapshot.queryParamMap.get('start');
        this.due_date = this.activeRouter.snapshot.queryParamMap.get('due');
        this.filter = this.activeRouter.snapshot.queryParamMap.get('filter');
        this.code = this.activeRouter.snapshot.queryParamMap.get('code');
    }

    ngOnInit(): void {
        this.callData();
        
    }

    callData() {
        this.load_flag = true;
     
        var due_date;
        var start_date;
        due_date = moment(this.due_date, 'DD/MM/YYYY').toDate();
        due_date = moment(due_date).format('YYYY-MM-DD');
        start_date = moment(this.start_date, 'DD/MM/YYYY').toDate();
        start_date = moment(start_date).format('YYYY-MM-DD');

        let dataOut = {
            call_type: 'Outbound',
            start_day: start_date + ' 00:00:00',
            end_day: due_date + ' 23:59:59',
            call_from: atob(atob(localStorage.getItem('us_ext_no') || '{}')),
        };
        let dataa = {
            start_date: this.start_date,
            due_date: this.due_date,
            filter_by: this.filter,
            code: this.code,

        };


        this.userServices.AssignLostCustomerList(dataa).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.alllist = rdata.customer;

                this.userServices.getLatestCallReportData(dataOut).subscribe((rdata: any) => {
                    let that = this;

                    if (rdata.ret_data == 'success') {
                        let outbound = rdata.call_data.filter((item: any) => item.src != '6300');
                        this.out_temp = outbound.sort(function (a: any, b: any): any {
                            return b.timestamp - a.timestamp;
                        });

                        this.alllist.map(function (x) {
                            // x.phone_strip = '*****' + x.phone.substring(x.phone.length - 5);
                            let status;
                            var result = that.out_temp.filter((a1) => a1.dst.substring(a1.dst.length - 7) == x.phon_uniq);

                            if (result.length > 0) {
                                if (result[0]['disposition'] == 'NO ANSWER') {
                                    if (result[0]['ringduration'] >= 30) {
                                        // x.lcst_ring_status = 'Not Answered';
                                        status = 'Not Answered';
                                        x.call_attempted = 'Attempted';
                                    } else {
                                        // x.lcst_ring_status = 'Ring<30'
                                        status = 'Ring<30';
                                        x.call_attempted = 'Not Attempted';
                                    }
                                } else if (result[0]['disposition'] == 'ANSWERED') {
                                    //x.lcst_ring_status = 'Answered';
                                    status = 'Answered';
                                    x.call_attempted = 'Attempted';
                                } else {
                                    //  x.lcst_ring_status = '';
                                    status = '';

                                }
                            } else {
                                // x.lcst_ring_status = '';
                                status = '';
                                x.call_attempted = 'Not Attempted';
                            }

                            x.lcst_ring_status = status;

                            let arr = {
                                lcst_id: x.lcst_id,
                                lcst_ring_status: x.lcst_ring_status,
                            };




                            that.input_arr.push(arr);

                            return x;

                        });
                        this.total_row = this.alllist.length;

                        let tempattemptconverted_count = this.alllist.filter(({ jobcount,
                            lcst_ring_status
                        }) => {

                            return parseInt(jobcount) >= 1 && lcst_ring_status && lcst_ring_status.trim() === "Answered";


                        });

                        let tempconverted_count = this.alllist.filter(({ jobcount }) => { return parseInt(jobcount) >= 1 });
                        if (tempattemptconverted_count.length > 0) this.attempted_converted_count = tempattemptconverted_count.length;
                        if (tempconverted_count.length > 0) {
                            this.converted_count = tempconverted_count.length;

                        }
                        this.nonattempted_converted_count = Number(this.converted_count) - Number(this.attempted_converted_count);
                        this.not_converted_count = Number(this.alllist.length) - Number(this.converted_count);
                        this.attempted_call = this.alllist.filter(({ call_attempted }) => call_attempted === 'Attempted').length;
                        this.not_attempted_call = this.alllist.filter(({ call_attempted }) => call_attempted === 'Not Attempted').length;

                        // this.loadingReport = false;
                        this.checkValue(this.isChecked);
                        
                        this.updateReport();
                        this.load_flag = false;
                        console.log(tempconverted_count);

                    } else {
                        this.coloredToast('danger', 'Call details cant be fetched');
                    }
                });
            }
        });

        // this.getCustomerList();
        // this.userServices.getLatestCallReportData(dataOut).subscribe((rdata: any) => {
        //     if (rdata.ret_data == 'success') {
        //         if (rdata.call_data.length > 0) {
        //             // this.third_party.OutboundUserCall(atob(atob(atob(this.keydata.yeastar_token))), this.start_date,this.due_date,atob(atob(localStorage.getItem("us_ext_no")))).subscribe((rdata: any) => {
        //             //   if (rdata.total_number > 0) {
        //             let outbound = rdata.call_data.filter((item: any) => item.src != '6300');
        //             this.out_temp = outbound.sort(function (a: any, b: any): any {
        //                 return b.timestamp - a.timestamp;
        //             });
        //         }
        //         this.viewList();
        //     }
        // });
    }


    


    viewList() {
        let that = this;
   
        // let dataa={"assigndate":this.assigndate}
        let dataa = {
            start_date: this.start_date,
            due_date: this.due_date,
            filter_by: this.filter,
            code: this.code,
        };

        this.userServices.AssignLostCustomerList(dataa).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                //  if (atob(atob(localStorage.getItem("us_role_id"))) != '1') {
                // rdata.customer.forEach((element: any) => {
                //     element['trim_phone'] = '*****' + element['phone'].substring(element['phone'].length - 5);
                // });

                // }
                // else {
                //   rdata.customer.forEach(element => {
                //     element['trim_phone'] =element['phone'];

                //   });
                // }

                this.alllist = rdata.customer;
                this.lclist = rdata.customer;

                this.alllist.map(function (x) {
                    // x.phone_strip = '*****' + x.phone.substring(x.phone.length - 5);
                    var status;

                    var result = that.out_temp.filter((a1) => a1.dst.substring(a1.dst.length - 7) == x.phon_uniq);
                    if (result.length > 0) {
                        if (result[0]['disposition'] == 'NO ANSWER') {
                            if (result[0]['ringduration'] >= 30) {
                                //  x.lcst_ring_status = 'Not Answered';
                                status = 'Not Answered';
                                x.call_attempted = 'Attempted';
                            } else {
                                // x.lcst_ring_status = 'Ring<30'
                                status = 'Ring<30';
                                x.call_attempted = 'Not Attempted';
                            }
                        } else if (result[0]['disposition'] == 'ANSWERED') {
                            // x.lcst_ring_status = 'Answered';
                            status = 'Answered';
                            x.call_attempted = 'Attempted';
                        } else {
                            // x.lcst_ring_status = '';
                            status = '';
                            //x.call_attempted = "Not Attempted";
                        }
                    } else {
                        // x.lcst_ring_status = '';
                        status = '';
                        x.call_attempted = 'Not Attempted';
                    }
                    x.lcst_ring_status = status;

                    let arr = {
                        lcst_id: x.lcst_id,
                        lcst_ring_status: x.lcst_ring_status,
                    };

                    that.input_arr.push(arr);

                    return x;
                });

                this.total_row = this.alllist.length;

                let tempconverted_count = this.alllist.filter(({ status }) => status == 'Converted');
                let tempattemptconverted_count = this.alllist.filter(({ status, lcst_ring_status }) => status == 'Converted' && lcst_ring_status == 'Answered');
                if (tempattemptconverted_count.length > 0) {
                    this.attempted_converted_count = tempattemptconverted_count.length;
                }
                if (tempconverted_count.length > 0) this.converted_count = tempconverted_count.length;
                this.nonattempted_converted_count = Number(this.converted_count) - Number(this.attempted_converted_count);
                this.not_converted_count = Number(this.alllist.length) - Number(this.converted_count);
                this.attempted_call = this.alllist.filter(({ call_attempted }) => call_attempted === 'Attempted').length;
                this.not_attempted_call = this.alllist.filter(({ call_attempted }) => call_attempted === 'Not Attempted').length;

                // this.loadingReport = false;
                this.checkValue(this.isChecked);
                this.updateReport();
                this.load_flag = false;
            } else {
                this.load_flag = false;
                // this.showToast(
                //   "danger",
                //   "Error!!!",
                //   "Some error occurred please try again"
                // );
            }
        });
    }



    filterData(type: any) {

        this.alllist.forEach((element) => {
            if (element.customer_cat_type == 2) {
                element['Categorized'] = 'Interested Customer';
            } else if (element.customer_cat_type == 3) {
                element['Categorized'] = 'Unhappy Customer';
            } else if (element.customer_cat_type == 4) {
                element['Categorized'] = 'Non Contactable Customer';
            } else if (element.customer_cat_type == 5) {
                element['Categorized'] = 'DND Customer (Do Not Disturb)';
            } else if (element.customer_cat_type == 6) {
                element['Categorized'] = 'Lost Customer';
            } else {
                element['Categorized'] = 'Not Categorized';
            }
        });

        console.log(type);
        if (type == 0) {
      this.custlist = this.alllist;
         
        } else if (type == 1) {
            this.custlist = this.alllist.filter(({ call_attempted,cust_status }) => call_attempted && call_attempted.trim() == 'Attempted' && cust_status && cust_status == 'Converted');
         
        } else if (type == 2) {
            this.custlist = this.alllist.filter(({call_attempted,cust_status }) => call_attempted && call_attempted.trim()!='Attempted' && cust_status && cust_status.trim() == 'Converted');
        } else if (type == 3) {
            this.custlist = this.alllist.filter(({ cust_status }) => cust_status && cust_status.trim() !='Converted');
        }
        else if (type == 4) {
            this.custlist = this.alllist.filter(({ call_attempted }) =>call_attempted && call_attempted.trim() =='Attempted');
        }  else if (type == 5) {
            this.custlist = this.alllist.filter(({ call_attempted }) =>call_attempted && call_attempted.trim() !='Attempted');
        }
        console.log('FilterCustlist',this.custlist);


        if (this.custlist.length > 0) {
            this.custlist.forEach((element) => {
                if (parseInt(element.jobcount) > 0) {
                    element['cust_status'] = 'Converted';
                } else {
                    element['cust_status'] = 'Not Yet Converted';
                }

                if (element.lcst_ring_status == 'Answered') {
                    element['ring_status'] = 'Answered';
                } else if (element.lcst_ring_status == 'Not Answered') {
                    element['ring_status'] = 'Not Answered';
                } else if (element.lcst_ring_status == 'Ring<30') {
                    element['ring_status'] = 'Ring<30';
                } else {
                    element['ring_status'] = "Didn't call";
                }
            });
        }
      }


    checkValue(event: any) {
        this.catcount = 0;
        this.alllist.forEach((element) => {
            if (element.customer_cat_type == 2) {
                element['Categorized'] = 'Interested Customer';
            } else if (element.customer_cat_type == 3) {
                element['Categorized'] = 'Unhappy Customer';
            } else if (element.customer_cat_type == 4) {
                element['Categorized'] = 'Non Contactable Customer';
            } else if (element.customer_cat_type == 5) {
                element['Categorized'] = 'DND Customer (Do Not Disturb)';
            } else if (element.customer_cat_type == 6) {
                element['Categorized'] = 'Lost Customer';
            } else {
                element['Categorized'] = 'Not Categorized';
            }
        });
        this.catcount = this.alllist.filter(({ customer_cat_type }) => customer_cat_type != 1).length;
        if (event == false) {
            this.custlist = this.alllist;
        } else {
            //customer_cat_type
            this.custlist = this.alllist.filter(({ customer_cat_type }) => customer_cat_type != 1);
        }
        if (this.custlist.length > 0) {
            this.custlist.forEach((element) => {
                if (parseInt(element.jobcount) > 0) {
                    element['cust_status'] = 'Converted';
                } else {
                    element['cust_status'] = 'Not Yet Converted';
                }

                if (element.lcst_ring_status == 'Answered') {
                    element['ring_status'] = 'Answered';
                } else if (element.lcst_ring_status == 'Not Answered') {
                    element['ring_status'] = 'Not Answered';
                } else if (element.lcst_ring_status == 'Ring<30') {
                    element['ring_status'] = 'Ring<30';
                } else {
                    element['ring_status'] = "Didn't call";
                }
            });
        }
        console.log('customer list', this.custlist);
    }






    updateReport() {
        
        let dataa = { data: this.input_arr };
       
        this.userServices.updateLCReport(dataa).subscribe((rdata: any) => { });
    }

    updateColumn(col: colDef) {
        col.hide = !col.hide;
        this.cols = [...this.cols]; // Create a new reference of the array
    }

    //addNote(id: any, phone: any, cst_id: any, inv_date: any) {}

    assignedlostupdateModal(id: any, phone: any, cst_id: any, inv_date: any, reg_no: any) {
        // let lastEightDigits = phone.slice(-8);
        // let modifiedNumber = '05' + lastEightDigits;
        this.assignedLostData = {
            id: id,
            phone: phone,
            cst_id: cst_id,
            inv_date: inv_date,
            reg_no: reg_no,
        };
        this.cust_phone = phone;
        console.log('assignedlostdata>>>>>>', this.assignedLostData);
        this.assignedlostupdate.open();
    }

    assignedlostupdateModalClose() {
        this.assignedlostupdate.close();
        this.callData();
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
