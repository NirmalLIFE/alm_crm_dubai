import { DatePipe } from '@angular/common';
import { Component, NgZone, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-svc-check-list',
  templateUrl: './svc-check-list.component.html',
  styleUrls: ['./svc-check-list.component.css']
})
export class SvcCheckListComponent implements OnInit {
  public searchedFlag: boolean = false;
  public contractFlag: boolean = false;
  public load_flag: boolean = false;
  public contractList: any = [];
  public search: string = '';
  public vin_No: any;
  public Kilometer: any;
  public reg_No: any;
  public _searchMode: 'vinNo' | 'regNo' = 'vinNo';
  public Model: any;
  // public ModelYear: any;
  public customerName: any;
  public custPhone: any;
  public customerId: any;
  public serviceContracts: any = [];
  public selectedServiceContract: any;
  public selectedFlag = false;
  public modelVersion: any;
  public svcPrice: any;
  public scv_kilometer_from: any;
  public totalWith_vatAmount: any;
  public modelYear: any;
  public typingTimer: any;
  public typingDelay: number = 300;
  public regNumbers: any = [];
  public modelName: any;
  public user_role = atob(atob(localStorage.getItem('us_role_id') || '{}'));
  public sc_type: any;
  public includeLowerKmPackages: any;
  public checkedKmList: any = [];
  public contract_details: any;
  public kmError: string = '';
  public originalServicePackages: any[] = [];

  constructor(
    public router: Router,
    private userServices: StaffPostAuthService,
    private activeRouter: ActivatedRoute,
    public datePipe: DatePipe,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    this.userServices.getServiceContractTiers().subscribe((rData: any) => {
      if (rData.ret_data == 'success') {
        this.serviceContracts = rData.tier;
      }
      this.load_flag = false;
    });
  }

  get searchMode(): 'vinNo' | 'regNo' {
    return this._searchMode;
  }

  set searchMode(mode: 'vinNo' | 'regNo') {
    this._searchMode = mode;
    this.clearSearchFields();
  }

  clearSearchFields() {
    this.vin_No = '';
    this.reg_No = '';
    this.Kilometer = '';
    this.modelYear = '';
    this.selectedServiceContract = [];
    this.searchedFlag = false;
    this.modelVersion = null;
    this.svcPrice = '';
    this.scv_kilometer_from = '';
    this.contractList = [];
  }

  searchServiceContract() {
    this.modelVersion = null;
    this.contractFlag = false;
    this.contract_details = '';
    if (this.searchMode == 'regNo') {
      if (!this.reg_No || !this.Kilometer) {
        this.coloredToast('danger', 'Please enter both Registration Number and Kilometer to search.');
        return;
      }
      this.checkByRegNo(this.reg_No);
    } else {
      if (!this.vin_No || !this.Kilometer) {
        this.coloredToast('danger', 'Please enter both VIN Number and Kilometer to search.');
        return;
      }
      this.checkByVinNo(this.vin_No);
    }
  }

  // Fetch the Vin No by regNo
  checkByRegNo(regNo: any) {
    this.load_flag = true;
    this.vin_No = '';
    this.modelYear = '';
    this.modelVersion = null;
    this.userServices.getServicePackageByRegNo({ regNo }).subscribe((rData: any) => {
      if (rData.ret_data === 'success') {
        this.vin_No = rData.data.CHASSIS_NO;
        this.modelYear = rData.data.MODEL_YEAR;
        if (rData.data.CHASSIS_NO) {
          this.checkByVinNo(rData.data.CHASSIS_NO);
        } else {
          this.load_flag = false;
          this.coloredToast('danger', `Unable to find VIN for this (${this.reg_No}) registration number. Please try with another Reg No.`);
        }
      }
    });
  }

  // Fetch the Reg No by Vin No
  checkByVinNo(vin_No: any) {
    this.load_flag = true;
    this.reg_No = '';
    this.modelYear = '';
    this.userServices.getVehicleDetailsByVinNo({ vin_No }).subscribe((rData: any) => {
      if (rData.ret_data === 'success') {
        this.vin_No = rData.data.CHASSIS_NO;
        this.modelYear = rData.data.MODEL_YEAR;
        this.reg_No = rData.data.REG_NO;
        this.customerName = rData.data.CUSTOMER_NAME;
        this.custPhone = rData.data.PHONE;
        this.customerId = rData.data.CUSTOMER_CODE;
        this.modelName = rData.data.MODEL_NAME;
        if (rData.data.REG_NO) {
          this.validateAndCheckServiceContract();
        } else {
          this.load_flag = false;
          this.coloredToast('danger', 'Unable to get Reg No, Please try again later');
        }
      }
    });
  }

  validateAndCheckServiceContract() {
    this.searchedFlag = true;
    this.selectedServiceContract = [];
    this.selectedFlag = false;
    this.modelVersion = null;
    this.svcPrice = '';
    this.scv_kilometer_from = '';
    this.contractList = [];
    this.load_flag = true;

    let data = {
      vinNo: this.vin_No,
      regNo: this.reg_No,
      kilometer: this.Kilometer,
      searchMode: this.searchMode,
      includeLowerKmPackages: this.includeLowerKmPackages,
    };
    this.userServices.checkVehicleServiceContract(data).subscribe((rData: any) => {
      if (rData.ret_data == 'success') {
        if (rData.models && rData.models.length > 1) {
          Swal.fire({
            title: 'Select Service Package Type',
            html: `
                                        <div class="flex flex-col gap-3">
                                            <button id="normalPkgBtn" class="swal2-confirm swal2-styled" style="background-color:#2563eb">
                                                Normal Service Package
                                                <div style="font-size:12px;margin-top:4px;color:#f1f1f1;">
                                                </div>
                                            </button>
                                            <button id="faceliftPkgBtn" class="swal2-confirm swal2-styled" style="background-color:#9333ea">
                                                Facelift Service Package
                                                <div style="font-size:12px;margin-top:4px;color:#f1f1f1;">
                                                </div>
                                            </button>
                                        </div>
                                    `,
            showConfirmButton: false,
            didOpen: () => {
              document.getElementById('normalPkgBtn')?.addEventListener('click', () => {
                this.ngZone.run(() => {
                  this.modelVersion = rData.models.find((m: any) => m.spmc_type == 0);
                  // Set Silver as default selected
                  this.selectedServiceContract = this.serviceContracts.find((sc: any) => sc.sct_name === 'Silver');
                  this.selectServiceContract(this.selectedServiceContract);
                  if (this.modelVersion && this.modelVersion.servicePackage) {
                    this.modelVersion.servicePackage.forEach((item: any) => {
                      item.checked = false; // initialize checked property
                    });

                    this.originalServicePackages = this.modelVersion.servicePackage;
                  }
                  this.sc_type = 0;
                  this.displayServiceContracts(); // your function to show buttons
                  this.load_flag = false;

                  Swal.close();
                });
              });
              document.getElementById('faceliftPkgBtn')?.addEventListener('click', () => {
                this.ngZone.run(() => {
                  this.modelVersion = rData.models.find((m: any) => m.spmc_type == 1);
                  // Set Silver as default selected
                  this.selectedServiceContract = this.serviceContracts.find((sc: any) => sc.sct_name === 'Silver');
                  this.selectServiceContract(this.selectedServiceContract);

                  if (this.modelVersion && this.modelVersion.servicePackage) {
                    this.modelVersion.servicePackage.forEach((item: any) => {
                      item.checked = false; // initialize checked property
                    });

                    this.originalServicePackages = this.modelVersion.servicePackage;
                  }
                  this.sc_type = 1;
                  this.displayServiceContracts();
                  this.load_flag = false;
                  Swal.close();
                });
              });
            },
            allowOutsideClick: false,
            allowEscapeKey: false,
            customClass: { popup: 'sweet-alerts rounded-icon-popup' },
          });
        } else if (rData.models && rData.models.length == 1) {
          this.modelVersion = rData.models[0];
          this.sc_type = rData.models[0].spmc_type;
          if (this.modelVersion && this.modelVersion.servicePackage) {
            this.modelVersion.servicePackage.forEach((item: any) => {
              item.checked = false; // initialize checked property
            });

            this.originalServicePackages = this.modelVersion.servicePackage;
          }
          // Set Silver as default selected
          this.selectedServiceContract = this.serviceContracts.find((sc: any) => sc.sct_name === 'Silver');
          this.selectServiceContract(this.selectedServiceContract);

          this.load_flag = false;
        } else if ((!rData.models || rData.models.length === 0) && rData.contract_details) {

          Swal.fire({
            title: 'Do you want to delete this service contract?',
            text: 'You can either delete or view the existing contract details.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'View',
            reverseButtons: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6'
          }).then((result) => {
            if (result.isConfirmed) {
              // 🔥 Call your delete function here
              this.deleteServiceContract(rData.contract_details.sc_id, rData.contract_details.sc_v_id);
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              // 👁️ Continue your current flow (e.g., view contract)
              this.contractFlag = true;
              this.contract_details = rData.contract_details;
              // console.log('contract_details>>>>>>>>>>>>>>>>>', this.contract_details);
              this.load_flag = false;
            }
          });

        }
      } else {
        Swal.fire({
          title: 'No Service Package Found',
          html: `
            <div style="font-size:15px; text-align:center; color:#374151;">
                No service package is defined for this model code.
            </div>
        `,
          icon: 'warning',
          confirmButtonText: 'OK',
          confirmButtonColor: '#2563eb',
          allowOutsideClick: false,
          allowEscapeKey: false,
          customClass: { popup: 'sweet-alerts rounded-icon-popup' },
        });
        this.load_flag = false;
      }
    });
  }

  deleteServiceContract(id: any, vehId: any) {
    const data = {
      sc_id: id,
      sc_v_id: vehId

    }

    this.userServices.deleteServiceContractCustomers(data).subscribe((rData: any) => {
      if (rData.ret_data == 'success') {
        this.reg_No = '';
        this.vin_No = '';
        this.Kilometer = '';
        this.load_flag = false;
        this.coloredToast('success', 'Service Contract Deleted Successfully');
      } else {
        this.coloredToast('danger', 'Something went wrong');
      }
    });


    console.log('data', data);

    this.load_flag = true;
  }

  displayServiceContracts() { }

  async showServiceContractWizard() {
    console.log('this.checkedKmList.length', this.checkedKmList);
    const requiredKmPackages: { [key: number]: number } = {
      1: 2, // For sct_id 1 → needs 2 packages
      2: 3, // For sct_id 2 → needs 3 packages
      3: 5, // For sct_id 3 → needs 5 packages
    };
    const sctId = Number(this.selectedServiceContract?.sct_id);
    const requiredCount = requiredKmPackages[sctId];
    if (requiredCount && this.checkedKmList.length !== requiredCount) {
      this.coloredToast('warning', `Please select atleast ${requiredCount} km package Before Proceed To Create Contract`);
      return;
    }

    const steps = ['Vehicle & Customer Details', 'Service Contract Details'];
    const values: any = [];

    const swalStep = Swal.mixin({
      width: '1000px',
      padding: '1em',
      allowOutsideClick: false,
    });

    let currentStep = 0;

    while (currentStep < steps.length) {
      let htmlContent = '';
      const buttons: any = {};

      // Step indicator (like the image you provided)
      const stepIndicator = `
      <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 30px; height: 30px; border-radius: 50%; background-color: ${currentStep === 0 ? '#00BCD4' : '#e5e7eb'
        }; color: white; display: flex; justify-content: center; align-items: center; font-weight: bold;">1</div>
          <div style="width: 60px; height: 4px; background-color: ${currentStep === 1 ? '#00BCD4' : '#e5e7eb'};"></div>
          <div style="width: 30px; height: 30px; border-radius: 50%; background-color: ${currentStep === 1 ? '#00BCD4' : '#e5e7eb'
        }; color: white; display: flex; justify-content: center; align-items: center; font-weight: bold;">2</div>
        </div>
      </div>
    `;

      if (currentStep === 0) {
        // Step 1: Combined Vehicle + Customer Details
        htmlContent = `
      ${stepIndicator}
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
        <div style="display: flex; flex-direction: column;">
            <label>Registration No</label>
            <input id="swalRegNo" style="padding:0.4em;border:1px solid #ccc;border-radius:4px;" value="${(
            this.reg_No || ''
          ).toUpperCase()}" placeholder="Reg No" oninput="this.value=this.value.toUpperCase()">
        </div>
        <div style="display: flex; flex-direction: column;">
            <label>VIN No</label>
            <input id="swalVinNo" style="padding:0.4em;border:1px solid #ccc;border-radius:4px;" value="${(
            this.vin_No || ''
          ).toUpperCase()}" placeholder="VIN No" oninput="this.value=this.value.toUpperCase()">
        </div>
        <div style="display: flex; flex-direction: column;">
            <label>Model</label>
            <input id="swalModel" style="padding:0.4em;border:1px solid #ccc;border-radius:4px;" value="${(
            this.modelName || ''
          ).toUpperCase()}" placeholder="Model" oninput="this.value=this.value.toUpperCase()">
        </div>
        <div style="display: flex; flex-direction: column;">
            <label>Model Year</label>
            <input id="swalModelYear" type="text" style="padding:0.4em;border:1px solid #ccc;border-radius:4px;" value="${this.modelYear || ''
          }" placeholder="Model Year" oninput="this.value=this.value.replace(/[^0-9]/g,'')">
        </div>
        <div style="display: flex; flex-direction: column;">
            <label>Kilometer</label>
            <input id="swalKilometer" type="text" style="padding:0.4em;border:1px solid #ccc;border-radius:4px;" value="${this.Kilometer || ''
          }" placeholder="Kilometer" oninput="this.value=this.value.replace(/[^0-9]/g,'')">
        </div>
        <div style="display: flex; flex-direction: column;">
            <label>Customer Name</label>
            <input id="swalCustName" style="padding:0.4em;border:1px solid #ccc;border-radius:4px;" value="${(
            this.customerName || ''
          ).toUpperCase()}" placeholder="Customer Name" oninput="this.value=this.value.toUpperCase()">
        </div>
        <div style="display: flex; flex-direction: column;">
            <label>Customer Phone</label>
            <input id="swalCustPhone" style="padding:0.4em;border:1px solid #ccc;border-radius:4px;" value="${this.custPhone || ''
          }" placeholder="Customer Phone" maxlength="10" oninput="this.value=this.value.replace(/[^0-9]/g,'')">
        </div>
      </div>
      `;
        buttons.confirmButtonText = 'Next →';
        buttons.showCancelButton = true;
      } else if (currentStep === 1) {
        // Step 2: Service Contract Details
        const selectedContract = this.selectedServiceContract;
        const customer = {
          name: this.customerName,
          phone: this.custPhone,
          code: this.customerId,
        };
        htmlContent = `
      ${stepIndicator}
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
        <div style="display: flex; flex-direction: column;">
            <label>Customer Code</label>
            <input value="${customer.code || ''}" disabled style="padding:0.4em;border:1px solid #ccc;border-radius:4px;">
        </div>
        <div style="display: flex; flex-direction: column;">
            <label>Customer Name</label>
            <input value="${customer.name || ''}" disabled style="padding:0.4em;border:1px solid #ccc;border-radius:4px;">
        </div>
        <div style="display: flex; flex-direction: column;">
            <label>Customer Phone</label>
            <input value="${customer.phone || ''}" disabled style="padding:0.4em;border:1px solid #ccc;border-radius:4px;">
        </div>
        <div style="display: flex; flex-direction: column;">
            <label>Selected Service Contract</label>
            <input value="${selectedContract?.sct_name || ''}" disabled style="padding:0.4em;border:1px solid #ccc;border-radius:4px;">
        </div>
        <div style="display: flex; flex-direction: column;">
            <label>Contract KM Start</label>
            <input value="${this.scv_kilometer_from?.km_value || ''}" disabled style="padding:0.4em;border:1px solid #ccc;border-radius:4px;">
        </div>
        <div style="display: flex; flex-direction: column;">
            <label>No. of Services</label>
            <input value="${selectedContract?.sct_services || ''}" disabled style="padding:0.4em;border:1px solid #ccc;border-radius:4px;">
        </div>
        <div style="display: flex; flex-direction: column;">
            <label>Contract Price</label>
            <input value="${this.svcPrice || ''}" disabled style="padding:0.4em;border:1px solid #ccc;border-radius:4px;">
        </div>
      </div>
      `;
        buttons.confirmButtonText = 'Create Contract';
        buttons.showCancelButton = true;
        buttons.cancelButtonText = 'Go Back';
      }

      const result = await swalStep.fire({
        title: steps[currentStep],
        html: htmlContent,
        ...buttons,
        preConfirm: () => {
          if (currentStep === 0) {
            const regNo = (document.getElementById('swalRegNo') as HTMLInputElement).value.trim().toUpperCase();
            const vinNo = (document.getElementById('swalVinNo') as HTMLInputElement).value.trim().toUpperCase();
            const model = (document.getElementById('swalModel') as HTMLInputElement).value.trim().toUpperCase();
            const modelYear = (document.getElementById('swalModelYear') as HTMLInputElement).value.trim();
            const kilometer = (document.getElementById('swalKilometer') as HTMLInputElement).value.trim();
            const custName = (document.getElementById('swalCustName') as HTMLInputElement).value.trim().toUpperCase();
            const custPhone = (document.getElementById('swalCustPhone') as HTMLInputElement).value.trim();

            if (!regNo || !vinNo || !model || !modelYear || !kilometer || !custName || !custPhone) {
              Swal.showValidationMessage('All fields are required');
              return false;
            }

            // ✅ Always return an object
            return { regNo, vinNo, model, modelYear, kilometer, custName, custPhone };
          }

          if (currentStep === 1) {
            const contract = {
              selectedContractId: this.selectedServiceContract?.sct_id,
              svcPrice: this.svcPrice,
              km_from: this.scv_kilometer_from?.km_value,
            };
            if (!contract.selectedContractId) {
              Swal.showValidationMessage('No service contract selected');
              return false;
            }

            // ✅ Always return an object
            return contract;
          }

          // ✅ Added this default return to satisfy TypeScript
          return null;
        },
      });

      if (result.isConfirmed && result.value) {
        values[currentStep] = result.value;

        if (currentStep === 1) {
          const vehicleCustomer = values[0];
          const contract = result.value;
          const payload = {
            vin_no: vehicleCustomer.vinNo,
            reg_no: vehicleCustomer.regNo,
            vehicle_model: vehicleCustomer.model,
            model_year: vehicleCustomer.modelYear,
            kilometer: contract.km_from,
            customerId: this.customerId,
            svcId: contract.selectedContractId,
            price: contract.svcPrice,
            searchMode: this.searchMode,
            sc_type: this.sc_type,
            checkedKmList: this.checkedKmList,
          };

          this.userServices.createServiceContract(payload).subscribe((res: any) => {
            Swal.fire({
              icon: res.ret_data ? 'success' : 'error',
              title: res.ret_data ? 'Service Contract Created' : 'Failed',
              html: res.ret_data ? `Contract created` : 'Try again',
              confirmButtonText: 'OK',
            }).then(() => {
              // ✅ Only clear the page if creation was successful
              if (res.ret_data === 'success') {
                this.clearPage();
              }
            });
          });
        }

        currentStep++;
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        if (currentStep > 0) currentStep--;
        else break;
      } else {
        break;
      }
    }
  }

  clearPage(): void {
    // Flags
    this.searchedFlag = false;
    this.contractFlag = false;
    this.load_flag = false;

    // Lists & arrays
    this.serviceContracts = [];
    this.checkedKmList = [];
    this.regNumbers = [];

    // Text / Input fields
    this.search = '';
    this.vin_No = '';
    this.Kilometer = '';
    this.reg_No = '';
    this.modelName = '';
    this.Model = '';
    this.modelYear = ''; // keeping both since both exist
    this.customerName = '';
    this.custPhone = '';
    this.customerId = '';
    this.svcPrice = '';
    this.scv_kilometer_from = '';
    this.sc_type = '';
    this.includeLowerKmPackages = '';
    this.contract_details = '';

    // Selection objects
    this.selectedServiceContract = null;
    this.modelVersion = null;
  }

  /**
   * Handles the selection of a service contract (Silver, Gold, Platinum, etc.)
   * Automatically checks all items in limitedServicePackages and recalculates totals.
   */
  selectServiceContract(serviceContract: any) {
    // Step 1: Set selected contract flags
    this.selectedFlag = true;
    this.selectedServiceContract = serviceContract;

    // Step 2: Reset all existing checkbox selections
    if (this.modelVersion && this.modelVersion.servicePackage) {
      this.modelVersion.servicePackage.forEach((item: any) => (item.checked = false));
    }

    // Step 3: Reset totals and selected kilometer list
    this.svcPrice = 0;
    this.checkedKmList = [];

    // ✅ Step 4: Automatically check only the first (lowest km) item
    if (this.limitedServicePackages.length > 0) {
      const firstItem = this.limitedServicePackages[0];
      firstItem.checked = true; // mark visually checked
      this.onCheckboxChange(0); // trigger checkbox logic for first item
    }
  }

  /**
   * Handles checkbox changes for each kilometer item.
   * Ensures only allowed items (based on contract) are selected consecutively.
   */
  onCheckboxChange(itemIndex: number) {
    if (!this.selectedServiceContract) return;

    // Step 1: Get the limit of services allowed for the selected contract
    const limit = Number(this.selectedServiceContract.sct_services); // e.g. 2 for Silver, 3 for Gold
    const items = this.limitedServicePackages;

    // Step 2: Remember if the clicked item is currently checked
    const isCurrentlyChecked = items[itemIndex].checked;

    // Step 3: Always reset all items first (ensures only one active block)
    items.forEach((item: any) => (item.checked = false));

    if (isCurrentlyChecked) {
      // Step 4: Check consecutive items starting from the clicked index
      for (let i = itemIndex; i < itemIndex + limit && i < items.length; i++) {
        items[i].checked = true;
      }

      // Update current kilometer selection reference
      this.scv_kilometer_from = {
        km_id: items[itemIndex].km_id ?? null,
        km_value: items[itemIndex].km_value ?? null,
      };
    } else {
      // If unchecked → reset all
      items.forEach((item: any) => (item.checked = false));

      // Still update current kilometer data
      this.scv_kilometer_from = {
        km_id: items[itemIndex].km_id ?? null,
        km_value: items[itemIndex].km_value ?? null,
      };
    }

    // Step 5: Prepare an array of checked items (km_id + higherTotal)
    this.checkedKmList = items
      .filter((item: any) => item.checked)
      .map((item: any) => ({
        km_id: item.km_id,
        higherTotal: item.higherTotal,
      }));

    // Step 6: Recalculate total price based on checked items
    this.calculateSvcPrice();
  }

  // selectServiceContract(serviceContract: any) {
  //     this.selectedFlag = true;
  //     this.selectedServiceContract = serviceContract;

  //     // Step 1: Reset all KM selections in the full list
  //     if (this.modelVersion && this.modelVersion.servicePackage) {
  //         this.modelVersion.servicePackage.forEach((item: any) => (item.checked = false));
  //     }

  //     // Step 2: Reset service price and selected KM list
  //     this.svcPrice = 0;
  //     this.checkedKmList = [];

  //     // ✅ Step 3: Check (select) all items in limitedServicePackages
  //     this.limitedServicePackages.forEach((item: any) => {
  //         item.checked = true;
  //     });

  //     // Step 4: Recalculate total
  //     this.calculateSvcPrice();
  // }

  // onCheckboxChange(itemIndex: number) {
  //     if (!this.selectedServiceContract) return;

  //     const limit = Number(this.selectedServiceContract.sct_services); // number of consecutive checkboxes allowed
  //     const items = this.originalServicePackages.slice(0, limit);

  //     // const items = this.modelVersion.servicePackage;

  //     const isCurrentlyChecked = items[itemIndex].checked;

  //     // Step 1: Always clear all first (we only allow one active block)
  //     items.forEach((item: any) => (item.checked = false));

  //     if (isCurrentlyChecked) {
  //         // Step 2: Check only consecutive ones from clicked index
  //         for (let i = itemIndex; i < itemIndex + limit && i < items.length; i++) {
  //             items[i].checked = true;
  //         }

  //         this.scv_kilometer_from = {
  //             km_id: items[itemIndex].km_id ?? null,
  //             km_value: items[itemIndex].km_value ?? null,
  //         };
  //     } else {
  //         // If user unchecks the clicked box → keep all unchecked
  //         items.forEach((item: any) => (item.checked = false));
  //         this.scv_kilometer_from = {
  //             km_id: items[itemIndex].km_id ?? null,
  //             km_value: items[itemIndex].km_value ?? null,
  //         };
  //     }

  //     // Step 3: Collect all checked km_id and higherTotal into an array
  //     this.checkedKmList = items
  //         .filter((item: any) => item.checked)
  //         .map((item: any) => ({
  //             km_id: item.km_id,
  //             higherTotal: item.higherTotal,
  //         }));

  //     // Step 4: Recalculate total price
  //     this.calculateSvcPrice();
  // }

  calculateSvcPrice() {
    if (!this.modelVersion || !this.selectedServiceContract) {
      this.svcPrice = 0;
      return;
    }

    // 1️⃣ Get sum of all checked items
    const checkedItemsTotal = this.modelVersion.servicePackage
      .filter((item: any) => item.checked)
      .reduce((sum: number, item: any) => sum + (item.higherTotal || 0), 0);

    // 2️⃣ Extract additional amounts safely
    const pickupAndDrop = Number(this.selectedServiceContract.sct_pickup_and_drop) || 0;
    const saIncentive = Number(this.selectedServiceContract.sct_sa_incentive) || 0;
    const excessDiscountPercent = Number(this.selectedServiceContract.sct_excess_discount) || 0;
    const discountPercent = Number(this.selectedServiceContract.sct_discount) || 0;

    // 3️⃣ Calculate subtotal
    const subtotal = checkedItemsTotal + pickupAndDrop + saIncentive;

    // 4️⃣ Add 5% tax
    const taxAmount = subtotal * 0.05;
    const totalWithTax = subtotal + taxAmount;

    // ➕ Step 6: Add excess discount as an *extra charge* based on percent
    const excessAmount = (totalWithTax * excessDiscountPercent) / 100;
    const totalWithExcess = totalWithTax + excessAmount;

    this.totalWith_vatAmount = parseFloat(totalWithExcess.toFixed(2));

    // Step 7 Apply discount
    const discountAmount = (totalWithTax * discountPercent) / 100;
    const finalTotal = totalWithTax - discountAmount;

    // Step 8 Save final value
    this.svcPrice = parseFloat(finalTotal.toFixed(2));
  }

  // Called when user selects a suggestion
  onRegNoSelected(selectedRegNo: string) {
    this.reg_No = selectedRegNo;
  }

  // Called on every input in ng-autocomplete
  onRegNoTyping(value: string) {
    clearTimeout(this.typingTimer);

    if (value.length >= 2) {
      this.typingTimer = setTimeout(() => {
        this.fetchRegNoSuggestions(value);
      }, this.typingDelay);
    } else {
      this.regNumbers = [];
    }
  }

  // Fetch autocomplete suggestions
  fetchRegNoSuggestions(regNo: string) {
    this.userServices.getCustomerRegNo({ regNo }).subscribe((rData: any) => {
      if (rData.ret_data === 'success') {
        this.regNumbers = rData.suggestions || [];
      }
    });
  }

  allowOnlyNumbers(event: KeyboardEvent): boolean {
    const char = event.key;
    // Allow only digits 0–9
    if (!/^[0-9]$/.test(char)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  getContractClass(contract: any): string {
    const isSelected = this.selectedServiceContract === contract;

    switch (contract.sct_name) {
      case 'Silver':
        return isSelected
          ? 'bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 text-gray-900 hover:from-slate-300 hover:to-slate-500'
          : 'border border-slate-400 text-slate-700 hover:bg-slate-100';

      case 'Gold':
        return isSelected
          ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white hover:from-amber-500 hover:to-amber-700'
          : 'border border-amber-400 text-amber-700 hover:bg-amber-100';

      case 'Platinum':
        return isSelected
          ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:from-purple-500 hover:to-pink-600'
          : 'border border-indigo-500 text-indigo-700 hover:bg-indigo-100';

      default:
        return isSelected ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'border border-gray-300 text-gray-700 hover:bg-gray-100';
    }
  }

  get limitedServicePackages() {
    if (!this.modelVersion?.servicePackage) return [];

    // ✅ Sort the base array before slicing (to ensure ascending km_value)
    const allPackages = [...this.modelVersion.servicePackage].sort((a: any, b: any) => a.km_value - b.km_value);

    // const allPackages = this.modelVersion.servicePackage;

    if (!this.selectedServiceContract) return allPackages;

    switch (this.selectedServiceContract.sct_name) {
      case 'Silver':
        return allPackages.slice(0, 2);
      case 'Gold':
        return allPackages.slice(0, 3);
      default:
        return allPackages;
    }
  }

  validateKilometer() {
    const km = Number(this.Kilometer);
    // Empty or invalid value
    if (!this.Kilometer || isNaN(km)) {
      this.kmError = 'Please enter a valid number';
      return;
    }
    // Zero or negative
    if (km <= 0) {
      this.kmError = 'Kilometer must be greater than 0';
      return;
    }
    // More than 3 lakh
    if (km > 300000) {
      this.kmError = 'Kilometer cannot exceed 3,00,000';
      // Optional: auto-cap the value
      this.Kilometer = '300000';
      return;
    }
    // No error
    this.kmError = '';
  }

  printServiceContract(contract_details: any) {
    const encodedus_role_id = btoa(btoa(this.user_role)); // Double Base64 encode user ID
    // Construct the URL with encoded parameters
    const url = `${environment.base_url}/HTMLPdfController/printServiceContractPDF?id=${btoa(btoa(contract_details.sc_id))}&role_id=${encodedus_role_id}`;
    // Open the print URL in a new browser tab
    window.open(url, '_blank');
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
