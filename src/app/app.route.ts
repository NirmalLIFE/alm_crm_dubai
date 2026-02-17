import { Routes } from '@angular/router';

// dashboard
import { IndexComponent } from './index';
import { AppLayout } from './layouts/app-layout';
import { AuthLayout } from './layouts/auth-layout';
import { StaffLoginComponent } from './pages/pre-auth/staff-login/staff-login.component';
import { DasboardMasterComponent } from './pages/crm_module/dasboard-master/dasboard-master.component';
import { StaffInboundCallComponent } from './pages/crm_module/inbound_call/staff-inbound-call/staff-inbound-call.component';
import { UserListComponent } from './pages/crm_module/user_module/user-list/user-list.component';
import { UserEditComponent } from './pages/crm_module/user_module/user-edit/user-edit.component';
import { UserCreateComponent } from './pages/crm_module/user_module/user-create/user-create.component';
import { UserTimeScheduleComponent } from './pages/crm_module/user_module/user-time-schedule/user-time-schedule.component';
import { UserRoleListComponent } from './pages/crm_module/user_module/user-role-list/user-role-list.component';
import { UserRoleCreateComponent } from './pages/crm_module/user_module/user-role-create/user-role-create.component';
import { UserRoleEditComponent } from './pages/crm_module/user_module/user-role-edit/user-role-edit.component';
import { CallPurposeListComponent } from './pages/crm_module/call_purpose/call-purpose-list/call-purpose-list.component';
import { DepartmentListComponent } from './pages/crm_module/department/department-list/department-list.component';
import { DepartmentCreateComponent } from './pages/crm_module/department/department-create/department-create.component';
import { DepartmentEditComponent } from './pages/crm_module/department/department-edit/department-edit.component';
import { UserActivityLogComponent } from './pages/crm_module/user_module/user-activity-log/user-activity-log.component';
import { ExcludedNumbersComponent } from './pages/crm_module/excluded-numbers/excluded-numbers.component';
import { SpareBrandComponent } from './pages/crm_module/quotation/spare-brand/spare-brand.component';
import { GeneralSettingsComponent } from './pages/crm_module/general-settings/general-settings.component';
import { LostImportComponent } from './pages/crm_module/lost-customer/lost-import/lost-import.component';
import { LostImportDetailsComponent } from './pages/crm_module/lost-customer/lost-import-details/lost-import-details.component';
import { QuoteListComponent as QuoteListComponentNormal } from './pages/crm_module/quote-module/normal-quote/quote-list/quote-list.component';
import { QuoteListComponent as QuoteListComponentSpecial } from './pages/crm_module/quote-module/special-quote/quote-list/quote-list.component';
import { QuoteEditComponent as QuoteEditComponentNormal } from './pages/crm_module/quote-module/normal-quote/quote-edit/quote-edit.component';
import { QuoteEditComponent as QuoteEditComponentSpecial } from './pages/crm_module/quote-module/special-quote/quote-edit/quote-edit.component';
import { QuoteCreateComponent as QuoteCreateComponentNormal } from './pages/crm_module/quote-module/normal-quote/quote-create/quote-create.component';
import { QuoteCreateComponent as QuoteCreateComponentSpecial } from './pages/crm_module/quote-module/special-quote/quote-create/quote-create.component';
import { CrepsflistingComponent } from './pages/crm_module/psf-module/crepsflisting/crepsflisting.component';
import { PsfSaTodaycallsComponent } from './pages/crm_module/psf-module/psf-sa-todaycalls/psf-sa-todaycalls.component';
import { CrepsfupdateComponent } from './pages/crm_module/psf-module/crepsfupdate/crepsfupdate.component';
import { UserpsflistingComponent } from './pages/crm_module/psf-module/userpsflisting/userpsflisting.component';
import { StaffMissedCallsComponent } from './pages/crm_module/inbound_call/staff-missed-calls/staff-missed-calls.component';
import { AppointmentListComponent } from './pages/crm_module/leads/appointment/appointment-list/appointment-list.component';
import { PsfadminreportComponent } from './pages/crm_module/psf-module/psfadminreport/psfadminreport.component';
import { ExpiredanddissatisfiedComponent } from './pages/crm_module/psf-module/expiredanddissatisfied/expiredanddissatisfied.component';
import { UserPsfReportComponent } from './pages/crm_module/psf-module/user-psf-report/user-psf-report.component';
import { UserReportCreComponent } from './pages/crm_module/psf-module/user-report-cre/user-report-cre.component';
import { PsfNotApplicableComponent } from './pages/crm_module/psf-module/psf-not-applicable/psf-not-applicable.component';
import { TargetSettingsComponent } from './pages/crm_module/target-settings/target-settings/target-settings.component';
import { QuotationListComponent } from './pages/crm_module/leads/quotation/quotation-list/quotation-list.component';
import { DissatisfiedCustomersListComponent } from './pages/crm_module/dissatisfied/dissatisfied-customers-list/dissatisfied-customers-list.component';
import { LeadListComponent } from './pages/crm_module/leads/lead-list/lead-list.component';
import { AppointmentDetailsComponent } from './pages/crm_module/leads/appointment/appointment-details/appointment-details.component';
import { QuotationDetailsComponent } from './pages/crm_module/leads/quotation/quotation-details/quotation-details.component';
import { DissatisfiedDetailsComponent } from './pages/crm_module/dissatisfied/dissatisfied-details/dissatisfied-details.component';
import { VersionEditComponent } from './pages/crm_module/quote-module/normal-quote/version-edit/version-edit.component';
import { AssignedLostCountComponent } from './pages/crm_module/lost-customer/assigned-lost-count/assigned-lost-count.component';
import { AssignedLostDetailsComponent } from './pages/crm_module/lost-customer/assigned-lost-details/assigned-lost-details.component';
import { LostCountReportComponent } from './pages/crm_module/lost-customer/lost-count-report/lost-count-report.component';
import { LostReportDetailsComponent } from './pages/crm_module/lost-customer/lost-report-details/lost-report-details.component';
import { InboundCallReportComponent } from './pages/crm_module/inbound_call/inbound-call-report/inbound-call-report.component';
import { DetailsByPhoneComponent } from './pages/crm_module/details-by-phone/details-by-phone.component';
import { CustomerConversionReportComponent } from './pages/crm_module/leads/customer/customer-conversion-report/customer-conversion-report.component';
import { AlmSpareInvoiceComponent } from './pages/crm_module/invoice/alm-spare-invoice/alm-spare-invoice.component';
import { MissedCallReportComponent } from './pages/crm_module/inbound_call/missed-call-report/missed-call-report.component';
import { AlmSpareInvoiceListComponent } from './pages/crm_module/invoice/alm-spare-invoice-list/alm-spare-invoice-list.component';
import { AlmSpareInvoiceEditComponent } from './pages/crm_module/invoice/alm-spare-invoice-edit/alm-spare-invoice-edit.component';
import { AlmSpareInvoiceAdminApprovalComponent } from './pages/crm_module/invoice/alm-spare-invoice-admin-approval/alm-spare-invoice-admin-approval.component';
import { AlmSpareInvoiceAdminApprovalEditComponent } from './pages/crm_module/invoice/alm-spare-invoice-admin-approval-edit/alm-spare-invoice-admin-approval-edit.component';
import { SpareSuppliersListComponent } from './pages/crm_module/invoice/spare-suppliers-list/spare-suppliers-list.component';
import { PostInvoiceCreateComponent } from './pages/crm_module/invoice/post-invoice-create/post-invoice-create.component';
import { AlmSpareInvoiceReportComponent } from './pages/crm_module/invoice/alm-spare-invoice-report/alm-spare-invoice-report.component';
import { LeadUpdateComponent } from './pages/crm_module/leads/lead-update/lead-update.component';
import { PsfWhatsappReportComponent } from './pages/crm_module/psf-module/psf-whatsapp-report/psf-whatsapp-report.component';
import { SaDashComponent } from './pages/user-dash/sa-dash/sa-dash.component';
import { AlmNmSpareInvoiceListComponent } from './pages/crm_module/invoice/alm-nm-spare-invoice-list/alm-nm-spare-invoice-list.component';
import { CallAnalysisReportComponent } from './pages/crm_module/company_reports/call-analysis-report/call-analysis-report.component';
import { CustomerRevisitAnalysisComponent } from './pages/crm_module/company_reports/customer-revisit-analysis/customer-revisit-analysis.component';
import { JobStatusUpdateComponent } from './pages/crm_module/job_cards/job-status-update/job-status-update.component';
import { JobStatusMasterComponent } from './pages/crm_module/job_cards/job-status-master/job-status-master.component';
import { PartsListComponent } from './pages/crm_module/service-module/Spare-parts/parts-list/parts-list.component';
import { LabourListComponent } from './pages/crm_module/service-module/Labour/labour-list/labour-list.component';
import { ServiceCreationComponent } from './pages/crm_module/service-module/service-creation/service-creation.component';
import { ServiceListComponent } from './pages/crm_module/service-module/service-list/service-list.component';
import { ServiceEditComponent } from './pages/crm_module/service-module/service-edit/service-edit.component';
import { CampaignEnquiriesComponent } from './pages/crm_module/leads/campaign/campaign-enquiries/campaign-enquiries.component';
import { CampaignDetailsComponent } from './pages/crm_module/leads/campaign/campaign-details/campaign-details.component';
import { AppointmentOverduesComponent } from './pages/crm_module/leads/appointment/appointment-overdues/appointment-overdues.component';
import { QuotationTimeExceededComponent } from './pages/crm_module/leads/quotation/quotation-time-exceeded/quotation-time-exceeded.component';
import { CampaignTimeExceededComponent } from './pages/crm_module/leads/campaign/campaign-time-exceeded/campaign-time-exceeded.component';
import { JobCardTatComponent } from './pages/crm_module/job_cards/job-card-tat/job-card-tat.component';
import { AppointmentReportComponent } from './pages/crm_module/leads/appointment/appointment-report/appointment-report.component';
import { StaffPerfomanceAnalysisComponent } from './pages/crm_module/lost-customer/staff-perfomance-analysis/staff-perfomance-analysis.component';
import { SocialMediaCampaignListComponent } from './pages/crm_module/social_media_campaign/social-media-campaign-list/social-media-campaign-list.component';
import { SocialMediaCampaignUpdateComponent } from './pages/crm_module/social_media_campaign/social-media-campaign-update/social-media-campaign-update.component';
import { SocialMediaCampaignReportComponent } from './pages/crm_module/social_media_campaign/social-media-campaign-report/social-media-campaign-report.component';
import { WhatsappChatComponent } from './pages/crm_module/chats/whatsapp-chat/whatsapp-chat.component';
import { WhatsappLeadsListComponent } from './pages/crm_module/leads/whatsapp/whatsapp-leads-list/whatsapp-leads-list.component';
import { WhatsappSettingsComponent } from './pages/crm_module/leads/whatsapp/whatsapp-settings/whatsapp-settings.component';
import { CustomerAnalysisComponent } from './pages/crm_module/customers/customer-analysis/customer-analysis.component';
import { LeadAnalysisComponent } from './pages/crm_module/leads/lead-analysis/lead-analysis.component';
import { CustomerReEngageReportComponent } from './pages/crm_module/customers/customer-re-engage-report/customer-re-engage-report.component';
import { ServiceRemainderReportComponent } from './pages/crm_module/service-module/service-remainder/service-remainder-report/service-remainder-report.component';
import { CustomerFollowUpsComponent } from './pages/crm_module/customers/customer-follow-ups/customer-follow-ups.component';
import { NewCustomerDashComponent } from './pages/crm_module/customers/new-customer-dash/new-customer-dash.component';
import { ServicePackageListComponent } from './pages/crm_module/service-package/service-package-list/service-package-list.component';
import { ServicePackageRequestedComponent } from './pages/crm_module/service-package/service-package-requested/service-package-requested.component';
import { ServicePkgPartsSetupComponent } from './pages/crm_module/service-package/service-pkg-parts-setup/service-pkg-parts-setup.component';
import { ServicePkgLabourSetupComponent } from './pages/crm_module/service-package/service-pkg-labour-setup/service-pkg-labour-setup.component';
import { ServicePkgKmSetupComponent } from './pages/crm_module/service-package/service-pkg-km-setup/service-pkg-km-setup.component';
import { EngineListComponent } from './pages/crm_module/vehicle-package/engine-list/engine-list.component';
import { ServicePkgPartsMasterComponent } from './pages/crm_module/service-package/service-pkg-parts-master/service-pkg-parts-master.component';
import { ServicePkgKmPriceMapComponent } from './pages/crm_module/service-package/service-pkg-km-price-map/service-pkg-km-price-map.component';
import { ServicePkgMcLabourSetupComponent } from './pages/crm_module/service-package/service-pkg-mc-labour-setup/service-pkg-mc-labour-setup.component';
import { ServicePkgAdminUpdateComponent } from './pages/crm_module/service-package/service-pkg-admin-update/service-pkg-admin-update.component';
import { ServicePkgCnsLbrComponent } from './pages/crm_module/service-package/service-pkg-cns-lbr/service-pkg-cns-lbr.component';
import { ServicePkgModelcodeListComponent } from './pages/crm_module/service-package/service-pkg-modelcode-list/service-pkg-modelcode-list.component';
import { PartsPriceRequestAdminComponent } from './pages/crm_module/service-module/Spare-parts/parts-price-request-admin/parts-price-request-admin.component';
import { LogsComponent } from './pages/crm_module/service-package/logs/logs.component';
import { MaintenanceComponent } from './pages/maintenance/maintenance.component';
import { MaintenanceGuard } from './maintenance.guard';
import { ServiceRmdrRptComponent } from './pages/crm_module/service-module/service-remainder/service-rmdr-rpt/service-rmdr-rpt.component';
import { PermittedIpListComponent } from './pages/crm_module/permitted-ip-list/permitted-ip-list.component';
import { SvcListComponent } from './pages/crm_module/service-contract/svc-list/svc-list.component';
import { SvcCustListComponent } from './pages/crm_module/service-contract/svc-cust-list/svc-cust-list.component';
import { SvcCheckListComponent } from './pages/crm_module/service-contract/svc-check-list/svc-check-list.component';
import { PartsLogComponent } from './pages/crm_module/service-module/Spare-parts/parts-log/parts-log.component';

export const routes: Routes = [
    {
        path: '',
        component: AuthLayout,
        children: [
            { path: '', component: StaffLoginComponent, title: 'CRM - AL MARAGHI LEAD MANAGEMENT SYSTEM', canActivate: [MaintenanceGuard] },
            { path: 'maintenance', component: MaintenanceComponent },
        ],
    },
    {
        path: '',
        component: AppLayout,
        children: [
            // dashboard
            { path: 'dashboard', component: DasboardMasterComponent, title: 'CRM - AL MARAGHI LEAD MANAGEMENT SYSTEM', canActivate: [MaintenanceGuard] },
            { path: 'staff/inbound_call', component: StaffInboundCallComponent, canActivate: [MaintenanceGuard] },
            { path: 'staff/missed_calls', component: StaffMissedCallsComponent, canActivate: [MaintenanceGuard] },
            { path: 'admin_staff/user/user_list', component: UserListComponent, canActivate: [MaintenanceGuard] },
            { path: 'admin_staff/user/user_list/user_edit/:id', component: UserEditComponent, canActivate: [MaintenanceGuard] },
            { path: 'admin_staff/user/user_list/user_create', component: UserCreateComponent, canActivate: [MaintenanceGuard] },
            { path: 'admin_staff/user/user_list/user_schedule/:id', component: UserTimeScheduleComponent, canActivate: [MaintenanceGuard] },
            { path: 'admin_staff/user/user_role_list', component: UserRoleListComponent, canActivate: [MaintenanceGuard] },
            { path: 'admin_staff/user/user_role_list/user_role_create', component: UserRoleCreateComponent, canActivate: [MaintenanceGuard] },
            { path: 'admin_staff/user/user_role_list/user_role_edit/:id/:dep_id', component: UserRoleEditComponent, canActivate: [MaintenanceGuard] },
            { path: 'admin_staff/call_purpose/list', component: CallPurposeListComponent, canActivate: [MaintenanceGuard] },
            { path: 'admin_staff/departments/list', component: DepartmentListComponent, canActivate: [MaintenanceGuard] },
            { path: 'admin_staff/departments/list/create', component: DepartmentCreateComponent, canActivate: [MaintenanceGuard] },
            { path: 'admin_staff/departments/list/edit/:id', component: DepartmentEditComponent, canActivate: [MaintenanceGuard] },
            { path: 'admin_staff/user/user_log', component: UserActivityLogComponent, canActivate: [MaintenanceGuard] },
            { path: 'admin_staff/excluded_list/numbers', component: ExcludedNumbersComponent, canActivate: [MaintenanceGuard] },
            { path: 'admin_staff/quotation/spare_brands', component: SpareBrandComponent, canActivate: [MaintenanceGuard] },
            { path: 'admin_staff/general-settings', component: GeneralSettingsComponent, canActivate: [MaintenanceGuard] },
            { path: 'admin_staff/lost_customer/lc_import', component: LostImportComponent, canActivate: [MaintenanceGuard] },
            { path: 'admin_staff/company-report/call-report', component: CallAnalysisReportComponent, canActivate: [MaintenanceGuard] },
            { path: 'admin_staff/company-report/customer_revisit', component: CustomerRevisitAnalysisComponent, canActivate: [MaintenanceGuard] },
            { path: 'admin_staff/lost_customer/lc_import/details/:id', component: LostImportDetailsComponent, canActivate: [MaintenanceGuard] },
            { path: 'admin-report/psf_report/psf-whatsapp-report', component: PsfWhatsappReportComponent, canActivate: [MaintenanceGuard] },
            { path: 'quotation/normal_quote/quote_list', component: QuoteListComponentNormal, canActivate: [MaintenanceGuard] },
            { path: 'quotation/special_quote/quote_list', component: QuoteListComponentSpecial, canActivate: [MaintenanceGuard] },
            { path: 'quotation/normal_quote/quote_list/quote_edit/:id/:source', component: QuoteEditComponentNormal, canActivate: [MaintenanceGuard] },
            { path: 'quotation/normal_quote/quote_list/quote_version_edit/:id/:main_id', component: VersionEditComponent, canActivate: [MaintenanceGuard] },
            { path: 'quotation/special_quote/quote_list/quote_edit/:id', component: QuoteEditComponentSpecial, canActivate: [MaintenanceGuard] },
            { path: 'quotation/normal_quote/quote_list/quote_create', component: QuoteCreateComponentNormal, canActivate: [MaintenanceGuard] },
            { path: 'quotation/special_quote/quote_list/quote_create', component: QuoteCreateComponentSpecial, canActivate: [MaintenanceGuard] },
            { path: 'leads/appointment/appointment-list', component: AppointmentListComponent, canActivate: [MaintenanceGuard] },
            { path: 'leads/appointment/appointment-details/:id', component: AppointmentDetailsComponent, canActivate: [MaintenanceGuard] },
            { path: 'leads/lead-list', component: LeadListComponent, canActivate: [MaintenanceGuard] },
            { path: 'psf-calls/staff/cre-psf', component: CrepsflistingComponent, canActivate: [MaintenanceGuard] },
            { path: 'psf-calls/staff/sa-psf', component: UserpsflistingComponent, canActivate: [MaintenanceGuard] },
            { path: 'crepsfupdate/:id', component: CrepsfupdateComponent, canActivate: [MaintenanceGuard] },
            { path: 'psf-calls/admin/psfadminreport', component: PsfadminreportComponent, canActivate: [MaintenanceGuard] },
            { path: 'expiredanddissatisfied', component: ExpiredanddissatisfiedComponent, canActivate: [MaintenanceGuard] },
            { path: 'userpsfreport', component: UserPsfReportComponent, canActivate: [MaintenanceGuard] },
            { path: 'psfsatodaycalls', component: PsfSaTodaycallsComponent, canActivate: [MaintenanceGuard] },
            { path: 'userreportcre', component: UserReportCreComponent, canActivate: [MaintenanceGuard] },
            { path: 'psfnotapplicable', component: PsfNotApplicableComponent, canActivate: [MaintenanceGuard] },
            { path: 'admin_staff/target-settings', component: TargetSettingsComponent, canActivate: [MaintenanceGuard] },
            { path: 'leads/quotation/quotation-list', component: QuotationListComponent, canActivate: [MaintenanceGuard] },
            { path: 'leads/quotation/quotation-details/:id', component: QuotationDetailsComponent, canActivate: [MaintenanceGuard] },
            { path: 'dissatisfied/dissatisfied-customers-list', component: DissatisfiedCustomersListComponent, canActivate: [MaintenanceGuard] },
            { path: 'dissatisfied/dissatisfied-details/:id', component: DissatisfiedDetailsComponent, canActivate: [MaintenanceGuard] },
            { path: 'lost-customer/assigned-lost-count', component: AssignedLostCountComponent, canActivate: [MaintenanceGuard] },
            { path: 'lost-customer/assigned-lost-details', component: AssignedLostDetailsComponent, canActivate: [MaintenanceGuard] },
            { path: 'lost-customer/lost-count-report', component: LostCountReportComponent, canActivate: [MaintenanceGuard] },
            { path: 'lost-customer/staff-perfomance-analysis', component: StaffPerfomanceAnalysisComponent, canActivate: [MaintenanceGuard] },
            { path: 'lost-customer/lost-report-details', component: LostReportDetailsComponent, canActivate: [MaintenanceGuard] },
            { path: 'inbound-call/inbound-call-reports', component: InboundCallReportComponent, canActivate: [MaintenanceGuard] },
            { path: 'details-by-phone', component: DetailsByPhoneComponent, canActivate: [MaintenanceGuard] },
            { path: 'leads/customer/customer-conversion-report', component: CustomerConversionReportComponent, canActivate: [MaintenanceGuard] },
            { path: 'missed-call-report', component: MissedCallReportComponent, canActivate: [MaintenanceGuard] },
            { path: 'spare-invoice/spare-invoice-list/spare-create', component: AlmSpareInvoiceComponent, canActivate: [MaintenanceGuard] },
            { path: 'spare-invoice/spare-invoice-list', component: AlmSpareInvoiceListComponent, canActivate: [MaintenanceGuard] },
            { path: 'spare-invoice/spare-invoice-list/spare-edit/:id', component: AlmSpareInvoiceEditComponent, canActivate: [MaintenanceGuard] },
            { path: 'admin_spare_invoice', component: AlmSpareInvoiceAdminApprovalComponent, canActivate: [MaintenanceGuard] },
            { path: 'admin_spare_invoice-edit/:id', component: AlmSpareInvoiceAdminApprovalEditComponent, canActivate: [MaintenanceGuard] },
            { path: 'spare_suppliers_list', component: SpareSuppliersListComponent, canActivate: [MaintenanceGuard] },
            { path: 'post_spare_invoice_creation', component: PostInvoiceCreateComponent, canActivate: [MaintenanceGuard] },
            { path: 'spare_invoice_report', component: AlmSpareInvoiceReportComponent, canActivate: [MaintenanceGuard] },
            { path: 'lead_update/:id', component: LeadUpdateComponent, canActivate: [MaintenanceGuard] },
            { path: 'sa-dashboard', component: SaDashComponent, canActivate: [MaintenanceGuard] },
            { path: 'spare-invoice/nm-spare-invoice-list', component: AlmNmSpareInvoiceListComponent, canActivate: [MaintenanceGuard] },
            { path: 'job-card/job-status-update', component: JobStatusUpdateComponent, canActivate: [MaintenanceGuard] },
            { path: 'job-card/job-status-master', component: JobStatusMasterComponent, canActivate: [MaintenanceGuard] },
            { path: 'spare-parts/parts-list', component: PartsListComponent, canActivate: [MaintenanceGuard] },
            { path: 'Labour/labour-list', component: LabourListComponent, canActivate: [MaintenanceGuard] },
            { path: 'serviceCreation', component: ServiceCreationComponent, canActivate: [MaintenanceGuard] },
            { path: 'serviceList', component: ServiceListComponent, canActivate: [MaintenanceGuard] },
            { path: 'editService', component: ServiceEditComponent, canActivate: [MaintenanceGuard] },
            { path: 'campaignLeads', component: CampaignEnquiriesComponent, canActivate: [MaintenanceGuard] },
            { path: 'campaign-details/:id', component: CampaignDetailsComponent, canActivate: [MaintenanceGuard] },
            { path: 'overdueAppoints', component: AppointmentOverduesComponent, canActivate: [MaintenanceGuard] },
            { path: 'totalTimeExceededQuotations', component: QuotationTimeExceededComponent, canActivate: [MaintenanceGuard] },
            { path: 'timeExceededCampaigns', component: CampaignTimeExceededComponent, canActivate: [MaintenanceGuard] },
            { path: 'workshoptat', component: JobCardTatComponent, canActivate: [MaintenanceGuard] },
            { path: 'appointment_report', component: AppointmentReportComponent, canActivate: [MaintenanceGuard] },
            { path: 'campaign_list', component: SocialMediaCampaignListComponent, canActivate: [MaintenanceGuard] },
            { path: 'socialMediaCampaign_update/:id', component: SocialMediaCampaignUpdateComponent, canActivate: [MaintenanceGuard] },
            { path: 'SocialMediaReportPage', component: SocialMediaCampaignReportComponent, canActivate: [MaintenanceGuard] },
            { path: 'whatsappchat', component: WhatsappChatComponent, canActivate: [MaintenanceGuard] },
            { path: 'whatsappLeadList', component: WhatsappLeadsListComponent, canActivate: [MaintenanceGuard] },
            { path: 'whatsappSettings', component: WhatsappSettingsComponent, canActivate: [MaintenanceGuard] },
            { path: 'customerAnalysis', component: CustomerAnalysisComponent, canActivate: [MaintenanceGuard] },
            { path: 'leadAnalysis', component: LeadAnalysisComponent, canActivate: [MaintenanceGuard] },
            { path: 'CustomerReEngageReport', component: CustomerReEngageReportComponent, canActivate: [MaintenanceGuard] },
            { path: 'serviceRemainderReport', component: ServiceRemainderReportComponent, canActivate: [MaintenanceGuard] },
            { path: 'serviceReminderReportNew', component: ServiceRmdrRptComponent, canActivate: [MaintenanceGuard] },
            { path: 'customerFollowUps', component: CustomerFollowUpsComponent, canActivate: [MaintenanceGuard] },
            { path: 'newCustomerDashboard', component: NewCustomerDashComponent, canActivate: [MaintenanceGuard] },
            { path: 'servicePackageList', component: ServicePackageListComponent, canActivate: [MaintenanceGuard] },
            { path: 'servicePackageRequested', component: ServicePackageRequestedComponent, canActivate: [MaintenanceGuard] },
            { path: 'servicePackageParts/:id', component: ServicePkgPartsSetupComponent, canActivate: [MaintenanceGuard] },
            { path: 'servicePackageLabour/:id', component: ServicePkgLabourSetupComponent, canActivate: [MaintenanceGuard] },
            { path: 'servicePackageKm/:id', component: ServicePkgKmSetupComponent, canActivate: [MaintenanceGuard] },
            { path: 'EngineList', component: EngineListComponent, canActivate: [MaintenanceGuard] },
            { path: 'servicePackagePartsList', component: ServicePkgPartsMasterComponent, canActivate: [MaintenanceGuard] },
            { path: 'servicePackageKmPriceMap/:id', component: ServicePkgKmPriceMapComponent, canActivate: [MaintenanceGuard] },
            { path: 'servicePkgMcLabour', component: ServicePkgMcLabourSetupComponent, canActivate: [MaintenanceGuard] },
            { path: 'updatesServicePackage', component: ServicePkgAdminUpdateComponent, canActivate: [MaintenanceGuard] },
            { path: 'servicePkgCnsLbr/:id', component: ServicePkgCnsLbrComponent, canActivate: [MaintenanceGuard] },
            { path: 'ServicePkgModelcodeList', component: ServicePkgModelcodeListComponent, canActivate: [MaintenanceGuard] },
            { path: 'requestedPartsPrice', component: PartsPriceRequestAdminComponent, canActivate: [MaintenanceGuard] },
            { path: 'service-packages/logs', component: LogsComponent, canActivate: [MaintenanceGuard] },
            { path: 'permitted-ip-list', component: PermittedIpListComponent, canActivate: [MaintenanceGuard] },
            { path: 'ServiceContractTiersList', component: SvcListComponent },
            { path: 'serviceContractCustomers', component: SvcCustListComponent },
            { path: 'searchServiceContract', component: SvcCheckListComponent },
            { path: 'spare-parts/parts-list/parts-log', component: PartsLogComponent },
        ],
    },
];
