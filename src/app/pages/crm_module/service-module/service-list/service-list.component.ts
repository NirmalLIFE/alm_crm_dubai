import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-service-list',
    templateUrl: './service-list.component.html',
    styleUrls: ['./service-list.component.css'],
})
export class ServiceListComponent implements OnInit {
    public allServices = [];
    public permittedAction: any[] = [];
    public search: string = '';
    public load_flag: boolean = true;
    public serviceDetails: any = [];

    public cols = [
        { field: 'sm_code', title: 'Code' },
        { field: 'sm_name', title: 'Name' },
        { field: 'engines', title: 'Engine No' },
        { field: 'vin_nos', title: 'Vin No' },
        { field: 'kilometers', title: 'KM' },
        { field: 'service_price', title: 'Price' },
        { field: 'action', title: 'Action' },
    ];

    @ViewChild('servicemodal') servicemodal: any;

    constructor(private userServices: StaffPostAuthService, public router: Router) {
        JSON.parse(atob(atob(localStorage.getItem('access_data') || '{}'))).forEach((element: any) => {
            if (element['ft_id'] == 43) {
                this.permittedAction = element['actions'];
            }
        });
    }
    ngOnInit(): void {
        this.getAllServices();
    }

    getAllServices() {
        this.allServices = [];
        this.userServices.getAllServices().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                // this.allServices = rdata.services;
                this.allServices = rdata.services.map((element: any) => {
                    let service_price = 0;
                    const engines = element.Engine_No.map((engine: any) => engine.se_numbers);
                    const vin_nos = element.Vin_no.map((vin_nos: any) => vin_nos.sv_numbers);
                    const kilometers = element.km.map((kilometers: any) => kilometers.skm_kilometers);
                    element.parts.forEach((element2: any) => {
                        service_price += parseFloat(element2.pm_price) * parseFloat(element2.sp_qty);
                    });

                    element.labour.forEach((labour: any) => {
                        service_price += parseFloat(labour.sl_price);
                    });

                    const totalServicePrice = service_price.toFixed(2);
                    return { ...element, engines, vin_nos, kilometers, service_price: totalServicePrice };
                });
                this.load_flag = false;
            } else {
                this.allServices = [];
                this.load_flag = false;
            }
        });
    }

    openServiceCreation() {
        this.router.navigateByUrl('serviceCreation');
    }

    editService(value: any) {
        // this.router.navigateByUrl('editService');
        this.router.navigate(['editService'], {
            queryParams: {
                service_id: value.sm_id,
            },
        });
    }

    deleteService(value: any) {
        if (this.permittedAction.includes('3')) {
            Swal.fire({
                icon: 'warning',
                title: "You won't be able to revert this!",
                text: 'You are about to delete a service, Are you sure?',
                showCancelButton: true,
                confirmButtonText: 'Delete',
                padding: '2em',
                customClass: 'sweet-alerts',
            }).then((result) => {
                if (result.value) {
                    this.userServices.deleteService({ sm_id: value.sm_id }).subscribe((rdata: any) => {
                        if (rdata.ret_data === 'success') {
                            this.coloredToast('success', 'Service Deleted Successfully');
                            this.getAllServices();
                        } else {
                            this.coloredToast('danger', "Can't Delete Service");
                        }
                    });
                }
            });
        } else {
            this.coloredToast('danger', "Can't Delete Service, Permission Denied");
        }
    }

    viewService(value: any) {
        this.serviceDetails = value;
        this.servicemodal.open();
    }

    changePrice(event: any, item: any) {
        if (item.hasOwnProperty('pm_id')) {
            if (event.target.checked) {
                item.sp_delete_flag = '0';
            } else {
                item.sp_delete_flag = '1';
            }
        } else if (item.hasOwnProperty('lm_id')) {
            if (event.target.checked) {
                item.sl_delete_flag = '0';
            } else {
                item.sl_delete_flag = '1';
            }
        }

        this.serviceDetails.service_price = 0;
        this.serviceDetails.parts.forEach((element: any) => {
            if (element.sp_delete_flag != '1') {
                this.serviceDetails.service_price += parseFloat(element.pm_price) * parseFloat(element.sp_qty);
            }
        });

        this.serviceDetails.labour.forEach((element2: any) => {
            if (element2.sl_delete_flag != '1') {
                this.serviceDetails.service_price += parseFloat(element2.sl_price);
            }
        });

        // let service_price = this.serviceDetails.service_price;
        // this.serviceDetails.parts.forEach((part: any) => {
        //     if (part.pm_delete_flag === '1') {
        //         service_price -= parseFloat(part.pm_price) * parseFloat(part.sp_qty);
        //     } else {
        //         service_price += parseFloat(part.pm_price) * parseFloat(part.sp_qty);
        //     }
        // });
        // this.serviceDetails.service_price = service_price.toFixed(2);

        // console.log('serviceDetails', this.serviceDetails);
    }

    serviceModalClose() {
        this.servicemodal.close();
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
