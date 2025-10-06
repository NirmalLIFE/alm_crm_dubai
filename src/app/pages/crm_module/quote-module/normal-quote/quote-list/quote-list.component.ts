import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { ModalComponent } from 'angular-custom-modal/modal.component';

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
    public user_role: any = atob(atob(localStorage.getItem('us_role_id') || '{}'));
    counts: { [key: string]: number } = {};
    seen: { [key: string]: boolean } = {};
    public loading: boolean = false;

    @ViewChild('sparePreview') sparePreview: any;

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

    quotationDetails: any;
    qt_item_spare: any;

    constructor(private userServices: StaffPostAuthService, public router: Router, public datePipe: DatePipe) {
        const date29DaysAgo = moment().subtract(29, 'days').toDate();
        this.dateFrom = this.datePipe.transform(date29DaysAgo, 'yyyy-MM-dd') || '';
        this.dateTo = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
        JSON.parse(atob(atob(localStorage.getItem('access_data') || '{}'))).forEach((element: any) => {
            if (element['ft_id'] == 12) {
                this.permittedAction = element['actions'];
            }
        });

        this.userServices.userList().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.usersList = rData.userList.filter((role: any) => role.us_role_id == '11');
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
            this.userServices.getQuotesList(data).subscribe((rData: any) => {
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

    editQuotation(item: any) {
        if ((this.permittedAction as string[]).includes('2')) {
            this.router.navigateByUrl('quotation/normal_quote/quote_list/quote_edit/' + encodeURIComponent(btoa(item.qt_id)) + '/1');
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
            this.router.navigateByUrl('/quotation/normal_quote/quote_list/quote_create');
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

    openQuotationModal(quotationId: number) {
        const encryptedId = btoa(quotationId.toString()); // Ensure base64 encoding
        this.loading = true;
        this.sparePreview.open();

        // Send a POST request with a valid JSON payload
        this.userServices.getQuoteDetailsByIdView({ qt_id: encryptedId }).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.quotationDetails = rData.quotation;
                // this.qt_item_spare = rData.qt_items;
                const { quotation, qt_items } = rData;
                const qtItemMap = new Map();
                qt_items.forEach((element: any) => {
                    const itemType = element.item_type;
                    const qtItem = {
                        item_type: element.item_type,
                        item_code: element.item_code,
                        item_name: element.item_name,
                        item_note: element.item_note,
                        item_qty: element.item_qty,
                        item_id: element.item_id,
                        item_delete_flag: element.item_delete_flag,
                        item_seq: element.item_seq,
                        unit_price: element.unit_price,
                        item_p_types: [],
                        margin_percentage: element.margin_applied,
                        margin_total: element.margin_total,
                        old_margin_total: element.old_margin_total,
                    };
                    if (itemType === '1') {
                        if (!qtItemMap.has(element.item_id)) {
                            qtItemMap.set(element.item_id, qtItem);
                        }
                    }
                });
                const qtItemSpare = Array.from(qtItemMap.values());
                qt_items.forEach((element: any) => {
                    if (element.item_type === '1' && element.qit_delete_flag == '0') {
                        const qtItem = qtItemMap.get(element.item_id);
                        qtItem.item_p_types.push({
                            qit_id: element.qit_id,
                            qit_item_id: element.qit_item_id,
                            qit_qt_id: element.qit_qt_id,
                            qit_brand: element.qit_brand,
                            qit_brand_name: element.brand_name,
                            qit_type: element.qit_type,
                            qit_availability: element.qit_availability,
                            qit_unit_price: element.qit_unit_price,
                            qit_discount: element.qit_discount,
                            qit_delete_flag: element.qit_delete_flag,
                            margin_percentage: element.margin_applied,
                            margin_total: element.margin_total,
                            qit_margin_price: element.qit_margin_price,
                            old_margin_total: element.old_margin_total,
                        });
                    }
                });
                this.qt_item_spare = qtItemSpare;

                // this.counts = {};
                // this.seen = {};

                // // Count occurrences of each item_seq
                // this.qt_item_spare.forEach((item: { item_id: any }) => {
                //     this.counts[item.item_id] = (this.counts[item.item_id] || 0) + 1;
                // });

                // // Assign rowspan values, but only to the first occurrence of each item_seq
                // this.qt_item_spare.forEach((item: { item_id: any; rowspan: any }) => {
                //     if (!this.seen[item.item_id]) {
                //         item.rowspan = this.counts[item.item_id]; // Assign rowspan only once
                //         this.seen[item.item_id] = true; // Mark this item_seq as processed
                //     }else {
                //         item.rowspan = 0; // Set rowspan to 0 for repeated entries
                //     }
                // });
                this.loading = false;
                // this.sparePreview.open(); // Open modal
            } else {
                this.coloredToast('danger', 'Quote details cannot be fetched, please try again later');
                this.loading = false;
            }
        });

        // (error) => {
        //     console.error("API Error:", error);
        //     this.coloredToast('danger', 'Server error, please try again later');
        //     this.loading = false;
        // }
    }
}
