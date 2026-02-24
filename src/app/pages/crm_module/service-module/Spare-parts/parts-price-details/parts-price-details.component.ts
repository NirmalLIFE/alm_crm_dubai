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
  buttonClicked: boolean = false;
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
  priceDiff: any;
  searchTerm: string = '';

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

          this.priceDiff = difference;

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

                  let adjustedMarkup = originalMarkup + roundingAdjustment;

                  // clamp to 0
                  if (adjustedMarkup < 0) {
                    adjustedMarkup = 0;
                  }

                  // detect zero or negative condition
                  const isZeroOrNegative = adjustedMarkup <= 0;

                  return {
                    ...km,
                    skmp_id: km.skmp_id,
                    original_markup_price: originalMarkup,
                    original_display_price: originalDisplay,

                    new_display_price: roundedDisplay,
                    new_markup_price: adjustedMarkup,

                    hasZeroOrNegativeMarkup: isZeroOrNegative
                  };

                });

                const hasIssue = updatedKms.some((k: any) => k.hasZeroOrNegativeMarkup);

                this.part.model_codes.push({
                  modelCode: model.spmc_value,
                  spmc_value: model.spmc_value,
                  spmc_vin_no: model.spmc_vin_no,
                  spmc_model_year: model.spmc_model_year,
                  spmc_variant: model.spmc_variant,
                  spmc_type: model.spmc_type,
                  kms: updatedKms,
                  sp_spare_qty: spareQty,
                  selectedKm: updatedKms.length ? updatedKms[0] : null,
                  hasMarkupIssue: hasIssue,
                });
                // console.log("this is the part", this.part);
              });
            });
          }
          this.isLoading = false;
        }

      });
  }



  updateSelectedPrices() {
    if (this.buttonClicked) return;
    this.buttonClicked = true;

    if (this.selectedModelCodes.length === 0) return;
    this.buttonFlag = true;
    const updated_kms: any[] = [];
    this.part.model_codes.forEach((model: any) => {

      if (this.selectedModelCodes.includes(model.modelCode)) {
        model.kms.forEach((km: any) => {
          updated_kms.push({
            spkmp_id: km.spkmp_id,
            modelCode: km.spmc_value,
            new_display_price: km.new_display_price,
            new_markup_price: km.new_markup_price
          });
        });
      }
    });

    const payload = {
      pm_id: this.part.pm_id,
      pm_price: this.part.pm_price,
      pm_new_price: this.part.pm_new_price,
      updated_kms: updated_kms
    };

    // console.log(payload);

    this.userServices.updateSelectedPrices(payload)
      .subscribe((rdata: any) => {
        this.buttonFlag = false;
        if (rdata.ret_data === 'success') {
          this.buttonClicked = false;

          this.coloredToast('success', 'Prices Updated Successfully!');
          this.router.navigateByUrl('/requestedPartsPrice');
        } else {
          this.buttonClicked = false;

          this.buttonFlag = false;
          this.coloredToast('danger', 'Something went wrong!');
        }
      }, () => {
        this.buttonClicked = false;

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
      const spareQty = Number(model.sp_spare_qty || 1);
      model.kms.forEach((km: any) => {

        const originalMarkup = Number(km.original_markup_price || 0);
        const originalDisplay = Number(km.original_display_price || 0);

        const baseMarkup = originalMarkup + difference;
        const baseDisplay = originalDisplay + (difference * spareQty);

        const roundedDisplay =
          threshold > 0
            ? this.roundToThreshold(baseDisplay, threshold)
            : baseDisplay;

        const roundingAdjustment = roundedDisplay - baseDisplay;

        // km.new_display_price = roundedDisplay;
        // km.new_markup_price = originalMarkup + roundingAdjustment;
        let adjustedMarkup = originalMarkup + roundingAdjustment;

        if (adjustedMarkup < 0) {
          adjustedMarkup = 0;
        }

        km.new_display_price = roundedDisplay;
        km.new_markup_price = adjustedMarkup;
        km.hasZeroOrNegativeMarkup = adjustedMarkup <= 0;

      });
      model.hasMarkupIssue = model.kms.some(
        (km: any) => km.hasZeroOrNegativeMarkup
      );
    });
  }

  toggleSelectAll(event: any) {
    const checked = event.target.checked;

    this.selectedModelCodes = [];

    if (checked) {
      this.part.model_codes.forEach((model: any) => {
        this.selectedModelCodes.push(model.modelCode);
      });
    } else {
      this.selectedModelCodes = [];
    }

    this.syncSelectedKmsFromSelectedModelCodes();
  }


  toggleModelSelection(model: any, event: any) {
    const checked = event.target.checked;
    if (checked) {
      if (!this.selectedModelCodes.includes(model.modelCode)) {
        this.selectedModelCodes.push(model.modelCode);
      }
    } else {

      this.selectedModelCodes = this.selectedModelCodes.filter(code => code !== model.modelCode);
    }
    this.syncSelectedKmsFromSelectedModelCodes();
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

  filteredModels() {
    if (!this.searchTerm) {
      return this.part?.model_codes || [];
    }

    const term = this.searchTerm.toLowerCase();

    return (this.part?.model_codes || []).filter((model: any) =>
      model.spmc_value?.toLowerCase().includes(term) ||
      model.spmc_vin_no?.toLowerCase().includes(term)
    );
  }



  private syncSelectedKmsFromSelectedModelCodes() {
    this.selectedKms = [];

    if (!this.part?.model_codes?.length) return;

    this.part.model_codes.forEach((model: any) => {
      if (!this.selectedModelCodes.includes(model.modelCode)) return;
      // ensure a km is selected for this model before pushing
      if (model.selectedKm) {
        this.selectedKms.push({
          // use the same key name as your backend expects. 
          // I use `skmp_id` here because your component uses it earlier.
          // If backend expects `spkmp_id` change this to that.
          skmp_id: model.selectedKm.skmp_id,
          new_display_price: model.selectedKm.new_display_price,
          new_markup_price: model.selectedKm.new_markup_price
        });
      }
    });
  }


  getProblematicKilometers(model: any): string {
    if (!model?.kms) return '';

    return model.kms
      .filter((km: any) => km.hasZeroOrNegativeMarkup)
      .map((km: any) =>
        km.km_id == 1
          ? 'Quick Lube'
          : (km.km_value / 1000) + 'K km'
      )
      .join(', ');
  }

  hasAnyMarkupIssue(): boolean {
    if (!this.part?.model_codes) return false;

    return this.part.model_codes.some(
      (model: any) => model.hasMarkupIssue
    );
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
