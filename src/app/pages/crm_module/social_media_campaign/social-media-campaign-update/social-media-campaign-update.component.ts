import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

interface DataItem {
    smca_date: string;
    smca_amount: string;
}

@Component({
    selector: 'app-social-media-campaign-update',
    templateUrl: './social-media-campaign-update.component.html',
    styleUrls: ['./social-media-campaign-update.component.css'],
})
export class SocialMediaCampaignUpdateComponent implements OnInit {
    public campaignId: string;
    public load_flag: boolean = true;
    public campaignDetails: any = [];
    public userList: any[] = [];
    //public datesWithAmount: any = [];
    public amounts: any = [];
    public month: any;
    public months: { value: number; name: string }[] = [];
    public datesWithAmount: { smca_date: string; smca_amount: any; smca_id: number }[] = [];
    public allDatesWithAmount: { smca_date: string; smca_amount: any; smca_id: number }[] = [];
    dataChunks: DataItem[][] = [];
    public multipleCampaign: any = [];

    constructor(public router: Router, private userServices: StaffPostAuthService, public datePipe: DatePipe, private activeRouter: ActivatedRoute) {
        this.campaignId = atob(this.activeRouter.snapshot.paramMap.get('id') || '');
        this.userServices.userList().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.userList = rData.userList;
            }
        });
    }
    ngOnInit() {
        this.getSocialMediaCampaignDetails();
    }

    getSocialMediaCampaignDetails() {
        this.userServices.getSocialMediaCampaignDetails({ id: this.campaignId }).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.campaignDetails = rData.campaigns;
                this.campaignDetails.smc_status = Number(this.campaignDetails.smc_status);
                this.amounts = rData.amounts;
                const start_date = new Date(this.campaignDetails.smc_start_date);
                const end_date = new Date(this.campaignDetails.smc_end_date);
                this.months = this.getMonthsBetweenDates(start_date, end_date);
                if (this.amounts.length > 0) {
                    this.allDatesWithAmount = this.amounts;
                } else {
                    // const start_date = new Date(this.campaignDetails.smc_start_date);
                    // const end_date = new Date(this.campaignDetails.smc_end_date);
                    // this.months = this.getMonthsBetweenDates(start_date, end_date);
                    const datesArray = this.getDatesInRange(start_date, end_date);
                    this.allDatesWithAmount = datesArray.map((date: Date) => ({
                        smca_date: date.toISOString().split('T')[0],
                        smca_amount: null,
                        smca_id: 0,
                    }));

                    //this.datesWithAmount = [...this.allDatesWithAmount];

                    // this.datesWithAmount = datesArray.map((date: Date) => ({
                    //     smca_date: date.toISOString().split('T')[0],
                    //     smca_amount: null,
                    //     smca_id: 0,
                    // }));
                }

                this.load_flag = false;
            } else {
                this.coloredToast('danger', "Could'nt fetch details, please try again later");
                this.load_flag = false;
            }
        });
    }

    getDatesInRange(start_date: Date, end_date: Date): Date[] {
        const date = new Date(start_date.getTime());
        const dates = [];

        while (date <= end_date) {
            dates.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }

        return dates;
    }

    onMonthChange(selectedMonth: number): void {
        this.dataChunks = []; // Clear dataChunks

        this.datesWithAmount = this.allDatesWithAmount.filter((dateObj) => {
            const date = new Date(dateObj.smca_date);
            return date.getMonth() + 1 === selectedMonth;
        });

        const chunkSize = 8;
        for (let i = 0; i < this.datesWithAmount.length; i += chunkSize) {
            this.dataChunks.push(this.datesWithAmount.slice(i, i + chunkSize));
        }
    }

    updateCampaign(campaignDetails: any, allDatesWithAmount: any) {
        let data = {
            start_Date: campaignDetails.smc_start_date,
            end_Date: campaignDetails.smc_end_date,
            message: campaignDetails.smc_message,
            source: campaignDetails.smc_source,
            status: '1',
        };

        if (campaignDetails.smc_status == '0') {
            this.userServices.checkSocialMediaCampaign(data).subscribe((rdata: any) => {
                if (rdata.ret_data === 'success') {
                    this.multipleCampaign = rdata.campaigns;
                    if (this.multipleCampaign.length > 1) {
                        this.coloredToast('danger', 'Same Message Campaign Already Exists In On Status');
                        return;
                    } else {
                        campaignDetails.datesWithAmount = allDatesWithAmount;
                        this.confirmUpdate(campaignDetails);
                    }
                } else {
                    campaignDetails.datesWithAmount = allDatesWithAmount;
                    this.confirmUpdate(campaignDetails);
                }
            });
        } else {
            campaignDetails.datesWithAmount = allDatesWithAmount;
            this.confirmUpdate(campaignDetails);
        }
    }

    confirmUpdate(campaignDetails: any) {
        this.userServices.updateSocialMediaCampaignDetails(campaignDetails).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.router.navigateByUrl('campaign_list');
                this.coloredToast('success', 'Campaign details Updated Successfully');
            } else {
                this.coloredToast('danger', "Could'nt Update Campaign details, please try again later");
            }
        });
    }

    getMonthsBetweenDates(startDate: Date, endDate: Date): { value: number; name: string }[] {
        const months = [];
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        let currentDate = new Date(startDate);
        currentDate.setDate(1); // Set to the first day of the month

        while (currentDate <= endDate) {
            const month = currentDate.getMonth();
            const year = currentDate.getFullYear();
            months.push({ value: month + 1, name: monthNames[month] });

            // Move to the next month
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        return months;
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


    updateCampaignBudget(budget:any,id:any){

        let data  = {
            smc_budget:budget,
            smc_id:id

        };

        this.userServices.updateSocialMediaCampaignBudget(data).subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                // this.router.navigateByUrl('campaign_list');
                this.coloredToast('success', 'Campaign Budget Updated Successfully');
            } else {
                this.coloredToast('danger', "Could'nt Update Campaign Budget, please try again later");
            }
        });
    }
}
