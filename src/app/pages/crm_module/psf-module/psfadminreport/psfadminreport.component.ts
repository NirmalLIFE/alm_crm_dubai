import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';

@Component({
    selector: 'app-psfadminreport',
    templateUrl: './psfadminreport.component.html',
    styleUrls: ['./psfadminreport.component.css'],
})
export class PsfadminreportComponent implements OnInit {
    tab13: string = 'home';

    public load_flag: boolean = true;
    // dateRange: { start: Date; end: Date };
    // startDate: any;
    // endDate: any;
    public startDate: string = this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '';
    public endDate: string = this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '';
    loadingExpReport = false;
    user_psf_calls: any[] = [];
    user_psf_callsSA: any[] = [];
    expired_calls: any[] = [];
    dissatisfied_calls: any[] = [];
    cre_user_psf_calls: any[] = [];
    cre_expired_calls: any[] = [];
    cre_dissatisfied_calls: any[] = [];
    psf_not_applicable: any[] = [];

    // start: String;
    // end: String;
    // currentDate: Date;

    rangeCalendar: FlatpickrOptions;
    form3!: FormGroup;

    org_psf_data = {
        total_psf_calls: 0,
        expired_psf_calls: 0,
        attempted_psf_calls: 0,
        pending_psf_calls: 0,
        not_expired_pending: 0,
        closed_psf_calls: 0,
        extHappy_psf_calls: 0,
        fairlyHappy_psf_calls: 0,
        happy_psf_calls: 0,
        dissatisfied_psf_calls: 0,
        closed_after_max_psf_attempt: 0,
        calls_zero_attempt: 0,
        calls_one_attempt: 0,
        calls_two_attempt: 0,
        expired_psf_calls_attempt: 0,
        expired_psf_calls_non_attempt: 0,
        psf_not_applicable_calls: 0,
        psf_not_driven_calls: 0,
        newtotalcalls: 0,
    };

    org_psf_data_cre = {
        total_psf_calls: 0,
        expired_psf_calls: 0,
        attempted_psf_calls: 0,
        pending_psf_calls: 0,
        not_expired_pending: 0,
        closed_psf_calls: 0,
        extHappy_psf_calls: 0,
        fairlyHappy_psf_calls: 0,
        happy_psf_calls: 0,
        dissatisfied_psf_calls: 0,
        closed_after_max_psf_attempt: 0,
        calls_zero_attempt: 0,
        calls_one_attempt: 0,
        calls_two_attempt: 0,
        expired_psf_calls_attempt: 0,
        expired_psf_calls_non_attempt: 0,
    };
    store: any;
    public search = '';
    cols = [
        { field: 'name', title: 'User Name' },
        { field: 'calls', title: 'Total Customers' },
        { field: 'attempted_calls', title: 'Calls Attempted' },
        { field: 'non_attempted', title: 'Not Attempted Calls' },
        { field: 'non_answered_calls', title: 'Not Answered Calls' },
        { field: 'completed_calls', title: 'Completed Calls' },
        { field: 'closed_with_approval', title: 'Closed with Approval' },
        { field: 'expired', title: 'Expired Calls' },
        { field: 'ext_satisfied', title: 'Ext. Satisfied' },
        { field: 'satisfied', title: 'Satisfied' },
        { field: 'fairly_satisfied', title: 'Fairly Satisfied' },
        { field: 'dis_satisfied', title: 'Dissatisfied' },
        { field: 'transferred', title: 'Transfered' },
        { field: 'action', title: 'Action' },
    ];

    SA10thDAY = [
        { field: 'name', title: 'User Name' },
        { field: 'calls', title: 'Total Customers' },
        { field: 'attempted_callssa', title: 'Calls Attempted' },
        { field: 'non_attemptedsa', title: 'Not Attempted Calls' },
        { field: 'non_answered_callssa', title: 'Not Answered Calls' },
        { field: 'completed_callssa', title: 'Completed Calls' },
        { field: 'closed_with_approvalsa', title: 'Closed with Approval' },
        { field: 'expiredsa', title: 'Expired Calls' },
        { field: 'ext_satisfiedsa', title: 'Ext. Satisfied' },
        { field: 'satisfiedsa', title: 'Satisfied' },
        { field: 'fairly_satisfiedsa', title: 'Fairly Satisfied' },
        { field: 'dis_satisfiedsa', title: 'Dissatisfied' },
        { field: 'transferredsa', title: 'Transfered' },
        { field: 'action', title: 'Action' },
    ];

    constructor(
        private userServices: StaffPostAuthService,
        public storeData: Store<any>,
        public fb: FormBuilder,
        private router: Router,
        public datepipe: DatePipe
    ) {
        this.form3 = this.fb.group({
            date3: ['2022-07-05 to 2022-07-10'],
        });

        this.rangeCalendar = {
            defaultDate: '2022-07-05 to 2022-07-10',
            dateFormat: 'Y-m-d',
            mode: 'range',
            //  position: this.store.rtlClass === 'rtl' ? 'auto right' : 'auto left',
        };
    }

    ngOnInit(): void {
        this.getPSFcallReport();
    }

    getPSFcallReport() {
        this.load_flag = true;
        this.loadingExpReport = true;
        this.org_psf_data = {
            total_psf_calls: 0,
            expired_psf_calls: 0,
            attempted_psf_calls: 0,
            pending_psf_calls: 0,
            not_expired_pending: 0,
            closed_psf_calls: 0,
            extHappy_psf_calls: 0,
            fairlyHappy_psf_calls: 0,
            happy_psf_calls: 0,
            dissatisfied_psf_calls: 0,
            closed_after_max_psf_attempt: 0,
            calls_zero_attempt: 0,
            calls_one_attempt: 0,
            calls_two_attempt: 0,
            expired_psf_calls_attempt: 0,
            expired_psf_calls_non_attempt: 0,
            psf_not_applicable_calls: 0,
            psf_not_driven_calls: 0,
            newtotalcalls: 0,
        };
        this.org_psf_data_cre = {
            total_psf_calls: 0,
            expired_psf_calls: 0,
            attempted_psf_calls: 0,
            pending_psf_calls: 0,
            not_expired_pending: 0,
            closed_psf_calls: 0,
            extHappy_psf_calls: 0,
            fairlyHappy_psf_calls: 0,
            happy_psf_calls: 0,
            dissatisfied_psf_calls: 0,
            closed_after_max_psf_attempt: 0,
            calls_zero_attempt: 0,
            calls_one_attempt: 0,
            calls_two_attempt: 0,
            expired_psf_calls_attempt: 0,
            expired_psf_calls_non_attempt: 0,
        };
        let data = {
            startDate: this.startDate,
            endDate: this.endDate,
        };
        // this.startDate = '2023-11-01';
        // this.endDate = '2023-11-30';

        this.userServices.getPSFCallReportData(data).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.user_psf_calls = rData.users_psf_list;
                this.user_psf_calls.forEach((element) => {
                    element.non_attempted = 0;
                    element.non_answered_calls = 0;
                    element.closed_with_approval = 0;
                    element.attempted_calls = 0;
                    element.completed_calls = 0;
                    element.ext_satisfied = 0;
                    element.fairly_satisfied = 0;
                    element.satisfied = 0;
                    element.dis_satisfied = 0;
                    element.transferred = 0;
                    element.expired = 0;
                    element.not_applicable = 0;
                    this.org_psf_data.total_psf_calls = this.org_psf_data.total_psf_calls + element.user_psf_calls.length;
                    element.user_psf_calls.forEach((psfCalls: any) => {
                        if (parseInt(psfCalls.psfm_num_of_attempts) > 0 && psfCalls.psfm_status != '20') {
                            element.attempted_calls = element.attempted_calls + 1;
                            this.org_psf_data.attempted_psf_calls = this.org_psf_data.attempted_psf_calls + 1;
                            if (
                                (psfCalls.last_call_status.pst_psf_status == '2' && psfCalls.last_call_status.pst_response != '4') ||
                                psfCalls.last_call_status.pst_psf_status == '7' ||
                                psfCalls.last_call_status.pst_response == '5'
                            ) {
                                element.completed_calls = element.completed_calls + 1;
                                this.org_psf_data.closed_psf_calls = this.org_psf_data.closed_psf_calls + 1;
                            }
                            if (psfCalls.last_call_status.pst_psf_status == '2' && psfCalls.last_call_status.pst_response == '1') {
                                element.ext_satisfied = element.ext_satisfied + 1;
                                this.org_psf_data.extHappy_psf_calls = this.org_psf_data.extHappy_psf_calls + 1;
                            }
                            if (psfCalls.last_call_status.pst_psf_status == '2' && psfCalls.last_call_status.pst_response == '2') {
                                element.fairly_satisfied = element.fairly_satisfied + 1;
                                this.org_psf_data.fairlyHappy_psf_calls = this.org_psf_data.fairlyHappy_psf_calls + 1;
                            }
                            if (psfCalls.last_call_status.pst_psf_status == '2' && psfCalls.last_call_status.pst_response == '3') {
                                element.satisfied = element.satisfied + 1;
                                this.org_psf_data.happy_psf_calls = this.org_psf_data.happy_psf_calls + 1;
                            }
                            if (psfCalls.last_call_status.pst_response == '5') {
                                element.dis_satisfied = element.dis_satisfied + 1;
                                this.org_psf_data.dissatisfied_psf_calls = this.org_psf_data.dissatisfied_psf_calls + 1;
                            }
                            if (psfCalls.last_call_status.pst_psf_status == '3' || psfCalls.last_call_status.pst_psf_status == '8') {
                                element.transferred = element.transferred + 1;
                            }
                            if (psfCalls.last_call_status.pst_psf_status == '4') {
                                element.expired = element.expired + 1;
                                this.org_psf_data.expired_psf_calls = this.org_psf_data.expired_psf_calls + 1;
                                this.org_psf_data.expired_psf_calls_attempt = this.org_psf_data.expired_psf_calls_attempt + 1;
                            }
                            if (psfCalls.last_call_status.pst_response == '4') {
                                element.non_answered_calls = element.non_answered_calls + 1;
                            }
                            if (psfCalls.last_call_status.pst_psf_status == '14' && psfCalls.last_call_status.pst_response == '8') {
                                element.closed_with_approval = element.closed_with_approval + 1;
                            }
                            if (
                                psfCalls.last_call_status.pst_psf_status == '12' ||
                                psfCalls.last_call_status.pst_psf_status == '13' ||
                                psfCalls.last_call_status.pst_psf_status == '16' ||
                                (psfCalls.last_call_status.pst_psf_status == '14' && psfCalls.last_call_status.pst_response == '8')
                            ) {
                                //parseInt(psfCalls.last_call_status.attempt_count) == 3 && psfCalls.last_call_status.pst_response == '4'
                                this.org_psf_data.closed_after_max_psf_attempt = this.org_psf_data.closed_after_max_psf_attempt + 1;
                            }
                            if (
                                parseInt(psfCalls.last_call_status.attempt_count) == 1 &&
                                (psfCalls.last_call_status.pst_psf_status == '0' || psfCalls.last_call_status.pst_psf_status == '1')
                            ) {
                                this.org_psf_data.calls_one_attempt = this.org_psf_data.calls_one_attempt + 1;
                            }
                            if (
                                parseInt(psfCalls.last_call_status.attempt_count) == 2 &&
                                (psfCalls.last_call_status.pst_psf_status == '0' || psfCalls.last_call_status.pst_psf_status == '1')
                            ) {
                                this.org_psf_data.calls_two_attempt = this.org_psf_data.calls_two_attempt + 1;
                            }
                            if (psfCalls.last_call_status.pst_psf_status == '18' || psfCalls.last_call_status.pst_psf_status == '19') {
                                this.org_psf_data.psf_not_applicable_calls = this.org_psf_data.psf_not_applicable_calls + 1;
                                element.not_applicable = element.not_applicable + 1;
                            }
                            // if (psfCalls.last_call_status.pst_response == "7") {
                            //   this.org_psf_data.psf_not_driven_calls =
                            //     this.org_psf_data.psf_not_driven_calls + 1;
                            // }
                        } else if (parseInt(psfCalls.psfm_num_of_attempts) == 0 && psfCalls.psfm_status != '20') {
                            element.non_attempted = element.non_attempted + 1;
                            this.org_psf_data.pending_psf_calls = this.org_psf_data.pending_psf_calls + 1;
                            if (psfCalls.last_call_status.pst_psf_status == '4') {
                                element.expired = element.expired + 1;
                                this.org_psf_data.expired_psf_calls = this.org_psf_data.expired_psf_calls + 1;
                                this.org_psf_data.expired_psf_calls_non_attempt = this.org_psf_data.expired_psf_calls_non_attempt + 1;
                            } else {
                                this.org_psf_data.not_expired_pending = this.org_psf_data.not_expired_pending + 1;
                                this.org_psf_data.calls_zero_attempt = this.org_psf_data.calls_zero_attempt + 1;
                            }
                        } else if (psfCalls.psfm_status == '20') {
                            element.ext_satisfied = element.ext_satisfied + 1;
                            this.org_psf_data.extHappy_psf_calls = this.org_psf_data.extHappy_psf_calls + 1;
                        }
                    });
                    element.user_psf_calls_not_driven.forEach((psfCalls: any) => {
                        if (psfCalls.last_call_status.pst_response == '7') {
                            this.org_psf_data.psf_not_driven_calls = this.org_psf_data.psf_not_driven_calls + 1;
                        }
                    });
                });
                this.org_psf_data.newtotalcalls = this.org_psf_data.total_psf_calls - this.org_psf_data.psf_not_applicable_calls;

                this.additionalReports(this.user_psf_calls);
            } else {
                this.load_flag = false;
                this.loadingExpReport = false;
            }
        });

        this.userServices.getPSFCallSAReportData(data).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.user_psf_callsSA = rData.users_psf_list;
                this.user_psf_callsSA.forEach((element) => {
                    element.non_attemptedsa = 0;
                    element.non_answered_callssa = 0;
                    element.closed_with_approvalsa = 0;
                    element.attempted_callssa = 0;
                    element.completed_callssa = 0;
                    element.ext_satisfiedsa = 0;
                    element.fairly_satisfiedsa = 0;
                    element.satisfiedsa = 0;
                    element.dis_satisfiedsa = 0;
                    element.transferredsa = 0;
                    element.expiredsa = 0;
                    element.not_applicablesa = 0;

                    element.user_psf_callsSA.forEach((psfCalls: any) => {
                        if (parseInt(psfCalls.psfm_num_of_attempts) > 0) {
                            element.attempted_callssa = element.attempted_callssa + 1;

                            if (
                                (psfCalls.last_call_status.pst_psf_status == '2' && psfCalls.last_call_status.pst_response != '4') ||
                                psfCalls.last_call_status.pst_psf_status == '7' ||
                                psfCalls.last_call_status.pst_response == '5'
                            ) {
                                element.completed_callssa = element.completed_callssa + 1;
                            }
                            if (psfCalls.last_call_status.pst_psf_status == '2' && psfCalls.last_call_status.pst_response == '1') {
                                element.ext_satisfiedsa = element.ext_satisfiedsa + 1;
                            }
                            if (psfCalls.last_call_status.pst_psf_status == '2' && psfCalls.last_call_status.pst_response == '2') {
                                element.fairly_satisfiedsa = element.fairly_satisfiedsa + 1;
                            }
                            if (psfCalls.last_call_status.pst_psf_status == '2' && psfCalls.last_call_status.pst_response == '3') {
                                element.satisfiedsa = element.satisfiedsa + 1;
                            }
                            if (psfCalls.last_call_status.pst_response == '5') {
                                element.dis_satisfiedsa = element.dis_satisfiedsa + 1;
                            }
                            if (psfCalls.last_call_status.pst_psf_status == '3' || psfCalls.last_call_status.pst_psf_status == '8') {
                                element.transferredsa = element.transferredsa + 1;
                            }
                            if (psfCalls.last_call_status.pst_psf_status == '4') {
                                element.expiredsa = element.expiredsa + 1;
                            }
                            if (psfCalls.last_call_status.pst_response == '4') {
                                element.non_answered_callssa = element.non_answered_callssa + 1;
                            }
                            if (psfCalls.last_call_status.pst_psf_status == '14' && psfCalls.last_call_status.pst_response == '8') {
                                element.closed_with_approvalsa = element.closed_with_approvalsa + 1;
                            }
                            if (psfCalls.last_call_status.pst_psf_status == '18') {
                                element.not_applicablesa = element.not_applicablesa + 1;
                            }
                        } else if (parseInt(psfCalls.psfm_num_of_attempts) == 0) {
                            element.non_attemptedsa = element.non_attemptedsa + 1;

                            if (psfCalls.last_call_status.pst_psf_status == '4') {
                                element.expiredsa = element.expiredsa + 1;
                            } else {
                            }
                        }
                    });
                });
                this.load_flag = false;
                // this.additionalReports(this.user_psf_callsSA);
            } else {
                this.load_flag = false;
                this.loadingExpReport = false;
            }
        });

        this.userServices.getPSFCallCREReportData(data).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.cre_user_psf_calls = rData.users_psf_list;
                this.cre_user_psf_calls.forEach((element) => {
                    element.non_attempted = 0;
                    element.non_answered_calls = 0;
                    element.closed_with_approval = 0;
                    element.attempted_calls = 0;
                    element.completed_calls = 0;
                    element.ext_satisfied = 0;
                    element.fairly_satisfied = 0;
                    element.satisfied = 0;
                    element.dis_satisfied = 0;
                    element.transferred = 0;
                    element.expired = 0;
                    this.org_psf_data_cre.total_psf_calls = this.org_psf_data_cre.total_psf_calls + element.user_psf_calls.length;
                    element.user_psf_calls.forEach((psfCalls: any) => {
                        if (parseInt(psfCalls.last_call_status.attempt_count) > 0) {
                            element.attempted_calls = element.attempted_calls + 1;
                            this.org_psf_data_cre.attempted_psf_calls = this.org_psf_data_cre.attempted_psf_calls + 1;
                            if (
                                psfCalls.last_call_status.pst_psf_status == '7' &&
                                (psfCalls.last_call_status.pst_response == '1' ||
                                    psfCalls.last_call_status.pst_response == '2' ||
                                    psfCalls.last_call_status.pst_response == '3' ||
                                    psfCalls.last_call_status.pst_response == '5')
                            ) {
                                element.completed_calls = element.completed_calls + 1;
                                this.org_psf_data_cre.closed_psf_calls = this.org_psf_data_cre.closed_psf_calls + 1;
                            }
                            if (psfCalls.last_call_status.pst_psf_status == '7' && psfCalls.last_call_status.pst_response == '1') {
                                element.ext_satisfied = element.ext_satisfied + 1;
                                this.org_psf_data_cre.extHappy_psf_calls = this.org_psf_data_cre.extHappy_psf_calls + 1;
                            }
                            if (psfCalls.last_call_status.pst_psf_status == '7' && psfCalls.last_call_status.pst_response == '2') {
                                element.fairly_satisfied = element.fairly_satisfied + 1;
                                this.org_psf_data_cre.fairlyHappy_psf_calls = this.org_psf_data_cre.fairlyHappy_psf_calls + 1;
                            }
                            if (psfCalls.last_call_status.pst_psf_status == '7' && psfCalls.last_call_status.pst_response == '3') {
                                element.satisfied = element.satisfied + 1;
                                this.org_psf_data_cre.happy_psf_calls = this.org_psf_data_cre.happy_psf_calls + 1;
                            }
                            if (psfCalls.last_call_status.pst_response == '4') {
                                element.non_answered_calls = element.non_answered_calls + 1;
                            }
                            if (psfCalls.last_call_status.pst_psf_status == '14' && psfCalls.last_call_status.pst_response == '8') {
                                element.closed_with_approval = element.closed_with_approval + 1;
                            }
                            if (psfCalls.last_call_status.pst_response == '5') {
                                element.dis_satisfied = element.dis_satisfied + 1;
                                this.org_psf_data_cre.dissatisfied_psf_calls = this.org_psf_data_cre.dissatisfied_psf_calls + 1;
                            }
                            if (psfCalls.last_call_status.pst_psf_status == '8') {
                                element.transferred = element.transferred + 1;
                            }
                            if (psfCalls.last_call_status.pst_psf_status == '10') {
                                element.expired = element.expired + 1;
                                this.org_psf_data_cre.expired_psf_calls = this.org_psf_data_cre.expired_psf_calls + 1;
                                this.org_psf_data_cre.expired_psf_calls_attempt = this.org_psf_data_cre.expired_psf_calls_attempt + 1;
                            }
                            if (
                                psfCalls.last_call_status.pst_psf_status == '12' ||
                                psfCalls.last_call_status.pst_psf_status == '13' ||
                                (parseInt(psfCalls.last_call_status.attempt_count) == 3 && psfCalls.last_call_status.pst_response == '4') ||
                                (psfCalls.last_call_status.pst_psf_status == '14' && psfCalls.last_call_status.pst_response == '8')
                            ) {
                                this.org_psf_data_cre.closed_after_max_psf_attempt = this.org_psf_data_cre.closed_after_max_psf_attempt + 1;
                            }
                            if (
                                parseInt(psfCalls.last_call_status.attempt_count) == 1 &&
                                (psfCalls.last_call_status.pst_psf_status == '2' ||
                                    psfCalls.last_call_status.pst_psf_status == '6' ||
                                    (psfCalls.last_call_status.pst_psf_status == '7' && psfCalls.last_call_status.pst_response == '4'))
                            ) {
                                this.org_psf_data_cre.calls_one_attempt = this.org_psf_data_cre.calls_one_attempt + 1;
                            }
                            if (
                                parseInt(psfCalls.last_call_status.attempt_count) == 2 &&
                                (psfCalls.last_call_status.pst_psf_status == '2' ||
                                    psfCalls.last_call_status.pst_psf_status == '6' ||
                                    (psfCalls.last_call_status.pst_psf_status == '7' && psfCalls.last_call_status.pst_response == '4'))
                            ) {
                                this.org_psf_data_cre.calls_two_attempt = this.org_psf_data_cre.calls_two_attempt + 1;
                            }
                        } else if (parseInt(psfCalls.last_call_status.attempt_count) == 0) {
                            element.non_attempted = element.non_attempted + 1;
                            this.org_psf_data_cre.pending_psf_calls = this.org_psf_data_cre.pending_psf_calls + 1;
                            if (psfCalls.last_call_status.pst_psf_status == '10') {
                                element.expired = element.expired + 1;
                                this.org_psf_data_cre.expired_psf_calls = this.org_psf_data_cre.expired_psf_calls + 1;
                                this.org_psf_data_cre.expired_psf_calls_non_attempt = this.org_psf_data_cre.expired_psf_calls_non_attempt + 1;
                            } else {
                                this.org_psf_data_cre.not_expired_pending = this.org_psf_data_cre.not_expired_pending + 1;
                                this.org_psf_data_cre.calls_zero_attempt = this.org_psf_data_cre.calls_zero_attempt + 1;
                            }
                        }
                    });
                });
                this.load_flag = false;
                this.additionalReportsCRE(this.cre_user_psf_calls);
            }
        });
    }
    additionalReports(call_data: any) {
        this.expired_calls = call_data.filter((expired: any) => expired.expired > 0);
        this.expired_calls = this.expired_calls.sort((a, b) => (a.expired < b.expired ? 1 : b.expired < a.expired ? -1 : 0));
        this.dissatisfied_calls = call_data.filter((dis_satisfied: any) => dis_satisfied.dis_satisfied > 0);
        this.dissatisfied_calls = this.dissatisfied_calls.sort((a, b) => (a.dis_satisfied < b.dis_satisfied ? 1 : b.dis_satisfied < a.dis_satisfied ? -1 : 0));
        this.loadingExpReport = false;
        this.load_flag = false;
    }

    additionalReportsCRE(call_data: any) {
        this.cre_expired_calls = call_data.filter((expired: any) => expired.expired > 0);
        this.cre_expired_calls = this.cre_expired_calls.sort((a, b) => (a.expired < b.expired ? 1 : b.expired < a.expired ? -1 : 0));
        this.cre_dissatisfied_calls = call_data.filter((dis_satisfied: any) => dis_satisfied.dis_satisfied > 0);
        this.cre_dissatisfied_calls = this.cre_dissatisfied_calls.sort((a, b) =>
            a.dis_satisfied < b.dis_satisfied ? 1 : b.dis_satisfied < a.dis_satisfied ? -1 : 0
        );
        this.loadingExpReport = false;
    }

    navigateExpired(type: any) {
        // this.router.navigateByUrl('expiredanddissatisfied/' + type);
        this.router.navigate(['expiredanddissatisfied'],
          {
            queryParams: {
              sDate: this.startDate,
              eDate: this.endDate,
              searchtype: type,
            },
          }
        );
    }
    openViewDetails(data: any) {
        this.router.navigate(['userpsfreport'], {
            queryParams: {
                id: btoa(btoa(btoa(data.us_id))),
                sDate: this.startDate,
                eDate: this.endDate,
                usertype: btoa(btoa(data.us_role_id)),
                us_laabs_id: btoa(btoa(btoa(data.us_laabs_id))),
            },
        });
    }
    openTodayModal(data: any) {
        this.router.navigate(['psfsatodaycalls'], {
            queryParams: {
                id: btoa(btoa(btoa(data.us_id))),
                sDate: this.startDate,
                eDate: this.endDate,
                usertype: btoa(btoa(data.us_role_id)),
                // us_laabs_id:btoa(btoa(data.us_laabs_id)),
            },
        });

        // this.dialogService.open(PsfSaModalComponent, {
        //   context: {
        //     id: btoa(btoa(btoa(data.us_id))),
        //     usertype: btoa(btoa(data.us_role_id)),
        //   },
        // });
        // this.router.navigate(["pages/psf-module/adminpsf-report/sa_today_call/"], {
        //   queryParams: {
        //     id: btoa(btoa(btoa(data.us_id))),
        //     sDate: this.startDate,
        //     eDate: this.endDate,
        //     usertype: btoa(btoa(data.us_role_id)),
        //   },
        // });
    }
    openViewDetailscre(data: any) {
        this.router.navigate(['userreportcre'], {
            queryParams: {
                id: btoa(btoa(btoa(data.us_id))),
                sDate: this.startDate,
                eDate: this.endDate,
                usertype: btoa(btoa(data.us_role_id)),
            },
        });
    }

    psfNotApplicable() {
        this.router.navigate(['psfnotapplicable'], {
            queryParams: {
                //psf_not_applicable_calls: this.psf_not_applicable,
                sDate: this.startDate,
                eDate: this.endDate,
            },
        });
    }

    SearchFilter() {
        if ((this.startDate != '' || this.startDate != null) && (this.endDate != '' || this.endDate != null)) {
            this.getPSFcallReport();
        } else {
        }
    }

    refreshData() {
        // this.dateRange = {
        //   start: new Date(),
        //   end: new Date(),
        // };
        // this.startDate = this.datepipe.transform(new Date(), "yyyy-MM-dd");
        // this.endDate = this.datepipe.transform(new Date(), "yyyy-MM-dd");
        // this.getPSFcallReport();
    }
}
