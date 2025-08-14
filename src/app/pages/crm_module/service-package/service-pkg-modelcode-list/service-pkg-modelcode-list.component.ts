import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';

@Component({
    selector: 'app-service-pkg-modelcode-list',
    templateUrl: './service-pkg-modelcode-list.component.html',
    styleUrls: ['./service-pkg-modelcode-list.component.css'],
})
export class ServicePkgModelcodeListComponent implements OnInit {
    public modelCodeList: any = [];
    search: string = '';
    public load_flag: boolean = true;

    public filteredModelCodeList: any[] = [];

    public modelCodeColumns = [
        { field: 'spmc_value', title: 'Model Code' },
        { field: 'model_name', title: 'Family Name' },
        { field: 'spmc_model_year', title: 'Model Year' },
        { field: 'eng_no', title: 'Engine No' },
        { field: 'spkmp_display_price', title: 'Display Price' },
        { field: 'action', title: 'Action' },
    ];

    constructor(private router: Router, private userServices: StaffPostAuthService) {}

    ngOnInit() {
        this.getServicePkgModelcodelist();
    }

    getServicePkgModelcodelist() {
        // this.load_flag = true;
        this.userServices.getServicePkgModelcodelist().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.modelCodeList = rdata.modellist;
                // console.log("this.modelCodeList", this.modelCodeList);
            } else {
                this.modelCodeList = [];
            }
            this.load_flag = false;
        });
    }

    //Edit button function
    onEditModelCode(item: any): void {
        try {
            const encodedCode = btoa(item?.spmc_value ?? '');
            // console.log('Edit clicked for:', item);
            this.router.navigate(['/servicePackageList'], {
                queryParams: { modelCode: encodedCode },
            });
        } catch (e) {
            // console.error('Error while encoding :', e);
        }
    }
}
