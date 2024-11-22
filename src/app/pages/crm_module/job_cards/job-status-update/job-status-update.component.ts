import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { colDef } from '@bhplugin/ng-datatable';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-job-status-update',
    templateUrl: './job-status-update.component.html',
    styleUrls: ['./job-status-update.component.css'],
})
export class JobStatusUpdateComponent implements OnInit {
    public search = '';
    public thirtyDaysBeforeTimestamp = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
    public start_date: string = this.datePipe.transform(new Date(this.thirtyDaysBeforeTimestamp), 'yyyy-MM-dd') || '';
    public end_date: string = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
    public load_flag: boolean = true;
    public jobData: any[] = [];
    public jobDataMaster: any[] = [];
    public jobMinutes: any;
    public categorizedJobs: any = {
        totalJobs:[],
        openedJobs:[],
        wipJobs:[],
        tskFlag:true,
        taskCompJobs:[],
        closedJobs:[],
        completedJobs:[],
        qcJobs:[]
    };
    public selected = 0;
    public selectedJob: any = {};
    @ViewChild('modal2') jobHistory: any;
    public jobHistoryLoad: boolean = true;
    userlist: any[] = [];
    selectedSA: any = '0';
    selectedSubStatus: any = '0';
    selectedStatus: any = '0';
    subStatusList: any = [];
    public user_role: any = atob(atob(localStorage.getItem('us_role_id') || '{}'));
    public wip_jobs:any[]=[];
    public taskCompletedJobs:any=[];
    public resetFlag:boolean=false;
    public taskLoadFlag:boolean=false;
    public activeTab="opened"

    public cols = [
        { field: 'job_no', title: 'Job Number', isUnique: true,cellClass:"tinyCell" },
        { field: 'customer_name', title: 'Customer Name', isUnique: false,cellClass:"tinyCell" },
        { field: 'car_reg_no', title: 'Register No.', isUnique: false,cellClass:"tinyCell" },
        // { field: 'job_status', title: 'Job Status', isUnique: false,cellClass:"tinyCell" },
        { field: 'jb_sub_status', title: 'Sub Status', isUnique: false,cellClass:"tinyCell" },
        { field: 'user_name', title: 'Advisor', isUnique: false,cellClass:"tinyCell" },
        { field: 'job_open_date', title: 'Job Open', isUnique: false,cellClass:"tinyCell" },
        { field: 'promised_date', title: 'Promised', isUnique: false,cellClass:"tinyCell" },
        { field: 'extended_promise_date', title: 'Ext. Promised', isUnique: false,cellClass:"tinyCell" },
        // { field: 'speedometer_reading', title: 'Odometer', isUnique: false,cellClass:"tinyCell" },
        { field: 'action', title: 'Action',cellClass:"tinyCell" },
    ];

    public statusMap: { [key: string]: any[] } = {
        OPN: [],
        WIP: [],
        TST: [],
        SUS: [],
        COM: [],
        CAN: [],
        CLO: [],
        INV: [],
    };

    constructor(public datePipe: DatePipe, private userServices: StaffPostAuthService) {
        this.userServices.userList().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.userlist = rdata.userList.filter((item: any) => item.us_laabs_id !== null);
            }
        });
    }

    ngOnInit(): void {
        this.getJobCardsData();
        this.userServices.getSubStatus().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.subStatusList = rData.status_list;
                const restrictRoles = ['18', '19', '20'];

                rData.status_list.forEach((element: any) => {
                    const status = element.jbs_master_status;
                    const userRole = this.user_role;
                    const statusId = element.jbs_status_id;
                    if (status === 'WIP') {
                        if (userRole === '11') {
                            if (statusId !== '11' && statusId !== '12' && statusId !== '6') {
                                element.isDisbaled = true;
                            } else {
                                element.isDisbaled = false;
                            }
                        } else if (restrictRoles.includes(userRole)) {
                            if (statusId === '11' || statusId === '12' || statusId === '6') {
                                element.isDisbaled = true;
                            } else {
                                element.isDisbaled = false;
                            }
                        }
                    }
                    if (!this.statusMap.hasOwnProperty(status)) {
                        this.statusMap[status] = [];
                    }
                    this.statusMap[status].push(element);
                });
            }
        });
    }

    updateColumn(col: colDef) {
        col.hide = !col.hide;
        this.cols = [...this.cols]; // Create a new reference of the array
    }

    checkCompletedTasks(){
        this.userServices.getWIPTaskStatus({"jobs":this.wip_jobs}).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                let oldTskCompltd=atob(localStorage.getItem("task_job")||"");
                let oldWip=atob(localStorage.getItem("wipJobs")||"");
                this.categorizedJobs.taskCompJobs=rData.job_data.filter((element: any) => parseInt(element.task_count) == 0);
                this.categorizedJobs.wipJobs=rData.job_data.filter((element: any) => parseInt(element.task_count) != 0);
                localStorage.setItem("task_job",btoa(JSON.stringify(this.categorizedJobs.taskCompJobs)));
                localStorage.setItem("wipJobs",btoa(JSON.stringify(this.categorizedJobs.wipJobs)));
                this.categorizedJobs.tskFlag=false;
                if(this.categorizedJobs.taskCompJobs.length>0){
                    this.categorizedJobs.taskCompJobs.forEach((element:any) => {
                        if(JSON.parse(oldTskCompltd).some((obj:any) => obj.job_no === element.job_no)){
                            element.status_change=false;
                        }else{
                            element.status_change=true;
                        }
                    });
                }
                if(this.categorizedJobs.wipJobs.length>0){
                    this.categorizedJobs.wipJobs.forEach((element:any) => {
                        if(JSON.parse(oldWip).some((obj:any) => obj.job_no === element.job_no)){
                            element.status_change=false;
                        }else{
                            element.status_change=true;
                        }
                    });
                }
                
            }else{
                this.categorizedJobs.tskFlag=false;
            }
        });
    }
    filterSubStatus(type:Number){
        if(type==1){
            
        }
    }

    getJobCardsData() {
        this.load_flag = true;
        this.categorizedJobs.totalJobs=[];
        this.categorizedJobs.wipJobs=[];
        this.categorizedJobs.taskCompJobs=[];
        this.categorizedJobs.closedJobs=[];
        this.categorizedJobs.completedJobs=[];
        this.categorizedJobs.openedJobs=[];
        this.categorizedJobs.qcJobs=[];
        this.categorizedJobs.tskFlag=true;

        let data = {
            selectedSA: 0,
            selectedSubStatus: 0,
            selectedStatus: 0,
        };

        this.userServices.getAllJobCardStatus(data).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.jobData = rData.customers;
                //this.totalCount.totalCustomers = this.jobData.length;
                this.categorizedJobs.totalJobs= rData.customers;
                this.wip_jobs=this.jobData.filter((element: any) => element.job_status == "WIP");
                this.categorizedJobs.closedJobs=this.jobData.filter((element: any) => element.job_status == "CLO");
                this.categorizedJobs.completedJobs=this.jobData.filter((element: any) => element.job_status == "COM");
                this.categorizedJobs.qcJobs=this.jobData.filter((element: any) => element.job_status == "TST");
                this.categorizedJobs.openedJobs=this.jobData.filter((element: any) => element.job_status == "OPN");
                this.load_flag = false;
                this.checkCompletedTasks();
            }
        });
    }

    updateSubStatus(data: any, value: any) {
        if (data != '0') {
            let sendData = {
                job_no: value.job_no,
                job_sub_status: data,
                job_status: value.job_status,
            };
            this.userServices.updateJobSubStatus(sendData).subscribe((rData: any) => {
                if (rData.ret_data == 'success') {
                    this.coloredToast('success', 'Job Status Updated Successfully');
                }
            });
        } else {
            this.coloredToast('warning', 'Please select a proper sub status');
        }
    }

    viewStatusChangeHistory(data: any) {
        this.jobMinutes = '';
        this.selectedJob = {};
        this.jobHistoryLoad = true;
        this.jobHistory.open();
        this.userServices.getJobStusChangeHistory({ job_no: data.job_no }).subscribe((rData: any) => {
            this.selectedJob = data;
            this.selectedJob.list = rData.status_list;

            this.selectedJob.timediff = {
                Open_Start: '0',
                Open_Start_1: '0',
                Open_Start_2: '0',
                Inspection: '0',
                Repair: '0',
                Repair_1: '0',
                Diagnosing: '0',
                Estimation: '0',
                Estimation_1: '0',
                Estimation_2: '0',
                Approval: '0',
                Parts: '0',
                Sublet: '0',
                Road_Test: '0',
                Completed: '0',
                Closed: '0',
                Workshop_TAT_Open_QC: '0',
                Workshop_TAT_Open_Complete: '0',
                Workshop_TAT_Open_Invoice: '0',
                Front_office_TAT: '0',
            };

            if (this.selectedJob.job_status != '') {
                const conditions = [
                    { startStatus: { sub: 1, main: 'OPN' }, endStatus: { sub: 16, main: 'CLO' }, key: 'Workshop_TAT_Open_Complete' },
                    { startStatus: { sub: 1, main: 'OPN' }, endStatus: { sub: 17, main: 'INV' }, key: 'Workshop_TAT_Open_Invoice' },
                    { startStatus: { sub: 16, main: 'CLO' }, endStatus: { sub: 17, main: 'INV' }, key: 'Closed' },
                    { startStatus: { sub: 15, main: 'COM' }, endStatus: { sub: 16, main: 'CLO' }, key: 'Completed' },
                    { startStatus: { sub: 13, main: 'WIP' }, endStatus: { sub: 14, main: 'TST' }, key: 'Sublet' },
                    { startStatus: { sub: 12, main: 'WIP' }, endStatus: { sub: 7, main: 'WIP' }, key: 'Parts' },
                    { startStatus: { sub: 11, main: 'WIP' }, endStatus: { sub: 12, main: 'WIP' }, key: 'Approval' },
                    { startStatus: { sub: 4, main: 'WIP' }, endStatus: { sub: 11, main: 'WIP' }, key: 'Estimation' },
                    { startStatus: { sub: 6, main: 'WIP' }, endStatus: { sub: 11, main: 'WIP' }, key: 'Estimation_1' },
                    { startStatus: { sub: 10, main: 'WIP' }, endStatus: { sub: 11, main: 'WIP' }, key: 'Estimation_2' },
                    { startStatus: { sub: 5, main: 'WIP' }, endStatus: { sub: 6, main: 'WIP' }, key: 'Diagnosing' },
                    { startStatus: { sub: 5, main: 'WIP' }, endStatus: { sub: 6, main: 'WIP' }, key: 'Repair' },
                    { startStatus: { sub: 7, main: 'WIP' }, endStatus: { sub: 8, main: 'WIP' }, key: 'Repair_1' },
                    { startStatus: { sub: 3, main: 'WIP' }, endStatus: { sub: 4, main: 'WIP' }, key: 'Inspection' },
                    { startStatus: { sub: 1, main: 'OPN' }, endStatus: { sub: 3, main: 'WIP' }, key: 'Open_Start' },
                    { startStatus: { sub: 1, main: 'OPN' }, endStatus: { sub: 5, main: 'WIP' }, key: 'Open_Start_1' },
                    { startStatus: { sub: 1, main: 'OPN' }, endStatus: { sub: 9, main: 'WIP' }, key: 'Open_Start_2' },
                    { startStatus: { sub: 14, main: 'TST' }, endStatus: { sub: 15, main: 'COM' }, key: 'Road_Test' },
                    { startStatus: { sub: 1, main: 'OPN' }, endStatus: { sub: 15, main: 'COM' }, key: 'Workshop_TAT_Open_QC' },
                ];

                conditions.forEach((condition) => {
                    const startItem = this.selectedJob.list.find(
                        (d: any) => d.jbsc_sub_status == condition.startStatus.sub && d.jbsc_main_status == condition.startStatus.main
                    );
                    const endItem = this.selectedJob.list.find(
                        (d: any) => d.jbsc_sub_status == condition.endStatus.sub && d.jbsc_main_status == condition.endStatus.main
                    );

                    if (startItem && endItem) {
                        let startTime = new Date(startItem.jbsc_updated_on);
                        let endTime = new Date(endItem.jbsc_updated_on);
                        // this.selectedJob.timediff[condition.key] = this.calculateTimeDiff(startTime, endTime) + ' hours';
                        let timeDiff = this.calculateFilteredTimeDiff(startTime, endTime);
                        if (timeDiff < 1) {
                            this.selectedJob.timediff[condition.key] = Math.round(timeDiff * 60) + ' minutes';
                        } else {
                            this.selectedJob.timediff[condition.key] = Math.round(timeDiff * 100) / 100 + ' hours';
                        }
                    }
                });

                const Front_office_TAT1 = this.selectedJob.list.find((d: any) => d.jbsc_sub_status == 10 && d.jbsc_main_status == 'WIP');
                const Front_office_TAT1_end = this.selectedJob.list.find((d: any) => d.jbsc_sub_status == 11 && d.jbsc_main_status == 'WIP');
                const Front_office_TAT2 = this.selectedJob.list.find((d: any) => d.jbsc_sub_status == 12 && d.jbsc_main_status == 'WIP');
                const Front_office_TAT3 = this.selectedJob.list.find((d: any) => d.jbsc_sub_status == 13 && d.jbsc_main_status == 'WIP');
                const Front_office_TAT4 = this.selectedJob.list.find((d: any) => d.jbsc_sub_status == 15 && d.jbsc_main_status == 'COM');
                const Front_office_TAT4_end = this.selectedJob.list.find((d: any) => d.jbsc_sub_status == 17 && d.jbsc_main_status == 'INV');

                if (Front_office_TAT1 && Front_office_TAT1_end && Front_office_TAT2 && Front_office_TAT3 && Front_office_TAT4 && Front_office_TAT4_end) {
                    let totalHours_TAT1 = this.calculateFilteredTimeDiff(new Date(Front_office_TAT1.jbsc_updated_on), new Date(Front_office_TAT1_end.jbsc_updated_on));
                    let totalHours_TAT2 = this.calculateFilteredTimeDiff(new Date(Front_office_TAT1_end.jbsc_updated_on), new Date(Front_office_TAT2.jbsc_updated_on));
                    let totalHours_TAT3 = this.calculateFilteredTimeDiff(new Date(Front_office_TAT2.jbsc_updated_on), new Date(Front_office_TAT3.jbsc_updated_on));
                    let totalHours_TAT4 = this.calculateFilteredTimeDiff(new Date(Front_office_TAT4.jbsc_updated_on), new Date(Front_office_TAT4_end.jbsc_updated_on));
                    let totalHours = totalHours_TAT1 + totalHours_TAT2 + totalHours_TAT3 + totalHours_TAT4;
                    //this.selectedJob.timediff.Front_office_TAT = totalHours + ' hours';
                    if (totalHours < 1) {
                        this.selectedJob.timediff.Front_office_TAT = Math.round(totalHours * 60) + ' minutes';
                    } else {
                        this.selectedJob.timediff.Front_office_TAT = Math.round(totalHours * 100) / 100 + ' hours';
                    }
                }
            }

            this.jobHistoryLoad = false;
        });
    }

    calculateTimeDiff(startTime: Date, endTime: Date): number {
        let timeDiff = endTime.getTime() - startTime.getTime();
        let totalMinutes = Math.round(timeDiff / (1000 * 60));
        let totalHours = totalMinutes / 60;
        return totalHours;
    }
    calculateFilteredTimeDiff(startTime: Date, endTime: Date): number {
        const startHour = 8;  // 8 AM
        const endHour = 20;   // 8 PM
    
        let totalHours = 0;
        let current = new Date(startTime.getTime());
    
        while (current < endTime) {
            let nextHour = new Date(current.getTime());
            nextHour.setHours(current.getHours() + 1);
            if (current.getHours() >= startHour && current.getHours() < endHour) {
                totalHours += Math.min((nextHour.getTime() - current.getTime()) / 60000, (endTime.getTime() - current.getTime()) / 60000);
            }
            current = nextHour;
        }
        
        return totalHours / 60; // convert minutes to hours
    }

    hasNonZeroTimediff(): boolean {
        return Object.values(this.selectedJob.timediff).some((value) => value !== '0');
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
