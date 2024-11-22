import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { ToWords } from 'to-words';
import { log } from 'console';

@Component({
    selector: 'app-version-edit',
    templateUrl: './version-edit.component.html',
    styleUrls: ['./version-edit.component.css'],
})
export class VersionEditComponent implements OnInit {
    qt_v_id: any;
    qt_id: any;
    qtv_details: any = {
        qvm_note: '',
        qvm_quote_label: '',
    };
    hoveredIndex: number = -1; 
    qt_data: any = {};
    qt_items_master: any[] = [];
    qt_items: any[] = [];
    qt_spare_item: any[] = [];
    selected_grouping_count = 0;
    grouped_items: any[] = [];
    // grouped_items_master = [];
    quote_total: number = 0;
    labour_total: number = 0;
    spare_total: number = 0;
    quote_vat: number = 0;
    total_amt: number = 0;
    discount: number = 0;
    tot_words: string = '';

    item_edit_value = 0;
    public toWords = new ToWords();
    public data_load_flag: boolean = true;
    public user_role: any = atob(atob(localStorage.getItem('us_role_id') || '{}'));
    public us_id: any = atob(atob(localStorage.getItem('us_id') || '{}'));

    constructor(private userServices: StaffPostAuthService, private cdRef: ChangeDetectorRef, public router: Router, private activeRouter: ActivatedRoute) {
        this.qt_v_id = atob(this.activeRouter.snapshot.paramMap.get('id') || '{}');
        this.qt_id = atob(this.activeRouter.snapshot.paramMap.get('main_id') || '{}');
    }

    ngOnInit(): void {
        this.userServices.getQuoteDetailsById(this.qt_id).subscribe((r_data: any) => {
            if (r_data.ret_data == 'success') {
                this.qt_data = r_data.quotation;
                let temp = r_data.qt_items;
                // r_data.qt_items.forEach(element => {
                //   if (element.item_type == 1) {
                //     //element.price_selected = 0; //0 - Genuine, 1 - ATC, 2 - Used, 3- Open box, 4- Reconditioned
                //     element.unit_price = element.gen_price * element.item_qty;
                //   }
                //   element.selected_flag = false;
                //   this.qt_items_master.push(element);
                // });
                this.userServices.getQuoteVersionDetails({ qt_v_id: this.qt_v_id }).subscribe((r_data: any) => {
                    if (r_data.ret_data == 'success') {
                        this.qtv_details = r_data.qt_versions;
                        this.qt_items = r_data.qt_versions_items;
                        // this.grouped_items_master = r_data.qt_versions_items;
                        this.discount = r_data.qt_versions.qvm_discount;
                        this.groupItems();
                        let qt_sp_temp: any = [];
                        temp.forEach((element: any) => {
                            let count = 0;
                            if (element.item_type == 1) {
                                count = this.qt_items.filter((element2) => element2.qit_id == element.qit_id).length;
                                element.unit_price = element.gen_price * element.item_qty;
                                // if (this.us_id == '11') {
                                //     element.qit_unit_price = element.qit_margin_price / element.item_qty;
                                // }  i think its for margin flag
                            } else {
                                count = this.qt_items.filter((element2) => element2.item_id == element.item_id).length;
                            }
                            if (count > 0) {
                                element.selected_flag = true;
                                element.mapped_Flag = true;
                            } else {
                                element.selected_flag = false;
                                element.mapped_Flag = false;
                            }
                            this.qt_items_master.push(element);
                            if (element.item_type == 1 && element.mapped_Flag == false) {
                                qt_sp_temp.push(element);
                            }
                        });
                        this.spareGroups(qt_sp_temp);
                    }
                });
                this.data_load_flag = false;
            } else {
                this.data_load_flag = false;
                this.coloredToast('danger', "Could'nt fetch quote details");
            }
        });
    }
    spareGroups(qt_sp_temp: any) {
        this.qt_spare_item = [];
        const unique = [...new Set(qt_sp_temp.map((item: any) => item.item_id))];
        console.log('unique', unique);
        console.log('qt_sp_temp.qt_sp_temp', qt_sp_temp);

        unique.forEach((element) => {
            let row_item: any;
            qt_sp_temp.forEach((spare: any) => {
                if (spare.item_id == element && spare.item_delete_flag == 0) {
                    if (row_item == undefined || row_item == null) {
                        row_item = {
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
                    } else {
                        row_item.item_p_types.push(spare);
                    }
                }
            });
            if (row_item != undefined) {
                this.qt_spare_item.push(row_item);
            }
        });
    }
    groupItems() {
        this.selected_grouping_count = 0;
        let maxGroup = this.qt_items.reduce((max, value) => (max.qtvi_item_group > parseInt(value.qtvi_item_group) ? max : value));
        this.grouped_items = [];
        console.log('maxGroup.qtvi_item_group', maxGroup.qtvi_item_group);
        if (maxGroup.qtvi_item_group >= 0) {
            for (let i = 0; i <= maxGroup.qtvi_item_group; i++) {
                if (i > 0) {
                    let temp_group: any[] = [];
                    this.qt_items.forEach((element) => {
                        if (element.qtvi_item_group == i) {
                            if (element.qtvi_item_group != 0) {
                                temp_group.push(element);
                                element.item_delete_flag = true;
                            }
                        }
                    });
                    temp_group = temp_group.sort((a, b) => a.item_type - b.item_type);
                    this.grouped_items.push(temp_group);
                }
            }
            this.priceUpdate();
        }
    }

    groupItemsUpdate() {

        this.item_edit_value++;
        let temp = this.qt_items_master.filter((item) => item.item_group == this.grouped_items.length + 1);
        const hasLaborCount = temp.filter((item: any) => item.item_type === '2' || item.item_type === '3').length;
        if (hasLaborCount == 0) {
            this.coloredToast('danger', 'Atleast One Labour Or Generic Item Required In Each Group');
            return;
        }
        this.selected_grouping_count = 0;
        temp.forEach((element) => {
            element.mapped_Flag = true;
            element.item_delete_flag = true;
            element.qtvi_qtv_item_qty = element.item_qty;
            element.qtvi_qtv_item_price = element.item_type == '1' ? element.qit_unit_price : element.unit_price;    
        });
        this.grouped_items.push(temp);
        for (let i = 0; i < this.grouped_items.length; i++) {
            this.grouped_items[i].forEach((element: any) => {
                element.item_group = i + 1;
            });
        }
        this.priceUpdate();
    }

    priceUpdate() {
        this.quote_total = 0;
        this.labour_total = 0;
        this.spare_total = 0;
        this.grouped_items.forEach((master) => {
            master.forEach((element: any) => {
                if (element.item_type == '2') {
                    this.labour_total = parseFloat((this.labour_total + parseFloat(element.qtvi_qtv_item_price)).toFixed(2));
                    // this.quote_total = (parseFloat(this.quote_total) + parseFloat(element.unit_price)).toFixed(2);
                    // this.discount=parseFloat(element.disc_amount).toFixed(2);
                } else if (element.item_type == '3') {
                    this.spare_total = parseFloat(
                        (this.spare_total + parseFloat(element.qtvi_qtv_item_price) * parseFloat(element.qtvi_qtv_item_qty)).toFixed(2)
                    );
                } else {
                    this.spare_total = parseFloat(
                        (this.spare_total + parseFloat(element.qtvi_qtv_item_price) * parseFloat(element.qtvi_qtv_item_qty)).toFixed(2)
                    );
                    //  this.quote_total = (parseFloat(this.quote_total) + (parseFloat(element.qit_unit_price) * parseFloat(element.item_qty))).toFixed(2);
                    // this.discount=parseFloat(element.qit_discount).toFixed(2);
                }
            });
        });
        this.quote_total = parseFloat((this.labour_total + this.spare_total).toFixed(2));       
        this.quote_vat = parseFloat((this.quote_total * (5 / 100)).toFixed(2));
        this.total_amt = this.quote_total + this.quote_vat - this.discount;

        this.tot_words = this.toWords.convert(parseFloat(this.total_amt.toFixed(2)), { ignoreDecimal: false });
    }
    updateGrandTotal() {
        this.total_amt = this.quote_total + this.quote_vat - this.discount;
        this.tot_words = this.toWords.convert(parseFloat(this.total_amt.toFixed(2)), { ignoreDecimal: false });
    }

    isSubTotalWithinLimit(): boolean {
        const fiftyPercentOfVehicleValue = this.qt_data.qt_vehicle_value * 0.5;
        return this.total_amt <= fiftyPercentOfVehicleValue;
    }

    checkQuotePrice(type: any) {
        if (!this.isSubTotalWithinLimit() && this.qt_data.qt_vehicle_value != '') {
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
                    this.printUrl(type);
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    this.coloredToast('danger', 'Action denied, No Permission To PRINT');
                }
            });
        } else if (this.spare_total > 5000.0 || this.labour_total > 3000.0 || this.total_amt > 6000.0) {
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
                    this.printUrl(type);
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    this.coloredToast('danger', 'Action denied, No Permission To PRINT');
                }
            });
        } else {
            this.printUrl(type);
        }
    }

    printQuote(type: any) {
        if (this.qt_data.qt_vehicle_value == '' && this.user_role == '11') {
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
                    this.checkQuotePrice(type);
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    this.coloredToast('danger', 'Action denied, No Permission To PRINT');
                }
            });
        } else if (this.qt_data.qt_vehicle_value != '' && this.user_role == '11') {
            this.checkQuotePrice(type);
        } else {
            this.printUrl(type);
        }
    }
    printUrl(type: any) {
        window.open(
            environment.base_url +
                '/HTMLPdfController/prinPDFVersion?id=' +
                btoa(btoa(this.qt_id)) +
                '&v_id=' +
                btoa(btoa(this.qt_v_id)) +
                '&type=' +
                btoa(btoa(type)),
            '_blank'
        );
    }
    deleteGrouped(grp_item: any, index: number, master: any, m_index: any) {
        // var foundIndex = this.grouped_items_master.findIndex(x => x.qtvi_id == grp_item.qtvi_id);
        // this.grouped_items_master[foundIndex].qtvi_delete_flag = "1";
        // this.grouped_items_master[foundIndex].qtvi_item_group = 0;

        if (master.length <= 1) {
            this.grouped_items.splice(m_index, 1);
            var newIndex = this.qt_items_master.findIndex((x) => x.item_id == grp_item.item_id && x.qit_id == grp_item.qit_id);
            this.qt_items_master[newIndex].selected_flag = false;
            this.qt_items_master[newIndex].mapped_Flag = false;
            this.qt_items_master[newIndex].item_delete_flag = false;
            this.qt_items_master[newIndex].qtvi_item_group = 0;
            let temp_items = this.qt_items_master.filter((element) => element.item_type == '1' && element.mapped_Flag == false);
            this.spareGroups(temp_items);
        } else {
            this.grouped_items[m_index].splice(index, 1);
            var newIndex = this.qt_items_master.findIndex((x) => x.item_id == grp_item.item_id && x.qit_id == grp_item.qit_id);
            this.qt_items_master[newIndex].selected_flag = false;
            this.qt_items_master[newIndex].mapped_Flag = false;
            this.qt_items_master[newIndex].item_delete_flag = false;
            this.qt_items_master[newIndex].qtvi_item_group = 0;
            let temp_items = this.qt_items_master.filter((element) => element.item_type == '1' && element.mapped_Flag == false);
            this.spareGroups(temp_items);
        }
        for (let i = 0; i < this.grouped_items.length; i++) {
            this.grouped_items[i].forEach((element: any) => {
                element.item_group = i + 1;
            });
        }
        this.item_edit_value++;
        this.priceUpdate();

        // this.groupItems(2);

        // this.grouped_items.splice(index, 1);
        // grp_item.forEach((element) => {
        //   // this.qt_items.forEach(items => {
        //   //   if(items.item_id==element.item_id && items.item_code==element.item_code && items.item_delete_flag==true){

        //   //   }
        //   // });
        //   if (element.item_type == "1") {
        //     this.qt_spare_item.forEach(element1 => {
        //       element1.item_p_types.forEach(element2 => {
        //         if (element2.item_id == element.item_id) {
        //           element2.item_delete_flag = false;
        //           element2.item_group = 0;
        //           element2.selected_flag = false;
        //           element2.mapped_Flag = false;
        //         }
        //       });
        //     });
        //   }
        //   var foundIndex = this.qt_items.findIndex(x => x.item_id == element.item_id);
        //   this.qt_items[foundIndex].item_group = 0;
        //   element.item_delete_flag = false;
        //   element.item_group = 0;
        //   element.selected_flag = false;
        //   element.mapped_Flag = false;
        // });
        // let group_count = 1;
        // this.grouped_items.forEach((element) => {
        //   element.forEach((element2) => {
        //     element2.item_group = group_count;
        //   });
        //   group_count++;
        // });
        // this.groupItems();
        // this.priceUpdate();
    }

    updateQuote() {
        const hasLaborCount = this.grouped_items.every((group) => {
            return group.some((item: any) => item.item_type === '2' || item.item_type === '3');
        });
        if (!hasLaborCount) {
            this.coloredToast('danger', 'Atleast One Labour Or Generic Item Required In Each Group');
            return;
        }

        if (this.item_edit_value == 0) {
            let send_data = {
                qt_id: this.qt_v_id,
                qt_items: this.grouped_items,
                qvm_spare_total: this.spare_total,
                qvm_labour_total: this.labour_total,
                qvm_sub_total: this.quote_total,
                qvm_vat_total: this.quote_vat,
                qvm_discount: this.discount,
                qvm_note: this.qtv_details.qvm_note,
                qvm_quote_label: this.qtv_details.qvm_quote_label,
            };

            this.userServices.updateQuoteVersion(send_data).subscribe((r_data: any) => {
                if (r_data.ret_data == 'success') {
                    this.router.navigateByUrl('quotation/normal_quote/quote_list/quote_edit/' + encodeURIComponent(btoa(this.qt_id)) + '/2');
                    this.coloredToast('success', 'Quotation updated successfully');
                } else {
                    this.coloredToast('danger', "Can't create quote. Contact administrator");
                }
            });
        } else {
            let send_data = {
                qt_id: this.qt_id,
                qt_items: this.grouped_items,
                qt_version_count: 0,
                qvm_spare_total: this.spare_total,
                qvm_labour_total: this.labour_total,
                qvm_sub_total: this.quote_total,
                qvm_vat_total: this.quote_vat,
                qvm_discount: this.discount,
                qvm_note: this.qtv_details.qvm_note,
                qvm_quote_label: this.qtv_details.qvm_quote_label,
                qvm_ref_qt_version: this.qt_v_id,
            };

            this.userServices.createQuoteVersion(send_data).subscribe((r_data: any) => {
                if (r_data.ret_data == 'success') {
                    this.coloredToast('success', 'Quotation updated successfully');
                    this.router.navigateByUrl('quotation/normal_quote/quote_list/quote_edit/' + encodeURIComponent(btoa(this.qt_id)) + '/2');
                } else {
                    this.coloredToast('danger', "Can't create quote. Contact administrator");
                }
            });
        }
    }
    close() {
        this.router.navigateByUrl('quotation/normal_quote/quote_list/quote_edit/' + encodeURIComponent(btoa(this.qt_id)) + '/2');
    }

    groupCheckValue(event: any, item_data: any, item_master: any) {
        this.cdRef.detectChanges();
        if (event.target.checked) {
            if (item_data.item_type == '1') {
                let temp_grp = item_master.filter((item: any) => parseInt(item.item_group) > 0);
                if (temp_grp.length > 0) {
                    item_data.selected_flag = false;
                    this.coloredToast('danger', "Can't select more than one item from same parts");
                } else {
                    if (this.grouped_items.length > 0) {
                        var dupe_flag = false;
                        this.grouped_items.forEach((element) => {
                            let temp_grp_2 = element.filter((item: any) => parseInt(item.item_id) == parseInt(item_data.item_id));
                            if (temp_grp_2.length > 0) {
                                dupe_flag = true;
                            }
                        });
                        if (dupe_flag) {
                            item_data.selected_flag = false;
                            this.coloredToast('danger', "Can't select more than one item from same parts while grouping");
                        } else {
                            this.selected_grouping_count++;
                            item_data.item_group = this.grouped_items.length + 1;
                        }
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
