import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-target-settings',
    templateUrl: './target-settings.component.html',
    styleUrls: ['./target-settings.component.css'],
})
export class TargetSettingsComponent implements OnInit {
    targetData: any[] = [];
    public roleList: any[] = [];
    public yearList: any[] = [];
    public us_role_id: any = null;
    public year: any = null;
    // public targetData: any = null;
    constructor(private userServices: StaffPostAuthService, public router: Router) {}
    ngOnInit(): void {
        this.userServices.userRoleList().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.roleList = rData.roleList;
            }
        });

        const currentYear = new Date().getFullYear();
        for (let year = currentYear; year <= currentYear + 7; year++) {
            this.yearList.push({ yname: String(year) });
        }

        // this.yearList = [
        //     {
        //         yname: '2023',
        //     },
        //     {
        //         yname: '2024',
        //     },
        //     {
        //         yname: '2025',
        //     },
        // ];

        this.targetdatafetch();
    }
    targetdatafetch() {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        for (let i = 0; i < monthNames.length; i++) {
            const month = monthNames[i];
            const monthValue = (i + 1).toString();
            this.targetData.push({
                ts_id: '0',
                month: month,
                ts_month: monthValue,
                ts_newinbound: '',
                ts_exinbound: '',
                ts_lostarget: '',
            });
        }
    }

    onYearChange() {
        this.targetData = [];
        this.targetdatafetch();

        if (this.us_role_id != null && this.year != null) {
            let inData = {
                role_id: this.us_role_id,
                year: this.year,
            };
            this.userServices.gettargetsettingsdata(inData).subscribe((rData: any) => {
                if (rData.ret_data == 'success') {
                    if (rData.result.length > 0) {
                        rData.result.forEach((element: any) => {
                            const monthNames = [
                                'January',
                                'February',
                                'March',
                                'April',
                                'May',
                                'June',
                                'July',
                                'August',
                                'September',
                                'October',
                                'November',
                                'December',
                            ];
                            const numericMonth = element.ts_month;
                            const monthName = monthNames[numericMonth - 1];
                            const targetMonth = this.targetData.find((monthData) => monthData.month === monthName);
                            if (targetMonth) {
                                targetMonth.ts_id = element.ts_id;
                                targetMonth.ts_month = element.ts_month;
                                targetMonth.ts_lostarget = element.ts_lostarget;
                                targetMonth.ts_exinbound = element.ts_exinbound;
                                targetMonth.ts_newinbound = element.ts_newinbound;
                            }
                        });
                    }
                }
            });
        } else {
            this.coloredToast('danger', 'Select Role/Position And Year');
        }
    }

    saveTargets() {
        // let filteredData = this.targetData.filter((item) => item.target !== '' || item.extcust !== '' || item.newcust !== '');
        // console.log('out data--->>>', filteredData);

        let data = {
            role_id: this.us_role_id,
            year: this.year,
            targetdata: this.targetData,
        };
        if (this.us_role_id != '' && this.year != '' && this.us_role_id != null && this.year != null) {
            this.userServices.savetargetsettingsdata(data).subscribe((rData: any) => {
                if (rData.ret_data == 'success') {
                    this.coloredToast('success', 'Target Saved Successfully');
                    this.us_role_id = null;
                    this.year = null;
                    this.targetData = [];
                    this.targetdatafetch();
                } else {
                    this.coloredToast('danger', 'Enter Targets');
                }
            });
        } else {
            this.coloredToast('danger', 'Select Role/Position And Year');
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
