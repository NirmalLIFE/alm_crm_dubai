import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
    selector: 'app-user-psf-report',
    templateUrl: './user-psf-report.component.html',
    styleUrls: ['./user-psf-report.component.css'],
})
export class UserPsfReportComponent implements OnInit {
    public search: string = '';
    public load_flag: boolean = true;
    psf_user_id: any;
    startDate: any;
    endDate: any;
    usertype: any;
    us_lab_id:any;

    userpsf_details: any;
    temp_userpsf_details: any[] = [];
    oldCallData: any[] = [];
    callData: any[] = [];
    psfsagraph: any[] = [];

    donutChart: any = [];

    @ViewChild('psfcallhistory') psfcallhistory: any;

    public cols = [
        { field: 'customer_name', title: 'Customer' },
        { field: 'phone', title: 'Phone Number' },
        { field: 'psfm_job_no', title: 'Job No' },
        { field: 'psfm_reg_no', title: 'Reg No' },
        { field: 'psfm_invoice_date', title: 'Inv. Date' },
        { field: 'psfm_psf_assign_date', title: 'PSF Assign Date' },
        { field: 'attempt_count', title: 'Attempts' },
        { field: 'lastsa_response', title: 'Last SA Response' },
        { field: 'lastcre_response', title: 'Last CRE Response' },
        { field: 'psfm_sa_rating', title: 'SA Rating' },
        { field: 'psfm_cre_rating', title: 'CRE Rating' },
        { field: 'sa_status', title: 'Current Status SA' },
        { field: 'cre_status', title: 'Current Status CRE' },
        { field: 'Action', title: 'Action' },
    ];

    constructor(private activeRouter: ActivatedRoute, private userServices: StaffPostAuthService) {}

    ngOnInit(): void {
        
        this.psf_user_id = this.activeRouter.snapshot.queryParamMap.get("id");
        this.startDate = this.activeRouter.snapshot.queryParamMap.get("sDate");
        this.endDate = this.activeRouter.snapshot.queryParamMap.get("eDate");
        this.usertype = this.activeRouter.snapshot.queryParamMap.get("usertype");
        this.us_lab_id=this.activeRouter.snapshot.queryParamMap.get("us_laabs_id");
        this.getUserPSFcallReport();
    }

    graph(){
        this.donutChart = {
            series: [this.psfsagraph[0].value, this.psfsagraph[1].value, this.psfsagraph[2].value,this.psfsagraph[3].value],
            chart: {
                height: 300,
                type: 'donut',
                zoom: {
                    enabled: false,
                },
                toolbar: {
                    show: false,
                },
            },
            stroke: {
                show: false,
            },
            
            labels: [this.psfsagraph[0].name, this.psfsagraph[1].name, this.psfsagraph[2].name,this.psfsagraph[3].name],
            colors: ['#ff0000', '#805dca', '#ffa500','#1acb1a'],
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: 200,
                        },
                    },
                },
            ],
            legend: {
                position: 'bottom',
            },
        };
    }
    

    getUserPSFcallReport() {
        this.psfsagraph = [];
        let data = {
            user_id: this.psf_user_id,
            startDate: this.startDate,
            endDate: this.endDate,
            usertype: this.usertype,
            us_laabs_id:this.us_lab_id,
        };
        this.userServices.getPSFUserCallReportData(data).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.userpsf_details = rData.user_psfdetails;
                this.userpsf_details.expired_psf_calls_attempt = 0;
                this.userpsf_details.ext_satisfied = 0;
                this.userpsf_details.fairlyHappy_psf_calls = 0;
                this.userpsf_details.happy_psf_calls = 0;
                this.userpsf_details.dissatisfied_psf_calls = 0;
                this.userpsf_details.pending_psf_calls = 0;
                this.userpsf_details.expired_psf_calls = 0;
                this.userpsf_details.expired_psf_calls_non_attempt = 0;
                this.userpsf_details.not_expired_pending = 0;
                this.userpsf_details.non_contactable = 0;
                this.userpsf_details.incomplete_calls = 0;
                this.userpsf_details.contacted = 0;
                this.userpsf_details.total_psf_calls = 0;
                this.userpsf_details.total_calls = 0;
                this.userpsf_details.total_psf_calls = this.userpsf_details.user_psf_calls.length;
                this.userpsf_details.total_psf_calls_exculded=0;
                this.userpsf_details.user_psf_calls.forEach((element: any) => {
                    element.expired = false;
                    element.ext_satisfied = false;
                    element.fairlyHappy_psf_calls = false;
                    element.happy_psf_calls = false;
                    element.dis_satisfied = false;
                    element.expired_psf_calls = true;
                    element.not_expired_pending = true;

                    element.psf_calls.forEach((element2: any) => {
                        const date = element2.pst_created_on.split(' ');
                        element.psf_created_date = date[0];
                    });

                    let Lastsastatustracker = element.psf_calls.filter((pst_psf_call_type: any) => pst_psf_call_type.pst_psf_call_type != '1');

                    if (atob(atob(this.usertype)) != '9') {
                        element.attempt_count = Lastsastatustracker.filter((pst_response: any) => pst_response.pst_response != '0').length;
                    }

                    //let attempts = Lastsastatustracker.filter(({ pst_response }) => pst_response != '0');
                    //element.sa_attempts=attempts.length;
                    if (Lastsastatustracker && Lastsastatustracker.length > 0 && Lastsastatustracker[0].rm_name) {
                        element.lastsa_response = Lastsastatustracker[0].rm_name;
                        if (Lastsastatustracker[0].rm_id == '1') {
                            this.userpsf_details.ext_satisfied = this.userpsf_details.ext_satisfied + 1;
                            element.sacolor = '#006400';
                        } else if (Lastsastatustracker[0].rm_id == '2') {
                            this.userpsf_details.fairlyHappy_psf_calls = this.userpsf_details.fairlyHappy_psf_calls + 1;
                            element.sacolor = '#4C9A2A';
                        } else if (Lastsastatustracker[0].rm_id == '3') {
                            this.userpsf_details.happy_psf_calls = this.userpsf_details.happy_psf_calls + 1;
                            element.sacolor = '#68BB59';
                        } else if (Lastsastatustracker[0].rm_id == '4') {
                            element.sacolor = '#FFA500';
                        } else if (Lastsastatustracker[0].rm_id == '5') {
                            this.userpsf_details.dissatisfied_psf_calls = this.userpsf_details.dissatisfied_psf_calls + 1;
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
                        } else if (
                            Lastsastatustracker[0].pst_psf_status == '2' ||
                            Lastsastatustracker[0].pst_psf_status == '7' ||
                            Lastsastatustracker[0].pst_psf_status == '12' ||
                            Lastsastatustracker[0].pst_psf_status == '13' ||
                            Lastsastatustracker[0].pst_psf_status == '16' || 
                            Lastsastatustracker[0].pst_psf_status == '20' ||
                            (Lastsastatustracker[0].pst_psf_status == '14' && Lastsastatustracker[0].pst_response == '8')
                        ) {
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
                    } else if (
                        Lastsastatustracker &&
                        Lastsastatustracker.length > 0 &&
                        Lastsastatustracker[0].pst_response == '0' &&
                        Lastsastatustracker[0].pst_psf_status == '19'
                    ) {
                        element.lastsa_response = 'PENDING';
                        element.sacolor = '#ff0000';
                        element.sa_status = 'WIP';
                        element.sastatuscolor = '#2ad25c';
                    } else {
                        element.lastsa_response = 'PENDING';
                        element.sacolor = '#ff0000';
                        element.sa_status = 'PENDING';
                        element.sastatuscolor = '#ffc107';
                    }
                    if (Lastsastatustracker && Lastsastatustracker.length > 0) {
                        if (
                            Lastsastatustracker[0].pst_psf_status == '12' ||
                            Lastsastatustracker[0].pst_psf_status == '13' ||
                            (element.attempt_count == 3 && Lastsastatustracker[0].pst_response == '4') ||
                            (Lastsastatustracker[0].pst_psf_status == '14' && Lastsastatustracker[0].pst_response == '8')
                        ) {
                            this.userpsf_details.non_contactable = this.userpsf_details.non_contactable + 1;
                        }
                        if (
                            (element.attempt_count == '0' && Lastsastatustracker[0].pst_psf_status != '4') ||
                            (element.attempt_count == '1' && (Lastsastatustracker[0].pst_psf_status == '0' || Lastsastatustracker[0].pst_psf_status == '1')) ||
                            (element.attempt_count == '2' && (Lastsastatustracker[0].pst_psf_status == '0' || Lastsastatustracker[0].pst_psf_status == '1'))
                        ) {
                            this.userpsf_details.incomplete_calls = this.userpsf_details.incomplete_calls + 1;
                        }
                        if (Lastsastatustracker[0].pst_psf_status == '4') {
                            this.userpsf_details.expired_psf_calls = this.userpsf_details.expired_psf_calls + 1;
                        }
                    }
                    // if(element.attempt_count == "0" && Lastsastatustracker[0].pst_psf_status == "4" ){
                    //   this.userpsf_details.expired_psf_calls_non_attempt=this.userpsf_details.expired_psf_calls_non_attempt+1;
                    // }
                    console.log("last sa status tracker",Lastsastatustracker)

                    let Lastcrestatustracker = element.psf_calls.filter((pst_psf_call_type: any) => pst_psf_call_type.pst_psf_call_type == '1');
                    //let cre_attempts = Lastcrestatustracker.filter(({ pst_response }) => pst_response != '0');
                    //element.cre_attempts=cre_attempts.length;
                    if (atob(atob(this.usertype)) == '9')
                        element.attempt_count = element.psf_calls.filter(
                            (pst_sourceid: any, pst_response: any) => pst_sourceid.pst_sourceid == '19' && pst_response.pst_response != '0'
                        ).length;
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
                        } else if (Lastcrestatustracker[0].pst_psf_status == '15') {
                            element.cre_status = 'REVISIT';
                            element.crestatuscolor = '#194a7c';
                        } else if (Lastcrestatustracker[0].pst_psf_status == '18' && Lastcrestatustracker[0].pst_response == '6') {
                            element.cre_status = 'CLOSED';
                            element.crestatuscolor = '#9a7c1f';
                        } else if (Lastcrestatustracker[0].pst_response == '4') {
                            element.cre_status = 'UNREACHABLE';
                            element.crestatuscolor = '#1eadc3';
                        } else if (
                            Lastcrestatustracker[0].pst_psf_status == '7' ||
                            Lastcrestatustracker[0].pst_psf_status == '12' ||
                            Lastcrestatustracker[0].pst_psf_status == '13' ||
                            Lastcrestatustracker[0].pst_psf_status == '17' ||
                            (Lastcrestatustracker[0].pst_psf_status == '14' && Lastcrestatustracker[0].pst_response == '8')
                        ) {
                            element.cre_status = 'COMPLETED';
                            element.crestatuscolor = '#28a745';
                        } else if (Lastcrestatustracker[0].pst_psf_status == '6') {
                            element.cre_status = 'PENDING';
                            element.crestatuscolor = '#ffc107';
                        }
                    } else if (
                        Lastcrestatustracker &&
                        Lastcrestatustracker.length > 0 &&
                        Lastcrestatustracker[0].pst_response == '0' &&
                        Lastcrestatustracker[0].pst_psf_status == '10'
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
                });
                this.userpsf_details.user_psf_calls.forEach((element: any) => {
                    if(element.sa_status ==='WIP'){
                        this.userpsf_details.total_psf_calls_exculded= this.userpsf_details.total_psf_calls_exculded+1;
                    }
                });
                if( this.userpsf_details.total_psf_calls!=0){
                this.userpsf_details.total_calls= this.userpsf_details.total_psf_calls-this.userpsf_details.total_psf_calls_exculded;
                }
                console.log("this.userpsf_details.user_psf_calls??????????",this.userpsf_details.user_psf_calls)
                console.log("this.userpsf_details??????????",this.userpsf_details)

                this.psfsagraph.push(
                    {
                        value: this.userpsf_details.expired_psf_calls,
                        name: 'Total Expired Calls',
                    },
                    {
                        value: this.userpsf_details.non_contactable,
                        name: 'Total Non Contactable calls',
                    },
                    {
                        value: this.userpsf_details.incomplete_calls,
                        name: 'Total Incomplete Calls',
                    },
                    {
                        value:
                            parseFloat(this.userpsf_details.ext_satisfied) +
                            parseFloat(this.userpsf_details.fairlyHappy_psf_calls) +
                            parseFloat(this.userpsf_details.happy_psf_calls) +
                            parseFloat(this.userpsf_details.dissatisfied_psf_calls),
                        name: 'Total Contacted Calls',
                    }
                );
                if(this.psfsagraph){
                    console.log("psfsagraph",this.psfsagraph)
                    this.graph();
                }
                this.temp_userpsf_details = this.userpsf_details;
                this.load_flag=false;
            }else{

            }
        });
    }
    getPsfCallList(psf_master_id: any) {
        this.userServices.get_PSFrecord_info({ psf_id: psf_master_id }).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.oldCallData = [];
                rdata.psf_info.psf_history.forEach((element: any) => {
                    if (rdata.psf_info.psfm_psf_assign_date <= element.psf_call_date) {
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
                    }
                });
                if (this.oldCallData) {
                    this.openCallHistory();
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
