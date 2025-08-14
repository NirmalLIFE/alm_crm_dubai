import { animate, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { slideDownUp } from '../shared/animations';

@Component({
    moduleId: module.id,
    selector: 'sidebar',
    templateUrl: './sidebar.html',
    animations: [slideDownUp],
})
export class SidebarComponent {
    active = false;
    store: any;
    activeDropdown: string[] = [];
    parentDropdown: string = '';
    user_role: string = atob(atob(localStorage.getItem('us_role_id') || '{}'));
    userFeatures: object[] = JSON.parse(atob(atob(localStorage.getItem('access_data') || '{}')));
    menuItems: any = {
        admin_features: [],
        quotation_features: [],
        psf_features: [],
        leads_features: [],
        report_features: [],
        spare_features: [],
        job_features: [],
        spare_price_management: [],
        service_features: [],
        chat_features: [],
        customer_features: [],
    };

    constructor(public translate: TranslateService, public storeData: Store<any>, public router: Router) {
        this.initStore();
    }
    async initStore() {
        this.storeData
            .select((d) => d.index)
            .subscribe((d) => {
                this.store = d;
            });
    }

    ngOnInit() {
        this.setActiveDropdown();
        this.menuDefiner();
    }

    menuDefiner() {
        this.userFeatures.forEach((element: any) => {
            if (element['ft_id'] == 1) {
                this.menuItems.admin_features.push({
                    title: 'User Management',
                    link: '/admin_staff/user/user_list',
                });
            } else if (element['ft_id'] == 2) {
                this.menuItems.admin_features.push({
                    title: 'User Roles',
                    link: '/admin_staff/user/user_role_list',
                });
            } else if (element['ft_id'] == 5) {
                this.menuItems.admin_features.push({
                    title: 'Call Purpose',
                    link: '/admin_staff/call_purpose/list',
                });
            } else if (element['ft_id'] == 17) {
                this.menuItems.admin_features.push({
                    title: 'Departments',
                    link: '/admin_staff/departments/list',
                });
            } else if (element['ft_id'] == 16) {
                this.menuItems.admin_features.push({
                    title: 'User Activity Log',
                    link: '/admin_staff/user/user_log',
                });
            } else if (element['ft_id'] == 14) {
                this.menuItems.admin_features.push({
                    title: 'Excluded Numbers',
                    link: '/admin_staff/excluded_list/numbers',
                });
            } else if (element['ft_id'] == 8) {
                this.menuItems.admin_features.push({
                    title: 'Spare Brands',
                    link: '/admin_staff/quotation/spare_brands',
                });
            } else if (element['ft_id'] == 21) {
                this.menuItems.admin_features.push({
                    title: 'General Settings',
                    link: '/admin_staff/general-settings',
                });
                this.menuItems.admin_features.push({
                    title: 'Target Settings',
                    link: '/admin_staff/target-settings',
                });
                this.menuItems.admin_features.push({
                    title: 'Spare Invoice Approval',
                    link: '/admin_spare_invoice',
                });
            } else if (element['ft_id'] == 40) {
                this.menuItems.admin_features.push({
                    title: 'Suppliers List',
                    link: '/spare_suppliers_list',
                });
            } else if (element['ft_id'] == 23) {
                this.menuItems.admin_features.push({
                    title: 'Lost Customers Import',
                    link: '/admin_staff/lost_customer/lc_import',
                });
            } else if (element['ft_id'] == 12) {
                this.menuItems.quotation_features.push(
                    {
                        title: 'Normal Quotation',
                        link: 'quotation/normal_quote/quote_list',
                    },
                    {
                        title: 'Special Quotation',
                        link: 'quotation/special_quote/quote_list',
                    }
                );
            } else if (element['ft_id'] == 32) {
                this.menuItems.psf_features.push({
                    title: 'PSF Calls',
                    link: 'psf-calls/staff/sa-psf',
                });
            } else if (element['ft_id'] == 33) {
                this.menuItems.psf_features.push({
                    title: 'PSF Followup Call',
                    link: 'psf-calls/staff/cre-psf',
                });
            } else if (element['ft_id'] == 9) {
                this.menuItems.leads_features.push({
                    title: 'All Leads',
                    link: '/leads/lead-list',
                });
            } else if (element['ft_id'] == 27) {
                this.menuItems.leads_features.push({
                    title: 'Appointment Leads',
                    link: '/leads/appointment/appointment-list',
                });
            } else if (element['ft_id'] == 29) {
                this.menuItems.leads_features.push({
                    title: 'Quotation Leads',
                    link: '/leads/quotation/quotation-list',
                });
            } else if (element['ft_id'] == 28) {
                this.menuItems.leads_features.push({
                    title: 'Campaign Leads',
                    link: '/campaignLeads',
                });
            } else if (element['ft_id'] == 24) {
                this.menuItems.report_features.push({
                    title: 'Lost Customers Report',
                    link: '/lost-customer/lost-count-report',
                });
            }

            // else if (element['ft_id'] == 48) {
            //     this.menuItems.report_features.push({
            //         title: 'Staff Performance Analysis',
            //         link: 'lost-customer/staff-perfomance-analysis',
            //     });
            // }
            else if (element['ft_id'] == 26) {
                this.menuItems.report_features.push({
                    title: 'Customer Conversion Report',
                    link: '/leads/customer/customer-conversion-report',
                });
            } else if (element['ft_id'] == 20) {
                this.menuItems.report_features.push({
                    title: 'Inbound Call Report',
                    link: '/inbound-call/inbound-call-reports',
                }),
                    this.menuItems.report_features.push({
                        title: 'Inbound Call Analytics',
                        link: '/admin_staff/company-report/call-report',
                    });
                this.menuItems.report_features.push({
                    title: 'Workshop TAT Analysis',
                    link: '/workshoptat',
                });
            } else if (element['ft_id'] == 25) {
                this.menuItems.report_features.push({
                    title: 'Missed Call Report',
                    link: '/missed-call-report',
                });
            } else if (element['ft_id'] == 35) {
                this.menuItems.report_features.push({
                    title: 'PSF Report',
                    link: 'psf-calls/admin/psfadminreport',
                });
            } else if (element['ft_id'] == 38) {
                this.menuItems.spare_features.push({
                    title: 'ALM Spare Invoice',
                    link: '/spare-invoice/spare-invoice-list',
                });
            } else if (element['ft_id'] == 41) {
                this.menuItems.report_features.push({
                    title: 'Spare Invoice Report',
                    link: '/spare_invoice_report',
                });
            } else if (element['ft_id'] == 39) {
                this.menuItems.report_features.push({
                    title: 'Whatsapp Feedback Report',
                    link: 'admin-report/psf_report/psf-whatsapp-report',
                });
            } else if (element['ft_id'] == 44) {
                this.menuItems.report_features.push({
                    title: 'Customer Revisit Analysis',
                    link: 'admin_staff/company-report/customer_revisit',
                });
            } else if (element['ft_id'] == 45) {
                this.menuItems.job_features.push({
                    title: 'Job Status Management',
                    link: 'job-card/job-status-update',
                });
            } else if (element['ft_id'] == 46) {
                this.menuItems.admin_features.push({
                    title: 'Job Status Master',
                    link: 'job-card/job-status-master',
                });
            } else if (element['ft_id'] == 47) {
                this.menuItems.report_features.push({
                    title: 'Staff Performance Analysis',
                    link: '/appointment_report',
                });
            } else if (element['ft_id'] == 48) {
                this.menuItems.admin_features.push({
                    title: 'Social Media Campaigns',
                    link: 'campaign_list',
                });
            } else if (element['ft_id'] == 49) {
                this.menuItems.report_features.push({
                    title: 'Social Media Campaign Report',
                    link: 'SocialMediaReportPage',
                });
            }

            // else if (element['ft_id'] == 42) {
            //     this.menuItems.spare_price_management.push(
            //         {
            //             title: 'Parts List',
            //             link: '/spare-parts/parts-list',
            //         },
            //         {
            //             title: 'Labour List',
            //             link: '/Labour/labour-list',
            //         }
            //     );
            // }
            else if (element['ft_id'] == 43) {
                this.menuItems.service_features.push(
                    {
                        title: 'Periodic Service Price List',
                        link: '/servicePackageList',
                    }
                    // {
                    //     title: 'Service List',
                    //     link: '/serviceList',
                    // },
                    // {
                    //     title: 'Parts Master',
                    //     link: '/spare-parts/parts-list',
                    // },
                    // {
                    //     title: 'Labour Master',
                    //     link: '/Labour/labour-list',
                    // }
                );
            } else if (element['ft_id'] == 50) {
                this.menuItems.chat_features.push({
                    title: 'WhatsApp Chat',
                    link: '/whatsappchat',
                });
            } else if (element['ft_id'] == 51) {
                this.menuItems.leads_features.push({
                    title: 'WhatsApp Leads',
                    link: '/whatsappLeadList',
                });
            } else if (element['ft_id'] == 52) {
                this.menuItems.admin_features.push({
                    title: 'Whatsapp Settings',
                    link: '/whatsappSettings',
                });
            } else if (element['ft_id'] == 53) {
                this.menuItems.report_features.push({
                    title: 'Customer Analysis',
                    link: '/customerAnalysis',
                });
            } else if (element['ft_id'] == 56) {
                this.menuItems.report_features.push({
                    title: 'Service Reminder Report',
                    link: 'serviceRemainderReport',
                });
            } else if (element['ft_id'] == 58) {
                this.menuItems.customer_features.push({
                    title: 'Customer Follow-Ups',
                    link: 'customerFollowUps',
                });
            } else if (element['ft_id'] == 60) {
                this.menuItems.service_features.push(
                    {
                        title: 'Service Package Requested',
                        link: '/servicePackageRequested',
                    }
                    // {
                    //     title: 'Parts Master',
                    //     link: '/spare-parts/parts-list',
                    // }
                );
            } else if (element['ft_id'] == 61) {
                // this.menuItems.service_features.push({
                //     title: 'Labour Master',
                //     link: '/Labour/labour-list',
                // });
            } else if (element['ft_id'] == 62) {
                this.menuItems.admin_features.push({
                    title: 'Engine Master List',
                    link: '/EngineList',
                });
                this.menuItems.admin_features.push({
                    title: 'Service Package Items',
                    link: '/servicePackagePartsList',
                });
            } else if (element['ft_id'] == 63) {
                this.menuItems.admin_features.push({
                    title: 'Model Code Labour Setup',
                    link: '/servicePkgMcLabour',
                });
            } else if (element['ft_id'] == 64) {
                this.menuItems.admin_features.push({
                    title: 'Update Service Package',
                    link: '/updatesServicePackage',
                });
            } else if (element['ft_id'] == 65) {
                this.menuItems.admin_features.push({
                    title: 'Service Package Model Code List',
                    link: '/ServicePkgModelcodeList',
                });
            } else if (element['ft_id'] == 66) {
                this.menuItems.service_features.push({
                    title: 'Service Packages Parts List',
                    link: '/spare-parts/parts-list',
                });
            } else if (element['ft_id'] == 67) {
                this.menuItems.service_features.push({
                    title: 'Requested Parts Price',
                    link: '/requestedPartsPrice',
                });
            }
        });
    }

    setActiveDropdown() {
        const selector = document.querySelector('.sidebar ul a[routerLink="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    }

    toggleMobileMenu() {
        if (window.innerWidth < 1024) {
            this.storeData.dispatch({ type: 'toggleSidebar' });
        }
    }

    toggleAccordion(name: string, parent?: string) {
        if (this.activeDropdown.includes(name)) {
            this.activeDropdown = this.activeDropdown.filter((d) => d !== name);
        } else {
            this.activeDropdown.push(name);
        }
    }
}
