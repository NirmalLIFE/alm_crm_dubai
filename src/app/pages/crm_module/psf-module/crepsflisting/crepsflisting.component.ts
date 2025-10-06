import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';

@Component({
    selector: 'app-crepsflisting',
    templateUrl: './crepsflisting.component.html',
    styleUrls: ['./crepsflisting.component.css'],
})
export class CrepsflistingComponent implements OnInit {
    public search: string = '';
    public load_flag: boolean = true;

    public cols = [
        { field: 'customer_name', title: 'Name' },
        { field: 'phone', title: 'Phone' },
        { field: 'psfm_job_no', title: 'Job No' },
        { field: 'psfm_reg_no', title: 'Reg No' },
        { field: 'psfm_invoice_date', title: 'Invoice date' },
        { field: 'psfm_cre_assign_date', title: 'Assign Date' },
        { field: 'cre_attempts', title: 'Attempts' },
        { field: 'latestResponse', title: 'Latest Response' },
        { field: 'rating', title: 'Rating' },
        { field: 'psf_status', title: 'Current Status' },
        { field: 'Action', title: 'Action' },
    ];

    ngOnInit(): void {
        this.get_creDailyPSFCalls();
    }
    max: Date = new Date();
    selecteddate: any = new Date();
    psf_calls: any[] = [];
    originalPsfCalls: any[] = [];
    temp_psf_calls = [];
    filteredRows: any[] = [];
    totalCalls: any = 0;
    attemptedCalls: any = 0;
    openCalls: any = 0;
    expiringCalls: any = 0;
    expiredCalls: any = 0;
    completedCalls: any = 0;
    searchvalue: any;
    public assigndate: string = '';
    public filterCriteria: string = '';

    constructor(private userServices: StaffPostAuthService, public router: Router) {}

    get_creDailyPSFCalls() {
        let data = {
            us_id: atob(atob(localStorage.getItem('us_id') || '')),
        };
        this.userServices.get_creDailyPSFCalls(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.expiredCalls = rdata.user_closed_count;
                this.completedCalls = rdata.user_success_count;
                this.psf_calls = rdata.user_psf;
                this.filteredRows = this.psf_calls;
                this.temp_psf_calls = rdata.user_psf;
                this.totalCalls = this.psf_calls.length;
                this.openCalls = this.psf_calls.filter((data: any) => data.cre_attempts == 0).length;
                this.attemptedCalls = this.psf_calls.filter((data: any) => data.cre_attempts > 0).length;
                let new_date = new Date();
                // this.expiringCalls = this.psf_calls.filter(data => (Math.floor((Date.UTC(new_date.getFullYear(), new_date.getMonth(), new_date.getDate()) - Date.UTC(new Date(data.psfm_cre_assign_date).getFullYear(), new Date(data.psfm_cre_assign_date).getMonth(), new Date(data.psfm_cre_assign_date).getDate())) / (1000 * 60 * 60 * 24)) >= 5)).length;
                this.psf_calls.forEach((element: any) => {
                    if (element.psfm_status == 2 || element.psfm_status == 4 || element.psfm_status == 5) {
                        element['psf_status'] = 'Open';
                    } else if (element.psfm_status == 6) {
                        element['psf_status'] = 'Pending';
                    } else if (element.psfm_status == 7) {
                        element['psf_status'] = 'Completed';
                    }
                    if (element.psfm_sa_rating == null) {
                        element['rating'] = 'NIL';
                    } else if (element.psfm_sa_rating != 0) {
                        element['rating'] = element.psfm_sa_rating;
                    }
                    if (element.rm_name == null) {
                        element['latestResponse'] = 'Not Yet Attempted';
                    } else {
                        element['latestResponse'] = element.rm_name;
                    }
                    if (
                        Math.floor(
                            (Date.UTC(new_date.getFullYear(), new_date.getMonth(), new_date.getDate()) -
                                Date.UTC(
                                    new Date(element.psfm_cre_assign_date).getFullYear(),
                                    new Date(element.psfm_cre_assign_date).getMonth(),
                                    new Date(element.psfm_cre_assign_date).getDate()
                                )) /
                                (1000 * 60 * 60 * 24)
                        ) >= 5
                    ) {
                        element.psf_expiry = true;
                    } else {
                        element.psf_expiry = false;
                    }
                    this.load_flag = false;
                });
                this.originalPsfCalls = this.psf_calls;
                this.load_flag = false;
            } else {
                this.load_flag = false;
            }
        });
    }

    onSearch(searchValue: string) {

        this.filteredRows = this.psf_calls.filter((row) => {
            // Convert each row's values to lowercase for case-insensitive search
            return Object.values(row).some((val) => (val ? val.toString().toLowerCase().includes(searchValue.toLowerCase()) : false));
        });
    }

    customSearchFilter() {
        if (this.assigndate === '' || this.assigndate === null) {
            this.psf_calls = this.originalPsfCalls;
            this.filterCriteria = '';
            return;
        }
        this.psf_calls = this.originalPsfCalls;
        let dt = this.psf_calls;
        if (this.assigndate != '' || this.assigndate != null) {
            dt = dt.filter((d) => d.psfm_cre_assign_date === this.assigndate);
            this.filterCriteria = 'Assign Date: ' + this.assigndate + ' ,';
        }
        this.psf_calls = dt;
        this.filterCriteria = this.filterCriteria.slice(0, -1);
    }

    update(id: any) {

        this.router.navigateByUrl('crepsfupdate/' + btoa(id));
    }
}
