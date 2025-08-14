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
import { CustomerAnalysisComponent } from './pages/crm_module/customer/customer-analysis/customer-analysis.component';
import { CustomerFollowUpsComponent } from './pages/crm_module/customers/customer-follow-ups/customer-follow-ups.component';
import { ServiceRemainderReportComponent } from './pages/crm_module/service-module/service-remainder-report/service-remainder-report.component';
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
export const routes: Routes = [
    {
        path: '',
        component: AuthLayout,
        children: [{ path: '', component: StaffLoginComponent, title: 'CRM - AL MARAGHI LEAD MANAGEMENT SYSTEM' }],
    },
    {
        path: '',
        component: AppLayout,
        children: [
            // dashboard
            { path: 'dashboard', component: DasboardMasterComponent, title: 'CRM - AL MARAGHI LEAD MANAGEMENT SYSTEM' },
            { path: 'staff/inbound_call', component: StaffInboundCallComponent },
            { path: 'staff/missed_calls', component: StaffMissedCallsComponent },
            { path: 'admin_staff/user/user_list', component: UserListComponent },
            { path: 'admin_staff/user/user_list/user_edit/:id', component: UserEditComponent },
            { path: 'admin_staff/user/user_list/user_create', component: UserCreateComponent },
            { path: 'admin_staff/user/user_list/user_schedule/:id', component: UserTimeScheduleComponent },
            { path: 'admin_staff/user/user_role_list', component: UserRoleListComponent },
            { path: 'admin_staff/user/user_role_list/user_role_create', component: UserRoleCreateComponent },
            { path: 'admin_staff/user/user_role_list/user_role_edit/:id/:dep_id', component: UserRoleEditComponent },
            { path: 'admin_staff/call_purpose/list', component: CallPurposeListComponent },
            { path: 'admin_staff/departments/list', component: DepartmentListComponent },
            { path: 'admin_staff/departments/list/create', component: DepartmentCreateComponent },
            { path: 'admin_staff/departments/list/edit/:id', component: DepartmentEditComponent },
            { path: 'admin_staff/user/user_log', component: UserActivityLogComponent },
            { path: 'admin_staff/excluded_list/numbers', component: ExcludedNumbersComponent },
            { path: 'admin_staff/quotation/spare_brands', component: SpareBrandComponent },
            { path: 'admin_staff/general-settings', component: GeneralSettingsComponent },
            { path: 'admin_staff/lost_customer/lc_import', component: LostImportComponent },
            { path: 'admin_staff/company-report/call-report', component: CallAnalysisReportComponent },
            { path: 'admin_staff/company-report/customer_revisit', component: CustomerRevisitAnalysisComponent },
            { path: 'admin_staff/lost_customer/lc_import/details/:id', component: LostImportDetailsComponent },
            { path: 'admin-report/psf_report/psf-whatsapp-report', component: PsfWhatsappReportComponent },
            { path: 'quotation/normal_quote/quote_list', component: QuoteListComponentNormal },
            { path: 'quotation/special_quote/quote_list', component: QuoteListComponentSpecial },
            { path: 'quotation/normal_quote/quote_list/quote_edit/:id/:source', component: QuoteEditComponentNormal },
            { path: 'quotation/normal_quote/quote_list/quote_version_edit/:id/:main_id', component: VersionEditComponent },
            { path: 'quotation/special_quote/quote_list/quote_edit/:id', component: QuoteEditComponentSpecial },
            { path: 'quotation/normal_quote/quote_list/quote_create', component: QuoteCreateComponentNormal },
            { path: 'quotation/special_quote/quote_list/quote_create', component: QuoteCreateComponentSpecial },
            { path: 'leads/appointment/appointment-list', component: AppointmentListComponent },
            { path: 'leads/appointment/appointment-details/:id', component: AppointmentDetailsComponent },
            { path: 'leads/lead-list', component: LeadListComponent },
            { path: 'psf-calls/staff/cre-psf', component: CrepsflistingComponent },
            { path: 'psf-calls/staff/sa-psf', component: UserpsflistingComponent },
            { path: 'crepsfupdate/:id', component: CrepsfupdateComponent },
            { path: 'psf-calls/admin/psfadminreport', component: PsfadminreportComponent },
            { path: 'expiredanddissatisfied', component: ExpiredanddissatisfiedComponent },
            { path: 'userpsfreport', component: UserPsfReportComponent },
            { path: 'psfsatodaycalls', component: PsfSaTodaycallsComponent },
            { path: 'userreportcre', component: UserReportCreComponent },
            { path: 'psfnotapplicable', component: PsfNotApplicableComponent },
            { path: 'admin_staff/target-settings', component: TargetSettingsComponent },
            { path: 'leads/quotation/quotation-list', component: QuotationListComponent },
            { path: 'leads/quotation/quotation-details/:id', component: QuotationDetailsComponent },
            { path: 'dissatisfied/dissatisfied-customers-list', component: DissatisfiedCustomersListComponent },
            { path: 'dissatisfied/dissatisfied-details/:id', component: DissatisfiedDetailsComponent },
            { path: 'lost-customer/assigned-lost-count', component: AssignedLostCountComponent },
            { path: 'lost-customer/assigned-lost-details', component: AssignedLostDetailsComponent },
            { path: 'lost-customer/lost-count-report', component: LostCountReportComponent },
            { path: 'lost-customer/staff-perfomance-analysis', component: StaffPerfomanceAnalysisComponent },
            { path: 'lost-customer/lost-report-details', component: LostReportDetailsComponent },
            { path: 'inbound-call/inbound-call-reports', component: InboundCallReportComponent },
            { path: 'details-by-phone', component: DetailsByPhoneComponent },
            { path: 'leads/customer/customer-conversion-report', component: CustomerConversionReportComponent },
            { path: 'missed-call-report', component: MissedCallReportComponent },
            { path: 'spare-invoice/spare-invoice-list/spare-create', component: AlmSpareInvoiceComponent },
            { path: 'spare-invoice/spare-invoice-list', component: AlmSpareInvoiceListComponent },
            { path: 'spare-invoice/spare-invoice-list/spare-edit/:id', component: AlmSpareInvoiceEditComponent },
            { path: 'admin_spare_invoice', component: AlmSpareInvoiceAdminApprovalComponent },
            { path: 'admin_spare_invoice-edit/:id', component: AlmSpareInvoiceAdminApprovalEditComponent },
            { path: 'spare_suppliers_list', component: SpareSuppliersListComponent },
            { path: 'post_spare_invoice_creation', component: PostInvoiceCreateComponent },
            { path: 'spare_invoice_report', component: AlmSpareInvoiceReportComponent },
            { path: 'lead_update/:id', component: LeadUpdateComponent },
            { path: 'sa-dashboard', component: SaDashComponent },
            { path: 'spare-invoice/nm-spare-invoice-list', component: AlmNmSpareInvoiceListComponent },
            { path: 'job-card/job-status-update', component: JobStatusUpdateComponent },
            { path: 'job-card/job-status-master', component: JobStatusMasterComponent },
            { path: 'spare-parts/parts-list', component: PartsListComponent },
            { path: 'Labour/labour-list', component: LabourListComponent },
            { path: 'serviceCreation', component: ServiceCreationComponent },
            { path: 'serviceList', component: ServiceListComponent },
            { path: 'editService', component: ServiceEditComponent },
            { path: 'campaignLeads', component: CampaignEnquiriesComponent },
            { path: 'campaign-details/:id', component: CampaignDetailsComponent },
            { path: 'overdueAppoints', component: AppointmentOverduesComponent },
            { path: 'totalTimeExceededQuotations', component: QuotationTimeExceededComponent },
            { path: 'timeExceededCampaigns', component: CampaignTimeExceededComponent },
            { path: 'workshoptat', component: JobCardTatComponent },
            { path: 'appointment_report', component: AppointmentReportComponent },
            { path: 'campaign_list', component: SocialMediaCampaignListComponent },
            { path: 'socialMediaCampaign_update/:id', component: SocialMediaCampaignUpdateComponent },
            { path: 'SocialMediaReportPage', component: SocialMediaCampaignReportComponent },
            { path: 'whatsappchat', component: WhatsappChatComponent },
            { path: 'whatsappLeadList', component: WhatsappLeadsListComponent },
            { path: 'whatsappSettings', component: WhatsappSettingsComponent },
            { path: 'customerAnalysis', component: CustomerAnalysisComponent },
            { path: 'serviceRemainderReport', component: ServiceRemainderReportComponent },
            { path: 'customerFollowUps', component: CustomerFollowUpsComponent },
            { path: 'servicePackageList', component: ServicePackageListComponent },
            { path: 'servicePackageRequested', component: ServicePackageRequestedComponent },
            { path: 'servicePackageParts/:id', component: ServicePkgPartsSetupComponent },
            { path: 'servicePackageLabour/:id', component: ServicePkgLabourSetupComponent },
            { path: 'servicePackageKm/:id', component: ServicePkgKmSetupComponent },
            { path: 'EngineList', component: EngineListComponent },
            { path: 'servicePackagePartsList', component: ServicePkgPartsMasterComponent },
            { path: 'servicePackageKmPriceMap/:id', component: ServicePkgKmPriceMapComponent },
            { path: 'servicePkgMcLabour', component: ServicePkgMcLabourSetupComponent },
            { path: 'updatesServicePackage', component: ServicePkgAdminUpdateComponent },
            { path: 'servicePkgCnsLbr/:id', component: ServicePkgCnsLbrComponent },
            { path: 'ServicePkgModelcodeList', component: ServicePkgModelcodeListComponent },
            { path: 'requestedPartsPrice', component: PartsPriceRequestAdminComponent },
        ],
    },
];
