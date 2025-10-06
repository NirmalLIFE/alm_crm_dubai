import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';

@Component({
    selector: 'app-logs',
    templateUrl: './logs.component.html',
    styleUrls: ['./logs.component.css'],
})
export class LogsComponent implements OnInit {
    modelCodeId!: string;
    modelCode!: string;
    logs: any[] = [];
    load_flag: boolean = false;
    from: String = '';

    constructor(private route: ActivatedRoute, private router: Router, private userServices: StaffPostAuthService) {}

    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            if (params['modelData']) {
                const decoded = atob(params['modelData']);
                const [modelCode, modelCodeId] = decoded.split('|');
                if (params['From']) {
                    this.from = atob(params['From']);
                    console.log('Decoded From:', this.from);
                }

                console.log('Model Code:', modelCode);
                console.log('Model Code ID:', modelCodeId);

                this.modelCodeId = modelCodeId;
                this.modelCode = modelCode;
                this.fetchLogs(modelCodeId);
            }
        });
    }

    fetchLogs(modelCodeId: string): void {
        this.userServices.getLogsByModelCode(modelCodeId).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.load_flag = true;
                this.logs = rdata.logs.sort((a: any, b: any) => new Date(b.sp_log_created_on).getTime() - new Date(a.sp_log_created_on).getTime());
            } else {
                this.load_flag = true;
                // console.warn(rdata.message);
            }
            if (rdata.ret_data == 'fail') {
                this.load_flag = true;
            }
        });
    }

    goBack(): void {
        // console.log('goBack() from:', this.from);

        if (this.from === 'req') {
            this.router.navigate(['/servicePackageRequested']);
        } else {
            this.router.navigate(['/ServicePkgModelcodeList']);
        }
    }
}
