import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-staff-missed-calls',
    templateUrl: './staff-missed-calls.component.html',
    styleUrls: ['./staff-missed-calls.component.css'],
})
export class StaffMissedCallsComponent implements OnInit {
    @ViewChild('inboundCall') inboundCall: any;
    @ViewChild('calllogmodal') calllogmodal: any;

    public search = '';
    public load_flag: boolean = true;
    public excludedNumbers: any[] = [];
    public missedCalls: any[] = [];
    public missedCallsWithLog: any[] = [];
    public selectedDate: string = this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '';
    public call_data: any = {};
    public calllogphn: any = [];

    cols = [
        { field: 'call_time', title: 'Time', isUnique: true, hide: false },
        { field: 'number', title: 'Number', hide: false },
        { field: 'customer_name', title: 'Customer', hide: false },
        { field: 'lead_code', title: 'Lead' },
        { field: 'lead_purpose', title: 'Call Purpose', hide: false },
        { field: 'lead_note', title: 'Call Reason', hide: true },
        { field: 'action', title: 'Action', hide: false },
        { field: 'call_log', title: 'Call Log', hide: false },
    ];

    constructor(public router: Router, private userServices: StaffPostAuthService, public datepipe: DatePipe) {}
    ngOnInit(): void {
        this.userServices.getExcludedNumberList().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.excludedNumbers = rData.numlist;
            }
        });
        this.getMissedCallLog();
    }
    getMissedCallLog() {
        this.load_flag = true;
        this.missedCalls = [];
        this.missedCallsWithLog = [];
        this.userServices
            .getLatestCallReportData({
                call_type: 'Inbound',
                disposition: 'NO ANSWER',
                call_to: '6300',
                start_day: this.selectedDate + ' 00:00:00',
                end_day: this.selectedDate + ' 23:59:59',
            })
            .subscribe((yeStarData: any) => {
                let missedCallsTemp = yeStarData.call_data.filter((item: any) => item.src != 'Unknown' && item.src.length > 8 && item.src.length < 12);
                this.missedCalls = missedCallsTemp.filter((element: any) => {
                    return this.excludedNumbers.every((item: any) => item.cn_number !== element.src);
                });
                let numberArray: any[] = [...new Set(this.missedCalls.map((element: any) => element.src))];
                // console.log(this.missedCalls);
                this.userServices
                    .getMissedCustomersInfoByNumberList({
                        numbers: numberArray,
                        start_day: this.selectedDate + ' 00:00:00',
                        end_day: this.selectedDate + ' 23:59:59',
                    })
                    .subscribe((rData: any) => {
                        if (rData.ret_data == 'success') {
                            let tempMissedCallsWithLog = rData.customers;
                            tempMissedCallsWithLog.forEach((element: any) => {
                                let current_call = this.missedCalls.filter(
                                    (item: any) => item.src.substring(item.src.length - 9) == element.phone.substring(element.phone.length - 9)
                                );
                                // console.log('current call >>>>>>>>>>>>>>>>>>>>>>>>>', current_call);
                                let temp_yeastar = element.yeastar_call_logs.filter((item: any) => item.timestamp >= current_call[0].timestamp);
                                let temp_calls = element.lead_call_logs.filter((item: any) => item.ystar_call_id == current_call[0].uniqueid);
                                // console.log('temp_calls call>>>>>>>>>>>>>>>>>>', temp_calls);
                                element.missedHistory = [];
                                if (temp_yeastar.length > 1) {
                                    temp_yeastar = temp_yeastar.filter((tp_item: any) => !(tp_item.dst == '6300' && tp_item.disposition == 'ANSWERED'));
                                    temp_yeastar = temp_yeastar.sort((a: any, b: any) => parseInt(a.timestamp) - parseInt(b.timestamp));

                                    for (let i = 0; i < temp_yeastar.length; i++) {
                                        // let log=element.lead_call_logs.filter((item:any)=>item.ystar_call_id==temp_yeastar.uniqueid && item.lcl_call_to==temp_yeastar.dst);
                                        // console.log(log);
                                        if (temp_yeastar[i].disposition == 'ANSWERED') {
                                            element.missedHistory.push(temp_yeastar[i]);
                                            break;
                                        } else {
                                            element.missedHistory.push(temp_yeastar[i]);
                                        }
                                    }
                                } else {
                                    element.missedHistory = temp_yeastar;
                                }
                                // console.log('current_call[0].uniqueid', current_call[0].uniqueid);
                                // console.log('temp_calls', temp_calls);
                                // console.log('element', element);

                                if (temp_calls.length > 0 && current_call[0].uniqueid == temp_calls[0].ystar_call_id) {
                                    let tempMissedSummary = {
                                        number: element.phone,
                                        lead_code: element.lead_code,
                                        lead_id: element.lead_id,
                                        customer_name: element.name,
                                        call_time: temp_yeastar[0].datetime,
                                        lead_purpose: element.purpose_id,
                                        lead_note: element.lead_note,
                                        call_log: element.missedHistory,
                                    };
                                    this.missedCallsWithLog.push(tempMissedSummary);
                                } else {
                                    let tempMissedSummary = {
                                        number: element.phone,
                                        lead_code: '',
                                        lead_id:'',
                                        customer_name: element.name,
                                        call_time: temp_yeastar[0].datetime,
                                        lead_purpose: '0',
                                        lead_note: '',
                                        call_log: element.missedHistory,
                                    };
                                    this.missedCallsWithLog.push(tempMissedSummary);
                                }

                                // element.yeastar_call_logs.forEach((calls:any) => {
                                //   if(element.lead_call_logs.length>0){
                                //     let temp=element.lead_call_logs.filter((item:any)=>item.ystar_call_id==calls.uniqueid && item.lcl_call_to==calls.dst);
                                //     if(temp.length>0){
                                //       element.call_purpose=temp[0].lcl_pupose_id;
                                //       element.call_staff=temp[0].us_firstname;
                                //       element.call_note=temp[0].lcl_purpose_note;
                                //     }else{
                                //       element.call_purpose="0";
                                //       element.call_staff="";
                                //       element.call_note="";
                                //     }

                                //   }else{
                                //     element.call_purpose="0";
                                //     element.call_staff="";
                                //     element.call_note="";
                                //   }
                                // });
                            });
                            // console.log(this.missedCallsWithLog);
                            this.load_flag = false;
                        } else {
                            this.load_flag = false;
                            this.coloredToast('danger', 'Cant fetch details. Please try again later');
                        }
                    });
            });
    }

    updateCallDetails(value: any) {
        // console.log(value);
        let currentLog = value.call_log[0];
        // console.log(currentLog);
        const data = {
            phone: currentLog.src,
            call_to: currentLog.dst,
            call_id: currentLog.uniqueid,
            lcl_call_type: '1',
            lcl_call_source: currentLog.trunk_name == '025503556' ? '1' : '0',
        };

        this.userServices.checkNumber(data).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.call_data = {
                    title_type: currentLog.trunk_name === '025503556' ? 'Marketing Call' : 'Normal Call',
                    phone: currentLog.src, //0551651819
                    leadId: rdata.pendId,
                    rec_call_id: currentLog.uniqueid,
                    call_log_id: rdata.call_log_id,
                };
                // console.log(this.call_data);
                this.inboundCall.open();
            } else {
                this.coloredToast('danger', 'Some error occurred, please try again later');
            }
        });
    }

    closeInboundCallModal() {
        this.inboundCall.close();
        this.getMissedCallLog();
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
