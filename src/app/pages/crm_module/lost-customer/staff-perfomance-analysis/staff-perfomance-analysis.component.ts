import { DatePipe } from '@angular/common';

import { Component } from '@angular/core';
import * as moment from 'moment';

import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';

interface FilterData {
  total_row: number;
  attempted_converted_count: number;
  nonattempted_converted_count: number;
  not_converted_count: number;
  attempted_call: number;
  not_attempted_call: number;
}

interface FilterOption {
  id: string;
  name: string;
  data: FilterData;
}
@Component({
  selector: 'app-staff-perfomance-analysis',
  templateUrl: './staff-perfomance-analysis.component.html',
  styleUrls: ['./staff-perfomance-analysis.component.css']
})


export class StaffPerfomanceAnalysisComponent  {
  public fileId: string = '';

  public dateFrom: any =this.datePipe.transform(moment(new Date()).startOf('month').toDate(), 'yyyy-MM-dd') || '';
  public dateTo: any =this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
  public assigned = 0;
  public source: any = '0';
  total_row: any = 0;
  converted_count: any = 0;
  attempted_converted_count: any = 0;
  nonattempted_converted_count: any = 0;
  not_converted_count: any = 0;
  not_attempted_call: any = 0;
  attempted_call: any = 0;
  public usersList: any[] = [];
  public alllist: any[] = [];
  out_temp: any[] = [];
 


  public filterOptions: FilterOption[] = [
    { id: '0', name: 'ALL', data: this.createEmptyFilterData() },
    { id: '1', name: 'Lost Customer', data: this.createEmptyFilterData() },
    { id: '2', name: 'Service Reminder', data: this.createEmptyFilterData() },
    { id: '3', name: 'Discontinued Customer', data: this.createEmptyFilterData() },
    { id: '4', name: 'Extended Warranty Customer', data: this.createEmptyFilterData() },
    { id: '5', name: 'Campaign Data', data: this.createEmptyFilterData() }
  ];
  constructor(public datePipe: DatePipe, private userServices: StaffPostAuthService,) {

  }

  ngOnInit(): void {
    this.fethchuser();
    this.fetchData();
  }

  createEmptyFilterData(): FilterData {
    return {
      total_row: 0,
      attempted_converted_count: 0,
      nonattempted_converted_count: 0,
      not_converted_count: 0,
      attempted_call: 0,
      not_attempted_call: 0
    };
  }


fethchuser(){
  this.userServices.userList().subscribe((rData: any) => {
    if (rData.ret_data == "success") {

      this.usersList = rData.userList;
     
    }
  });
}

  filterData(type:any){
  }

  // fetchData(){
   



  //   this.filterOptions.forEach(filter => {
  //     const fetchtype = filter.id;
      
  //     let data = {
  //       'assigned_to':this.assigned,
  //       'start_date':this.dateFrom,
  //       'date_to':this.dateTo,
  //       'fetchtype':fetchtype
        
  //      }
  //      var due_date;
  //  var start_date;
  //  due_date = moment(this.dateTo, 'DD/MM/YYYY').toDate();
  //  due_date = moment(due_date).format('YYYY-MM-DD');
  //  start_date = moment(this.dateFrom, 'DD/MM/YYYY').toDate();
  //  start_date = moment(start_date).format('YYYY-MM-DD');

  //  let dataOut = {
  //   call_type: 'Outbound',
  //   start_day:  start_date+ ' 00:00:00',
  //   end_day: due_date + ' 23:59:59',
  // }; 
  // this.userServices.getStaffPerformance(data).subscribe((rData: any) => {
  //   if (rData.ret_data == "success") {
  //     this.alllist = rData.data;
     
  //     this.userServices.getLatestCallReportData(dataOut).subscribe((rdata: any) => {
  //       let that = this;

  //       if (rdata.ret_data == 'success') {
  //           let outbound = rdata.call_data.filter((item: any) => item.src != '6300');
  //           this.out_temp = outbound.sort(function (a: any, b: any): any {
  //               return b.timestamp - a.timestamp;
  //           });


            
  //           this.alllist.map(function (x) {
  //               // x.phone_strip = '*****' + x.phone.substring(x.phone.length - 5);
  //               let status;
  //               var result = that.out_temp.filter((a1) => a1.dst.substring(a1.dst.length - 7) == x.phon_uniq);

  //               if (result.length > 0) {
  //                   if (result[0]['disposition'] == 'NO ANSWER') {
  //                       if (result[0]['ringduration'] >= 30) {
  //                           // x.lcst_ring_status = 'Not Answered';
  //                           status = 'Not Answered';
  //                           x.call_attempted = 'Attempted';
  //                       } else {
  //                           // x.lcst_ring_status = 'Ring<30'
  //                           status = 'Ring<30';
  //                           x.call_attempted = 'Not Attempted';
  //                       }
  //                   } else if (result[0]['disposition'] == 'ANSWERED') {
  //                       //x.lcst_ring_status = 'Answered';
  //                       status = 'Answered';
  //                       x.call_attempted = 'Attempted';
  //                   } else {
  //                       //  x.lcst_ring_status = '';
  //                       status = '';

  //                   }
  //               } else {
  //                   // x.lcst_ring_status = '';
  //                   status = '';
  //                   x.call_attempted = 'Not Attempted';
  //               }

               


  //               return x;

  //           });
  //           this.total_row = this.alllist.length;
           

  //           let tempattemptconverted_count = this.alllist.filter(({ jobcount,
  //               lcst_ring_status
  //           }) => {
           

  //            return parseInt(jobcount) >= 1 && lcst_ring_status && lcst_ring_status.trim() == "Answered";


  //           });
     

  //           let tempconverted_count = this.alllist.filter(({ jobcount }) => { return parseInt(jobcount) >= 1 });
  //           if (tempattemptconverted_count.length > 0) this.attempted_converted_count = tempattemptconverted_count.length;
  //           if (tempconverted_count.length > 0) {
  //               this.converted_count = tempconverted_count.length;

  //           }
  //           this.nonattempted_converted_count = Number(this.converted_count) - Number(this.attempted_converted_count);
  //           this.not_converted_count = Number(this.alllist.length) - Number(this.converted_count);
  //           let attempted_callcount = this.alllist.filter(({ lcst_ring_status }) => {return lcst_ring_status && lcst_ring_status.trim() === 'Answered'});
  //           this.attempted_call = attempted_callcount.length;
  //           let not_attempted_callcount = this.alllist.filter(({ lcst_ring_status }) => {
  //             return lcst_ring_status && lcst_ring_status != 'Answered' || lcst_ring_status == "" || lcst_ring_status == null;
  //         });
           
  //           this.not_attempted_call =  not_attempted_callcount.length;

         

  //       } else {
          
  //       }
  //   });
     
  //   }
  // });

  // filter.data = {
  //   total_row: this.total_row,
  //   attempted_converted_count: this.attempted_converted_count,
  //   nonattempted_converted_count: this.nonattempted_converted_count,
  //   not_converted_count: this.not_converted_count,
  //   attempted_call: this.attempted_call,
  //   not_attempted_call: this.not_attempted_call
  // };
  // console.log(filter.name,filter.data);

  //   });


   
   
  //   // call_from: atob(atob(localStorage.getItem('us_ext_no') || '{}')),

  
  // }


  fetchData() {
    // Prepare data objects for the API call
  
  
    const dataOut = {
      call_type: 'Outbound',
      start_day: moment(this.dateFrom, 'DD/MM/YYYY').format('YYYY-MM-DD') + ' 00:00:00',
      end_day: moment(this.dateTo, 'DD/MM/YYYY').format('YYYY-MM-DD') + ' 23:59:59'
    };
  
    // Fetch latest call report data outside forEach loop
    this.userServices.getLatestCallReportData(dataOut).subscribe((rdata: any) => {
      if (rdata.ret_data === 'success') {
        const outbound = rdata.call_data.filter((item: any) => item.src !== '6300')
                                         .sort((a: any, b: any) => b.timestamp - a.timestamp);
  
        // Iterate over filter options
        this.filterOptions.forEach(filter => {
          const fetchtype = filter.id;
  
          // Update filter data after processing
          filter.data = {
            total_row: 0,
            attempted_converted_count: 0,
            nonattempted_converted_count: 0,
            not_converted_count: 0,
            attempted_call: 0,
            not_attempted_call: 0
          };
         
  
          // Fetch staff performance data for each filter option
         let data = {
            'assigned_to': this.assigned,
            'start_date': this.dateFrom,
            'date_to': this.dateTo,
            'fetchtype': fetchtype
          };
     
          this.userServices.getStaffPerformance(data).subscribe((rData: any) => {
        
            if (rData.ret_data === 'success') {
              this.alllist = rData.data;
              let attempted_converted_count  = 0;  let converted_count =0;
  
              // Update alllist with call attempt status based on the fetched outbound data
              this.alllist.forEach(x => {
                let status;
                const result = outbound.find((a1: { dst: string; }) => a1.dst.substring(a1.dst.length - 7) === x.phon_uniq);
                if (result) {
                  if (result.disposition === 'NO ANSWER') {
                    if (result.ringduration >= 30) {
                      x.call_attempted = 'Attempted';
                      status = 'Not Answered';
                    } else {
                      x.call_attempted = 'Not Attempted';
                      status = 'Ring<30';
                    }
                  } else if (result.disposition === 'ANSWERED') {
                    x.call_attempted = 'Attempted';
                    status = 'Answered';
                  } else {
                    x.call_attempted = 'Not Attempted';
                   status = '';
                  }
                } else {
                  x.call_attempted = 'Not Attempted';
                    status = '';
                }
                return x;
              });
  


              // Calculate various counts for the current filter option
            
           

              const total_row = this.alllist.length;
              this.attempted_converted_count=0;
              this.converted_count =0;
              this.not_converted_count =0;

              let tempattemptconverted_count = this.alllist.filter(({ jobcount,
                            lcst_ring_status
                         }) => {
                         return parseInt(jobcount) >= 1 && lcst_ring_status && lcst_ring_status.trim() == "Answered";
                 });
           let tempconverted_count = this.alllist.filter(({ jobcount }) => { return parseInt(jobcount) >= 1 });
           
               if (tempattemptconverted_count.length > 0){ 
          this.attempted_converted_count = tempattemptconverted_count.length;
              
              };
                          if (tempconverted_count.length > 0) {
                               this.converted_count = tempconverted_count.length;
                       
              
                          }
                         
                          const nonattempted_converted_count = Number(this.converted_count) - Number(this.attempted_converted_count);
                         const not_converted_count = Number(this.alllist.length) - Number(this.converted_count);
                      let attempted_callcount = this.alllist.filter(({ lcst_ring_status }) => {return lcst_ring_status && lcst_ring_status.trim() === 'Answered'});
                          const attempted_call = attempted_callcount.length;
                        let not_attempted_callcount = this.alllist.filter(({ lcst_ring_status }) => {
                          return lcst_ring_status && lcst_ring_status != 'Answered' || lcst_ring_status == "" || lcst_ring_status == null;
                      });
                         
                      const not_attempted_call =  not_attempted_callcount.length;
              


            
              // Update filter data
              filter.data = {
                total_row: total_row,
                attempted_converted_count: this.attempted_converted_count,
                nonattempted_converted_count: nonattempted_converted_count,
                not_converted_count: not_converted_count,
                attempted_call: attempted_call,
                not_attempted_call: not_attempted_call
              };
  
              // Log filter data for debugging
           
            }
          });
        });
      }
    });
  }
}
