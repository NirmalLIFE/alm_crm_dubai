import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-service-edit',
    templateUrl: './service-edit.component.html',
    styleUrls: ['./service-edit.component.css'],
})
export class ServiceEditComponent implements OnInit {
    public load_flag: boolean = true;
    service_id: any;
    service_details: any = [];
    Veh_variants: any = [];
    kilometers: any[] = [];
    engines = [];
    descriptions: any[] = [];
    partcodes: any[] = [];
    vingroups = [];
    partsList: any[] = [];
    labourList: any[] = [];
    serviceFlag = true;

    filteredList: any[] = [];
    allServices: any[] = [];

    constructor(private userServices: StaffPostAuthService, private activeRouter: ActivatedRoute, public router: Router) {
        this.service_id = this.activeRouter.snapshot.queryParamMap.get('service_id');
        const startNumber: number = 15000;
        const endNumber: number = 1000000;
        const difference: number = 15000;

        for (let i = startNumber; i <= endNumber; i += difference) {
            this.kilometers.push(i);
        }

        this.userServices.getEngineNo().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.engines = rdata.engineNo;
            }
        });

        this.userServices.getSparePartsDesandPart().subscribe((rdata: any) => {
            if ((rdata.ret_data = 'success')) {
                this.descriptions = rdata.descriptions.map(function (i: any) {
                    return i.inv_item_description;
                });
                this.partcodes = rdata.partNo.map(function (i: any) {
                    return i.inv_item_part_number;
                });
            } else {
                this.coloredToast('danger', 'Some error occurred please try again');
            }
        });

        this.userServices.getAllPartsList().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.partsList = rdata.parts;
            }
        });

        this.userServices.getAllLabourList().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.labourList = rdata.labour;
            }
        });

        this.userServices.getAllServices().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                // this.allServices = rdata.services;
                this.allServices = rdata.services.map((element: any) => {
                    const engines = element.Engine_No.map((engine: any) => engine.se_numbers);
                    const vin_nos = element.Vin_no.map((vin_nos: any) => vin_nos.sv_numbers);
                    const kilometers = element.km.map((kilometers: any) => kilometers.skm_kilometers);
                    return { ...element, engines, vin_nos, kilometers };
                });
            } else {
                this.allServices = [];
            }
        });
    }
    ngOnInit(): void {
        this.getServiceDetails();
    }

    getServiceDetails() {
        this.userServices.getServiceDetails({ id: this.service_id }).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.service_details = rdata.services;
                this.service_details.engines = this.service_details.Engine_No.map((engine: any) => engine.se_numbers);
                this.service_details.vin_nos = this.service_details.Vin_no.map((vin_nos: any) => vin_nos.sv_numbers);
                this.service_details.serviceKM = this.service_details.km.map((kilometers: any) => kilometers.skm_kilometers);
                const partsPrice = this.service_details.parts.reduce((totalPrice: number, part: any) => {
                    const partPrice = parseFloat(part.pm_price) * parseFloat(part.sp_qty);
                    return isNaN(partPrice) ? totalPrice : totalPrice + partPrice;
                }, 0);
                const labourPrice = this.service_details.labour.reduce((totalPrice: number, labour: any) => {
                    const labourPrice = parseFloat(labour.sl_price);
                    return isNaN(labourPrice) ? totalPrice : totalPrice + labourPrice;
                }, 0);
                const servicePrice = partsPrice + labourPrice;
                this.service_details.service_price = servicePrice.toFixed(2);

                // delete this.service_details.Engine_No;
                // delete this.service_details.Vin_no;
                // delete this.service_details.km;

                // let service_price = 0;
                // this.service_details.engines = this.service_details.Engine_No.map((engine: any) => engine.se_numbers);
                // this.service_details.vin_nos = this.service_details.Vin_no.map((vin_nos: any) => vin_nos.sv_numbers);
                // this.service_details.serviceKM = this.service_details.km.map((kilometers: any) => kilometers.skm_kilometers);

                // this.service_details.parts.forEach((element: any) => {
                //     service_price += parseFloat(element.pm_price) * parseFloat(element.sp_qty);
                // });
                // this.service_details.labour.forEach((labour: any) => {
                //     service_price += parseFloat(labour.sl_price);
                // });
                // this.service_details.service_price = service_price.toFixed(2);
                this.Vingroups();
                this.Variant();
                this.load_flag = false;
            } else {
                this.load_flag = false;
            }
        });
    }

    addOrRemoveEngines() {
        // Step 1: Iterate over each value in the engines array
        this.service_details.engines.forEach((engine: any) => {
            // Step 2: Check if the value exists in the se_numbers of the Engine_No array
            const foundEngine = this.service_details.Engine_No.find((item: any) => String(item.se_numbers) === String(engine));
            // Step 3: If the value is not found, insert it into the Engine_No array with se_id as zero
            if (!foundEngine) {
                this.service_details.Engine_No.push({
                    se_id: '0', // Assuming se_id needs to be set as zero for newly inserted engines
                    se_numbers: engine,
                    se_delete_flag: '0', // Assuming newly inserted engines should have delete flag as 0
                });
            }
        });
        // Step 4: Check for any se_numbers that are not present in the engines array and set their se_delete_flag to 1
        this.service_details.Engine_No.forEach((engine: any) => {
            if (!this.service_details.engines.includes(engine.se_numbers)) {
                engine.se_delete_flag = '1';
            }
        });
        // Now, data.Engine_No contains the updated array with newly inserted engines and updated delete flags
        this.Vingroups();
    }

    addOrRemoveVinNo() {
        this.service_details.vin_nos.forEach((vin_nos: any) => {
            const foundVin = this.service_details.Vin_no.find((item: any) => String(item.sv_numbers) === String(vin_nos));
            if (!foundVin) {
                this.service_details.Vin_no.push({
                    sv_id: '0',
                    sv_numbers: vin_nos,
                    sv_delete_flag: '0',
                });
            }
        });
        this.service_details.Vin_no.forEach((Vin_no: any) => {
            if (!this.service_details.vin_nos.includes(Vin_no.sv_numbers)) {
                Vin_no.sv_delete_flag = '1';
            }
        });
        this.Variant();
    }

    addOrRemoveKM() {
        this.service_details.serviceKM.forEach((service_KM: String) => {
            const foundkm = this.service_details.km.find((item: any) => String(item.skm_kilometers) === String(service_KM));
            if (!foundkm) {
                this.service_details.km.push({
                    skm_id: '0',
                    skm_kilometers: String(service_KM),
                    skm_delete_flag: '0',
                });
            }
        });
        this.service_details.km.forEach((km: any) => {
            const skmKilometersAsString = String(km.skm_kilometers);
            if (!this.service_details.serviceKM.map(String).includes(skmKilometersAsString)) {
                km.skm_delete_flag = '1';
            }
        });
    }

    Vingroups() {
        let data = {
            selectedEngines: this.service_details.engines,
        };
        if (this.service_details.engines.length > 0) {
            this.userServices.getVinGroups(data).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    this.vingroups = rdata.vingroups;
                    this.service_details.vin_nos = this.service_details.vin_nos.filter((vin: any) =>
                        this.vingroups.some((group: any) => group.veh_vingroup_master === vin)
                    );
                    this.service_details.Vin_no.forEach((item: any) => {
                        if (!this.service_details.vin_nos.includes(item.sv_numbers)) {
                            // check vin number
                            item.sv_delete_flag = '1';
                        }
                    });
                }
            });
        } else {
            this.vingroups = [];
        }
    }

    Variant() {
        let indata = {
            selectedEngines: this.service_details.engines,
            selectedVinGroups: this.service_details.vin_nos,
        };
        if (this.service_details.engines.length > 0 && this.service_details.vin_nos.length > 0) {
            this.userServices.getVehicleVariants(indata).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    this.Veh_variants = rdata.vehicleVariant;
                }
            });
        } else {
            this.Veh_variants = [];
        }
    }

    getPartcode(spare: any) {
        this.filteredList = this.partsList.filter((item: any) => item.pm_name === spare.pm_name);
        this.getPartPrice(spare);
    }

    getPartPrice(spare: any) {
        if (spare.pm_name && spare.pm_code && spare.pm_brand) {
            const foundPart = this.partsList.find(
                (part) => part.pm_name === spare.pm_name && part.pm_code === spare.pm_code && part.brand_name === spare.pm_brand
            );
            spare.pm_price = foundPart ? foundPart.pm_price : 0;
            spare.pm_id = foundPart ? foundPart.pm_id : 0;
        } else {
            spare.pm_price = 0;
            spare.pm_id = 0;
        }
        this.getTotalServicePrice();
    }

    getTotalServicePrice() {
        this.service_details.service_price = 0;
        this.service_details.parts.forEach((element: any) => {
            if (element.sp_delete_flag != '1') {
                this.service_details.service_price += parseFloat(element.pm_price) * parseFloat(element.sp_qty);
            }
        });

        this.service_details.labour.forEach((element2: any) => {
            if (element2.sl_delete_flag != '1') {
                this.service_details.service_price += parseFloat(element2.sl_price);
            }
        });

        this.service_details.service_price = parseFloat(this.service_details.service_price.toFixed(2));
    }

    getLabourCodeAndDescription(labour: any) {
        if (labour.lm_name) {
            const foundPart = this.labourList.find((lb) => lb.lm_name === labour.lm_name);
            labour.lm_code = foundPart ? foundPart.lm_code : 0;
            labour.lm_description = foundPart ? foundPart.lm_description : '';
            labour.lm_id = foundPart ? foundPart.lm_id : 0;
        } else {
            labour.lm_code = 0;
            labour.lm_description = '';
            labour.lm_id = 0;
        }
        this.getTotalServicePrice();
    }

    addNewSpare() {
        this.service_details.parts.push({
            pm_code: null,
            pm_name: null,
            pm_brand: null,
            pm_id: null,
            sp_qty: 0,
            pm_price: 0,
            sp_id: '0',
            sp_delete_flag: '0',
        });
    }

    deleteSpare(i: number, element: any) {
        Swal.fire({
            icon: 'warning',
            title: 'You are about to delete a spare, Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            padding: '2em',
            customClass: 'sweet-alerts',
        }).then((result) => {
            if (result.value) {
                if (element.sp_id != '0') {
                    element.sp_delete_flag = '1';
                } else {
                    this.service_details.parts.splice(i, 1);
                }
                //element.sp_delete_flag = '1';
                this.getTotalServicePrice();
            }
        });
    }

    addNewLabour() {
        this.service_details.labour.push({
            lm_name: null,
            lm_description: null,
            lm_code: null,
            lm_id: null,
            sl_price: 0,
            sl_id: '0',
            sl_delete_flag: '0',
        });
    }

    deleteLabour(i: number, element: any) {
        console.log('i: number, element: any>>>>>>>>>i: number, element: any>>>>>>>>', i, element);

        Swal.fire({
            icon: 'warning',
            title: 'You are about to delete a Labour, Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            padding: '2em',
            customClass: 'sweet-alerts',
        }).then((result) => {
            if (result.value) {
                if (element.sl_id != '0') {
                    element.sl_delete_flag = '1';
                } else {
                    this.service_details.labour.splice(i, 1);
                }
                //  element.sl_delete_flag = '1';

                this.getTotalServicePrice();
            }
        });
    }

    updateService() {
        this.getTotalServicePrice();
        console.log('this.service_details>>>>>>>>>>>>>>>>>>>>', this.service_details);
        this.serviceFlag = true;
        const selectedServiceName: string = this.service_details.sm_name;
        const selectedEngines: string[] = this.service_details.engines;
        const selectedVinGroups: string[] = this.service_details.vin_nos;
        const serviceKM: number[] = this.service_details.serviceKM;
        const servicesWithSameName = this.allServices.filter((service) => service.sm_name === selectedServiceName);
        if (servicesWithSameName.length > 0) {
            for (const service of servicesWithSameName) {
                if (
                    service.engines.length === selectedEngines.length &&
                    service.vin_nos.length === selectedVinGroups.length &&
                    service.kilometers.length === serviceKM.length &&
                    service.engines.every((engine: any) => selectedEngines.includes(engine)) &&
                    service.vin_nos.every((vin_no: any) => selectedVinGroups.includes(vin_no)) &&
                    service.kilometers.every((km: any) => serviceKM.includes(Number(km)))
                ) {
                    this.serviceFlag = false;
                    this.coloredToast('danger', 'Selected Service is Already Created');
                    break;
                }
            }
        }
        console.log('this.service_details>>.parts>>>>>>>>>>>>>>>>>>', this.service_details.parts);
        this.service_details.parts.forEach((part: any, index: any) => {
            const pm_id = part.pm_id;
            const isDuplicate = this.service_details.parts.some(
                (p: any, idx: any) => idx !== index && p.pm_id === pm_id && part.sp_delete_flag != '1' && p.sp_delete_flag != '1'
            );
            if (isDuplicate) {
                this.serviceFlag = false;
                this.coloredToast('danger', 'Same Parts Are Selected Multiple Times');
                return;
            }
        });
        this.service_details.labour.forEach((labour: any, index: any) => {
            const lm_id = labour.lm_id;
            const isDuplicate = this.service_details.labour.some(
                (p: any, idx: any) => idx !== index && p.lm_id === lm_id && labour.sl_delete_flag != '1' && p.sl_delete_flag != '1'
            );
            if (isDuplicate) {
                this.serviceFlag = false;
                this.coloredToast('danger', 'Same Labour Are Selected Multiple Times');
                return;
            }
        });

        if (this.service_details.sm_name == null || this.service_details.sm_name == '') {
            this.coloredToast('danger', 'Please Select Service');
            this.serviceFlag = false;
        } else if (this.service_details.engines.length === 0) {
            this.serviceFlag = false;
            this.coloredToast('danger', 'Please Select Required Engine Number For Service');
        } else if (this.service_details.vin_nos.length === 0) {
            this.serviceFlag = false;
            this.coloredToast('danger', 'Please Select Required Vin Groups For Service');
        } else if (this.service_details.serviceKM.length === 0) {
            this.serviceFlag = false;
            this.coloredToast('danger', 'Please Select Required Kilometers For Service');
        }
        const allPartsDeleted = this.service_details.parts.every((part: any) => part.sp_delete_flag === '1');
        if (allPartsDeleted) {
            this.serviceFlag = false;
            this.coloredToast('danger', 'Please Select Required Parts For Service');
        }
        const allLabourDeleted = this.service_details.labour.every((labour: any) => labour.sl_delete_flag === '1');
        if (allLabourDeleted) {
            this.serviceFlag = false;
            this.coloredToast('danger', 'Please Select Required Labour For Service');
        }

        if (this.service_details.parts.length != 0) {
            this.service_details.parts.forEach((element: any) => {
                if (element.pm_id == null || element.pm_id == '') {
                    this.serviceFlag = false;
                    this.coloredToast('danger', 'Please Select Required Parts For Service');
                }
                if (element.sp_qty == null || element.sp_qty == '' || element.sp_qty == 0) {
                    this.serviceFlag = false;
                    this.coloredToast('danger', 'Please Select Required Parts Quantity For Service');
                }
            });
        }
        if (this.service_details.labour.length != 0) {
            this.service_details.labour.forEach((element: any) => {
                if (element.lm_id === null || element.lm_id === '') {
                    this.serviceFlag = false;
                    this.coloredToast('danger', 'Please Select Required Labour For Service');
                }
                if (element.sl_price == 0) {
                    this.serviceFlag = false;
                    this.coloredToast('danger', 'Please Enter Required Labour Price');
                }
            });
        }

        if (this.serviceFlag != false) {
            this.userServices.updateServices(this.service_details).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    this.Veh_variants = rdata.vehicleVariant;
                    this.coloredToast('success', 'Service Updated Successfully');
                    this.router.navigateByUrl('serviceList');
                }
            });
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
