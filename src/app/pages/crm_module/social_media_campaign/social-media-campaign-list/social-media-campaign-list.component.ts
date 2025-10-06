import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-social-media-campaign-list',
    templateUrl: './social-media-campaign-list.component.html',
    styleUrls: ['./social-media-campaign-list.component.css'],
})
export class SocialMediaCampaignListComponent implements OnInit {
    public search: string = '';
    public load_flag: boolean = true;
    public campaignList: any[] = [];
    public campaignDetails: any = [];
    public userList: any[] = [];
    public sourceList: any[] = [];
    public dateFrom: any = this.datePipe.transform(moment(new Date()).startOf('month').toDate(), 'yyyy-MM-dd') || '';
    public dateTo: any = '';
    public campFlag: boolean = true;
    public permittedAction: any[] = [];
    public multipleCampaign: any = [];

    @ViewChild('socialMediaCampaignModal') socialMediaCampaignModal: any;

    public cols = [
        { field: 'smc_code', title: 'code', isUnique: false },
        { field: 'smc_name', title: 'Name', isUnique: false },
        { field: 'smc_message', title: 'Messages', isUnique: false },
        { field: 'smcs_name', title: 'Source', isUnique: false },
        { field: 'smc_start_date', title: 'Start Date', isUnique: false },
        { field: 'smc_end_date', title: 'End Date', isUnique: false },
        { field: 'smc_status', title: 'Status', isUnique: false },
        { field: 'us_firstname', title: 'Owner', isUnique: false },
        { field: 'action', title: 'Actions', isUnique: false },
    ];

    constructor(public router: Router, private userServices: StaffPostAuthService, public datePipe: DatePipe) {
        this.campaignDetails = {
            name: '',
            source: null,
            message: '',
            owner: null,
            start_date: '',
            end_date: '',
            id: '',
        };
        this.userServices.userList().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.userList = rData.userList;
            }
        });
        this.userServices.socialMediaCampaignsource().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.sourceList = rData.sourceList;
            }
        });
        JSON.parse(atob(atob(localStorage.getItem('access_data') || '{}'))).forEach((element: any) => {
            if (element['ft_id'] == 48) {
                this.permittedAction = element['actions'];
            }
        });
    }
    ngOnInit() {
        this.getSocialMediaCampaigns();
    }

    getSocialMediaCampaigns() {
        this.campaignList = [];
        this.load_flag = true;
        let data = {
            dateFrom: this.dateFrom,
            dateTo: this.dateTo,
        };
        this.userServices.getSocialMediaCampaigns(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.campaignList = rdata.campaigns;
                this.load_flag = false;
            } else {
                this.load_flag = false;
            }
        });
    }

    campaignCreate() {
        this.socialMediaCampaignModal.open();
    }

    socialMediaCampaignModalClose() {
        this.socialMediaCampaignModal.close();
        this.campaignDetails = {
            name: '',
            source: null,
            message: '',
            owner: null,
            start_date: '',
            end_date: '',
            id: '',
        };
    }

    socialMediaCampaignCreate(data: any) {
        if (!this.campaignDetails.name) {
            this.coloredToast('danger', 'Campaign Name Must Be Entered');
            return;
        }
        if (!this.campaignDetails.source) {
            this.coloredToast('danger', 'Campaign Source Must Be Selected');
            return;
        }
        if (!this.campaignDetails.message) {
            this.coloredToast('danger', 'Campaign Message Must Be Entered');
            return;
        }
        if (!this.campaignDetails.owner) {
            this.coloredToast('danger', 'Campaign Owner Must Be Selected');
            return;
        }
        if (!this.campaignDetails.start_date) {
            this.coloredToast('danger', 'Campaign Start Date Must Be Selected');
            return;
        }
        if (!this.campaignDetails.end_date) {
            this.coloredToast('danger', 'Campaign End Date Must Be Selected');
            return;
        }
        if (!this.campaignDetails.id) {
            this.coloredToast('danger', 'Campaign Id Must Be Filled');
            return;
        }
        if (this.campaignDetails.start_date && this.campaignDetails.end_date) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(this.campaignDetails.start_date) || !dateRegex.test(this.campaignDetails.end_date)) {
                this.coloredToast('danger', 'Invalid  Date Format');
                return; // Invalid format
            }
        }
        if (new Date(this.campaignDetails.end_date) < new Date(this.campaignDetails.start_date)) {
            this.coloredToast('danger', 'Campaign End Date Must Be Greater Than Start Date');
            return;
        }

        this.userServices
            .checkSocialMediaCampaign({
                start_Date: this.campaignDetails.start_date,
                end_Date: this.campaignDetails.end_date,
                message: this.campaignDetails.message,
                source: this.campaignDetails.source,
                status: '0',
                id: this.campaignDetails.id,
            })
            .subscribe({
                next: (response: any) => {
                    if (response.ret_data === 'success') {
                        this.coloredToast('danger', 'Same Message Campaign Already Exists In On Status');
                        return;
                    }

                    this.userServices.createSocialMediaCampaign(data).subscribe({
                        next: (response: any) => {
                            if (response.ret_data === 'success') {
                                this.socialMediaCampaignModalClose();
                                this.getSocialMediaCampaigns();
                                this.coloredToast('success', 'Campaign Created Successfully');
                            } else {
                                this.coloredToast('danger', 'Some Error Occurred Please Try Again after Sometime');
                            }
                        },
                        error: (error: any) => {
                            this.coloredToast('danger', 'Some Error Occurred Please Try Again after Sometime');
                        },
                    });
                },
                error: (error: any) => {
                    this.coloredToast('danger', 'Some Error Occurred Please Try Again after Sometime');
                },
            });
    }

    // socialMediaCampaignCreate(data: any) {
    //     if (this.campaignDetails.name == '' || this.campaignDetails.name == null) {
    //         this.campFlag = false;
    //         this.coloredToast('danger', 'Campaign Name Must Be Entered');
    //         return;
    //     }
    //     if (this.campaignDetails.source == '' || this.campaignDetails.source == null) {
    //         this.campFlag = false;
    //         this.coloredToast('danger', 'Campaign Source Must Be Selected');
    //         return;
    //     }
    //     if (this.campaignDetails.message == '' || this.campaignDetails.message == null) {
    //         this.campFlag = false;
    //         this.coloredToast('danger', 'Campaign Message Must Be Entered');
    //         return;
    //     }
    //     if (this.campaignDetails.owner == '' || this.campaignDetails.owner == null) {
    //         this.campFlag = false;
    //         this.coloredToast('danger', 'Campaign Owner Must Be Selected');
    //         return;
    //     }
    //     if (this.campaignDetails.start_date == '' || this.campaignDetails.start_date == null) {
    //         this.campFlag = false;
    //         this.coloredToast('danger', 'Campaign Start Date Must Be Selected');
    //         return;
    //     }
    //     if (this.campaignDetails.end_date == '' || this.campaignDetails.end_date == null) {
    //         this.campFlag = false;
    //         this.coloredToast('danger', 'Campaign End Date Must Be Selected');
    //         return;
    //     }

    //     if (this.campaignDetails.message != null || this.campaignDetails.message != '') {
    //         let data = {
    //             value: 1,
    //             message: this.campaignDetails.message,
    //         };
    //         this.userServices.checkSocialMediaCampaign(data).subscribe((rdata: any) => {
    //             if (rdata.ret_data == 'success') {
    //                 this.coloredToast('danger', 'Same Message Campaign Already Exists In On Status');
    //                 this.campFlag = false;
    //                 return;
    //             } else {
    //                 this.campFlag = true;
    //             }
    //         });
    //     }
    //     if (this.campaignDetails.start_date != null || this.campaignDetails.start_date != '') {
    //         let data = {
    //             value: 2,
    //             start_Date: this.campaignDetails.start_date,
    //         };
    //         this.userServices.checkSocialMediaCampaign(data).subscribe((rdata: any) => {
    //             if (rdata.ret_data == 'success') {
    //                 this.coloredToast('danger', 'Same Campaign Already Exists In On Status With Same Start Date');
    //                 this.campFlag = false;
    //                 return;
    //             } else {
    //                 this.campFlag = true;
    //             }
    //         });
    //     }
    //     if (this.campaignDetails.end_date != null || this.campaignDetails.end_date != '') {
    //         if (new Date(this.campaignDetails.end_date) < new Date(this.campaignDetails.start_date)) {
    //             this.campFlag = false;
    //             this.coloredToast('danger', 'Campaign End Date Must Be Greater Than Start Date');
    //             return;
    //         }
    //         let data = {
    //             value: 3,
    //             end_Date: this.campaignDetails.end_date,
    //         };
    //         this.userServices.checkSocialMediaCampaign(data).subscribe((rdata: any) => {
    //             if (rdata.ret_data == 'success') {
    //                 this.coloredToast('danger', 'Same Campaign Already Exists In On Status With Same End Date');
    //                 this.campFlag = false;
    //                 return;
    //             } else {
    //                 this.campFlag = true;
    //             }
    //         });
    //     }

    //     if (this.campFlag) {
    //         this.userServices.createSocialMediaCampaign(data).subscribe((rdata: any) => {
    //             if (rdata.ret_data == 'success') {
    //                 this.socialMediaCampaignModalClose();
    //                 this.getSocialMediaCampaigns();
    //                 this.campFlag = true;
    //             } else {
    //                 this.coloredToast('danger', 'Some Error Occured Please Try Again after Sometime');
    //             }
    //         });
    //     }
    // }

    campaignEdit(item: any) {
        this.router.navigateByUrl('socialMediaCampaign_update/' + btoa(item.smc_id));
    }

    // updateCampaignStatus(item: any) {
    //     Swal.fire({
    //         icon: 'warning',
    //         title: 'Are you sure?',
    //         text: 'You Are About To Change Campaign Status',
    //         showCancelButton: true,
    //         confirmButtonText: 'CHANGE',
    //         padding: '1em',
    //         customClass: 'sweet-alerts',
    //     }).then((result) => {
    //         if (result.value) {
    //             let inData = {
    //                 smc_id: item.smc_id,
    //                 status: item.smc_status,
    //             };
    //             this.userServices.changeCampaignStatus(inData).subscribe((rdata: any) => {
    //                 if (rdata.ret_data == 'success') {
    //                     this.coloredToast('success', 'Campaign Status Changed Successfully');
    //                 } else {
    //                     item.smc_status = item.smc_status === '0' ? '1' : '0'; // Revert status
    //                     const checkbox = document.getElementById('custom_switch_checkbox5') as HTMLInputElement;
    //                     checkbox.checked = item.smc_status === '0';
    //                     this.coloredToast('danger', "Can't Update Campaign Status");
    //                 }
    //             });
    //         } else {
    //             console.log("item.smc_status>>>>>>>>>>>>>>>",item.smc_status)
    //             const checkbox = document.getElementById('custom_switch_checkbox5') as HTMLInputElement;
    //             checkbox.checked = item.smc_status === '0';
    //         }
    //     });
    // }

    confirmCampaignStatusChange(event: Event, item: any) {
        event.preventDefault(); // Prevent the default state change
        const checkboxId = 'custom_switch_checkbox_' + item.smc_id;
        const checkbox = document.getElementById(checkboxId) as HTMLInputElement;
        const originalStatus = item.smc_status;
        const newStatus = checkbox.checked ? '1' : '0';

        let data = {
            message: item.smc_message,
            start_Date: item.smc_start_date,
            end_Date: item.smc_end_date,
            source: item.smc_source,
            status: '1',
        };

        this.userServices.checkSocialMediaCampaign(data).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.multipleCampaign = rdata.campaigns;
                const hasActiveCampaign = this.multipleCampaign.some((campaign: any) => campaign.smc_status === '0');
                if (newStatus == '1' && hasActiveCampaign) {
                    if (this.multipleCampaign.length > 1) {
                        this.coloredToast('danger', 'Same Message Campaign Already Exists In On Status');
                        return;
                    }
                } else {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Are you sure?',
                        text: 'You Are About To Change Campaign Status',
                        showCancelButton: true,
                        confirmButtonText: 'CHANGE',
                        padding: '1em',
                        customClass: 'sweet-alerts',
                    }).then((result) => {
                        if (result.value) {
                            let newStatus = originalStatus === '0' ? '1' : '0';
                            let inData = {
                                smc_id: item.smc_id,
                                status: newStatus, // Toggle status
                            };
                            this.userServices.changeCampaignStatus(inData).subscribe((rdata: any) => {
                                if (rdata.ret_data == 'success') {
                                    item.smc_status = newStatus; // Update the status only on success
                                    this.coloredToast('success', 'Campaign Status Changed Successfully');
                                } else {
                                    checkbox.checked = originalStatus === '0';
                                    this.coloredToast('danger', "Can't Update Campaign Status");
                                }
                            });
                        } else {
                            checkbox.checked = originalStatus === '0'; // Revert checkbox to original state
                        }
                    });
                }
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Are you sure?',
                    text: 'You Are About To Change Campaign Status',
                    showCancelButton: true,
                    confirmButtonText: 'CHANGE',
                    padding: '1em',
                    customClass: 'sweet-alerts',
                }).then((result) => {
                    if (result.value) {
                        let newStatus = originalStatus === '0' ? '1' : '0';
                        let inData = {
                            smc_id: item.smc_id,
                            status: newStatus, // Toggle status
                        };
                        this.userServices.changeCampaignStatus(inData).subscribe((rdata: any) => {
                            if (rdata.ret_data == 'success') {
                                item.smc_status = newStatus; // Update the status only on success
                                this.coloredToast('success', 'Campaign Status Changed Successfully');
                            } else {
                                checkbox.checked = originalStatus === '0';
                                this.coloredToast('danger', "Can't Update Campaign Status");
                            }
                        });
                    } else {
                        checkbox.checked = originalStatus === '0'; // Revert checkbox to original state
                    }
                });
            }
        });
    }

    checkCampaignMessage(message: any, start_Date: any, end_Date: any, source: any) {
        if (start_Date && end_Date) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(start_Date) || !dateRegex.test(end_Date)) {
                this.coloredToast('danger', 'Invalid  Date Format');
                return; // Invalid format
            }
        }

        if (message && start_Date && end_Date) {
            if (new Date(this.campaignDetails.end_date) < new Date(this.campaignDetails.start_date)) {
                this.coloredToast('danger', 'Campaign End Date Must Be Greater Than Start Date');
                return;
            }

            let data = {
                message: message,
                start_Date: start_Date,
                end_Date: end_Date,
                source: source,
                status: '0',
            };
            this.userServices.checkSocialMediaCampaign(data).subscribe((rdata: any) => {
                if (rdata.ret_data == 'success') {
                    this.coloredToast('danger', 'Same Message Campaign Already Exists In On Status');
                    this.campFlag = false;
                } else {
                    this.campFlag = true;
                }
            });
        }
    }

    // checkCampaignStartDate(start_Date: any, message: any, value: any) {
    //     let data = {
    //         value: value,
    //         message: message,
    //         start_Date: start_Date,
    //     };
    //     this.userServices.checkSocialMediaCampaign(data).subscribe((rdata: any) => {
    //         if (rdata.ret_data == 'success') {
    //             this.coloredToast('danger', 'Same Campaign Already Exists In On Status With Same Start Date');
    //             this.campFlag = false;
    //         } else {
    //             this.campFlag = true;
    //         }
    //     });
    // }

    // checkCampaignEndDate(end_Date: any, message: any, value: any) {
    //     //this.campFlag = false;
    //     let data = {
    //         value: value,
    //         message: message,
    //         end_Date: end_Date,
    //     };
    //     this.userServices.checkSocialMediaCampaign(data).subscribe((rdata: any) => {
    //         if (rdata.ret_data == 'success') {
    //             this.coloredToast('danger', 'Same Campaign Already Exists In On Status With Same End Date');
    //             this.campFlag = false;
    //         } else {
    //             this.campFlag = true;
    //         }
    //     });
    // }

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

    deleteCampaign(item: any) {
        if (this.permittedAction.includes('3')) {
            Swal.fire({
                icon: 'warning',
                title: "You won't be able to revert this!",
                text: 'You are about to delete a campaign, Are you sure?',
                showCancelButton: true,
                confirmButtonText: 'Delete',
                padding: '2em',
                customClass: 'sweet-alerts',
            }).then((result) => {
                if (result.value) {
                    this.userServices.socialMediaCampaignDelete({ smc_id: item.smc_id }).subscribe((rdata: any) => {
                        if (rdata.ret_data === 'success') {
                            this.coloredToast('success', 'Campaign deleted successfully');
                            this.getSocialMediaCampaigns();
                        } else {
                            this.coloredToast('danger', "Can't delete Campaign");
                        }
                    });
                }
            });
        } else {
            this.coloredToast('danger', "Can't delete Campaign, permission denied");
        }
    }
}
