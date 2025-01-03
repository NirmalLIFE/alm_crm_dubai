import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { colDef } from '@bhplugin/ng-datatable';
import { trigger, transition, style, animate } from '@angular/animations';
import { Store } from '@ngrx/store';

@Component({
    selector: 'app-staff-inbound-call',
    templateUrl: './staff-inbound-call.component.html',
    styleUrls: ['./staff-inbound-call.component.css'],
    animations: [
        trigger('toggleAnimation', [
            transition(':enter', [style({ opacity: 0, transform: 'scale(0.95)' }), animate('100ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))]),
            transition(':leave', [animate('75ms', style({ opacity: 0, transform: 'scale(0.95)' }))]),
        ]),
    ],
})
export class StaffInboundCallComponent implements OnInit {
    @ViewChild('unLoggedCallsModal') unLoggedCallsModal: any;
    @ViewChild('inboundCall') inboundCall: any;
    @ViewChild('calllogmodal') calllogmodal: any;

    public search = '';
    public load_flag: boolean = true;
    public selectedDate: string = this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '';
    public staffLoggedCalls: any[] = [];
    public cdrCallLog: any = [];
    public unLoggedCalls: any = [];
    public excludedNumbers: any[] = [];
    public call_data: any = {};
    public calllogphn: any = [];

    cols = [
        { field: 'lcl_time', title: 'Time', isUnique: true, hide: false },
        { field: 'Call_from', title: 'Number', hide: false },
        { field: 'name', title: 'Customer', hide: false },
        { field: 'lead_code', title: 'Lead' },
        { field: 'pupose_id', title: 'Call Purpose', hide: false },
        { field: 'purpose_note', title: 'Call Reason', hide: true },
        { field: 'action', title: 'Action', hide: false },
        { field: 'call_details', title: 'Call Log', hide: false },
    ];

    constructor(public router: Router, private userServices: StaffPostAuthService, public datepipe: DatePipe) {}

    ngOnInit(): void {
        this.userServices.getExcludedNumberList().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.excludedNumbers = rData.numlist;
            }
        });
        this.getStaffCallLog();
    }

    updateColumn(col: colDef) {
        col.hide = !col.hide;
        this.cols = [...this.cols]; // Create a new reference of the array
    }

    getStaffCallLog() {
        console.log(this.selectedDate);
        this.load_flag = true;
        this.userServices
            .getStaffInboundCallLog({
                user_id: atob(atob(localStorage.getItem('us_id') || '{}')),
                start_day: this.selectedDate + ' 00:00:00',
                end_day: this.selectedDate + ' 23:59:59',
            })
            .subscribe((rData: any) => {
                if (rData.ret_data == 'success') {
                    this.staffLoggedCalls = rData.calls;
                    this.userServices
                        .getLatestCallReportData({
                            call_type: 'Inbound',
                            start_day: this.selectedDate + ' 00:00:00',
                            end_day: this.selectedDate + ' 23:59:59',
                        })
                        .subscribe((yeStarData: any) => {
                            const groupedData = yeStarData.call_data.filter(
                                (data: any) =>
                                    data.calltype == 'Inbound' &&
                                    (data.disposition == 'ANSWERED' || data.disposition == 'NOT ANSWERED') &&
                                    data.dst != '6300' &&
                                    data.src.length > 3
                            );
                            this.cdrCallLog = groupedData.reduce((acc: any, item: any) => {
                                const existingGroup = acc.find((group: any) => group.uniqueid === item.uniqueid && group.src === item.src);
                                if (existingGroup) {
                                    existingGroup.data.push(item);
                                } else {
                                    acc.push({
                                        uniqueid: item.uniqueid,
                                        src: item.src,
                                        data: [item],
                                    });
                                }
                                return acc;
                            }, []);
                            this.categorizeCalls();
                        });
                }
            });
    }
    categorizeCalls() {
        console.log("this.cdrCallLog",this.cdrCallLog);

        let tempCdrCalls: any[] = this.cdrCallLog.filter((element: any) => {
            return this.excludedNumbers.every((item: any) => item.cn_number !== element.src);
        });
        console.log("tempCdrCalls",tempCdrCalls);
        this.unLoggedCalls = tempCdrCalls.filter((element: any) => {
            return this.staffLoggedCalls.every((item: any) => item.ystar_call_id !== element.uniqueid);
        });

        console.log("this.staffLoggedCalls",this.staffLoggedCalls);
        console.log("this.unLoggedCalls",this.unLoggedCalls);

        let temp = this.staffLoggedCalls.filter((element: any) => element.lcl_createdby == atob(atob(localStorage.getItem('us_id') || '{}')));
        console.log(temp);
        this.staffLoggedCalls = temp;
        this.staffLoggedCalls.forEach((element) => {
            console.log(element);
            let temp = tempCdrCalls.filter((item: any) => item.uniqueid == element.ystar_call_id);
            if (temp.length > 0) element.call_details = temp[0].purpose_note;
            element.call_history_load = false;
        });
        this.load_flag = false;
        this.loadCallLogsByNumber();
    }

    loadCallLogsByNumber() {}
    openUnLoggedCalls() {
        if (this.unLoggedCalls.length > 0) {
            let numberArray: any[] = this.unLoggedCalls.map((element: any) => element.src);
            console.log(numberArray);
            this.unLoggedCallsModal.open();
            this.userServices
                .getCustomerInfo({
                    num_list: numberArray,
                })
                .subscribe((rData: any) => {
                    this.unLoggedCalls.forEach((element: any) => {
                        const customer = rData.customers.find((c: any) => c.cust_number === element.src);
                        if (customer) {
                            element.cust_name = customer.cust_name;
                            element.cust_id = customer.cust_id;
                        }
                    });
                });
        } else {
            this.coloredToast('success', 'No log missing calls found.');
        }
    }

    assignCallOwnership(selectedRow: any, sectedItem: any) {
        console.log('data>>>>>>selectedRow, sectedItem>>>>>>>>>>>>', selectedRow, sectedItem);
        Swal.fire({
            icon: 'warning',
            title: 'Confirm the call is answered by you',
            text: 'To ensure accuracy, please confirm you were the one who answered the call?',
            showCancelButton: true,
            confirmButtonText: 'CONFIRM',
            padding: '2em',
            customClass: 'sweet-alerts',
        }).then((result) => {
            if (result.value) {
                this.unLoggedCallsModal.close();
                const data = {
                    phone: selectedRow.src,
                    call_to: sectedItem.dst,
                    call_id: selectedRow.uniqueid,
                    lcl_call_type: '0',
                    lcl_call_source: selectedRow.trunk_name == '025503556' ? '1' : '0',
                };

                this.userServices.checkNumber(data).subscribe((rdata: any) => {
                    if (rdata.ret_data === 'success') {
                        this.handleCheckNumberSuccess(selectedRow, rdata);
                    }
                });
            }
        });
    }
    handleCheckNumberSuccess(element: any, rdata: any) {
        this.call_data = {
            title_type: element.srctrunk === '025503556' ? 'Marketing Call' : 'Normal Call',
            phone: element.src, //0551651819
            leadId: rdata.pendId,
            rec_call_id: element.uniqueid,
            call_log_id: rdata.call_log_id,
        };
        console.log(this.call_data);
        this.inboundCall.open();
    }
    updateCallDetails(value: any) {
        // let currentLog = value.call_details.filter((item: any) => item.uniqueid == value.ystar_call_id && item.dst == value.call_to)
        console.log(value);
        this.call_data = {
            title_type: value.lcl_call_source == '0' ? 'Normal Call' : 'Marketing Call',
            phone: value.Call_from, //0551651819
            leadId: value.lcl_lead_id,
            rec_call_id: value.ystar_call_id,
            call_log_id: value.lcl_id,
        };
        console.log(this.call_data);
        this.inboundCall.open();
    }
    closeInboundCallModal() {
        this.inboundCall.close();
        this.getStaffCallLog();
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

    refreshCalls() {
        this.selectedDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '';
        this.getStaffCallLog();
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
