import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { sample } from 'rxjs';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-alm-nm-spare-invoice-list',
    templateUrl: './alm-nm-spare-invoice-list.component.html',
    styleUrls: ['./alm-nm-spare-invoice-list.component.css'],
})
export class AlmNmSpareInvoiceListComponent implements OnInit {
    public dateFrom: string = this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '';
    public dateTo: string = this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '';
    public formattedDateFrom: any;
    public formattedDateTo: any;
    public basic: FlatpickrOptions;
    public search: string = '';
    public load_flag: boolean = false;
    public permittedAction: [] = [];

    invoiceList: any[] = [];
    invNo: any[] = [];

    postedCount: any = 0;
    available: any = 0;
    allInvoiceList: any[] = [];

    public cols = [
        { field: 'DOC_DATE', title: 'Invoice Date', hide: false },
        { field: 'DOC_NO', title: 'Invoice No', hide: false },
        { field: 'SALE_TYPE', title: 'Purchase Type', hide: false },
        { field: 'BRANCH_CODE', title: 'Branch Code', hide: false },
        { field: 'LPO_REF', title: 'Lpo/Ref', hide: false },
        { field: 'action', title: 'Action', hide: false },
    ];

    sample = {
        details: [
            {
                DOC_NO: '147920',
                DOC_DATE: '22-FEB-24',
                TOTAL_AMOUNT: '1990',
                TOTAL_DISCOUNT: null,
                TOTAL_VAT_AMOUNT: '99.5',
                SALE_TYPE: 'D',
                BRANCH_CODE: '11',
                LPO_REF: 'RATHNM / 61000',
            },
            {
                DOC_NO: '147935',
                DOC_DATE: '22-FEB-24',
                TOTAL_AMOUNT: '5295',
                TOTAL_DISCOUNT: null,
                TOTAL_VAT_AMOUNT: '264.75',
                SALE_TYPE: 'D',
                BRANCH_CODE: '11',
                LPO_REF: '1881-shuhaib',
            },
            {
                DOC_NO: '147943',
                DOC_DATE: '22-FEB-24',
                TOTAL_AMOUNT: '295',
                TOTAL_DISCOUNT: null,
                TOTAL_VAT_AMOUNT: '14.75',
                SALE_TYPE: 'D',
                BRANCH_CODE: '11',
                LPO_REF: '1881-shuahib',
            },
            {
                DOC_NO: '147928',
                DOC_DATE: '22-FEB-24',
                TOTAL_AMOUNT: '1308',
                TOTAL_DISCOUNT: null,
                TOTAL_VAT_AMOUNT: '65.4',
                SALE_TYPE: 'D',
                BRANCH_CODE: '11',
                LPO_REF: 'RATNA/12092',
            },
            {
                DOC_NO: '147936',
                DOC_DATE: '22-FEB-24',
                TOTAL_AMOUNT: '1555',
                TOTAL_DISCOUNT: null,
                TOTAL_VAT_AMOUNT: '77.75',
                SALE_TYPE: 'D',
                BRANCH_CODE: '11',
                LPO_REF: 'SUHAIB/99291',
            },
            {
                DOC_NO: '147946',
                DOC_DATE: '22-FEB-24',
                TOTAL_AMOUNT: '630',
                TOTAL_DISCOUNT: null,
                TOTAL_VAT_AMOUNT: '31.5',
                SALE_TYPE: 'D',
                BRANCH_CODE: '11',
                LPO_REF: 'SUHAIB/21154',
            },
            {
                DOC_NO: '147955',
                DOC_DATE: '22-FEB-24',
                TOTAL_AMOUNT: '230',
                TOTAL_DISCOUNT: null,
                TOTAL_VAT_AMOUNT: '11.5',
                SALE_TYPE: 'D',
                BRANCH_CODE: '11',
                LPO_REF: 'RATNA*/55495',
            },
        ],
    };
    constructor(public storeData: Store<any>, private userServices: StaffPostAuthService, public router: Router, public datepipe: DatePipe) {
        this.basic = {
            dateFormat: 'Y-m-d',
            defaultDate: this.datepipe.transform(new Date(), 'yyyy-MM-dd') || '',
        };
        JSON.parse(atob(atob(localStorage.getItem('access_data') || '{}'))).forEach((element: any) => {
            if (element['ft_id'] == 38) {
                this.permittedAction = element['actions'];
            }
        });
    }

    ngOnInit() {
        this.getSpareInvoice(this.dateFrom, this.dateTo);
    }

    getSpareInvoice(dateFrom: any, dateTo: any) {
        this.load_flag = true;
        this.postedCount = 0;
        this.available = 0;
        let start: Date = new Date(dateFrom);
        let end: Date = new Date(dateTo);
        const startDate = new DatePipe('en-US');
        const endDate = new DatePipe('en-US');
        this.formattedDateFrom = startDate.transform(start, 'dd/MM/yyyy');
        this.formattedDateTo = endDate.transform(end, 'dd/MM/yyyy');
        // const startDate = new Date(dateFrom!);
        // this.formattedDateFrom = this.datepipe.transform(startDate, 'dd-MMM-yy')?.toUpperCase() ?? '';
        // const endDate = new Date(dateTo!);
        // this.formattedDateTo = this.datepipe.transform(endDate, 'dd-MMM-yy')?.toUpperCase() ?? '';

        let data = {
            startdate: this.formattedDateFrom,
            enddate: this.formattedDateTo,
        };

        // this.allInvoiceList = this.sample.details;
        // this.allInvoiceList.forEach((element) => {
        //     element['postedFlag'] = 0;
        //     this.invNo.forEach((element2) => {
        //         if (element.DOC_NO == element2.inv_nm_id) {
        //             element['postedFlag'] = 1;
        //         }
        //     });
        // });
        // this.getCount();

        // this.userServices.getNMInvoicePostedList().subscribe((rData: any) => {
        //     if (rData.ret_data == 'success') {
        //         this.invNo = rData.invoicesNo;
        //         this.allInvoiceList.forEach((element) => {
        //             element['postedFlag'] = 0;
        //             this.invNo.forEach((element2) => {
        //                 if (element.DOC_NO == element2.inv_nm_id) {
        //                     element['postedFlag'] = 1;
        //                 }
        //             });
        //         });
        //         this.getCount();
        //     } else {
        //         this.load_flag = false;
        //     }
        // });

        this.userServices.getNMInvoiceList(data).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.allInvoiceList = rData.booking.details;
                this.userServices.getNMInvoicePostedList().subscribe((rData: any) => {
                    if (rData.ret_data == 'success') {
                        this.invNo = rData.invoicesNo;
                        this.allInvoiceList.forEach((element) => {
                            element['postedFlag'] = 0;
                            this.invNo.forEach((element2) => {
                                if (element.DOC_NO == element2.inv_nm_id) {
                                    element['postedFlag'] = 1;
                                }
                            });
                        });
                        this.getCount();
                    } else {
                        this.load_flag = false;
                    }
                });
            } else {
                this.load_flag = false;
            }
        });
    }

    getCount() {
        this.invoiceList = this.allInvoiceList;
        this.postedCount = this.allInvoiceList.filter((item: any) => item.postedFlag == '1').length;
        this.available = this.allInvoiceList.filter((item: any) => item.postedFlag != '1').length;
        this.load_flag = false;
    }

    filterInvoices(value: any) {
        if (value == 0) {
            this.invoiceList = this.allInvoiceList;
        } else if (value == 1) {
            this.invoiceList = this.allInvoiceList.filter((item: any) => item.postedFlag == '1');
        } else {
            this.invoiceList = this.allInvoiceList.filter((item: any) => item.postedFlag != '1');
        }
    }

    viewSpareInvoice(INV_NO: any, BRANCH_CODE: any, SALE_TYPE: any) {
        if ((this.permittedAction as string[]).includes('1')) {
            //this.router.navigateByUrl('spare-invoice/spare-invoice-list/spare-create');
            this.router.navigate(['spare-invoice/spare-invoice-list/spare-create'], {
                queryParams: {
                    INV_NO: INV_NO,
                    BRANCH_CODE: BRANCH_CODE,
                    SALE_TYPE: SALE_TYPE,
                },
            });
        } else {
            this.coloredToast('danger', 'Action Denied, no permission to create');
        }
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
