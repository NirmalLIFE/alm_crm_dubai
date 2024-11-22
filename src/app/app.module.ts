import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

//Routes
import { routes } from './app.route';

import { AppComponent } from './app.component';

// service
import { AppService } from './service/app.service';

// store
import { StoreModule } from '@ngrx/store';
import { indexReducer } from './store/index.reducer';

// i18n
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// headlessui
import { MenuModule } from 'headlessui-angular';

// perfect-scrollbar
import { NgScrollbarModule } from 'ngx-scrollbar';

// dashboard
import { IndexComponent } from './index';

// Layouts
import { AppLayout } from './layouts/app-layout';
import { AuthLayout } from './layouts/auth-layout';

import { HeaderComponent } from './layouts/header';
import { FooterComponent } from './layouts/footer';
import { SidebarComponent } from './layouts/sidebar';
import { ThemeCustomizerComponent } from './layouts/theme-customizer';
import { StaffLoginComponent } from './pages/pre-auth/staff-login/staff-login.component';
import { DasboardMasterComponent } from './pages/crm_module/dasboard-master/dasboard-master.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { StaffInboundCallComponent } from './pages/crm_module/inbound_call/staff-inbound-call/staff-inbound-call.component';
import { DataTableModule } from '@bhplugin/ng-datatable';
import { CallLogAddScreenComponent } from './pages/crm_module/common_modals/call-log-add-screen/call-log-add-screen.component';
import { ModalModule } from 'angular-custom-modal';
import { UserCreateComponent } from './pages/crm_module/user_module/user-create/user-create.component';
import { UserListComponent } from './pages/crm_module/user_module/user-list/user-list.component';
import { UserEditComponent } from './pages/crm_module/user_module/user-edit/user-edit.component';
import { NgxTippyModule } from 'ngx-tippy-wrapper';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';
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
import { TextMaskModule } from 'angular2-text-mask';
import { LostImportComponent } from './pages/crm_module/lost-customer/lost-import/lost-import.component';
import { LostImportDetailsComponent } from './pages/crm_module/lost-customer/lost-import-details/lost-import-details.component';
import { QuoteListComponent } from './pages/crm_module/quote-module/normal-quote/quote-list/quote-list.component';
import { QuoteCreateComponent } from './pages/crm_module/quote-module/normal-quote/quote-create/quote-create.component';
import { QuoteEditComponent } from './pages/crm_module/quote-module/normal-quote/quote-edit/quote-edit.component';
import { QuoteListComponent as QuoteListComponentSpecial } from './pages/crm_module/quote-module/special-quote/quote-list/quote-list.component';
import { QuoteCreateComponent as QuoteCreateComponentSpecial } from './pages/crm_module/quote-module/special-quote/quote-create/quote-create.component';
import { QuoteEditComponent as QuoteEditComponentSpecial } from './pages/crm_module/quote-module/special-quote/quote-edit/quote-edit.component';
import { DecimalNumberPipe } from './pipe/decimal-number.pipe';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { QuoteVersionsComponent } from './pages/crm_module/quote-module/normal-quote/quote-versions/quote-versions.component';
import { CrepsflistingComponent } from './pages/crm_module/psf-module/crepsflisting/crepsflisting.component';
import { PsfSaTodaycallsComponent } from './pages/crm_module/psf-module/psf-sa-todaycalls/psf-sa-todaycalls.component';
import { CrepsfupdateComponent } from './pages/crm_module/psf-module/crepsfupdate/crepsfupdate.component';
import { PsfSaModalComponent } from './pages/crm_module/psf-module/psf-sa-modal/psf-sa-modal.component';
import { PsfCallHistoryComponent } from './pages/crm_module/psf-module/psf-call-history/psf-call-history.component';
import { UserpsflistingComponent } from './pages/crm_module/psf-module/userpsflisting/userpsflisting.component';
import { PsfCallUpdateComponent } from './pages/crm_module/psf-module/psf-call-update/psf-call-update.component';
import { StaffMissedCallsComponent } from './pages/crm_module/inbound_call/staff-missed-calls/staff-missed-calls.component';
import { AppointmentListComponent } from './pages/crm_module/leads/appointment/appointment-list/appointment-list.component';
import { PsfadminreportComponent } from './pages/crm_module/psf-module/psfadminreport/psfadminreport.component';
import { ExpiredanddissatisfiedComponent } from './pages/crm_module/psf-module/expiredanddissatisfied/expiredanddissatisfied.component';
import { UserPsfReportComponent } from './pages/crm_module/psf-module/user-psf-report/user-psf-report.component';
import { PsfSaGraphComponent } from './pages/crm_module/psf-module/psf-sa-graph/psf-sa-graph.component';
import { UserReportCreComponent } from './pages/crm_module/psf-module/user-report-cre/user-report-cre.component';
import { PsfNotApplicableComponent } from './pages/crm_module/psf-module/psf-not-applicable/psf-not-applicable.component';
import { CreDashComponent } from './pages/user-dash/cre-dash/cre-dash.component';
import { TargetSettingsComponent } from './pages/crm_module/target-settings/target-settings/target-settings.component';
import { QuotationListComponent } from './pages/crm_module/leads/quotation/quotation-list/quotation-list.component';
import { DissatisfiedCustomersListComponent } from './pages/crm_module/dissatisfied/dissatisfied-customers-list/dissatisfied-customers-list.component';
import { LeadListComponent } from './pages/crm_module/leads/lead-list/lead-list.component';
import { AppointmentDetailsComponent } from './pages/crm_module/leads/appointment/appointment-details/appointment-details.component';
import { AppointmentCreateComponent } from './pages/crm_module/leads/appointment/appointment-create/appointment-create.component';
import { VersionEditComponent } from './pages/crm_module/quote-module/normal-quote/version-edit/version-edit.component';
import { QuotationDetailsComponent } from './pages/crm_module/leads/quotation/quotation-details/quotation-details.component';
import { DissatisfiedDetailsComponent } from './pages/crm_module/dissatisfied/dissatisfied-details/dissatisfied-details.component';
import { SpareDashComponent } from './pages/user-dash/spare-dash/spare-dash.component';
import { CallLogDetailComponent } from './pages/crm_module/common_modals/call-log-detail/call-log-detail.component';
import { LeadDetailScreenComponent } from './pages/crm_module/common_modals/lead-detail-screen/lead-detail-screen.component';
import { AssignedLostCountComponent } from './pages/crm_module/lost-customer/assigned-lost-count/assigned-lost-count.component';
import { AssignedLostDetailsComponent } from './pages/crm_module/lost-customer/assigned-lost-details/assigned-lost-details.component';
import { AssignedLostUpdateComponent } from './pages/crm_module/lost-customer/assigned-lost-update/assigned-lost-update.component';
import { LeadCreateComponent } from './pages/crm_module/leads/lead-create/lead-create.component';
import { LostCountReportComponent } from './pages/crm_module/lost-customer/lost-count-report/lost-count-report.component';
import { LostReportDetailsComponent } from './pages/crm_module/lost-customer/lost-report-details/lost-report-details.component';
import { LostReportViewDetailsComponent } from './pages/crm_module/lost-customer/lost-report-view-details/lost-report-view-details.component';
import { InboundCallReportComponent } from './pages/crm_module/inbound_call/inbound-call-report/inbound-call-report.component';
import { InboundCallAnalysisComponent } from './pages/crm_module/inbound_call/inbound-call-analysis/inbound-call-analysis.component';
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
import { GoogleMapsModule } from '@angular/google-maps';
import { ParseJsonPipe } from './pipe/parse-json.pipe';
import { WhatsappLeadCreateComponent } from './pages/crm_module/chats/whatsapp-lead-create/whatsapp-lead-create.component';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { WhatsappLeadsListComponent } from './pages/crm_module/leads/whatsapp/whatsapp-leads-list/whatsapp-leads-list.component';
import { QuoteLogComponent } from './pages/crm_module/quote-module/normal-quote/quote-logs/quote-log/quote-log.component';
import { WhatsappSettingsComponent } from './pages/crm_module/leads/whatsapp/whatsapp-settings/whatsapp-settings.component';
import { CustomerAnalysisComponent } from './pages/crm_module/customer/customer-analysis/customer-analysis.component';

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', useHash: true }),
        BrowserModule,
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        MenuModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: httpTranslateLoader,
                deps: [HttpClient],
            },
        }),
        StoreModule.forRoot({ index: indexReducer }),
        NgScrollbarModule.withConfig({
            visibility: 'hover',
            appearance: 'standard',
        }),
        NgApexchartsModule,
        DataTableModule,
        ModalModule,
        NgxTippyModule,
        Ng2FlatpickrModule,
        NgSelectModule,
        TextMaskModule,
        AutocompleteLibModule,
        GoogleMapsModule,
        PickerModule
    ],
    declarations: [
        AppComponent,
        HeaderComponent,
        FooterComponent,
        SidebarComponent,
        ThemeCustomizerComponent,
        IndexComponent,
        AppLayout,
        AuthLayout,
        StaffLoginComponent,
        DasboardMasterComponent,
        StaffInboundCallComponent,
        CallLogAddScreenComponent,
        UserCreateComponent,
        UserListComponent,
        UserEditComponent,
        UserTimeScheduleComponent,
        UserRoleListComponent,
        UserRoleCreateComponent,
        UserRoleEditComponent,
        CallPurposeListComponent,
        DepartmentListComponent,
        DepartmentCreateComponent,
        DepartmentEditComponent,
        UserActivityLogComponent,
        ExcludedNumbersComponent,
        SpareBrandComponent,
        GeneralSettingsComponent,
        LostImportComponent,
        LostImportDetailsComponent,
        QuoteListComponent,
        QuoteCreateComponent,
        QuoteEditComponent,
        QuoteListComponentSpecial,
        QuoteCreateComponentSpecial,
        QuoteEditComponentSpecial,
        DecimalNumberPipe,
        QuoteVersionsComponent,
        CrepsflistingComponent,
        PsfSaTodaycallsComponent,
        CrepsfupdateComponent,
        PsfSaModalComponent,
        PsfCallHistoryComponent,
        StaffMissedCallsComponent,
        AppointmentListComponent,
        UserpsflistingComponent,
        PsfCallUpdateComponent,
        StaffMissedCallsComponent,
        PsfadminreportComponent,
        ExpiredanddissatisfiedComponent,
        UserPsfReportComponent,
        PsfSaGraphComponent,
        UserReportCreComponent,
        PsfNotApplicableComponent,
        CreDashComponent,
        TargetSettingsComponent,
        QuotationListComponent,
        DissatisfiedCustomersListComponent,
        LeadListComponent,
        AppointmentDetailsComponent,
        AppointmentCreateComponent,
        VersionEditComponent,
        QuotationDetailsComponent,
        DissatisfiedDetailsComponent,
        SpareDashComponent,
        CallLogDetailComponent,
        LeadDetailScreenComponent,
        AssignedLostCountComponent,
        AssignedLostDetailsComponent,
        AssignedLostUpdateComponent,
        LeadCreateComponent,
        LostCountReportComponent,
        LostReportDetailsComponent,
        LostReportViewDetailsComponent,
        InboundCallReportComponent,
        InboundCallAnalysisComponent,
        DetailsByPhoneComponent,
        CustomerConversionReportComponent,
        AlmSpareInvoiceComponent,
        MissedCallReportComponent,
        AlmSpareInvoiceListComponent,
        AlmSpareInvoiceEditComponent,
        AlmSpareInvoiceAdminApprovalComponent,
        AlmSpareInvoiceAdminApprovalEditComponent,
        SpareSuppliersListComponent,
        PostInvoiceCreateComponent,
        AlmSpareInvoiceReportComponent,
        LeadUpdateComponent,
        PsfWhatsappReportComponent,
        SaDashComponent,
        AlmNmSpareInvoiceListComponent,
        CallAnalysisReportComponent,
        CustomerRevisitAnalysisComponent,
        JobStatusUpdateComponent,
        JobStatusMasterComponent,
        PartsListComponent,
        LabourListComponent,
        ServiceCreationComponent,
        ServiceListComponent,
        ServiceEditComponent,
        CampaignEnquiriesComponent,
        CampaignDetailsComponent,
        AppointmentOverduesComponent,
        QuotationTimeExceededComponent,
        CampaignTimeExceededComponent,
        JobCardTatComponent,
        AppointmentReportComponent,
        StaffPerfomanceAnalysisComponent,
        SocialMediaCampaignListComponent,
        SocialMediaCampaignUpdateComponent,
        SocialMediaCampaignReportComponent,
        WhatsappChatComponent,
        ParseJsonPipe,
        WhatsappLeadCreateComponent,
        WhatsappLeadsListComponent,
        QuoteLogComponent,
        WhatsappSettingsComponent,
        CustomerAnalysisComponent,
    ],
    providers: [AppService, Title, DatePipe,],
    bootstrap: [AppComponent],
})
export class AppModule { }

// AOT compilation support
export function httpTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http);
}
