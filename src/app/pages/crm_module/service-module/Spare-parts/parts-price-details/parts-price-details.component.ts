import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-parts-price-details',
  templateUrl: './parts-price-details.component.html',
  styleUrls: ['./parts-price-details.component.css']
})
export class PartsPriceDetailsComponent implements OnInit {

  selectedModelCodes: string[] = [];
  // selectedModelCodes: string[] = [];
  expandedRows: number[] = [];
  selectedThreshold: number = 10;
  buttonFlag: boolean = false;
  avgIncrease = 0;
  totalImpact = 0;
  priceDifference = 0;
  percentageChange = 0;
  pm_id: any;
  part: any;
  selectedKms: any[] = [];
  isLoading: boolean = true;


  ngOnInit(): void {
    // this.calculateValues();
  }

  constructor(private userServices: StaffPostAuthService, private activeRouter: ActivatedRoute, public router: Router) {
    const encodedId = this.activeRouter.snapshot.paramMap.get('pm_id');

    if (!encodedId) {
      console.error('pm_id missing in route');
      return;
    }

    try {
      // FIRST decode URI, THEN base64 decode
      this.pm_id = atob(decodeURIComponent(encodedId));
    } catch (error) {
      console.error('Invalid base64 value:', encodedId);
      return;
    }

    this.isLoading = true;
    this.userServices.getPartsPriceDetails({ pm_id: this.pm_id })
      .subscribe((rdata: any) => {
        if (rdata.ret_data === 'success') {

          const data = rdata.requestedpart;

          const threshold = Number(this.selectedThreshold || 0);
          const difference =
            Number(data.pm_new_price || 0) - Number(data.pm_price || 0);

          this.part = {
            ...data,
            model_codes: []
          };

          if (data.pricing_details?.length) {
            data.pricing_details.forEach((spare: any) => {
              const spareQty = Number(spare.sp_spare_qty || 1);
              spare.models.forEach((model: any) => {
                const updatedKms = (model.kms || []).map((km: any) => {

                  const originalMarkup = Number(km.markup_price || 0);
                  const originalDisplay = Number(km.display_price || 0);

                  // const baseMarkup = originalMarkup + difference;
                  const baseDisplay = originalDisplay + (difference * spareQty);

                  const roundedDisplay = this.roundToThreshold(baseDisplay, threshold);

                  // 🔥 Calculate rounding adjustment
                  const roundingAdjustment = roundedDisplay - baseDisplay;

                  // 🔥 Add rounding impact into markup
                  const adjustedMarkup = originalMarkup + roundingAdjustment;

                  return {
                    ...km,
                    skmp_id: km.skmp_id,
                    original_markup_price: originalMarkup,
                    original_display_price: originalDisplay,

                    new_display_price: roundedDisplay,
                    new_markup_price: adjustedMarkup
                  };

                });

                this.part.model_codes.push({
                  modelCode: model.spmc_value,
                  spmc_value: model.spmc_value,
                  spmc_vin_no: model.spmc_vin_no,
                  spmc_model_year: model.spmc_model_year,
                  spmc_variant: model.spmc_variant,
                  spmc_type: model.spmc_type,
                  kms: updatedKms,
                  sp_spare_qty: spareQty,
                  selectedKm: updatedKms.length ? updatedKms[0] : null
                });
                console.log("this is the part", this.part);

              });

            });

          }

          this.isLoading = false;

          // this.calculateValues();
        }

      });

  }



  updateSelectedPrices() {
    if (this.selectedModelCodes.length === 0) return;
    this.buttonFlag = true;
    const updated_kms: any[] = [];
    this.part.model_codes.forEach((model: any) => {

      if (this.selectedModelCodes.includes(model.modelCode)) {
        model.kms.forEach((km: any) => {
          updated_kms.push({
            spkmp_id: km.spkmp_id,
            new_display_price: km.new_display_price,
            new_markup_price: km.new_markup_price
          });
        });
      }
    });

    const payload = {
      pm_id: this.part.pm_id,
      pm_new_price: this.part.pm_new_price,
      updated_kms: updated_kms
    };

    console.log(payload);

    this.userServices.updateSelectedPrices(payload)
      .subscribe((rdata: any) => {
        this.buttonFlag = false;
        if (rdata.ret_data === 'success') {
          this.coloredToast('success', 'Prices Updated Successfully!');
          this.router.navigateByUrl('/requestedPartsPrice');
        } else {
          this.buttonFlag = false;
          this.coloredToast('danger', 'Something went wrong!');
        }
      }, () => {
        this.buttonFlag = false;
      });
  }




  roundToThreshold(value: number, threshold: number): number {
    if (!threshold || threshold === 0) {
      return Number(value);
    }

    return Math.round(value / threshold) * threshold;
  }



  recalculateWithThreshold() {

    if (!this.part?.model_codes) return;

    const threshold = Number(this.selectedThreshold || 0);

    const difference =
      Number(this.part.pm_new_price || 0) -
      Number(this.part.pm_price || 0);

    this.part.model_codes.forEach((model: any) => {

      model.kms.forEach((km: any) => {

        const originalMarkup = Number(km.original_markup_price || 0);
        const originalDisplay = Number(km.original_display_price || 0);

        // Step 1: Apply price difference
        const baseMarkup = originalMarkup + difference;
        const baseDisplay = originalDisplay + difference;

        // Step 2: Apply threshold rounding
        const roundedDisplay =
          threshold > 0
            ? this.roundToThreshold(baseDisplay, threshold)
            : baseDisplay;

        // Step 3: Calculate rounding adjustment
        const roundingAdjustment = roundedDisplay - baseDisplay;

        // Step 4: Final values (same logic as working code)
        km.new_display_price = roundedDisplay;
        km.new_markup_price = originalMarkup + roundingAdjustment;

      });

    });

  }




  calculateValues() {

    if (!this.part) return;

    const oldPrice = this.part.pm_price || 0;
    const newPrice = this.part.pm_new_price || 0;

    this.priceDifference = newPrice - oldPrice;

    this.percentageChange =
      oldPrice ? (this.priceDifference / oldPrice) * 100 : 0;

    this.avgIncrease = this.priceDifference * 0.8;

    this.totalImpact =
      (this.part.model_codes?.length || 0) * this.avgIncrease;
  }


  applyThreshold() {

    if (!this.selectedThreshold) return;

    this.buttonFlag = true;

    const data = {
      pm_id: this.part.pm_id,
      pm_code: this.part.pm_code,
      pm_brand: this.part.pm_brand,
      pm_price: this.part.pm_price,
      pm_new_price: this.part.pm_new_price,
      pm_sp_pm_id: this.part.pm_sp_pm_id,
      threshold: this.selectedThreshold
    };

    this.userServices.acceptPrice(data).subscribe((rdata: any) => {

      if (rdata.ret_data === 'success') {



      } else {

      }

      this.buttonFlag = false;

    }, () => {
      this.buttonFlag = false;
    });

  }

  toggleSelectAll(event: any) {

    const checked = event.target.checked;

    this.selectedModelCodes = [];
    this.selectedKms = [];

    if (checked) {

      this.part.model_codes.forEach((model: any) => {

        // ✅ For UI
        this.selectedModelCodes.push(model.modelCode);

        // ✅ For payload
        if (model.selectedKm) {
          this.selectedKms.push({
            skmp_id: model.selectedKm.skmp_id,
            new_display_price: model.selectedKm.new_display_price,
            new_markup_price: model.selectedKm.new_markup_price
          });
        }

      });

    }

  }



  toggleModelSelection(model: any, event: any) {

    const checked = event.target.checked;

    if (!model.selectedKm) return;

    const payload = {
      skmp_id: model.selectedKm.skmp_id,
      new_display_price: model.selectedKm.new_display_price,
      new_markup_price: model.selectedKm.new_markup_price
    };

    if (checked) {

      // ✅ UI state
      if (!this.selectedModelCodes.includes(model.modelCode)) {
        this.selectedModelCodes.push(model.modelCode);
      }

      // ✅ payload state
      if (!this.selectedKms.find(x => x.skmp_id === payload.skmp_id)) {
        this.selectedKms.push(payload);
      }

    } else {

      // remove from UI
      this.selectedModelCodes =
        this.selectedModelCodes.filter(code => code !== model.modelCode);

      // remove from payload
      this.selectedKms =
        this.selectedKms.filter(x => x.skmp_id !== payload.skmp_id);

    }

  }



  isAllSelected(): boolean {
    return this.selectedModelCodes.length === (this.part?.model_codes?.length || 0);
  }


  toggleRow(index: number) {
    if (this.expandedRows.includes(index)) {
      this.expandedRows = this.expandedRows.filter(i => i !== index);
    } else {
      this.expandedRows.push(index);
    }
  }


  trackByModel(index: number, item: any) {
    return item.modelCode; // or unique id
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
