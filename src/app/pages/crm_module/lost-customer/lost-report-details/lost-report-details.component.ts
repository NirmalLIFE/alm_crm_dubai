import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';

@Component({
    selector: 'app-lost-report-details',
    templateUrl: './lost-report-details.component.html',
    styleUrls: ['./lost-report-details.component.css'],
})
export class LostReportDetailsComponent implements OnInit {
    start_date: any;
    due_date: any;
    code: any;
    filter: any;
    userId: any;
    keydata: any;
    us_ext: any;
    us_name: any;
    out_temp: any[] = [];
    public custlist: any[] = [];
    public alllist: any[] = [];
    public lclist: any[] = [];
    data: any[] = [];
    userslist: any[] = [];
    file: any[] = [];
    userfeatures: any[] = [];
    input_arr: any[] = [];
    total_row: any = 0;
    catcount: any = 0;
    converted_count: any = 0;
    attempted_converted_count: any = 0;
    nonattempted_converted_count: any = 0;
    not_converted_count: any = 0;
    not_attempted_call: any = 0;
    attempted_call: any = 0;
    search = '';
    reportLostData: any = [];
    calllogphn: any = [];

    public load_flag: boolean = true;
    @ViewChild('reportViewDetails') reportViewDetails: any;
    @ViewChild('calllogmodal') calllogmodal: any;

    cols = [
        { field: 'customer_code', title: 'Code', hide: false },
        { field: 'customer_name', title: 'Customer', hide: false },
        { field: 'phone', title: 'Number', hide: false },
        { field: 'reg_no', title: 'Reg.No' },
        // { field: 'model_code', title: 'Model Code', hide: false },
        // { field: 'model_name', title: 'Model Name', hide: false },
        // { field: 'model_year', title: 'Model Year', hide: false },
        { field: 'invoice_date', title: 'Invoice Date', hide: false },
        { field: 'assigned', title: 'Assigned', hide: false },
        { field: 'lcst_status', title: 'Response Type', hide: false },
        { field: 'Categorized', title: 'Last Response', hide: false },
        { field: 'ring_status', title: 'Call Status', hide: false },
        { field: 'updated', title: 'Updated By', hide: false },
        { field: 'appointment_date', title: 'Appointment / Expected Arrival Date', hide: false },
        { field: 'lcst_note', title: 'Notes', hide: false },
        { field: 'action', title: 'Action', hide: false },
        { field: 'cust_status', title: 'Conversion', hide: false },
    ];
    constructor(private userServices: StaffPostAuthService, public datepipe: DatePipe, private activeRouter: ActivatedRoute) {
        this.start_date = this.activeRouter.snapshot.queryParamMap.get('start');
        this.due_date = this.activeRouter.snapshot.queryParamMap.get('due');
        this.filter = this.activeRouter.snapshot.queryParamMap.get('filter');
        this.code = this.activeRouter.snapshot.queryParamMap.get('code');
        this.userId = this.activeRouter.snapshot.queryParamMap.get('id') || '';
    }

    ngOnInit(): void {
        this.callData(this.userId);
    }

    callData(userId: any) {
        var startdate: any;
        var enddate: any;

        startdate = moment(this.start_date, 'DD/MM/YYYY').toDate();
        startdate = moment(startdate).format('YYYY-MM-DD');

        enddate = moment(this.due_date, 'DD/MM/YYYY').toDate();
        enddate = moment(enddate).format('YYYY-MM-DD');

        this.userServices.Getyeastarkeys().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.keydata = rdata.yeastar_data;

                this.userServices.getUserById(btoa(this.userId)).subscribe((rdata: any) => {
                    if (rdata.ret_data == 'success') {
                        this.us_ext = rdata.user_details.ext_number;
                        this.us_name = rdata.user_details.us_firstname;
                        let dataOut = {
                            call_type: 'Outbound',
                            start_day: startdate + ' 00:00:00',
                            end_day: enddate + ' 23:59:59',
                            call_from: this.us_ext,
                        };
                        this.userServices.getLatestCallReportData(dataOut).subscribe((rdata: any) => {
                            if (rdata.ret_data == 'success') {
                                if (rdata.call_data.length > 0) {
                                    // let outbound = rdata.call_data.filter(
                                    //   (item) => item.call_to != "RingGroup 6300<6300>"
                                    // );
                                    this.out_temp = rdata.call_data.sort(function (a: any, b: any): any {
                                        return b.timestamp - a.timestamp;
                                    });
                                }
                                this.viewList(this.start_date, this.due_date, this.filter, this.userId, this.us_ext);
                            }
                        });
                    }
                });
            }
        });
    }

    viewList(start: any, due: any, filter: any, uid: any, us_ext: any) {
        this.catcount = 0;
        var that = this;

        this.custlist = [];
        this.data = [];
        this.lclist = [];
        let data = {
            start: start,
            due: due,
            filter: filter,
            uid: uid,
            code: this.code,
        };

        this.userServices.LostCustomerReport(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                rdata.customer.forEach((element: any, index: any) => {
                    rdata.customer[index].checked = false;
                });

                this.file = rdata.file;
                this.custlist = rdata.customer;
                this.alllist = rdata.customer;
                this.lclist = rdata.customer;
                this.total_row = this.custlist.length;
                console.log('call out temp', this.out_temp);
             
                this.custlist.map(function (x) {
                    x.phone_strip = '*****' + x.phone.substring(x.phone.length - 5);
                    x.us_ext = us_ext;
               
                    if (x.lcst_ring_status == '' || x.lcst_ring_status == null) {
                       let status;
                        var result = that.out_temp.filter((a1) => a1.dst.substring(a1.dst.length - 7) == x.phon_uniq);

                        if (result.length > 0) {
                            if (result[0]['disposition'] == 'NO ANSWER') {
                                if (result[0]['ringduration'] >= 30) {
                                    x.lcst_ring_status = 'Not Answered';
                                    status = 'Not Answered';
                                } else {
                                    x.lcst_ring_status = 'Ring<30';
                                    status = 'Ring<30';
                                }
                            } else if (result[0]['disposition'] == 'ANSWERED') {
                                x.lcst_ring_status = 'Answered';
                                status = 'Answered';
                            }
                        } else {
                            x.lcst_ring_status = '';
                            status = '';
                        }

                        let arr = {
                            lcst_id: x.lcst_id,
                            lcst_ring_status: status,
                        };
                        

                        that.input_arr.push(arr);
                       
                       
                        return x;
                    }
                });

                this.custlist.map(function (x) {
                    var result = that.out_temp.filter((a1) => a1.dst.substring(a1.dst.length - 7) == x.phon_uniq);

                    if (result.length > 0) {
                        if (result[0]['disposition'] == 'NO ANSWER') {
                            if (result[0]['ringduration'] >= 30) {
                                x.call_attempted = 'Attempted';
                            } else {
                                x.call_attempted = 'Not Attempted';
                            }
                        } else if (result[0]['disposition'] == 'ANSWERED') {
                            x.call_attempted = 'Attempted';
                        }
                    } else {
                        x.call_attempted = 'Not Attempted';
                    }
                    return x;
                });
                // this.custlist.forEach(element => {
                //   if(element.lcst_ring_status =="Answered") //element.lcst_note != ""
                //   {
                //     element['call_attempted']="Attempted";
                //   }else{
                //     element['call_attempted'] = "Not Attempted";
                //   }
                // });
                // console.log('customer list', this.custlist);


                // console.log('count of not attempt>>>>>>>>', this.not_attempted_call);

                // if(this.sdate!=0)
                // {
                //  fdata = rdata.customer.filter(data => data.invoice_date == this.sdate);
                //  this.custlist = fdata;
                // }
                this.custlist.forEach((element) => {
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
                    if (element.jobcount > 0) {
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

                this.catcount = this.custlist.filter(({ customer_cat_type }) => customer_cat_type != 1).length;
                let tempconverted_count = this.custlist.filter(({ cust_status }) => cust_status == 'Converted');
                this.converted_count = tempconverted_count.length > 0 ? tempconverted_count.length : 0;
                let tempattempedconverted_count = this.custlist.filter(({ cust_status, ring_status
                }) => cust_status == 'Converted' && ring_status && ring_status
                    .trim() == 'Answered');
                this.attempted_converted_count = tempattempedconverted_count.length > 0 ? tempattempedconverted_count.length : 0;
                this.nonattempted_converted_count = Number(this.converted_count) - Number(this.attempted_converted_count);
                this.not_converted_count = Number(this.custlist.length) - Number(this.converted_count);
                this.attempted_call = this.custlist.filter(({ call_attempted }) => call_attempted === 'Attempted').length;
                this.not_attempted_call = this.custlist.filter(({ call_attempted }) => call_attempted === 'Not Attempted').length;
                this.updateReport();
                this.load_flag = false;
            } else {
                // this.showToast(
                //   "danger",
                //   "Error!!!",
                //   "Some error occurred please try again"
                // );
            }
        });
    }


    filterData(type: any) {

       
        console.log(type);

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
        if (type == 0) {
            this.custlist = this.alllist;
               
              } else if (type == 1) {
                  this.custlist = this.alllist.filter(({ cust_status,call_attempted }) => cust_status && cust_status.trim() =='Converted' && call_attempted && call_attempted.trim() =='Attempted');
               
              } else if (type == 2) {
                  this.custlist = this.alllist.filter(({ cust_status,call_attempted }) => cust_status && cust_status.trim() =='Converted' && call_attempted && call_attempted.trim() !='Attempted');
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




    updateReport() {
        
        let dataa = { data: this.input_arr };
        console.log("updateReport",dataa);
      this.userServices.updateLCReport(dataa).subscribe((rdata: any) => { });
    }

    getInfo(phone: any, csname: string, note_date: any, us_ext: any) {
        //   if (
        //     phone.substring(0, 5) == "97150" ||
        //     phone.substring(0, 5) == "97105" ||
        //     phone.substring(0, 2) == "05" ||
        //     phone.substring(0, 4) == "9715"
        //   ) {
        //     this.dialogService.open(LcCallLogModalComponent, {
        //       context: {
        //         title: "This is a title passed to the dialog component",
        //         phone: phone,
        //         customer_name: csname,
        //         notedate: note_date,
        //         start_date: this.start,
        //         due_date: this.due,
        //         us_ext: us_ext,
        //       },
        //     });
        //   } else {
        //     this.showToast("danger", "No Data", "No Data For this Number");
        //   }
    }

    reportViewDetailsModal(phone: any, csname: string, note_date: any, us_ext: any) {
        this.reportLostData = {
            phone: phone,
            customer_name: csname,
            notedate: note_date,
            start_date: this.start_date,
            due_date: this.due_date,
            us_ext: us_ext,
        };
        console.log('reportLostData>>>>>>', this.reportLostData);
        this.reportViewDetails.open();
    }

    reportViewDetailsClose() {
        this.reportViewDetails.close();
    }

    openCallLogs(data: any) {
        this.calllogphn = {
            phone: data
        }
        this.calllogmodal.open();
    }

    callhistoryModal() {
        this.calllogmodal.close();
    }
}
