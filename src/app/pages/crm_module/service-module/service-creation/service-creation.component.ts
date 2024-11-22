import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-service-creation',
    templateUrl: './service-creation.component.html',
    styleUrls: ['./service-creation.component.css'],
})
export class ServiceCreationComponent implements OnInit {
    public engines = [];
    // public selectedEngines: any = [];
    // public selectedVinGroups: any = [];
    public vingroups = [];
    public vinnos = [];
    // public selectedservice: any;
    public Veh_variants: any = [];
    kilometers: any[] = [];

    descriptions: any[] = [];
    partcodes: any[] = [];

    partsList: any[] = [];
    labourList: any[] = [];
    serviceFlag = true;

    filteredList: any[] = [];
    allServices: any[] = [];

    service_details: any = {
        selectedservice: null,
        selectedEngines: [],
        selectedVinGroups: [],
        serviceKM: [],
        TotalPrice: 0,
        parts: [
            {
                PART_NO: null,
                DESCRIPTION: null,
                BRAND: null,
                qty: 0,
                PRICE: 0,
                id: null,
            },
        ],
        Labour: [
            {
                Name: null,
                Description: null,
                Code: null,
                id: null,
                PRICE: 0,
            },
        ],
    };

    constructor(private userServices: StaffPostAuthService, public router: Router) {
        // this.serviceDetails=[
        //   engineNo:Null,
        // ];
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
    ngOnInit(): void {}

    Vingroups() {
        let data = {
            selectedEngines: this.service_details.selectedEngines,
        };
        if (this.service_details.selectedEngines.length > 0) {
            this.userServices.getVinGroups(data).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    this.vingroups = rdata.vingroups;
                    this.service_details.selectedVinGroups = this.service_details.selectedVinGroups.filter((vin: any) =>
                        this.vingroups.some((group: any) => group.veh_vingroup_master === vin)
                    );
                }
            });
        } else {
            this.vingroups = [];
            this.service_details.selectedVinGroups = [];
            this.Veh_variants = [];
        }
    }

    Variant() {
        let indata = {
            selectedEngines: this.service_details.selectedEngines,
            selectedVinGroups: this.service_details.selectedVinGroups,
        };
        if (this.service_details.selectedEngines.length > 0 && this.service_details.selectedVinGroups.length > 0) {
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
        this.filteredList = this.partsList.filter((item: any) => item.pm_name === spare.DESCRIPTION);
        this.getPartPrice(spare);
    }

    // getPartNames() {
    //     return this.partsList ? this.partsList.map((part) => part.pm_name) : [];
    // }

    // getPartNo() {
    //     return this.partsList ? this.partsList.map((part) => part.pm_code) : [];
    // }

    // getPartbrand() {
    //     return this.partsList ? this.partsList.map((part) => part.brand_name) : [];
    // }

    // getPartPrice(partName: string, partCode: string, partBrand: string, index: number): string {
    //     if (partName && partCode && partBrand) {
    //         const foundPart = this.partsList.find((part) => part.pm_name === partName && part.pm_code === partCode && part.brand_name === partBrand);
    //         this.service_details.parts[index].PRICE = foundPart ? foundPart.pm_price : 0;
    //         return foundPart ? foundPart.pm_price : '0';
    //     } else {
    //         return '0';
    //     }
    // }
    getPartPrice(spare: any) {
        if (spare.DESCRIPTION && spare.PART_NO && spare.Brand) {
            const foundPart = this.partsList.find(
                (part) => part.pm_name === spare.DESCRIPTION && part.pm_code === spare.PART_NO && part.brand_name === spare.Brand
            );
            spare.PRICE = foundPart ? foundPart.pm_price : 0;
            spare.id = foundPart ? foundPart.pm_id : 0;
        } else {
            spare.PRICE = 0;
            spare.id = 0;
        }
        this.getTotalServicePrice();
    }

    addNewSpare() {
        this.service_details.parts.push({
            PART_NO: null,
            DESCRIPTION: null,
            BRAND: null,
            id: null,
            qty: 0,
            PRICE: 0,
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
                this.service_details.parts.splice(i, 1);
                this.getTotalServicePrice();
            }
        });
    }

    // getLabourName() {
    //     return this.labourList ? this.labourList.map((labour) => labour.lm_name) : [];
    // }
    // getLabourDescription() {
    //     return this.labourList ? this.labourList.map((labour) => labour.lm_description) : [];
    // }
    // getLabourCode(Description: string, labourName: string) {
    //     const foundPart = this.labourList.find((labour) => labour.lm_name === labourName && labour.lm_description === Description);
    //     return foundPart ? foundPart.lm_code : 'Not found';
    // }

    getLabourCodeAndDescription(labour: any) {
        if (labour.Name) {
            const foundPart = this.labourList.find((lb) => lb.lm_name === labour.Name);
            labour.Code = foundPart ? foundPart.lm_code : 0;
            labour.Description = foundPart ? foundPart.lm_description : '';
            labour.id = foundPart ? foundPart.lm_id : 0;
        } else {
            labour.Code = 0;
            labour.Description = '';
            labour.id = 0;
        }
        this.getTotalServicePrice();
    }

    // getLabourCode(labour: any) {
    //     if (labour.Name && labour.Description) {
    //         const foundPart = this.labourList.find((lb) => lb.lm_name === labour.Name && lb.lm_description === labour.Description);
    //         labour.Code = foundPart ? foundPart.lm_code : 0;
    //         labour.id = foundPart ? foundPart.lm_id : 0;
    //     } else {
    //         labour.Code = 0;
    //         labour.id = 0;
    //     }
    //     this.getTotalServicePrice();
    // }

    addNewLabour() {
        this.service_details.Labour.push({
            Name: null,
            Description: null,
            Code: null,
            id: null,
            PRICE: 0,
        });
    }

    deleteLabour(i: number, element: any) {
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
                this.service_details.Labour.splice(i, 1);
                this.getTotalServicePrice();
            }
        });
    }

    getTotalServicePrice() {
        this.service_details.TotalPrice = 0;
        this.service_details.parts.forEach((element: any) => {
            this.service_details.TotalPrice += parseFloat(element.PRICE) * parseFloat(element.qty);
        });

        this.service_details.Labour.forEach((element2: any) => {
            this.service_details.TotalPrice += parseFloat(element2.PRICE);
        });

        this.service_details.TotalPrice = parseFloat(this.service_details.TotalPrice.toFixed(2));
    }

    saveService() {
        this.getTotalServicePrice();
        this.serviceFlag = true;
        const selectedServiceName: string = this.service_details.selectedservice;
        const selectedEngines: string[] = this.service_details.selectedEngines;
        const selectedVinGroups: string[] = this.service_details.selectedVinGroups;
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
        if (this.service_details.selectedservice == null || this.service_details.selectedservice == '') {
            this.coloredToast('danger', 'Please Select Service');
            this.serviceFlag = false;
        } else if (this.service_details.selectedEngines.length === 0) {
            this.serviceFlag = false;
            this.coloredToast('danger', 'Please Select Required Engine Number For Service');
        } else if (this.service_details.selectedVinGroups.length === 0) {
            this.serviceFlag = false;
            this.coloredToast('danger', 'Please Select Required Vin Groups For Service');
        } else if (this.service_details.serviceKM.length === 0) {
            this.serviceFlag = false;
            this.coloredToast('danger', 'Please Select Required Kilometers For Service');
        }
        if (this.service_details.parts.length != 0) {
            this.service_details.parts.forEach((element: any) => {
                if (element.id == null || element.id == '') {
                    this.serviceFlag = false;
                    this.coloredToast('danger', 'Please Select Required Parts For Service');
                }
                if (element.qty == null || element.qty == '' || element.qty == 0) {
                    this.serviceFlag = false;
                    this.coloredToast('danger', 'Please Select Required Parts Quantity For Service');
                }
            });
        }
        if (this.service_details.Labour.length != 0) {
            this.service_details.Labour.forEach((element: any) => {
                if (element.id === null || element.id === '') {
                    this.serviceFlag = false;
                    this.coloredToast('danger', 'Please Select Required Labour For Service');
                }
                if (element.PRICE == 0) {
                    this.serviceFlag = false;
                    this.coloredToast('danger', 'Please Enter Required Labour Price');
                }
            });
        }
        this.service_details.parts.forEach((part: any, index: any) => {
            const id = part.id;
            const isDuplicate = this.service_details.parts.some((p: any, idx: any) => idx !== index && p.id === id);
            if (isDuplicate) {
                this.serviceFlag = false;
                this.coloredToast('danger', 'Same Parts Are Selected Multiple Times');
                return;
            }
        });
        this.service_details.Labour.forEach((labour: any, index: any) => {
            const id = labour.id;
            const isDuplicate = this.service_details.Labour.some((p: any, idx: any) => idx !== index && p.id === id);
            if (isDuplicate) {
                this.serviceFlag = false;
                this.coloredToast('danger', 'Same Labour Are Selected Multiple Times');
                return;
            }
        });
        if (this.serviceFlag != false) {
            this.userServices.saveServices(this.service_details).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    this.Veh_variants = rdata.vehicleVariant;
                    this.coloredToast('success', 'Service Created Successfully');
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
