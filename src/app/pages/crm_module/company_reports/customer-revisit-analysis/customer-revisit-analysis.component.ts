import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { colDef } from '@bhplugin/ng-datatable';
import { log } from 'console';
import { start } from 'repl';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';

@Component({
  selector: 'app-customer-revisit-analysis',
  templateUrl: './customer-revisit-analysis.component.html',
  styleUrls: ['./customer-revisit-analysis.component.css']
})
export class CustomerRevisitAnalysisComponent implements OnInit {

  public search: string = '';
  public start_date: string = this.datePipe.transform(new Date(), "yyyy-MM-dd") || '';
  public end_date: string = this.datePipe.transform(new Date(), "yyyy-MM-dd") || '';
  public load_flag: boolean = true;
  public jobData: any[] = [];
  public jobData1: any[] = [];
  public jobDataMaster: any[] = [];
  public totalCount: any = {
    totalJobs:0,
    totalCustomers: 0,
    newCustomers: 0,
    regularCustomers: 0,
    lostCustomers: 0
  }
  public prevtotalCount: any = {
    totalJobs:0,
    totalCustomers: 0,
    newCustomers: 0,
    regularCustomers: 0,
    lostCustomers: 0
  }

  filterOptions = [
    { id: 1, name: 'Equal To' },
    { id: 2, name: 'Greater than' },
    { id: 3, name: 'Less Than' },
    { id: 4, name: 'Between' }
  ];

  public selected = 0;
  public historyJobData:any[] = [];

  public filter_num_selcetd:any = 4;
  public filter_value_1 :any;
  public filter_value_2 :any;
  public loadflag_prev_year:boolean = true;
  public tab = 'rrvAnalysis';

  public minDate : any;

  public cols = [
    { field: 'job_no', title: 'Job Number', isUnique: true },
    { field: 'job_open_date', title: 'Job Open', isUnique: false },
    { field: 'customer_name', title: 'Customer Name', isUnique: false },
    { field: 'car_reg_no', title: 'Register No.', isUnique: false },
    { field: 'speedometer_reading', title: 'Odometer', isUnique: false },
    { field: 'job_status', title: 'Job Status', isUnique: false },
    { field: 'user_name', title: 'Advisor', isUnique: false },
    { field: 'old_jobcard.job_no', title: 'Previous Job-Number', isUnique: false },
    { field: 'old_jobcard.user_name', title: 'Previous Advisor', isUnique: false },
    { field: 'old_jobcard.invoice_date', title: 'Previous Inv. date', isUnique: false },
    { field: 'old_jobcard.speedometer_reading', title: 'Previous Odometer', isUnique: false },
    { field: 'daysGap', title: 'Gap Days', isUnique: false },
    { field: 'cust_type', title: 'Customer Type', isUnique: false },
  ]

  constructor(public datePipe: DatePipe, private userServices: StaffPostAuthService,) {

  }

  ngOnInit(): void {
      //Date selction 
      let tempdate = new Date();
      let month = tempdate.getMonth();
      let year = tempdate.getFullYear();
      let startDate = new Date(year, month, 1);
      this.start_date = this.datePipe.transform(startDate, "yyyy-MM-dd")||"";
      this.getJobCardsData();
      this.mindateDef();
  }
  updateColumn(col: colDef) {
    col.hide = !col.hide;
    this.cols = [...this.cols]; // Create a new reference of the array
  }

  mindateDef(){
    let today = new Date();
    let year = today.getFullYear();
    let date = new Date(year, 1 , 1);
    this.minDate = date.toISOString().split('T')[0];
    console.log("MInimum date for the calender", this.minDate);
  }
  getJobCardsData() {
    this.load_flag = true;
    this.totalCount.totalCustomers = 0;
    this.totalCount.newCustomers = 0;
    this.totalCount.regularCustomers = 0;
    this.totalCount.lostCustomers = 0;

    this.userServices.getJobCardsAgeData({ "start_date": this.start_date, "end_date": this.end_date }).subscribe((rData: any) => {
      if (rData.ret_data == 'success') {
        this.jobData = rData.customers;
        this.jobData1 =rData.job_cards;
      
        this.totalCount.totalJobs = this.jobData1.length;
        this.totalCount.totalCustomers = this.jobData.length;
        
        this.jobData1.forEach((element: any) => {
          if (element.old_jobcard != null) {
            element.daysGap = this.daysBetweenDates(new Date(element.job_open_date), new Date(element.old_jobcard.invoice_date));
            
            if (element.daysGap > 456) {
              element.cust_type = "Lost Customer";
           
            } else {
              element.cust_type = "Retained Customer";
           
            }

          } else {
            element.daysGap = 0;
            element.cust_type = "New Customer";
         
          }

        });

        this.jobData.forEach((element: any) => {
          if (element.old_jobcard != null) {
            element.daysGap = this.daysBetweenDates(new Date(element.job_open_date), new Date(element.old_jobcard.invoice_date));
            if (element.daysGap > 456) {
              element.cust_type = "Lost Customer";
              this.totalCount.lostCustomers++;
            } else {
              element.cust_type = "Retained Customer";
              this.totalCount.regularCustomers++;
            }
          } else {
            element.daysGap = 0;
            element.cust_type = "New Customer";
            this.totalCount.newCustomers++;
          }

        });
        this.jobDataMaster = this.jobData;
        this.prevYearJobCardsData()
        this.jobData = this.jobData1;
        
       

        this.load_flag = false;

      
      }
    });
  }

  prevYearJobCardsData() {
    this.loadflag_prev_year = true;
    this.prevtotalCount.totalCustomers = 0;
    this.prevtotalCount.newCustomers = 0;
    this.prevtotalCount.regularCustomers = 0;
    this.prevtotalCount.lostCustomers = 0;

    let start_date_year = Number(this.start_date.split("-")[0]) - 1;
    let start_date_month = Number(this.start_date.split("-")[1]);
    let start_date_day = Number(this.start_date.split("-")[2]);
    let StartDate = new Date(start_date_year, start_date_month, start_date_day)

    let end_date_year = Number(this.end_date.split("-")[0]) - 1;
    let end_date_month = Number(this.end_date.split("-")[1]);
    let end_date_day = Number(this.end_date.split("-")[2]);
    let EndDate = new Date(end_date_year, end_date_month, end_date_day)

    let historyStartDate = this.datePipe.transform(StartDate,"yyyy-MM-dd")
    let historyEndDate = this.datePipe.transform(EndDate,"yyyy-MM-dd")
    
    this.userServices.getJobCardsAgeData({ "start_date": historyStartDate, "end_date": historyEndDate }).subscribe((rData: any) => {
      if (rData.ret_data == 'success') {
        this.prevtotalCount.totalJobs = rData.job_cards.length;
        this.historyJobData = rData.customers;
        this.prevtotalCount.totalCustomers = this.historyJobData.length;
        this.historyJobData.forEach((element: any) => {
          if (element.old_jobcard != null) {
            element.daysGap = this.daysBetweenDates(new Date(element.job_open_date), new Date(element.old_jobcard.invoice_date));
            if (element.daysGap > 456) {
              this.prevtotalCount.lostCustomers++;
            } else {
              this.prevtotalCount.regularCustomers++;
            }
          } else {
            this.prevtotalCount.newCustomers++;
          }
        }); 
        this.loadflag_prev_year = false;
      }
    });
  }


  filterJobData(type: any) {
    console.log(type);
    if (type == 0) {
      this.jobData = this.jobDataMaster;
      this.selected = 0;
    } else if (type == 1) {
      this.jobData = this.jobDataMaster.filter((element: any) => element.cust_type == "New Customer");
      this.selected = 1;
    } else if (type == 2) {
      this.jobData = this.jobDataMaster.filter((element: any) => element.cust_type == "Retained Customer");
      this.selected = 2;
    } else if (type == 3) {
      this.jobData = this.jobDataMaster.filter((element: any) => element.cust_type == "Lost Customer");
      this.selected = 3;
    }
    else if (type == -1) {
      this.jobData = this.jobData1;
      this.selected = -1;
    }
  }
  daysBetweenDates(date1: Date, date2: Date): number {
    // Convert both dates to milliseconds
    const date1Ms = date1.getTime();
    const date2Ms = date2.getTime();
    const differenceMs = Math.abs(date1Ms - date2Ms);
    const differenceDays = Math.ceil(differenceMs / (1000 * 60 * 60 * 24));

    return differenceDays;
  }

  filtergapDays(){
    if(this.filter_value_1 && this.filter_num_selcetd){
      let tempjobData = [];
      if(this.filter_num_selcetd == '1'){
        console.log("Enterd Here 1"); 
        tempjobData = this.jobDataMaster.filter((data:any)=>{
          return data.daysGap == this.filter_value_1
         })
         console.log(tempjobData);
      } 

      if(this.filter_num_selcetd == '2'){
        console.log("Enterd Here 2");
        tempjobData = this.jobDataMaster.filter((data:any)=>{
          return data.daysGap > this.filter_value_1
         })
      }

      if(this.filter_num_selcetd == '3'){
        console.log("Enterd Here 3");
        tempjobData = this.jobDataMaster.filter((data:any)=>{
          return data.daysGap < this.filter_value_1
         })
         
      }

      this.jobData = tempjobData
      console.log("value and number",this.filter_num_selcetd,this.filter_value_1);
      console.log("JOB Data Master",this.jobData);
      console.log("filterd Data",tempjobData);
      
    }

    if(this.filter_value_1 && this.filter_value_2 && this.filter_num_selcetd == '4'){
      let tempjobData = this.jobDataMaster.filter((data:any)=>{
        return data.daysGap > this.filter_value_1 && data.daysGap < this.filter_value_2
       })

       this.jobData = tempjobData
    }
  }
}
