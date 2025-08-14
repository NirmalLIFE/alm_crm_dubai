import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-parts-price-request-admin',
    templateUrl: './parts-price-request-admin.component.html',
    styleUrls: ['./parts-price-request-admin.component.css'],
})
export class PartsPriceRequestAdminComponent implements OnInit {
    public requestedPartPrices: any = [];
    public load_flag: boolean = true;
    public buttonFlag: boolean = false;

    // default rounding choices (you can expose inputs)
    roundingMode = 'nearest_threshold'; // ceil_up | nearest | nearest_threshold | none
    roundingMultiple = 10;
    roundingThreshold = 10;

    ngOnInit(): void {
        this.getRequestedPrices();
    }

    constructor(private userServices: StaffPostAuthService, public router: Router) {}

    getRequestedPrices() {
        this.load_flag = true;

        this.requestedPartPrices = [];
        this.userServices.getRequestedPrices().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.requestedPartPrices = rdata.requests;
                this.load_flag = false;
                // console.log('rertuern', rdata.requests);
            } else {
                this.load_flag = false;
            }
        });
    }

    acceptPrice(pkg: any) {
        if (this.buttonFlag) return;

        Swal.fire({
            title: 'Set Threshold for Price Rounding',
            html: `
    <div style="text-align:left; font-size:14px;">
        <p>
            <strong>Threshold</strong> is the rounding step applied to the
            <em>new display price</em> after adding the price difference.
            The result is rounded to the nearest multiple of this threshold.
        </p>

        <div style="display:flex; gap:20px; margin-top:8px;">
            <!-- Example 1 -->
            <div style="flex:1; border:1px solid #ccc; padding:8px; border-radius:4px;">
                <p><strong>Example 1 (no change)</strong></p>
                Current display price: <strong>1040</strong><br>
                Price difference: <strong>+20</strong><br>
                Raw new price = 1040 + 20 = <strong>1060</strong><br>
                Threshold = 5 → <strong>1060</strong> (already multiple of 5)<br>
                Threshold = 10 → <strong>1060</strong> (already multiple of 10)
            </div>

            <!-- Example 2 -->
            <div style="flex:1; border:1px solid #ccc; padding:8px; border-radius:4px;">
                <p><strong>Example 2 (price changes)</strong></p>
                Current display price: <strong>1040</strong><br>
                Price difference: <strong>+12.35</strong><br>
                Raw new price = 1040 + 12.35 = <strong>1052.35</strong><br>
                Threshold = 5 → <strong>1050</strong><br>
                Threshold = 10 → <strong>1050</strong>
            </div>
        </div>

        <p style="margin-top:8px; color:#d33;">
            <strong>Note:</strong> Updating this part's price will also
            update the display price in all Service Packages that use it.
        </p>
    </div>
`,

            input: 'number',
            inputValue: this.roundingThreshold || 10,
            inputAttributes: {
                min: '1',
                step: '1',
            },
            width: 800,
            showCancelButton: true,
            confirmButtonText: 'Apply & Update',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (!result.isConfirmed) return;

            this.buttonFlag = true;

            const data = {
                pm_brand: pkg.pm_brand,
                pm_code: pkg.pm_code,
                pm_id: pkg.pm_id,
                pm_new_price: pkg.pm_new_price,
                pm_price: pkg.pm_price,
                pm_sp_pm_id: pkg.pm_sp_pm_id,
                rounding: this.roundingMode,
                multiple: this.roundingMultiple,
                threshold: Number(result.value) || 10,
            };

            this.userServices.acceptPrice(data).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Price Updated',
                        text: `New price of ${pkg.pm_new_price} has been added to item ${pkg.pm_code} (${pkg.brand_name}).`,
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'OK',
                    });
                    this.getRequestedPrices();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Update Failed',
                        text: 'Something went wrong while updating the price.',
                        confirmButtonColor: '#d33',
                        confirmButtonText: 'OK',
                    });
                }
                this.buttonFlag = false;
            });
        });
    }

    // acceptPrice(pkg: any) {
    //     if (this.buttonFlag) return;

    //     this.buttonFlag = true;
    //     const data = {
    //         pm_brand: pkg.pm_brand,
    //         pm_code: pkg.pm_code,
    //         pm_id: pkg.pm_id,
    //         pm_new_price: pkg.pm_new_price,
    //         pm_price: pkg.pm_price,
    //         pm_sp_pm_id: pkg.pm_sp_pm_id,
    //         // rounding controls
    //         rounding: this.roundingMode,
    //         multiple: this.roundingMultiple,
    //         threshold: this.roundingThreshold,
    //     };
    //     this.userServices.acceptPrice(data).subscribe((rdata: any) => {
    //         if (rdata.ret_data == 'success') {
    //             Swal.fire({
    //                 icon: 'success',
    //                 title: 'Price Updated',
    //                 text: `New price of ${pkg.pm_new_price} has been added to item ${pkg.pm_code} (${pkg.brand_name}).`,
    //                 confirmButtonColor: '#3085d6',
    //                 confirmButtonText: 'OK',
    //             });
    //             this.getRequestedPrices();
    //             this.buttonFlag = false;
    //         } else {
    //             Swal.fire({
    //                 icon: 'error',
    //                 title: 'Update Failed',
    //                 text: 'Something went wrong while updating the price.',
    //                 confirmButtonColor: '#d33',
    //                 confirmButtonText: 'OK',
    //             });
    //             this.buttonFlag = false;
    //         }
    //     });
    // }

    confirmCancelPrice(pm_id: any) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Once declined, this price change request cannot be reverted.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, Decline it',
            cancelButtonText: 'No, Keep it',
        }).then((result) => {
            if (result.isConfirmed) {
                this.cancelPrice(pm_id);
            }
        });
    }

    cancelPrice(pkg: any) {
        if (this.buttonFlag) return;

        this.buttonFlag = true;

        const data = {
            pm_brand: pkg.pm_brand,
            pm_code: pkg.pm_code,
            pm_id: pkg.pm_id,
            pm_new_price: pkg.pm_new_price,
            pm_price: pkg.pm_price,
            pm_sp_pm_id: pkg.pm_sp_pm_id,
        };
        this.userServices.cancelPrice(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'Cancelled',
                    text: 'The price change has been cancelled.',
                    confirmButtonColor: '#3085d6',
                });
                this.getRequestedPrices();

                this.buttonFlag = false;
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to cancel the price change.',
                    confirmButtonColor: '#d33',
                });
                this.buttonFlag = false;
            }
        });
    }
}
