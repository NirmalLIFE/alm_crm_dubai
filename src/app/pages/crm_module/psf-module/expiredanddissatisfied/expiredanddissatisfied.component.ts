import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';

@Component({
    selector: 'app-expiredanddissatisfied',
    templateUrl: './expiredanddissatisfied.component.html',
    styleUrls: ['./expiredanddissatisfied.component.css'],
})
export class ExpiredanddissatisfiedComponent implements OnInit {
    public load_flag: boolean = true;
    public search: string = '';
    psf_user_id: any = 0;
    searchtype: any;
    searchTerm: any;
    userpsf_details: any = [];
    selectedField: any;
    temp_userpsf_details: any[] = [];
    oldCallData: any[] = [];
    callData: any[] = [];
    startDate: any;
    endDate: any;

    @ViewChild('psfcallhistory') psfcallhistory: any;

    public cols = [
        { field: 'customer_name', title: 'Customer' },
        { field: 'phone', title: 'Number' },
        { field: 'psfm_job_no', title: 'Job No' },
        { field: 'psfm_reg_no', title: 'Reg No' },
        { field: 'psfm_invoice_date', title: 'Inv. Date' },
        { field: 'psfm_psf_assign_date', title: 'PSF SA Assign Date' },
        { field: 'attempt_count', title: 'Attempts' },
        { field: 'sa_name', title: 'Assigned SA' },
        { field: 'lastsa_response', title: 'Last SA Response' },
        { field: 'cre_name', title: 'Assigned CRE' },
        { field: 'lastcre_response', title: 'Last CRE Response' },
        { field: 'psfm_sa_rating', title: 'SA Rating' },
        { field: 'psfm_cre_rating', title: 'CRE Rating' },
        { field: 'sa_status', title: 'Current Status SA' },
        { field: 'cre_status', title: 'Current Status CRE' },
        { field: 'Action', title: 'Action' },
    ];

    constructor(private userServices: StaffPostAuthService, private activeRouter: ActivatedRoute) {
        this.searchtype = this.activeRouter.snapshot.queryParamMap.get('searchtype')!;
        this.startDate = this.activeRouter.snapshot.queryParamMap.get('sDate');
        this.endDate = this.activeRouter.snapshot.queryParamMap.get('eDate');
    }

    ngOnInit(): void {
        this.getUserPSFcallReport();
    }
    getUserPSFcallReport() {
        this.load_flag = true;
        let data = {
            startDate: this.startDate,
            endDate: this.endDate,
        };
        if (this.searchtype == 1 || this.searchtype == 2) {
            this.userServices.getPSFexpiredReportData(data).subscribe((rData: any) => {
                if (rData.ret_data == 'success') {
                    this.userpsf_details = null;
                    this.userpsf_details = rData.user_psfdetails;
                    if (this.searchtype == 1) {
                        this.userpsf_details.user_psf_calls.forEach((element: any) => {
                            let sastatustracker = element.psf_calls.filter((element: any) => element.pst_psf_call_type != '1');
                            let attempts = sastatustracker.filter((element: any) => element.pst_response != '0');
                            if (sastatustracker && sastatustracker.length > 0 && sastatustracker[0].pst_psf_status != '4') {
                                element.expireFlag = true;
                            } else {
                                element.sa_name = sastatustracker[0].us_firstname;
                                element.cre_name = element.us_firstname;
                                element.expireFlag = false;
                                element.expired = false;
                                element.ext_satisfied = false;
                                element.fairlyHappy_psf_calls = false;
                                element.happy_psf_calls = false;
                                element.dis_satisfied = false;
                                element.expired_psf_calls = true;
                                element.not_expired_pending = true;
                                element.attempt_count = attempts.length;

                                //let Lastsastatustracker = element.psf_calls.filter(({ pst_sourceid }) => pst_sourceid != '19');
                                if (sastatustracker && sastatustracker.length > 0 && sastatustracker[0].rm_name) {
                                    element.lastsa_response = sastatustracker[0].rm_name;
                                    if (sastatustracker[0].rm_id == '1') {
                                        element.sacolor = '#006400';
                                    } else if (sastatustracker[0].rm_id == '2') {
                                        element.sacolor = '#4C9A2A';
                                    } else if (sastatustracker[0].rm_id == '3') {
                                        element.sacolor = '#68BB59';
                                    } else if (sastatustracker[0].rm_id == '4') {
                                        element.sacolor = '#FFA500';
                                    } else if (sastatustracker[0].rm_id == '5') {
                                        element.sacolor = '#FF0000';
                                    } else {
                                        element.sacolor = '#0c42f5';
                                    }
                                    if (sastatustracker[0].pst_psf_status == '0') {
                                        element.sa_status = 'OPEN';
                                        element.sastatuscolor = '#6c757d';
                                    } else if (sastatustracker[0].pst_psf_status == '1') {
                                        element.sa_status = 'PENDING';
                                        element.sastatuscolor = '#ffc107';
                                    } else if (sastatustracker[0].pst_psf_status == '3') {
                                        element.sa_status = 'TRANSFERRED';
                                        element.sastatuscolor = '#6b51d5';
                                    } else if (sastatustracker[0].pst_psf_status == '15') {
                                        element.sa_status = 'REVISIT';
                                        element.sastatuscolor = '#194a7c';
                                    } else if (sastatustracker[0].pst_psf_status == '18' && sastatustracker[0].pst_response == '6') {
                                        element.sa_status = 'CLOSED';
                                        element.sastatuscolor = '#9a7c1f';
                                    } else if (sastatustracker[0].pst_response == '4') {
                                        element.sa_status = 'UNREACHABLE';
                                        element.sastatuscolor = '#1eadc3';
                                    } else {
                                        element.sa_status = 'COMPLETED';
                                        element.sastatuscolor = '#28a745';
                                    }
                                } else if (
                                    sastatustracker &&
                                    sastatustracker.length > 0 &&
                                    sastatustracker[0].pst_response == '0' &&
                                    sastatustracker[0].pst_psf_status
                                ) {
                                    element.lastsa_response = 'CLOSED INCOMPLETE';
                                    element.sacolor = '#ff0000';
                                    element.sa_status = 'CLOSED';
                                    element.sastatuscolor = '#9a7c1f';
                                } else {
                                    element.lastsa_response = 'PENDING';
                                    element.sacolor = '#ff0000';
                                    element.sa_status = 'PENDING';
                                    element.sastatuscolor = '#ffc107';
                                }
                                let Lastcrestatustracker = element.psf_calls.filter((element: any) => element.pst_psf_call_type == '1');

                                if (Lastcrestatustracker && Lastcrestatustracker.length > 0 && Lastcrestatustracker[0].rm_name) {
                                    element.lastcre_response = Lastcrestatustracker[0].rm_name;
                                    if (Lastcrestatustracker[0].rm_id == '1') {
                                        element.crecolor = '#006400';
                                    } else if (Lastcrestatustracker[0].rm_id == '2') {
                                        element.crecolor = '#4C9A2A';
                                    } else if (Lastcrestatustracker[0].rm_id == '3') {
                                        element.crecolor = '#68BB59';
                                    } else if (Lastcrestatustracker[0].rm_id == '4') {
                                        element.crecolor = '#FFA500';
                                    } else if (Lastcrestatustracker[0].rm_id == '5') {
                                        element.crecolor = '#FF0000';
                                    } else {
                                        element.crecolor = '#0c42f5';
                                    }
                                    if (Lastcrestatustracker[0].pst_psf_status == '2') {
                                        element.cre_status = 'OPEN';
                                        element.crestatuscolor = '#6c757d';
                                    } else if (Lastcrestatustracker[0].pst_psf_status == '6') {
                                        element.cre_status = 'PENDING';
                                        element.crestatuscolor = '#ffc107';
                                    } else if (Lastcrestatustracker[0].pst_psf_status == '8') {
                                        element.cre_status = 'TRANSFERRED';
                                        element.crestatuscolor = '#6b51d5';
                                    } else if (Lastcrestatustracker[0].pst_psf_status == '15') {
                                        element.cre_status = 'REVISIT';
                                        element.crestatuscolor = '#194a7c';
                                    } else if (Lastcrestatustracker[0].pst_psf_status == '18' && Lastcrestatustracker[0].pst_response == '6') {
                                        element.cre_status = 'CLOSED';
                                        element.crestatuscolor = '#9a7c1f';
                                    } else if (Lastcrestatustracker[0].pst_response == '4') {
                                        element.cre_status = 'UNREACHABLE';
                                        element.crestatuscolor = '#1eadc3';
                                    } else {
                                        element.cre_status = 'COMPLETED';
                                        element.crestatuscolor = '#28a745';
                                    }
                                } else {
                                    element.lastcre_response = 'PENDING';
                                    element.crecolor = '#ff0000';
                                    element.cre_status = 'PENDING';
                                    element.crestatuscolor = '#ffc107';
                                }
                                if (parseInt(element.psfm_num_of_attempts) > 0) {
                                    if (element.psfm_lastresponse == '4' || element.psfm_lastresponse == '10') {
                                        element.expired = true;
                                        this.userpsf_details.expired = this.userpsf_details.expired + 1;
                                    }
                                    if ((element.psfm_lastresponse == '2' || element.psfm_lastresponse == '7') && element.psf_calls[0].pst_response == '1') {
                                        element.ext_satisfied = true;
                                        this.userpsf_details.ext_satisfied = this.userpsf_details.ext_satisfied + 1;
                                    }
                                    if ((element.psfm_lastresponse == '2' || element.psfm_lastresponse == '7') && element.psf_calls[0].pst_response == '2') {
                                        element.fairlyHappy_psf_calls = true;
                                        this.userpsf_details.fairlyHappy_psf_calls = this.userpsf_details.fairlyHappy_psf_calls + 1;
                                    }
                                    if (
                                        (element.psfm_lastresponse == '2' || element.psfm_lastresponse == '7') &&
                                        element.psf_calls[0].psfm_lastresponse == '3'
                                    ) {
                                        element.happy_psf_calls = true;
                                        this.userpsf_details.happy_psf_calls = this.userpsf_details.happy_psf_calls + 1;
                                    }
                                    if (
                                        (element.psfm_lastresponse == '2' ||
                                            element.psfm_lastresponse == '7' ||
                                            element.psf_calls[0].pst_psf_status == '14' ||
                                            element.psf_calls[0].pst_psf_status == '15') &&
                                        element.psf_calls[0].pst_response == '5'
                                    ) {
                                        element.dis_satisfied = true;
                                        this.userpsf_details.dissatisfied_psf_calls = this.userpsf_details.dissatisfied_psf_calls + 1;
                                    }
                                } else if (parseInt(element.psfm_num_of_attempts) == 0) {
                                    if (element.psf_calls[0].pst_psf_status == '4' || element.psf_calls[0].pst_psf_status == '10') {
                                        element.expired_psf_calls = true;
                                        this.userpsf_details.expired_psf_calls = this.userpsf_details.expired_psf_calls + 1;
                                        this.userpsf_details.expired_psf_calls_non_attempt = this.userpsf_details.expired_psf_calls_non_attempt + 1;
                                    } else {
                                        element.not_expired_pending = true;
                                        this.userpsf_details.not_expired_pending = this.userpsf_details.not_expired_pending + 1;
                                    }
                                }
                            }
                        });
                        this.userpsf_details.user_psf_calls = this.userpsf_details.user_psf_calls.filter(
                            ({ expireFlag }: { expireFlag: boolean }) => !expireFlag
                        );
                    } else {
                        console.log('staus>>>>>>>>>>>>', this.userpsf_details.user_psf_calls);

                        this.userpsf_details.user_psf_calls.forEach((element: any) => {
                            let sastatustracker = element.psf_calls.filter((pst_sourceid: any) => pst_sourceid.pst_psf_call_type != '1');
                            let attempts = sastatustracker.filter((pst_response: any) => pst_response.pst_response != '0');
                            // let crestatus = element.psf_calls.filter((pst_sourceid: any) => pst_sourceid.pst_sourceid == '19');
                            if (sastatustracker && sastatustracker.length > 0 && sastatustracker[0].pst_response == '5') {
                                element.sa_name = sastatustracker[0].us_firstname;
                                element.cre_name = element.us_firstname;
                                element.dissatisfiedFlag = false;
                                element.expired = false;
                                element.ext_satisfied = false;
                                element.fairlyHappy_psf_calls = false;
                                element.happy_psf_calls = false;
                                element.dis_satisfied = false;
                                element.expired_psf_calls = true;
                                element.not_expired_pending = true;
                                element.attempt_count = attempts.length;

                                let Lastsastatustracker = element.psf_calls.filter((pst_sourceid: any) => pst_sourceid.pst_psf_call_type != '1');
                                if (Lastsastatustracker && Lastsastatustracker.length > 0 && Lastsastatustracker[0].rm_name) {
                                    element.lastsa_response = Lastsastatustracker[0].rm_name;
                                    if (Lastsastatustracker[0].rm_id == '1') {
                                        element.sacolor = '#006400';
                                    } else if (Lastsastatustracker[0].rm_id == '2') {
                                        element.sacolor = '#4C9A2A';
                                    } else if (Lastsastatustracker[0].rm_id == '3') {
                                        element.sacolor = '#68BB59';
                                    } else if (Lastsastatustracker[0].rm_id == '4') {
                                        element.sacolor = '#FFA500';
                                    } else if (Lastsastatustracker[0].rm_id == '5') {
                                        element.sacolor = '#FF0000';
                                    } else {
                                        element.sacolor = '#0c42f5';
                                    }
                                    if (Lastsastatustracker[0].pst_psf_status == '0') {
                                        element.sa_status = 'OPEN';
                                        element.sastatuscolor = '#6c757d';
                                    } else if (Lastsastatustracker[0].pst_psf_status == '1') {
                                        element.sa_status = 'PENDING';
                                        element.sastatuscolor = '#ffc107';
                                    } else if (Lastsastatustracker[0].pst_psf_status == '3') {
                                        element.sa_status = 'TRANSFERRED';
                                        element.sastatuscolor = '#6b51d5';
                                    } else if (Lastsastatustracker[0].pst_psf_status == '15') {
                                        element.sa_status = 'REVISIT';
                                        element.sastatuscolor = '#194a7c';
                                    } else if (Lastsastatustracker[0].pst_psf_status == '18' && Lastsastatustracker[0].pst_response == '6') {
                                        element.sa_status = 'CLOSED';
                                        element.sastatuscolor = '#9a7c1f';
                                    } else if (Lastsastatustracker[0].pst_response == '4') {
                                        element.sa_status = 'UNREACHABLE';
                                        element.sastatuscolor = '#1eadc3';
                                    } else {
                                        element.sa_status = 'COMPLETED';
                                        element.sastatuscolor = '#28a745';
                                    }
                                } else if (
                                    Lastsastatustracker &&
                                    Lastsastatustracker.length > 0 &&
                                    Lastsastatustracker[0].pst_response == '0' &&
                                    Lastsastatustracker[0].pst_psf_status == '4'
                                ) {
                                    element.lastsa_response = 'CLOSED INCOMPLETE';
                                    element.sacolor = '#ff0000';
                                    element.sa_status = 'CLOSED';
                                    element.sastatuscolor = '#9a7c1f';
                                } else {
                                    element.lastsa_response = 'PENDING';
                                    element.sacolor = '#ff0000';
                                    element.sa_status = 'PENDING';
                                    element.sastatuscolor = '#ffc107';
                                }
                                let Lastcrestatustracker = element.psf_calls.filter((pst_sourceid: any) => pst_sourceid.pst_psf_call_type == '1');

                                if (Lastcrestatustracker && Lastcrestatustracker.length > 0 && Lastcrestatustracker[0].rm_name) {
                                    element.lastcre_response = Lastcrestatustracker[0].rm_name;
                                    if (Lastcrestatustracker[0].rm_id == '1') {
                                        element.crecolor = '#006400';
                                    } else if (Lastcrestatustracker[0].rm_id == '2') {
                                        element.crecolor = '#4C9A2A';
                                    } else if (Lastcrestatustracker[0].rm_id == '3') {
                                        element.crecolor = '#68BB59';
                                    } else if (Lastcrestatustracker[0].rm_id == '4') {
                                        element.crecolor = '#FFA500';
                                    } else if (Lastcrestatustracker[0].rm_id == '5') {
                                        element.crecolor = '#FF0000';
                                    } else {
                                        element.crecolor = '#0c42f5';
                                    }
                                    if (Lastcrestatustracker[0].pst_psf_status == '2') {
                                        element.cre_status = 'OPEN';
                                        element.crestatuscolor = '#6c757d';
                                    } else if (Lastcrestatustracker[0].pst_psf_status == '6') {
                                        element.cre_status = 'PENDING';
                                        element.crestatuscolor = '#ffc107';
                                    } else if (Lastcrestatustracker[0].pst_psf_status == '8') {
                                        element.cre_status = 'TRANSFERRED';
                                        element.crestatuscolor = '#6b51d5';
                                    } else if (Lastcrestatustracker[0].pst_psf_status == '15') {
                                        element.cre_status = 'REVISIT';
                                        element.crestatuscolor = '#194a7c';
                                    } else if (Lastcrestatustracker[0].pst_psf_status == '18' && Lastcrestatustracker[0].pst_response == '6') {
                                        element.cre_status = 'CLOSED';
                                        element.crestatuscolor = '#9a7c1f';
                                    } else if (Lastcrestatustracker[0].pst_response == '4') {
                                        element.cre_status = 'UNREACHABLE';
                                        element.crestatuscolor = '#1eadc3';
                                    } else {
                                        element.cre_status = 'COMPLETED';
                                        element.crestatuscolor = '#28a745';
                                    }
                                } else {
                                    element.lastcre_response = 'PENDING';
                                    element.crecolor = '#ff0000';
                                    element.cre_status = 'PENDING';
                                    element.crestatuscolor = '#ffc107';
                                }
                                if (parseInt(element.psfm_num_of_attempts) > 0) {
                                    if (element.psfm_lastresponse == '4' || element.psfm_lastresponse == '10') {
                                        element.expired = true;
                                        this.userpsf_details.expired = this.userpsf_details.expired + 1;
                                    }
                                    if ((element.psfm_lastresponse == '2' || element.psfm_lastresponse == '7') && element.psf_calls[0].pst_response == '1') {
                                        element.ext_satisfied = true;
                                        this.userpsf_details.ext_satisfied = this.userpsf_details.ext_satisfied + 1;
                                    }
                                    if ((element.psfm_lastresponse == '2' || element.psfm_lastresponse == '7') && element.psf_calls[0].pst_response == '2') {
                                        element.fairlyHappy_psf_calls = true;
                                        this.userpsf_details.fairlyHappy_psf_calls = this.userpsf_details.fairlyHappy_psf_calls + 1;
                                    }
                                    if (
                                        (element.psfm_lastresponse == '2' || element.psfm_lastresponse == '7') &&
                                        element.psf_calls[0].psfm_lastresponse == '3'
                                    ) {
                                        element.happy_psf_calls = true;
                                        this.userpsf_details.happy_psf_calls = this.userpsf_details.happy_psf_calls + 1;
                                    }
                                    if (
                                        (element.psfm_lastresponse == '2' ||
                                            element.psfm_lastresponse == '7' ||
                                            element.psf_calls[0].pst_psf_status == '14' ||
                                            element.psf_calls[0].pst_psf_status == '15') &&
                                        element.psf_calls[0].pst_response == '5'
                                    ) {
                                        element.dis_satisfied = true;
                                        this.userpsf_details.dissatisfied_psf_calls = this.userpsf_details.dissatisfied_psf_calls + 1;
                                    }
                                } else if (parseInt(element.psfm_num_of_attempts) == 0) {
                                    this.userpsf_details.pending_psf_calls = this.userpsf_details.pending_psf_calls + 1;
                                    if (element.psf_calls[0].pst_psf_status == '4' || element.psf_calls[0].pst_psf_status == '10') {
                                        element.expired_psf_calls = true;
                                        this.userpsf_details.expired_psf_calls = this.userpsf_details.expired_psf_calls + 1;
                                        this.userpsf_details.expired_psf_calls_non_attempt = this.userpsf_details.expired_psf_calls_non_attempt + 1;
                                    } else {
                                        element.not_expired_pending = true;
                                        this.userpsf_details.not_expired_pending = this.userpsf_details.not_expired_pending + 1;
                                    }
                                }
                            } else {
                                element.dissatisfiedFlag = true;
                            }
                        });
                        this.userpsf_details.user_psf_calls = this.userpsf_details.user_psf_calls.filter(
                            ({ dissatisfiedFlag }: { dissatisfiedFlag: boolean }) => !dissatisfiedFlag
                        );
                    }
                    this.load_flag = false;
                } else {
                    this.load_flag = false;
                }
            });
        }
        if (this.searchtype == 3 || this.searchtype == 4) {
            this.userServices.getPSFexpiredReportDataCre(data).subscribe((rData: any) => {
                if (rData.ret_data == 'success') {
                    this.userpsf_details = null;
                    this.userpsf_details = rData.user_psfdetails;
                    if (this.searchtype == 3) {
                        this.userpsf_details.user_psf_calls.forEach((element: any) => {
                            let crestatustracker = element.psf_calls.filter((pst_sourceid: any) => pst_sourceid.pst_psf_call_type == '1');
                            let attempts = crestatustracker.filter((pst_response: any) => pst_response.pst_response != '0');
                            if (crestatustracker && crestatustracker.length > 0) {
                                if (crestatustracker[0].pst_psf_status != '10') {
                                    element.expireFlag = true;
                                } else {
                                    element.cre_name = crestatustracker[0].us_firstname;
                                    element.sa_name = element.us_firstname;
                                    element.expireFlag = false;
                                    element.expired = false;
                                    element.ext_satisfied = false;
                                    element.fairlyHappy_psf_calls = false;
                                    element.happy_psf_calls = false;
                                    element.dis_satisfied = false;
                                    element.expired_psf_calls = true;
                                    element.not_expired_pending = true;
                                    element.attempt_count = attempts.length;
                                    //let Lastsastatustracker = element.psf_calls.filter(({ pst_sourceid }) => pst_sourceid != '19');
                                    if (crestatustracker && crestatustracker.length > 0 && crestatustracker[0].rm_name) {
                                        element.lastsa_response = crestatustracker[0].rm_name;
                                        if (crestatustracker[0].rm_id == '1') {
                                            element.sacolor = '#006400';
                                        } else if (crestatustracker[0].rm_id == '2') {
                                            element.crecolor = '#4C9A2A';
                                        } else if (crestatustracker[0].rm_id == '3') {
                                            element.crecolor = '#68BB59';
                                        } else if (crestatustracker[0].rm_id == '4') {
                                            element.crecolor = '#FFA500';
                                        } else if (crestatustracker[0].rm_id == '5') {
                                            element.crecolor = '#FF0000';
                                        } else {
                                            element.crecolor = '#0c42f5';
                                        }
                                    } else if (
                                        crestatustracker &&
                                        crestatustracker.length > 0 &&
                                        crestatustracker[0].pst_response == '0' &&
                                        crestatustracker[0].pst_psf_status
                                    ) {
                                        element.lastcre_response = 'CLOSED INCOMPLETE';
                                        element.crecolor = '#ff0000';
                                        element.cre_status = 'CLOSED';
                                        element.crestatuscolor = '#9a7c1f';
                                    } else {
                                        element.lastcre_response = 'PENDING';
                                        element.crecolor = '#ff0000';
                                        element.cre_status = 'PENDING';
                                        element.crestatuscolor = '#ffc107';
                                    }
                                    let Lastsastatustracker = element.psf_calls.filter((pst_sourceid: any) => pst_sourceid.pst_psf_call_type != '1');

                                    if (Lastsastatustracker && Lastsastatustracker.length > 0 && Lastsastatustracker[0].rm_name) {
                                        element.lastsa_response = Lastsastatustracker[0].rm_name;
                                        if (Lastsastatustracker[0].rm_id == '1') {
                                            element.sacolor = '#006400';
                                        } else if (Lastsastatustracker[0].rm_id == '2') {
                                            element.sacolor = '#4C9A2A';
                                        } else if (Lastsastatustracker[0].rm_id == '3') {
                                            element.sacolor = '#68BB59';
                                        } else if (Lastsastatustracker[0].rm_id == '4') {
                                            element.sacolor = '#FFA500';
                                        } else if (Lastsastatustracker[0].rm_id == '5') {
                                            element.sacolor = '#FF0000';
                                        } else {
                                            element.sacolor = '#0c42f5';
                                        }
                                        if (Lastsastatustracker[0].pst_psf_status == '0') {
                                            element.sa_status = 'OPEN';
                                            element.sastatuscolor = '#6c757d';
                                        } else if (Lastsastatustracker[0].pst_psf_status == '1') {
                                            element.sa_status = 'PENDING';
                                            element.sastatuscolor = '#ffc107';
                                        } else if (Lastsastatustracker[0].pst_psf_status == '3') {
                                            element.sa_status = 'TRANSFERRED';
                                            element.sastatuscolor = '#6b51d5';
                                        } else if (Lastsastatustracker[0].pst_psf_status == '15') {
                                            element.sa_status = 'REVISIT';
                                            element.sastatuscolor = '#194a7c';
                                        } else if (Lastsastatustracker[0].pst_psf_status == '18' && Lastsastatustracker[0].pst_response == '6') {
                                            element.sa_status = 'CLOSED';
                                            element.sastatuscolor = '#9a7c1f';
                                        } else if (Lastsastatustracker[0].pst_response == '4') {
                                            element.sa_status = 'UNREACHABLE';
                                            element.sastatuscolor = '#1eadc3';
                                        } else {
                                            element.sa_status = 'COMPLETED';
                                            element.sastatuscolor = '#28a745';
                                        }
                                    } else {
                                        element.lastsa_response = 'PENDING';
                                        element.sacolor = '#ff0000';
                                        element.sa_status = 'PENDING';
                                        element.sastatuscolor = '#ffc107';
                                    }
                                }
                            } else {
                                element.expireFlag = true;
                            }
                        });
                        //const containsExpireFlag = this.userpsf_details.user_psf_calls.some((item) => 'expireFlag' in item);

                        // if (containsExpireFlag) {
                        this.userpsf_details.user_psf_calls = this.userpsf_details.user_psf_calls.filter(
                            ({ expireFlag }: { expireFlag: boolean }) => !expireFlag
                        );

                        //  }else{
                        //   this.userpsf_details.user_psf_calls=[];
                        //  }
                    } else {
                        this.userpsf_details.user_psf_calls.forEach((element: any) => {
                            // let sastatustracker = element.psf_calls.filter(({ pst_sourceid }) => pst_sourceid != '19');
                            let crestatus = element.psf_calls.filter((pst_sourceid: any) => pst_sourceid.pst_psf_call_type == '1');
                            let attempts = crestatus.filter(({ pst_response }: { pst_response: string }) => pst_response !== '0');

                            if (crestatus && crestatus.length > 0 && crestatus[0].pst_response == '5') {
                                element.cre_name = crestatus[0].us_firstname;
                                element.sa_name = element.us_firstname;
                                element.dissatisfiedFlag = false;
                                element.expired = false;
                                element.ext_satisfied = false;
                                element.fairlyHappy_psf_calls = false;
                                element.happy_psf_calls = false;
                                element.dis_satisfied = false;
                                element.expired_psf_calls = true;
                                element.not_expired_pending = true;
                                element.attempt_count = attempts.length;
                                let Lastsastatustracker = element.psf_calls.filter((pst_sourceid: any) => pst_sourceid.pst_psf_call_type != '1');
                                if (Lastsastatustracker && Lastsastatustracker.length > 0 && Lastsastatustracker[0].rm_name) {
                                    element.lastsa_response = Lastsastatustracker[0].rm_name;
                                    if (Lastsastatustracker[0].rm_id == '1') {
                                        element.sacolor = '#006400';
                                    } else if (Lastsastatustracker[0].rm_id == '2') {
                                        element.sacolor = '#4C9A2A';
                                    } else if (Lastsastatustracker[0].rm_id == '3') {
                                        element.sacolor = '#68BB59';
                                    } else if (Lastsastatustracker[0].rm_id == '4') {
                                        element.sacolor = '#FFA500';
                                    } else if (Lastsastatustracker[0].rm_id == '5') {
                                        element.sacolor = '#FF0000';
                                    } else {
                                        element.sacolor = '#0c42f5';
                                    }
                                    if (Lastsastatustracker[0].pst_psf_status == '0') {
                                        element.sa_status = 'OPEN';
                                        element.sastatuscolor = '#6c757d';
                                    } else if (Lastsastatustracker[0].pst_psf_status == '1') {
                                        element.sa_status = 'PENDING';
                                        element.sastatuscolor = '#ffc107';
                                    } else if (Lastsastatustracker[0].pst_psf_status == '3') {
                                        element.sa_status = 'TRANSFERRED';
                                        element.sastatuscolor = '#6b51d5';
                                    } else if (Lastsastatustracker[0].pst_psf_status == '15') {
                                        element.sa_status = 'REVISIT';
                                        element.sastatuscolor = '#194a7c';
                                    } else if (Lastsastatustracker[0].pst_psf_status == '18' && Lastsastatustracker[0].pst_response == '6') {
                                        element.sa_status = 'CLOSED';
                                        element.sastatuscolor = '#9a7c1f';
                                    } else if (Lastsastatustracker[0].pst_response == '4') {
                                        element.sa_status = 'UNREACHABLE';
                                        element.sastatuscolor = '#1eadc3';
                                    } else {
                                        element.sa_status = 'COMPLETED';
                                        element.sastatuscolor = '#28a745';
                                    }
                                } else if (
                                    Lastsastatustracker &&
                                    Lastsastatustracker.length > 0 &&
                                    Lastsastatustracker[0].pst_response == '0' &&
                                    Lastsastatustracker[0].pst_psf_status == '4'
                                ) {
                                    element.lastsa_response = 'CLOSED INCOMPLETE';
                                    element.sacolor = '#ff0000';
                                    element.sa_status = 'COMPLETED';
                                    element.sastatuscolor = '#28a745';
                                } else {
                                    element.lastsa_response = 'PENDING';
                                    element.sacolor = '#ff0000';
                                    element.sa_status = 'PENDING';
                                    element.sastatuscolor = '#ffc107';
                                }
                                let Lastcrestatustracker = element.psf_calls.filter((pst_sourceid: any) => pst_sourceid.pst_sourceid == '19');

                                if (Lastcrestatustracker && Lastcrestatustracker.length > 0 && Lastcrestatustracker[0].rm_name) {
                                    element.lastcre_response = Lastcrestatustracker[0].rm_name;
                                    if (Lastcrestatustracker[0].rm_id == '1') {
                                        element.crecolor = '#006400';
                                    } else if (Lastcrestatustracker[0].rm_id == '2') {
                                        element.crecolor = '#4C9A2A';
                                    } else if (Lastcrestatustracker[0].rm_id == '3') {
                                        element.crecolor = '#68BB59';
                                    } else if (Lastcrestatustracker[0].rm_id == '4') {
                                        element.crecolor = '#FFA500';
                                    } else if (Lastcrestatustracker[0].rm_id == '5') {
                                        element.crecolor = '#FF0000';
                                    } else {
                                        element.crecolor = '#0c42f5';
                                    }
                                    if (Lastcrestatustracker[0].pst_psf_status == '2') {
                                        element.cre_status = 'OPEN';
                                        element.crestatuscolor = '#6c757d';
                                    } else if (Lastcrestatustracker[0].pst_psf_status == '6') {
                                        element.cre_status = 'PENDING';
                                        element.crestatuscolor = '#ffc107';
                                    } else if (Lastcrestatustracker[0].pst_psf_status == '8') {
                                        element.cre_status = 'TRANSFERRED';
                                        element.crestatuscolor = '#6b51d5';
                                    } else if (Lastcrestatustracker[0].pst_psf_status == '15') {
                                        element.cre_status = 'REVISIT';
                                        element.crestatuscolor = '#194a7c';
                                    } else if (Lastcrestatustracker[0].pst_psf_status == '18' && Lastcrestatustracker[0].pst_response == '6') {
                                        element.cre_status = 'CLOSED';
                                        element.crestatuscolor = '#9a7c1f';
                                    } else if (Lastcrestatustracker[0].pst_response == '4') {
                                        element.cre_status = 'UNREACHABLE';
                                        element.crestatuscolor = '#1eadc3';
                                    } else {
                                        element.cre_status = 'COMPLETED';
                                        element.crestatuscolor = '#28a745';
                                    }
                                } else {
                                    element.lastcre_response = 'PENDING';
                                    element.crecolor = '#ff0000';
                                    element.cre_status = 'PENDING';
                                    element.crestatuscolor = '#ffc107';
                                }
                                if (parseInt(element.psfm_num_of_attempts) > 0) {
                                    if (element.psfm_lastresponse == '4' || element.psfm_lastresponse == '10') {
                                        element.expired = true;
                                        this.userpsf_details.expired = this.userpsf_details.expired + 1;
                                    }
                                    if ((element.psfm_lastresponse == '2' || element.psfm_lastresponse == '7') && element.psf_calls[0].pst_response == '1') {
                                        element.ext_satisfied = true;
                                        this.userpsf_details.ext_satisfied = this.userpsf_details.ext_satisfied + 1;
                                    }
                                    if ((element.psfm_lastresponse == '2' || element.psfm_lastresponse == '7') && element.psf_calls[0].pst_response == '2') {
                                        element.fairlyHappy_psf_calls = true;
                                        this.userpsf_details.fairlyHappy_psf_calls = this.userpsf_details.fairlyHappy_psf_calls + 1;
                                    }
                                    if (
                                        (element.psfm_lastresponse == '2' || element.psfm_lastresponse == '7') &&
                                        element.psf_calls[0].psfm_lastresponse == '3'
                                    ) {
                                        element.happy_psf_calls = true;
                                        this.userpsf_details.happy_psf_calls = this.userpsf_details.happy_psf_calls + 1;
                                    }
                                    if (
                                        (element.psfm_lastresponse == '2' ||
                                            element.psfm_lastresponse == '7' ||
                                            element.psf_calls[0].pst_psf_status == '14' ||
                                            element.psf_calls[0].pst_psf_status == '15') &&
                                        element.psf_calls[0].pst_response == '5'
                                    ) {
                                        element.dis_satisfied = true;
                                        this.userpsf_details.dissatisfied_psf_calls = this.userpsf_details.dissatisfied_psf_calls + 1;
                                    }
                                } else if (parseInt(element.psfm_num_of_attempts) == 0) {
                                    this.userpsf_details.pending_psf_calls = this.userpsf_details.pending_psf_calls + 1;
                                    if (element.psf_calls[0].pst_psf_status == '4' || element.psf_calls[0].pst_psf_status == '10') {
                                        element.expired_psf_calls = true;
                                        this.userpsf_details.expired_psf_calls = this.userpsf_details.expired_psf_calls + 1;
                                        this.userpsf_details.expired_psf_calls_non_attempt = this.userpsf_details.expired_psf_calls_non_attempt + 1;
                                    } else {
                                        element.not_expired_pending = true;
                                        this.userpsf_details.not_expired_pending = this.userpsf_details.not_expired_pending + 1;
                                    }
                                }
                            } else {
                                element.dissatisfiedFlag = true;
                            }
                        });
                        this.userpsf_details.user_psf_calls = this.userpsf_details.user_psf_calls.filter(
                            ({ dissatisfiedFlag }: { dissatisfiedFlag: boolean }) => !dissatisfiedFlag
                        );
                    }
                    this.load_flag = false;
                } else {
                    this.load_flag = false;
                }
            });
        }
    }

    SearchFilter(value: any) {
        console.log(value);
        this.searchtype = value;
        this.getUserPSFcallReport();
    }

    getPsfCallList(psf_master_id: any) {
        this.oldCallData = [];
        this.userServices.get_PSFrecord_info({ psf_id: psf_master_id }).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.oldCallData = [];
                rdata.psf_info.psf_history.forEach((element: any) => {
                    let callItemData = {
                        call_date: element.psf_call_date,
                        call_response: element.psf_response,
                        call_reason: element.psf_reason,
                        call_response_text: element.rm_name,
                        call_action: element.psf_action,
                        call_reason_text: element.psfr_name,
                        call_remark: element.psf_remark,
                        call_rating: rdata.psf_info.psfm_sa_rating,
                        call_disabled: 0,
                        show_reason: element.psf_response == '4' || element.psf_response == '5' ? true : false,
                        show_rating: element.psf_response == '1' ? true : false,
                        show_action: element.psf_response == '5' ? true : false,
                        us_firstname: element.us_firstname,
                        call_transfer_to: '0',
                        cus_name: rdata.psf_info.cus_name,
                        psfm_job_no: rdata.psf_info.psfm_job_no,
                    };
                    this.oldCallData.push(callItemData);
                });
                if (this.oldCallData) {
                    this.openCallHistory();
                    console.log("oldcalldata>>>",this.oldCallData)
                    // this.dialogService
                    //   .open(PsfCallHistoryComponent, {
                    //     context: {
                    //       psf_call_history: this.oldCallData,
                    //     },
                    //     closeOnBackdropClick: false,
                    //   })
                    //   .onClose.subscribe((data) => {
                    //     this.oldCallData = [];
                    //   });
                }
            } else {
                //this.showToast("danger", "Error!!!", "Records not found");
            }
        });
    }

    openCallHistory() {
        this.psfcallhistory.open();
    }

    psfcallhistoryModal() {
        this.psfcallhistory.close();
    }
}
