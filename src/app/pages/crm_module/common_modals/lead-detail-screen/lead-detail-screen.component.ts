import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';

@Component({
    selector: 'app-lead-detail-screen',
    templateUrl: './lead-detail-screen.component.html',
    styleUrls: ['./lead-detail-screen.component.css'],
})
export class LeadDetailScreenComponent implements OnInit {
    lead_data: any = [];
    lead_log: any[] = [];
    lead_call_log: any[] = [];

    @Input() leadDetail: any;
    @Output() modalEvent = new EventEmitter<boolean>();

    constructor(private userServices: StaffPostAuthService) {}

    ngOnInit(): void {
        let data = { lead_id: this.leadDetail.lead_id };

        this.userServices.getLeadData(data).subscribe((sdata: any) => {
            if (sdata.ret_data == 'success') {
                this.lead_data = sdata.lead;
                this.lead_log = sdata.leadlog;
                this.lead_call_log = sdata.leadcalllog;
            }
        });
    }
}
