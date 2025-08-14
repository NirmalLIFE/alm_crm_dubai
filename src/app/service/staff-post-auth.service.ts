import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
    providedIn: 'root',
})
export class StaffPostAuthService {
    reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + atob(atob(atob(localStorage.getItem('us_token') || '{}'))) });
    fileHeader = new HttpHeaders({ Authorization: 'Bearer ' + atob(atob(atob(localStorage.getItem('us_token') || '{}'))) });
    constructor(private http: HttpClient) {}

    userLoginValidity(): Observable<any> {
        return this.http.get(environment.base_url + 'checkTokenExpiry', { headers: this.reqHeader });
    }

    GetYeaStarKeys(): Observable<any> {
        return this.http.get(environment.base_url + 'getyeastarconfigdatas', { headers: this.reqHeader });
    }
    checkNumber(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'CommonNumber/checkNumber', data, { headers: this.reqHeader });
    }
    userList(): Observable<any> {
        return this.http.get(environment.base_url + 'User/UserController', { headers: this.reqHeader });
    }

    getUserById(data: any): Observable<any> {
        return this.http.get(environment.base_url + 'User/UserController/' + data, { headers: this.reqHeader });
    }

    userRoleList(): Observable<any> {
        return this.http.get(environment.base_url + 'User/UserroleController', { headers: this.reqHeader });
    }

    updateUserData(data: any): Observable<any> {
        return this.http.put(environment.base_url + 'User/UserController/update', data, { headers: this.reqHeader });
    }

    createUser(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'User/UserController', data, { headers: this.reqHeader });
    }

    changeUserPassword(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'User/UserController/changeUserPassword', data, { headers: this.reqHeader });
    }

    userDelete(data: any): Observable<any> {
        return this.http.delete(environment.base_url + 'User/UserController/' + data, { headers: this.reqHeader });
    }

    changeUserStatus(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'User/UserController/changeuserstatus', data, { headers: this.reqHeader });
    }

    changeTrustedGroupStatus(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'User/UserController/changeTrustedGrpStatus', data, { headers: this.reqHeader });
    }

    getUserWorkingTime(data: any): Observable<any> {
        return this.http.get(environment.base_url + 'User/UserWorktime/' + data, { headers: this.reqHeader });
    }

    updateUserWorktime(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'User/UserWorktime/update', data, { headers: this.reqHeader });
    }

    getDeptList(): Observable<any> {
        return this.http.get(environment.base_url + 'getDept', { headers: this.reqHeader });
    }

    FeatureListByDept(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'TrunkList/FeatureListByDept', data, { headers: this.reqHeader });
    }

    getUseRoleById(data: any): Observable<any> {
        return this.http.get(environment.base_url + 'User/UserroleController/' + data, { headers: this.reqHeader });
    }

    getUserGroupList(): Observable<any> {
        return this.http.get(environment.base_url + 'User/UserGroupController', { headers: this.reqHeader });
    }

    updateUserRole(data: any): Observable<any> {
        return this.http.put(environment.base_url + 'User/UserroleController/update', data, { headers: this.reqHeader });
    }

    createUserRole(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'User/UserroleController', data, { headers: this.reqHeader });
    }

    userRoleDelete(data: any): Observable<any> {
        return this.http.delete(environment.base_url + 'User/UserroleController/' + data, { headers: this.reqHeader });
    }
    getCallPurposeList(): Observable<any> {
        return this.http.get(environment.base_url + 'Leads/CallPurpose', { headers: this.reqHeader });
    }

    updateCallPurpose(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Leads/CallPurpose/update', data, { headers: this.reqHeader });
    }
    createCallPurpose(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Leads/CallPurpose', data, { headers: this.reqHeader });
    }

    deleteCallPurpose(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Leads/CallPurpose/delete', data, { headers: this.reqHeader });
    }
    getDepartmentList(): Observable<any> {
        return this.http.get(environment.base_url + 'getDept', { headers: this.reqHeader });
    }

    deleteTrunkDepartment(data: any): Observable<any> {
        return this.http.delete(environment.base_url + 'TrunkList/' + data, { headers: this.reqHeader });
    }
    getDepartmentById(data: any): Observable<any> {
        return this.http.get(environment.base_url + 'TrunkList/' + data, { headers: this.reqHeader });
    }
    updateDepartment(data: any): Observable<any> {
        return this.http.put(environment.base_url + 'TrunkList/update', data, { headers: this.reqHeader });
    }

    getFeatureList(): Observable<any> {
        return this.http.get(environment.base_url + 'accessfeatures', { headers: this.reqHeader });
    }
    createDepartment(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'TrunkList', data, { headers: this.reqHeader });
    }
    getUserLog(): Observable<any> {
        return this.http.get(environment.base_url + 'UserLog', { headers: this.reqHeader });
    }
    getExcludedNumberList(): Observable<any> {
        return this.http.get(environment.base_url + 'CommonNumber', { headers: this.reqHeader });
    }
    addExtensionNumber(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'CommonNumber', data, { headers: this.reqHeader });
    }
    updateExNumberDetails(data: any): Observable<any> {
        return this.http.put(environment.base_url + 'CommonNumber/update', data, { headers: this.reqHeader });
    }
    deleteExcludedNumber(data: any): Observable<any> {
        return this.http.delete(environment.base_url + 'CommonNumber/' + data, { headers: this.reqHeader });
    }
    getBrandList(): Observable<any> {
        return this.http.get(environment.base_url + 'Quotes/Brand', { headers: this.reqHeader });
    }
    updateBrandDetails(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Quotes/Brand/update', data, { headers: this.reqHeader });
    }
    createNewBrand(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Quotes/Brand', data, { headers: this.reqHeader });
    }
    deleteBrandDetails(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Quotes/Brand/delete', data, { headers: this.reqHeader });
    }
    getCommonSettings(): Observable<any> {
        return this.http.get(environment.base_url + 'getCommonSettings', { headers: this.reqHeader });
    }
    getAlmInvoiceComman(): Observable<any> {
        return this.http.get(environment.base_url + 'getAlmInvoiceComman', { headers: this.reqHeader });
    }
    getCustomerVehicles(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getCustomerVehicles', data, { headers: this.reqHeader });
    }

    addVerificationNumber(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'addVerificationNumber', data, { headers: this.reqHeader });
    }
    changeLandlineIncludeStatus(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'changeLandlineStatus', data, { headers: this.reqHeader });
    }
    updateMissedCallBufferTime(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'addBufferTime', data, { headers: this.reqHeader });
    }
    updateWOrkshopTiming(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'addWorkingTime', data, { headers: this.reqHeader });
    }
    retrievePSFSettingsData(): Observable<any> {
        return this.http.get(environment.base_url + 'retrivePSFSettingsData', { headers: this.reqHeader });
    }
    updateMaxPSFDays(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updaetMaxPSFDays', data, { headers: this.reqHeader });
    }
    updatePSFMethod(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updatePSFMethod', data, { headers: this.reqHeader });
    }
    assignPSFStaff(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'assignPSFStaff', data, { headers: this.reqHeader });
    }
    removePSFStaff(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'removePSFStaff', data, { headers: this.reqHeader });
    }
    lostCustomerUploadedList(): Observable<any> {
        return this.http.get(environment.base_url + 'UploadFileList', { headers: this.reqHeader });
    }
    uploadLostCustomerExcel(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Customer/LostCustomer/uploadExcel', data, { headers: this.fileHeader });
    }
    getLostCustomerListByFileId(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Customer/LostCustomer/LcListByFile', data, { headers: this.reqHeader });
    }
    assignLostCustomers(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Customer/LostCustomer/assignLostCustomer', data, { headers: this.reqHeader });
    }
    getQuotesList(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Quotes/Quotation/fetchAllQuote', data, { headers: this.reqHeader });
    }
    deleteQuotes(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Quotes/Quotation/delete', data, { headers: this.reqHeader });
    }
    getSplQuotesList(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Quotes/SplQuotation/getSplQuotesList', data, { headers: this.reqHeader });
    }
    commonQuoteDetails(): Observable<any> {
        return this.http.get(environment.base_url + 'commonQuoteDetails', { headers: this.reqHeader });
    }
    getQuoteDetailsById(data: any): Observable<any> {
        return this.http.get(environment.base_url + 'Quotes/Quotation/' + data, { headers: this.reqHeader });
    }
    updateNormalQuotes(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Quotes/Quotation/update', data, { headers: this.reqHeader });
    }
    getQuoteVersions(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getQuoteVersions', data, { headers: this.reqHeader });
    }
    createQuoteVersion(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'createQuoteVersion', data, { headers: this.reqHeader });
    }
    getQuoteVersionDetails(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getQuoteVersionDetails', data, { headers: this.reqHeader });
    }
    updateQuoteVersion(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateQuoteVersion', data, { headers: this.reqHeader });
    }
    getSpecialQuote(data: any): Observable<any> {
        return this.http.get(environment.base_url + 'Quotes/SplQuotation/' + data, { headers: this.reqHeader });
    }
    updateSplQuote(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Quotes/SplQuotation/update', data, { headers: this.reqHeader });
    }
    createSplQuotation(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Quotes/SplQuotation', data, { headers: this.reqHeader });
    }
    updateUserLoginLog(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'userlogs', data, { headers: this.reqHeader });
    }
    getPreloadDatas(): Observable<any> {
        return this.http.get(environment.base_url + 'getPreloadDatas', { headers: this.reqHeader });
    }
    fetchDetailsByPhoneNumber(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'callpopup/ViewDetail/viewDetailFromPopup', data, { headers: this.reqHeader });
    }
    getCampaignList(): Observable<any> {
        return this.http.get(environment.base_url + 'Quotes/Campaign', { headers: this.reqHeader });
    }
    updateLeadData(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Leads/Lead/popupleadupdate', data, { headers: this.reqHeader });
    }

    getJobCardsAgeData(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getJobCardsAgeData', data, { headers: this.reqHeader });
    }
    saveSubStatus(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'saveSubStatus', data, { headers: this.reqHeader });
    }

    getSubStatus(): Observable<any> {
        return this.http.get(environment.base_url + 'getSubStatus', { headers: this.reqHeader });
    }

    getWIPTaskStatus(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getWIPTaskStatus', data, { headers: this.reqHeader });
    }

    updateJobSubStatus(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateJobSubStatus', data, { headers: this.reqHeader });
    }

    getJobStusChangeHistory(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getJobStusChangeHistory', data, { headers: this.reqHeader });
    }

    getAllJobCardStatus(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getAllJobCardStatus', data, { headers: this.reqHeader });
    }

    getCallsData(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getCallsData', data, { headers: this.reqHeader });
    }

    getCustomerWithoutCallsData(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getCustomerWithoutCallsData', data, { headers: this.reqHeader });
    }

    getLatestCallReportByNumber(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getCDRReportByNumber', data, { headers: this.reqHeader });
    }
    getStaffInboundCallLog(data: any) {
        return this.http.post(environment.base_url + 'getLeadCallLog', data, { headers: this.reqHeader });
    }
    getCustomerInfo(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Customer/CustomerMaster/customerExist', data, { headers: this.reqHeader });
    }
    getCustomersInfoByNumberList(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getcustomerinfo', data, { headers: this.reqHeader });
    }
    getMissedCustomersInfoByNumberList(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getMissedCustomerInfo', data, { headers: this.reqHeader });
    }
    createNormalQuotation(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Quotes/Quotation', data, { headers: this.reqHeader });
    }
    getAppointmentList(data: any) {
        return this.http.post(environment.base_url + 'getAppointmentCalls', data, { headers: this.reqHeader });
    }
    getLatestJobCard(data: any) {
        return this.http.post(environment.base_url + 'getLatestJobCard', data, { headers: this.reqHeader });
    }
    getAppointmentDetails(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getAppointmentDetails', data, { headers: this.reqHeader });
    }

    updateAppointmentDetails(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateAppointmentDetails', data, { headers: this.reqHeader });
    }

    getLatestCallReportData(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getCDRReport', data, { headers: this.reqHeader });
    }

    getcustomerdata(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'InboundCall/InboundCallReportController/getcustomerdata', data, { headers: this.reqHeader });
    }

    getcustomerleads(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'InboundCall/InboundCallReportController/getcustomerleads', data, { headers: this.reqHeader });
    }
    getlaabscustomerdata(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'CustomerConversion/CustomerConversionReportController/getcustomerdatas', data, {
            headers: this.reqHeader,
        });
    }

    getexistingCustomer(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'CustomerConversion/CustomerConversionReportController/getexistingcustomer', data, {
            headers: this.reqHeader,
        });
    }

    gettargetsettingsdata(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'gettarget_details', data, { headers: this.reqHeader });
    }
    savetargetsettingsdata(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'TargetSettings/TargetSettingsController', data, { headers: this.reqHeader });
    }

    getUserAssignedLostCustomers(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getUserAssignedLostCustomers', data, { headers: this.reqHeader });
    }
    getQuoteDetails(): Observable<any> {
        return this.http.get(environment.base_url + 'getQuoteDetails', { headers: this.reqHeader });
    }
    getJobNumbers(): Observable<any> {
        return this.http.get(environment.base_url + 'getJobNumbers', { headers: this.reqHeader });
    }
    get3rdDayPsfCallData(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'get3rdDayPsfCallData', data, { headers: this.reqHeader });
    }
    get7thDayPsfCallData(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'get7thDayPsfCallData', data, { headers: this.reqHeader });
    }
    getLog(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Leads/Lead/getCallLog', data, { headers: this.reqHeader });
    }
    getLeadData(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'User/UserDetail/leadDetail', data, { headers: this.reqHeader });
    }
    LcAssignedDateList(): Observable<any> {
        return this.http.get(environment.base_url + 'LcAssignedDateList', { headers: this.reqHeader });
    }
    Getyeastarkeys(): Observable<any> {
        return this.http.get(environment.base_url + 'getyeastarconfigdatas', { headers: this.reqHeader });
    }
    AssignLostCustomerList(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Customer/LostCustomer/assigned_lc_list', data, { headers: this.reqHeader });
    }
    updateLCReport(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Customer/LostCustomer/updateLCReport', data, { headers: this.reqHeader });
    }
    CallInfo(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'callpopup/ViewDetail/CallInfo', data, { headers: this.reqHeader });
    }
    updateLostCustData(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Customer/LostCustomer/AddLcNote', data, { headers: this.reqHeader });
    }
    createAppointment(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Leads/Appointment', data, { headers: this.reqHeader });
    }
    createLeadData(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Leads/Lead', data, { headers: this.reqHeader });
    }

    updateWhatsappLead(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'whatsappLeadUpdate', data, { headers: this.reqHeader });
    }

    sendNewCustomerCampaignMessage(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'sendNewCustomerCampaignMessage', data, { headers: this.reqHeader });
    }

    sendNewCustomerMessage(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'sendNewCustomerMessage', data, { headers: this.reqHeader });
    }

    sendMessageWithMedia(data: FormData): Observable<any> {
        return this.http.post(environment.base_url + 'sendMessageWithMedia', data, { headers: this.fileHeader });
    }

    sendWhatsappDocument(data: FormData): Observable<any> {
        return this.http.post(environment.base_url + 'sendWhatsappDocument', data, { headers: this.fileHeader });
    }

    sendAppointmentMessage(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'sendAppointmentMessage', data, { headers: this.reqHeader });
    }

    sendMinorServiceMessage(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'sendMinorServiceMessage', data, { headers: this.reqHeader });
    }

    updateCustomerCategory(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateCustomerCategory', data, { headers: this.reqHeader });
    }

    blockContactFromWhatsapp(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'blockContactFromWhatsapp', data, { headers: this.reqHeader });
    }

    deleteCustomerMessage(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'deleteCustomerMessage', data, { headers: this.reqHeader });
    }

    LcReportList(): Observable<any> {
        return this.http.get(environment.base_url + 'assigned_list', { headers: this.reqHeader });
    }
    LostCustomerReport(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Customer/LostCustomer/LcAdminReport', data, { headers: this.reqHeader });
    }
    isExistingCustOrNot(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Leads/Appointment/isExistingCustOrNot', data, { headers: this.reqHeader });
    }
    createQuotation(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Leads/Lead/createQuotation', data, { headers: this.reqHeader });
    }
    getDashCounts(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getDashCounts', data, { headers: this.reqHeader });
    }
    getleadstocust(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getleadstocust', data, { headers: this.reqHeader });
    }
    getInboundCalldetails(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getCDRInboundByNumberlist', data, { headers: this.reqHeader });
    }
    getAllLeads(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getAllLeads', data, { headers: this.reqHeader });
    }
    getexistingCustomerlist(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'CustomerConversion/CustomerConversionReportController/getexistingcustomerdata', data, {
            headers: this.reqHeader,
        });
    }
    getPreviouscustomer(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'CustomerConversion/CustomerConversionReportController/getPreviouscustomer', data, {
            headers: this.reqHeader,
        });
    }
    getInboundCall(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getCDRInboundByNumberlistByMonth', data, { headers: this.reqHeader });
    }
    getInvoiceDetails(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getInvoiceDetails', data, { headers: this.reqHeader });
    }
    updatePartsMargin(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updatePartsMargin', data, { headers: this.reqHeader });
    }
    getHoliday_report(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getHoliday_report', data, { headers: this.reqHeader });
    }
    getMisscallDetails(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'User/CallAssignList/getMisscallDetails', data, { headers: this.reqHeader });
    }

    createSpareInvoice(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'createSpareInvoice', data, { headers: this.reqHeader });
    }

    getSpareInvoices(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getSpareInvoices', data, { headers: this.reqHeader });
    }

    getSpareInvoiceById(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getSpareInvoiceById', data, { headers: this.reqHeader });
    }
    getLeadSource(): Observable<any> {
        return this.http.get(environment.base_url + 'Leads/LeadSource', { headers: this.reqHeader });
    }

    getSparePartsMargin(): Observable<any> {
        return this.http.get(environment.base_url + 'getSparePartsMargin', { headers: this.reqHeader });
    }
    getAdminApprovalInvoices(): Observable<any> {
        return this.http.get(environment.base_url + 'getAdminApprovalInvoices', { headers: this.reqHeader });
    }

    saveSparePartsMargin(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'saveSparePartsMargin', data, { headers: this.reqHeader });
    }
    getCustomerJobcards(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getCustomerJobcards', data, { headers: this.reqHeader });
    }
    UpdateSpareInvoiceById(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'UpdateSpareInvoiceById', data, { headers: this.reqHeader });
    }
    createSupplierDetails(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'createSupplierDetails', data, { headers: this.reqHeader });
    }
    getSupplierDetails(): Observable<any> {
        return this.http.get(environment.base_url + 'getSupplierDetails', { headers: this.reqHeader });
    }
    updateSupplier(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateSupplierDetails', data, { headers: this.reqHeader });
    }
    deleteSupplier(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'deleteSupplier', data, { headers: this.reqHeader });
    }
    getSparePartsDesandPart(): Observable<any> {
        return this.http.get(environment.base_url + 'getSparePartsDesandPart', { headers: this.reqHeader });
    }
    getTotalInvoices(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getTotalInvoices', data, { headers: this.reqHeader });
    }
    updateSpareInvoice(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateSpareInvoice', data, { headers: this.reqHeader });
    }
    closeDissatisfiedcust(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'closeDissatisfiedcust', data, { headers: this.reqHeader });
    }
    getLeadsById(data: any): Observable<any> {
        return this.http.get(`${environment.base_url}Leads/Lead/${data}`, { headers: this.reqHeader });
    }
    getLeadActivityLog(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getLeadActivityLog', data, { headers: this.reqHeader });
    }
    leadUpdate(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'leadUpdate', data, { headers: this.reqHeader });
    }
    getMonthlyDissatisfied(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getMonthlyDissatisfied', data, { headers: this.reqHeader });
    }
    fetchAllLeads(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'fetchAllLeads', data, { headers: this.reqHeader });
    }
    getNMInvoiceList(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getNMInvoiceList', data, { headers: this.reqHeader });
    }
    getNMInvoicePostedList(): Observable<any> {
        return this.http.get(environment.base_url + 'getNMInvoicePostedList', { headers: this.reqHeader });
    }
    getAllPartsList(): Observable<any> {
        return this.http.get(environment.base_url + 'SpareParts/SparePartsController', { headers: this.reqHeader });
    }
    SavePartsDetails(data: any) {
        return this.http.post(environment.base_url + 'SpareParts/SparePartsController', data, { headers: this.reqHeader });
    }
    getAllLabourList(): Observable<any> {
        return this.http.get(environment.base_url + 'Labour/LabourController', { headers: this.reqHeader });
    }
    SaveLabourDetails(data: any) {
        return this.http.post(environment.base_url + 'Labour/LabourController', data, { headers: this.reqHeader });
    }
    getSpareCategory(): Observable<any> {
        return this.http.get(environment.base_url + 'getSpareCategory', { headers: this.reqHeader });
    }
    getEngineNo(): Observable<any> {
        return this.http.get(environment.base_url + 'Service/ServiceController', { headers: this.reqHeader });
    }
    getVinGroups(data: any) {
        return this.http.post(environment.base_url + 'getVinGroups', data, { headers: this.reqHeader });
    }
    getVehicleVariants(data: any) {
        return this.http.post(environment.base_url + 'getVehicleVariants', data, { headers: this.reqHeader });
    }
    saveServices(data: any) {
        return this.http.post(environment.base_url + 'saveServices', data, { headers: this.reqHeader });
    }
    getAllServices(): Observable<any> {
        return this.http.get(environment.base_url + 'getAllServices', { headers: this.reqHeader });
    }
    getServiceDetails(data: any) {
        return this.http.post(environment.base_url + 'getServiceDetails', data, { headers: this.reqHeader });
    }
    updateServices(data: any) {
        return this.http.post(environment.base_url + 'updateServices', data, { headers: this.reqHeader });
    }
    deleteService(data: any) {
        return this.http.post(environment.base_url + 'deleteService', data, { headers: this.reqHeader });
    }
    UpdateSpareParts(data: any) {
        return this.http.post(environment.base_url + 'SpareParts/SparePartsController/update', data, { headers: this.reqHeader });
    }
    deleteSpare(data: any) {
        return this.http.post(environment.base_url + 'SpareParts/SparePartsController/delete', data, { headers: this.reqHeader });
    }

    getAllJobCards(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getAllJobCards', data, { headers: this.reqHeader });
    }

    setQuotesTermsFlag(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'setQuotesTermsFlag', data, { headers: this.reqHeader });
    }

    getAppointmentReports(data: any) {
        return this.http.post(environment.base_url + 'getAppointmentReports', data, { headers: this.reqHeader });
    }
    Last7DaysAppointments(data: any) {
        return this.http.post(environment.base_url + 'Last7DaysAppointments', data, { headers: this.reqHeader });
    }

    fetchCustomerDetailswithNumber(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'get_Customer_details_for_modal', data, { headers: this.reqHeader });
    }
    // Psf module calls
    get_creDailyPSFCalls(): Observable<any> {
        return this.http.get(environment.base_url + 'get_creDailyPSFCalls', { headers: this.reqHeader });
    }
    get_crmDailyUserPSFCalls(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'get_crmDailyUserPSFCalls', data, { headers: this.reqHeader });
    }
    getPSFTodayCallsData(data: any) {
        return this.http.post(environment.base_url + 'getPSFTodayCallsData', data, { headers: this.reqHeader });
    }
    get_PSFresponseMaster(): Observable<any> {
        return this.http.get(environment.base_url + 'get_PSFresponseMaster', { headers: this.reqHeader });
    }
    get_PSFrecord_info(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'get_PSFrecord_info', data, { headers: this.reqHeader });
    }
    get_CREPSFrecord_info(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'get_CREPSFrecord_info', data, { headers: this.reqHeader });
    }
    saveCallResponse(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'PSFModule/PSFController', data, { headers: this.reqHeader });
    }
    getSpecialUsers(): Observable<any> {
        return this.http.get(environment.base_url + 'getSpecialUsers', { headers: this.reqHeader });
    }
    get_PSFreasonMaster(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'get_PSFreasonMaster', data, { headers: this.reqHeader });
    }

    get_CREQuestions(): Observable<any> {
        return this.http.get(environment.base_url + 'PSFModule/CREQuestionMasterController', { headers: this.reqHeader });
    }

    saveCRECallResponse(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'PSFModule/PSFController/update', data, { headers: this.reqHeader });
    }

    getPSFCallReportData(data: any) {
        return this.http.post(environment.base_url + 'get_psfReport', data, { headers: this.reqHeader });
    }

    getPSFCallSAReportData(data: any) {
        return this.http.post(environment.base_url + 'get_psfReportsa', data, { headers: this.reqHeader });
    }
    getPSFCallCREReportData(data: any) {
        return this.http.post(environment.base_url + 'get_psfReport_cre', data, { headers: this.reqHeader });
    }
    getPSFexpiredReportData(data: any) {
        return this.http.post(environment.base_url + 'get_expiredandissatisfied', data, { headers: this.reqHeader });
    }
    getPSFexpiredReportDataCre(data: any) {
        return this.http.post(environment.base_url + 'get_expiredandissatisfiedcre', data, { headers: this.reqHeader });
    }
    getPSFUserCallReportData(data: any) {
        return this.http.post(environment.base_url + 'get_userPsfReport', data, { headers: this.reqHeader });
    }
    getPSFUserCallsaReportData(data: any) {
        return this.http.post(environment.base_url + 'get_userPsfReportsa', data, { headers: this.reqHeader });
    }
    customerdatas(data: any) {
        return this.http.post(environment.base_url + 'customerdata', data, { headers: this.reqHeader });
    }
    getCallReports(data: any) {
        return this.http.post(environment.base_url + 'getCallReports', data, { headers: this.reqHeader });
    }

    getOutboundCalls(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getOutboundCalls', data, { headers: this.reqHeader });
    }

    getdisatisfiedcust(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getdisatisfiedcust', data, { headers: this.reqHeader });
    }
    getLeadQuote(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getLeadQuote', data, { headers: this.reqHeader });
    }
    quotesList(): Observable<any> {
        return this.http.get(environment.base_url + 'Quotes/Quotation', { headers: this.reqHeader });
    }
    getAppointment(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'leaadQuoteAppoint', data, { headers: this.reqHeader });
    }
    leadQuoteUpdate(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'leadQuoteUpdate', data, { headers: this.reqHeader });
    }
    getdissatisfiedcustbyid(data: any) {
        return this.http.post(environment.base_url + 'getdissatisfiedcustbyid', data, { headers: this.reqHeader });
    }
    disatisfiedUpdate(data: any) {
        return this.http.post(environment.base_url + 'disatisfiedUpdate', data, { headers: this.reqHeader });
    }
    getcallleadlog(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getcallleadlog', data, { headers: this.reqHeader });
    }
    getcustomerData(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'User/UserDetail/getCustomerDetail', data, { headers: this.reqHeader });
    }
    getcustomerdataanalysis(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getcustomerdataanalysis', data, { headers: this.reqHeader });
    }
    getQuotations(data: any) {
        return this.http.post(environment.base_url + 'getQuotations', data, { headers: this.reqHeader });
    }

    getPSFWhatsappReport(data: any) {
        return this.http.post(environment.base_url + 'getPSFWhatsappReport', data, { headers: this.reqHeader });
    }

    getWhatsappCustomers(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getWhatsappCustomers', data, { headers: this.reqHeader });
    }

    getWhatsappCustomerMessages(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getWhatsappCustomerMessages', data, { headers: this.reqHeader });
    }

    sendMessageToCustomer(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'sendMessageToCustomer', data, { headers: this.reqHeader });
    }

    deleteSparePartsMargin(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'deleteSparePartsMargin', data, { headers: this.reqHeader });
    }
    getSaRating(data: any) {
        return this.http.post(environment.base_url + 'getSaRating', data, { headers: this.reqHeader });
    }
    getCampaignEnquiry(data: any) {
        return this.http.post(environment.base_url + 'getCampaignEnquiry', data, { headers: this.reqHeader });
    }
    getLeadCampaignDetails(data: any) {
        return this.http.post(environment.base_url + 'getLeadCampaignDetails', data, { headers: this.reqHeader });
    }
    updateLeadCampEnq(data: any) {
        return this.http.post(environment.base_url + 'updateLeadCampEnq', data, { headers: this.reqHeader });
    }
    saveUserRoleMargin(data: any) {
        return this.http.post(environment.base_url + 'saveUserRoleMargin', data, { headers: this.reqHeader });
    }
    getUserRoleMargin(): Observable<any> {
        return this.http.get(environment.base_url + 'getUserRoleMargin', { headers: this.reqHeader });
    }
    getUserRoleMarginLimit(data: any) {
        return this.http.post(environment.base_url + 'getUserRoleMarginLimit', data, { headers: this.reqHeader });
    }
    deleteUserRoleMargin(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'deleteUserRoleMargin', data, { headers: this.reqHeader });
    }

    getStaffPerformance(data: any) {
        return this.http.post(environment.base_url + 'getStaffPerformance', data, { headers: this.reqHeader });
    }

    createSocialMediaCampaign(data: any) {
        return this.http.post(environment.base_url + 'SocialMediaCampaign/SocialMediaCampaignController', data, { headers: this.reqHeader });
    }

    socialMediaCampaignsource(): Observable<any> {
        return this.http.get(environment.base_url + 'socialMediaCampaignsource', { headers: this.reqHeader });
    }

    getSocialMediaCampaigns(data: any) {
        return this.http.post(environment.base_url + 'getSocialMediaCampaigns', data, { headers: this.reqHeader });
    }

    getSocialMediaCampaignDetails(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getSocialMediaCampaignDetails', data, { headers: this.reqHeader });
    }

    updateSocialMediaCampaignDetails(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'SocialMediaCampaign/SocialMediaCampaignController/update', data, { headers: this.reqHeader });
    }

    changeCampaignStatus(data: any) {
        return this.http.post(environment.base_url + 'changeCampaignStatus', data, { headers: this.reqHeader });
    }

    checkSocialMediaCampaign(data: any) {
        return this.http.post(environment.base_url + 'checkSocialMediaCampaign', data, { headers: this.reqHeader });
    }

    socialMediaCampaignDelete(data: any) {
        return this.http.post(environment.base_url + 'socialMediaCampaignDelete', data, { headers: this.reqHeader });
    }
    getActiveSocialMediaCampaigns(data: any) {
        return this.http.post(environment.base_url + 'getActiveSocialMediaCampaigns', data, { headers: this.reqHeader });
    }

    updateAppointmentRegNo(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateAppointmentRegNo', data, { headers: this.reqHeader });
    }
    fetchCampaignDetails(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'socialMediaCampaignDetailsFetch', data, { headers: this.reqHeader });
    }

    updateWhatsappLeadSource(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateWhatsappLeadSource', data, { headers: this.reqHeader });
    }

    getWhatsappLeadsList(data: any) {
        return this.http.post(environment.base_url + 'getWhatsappLeadsList', data, { headers: this.reqHeader });
    }
    getQuoteLogs(data: any) {
        return this.http.post(environment.base_url + 'getQuoteLogs', data, { headers: this.reqHeader });
    }

    forwardWhatsappMessage(data: any) {
        return this.http.post(environment.base_url + 'forwardWhatsappMessage', data, { headers: this.reqHeader });
    }

    replyMessageToCustomer(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'replyMessageToCustomer', data, { headers: this.reqHeader });
    }

    getWhatsappCustomersCounts(): Observable<any> {
        return this.http.get(environment.base_url + 'getWhatsappCustomersCounts', { headers: this.reqHeader });
    }

    getWhatsappCustomersByTime(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getWhatsappCustomersByTime', data, { headers: this.reqHeader });
    }

    getTemporaryLostWhatsappCustomers(): Observable<any> {
        return this.http.get(environment.base_url + 'getTemporaryLostWhatsappCustomers', { headers: this.reqHeader });
    }

    getWhatsappCustomerCategorize(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getWhatsappCustomerCategorize', data, { headers: this.reqHeader });
    }

    getWhatsappCustomerCategorizeCounts(): Observable<any> {
        return this.http.get(environment.base_url + 'getWhatsappCustomerCategorizeCounts', { headers: this.reqHeader });
    }

    sendLocationToCustomer(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'sendLocationToCustomer', data, { headers: this.reqHeader });
    }

    forwardLocationToCustomer(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'forwardLocationToCustomer', data, { headers: this.reqHeader });
    }

    forwardMessageWithMedia(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'forwardMessageWithMedia', data, { headers: this.fileHeader });
    }

    forwardMessageWithAudio(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'forwardMessageWithAudio', data, { headers: this.reqHeader });
    }

    getFollowUpAlertTime(): Observable<any> {
        return this.http.get(environment.base_url + 'getFollowUpAlertTime', { headers: this.reqHeader });
    }

    updateWhatsAppMessageExpiration(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateWhatsAppMessageExpiration', data, { headers: this.reqHeader });
    }

    addStaffToWhatsapp(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'addStaffToWhatsapp', data, { headers: this.reqHeader });
    }

    deleteWhatsappAssignedStaff(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'deleteWhatsappAssignedStaff', data, { headers: this.reqHeader });
    }

    getUnreadMessages(): Observable<any> {
        return this.http.get(environment.base_url + 'getUnreadMessages', { headers: this.reqHeader });
    }

    sendLocationMessage(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'sendLocationMessage', data, { headers: this.reqHeader });
    }

    sendAppointmentRemainderMessage(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'sendAppointmentRemainderMessage', data, { headers: this.reqHeader });
    }

    sendCustomerReEngMessage(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'sendCustomerReEngMessage', data, { headers: this.reqHeader });
    }

    whatsappMessageExpiredFollowupLogs(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'whatsappMessageExpiredFollowupLogs', data, { headers: this.reqHeader });
    }

    getWhatsappLeadReOpenHours(): Observable<any> {
        return this.http.get(environment.base_url + 'getWhatsappLeadReOpenHours', { headers: this.reqHeader });
    }

    updateWhatsappLeadReOpenHours(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateWhatsappLeadReOpenHours', data, { headers: this.reqHeader });
    }

    getCustomerAnalysisReport(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getCustomerAnalysisReport', data, { headers: this.reqHeader });
    }

    sendCampaignMessage(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'sendCampaignMessage', data, { headers: this.reqHeader });
    }

    sendNewCustomerCampaignNewMessage(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'sendNewCustomerCampaignNewMessage', data, { headers: this.reqHeader });
    }

    searchWhatsappCustomer(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'searchWhatsappCustomer', data, { headers: this.reqHeader });
    }

    getWhatsappCustomersFollowups(): Observable<any> {
        return this.http.get(environment.base_url + 'getWhatsappCustomersFollowups', { headers: this.reqHeader });
    }

    fetchAllFollowUpCustomers(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'fetchAllFollowUpCustomers', data, { headers: this.reqHeader });
    }

    getServiceRemainderDays(): Observable<any> {
        return this.http.get(environment.base_url + 'getServiceRemainderDays', { headers: this.reqHeader });
    }

    updateServiceRemainderDays(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateServiceRemainderDays', data, { headers: this.reqHeader });
    }

    getSRCReport(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getSRCReport', data, { headers: this.reqHeader });
    }

    getAppointmentCustomersFromSRC(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getAppointmentCustomersFromSRC', data, { headers: this.reqHeader });
    }

    updateWhatsappAutoMessageHours(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateWhatsappAutoMessageHours', data, { headers: this.reqHeader });
    }

    //Service package modules apis
    getServicePackage(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getServicePackage', data, { headers: this.reqHeader });
    }

    getServicePackageRequested(): Observable<any> {
        return this.http.get(environment.base_url + 'ServicePackage/ServicePackageController', { headers: this.reqHeader });
    }

    createServicePackage(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'ServicePackage/ServicePackageController', data, { headers: this.reqHeader });
    }

    getPartsForEngineNo(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getPartsForEngineNo', data, { headers: this.reqHeader });
    }
    getLabourPrice(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getLabourPrice', data, { headers: this.reqHeader });
    }

    saveServicePackageParts(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'ServicePackage/ServicePackageController/update', data, { headers: this.reqHeader });
    }

    getEngineAndSparesByModelCode(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getEngineAndSparesByModelCode', data, { headers: this.reqHeader });
    }

    saveServicePackageLabours(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'saveServicePackageLabours', data, { headers: this.reqHeader });
    }

    getESLByModelCode(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getESLByModelCode', data, { headers: this.reqHeader });
    }

    getSPkilometer(): Observable<any> {
        return this.http.get(environment.base_url + 'getSPkilometer', { headers: this.reqHeader });
    }

    saveSPKM(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'saveSPKM', data, { headers: this.reqHeader });
    }

    getModelCodes(): Observable<any> {
        return this.http.get(environment.base_url + 'getModelCodes', { headers: this.reqHeader });
    }

    setSPSessionLock(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'setSPSessionLock', data, { headers: this.reqHeader });
    }

    checkSPSessionLock(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'checkSPSessionLock', data, { headers: this.reqHeader });
    }

    // getAllEnginesList(): Observable<any> {
    //     return this.http.get(environment.base_url + 'getAllEnginesList', { headers: this.reqHeader });
    // }

    getAllPartsDetails(): Observable<any> {
        return this.http.get(environment.base_url + 'getAllPartsDetails', { headers: this.reqHeader });
    }

    checkPartPrice(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'checkPartPrice', data, { headers: this.reqHeader });
    }

    getServicePackageParts(): Observable<any> {
        return this.http.get(environment.base_url + 'getServicePackageParts', { headers: this.reqHeader });
    }

    createServicePackageParts(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'ServicePackage/ServicePackageItemsMaster', data, { headers: this.reqHeader });
    }

    getServicePackagePartsById(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getServicePackagePartsById', data, { headers: this.reqHeader });
    }

    updateServicePackagePartsById(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateServicePackagePartsById', data, { headers: this.reqHeader });
    }
    deleteServicePackagePartsById(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'deleteServicePackagePartsById', data, { headers: this.reqHeader });
    }

    getSPByKm(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getSPByKm', data, { headers: this.reqHeader });
    }

    saveServicePackageKmPriceMap(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'saveServicePackageKmPriceMap', data, { headers: this.reqHeader });
    }

    getModelCodeLabourRates(): Observable<any> {
        return this.http.get(environment.base_url + 'ServicePackage/ServicePackageMCLabour', { headers: this.reqHeader });
    }

    getDraftItems(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getDraftItems', data, { headers: this.reqHeader });
    }

    checkDuplicateOrdering(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'checkDuplicateOrdering', data, { headers: this.reqHeader });
    }

    getConsumablePrice(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getConsumablePrice', data, { headers: this.reqHeader });
    }

    increaseLabourRatesByFamilyCode(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'ServicePackage/ServicePackageMCLabour', data, { headers: this.reqHeader });
    }

    updateModelCodeDetails(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'ServicePackage/ServicePackageMCLabour/update', data, { headers: this.reqHeader });
    }

    createItemGroup(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'ServicePackage/ServicePackageController/createItemGroup', data, { headers: this.reqHeader });
    }

    CheckItemHasGroup(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'CheckItemHasGroup', data, { headers: this.reqHeader });
    }

    getSPItemsById(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getSPItemsById', data, { headers: this.reqHeader });
    }

    updateSPGroupById(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateSPGroupById', data, { headers: this.reqHeader });
    }

    checkDuplicateModelCode(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'checkDuplicateModelCode', data, { headers: this.reqHeader });
    }
    getServicePackageByVin(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getServicePackageByVin', data, { headers: this.reqHeader });
    }
    getSpareForEngineNo(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getSpareForEngineNo', data, { headers: this.reqHeader });
    }

    checkEngineHasSameSPItems(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'checkEngineHasSameSPItems', data, { headers: this.reqHeader });
    }
    getPricesForEngNo(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getPricesForEngNo', data, { headers: this.reqHeader });
    }

    getServicePackageItems(): Observable<any> {
        return this.http.get(environment.base_url + 'ServicePackage/ServicePackageItemsMaster', { headers: this.reqHeader });
    }
    returnToSupervisor(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'returnToSupervisor', data, { headers: this.reqHeader });
    }

    getServicePackageByModelCode(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getServicePackageByModelCode', data, { headers: this.reqHeader });
    }

    getServicePkgModelcodelist(): Observable<any> {
        return this.http.get(environment.base_url + 'getServicePkgModelcodelist', { headers: this.reqHeader });
    }

    createGroup(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'ServicePackage/ServicePackageController/createGroup', data, { headers: this.reqHeader });
    }

    getItemGroup(): Observable<any> {
        return this.http.get(environment.base_url + 'getItemGroup', { headers: this.reqHeader });
    }
    getGroupsByPmId(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getGroupsByPmId', data, { headers: this.reqHeader });
    }
    getItemsBySpimIds(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getItemsBySpimIds', data, { headers: this.reqHeader });
    }
    deleteGroup(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'deleteGroup', data, { headers: this.reqHeader });
    }

    getAllEnginesList(): Observable<any> {
        return this.http.get(environment.base_url + 'ServicePackage/EngineListController', { headers: this.reqHeader });
    }

    createEnginesList(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'ServicePackage/EngineListController', data, { headers: this.reqHeader });
    }

    updateEnginelist(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'ServicePackage/EngineListController/update', data, { headers: this.reqHeader });
    }

    deleteEnginelist(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'ServicePackage/EngineListController/delete', data, { headers: this.reqHeader });
    }

    servicePkgPartsList(): Observable<any> {
        return this.http.get(environment.base_url + 'servicePkgPartsList', { headers: this.reqHeader });
    }

    getRequestedPrices(): Observable<any> {
        return this.http.get(environment.base_url + 'getRequestedPrices', { headers: this.reqHeader });
    }

    acceptPrice(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'acceptPrice', data, { headers: this.reqHeader });
    }
    cancelPrice(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'cancelPrice', data, { headers: this.reqHeader });
    }

    getPartcodeprice(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getPartcodeprice', data, { headers: this.reqHeader });
    }
}
