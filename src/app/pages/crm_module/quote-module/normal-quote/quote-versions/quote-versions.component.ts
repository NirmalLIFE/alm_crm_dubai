import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';
import { filter, pairwise } from 'rxjs';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { ToWords } from 'to-words';

@Component({
    selector: 'app-quote-versions',
    templateUrl: './quote-versions.component.html',
    styleUrls: ['./quote-versions.component.css'],
})
export class QuoteVersionsComponent implements OnInit {
    @Input() quoteId: any;
    @Input() quoteCode: any;
    @Input() quoteCarValue: any;
    @ViewChild('versioCreate') versioCreate: any;
    public toWords = new ToWords();

    public data_load_flag: boolean = true;
    public qt_versions: any[] = [];
    public printList: any[] = [];
    public item_version = {
        qvm_recommended_flag: 0, // Initially set to 0 for false
    };

    //version create
    public qt_data: any = {};
    public qt_items: any = [];
    public qt_spare_item: any = [];
    public selected_grouping_count = 0;
    public grouped_items: any[] = [];
    public quote_total: any = 0;
    public labour_total: any = 0;
    public spare_total: any = 0;
    public discount: any = 0;
    public quote_vat: any = 0;
    public total_amt: any = 0;
    public tot_words: any = '';
    public quote_note: any = '';
    public qvm_quote_label: any = '';
    public vehicle_value: any = '';

    public marginFlag: boolean = false;
    public user_role: any = atob(atob(localStorage.getItem('us_role_id') || '{}'));
    public us_id: any = atob(atob(localStorage.getItem('us_id') || '{}'));

    constructor(private userServices: StaffPostAuthService, private cdRef: ChangeDetectorRef, public router: Router) {}

    ngOnInit(): void {
        this.getQuoteVersions();
    }

    getQuoteVersions() {
        this.userServices.getQuoteVersions({ qt_id: this.quoteId }).subscribe((r_data: any) => {
            if (r_data.ret_data == 'success') {
                this.qt_versions = r_data.qt_versions;
                this.qt_versions.forEach((element) => {
                    element.print_flag = false;
                    element.qvm_recommended_flag = element.qvm_recommended_flag == '0' ? false : true;
                    if (parseInt(element.qvm_reference_version) > 0) {
                        var newIndex = this.qt_versions.findIndex((x) => x.qvm_id == element.qvm_reference_version);
                        element.ref_version = parseInt(this.qt_versions[newIndex].qvm_version_no);
                    } else {
                        element.ref_version = 0;
                    }
                });
                this.data_load_flag = false;
            } else {
                this.data_load_flag = false;
                this.coloredToast('danger', "Could'nt fetch quote versions. Please try again later");
            }
        });
    }

    createQuoteVersion() {
        this.marginFlag = false;
        this.selected_grouping_count = 0;
        this.grouped_items = [];
        this.quote_total = 0;
        this.labour_total = 0;
        this.spare_total = 0;
        this.discount = 0;
        this.quote_vat = 0;
        this.total_amt = 0;
        this.tot_words = '';
        this.quote_note = '';
        this.qvm_quote_label = '';
        this.qt_items = [];
        this.userServices.getQuoteDetailsById(this.quoteId).subscribe((r_data: any) => {
            if (r_data.ret_data == 'success') {
                this.qt_data = r_data.quotation;
                this.qt_spare_item = [];
                this.vehicle_value = this.qt_data.qt_vehicle_value;
                const qt_sp_temp = [];

                if (this.user_role == 11 && this.qt_data.qt_margin_flag == '1') {
                    this.marginFlag = true;
                }
                for (const element of r_data.qt_items) {
                    element.selected_flag = false;
                    if (element.item_type == 1) {
                        //element.price_selected = 0; //0 - Genuine, 1 - ATC, 2 - Used, 3- Open box, 4- Reconditioned
                        qt_sp_temp.push(element);
                    }
                    this.qt_items.push(element);
                }
                this.sortItemsByPriority();
                this.spareGroups(qt_sp_temp);
                if (this.user_role === '11') {
                    Swal.fire({
                        title: 'Terms and conditions',
                        html: `
            <div class="flex">
              <input type="checkbox" id="accept1" value="1" style="height: 20px; width: 20px;">
              <label for="accept1" style="font-size: 12px;">As per the vehicle history, I hereby confirming the reported job & current required parts are not involved in this vehicle during the last 1 year visits or within the previous 10000 Kilometers</label>
            </div>
            <div class="flex">
              <input type="checkbox" id="accept2" value="2" style="height: 20px; width: 20px;">
              <label for="accept2" style="font-size: 12px;">Any estimates with more than 3000 AED Labor charges, 5000 AED Parts amount Or total amount more than 6000 AED will proceed with customer only after consulting with RS or SM</label>
            </div>
          `,
                        showCancelButton: true,
                        cancelButtonText: 'Not Agree',
                        confirmButtonText: 'Agree',
                        preConfirm: () => {
                            const accept1Element = document.getElementById('accept1') as HTMLInputElement;
                            const accept2Element = document.getElementById('accept2') as HTMLInputElement;

                            if (!accept1Element || !accept2Element) {
                                return Swal.showValidationMessage('Error: Could not find checkbox elements');
                            }

                            const accept1 = accept1Element.checked;
                            const accept2 = accept2Element.checked;

                            if (!accept1 || !accept2) {
                                return Swal.showValidationMessage('Please check both checkboxes to proceed');
                            } else {
                                return { accept1, accept2 };
                            }
                        },
                    }).then((result) => {
                        if (result.isConfirmed) {
                            this.versioCreate.open();
                        } else if (result.dismiss === Swal.DismissReason.cancel) {
                            this.coloredToast('danger', 'Action denied, No Permission To Create');
                        }
                    });
                } else {
                    this.versioCreate.open();
                }
            } else {
                this.coloredToast('danger', "Couldn't fetch quote details");
            }
        });
        // this.versioCreate.open();
    }

    spareGroups(qt_sp_temp: any) {
        const itemMap = new Map();
        console.log('qt_sp_temp>>>>>>>>>>>>', qt_sp_temp);
        for (const spare of qt_sp_temp) {
            if (spare.item_delete_flag == 0 && spare.qit_delete_flag == 0) {
                const key = spare.item_id;
                let rowItem = itemMap.get(key);
                console.log('rowItem>>>>>>>>>>>>', rowItem);

                if (!rowItem) {
                    rowItem = {
                        item_type: spare.item_type,
                        item_code: spare.item_code,
                        item_name: spare.item_name,
                        item_qty: spare.item_qty,
                        item_id: spare.item_id,
                        item_delete_flag: spare.item_delete_flag,
                        item_seq: spare.item_seq,
                        unit_price: spare.unit_price,
                        item_p_types: [spare],
                    };

                    itemMap.set(key, rowItem);
                } else {
                    rowItem.item_p_types.push(spare);
                }
            }
        }

        this.qt_spare_item = Array.from(itemMap.values());
    }
    groupCheckValue(event: any, item_data: any, item_master: any) {
        const isChecked = event.target.checked;
        this.cdRef.detectChanges();
        if (isChecked) {
            if (item_data.item_type == '1') {
                const hasSelectedItem = item_master.some((group: any) => parseInt(group.item_group) > 0);
                if (hasSelectedItem) {
                    item_data.selected_flag = false;
                    this.coloredToast('danger', "Can't select more than one item from same parts while grouping");
                } else {
                    const hasGroupedItem = this.grouped_items.some((group: any) =>
                        group.some((item: any) => parseInt(item.item_id) === parseInt(item_data.item_id))
                    );

                    if (hasGroupedItem) {
                        item_data.selected_flag = false;
                        this.coloredToast('danger', "Can't select more than one item from same parts while grouping");
                    } else {
                        this.selected_grouping_count++;
                        item_data.item_group = this.grouped_items.length + 1;
                    }
                }
            } else {
                this.selected_grouping_count++;
                item_data.item_group = this.grouped_items.length + 1;
            }
        } else {
            this.selected_grouping_count--;
            item_data.item_group = 0;
        }
    }

    // groupItems() {
    //     const maxGroup = this.qt_items.reduce((max: any, value: any) => (max.item_group > value.item_group ? max : value));
    //     this.grouped_items = [];
    //     this.selected_grouping_count = 0;

    //     if (maxGroup.item_group >= 0) {
    //         const tempGroups: any[] = new Array(maxGroup.item_group).fill(null).map(() => []);

    //         console.log('tempGroups>>>>>>>>>>>>', tempGroups);

    //         for (const element of this.qt_items) {
    //             if (element.item_group > 0) {
    //                 tempGroups[element.item_group - 1].push(element);
    //                 element.item_delete_flag = true;
    //             }
    //         }

    //         for (const tempGroup of tempGroups) {
    //             if (tempGroup.length > 0) {
    //                 tempGroup.sort((a: any, b: any) => a.item_type - b.item_type);
    //                 this.grouped_items.push(tempGroup);
    //             }
    //         }

    //         const qt_sp_temp = this.qt_items.filter((element: any) => element.item_type === '1');
    //         this.spareGroups(qt_sp_temp);
    //         this.priceUpdate();
    //     }
    // }

    groupItems() {
        const maxGroup = this.qt_items.reduce((max: any, value: any) => (max.item_group > value.item_group ? max : value));
        this.grouped_items = [];

        if (maxGroup.item_group >= 0) {
            const tempGroups: any[] = new Array(maxGroup.item_group).fill(null).map(() => []);
            for (const element of this.qt_items) {
                if (element.item_group > 0) {
                    tempGroups[element.item_group - 1].push(element);
                }
            }

            for (const tempGroup of tempGroups) {
                if (tempGroup.length > 0) {
                    const laborCount = tempGroup.filter((item: any) => item.item_type === '2' || item.item_type === '3').length;

                    if (laborCount != 0) {
                        tempGroup.sort((a: any, b: any) => a.item_type - b.item_type);
                        tempGroup.forEach((element: any) => {
                            if (element.item_type == 1) {
                                element.qtvi_qtv_item_price = element.qit_unit_price;
                            } else {
                                element.qtvi_qtv_item_price = element.unit_price;
                            }
                        });
                        this.grouped_items.push(tempGroup);
                        tempGroup.forEach((item: any) => (item.item_delete_flag = true));
                    } else {
                        this.coloredToast('danger', 'Atleast One Labour Or Generic Item Required In Each Group');
                        return;
                    }
                }
            }
            this.selected_grouping_count = 0;
            const qt_sp_temp = this.qt_items.filter((element: any) => element.item_type === '1');
            this.spareGroups(qt_sp_temp);
            this.priceUpdate();
        }
    }

    priceUpdate() {
        this.quote_total = 0;
        this.discount = 0;
        this.labour_total = 0;
        this.spare_total = 0;
        // let flag = false;
        for (const master of this.grouped_items) {
            for (const element of master) {
                const unitPrice = parseFloat(element.unit_price);
                const itemQty = parseFloat(element.item_qty);
                const qitUnitPrice = parseFloat(element.qit_unit_price);
                const qitDiscount = parseFloat(element.qit_discount);
                const qit_margin_price = parseFloat(element.qit_margin_price);
                // this.us_id == '11' && this.qt_data.qt_service_adv == '11' && flag
                if (this.user_role == 11 && this.marginFlag) {
                    if (element.item_type === '2') {
                        this.labour_total += unitPrice;
                    } else if (element.item_type === '3') {
                        this.spare_total += unitPrice * itemQty;
                    } else {
                        this.spare_total += qit_margin_price;
                        element.qit_unit_price = (element.qit_margin_price / element.item_qty).toFixed(2);
                        // this.quote_total += qitUnitPrice * itemQty;
                        // this.discount = qitDiscount;
                    }
                } else {
                    if (element.item_type === '2') {
                        this.labour_total += unitPrice;
                    } else if (element.item_type === '3') {
                        this.spare_total += unitPrice * itemQty;
                    } else {
                        this.spare_total += qitUnitPrice * itemQty;
                        // this.quote_total += qitUnitPrice * itemQty;
                        // this.discount = qitDiscount;
                    }
                }
            }
        }

        this.quote_total = (parseFloat(this.labour_total) + parseFloat(this.spare_total)).toFixed(2);
        this.quote_vat = (this.quote_total * (5 / 100)).toFixed(2);
        this.total_amt = parseFloat(this.quote_total) + parseFloat(this.quote_vat) - parseFloat(this.discount);
        this.tot_words = this.toWords.convert(parseFloat(this.total_amt.toFixed(2)), { ignoreDecimal: false });
    }

    updateGrandTotal() {
        this.total_amt = parseFloat(this.quote_total) + parseFloat(this.quote_vat) - parseFloat(this.discount);
        this.tot_words = this.toWords.convert(parseFloat(this.total_amt.toFixed(2)));
    }

    sortItemsByPriority() {
        const priorityOrder = ['High Priority', 'Medium Priority', 'Low Priority'];
        this.qt_items.sort((a: any, b: any) => {
            // Only compare items that should be displayed
            if (a.item_type === '2' && a.item_delete_flag === '0' && b.item_type === '2' && b.item_delete_flag === '0') {
                return priorityOrder.indexOf(a.item_priority) - priorityOrder.indexOf(b.item_priority);
            } else {
                return 0;
            }
        });
    }

    deleteGrouped(grp_item: any, index: number) {
        this.grouped_items.splice(index, 1);

        for (const element of grp_item) {
            if (element.item_type === '1') {
                for (const element1 of this.qt_spare_item) {
                    for (const element2 of element1.item_p_types) {
                        if (element2.item_id === element.item_id) {
                            Object.assign(element2, {
                                item_delete_flag: false,
                                item_group: 0,
                                selected_flag: false,
                            });
                        }
                    }
                }
            }
            Object.assign(element, {
                item_delete_flag: false,
                item_group: 0,
                selected_flag: false,
            });
        }
        let group_count = 1;

        for (const element of this.grouped_items) {
            for (const element2 of element) {
                element2.item_group = group_count;
            }
            group_count++;
        }

        this.groupItems();
        this.priceUpdate();
    }

    saveQuoteVersion() {
        // const allGroupsHasLabour = this.grouped_items.every((group) => group.some((item: any) => item.item_type === '2'));
        // if (!allGroupsHasLabour) {
        //     this.coloredToast('danger', 'At Least One Labour Required In Each Groups');
        //     return;
        // }
        let total_amount = parseFloat(this.quote_total) + parseFloat(this.quote_vat);
        console.log('amounts>>>>>>>>>>>>>>>>>', total_amount, this.discount);

        if (parseFloat(this.discount) >= total_amount) {
            this.discount = '0';
            this.coloredToast('danger', 'Discount amount should be less than total amount');
            this.total_amt = parseFloat(this.quote_total) + parseFloat(this.quote_vat) - parseFloat(this.discount);
            this.tot_words = this.toWords.convert(parseFloat(this.total_amt.toFixed(2)));
            return;
        }
        const allGroupsHasOneLabour = this.grouped_items.every((group) => {
            const labourItems = group.filter((item: any) => item.item_type === '2' || item.item_type === '3');
            return labourItems.length != 0;
        });

        if (!allGroupsHasOneLabour) {
            this.coloredToast('danger', 'Atleast One Labour Or Generic Item Required In Each Group');
            return;
        }

        const send_data = {
            qt_id: this.quoteId,
            qt_version_count: 0,
            qt_items: this.grouped_items,
            qvm_sub_total: this.quote_total,
            qvm_spare_total: this.spare_total,
            qvm_labour_total: this.labour_total,
            qvm_vat_total: this.quote_vat,
            qvm_discount: this.discount,
            qvm_note: this.quote_note,
            qvm_quote_label: this.qvm_quote_label,
            qt_margin_flag: this.marginFlag,
        };

        let grand_total = parseFloat(this.quote_total) + parseFloat(this.quote_vat);
        this.userServices.createQuoteVersion(send_data).subscribe({
            next: (r_data: any) => {
                if (r_data.ret_data === 'success') {
                    this.coloredToast('success', 'Quotation saved successfully');
                    this.versioCreate.close();
                    this.getQuoteVersions();
                } else {
                    this.coloredToast('danger', "Can't create quote. Contact administrator");
                }
            },
            error: () => {
                this.coloredToast('danger', "Can't create quote. Contact administrator");
            },
        });
    }
    openQuoteVersion(item: any) {
        this.router.navigateByUrl(
            'quotation/normal_quote/quote_list/quote_version_edit/' + encodeURIComponent(btoa(item.qvm_id)) + '/' + encodeURIComponent(btoa(item.qvm_qt_id))
        );
    }

    isSubTotalWithinLimit(selected_version: any, grand_total: number): boolean {
        const fiftyPercentOfVehicleValue = this.quoteCarValue * 0.5;
        return grand_total <= fiftyPercentOfVehicleValue;
    }

    checkQuotePrice(selected_version: any, type: any) {
        let grand_total = parseFloat(selected_version.qvm_sub_total) + parseFloat(selected_version.qvm_vat_total);
        if (!this.isSubTotalWithinLimit(selected_version, grand_total) && this.quoteCarValue != '') {
            Swal.fire({
                title: 'Terms and conditions',
                html: `
                        <div class="flex">
                          <input type="checkbox" id="accept1" value="1" style="height: 20px; width: 20px;">
                          <label for="accept1" style="font-size: 12px;">I Acknowledging the estimate value is not matching the vehicle market value/ current market price</label>
                        </div>
                        <div class="flex">
                          <input type="checkbox" id="accept2" value="2" style="height: 20px; width: 20px;">
                          <label for="accept2" style="font-size: 12px;">This estimation includes requirements to resolve reported customer complaints & only urgent jobs to avoid any safety concerns and possible breakdowns</label>
                        </div>
                      `,
                showCancelButton: true,
                cancelButtonText: 'Not Agree',
                confirmButtonText: 'Agree',
                preConfirm: () => {
                    const accept1Element = document.getElementById('accept1') as HTMLInputElement;
                    const accept2Element = document.getElementById('accept2') as HTMLInputElement;

                    if (!accept1Element || !accept2Element) {
                        return Swal.showValidationMessage('Error: Could not find checkbox elements');
                    }

                    const accept1 = accept1Element.checked;
                    const accept2 = accept2Element.checked;

                    if (!accept1 || !accept2) {
                        return Swal.showValidationMessage('Please check both checkboxes to proceed');
                    } else {
                        return { accept1, accept2 };
                    }
                },
            }).then((result) => {
                if (result.isConfirmed) {
                    this.printUrl(selected_version, type);
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    this.coloredToast('danger', 'Action denied, No Permission To PRINT');
                }
            });
        } else if (parseFloat(selected_version.qvm_spare_total) > 5000.0 || parseFloat(selected_version.qvm_labour_total) > 3000.0 || grand_total > 6000.0) {
            Swal.fire({
                title: 'Terms and conditions',
                html: `<div class="flex">
              <input type="checkbox" id="accept1" value="1" style="height: 20px; width: 20px;">
              <label for="accept1" style="font-size: 12px;">This estimation needs authorization and sign-off from RS or SM before proceeding with the customer</label>
            </div>`,
                showCancelButton: true,
                cancelButtonText: 'Not Agree',
                confirmButtonText: 'Agree',
                preConfirm: () => {
                    const accept1Element = document.getElementById('accept1') as HTMLInputElement;

                    if (!accept1Element) {
                        return Swal.showValidationMessage('Error: Could not find checkbox elements');
                    }

                    const accept1 = accept1Element.checked;

                    if (!accept1) {
                        return Swal.showValidationMessage('Please check the checkbox to proceed');
                    } else {
                        return { accept1 };
                    }
                },
            }).then((result) => {
                if (result.isConfirmed) {
                    this.printUrl(selected_version, type);
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    this.coloredToast('danger', 'Action denied, No Permission To PRINT');
                }
            });
        } else {
            this.printUrl(selected_version, type);
        }
    }

    // previewUrl(selected_version: any, type: any) {
    //     window.open(
    //         `${environment.base_url}/HTMLPdfController/prinPDFVersion?id=${btoa(btoa(this.quoteId))}&v_id=${btoa(btoa(selected_version.qvm_id))}&type=${btoa(
    //             btoa(type)
    //         )}&preview=${true}`,
    //         '_blank'
    //     );
    // }

    printUrl(selected_version: any, type: any) {
        window.open(
            `${environment.base_url}/HTMLPdfController/prinPDFVersion?id=${btoa(btoa(this.quoteId))}&v_id=${btoa(btoa(selected_version.qvm_id))}&type=${btoa(
                btoa(type)
            )}`,
            '_blank'
        );
    }
    printQuoteVersion(selected_version: any, type: any) {
        if (this.quoteCarValue == '' && this.user_role == '11') {
            Swal.fire({
                title: 'Missing Vehicle Market Value',
                html: `
        <div class="flex">
          <input type="checkbox" id="accept1" value="1" style="height: 20px; width: 20px;">
          <label for="accept1" style="font-size: 12px;">Total value of this estimate is not more than 50% of vehicles present market value &  understand risk of Quotation rejection from Customer due to high value Estimation. I want to proceed with the estimation</label>
        </div>
      `,
                showCancelButton: true,
                cancelButtonText: 'Not Agree',
                confirmButtonText: 'Agree',
                preConfirm: () => {
                    const accept1Element = document.getElementById('accept1') as HTMLInputElement;

                    if (!accept1Element) {
                        return Swal.showValidationMessage('Error: Could not find checkbox elements');
                    }

                    const accept1 = accept1Element.checked;

                    if (!accept1) {
                        return Swal.showValidationMessage('Please approve warning to proceed');
                    } else {
                        return { accept1 };
                    }
                },
            }).then((result) => {
                if (result.isConfirmed) {
                    this.checkQuotePrice(selected_version, type);
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    this.coloredToast('danger', 'Action denied, No Permission To PRINT');
                }
            });
        } else if (this.quoteCarValue != '' && this.user_role == '11') {
            this.checkQuotePrice(selected_version, type);
        } else {
            this.printUrl(selected_version, type);
        }
    }

    recommendedItem(event: any, item: any) {}

    combinedPrint(event: any, version_data: any) {
        if (event.target.checked) {
            if (this.printList.length > 1) {
                version_data.print_flag = false;
                this.coloredToast('danger', 'Maximum 2 options allowed to print at a time');
            } else {
                version_data.print_flag = true;
                this.printList.push(version_data);
            }
        } else {
            version_data.print_flag = false;
            this.printList = this.printList.filter((item) => item.qvm_id != version_data.qvm_id);
        }
    }

    printComboQuote() {
        if (this.printList.length == 1) {
            window.open(
                environment.base_url + '/HTMLPdfController/prinPDFVersion?id=' + btoa(btoa(this.quoteId)) + '&v_id=' + btoa(btoa(this.printList[0].qvm_id)),
                '_blank'
            );
        } else {
            window.open(
                environment.base_url +
                    '/HTMLPdfController/printComboPDFVersion?id=' +
                    btoa(btoa(this.quoteId)) +
                    '&v1_id=' +
                    btoa(btoa(this.printList[0].qvm_id)) +
                    '&v1_flag=' +
                    btoa(btoa(this.printList[0].qvm_recommended_flag)) +
                    '&v2_id=' +
                    btoa(btoa(this.printList[1].qvm_id)) +
                    '&v2_flag=' +
                    btoa(btoa(this.printList[1].qvm_recommended_flag)),
                '_blank'
            );
        }
    }

    getPriorityColor(priority: string): { backgroundColor: string; color: string } {
        switch (priority) {
            case 'High':
                return { backgroundColor: '#f7666e', color: 'white' };
            case 'Medium':
                return { backgroundColor: '#f5e557', color: 'black' };
            default:
                return { backgroundColor: 'lightgrey', color: 'black' };
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
