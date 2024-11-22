import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-quote-list',
    templateUrl: './quote-list.component.html',
    styleUrls: ['./quote-list.component.css'],
})
export class QuoteListComponent implements OnInit {
    public search: string = '';
    public load_flag: boolean = true;
    public permittedAction: [] = [];
    public quoteList: any[] = [];
    public dateFrom: any;
    public dateTo: any;
    public service_advisor: any = '0';
    public usersList: any[] = [];

    public cols = [
        { field: 'qt_code', title: 'Quote Number', isUnique: true },
        { field: 'qt_cus_name', title: 'Customer Name', isUnique: false },
        { field: 'qt_chasis', title: 'Chassis number', isUnique: false },
        { field: 'qt_reg_no', title: 'Register No.', isUnique: false },
        { field: 'qt_created_on', title: 'Created', isUnique: false },
        { field: 'sa_name', title: 'Service Advisor', isUnique: false },
        { field: 'pa_name', title: 'Parts Advisor', isUnique: false },
        { field: 'qt_make', title: 'Make/Model/Year', isUnique: false },
        { field: 'action', title: 'Actions', isUnique: false },
    ];

    constructor(private userServices: StaffPostAuthService, public router: Router, public datePipe: DatePipe) {
        JSON.parse(atob(atob(localStorage.getItem('access_data') || '{}'))).forEach((element: any) => {
            if (element['ft_id'] == 12) {
                this.permittedAction = element['actions'];
            }
        });

        const date29DaysAgo = moment().subtract(29, 'days').toDate();
        this.dateFrom = this.datePipe.transform(date29DaysAgo, 'yyyy-MM-dd') || '';
        this.dateTo = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
        this.userServices.userList().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.usersList = rData.userList.filter((role: any) => role.us_role_id == '11');
                console.log('this.usersList', this.usersList);
            }
        });
    }

    ngOnInit(): void {
        this.getQuotationList();
    }

    getQuotationList() {
        this.load_flag = true;
        let data = {
            dateFrom: this.dateFrom,
            dateTo: this.dateTo,
            sa_id: this.service_advisor,
        };

        if ((this.permittedAction as string[]).includes('5')) {
            this.userServices.getSplQuotesList(data).subscribe((rData: any) => {
                if (rData.ret_data == 'success') {
                    this.quoteList = rData.quotes;
                    this.load_flag = false;
                } else {
                    this.coloredToast('danger', 'Quote details cant be fetched, please try again later');
                    this.load_flag = false;
                }
            });
        } else {
            this.coloredToast('danger', 'Action denied, no permission to view');
        }
    }

    printQuote(item: any) {
        window.open(environment.base_url + '/HTMLPdfController/convertHTMLToPdf?id=' + encodeURIComponent(item.qt_id), '_blank');
    }
    editQuotation(item: any) {
        if ((this.permittedAction as string[]).includes('2')) {
            this.router.navigateByUrl('quotation/special_quote/quote_list/quote_edit/' + encodeURIComponent(btoa(item.qt_id)));
        } else {
            this.coloredToast('danger', 'Action denied, no permission to edit');
        }
    }

    deleteQuote(item: any) {
        if ((this.permittedAction as string[]).includes('3')) {
            Swal.fire({
                icon: 'warning',
                title: "You won't be able to revert this!",
                text: 'You are about to delete a quotation, Are you sure?',
                showCancelButton: true,
                confirmButtonText: 'Delete',
                padding: '2em',
                customClass: 'sweet-alerts',
            }).then((result) => {
                if (result.value) {
                    this.userServices.deleteQuotes({ id: item.qt_id }).subscribe((rData: any) => {
                        if (rData.ret_data === 'success') {
                            this.coloredToast('success', 'Quotation deleted successfully');
                            this.getQuotationList();
                        } else {
                            this.coloredToast('danger', "Can't delete quotation");
                        }
                    });
                }
            });
        } else {
            this.coloredToast('danger', 'Action Denied, no permission to delete');
        }
    }

    createNewQuote() {
        if ((this.permittedAction as string[]).includes('1')) {
            this.router.navigateByUrl('/quotation/special_quote/quote_list/quote_create');
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
