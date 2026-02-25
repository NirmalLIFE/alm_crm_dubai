import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
    providedIn: 'root',
})
export class StaffPostAuthService {
    // reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + atob(atob(atob(localStorage.getItem('us_token') || '{}'))) });
    // fileHeader = new HttpHeaders({ Authorization: 'Bearer ' + atob(atob(atob(localStorage.getItem('us_token') || '{}'))) });
    constructor(private http: HttpClient) {}

    getReqHeader(): HttpHeaders {
        const token = localStorage.getItem('us_token');

        if (!token) {
            return new HttpHeaders({ 'Content-Type': 'application/json' });
        }

        try {
            const decoded = atob(atob(atob(token)));
            return new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + decoded,
            });
        } catch {
            return new HttpHeaders({ 'Content-Type': 'application/json' });
        }
    }

    getFileHeader(): HttpHeaders {
        const token = localStorage.getItem('us_token');

        if (!token) {
            return new HttpHeaders();
        }

        try {
            const decoded = atob(atob(atob(token)));
            return new HttpHeaders({
                Authorization: 'Bearer ' + decoded,
            });
        } catch {
            return new HttpHeaders();
        }
    }

    userLoginValidity(): Observable<any> {
        return this.http.get(environment.base_url + 'checkTokenExpiry', { headers: this.getReqHeader() });
    }

    GetYeaStarKeys(): Observable<any> {
        return this.http.get(environment.base_url + 'getyeastarconfigdatas', { headers: this.getReqHeader() });
    }
    checkNumber(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'CommonNumber/checkNumber', data, { headers: this.getReqHeader() });
    }
    userList(): Observable<any> {
        return this.http.get(environment.base_url + 'User/UserController', { headers: this.getReqHeader() });
    }

    getUserById(data: any): Observable<any> {
        return this.http.get(environment.base_url + 'User/UserController/' + data, { headers: this.getReqHeader() });
    }

    userRoleList(): Observable<any> {
        return this.http.get(environment.base_url + 'User/UserroleController', { headers: this.getReqHeader() });
    }

    updateUserData(data: any): Observable<any> {
        return this.http.put(environment.base_url + 'User/UserController/update', data, { headers: this.getReqHeader() });
    }

    createUser(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'User/UserController', data, { headers: this.getReqHeader() });
    }

    changeUserPassword(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'User/UserController/changeUserPassword', data, { headers: this.getReqHeader() });
    }

    userDelete(data: any): Observable<any> {
        return this.http.delete(environment.base_url + 'User/UserController/' + data, { headers: this.getReqHeader() });
    }

    changeUserStatus(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'User/UserController/changeuserstatus', data, { headers: this.getReqHeader() });
    }

    changeTrustedGroupStatus(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'User/UserController/changeTrustedGrpStatus', data, { headers: this.getReqHeader() });
    }

    getUserWorkingTime(data: any): Observable<any> {
        return this.http.get(environment.base_url + 'User/UserWorktime/' + data, { headers: this.getReqHeader() });
    }

    updateUserWorktime(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'User/UserWorktime/update', data, { headers: this.getReqHeader() });
    }

    getDeptList(): Observable<any> {
        return this.http.get(environment.base_url + 'getDept', { headers: this.getReqHeader() });
    }

    FeatureListByDept(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'TrunkList/FeatureListByDept', data, { headers: this.getReqHeader() });
    }

    getUseRoleById(data: any): Observable<any> {
        return this.http.get(environment.base_url + 'User/UserroleController/' + data, { headers: this.getReqHeader() });
    }

    getUserGroupList(): Observable<any> {
        return this.http.get(environment.base_url + 'User/UserGroupController', { headers: this.getReqHeader() });
    }

    updateUserRole(data: any): Observable<any> {
        return this.http.put(environment.base_url + 'User/UserroleController/update', data, { headers: this.getReqHeader() });
    }

    createUserRole(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'User/UserroleController', data, { headers: this.getReqHeader() });
    }

    userRoleDelete(data: any): Observable<any> {
        return this.http.delete(environment.base_url + 'User/UserroleController/' + data, { headers: this.getReqHeader() });
    }
    getCallPurposeList(): Observable<any> {
        return this.http.get(environment.base_url + 'Leads/CallPurpose', { headers: this.getReqHeader() });
    }

    updateCallPurpose(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Leads/CallPurpose/update', data, { headers: this.getReqHeader() });
    }
    createCallPurpose(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Leads/CallPurpose', data, { headers: this.getReqHeader() });
    }

    deleteCallPurpose(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Leads/CallPurpose/delete', data, { headers: this.getReqHeader() });
    }
    getDepartmentList(): Observable<any> {
        return this.http.get(environment.base_url + 'getDept', { headers: this.getReqHeader() });
    }

    deleteTrunkDepartment(data: any): Observable<any> {
        return this.http.delete(environment.base_url + 'TrunkList/' + data, { headers: this.getReqHeader() });
    }
    getDepartmentById(data: any): Observable<any> {
        return this.http.get(environment.base_url + 'TrunkList/' + data, { headers: this.getReqHeader() });
    }
    updateDepartment(data: any): Observable<any> {
        return this.http.put(environment.base_url + 'TrunkList/update', data, { headers: this.getReqHeader() });
    }

    getFeatureList(): Observable<any> {
        return this.http.get(environment.base_url + 'accessfeatures', { headers: this.getReqHeader() });
    }
    createDepartment(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'TrunkList', data, { headers: this.getReqHeader() });
    }
    getUserLog(): Observable<any> {
        return this.http.get(environment.base_url + 'UserLog', { headers: this.getReqHeader() });
    }
    getExcludedNumberList(): Observable<any> {
        return this.http.get(environment.base_url + 'CommonNumber', { headers: this.getReqHeader() });
    }
    addExtensionNumber(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'CommonNumber', data, { headers: this.getReqHeader() });
    }
    updateExNumberDetails(data: any): Observable<any> {
        return this.http.put(environment.base_url + 'CommonNumber/update', data, { headers: this.getReqHeader() });
    }
    deleteExcludedNumber(data: any): Observable<any> {
        return this.http.delete(environment.base_url + 'CommonNumber/' + data, { headers: this.getReqHeader() });
    }
    getBrandList(): Observable<any> {
        return this.http.get(environment.base_url + 'Quotes/Brand', { headers: this.getReqHeader() });
    }
    updateBrandDetails(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Quotes/Brand/update', data, { headers: this.getReqHeader() });
    }
    createNewBrand(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Quotes/Brand', data, { headers: this.getReqHeader() });
    }
    deleteBrandDetails(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Quotes/Brand/delete', data, { headers: this.getReqHeader() });
    }
    getCommonSettings(): Observable<any> {
        return this.http.get(environment.base_url + 'getCommonSettings', { headers: this.getReqHeader() });
    }
    getAlmInvoiceComman(): Observable<any> {
        return this.http.get(environment.base_url + 'getAlmInvoiceComman', { headers: this.getReqHeader() });
    }
    getCustomerVehicles(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getCustomerVehicles', data, { headers: this.getReqHeader() });
    }

    addVerificationNumber(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'addVerificationNumber', data, { headers: this.getReqHeader() });
    }
    changeLandlineIncludeStatus(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'changeLandlineStatus', data, { headers: this.getReqHeader() });
    }
    updateMissedCallBufferTime(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'addBufferTime', data, { headers: this.getReqHeader() });
    }
    updateWOrkshopTiming(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'addWorkingTime', data, { headers: this.getReqHeader() });
    }
    retrievePSFSettingsData(): Observable<any> {
        return this.http.get(environment.base_url + 'retrivePSFSettingsData', { headers: this.getReqHeader() });
    }
    updateMaxPSFDays(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updaetMaxPSFDays', data, { headers: this.getReqHeader() });
    }
    updatePSFMethod(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updatePSFMethod', data, { headers: this.getReqHeader() });
    }
    assignPSFStaff(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'assignPSFStaff', data, { headers: this.getReqHeader() });
    }
    removePSFStaff(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'removePSFStaff', data, { headers: this.getReqHeader() });
    }
    lostCustomerUploadedList(): Observable<any> {
        return this.http.get(environment.base_url + 'UploadFileList', { headers: this.getReqHeader() });
    }
    uploadLostCustomerExcel(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Customer/LostCustomer/uploadExcel', data, { headers: this.getFileHeader() });
    }
    getLostCustomerListByFileId(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Customer/LostCustomer/LcListByFile', data, { headers: this.getReqHeader() });
    }
    assignLostCustomers(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Customer/LostCustomer/assignLostCustomer', data, { headers: this.getReqHeader() });
    }
    getQuotesList(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Quotes/Quotation/fetchAllQuote', data, { headers: this.getReqHeader() });
    }
    deleteQuotes(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Quotes/Quotation/delete', data, { headers: this.getReqHeader() });
    }
    getSplQuotesList(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Quotes/SplQuotation/getSplQuotesList', data, { headers: this.getReqHeader() });
    }
    commonQuoteDetails(): Observable<any> {
        return this.http.get(environment.base_url + 'commonQuoteDetails', { headers: this.getReqHeader() });
    }
    getQuoteDetailsById(data: any): Observable<any> {
        return this.http.get(environment.base_url + 'Quotes/Quotation/' + data, { headers: this.getReqHeader() });
    }
    updateNormalQuotes(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Quotes/Quotation/update', data, { headers: this.getReqHeader() });
    }
    getQuoteVersions(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getQuoteVersions', data, { headers: this.getReqHeader() });
    }
    createQuoteVersion(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'createQuoteVersion', data, { headers: this.getReqHeader() });
    }
    getQuoteVersionDetails(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getQuoteVersionDetails', data, { headers: this.getReqHeader() });
    }
    updateQuoteVersion(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateQuoteVersion', data, { headers: this.getReqHeader() });
    }
    getSpecialQuote(data: any): Observable<any> {
        return this.http.get(environment.base_url + 'Quotes/SplQuotation/' + data, { headers: this.getReqHeader() });
    }
    updateSplQuote(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Quotes/SplQuotation/update', data, { headers: this.getReqHeader() });
    }
    createSplQuotation(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Quotes/SplQuotation', data, { headers: this.getReqHeader() });
    }
    updateUserLoginLog(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'userlogs', data, { headers: this.getReqHeader() });
    }
    getPreloadDatas(): Observable<any> {
        return this.http.get(environment.base_url + 'getPreloadDatas', { headers: this.getReqHeader() });
    }
    fetchDetailsByPhoneNumber(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'callpopup/ViewDetail/viewDetailFromPopup', data, { headers: this.getReqHeader() });
    }
    getCampaignList(): Observable<any> {
        return this.http.get(environment.base_url + 'Quotes/Campaign', { headers: this.getReqHeader() });
    }
    updateLeadData(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Leads/Lead/popupleadupdate', data, { headers: this.getReqHeader() });
    }

    getJobCardsAgeData(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getJobCardsAgeData', data, { headers: this.getReqHeader() });
    }
    saveSubStatus(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'saveSubStatus', data, { headers: this.getReqHeader() });
    }

    getSubStatus(): Observable<any> {
        return this.http.get(environment.base_url + 'getSubStatus', { headers: this.getReqHeader() });
    }

    getWIPTaskStatus(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getWIPTaskStatus', data, { headers: this.getReqHeader() });
    }

    updateJobSubStatus(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateJobSubStatus', data, { headers: this.getReqHeader() });
    }

    getJobStusChangeHistory(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getJobStusChangeHistory', data, { headers: this.getReqHeader() });
    }

    getAllJobCardStatus(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getAllJobCardStatus', data, { headers: this.getReqHeader() });
    }

    getCallsData(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getCallsData', data, { headers: this.getReqHeader() });
    }

    getCustomerWithoutCallsData(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getCustomerWithoutCallsData', data, { headers: this.getReqHeader() });
    }

    getLatestCallReportByNumber(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getCDRReportByNumber', data, { headers: this.getReqHeader() });
    }
    getStaffInboundCallLog(data: any) {
        return this.http.post(environment.base_url + 'getLeadCallLog', data, { headers: this.getReqHeader() });
    }
    getCustomerInfo(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Customer/CustomerMaster/customerExist', data, { headers: this.getReqHeader() });
    }
    getCustomersInfoByNumberList(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getcustomerinfo', data, { headers: this.getReqHeader() });
    }
    getMissedCustomersInfoByNumberList(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getMissedCustomerInfo', data, { headers: this.getReqHeader() });
    }
    createNormalQuotation(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Quotes/Quotation', data, { headers: this.getReqHeader() });
    }
    getAppointmentList(data: any) {
        return this.http.post(environment.base_url + 'getAppointmentCalls', data, { headers: this.getReqHeader() });
    }
    getLatestJobCard(data: any) {
        return this.http.post(environment.base_url + 'getLatestJobCard', data, { headers: this.getReqHeader() });
    }
    getAppointmentDetails(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getAppointmentDetails', data, { headers: this.getReqHeader() });
    }

    updateAppointmentDetails(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateAppointmentDetails', data, { headers: this.getReqHeader() });
    }

    getLatestCallReportData(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getCDRReport', data, { headers: this.getReqHeader() });
    }

    getcustomerdata(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'InboundCall/InboundCallReportController/getcustomerdata', data, { headers: this.getReqHeader() });
    }

    getcustomerleads(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'InboundCall/InboundCallReportController/getcustomerleads', data, { headers: this.getReqHeader() });
    }
    getlaabscustomerdata(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'CustomerConversion/CustomerConversionReportController/getcustomerdatas', data, {
            headers: this.getReqHeader(),
        });
    }

    getexistingCustomer(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'CustomerConversion/CustomerConversionReportController/getexistingcustomer', data, {
            headers: this.getReqHeader(),
        });
    }

    gettargetsettingsdata(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'gettarget_details', data, { headers: this.getReqHeader() });
    }
    savetargetsettingsdata(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'TargetSettings/TargetSettingsController', data, { headers: this.getReqHeader() });
    }

    getUserAssignedLostCustomers(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getUserAssignedLostCustomers', data, { headers: this.getReqHeader() });
    }
    getQuoteDetails(): Observable<any> {
        return this.http.get(environment.base_url + 'getQuoteDetails', { headers: this.getReqHeader() });
    }
    getJobNumbers(): Observable<any> {
        return this.http.get(environment.base_url + 'getJobNumbers', { headers: this.getReqHeader() });
    }
    get3rdDayPsfCallData(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'get3rdDayPsfCallData', data, { headers: this.getReqHeader() });
    }
    get7thDayPsfCallData(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'get7thDayPsfCallData', data, { headers: this.getReqHeader() });
    }
    getLog(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Leads/Lead/getCallLog', data, { headers: this.getReqHeader() });
    }
    getLeadData(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'User/UserDetail/leadDetail', data, { headers: this.getReqHeader() });
    }
    LcAssignedDateList(): Observable<any> {
        return this.http.get(environment.base_url + 'LcAssignedDateList', { headers: this.getReqHeader() });
    }
    Getyeastarkeys(): Observable<any> {
        return this.http.get(environment.base_url + 'getyeastarconfigdatas', { headers: this.getReqHeader() });
    }
    AssignLostCustomerList(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Customer/LostCustomer/assigned_lc_list', data, { headers: this.getReqHeader() });
    }
    updateLCReport(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Customer/LostCustomer/updateLCReport', data, { headers: this.getReqHeader() });
    }
    CallInfo(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'callpopup/ViewDetail/CallInfo', data, { headers: this.getReqHeader() });
    }
    updateLostCustData(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Customer/LostCustomer/AddLcNote', data, { headers: this.getReqHeader() });
    }
    createAppointment(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Leads/Appointment', data, { headers: this.getReqHeader() });
    }
    createLeadData(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Leads/Lead', data, { headers: this.getReqHeader() });
    }

    updateWhatsappLead(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'whatsappLeadUpdate', data, { headers: this.getReqHeader() });
    }

    sendNewCustomerCampaignMessage(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'sendNewCustomerCampaignMessage', data, { headers: this.getReqHeader() });
    }

    sendNewCustomerMessage(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'sendNewCustomerMessage', data, { headers: this.getReqHeader() });
    }

    sendMessageWithMedia(data: FormData): Observable<any> {
        return this.http.post(environment.base_url + 'sendMessageWithMedia', data, { headers: this.getFileHeader() });
    }

    sendWhatsappDocument(data: FormData): Observable<any> {
        return this.http.post(environment.base_url + 'sendWhatsappDocument', data, { headers: this.getFileHeader() });
    }

    sendAppointmentMessage(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'sendAppointmentMessage', data, { headers: this.getReqHeader() });
    }

    sendMinorServiceMessage(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'sendMinorServiceMessage', data, { headers: this.getReqHeader() });
    }

    updateCustomerCategory(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateCustomerCategory', data, { headers: this.getReqHeader() });
    }

    blockContactFromWhatsapp(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'blockContactFromWhatsapp', data, { headers: this.getReqHeader() });
    }

    deleteCustomerMessage(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'deleteCustomerMessage', data, { headers: this.getReqHeader() });
    }

    LcReportList(): Observable<any> {
        return this.http.get(environment.base_url + 'assigned_list', { headers: this.getReqHeader() });
    }
    LostCustomerReport(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Customer/LostCustomer/LcAdminReport', data, { headers: this.getReqHeader() });
    }
    isExistingCustOrNot(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Leads/Appointment/isExistingCustOrNot', data, { headers: this.getReqHeader() });
    }
    createQuotation(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'Leads/Lead/createQuotation', data, { headers: this.getReqHeader() });
    }
    getDashCounts(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getDashCounts', data, { headers: this.getReqHeader() });
    }
    getleadstocust(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getleadstocust', data, { headers: this.getReqHeader() });
    }
    getInboundCalldetails(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getCDRInboundByNumberlist', data, { headers: this.getReqHeader() });
    }
    getAllLeads(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getAllLeads', data, { headers: this.getReqHeader() });
    }
    getexistingCustomerlist(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'CustomerConversion/CustomerConversionReportController/getexistingcustomerdata', data, {
            headers: this.getReqHeader(),
        });
    }
    getPreviouscustomer(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'CustomerConversion/CustomerConversionReportController/getPreviouscustomer', data, {
            headers: this.getReqHeader(),
        });
    }
    getInboundCall(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getCDRInboundByNumberlistByMonth', data, { headers: this.getReqHeader() });
    }
    getInvoiceDetails(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getInvoiceDetails', data, { headers: this.getReqHeader() });
    }
    updatePartsMargin(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updatePartsMargin', data, { headers: this.getReqHeader() });
    }
    getHoliday_report(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getHoliday_report', data, { headers: this.getReqHeader() });
    }
    getMisscallDetails(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'User/CallAssignList/getMisscallDetails', data, { headers: this.getReqHeader() });
    }

    createSpareInvoice(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'createSpareInvoice', data, { headers: this.getReqHeader() });
    }

    getSpareInvoices(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getSpareInvoices', data, { headers: this.getReqHeader() });
    }

    getSpareInvoiceById(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getSpareInvoiceById', data, { headers: this.getReqHeader() });
    }
    getLeadSource(): Observable<any> {
        return this.http.get(environment.base_url + 'Leads/LeadSource', { headers: this.getReqHeader() });
    }

    getSparePartsMargin(): Observable<any> {
        return this.http.get(environment.base_url + 'getSparePartsMargin', { headers: this.getReqHeader() });
    }
    getAdminApprovalInvoices(): Observable<any> {
        return this.http.get(environment.base_url + 'getAdminApprovalInvoices', { headers: this.getReqHeader() });
    }

    saveSparePartsMargin(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'saveSparePartsMargin', data, { headers: this.getReqHeader() });
    }
    getCustomerJobcards(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getCustomerJobcards', data, { headers: this.getReqHeader() });
    }
    UpdateSpareInvoiceById(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'UpdateSpareInvoiceById', data, { headers: this.getReqHeader() });
    }
    createSupplierDetails(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'createSupplierDetails', data, { headers: this.getReqHeader() });
    }
    getSupplierDetails(): Observable<any> {
        return this.http.get(environment.base_url + 'getSupplierDetails', { headers: this.getReqHeader() });
    }
    updateSupplier(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateSupplierDetails', data, { headers: this.getReqHeader() });
    }
    deleteSupplier(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'deleteSupplier', data, { headers: this.getReqHeader() });
    }
    getSparePartsDesandPart(): Observable<any> {
        return this.http.get(environment.base_url + 'getSparePartsDesandPart', { headers: this.getReqHeader() });
    }
    getTotalInvoices(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getTotalInvoices', data, { headers: this.getReqHeader() });
    }
    updateSpareInvoice(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateSpareInvoice', data, { headers: this.getReqHeader() });
    }
    closeDissatisfiedcust(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'closeDissatisfiedcust', data, { headers: this.getReqHeader() });
    }
    getLeadsById(data: any): Observable<any> {
        return this.http.get(`${environment.base_url}Leads/Lead/${data}`, { headers: this.getReqHeader() });
    }
    getLeadActivityLog(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getLeadActivityLog', data, { headers: this.getReqHeader() });
    }
    leadUpdate(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'leadUpdate', data, { headers: this.getReqHeader() });
    }
    getMonthlyDissatisfied(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getMonthlyDissatisfied', data, { headers: this.getReqHeader() });
    }
    fetchAllLeads(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'fetchAllLeads', data, { headers: this.getReqHeader() });
    }
    getNMInvoiceList(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getNMInvoiceList', data, { headers: this.getReqHeader() });
    }
    getNMInvoicePostedList(): Observable<any> {
        return this.http.get(environment.base_url + 'getNMInvoicePostedList', { headers: this.getReqHeader() });
    }
    getAllPartsList(): Observable<any> {
        return this.http.get(environment.base_url + 'SpareParts/SparePartsController', { headers: this.getReqHeader() });
    }
    SavePartsDetails(data: any) {
        return this.http.post(environment.base_url + 'SpareParts/SparePartsController', data, { headers: this.getReqHeader() });
    }
    getAllLabourList(): Observable<any> {
        return this.http.get(environment.base_url + 'Labour/LabourController', { headers: this.getReqHeader() });
    }
    SaveLabourDetails(data: any) {
        return this.http.post(environment.base_url + 'Labour/LabourController', data, { headers: this.getReqHeader() });
    }
    getSpareCategory(): Observable<any> {
        return this.http.get(environment.base_url + 'getSpareCategory', { headers: this.getReqHeader() });
    }
    getEngineNo(): Observable<any> {
        return this.http.get(environment.base_url + 'Service/ServiceController', { headers: this.getReqHeader() });
    }
    getVinGroups(data: any) {
        return this.http.post(environment.base_url + 'getVinGroups', data, { headers: this.getReqHeader() });
    }
    getVehicleVariants(data: any) {
        return this.http.post(environment.base_url + 'getVehicleVariants', data, { headers: this.getReqHeader() });
    }
    saveServices(data: any) {
        return this.http.post(environment.base_url + 'saveServices', data, { headers: this.getReqHeader() });
    }
    getAllServices(): Observable<any> {
        return this.http.get(environment.base_url + 'getAllServices', { headers: this.getReqHeader() });
    }
    getServiceDetails(data: any) {
        return this.http.post(environment.base_url + 'getServiceDetails', data, { headers: this.getReqHeader() });
    }
    updateServices(data: any) {
        return this.http.post(environment.base_url + 'updateServices', data, { headers: this.getReqHeader() });
    }
    deleteService(data: any) {
        return this.http.post(environment.base_url + 'deleteService', data, { headers: this.getReqHeader() });
    }
    UpdateSpareParts(data: any) {
        return this.http.post(environment.base_url + 'SpareParts/SparePartsController/update', data, { headers: this.getReqHeader() });
    }
    deleteSpare(data: any) {
        return this.http.post(environment.base_url + 'SpareParts/SparePartsController/delete', data, { headers: this.getReqHeader() });
    }

    getAllJobCards(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getAllJobCards', data, { headers: this.getReqHeader() });
    }

    setQuotesTermsFlag(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'setQuotesTermsFlag', data, { headers: this.getReqHeader() });
    }

    getAppointmentReports(data: any) {
        return this.http.post(environment.base_url + 'getAppointmentReports', data, { headers: this.getReqHeader() });
    }
    Last7DaysAppointments(data: any) {
        return this.http.post(environment.base_url + 'Last7DaysAppointments', data, { headers: this.getReqHeader() });
    }

    fetchCustomerDetailswithNumber(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'get_Customer_details_for_modal', data, { headers: this.getReqHeader() });
    }
    // Psf module calls
    get_creDailyPSFCalls(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'get_creDailyPSFCalls', data, { headers: this.getReqHeader() });
    }
    get_crmDailyUserPSFCalls(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'get_crmDailyUserPSFCalls', data, { headers: this.getReqHeader() });
    }
    getPSFTodayCallsData(data: any) {
        return this.http.post(environment.base_url + 'getPSFTodayCallsData', data, { headers: this.getReqHeader() });
    }
    get_PSFresponseMaster(): Observable<any> {
        return this.http.get(environment.base_url + 'get_PSFresponseMaster', { headers: this.getReqHeader() });
    }
    get_PSFrecord_info(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'get_PSFrecord_info', data, { headers: this.getReqHeader() });
    }
    get_CREPSFrecord_info(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'get_CREPSFrecord_info', data, { headers: this.getReqHeader() });
    }
    saveCallResponse(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'PSFModule/PSFController', data, { headers: this.getReqHeader() });
    }
    getSpecialUsers(): Observable<any> {
        return this.http.get(environment.base_url + 'getSpecialUsers', { headers: this.getReqHeader() });
    }
    get_PSFreasonMaster(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'get_PSFreasonMaster', data, { headers: this.getReqHeader() });
    }

    get_CREQuestions(): Observable<any> {
        return this.http.get(environment.base_url + 'PSFModule/CREQuestionMasterController', { headers: this.getReqHeader() });
    }

    saveCRECallResponse(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'PSFModule/PSFController/update', data, { headers: this.getReqHeader() });
    }

    getPSFCallReportData(data: any) {
        return this.http.post(environment.base_url + 'get_psfReport', data, { headers: this.getReqHeader() });
    }

    getPSFCallSAReportData(data: any) {
        return this.http.post(environment.base_url + 'get_psfReportsa', data, { headers: this.getReqHeader() });
    }
    getPSFCallCREReportData(data: any) {
        return this.http.post(environment.base_url + 'get_psfReport_cre', data, { headers: this.getReqHeader() });
    }
    getPSFexpiredReportData(data: any) {
        return this.http.post(environment.base_url + 'get_expiredandissatisfied', data, { headers: this.getReqHeader() });
    }
    getPSFexpiredReportDataCre(data: any) {
        return this.http.post(environment.base_url + 'get_expiredandissatisfiedcre', data, { headers: this.getReqHeader() });
    }
    getPSFUserCallReportData(data: any) {
        return this.http.post(environment.base_url + 'get_userPsfReport', data, { headers: this.getReqHeader() });
    }
    getPSFUserCallsaReportData(data: any) {
        return this.http.post(environment.base_url + 'get_userPsfReportsa', data, { headers: this.getReqHeader() });
    }
    customerdatas(data: any) {
        return this.http.post(environment.base_url + 'customerdata', data, { headers: this.getReqHeader() });
    }
    getCallReports(data: any) {
        return this.http.post(environment.base_url + 'getCallReports', data, { headers: this.getReqHeader() });
    }

    getOutboundCalls(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getOutboundCalls', data, { headers: this.getReqHeader() });
    }

    getdisatisfiedcust(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getdisatisfiedcust', data, { headers: this.getReqHeader() });
    }
    getLeadQuote(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getLeadQuote', data, { headers: this.getReqHeader() });
    }
    quotesList(): Observable<any> {
        return this.http.get(environment.base_url + 'Quotes/Quotation', { headers: this.getReqHeader() });
    }
    getAppointment(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'leaadQuoteAppoint', data, { headers: this.getReqHeader() });
    }
    leadQuoteUpdate(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'leadQuoteUpdate', data, { headers: this.getReqHeader() });
    }
    getdissatisfiedcustbyid(data: any) {
        return this.http.post(environment.base_url + 'getdissatisfiedcustbyid', data, { headers: this.getReqHeader() });
    }
    disatisfiedUpdate(data: any) {
        return this.http.post(environment.base_url + 'disatisfiedUpdate', data, { headers: this.getReqHeader() });
    }
    getcallleadlog(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getcallleadlog', data, { headers: this.getReqHeader() });
    }
    getcustomerData(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'User/UserDetail/getCustomerDetail', data, { headers: this.getReqHeader() });
    }
    getcustomerdataanalysis(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getcustomerdataanalysis', data, { headers: this.getReqHeader() });
    }
    getQuotations(data: any) {
        return this.http.post(environment.base_url + 'getQuotations', data, { headers: this.getReqHeader() });
    }

    getPSFWhatsappReport(data: any) {
        return this.http.post(environment.base_url + 'getPSFWhatsappReport', data, { headers: this.getReqHeader() });
    }

    getWhatsappCustomers(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getWhatsappCustomers', data, { headers: this.getReqHeader() });
    }

    getWhatsappCustomerMessages(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getWhatsappCustomerMessages', data, { headers: this.getReqHeader() });
    }

    sendMessageToCustomer(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'sendMessageToCustomer', data, { headers: this.getReqHeader() });
    }

    deleteSparePartsMargin(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'deleteSparePartsMargin', data, { headers: this.getReqHeader() });
    }
    getSaRating(data: any) {
        return this.http.post(environment.base_url + 'getSaRating', data, { headers: this.getReqHeader() });
    }
    getCampaignEnquiry(data: any) {
        return this.http.post(environment.base_url + 'getCampaignEnquiry', data, { headers: this.getReqHeader() });
    }
    getLeadCampaignDetails(data: any) {
        return this.http.post(environment.base_url + 'getLeadCampaignDetails', data, { headers: this.getReqHeader() });
    }
    updateLeadCampEnq(data: any) {
        return this.http.post(environment.base_url + 'updateLeadCampEnq', data, { headers: this.getReqHeader() });
    }
    saveUserRoleMargin(data: any) {
        return this.http.post(environment.base_url + 'saveUserRoleMargin', data, { headers: this.getReqHeader() });
    }
    getUserRoleMargin(): Observable<any> {
        return this.http.get(environment.base_url + 'getUserRoleMargin', { headers: this.getReqHeader() });
    }
    getUserRoleMarginLimit(data: any) {
        return this.http.post(environment.base_url + 'getUserRoleMarginLimit', data, { headers: this.getReqHeader() });
    }
    deleteUserRoleMargin(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'deleteUserRoleMargin', data, { headers: this.getReqHeader() });
    }

    getStaffPerformance(data: any) {
        return this.http.post(environment.base_url + 'getStaffPerformance', data, { headers: this.getReqHeader() });
    }

    createSocialMediaCampaign(data: any) {
        return this.http.post(environment.base_url + 'SocialMediaCampaign/SocialMediaCampaignController', data, { headers: this.getReqHeader() });
    }

    socialMediaCampaignsource(): Observable<any> {
        return this.http.get(environment.base_url + 'socialMediaCampaignsource', { headers: this.getReqHeader() });
    }

    getSocialMediaCampaigns(data: any) {
        return this.http.post(environment.base_url + 'getSocialMediaCampaigns', data, { headers: this.getReqHeader() });
    }

    getSocialMediaCampaignDetails(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getSocialMediaCampaignDetails', data, { headers: this.getReqHeader() });
    }

    updateSocialMediaCampaignDetails(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'SocialMediaCampaign/SocialMediaCampaignController/update', data, { headers: this.getReqHeader() });
    }

    changeCampaignStatus(data: any) {
        return this.http.post(environment.base_url + 'changeCampaignStatus', data, { headers: this.getReqHeader() });
    }

    checkSocialMediaCampaign(data: any) {
        return this.http.post(environment.base_url + 'checkSocialMediaCampaign', data, { headers: this.getReqHeader() });
    }

    socialMediaCampaignDelete(data: any) {
        return this.http.post(environment.base_url + 'socialMediaCampaignDelete', data, { headers: this.getReqHeader() });
    }
    getActiveSocialMediaCampaigns(data: any) {
        return this.http.post(environment.base_url + 'getActiveSocialMediaCampaigns', data, { headers: this.getReqHeader() });
    }

    updateAppointmentRegNo(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateAppointmentRegNo', data, { headers: this.getReqHeader() });
    }
    fetchCampaignDetails(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'socialMediaCampaignDetailsFetch', data, { headers: this.getReqHeader() });
    }

    updateWhatsappLeadSource(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateWhatsappLeadSource', data, { headers: this.getReqHeader() });
    }

    getWhatsappLeadsList(data: any) {
        return this.http.post(environment.base_url + 'getWhatsappLeadsList', data, { headers: this.getReqHeader() });
    }
    getQuoteLogs(data: any) {
        return this.http.post(environment.base_url + 'getQuoteLogs', data, { headers: this.getReqHeader() });
    }

    forwardWhatsappMessage(data: any) {
        return this.http.post(environment.base_url + 'forwardWhatsappMessage', data, { headers: this.getReqHeader() });
    }

    replyMessageToCustomer(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'replyMessageToCustomer', data, { headers: this.getReqHeader() });
    }

    getWhatsappCustomersCounts(): Observable<any> {
        return this.http.get(environment.base_url + 'getWhatsappCustomersCounts', { headers: this.getReqHeader() });
    }

    getWhatsappCustomersByTime(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getWhatsappCustomersByTime', data, { headers: this.getReqHeader() });
    }

    getTemporaryLostWhatsappCustomers(): Observable<any> {
        return this.http.get(environment.base_url + 'getTemporaryLostWhatsappCustomers', { headers: this.getReqHeader() });
    }

    getWhatsappCustomerCategorize(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getWhatsappCustomerCategorize', data, { headers: this.getReqHeader() });
    }

    getWhatsappCustomerCategorizeCounts(): Observable<any> {
        return this.http.get(environment.base_url + 'getWhatsappCustomerCategorizeCounts', { headers: this.getReqHeader() });
    }

    sendLocationToCustomer(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'sendLocationToCustomer', data, { headers: this.getReqHeader() });
    }

    forwardLocationToCustomer(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'forwardLocationToCustomer', data, { headers: this.getReqHeader() });
    }

    forwardMessageWithMedia(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'forwardMessageWithMedia', data, { headers: this.getFileHeader() });
    }

    forwardMessageWithAudio(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'forwardMessageWithAudio', data, { headers: this.getReqHeader() });
    }

    getFollowUpAlertTime(): Observable<any> {
        return this.http.get(environment.base_url + 'getFollowUpAlertTime', { headers: this.getReqHeader() });
    }

    updateWhatsAppMessageExpiration(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateWhatsAppMessageExpiration', data, { headers: this.getReqHeader() });
    }

    addStaffToWhatsapp(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'addStaffToWhatsapp', data, { headers: this.getReqHeader() });
    }

    deleteWhatsappAssignedStaff(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'deleteWhatsappAssignedStaff', data, { headers: this.getReqHeader() });
    }

    getUnreadMessages(): Observable<any> {
        return this.http.get(environment.base_url + 'getUnreadMessages', { headers: this.getReqHeader() });
    }

    sendLocationMessage(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'sendLocationMessage', data, { headers: this.getReqHeader() });
    }

    sendAppointmentRemainderMessage(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'sendAppointmentRemainderMessage', data, { headers: this.getReqHeader() });
    }

    sendCustomerReEngMessage(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'sendCustomerReEngMessage', data, { headers: this.getReqHeader() });
    }

    whatsappMessageExpiredFollowupLogs(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'whatsappMessageExpiredFollowupLogs', data, { headers: this.getReqHeader() });
    }

    getWhatsappLeadReOpenHours(): Observable<any> {
        return this.http.get(environment.base_url + 'getWhatsappLeadReOpenHours', { headers: this.getReqHeader() });
    }

    updateWhatsappLeadReOpenHours(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateWhatsappLeadReOpenHours', data, { headers: this.getReqHeader() });
    }

    getCustomerAnalysisReport(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getCustomerAnalysisReport', data, { headers: this.getReqHeader() });
    }

    sendCampaignMessage(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'sendCampaignMessage', data, { headers: this.getReqHeader() });
    }

    sendNewCustomerCampaignNewMessage(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'sendNewCustomerCampaignNewMessage', data, { headers: this.getReqHeader() });
    }

    searchWhatsappCustomer(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'searchWhatsappCustomer', data, { headers: this.getReqHeader() });
    }

    getWhatsappCustomersFollowups(): Observable<any> {
        return this.http.get(environment.base_url + 'getWhatsappCustomersFollowups', { headers: this.getReqHeader() });
    }

    updateSocialMediaCampaignBudget(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateSocialMediaCampaignBudget', data, { headers: this.getReqHeader() });
    }

    getLeadsList(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getLeadsList', data, { headers: this.getReqHeader() });
    }

    sendBroadcastWhatsappCampaignMessage(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'sendBroadcastWhatsappCampaignMessage', data, { headers: this.getReqHeader() });
    }

    getCustomerReEngageCampaigns(): Observable<any> {
        return this.http.get(environment.base_url + 'Customer/CustomerReEngageCampaignController', { headers: this.getReqHeader() });
    }

    getCustomerReEngageCampaignReport(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getCustomerReEngageCampaignReport', data, { headers: this.getReqHeader() });
    }

    getServiceRemainderDays(): Observable<any> {
        return this.http.get(environment.base_url + 'getServiceRemainderDays', { headers: this.getReqHeader() });
    }

    updateServiceRemainderDays(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateServiceRemainderDays', data, { headers: this.getReqHeader() });
    }

    searchWhatsappCustomersByPhoneNumbers(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'searchWhatsappCustomersByPhoneNumbers', data, { headers: this.getReqHeader() });
    }

    sendServiceRemainderCampaignMessages(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'sendServiceRemainderCampaignMessages', data, { headers: this.getReqHeader() });
    }

    getSRCReport(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getSRCReport', data, { headers: this.getReqHeader() });
    }

    getAppointmentCustomersFromSRC(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getAppointmentCustomersFromSRC', data, { headers: this.getReqHeader() });
    }

    fetchAllFollowUpCustomers(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'fetchAllFollowUpCustomers', data, { headers: this.getReqHeader() });
    }

    getCampaignCustomerJobcards(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getCampaignCustomerJobcards', data, { headers: this.getReqHeader() });
    }

    fetchAllNewCustomers(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'fetchAllNewCustomers', data, { headers: this.getReqHeader() });
    }

    getQuoteDetailsByIdView(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getQuoteDetailsByIdView', data, { headers: this.getReqHeader() });
    }

    fetchAllLeadsByPhone(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'fetchAllLeadsByPhone', data, { headers: this.getReqHeader() });
    }

    updateWhatsappAutoMessageHours(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateWhatsappAutoMessageHours', data, { headers: this.getReqHeader() });
    }

    fetchAllNewCustomerLeads(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'fetchAllNewCustomerLeads', data, { headers: this.getReqHeader() });
    }

    getPurposeNotselected(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getPurposeNot', data, { headers: this.getReqHeader() });
    }
    updateLeadVerificationFlag(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateLeadVerificationFlag', data, { headers: this.getReqHeader() });
    }

    updateLeadCategory(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateLeadCategory', data, { headers: this.getReqHeader() });
    }

    getLeadCategoryCount(): Observable<any> {
        return this.http.get(environment.base_url + 'getLeadCategoryCount', { headers: this.getReqHeader() });
    }

    getCategoryCust(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getCategoryCust', data, { headers: this.getReqHeader() });
    }

    getLeadCategoryCustomers(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getLeadCategoryCustomers', data, { headers: this.getReqHeader() });
    }

    getServicePackage(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getServicePackage', data, { headers: this.getReqHeader() });
    }

    getServicePackageRequested(): Observable<any> {
        return this.http.get(environment.base_url + 'ServicePackage/ServicePackageController', { headers: this.getReqHeader() });
    }

    createServicePackage(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'ServicePackage/ServicePackageController', data, { headers: this.getReqHeader() });
    }

    getPartsForEngineNo(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getPartsForEngineNo', data, { headers: this.getReqHeader() });
    }
    getLabourPrice(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getLabourPrice', data, { headers: this.getReqHeader() });
    }

    saveServicePackageParts(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'ServicePackage/ServicePackageController/update', data, { headers: this.getReqHeader() });
    }

    getEngineAndSparesByModelCode(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getEngineAndSparesByModelCode', data, { headers: this.getReqHeader() });
    }

    saveServicePackageLabours(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'saveServicePackageLabours', data, { headers: this.getReqHeader() });
    }

    getESLByModelCode(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getESLByModelCode', data, { headers: this.getReqHeader() });
    }

    getSPkilometer(): Observable<any> {
        return this.http.get(environment.base_url + 'getSPkilometer', { headers: this.getReqHeader() });
    }

    saveSPKM(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'saveSPKM', data, { headers: this.getReqHeader() });
    }

    getModelCodes(): Observable<any> {
        return this.http.get(environment.base_url + 'getModelCodes', { headers: this.getReqHeader() });
    }

    setSPSessionLock(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'setSPSessionLock', data, { headers: this.getReqHeader() });
    }

    checkSPSessionLock(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'checkSPSessionLock', data, { headers: this.getReqHeader() });
    }

    // getAllEnginesList(): Observable<any> {
    //     return this.http.get(environment.base_url + 'getAllEnginesList', { headers: this.getReqHeader() });
    // }

    getAllPartsDetails(): Observable<any> {
        return this.http.get(environment.base_url + 'getAllPartsDetails', { headers: this.getReqHeader() });
    }

    checkPartPrice(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'checkPartPrice', data, { headers: this.getReqHeader() });
    }

    getServicePackageParts(): Observable<any> {
        return this.http.get(environment.base_url + 'getServicePackageParts', { headers: this.getReqHeader() });
    }

    createServicePackageParts(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'ServicePackage/ServicePackageItemsMaster', data, { headers: this.getReqHeader() });
    }

    getServicePackagePartsById(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getServicePackagePartsById', data, { headers: this.getReqHeader() });
    }

    updateServicePackagePartsById(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateServicePackagePartsById', data, { headers: this.getReqHeader() });
    }
    deleteServicePackagePartsById(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'deleteServicePackagePartsById', data, { headers: this.getReqHeader() });
    }

    getSPByKm(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getSPByKm', data, { headers: this.getReqHeader() });
    }

    saveServicePackageKmPriceMap(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'saveServicePackageKmPriceMap', data, { headers: this.getReqHeader() });
    }

    getModelCodeLabourRates(): Observable<any> {
        return this.http.get(environment.base_url + 'ServicePackage/ServicePackageMCLabour', { headers: this.getReqHeader() });
    }

    getDraftItems(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getDraftItems', data, { headers: this.getReqHeader() });
    }

    checkDuplicateOrdering(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'checkDuplicateOrdering', data, { headers: this.getReqHeader() });
    }

    getConsumablePrice(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getConsumablePrice', data, { headers: this.getReqHeader() });
    }

    increaseLabourRatesByFamilyCode(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'ServicePackage/ServicePackageMCLabour', data, { headers: this.getReqHeader() });
    }

    updateModelCodeDetails(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'ServicePackage/ServicePackageMCLabour/update', data, { headers: this.getReqHeader() });
    }

    createItemGroup(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'ServicePackage/ServicePackageController/createItemGroup', data, { headers: this.getReqHeader() });
    }

    CheckItemHasGroup(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'CheckItemHasGroup', data, { headers: this.getReqHeader() });
    }

    getSPItemsById(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getSPItemsById', data, { headers: this.getReqHeader() });
    }

    updateSPGroupById(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateSPGroupById', data, { headers: this.getReqHeader() });
    }

    checkDuplicateModelCode(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'checkDuplicateModelCode', data, { headers: this.getReqHeader() });
    }
    getServicePackageByVin(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getServicePackageByVin', data, { headers: this.getReqHeader() });
    }
    getSpareForEngineNo(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getSpareForEngineNo', data, { headers: this.getReqHeader() });
    }

    checkEngineHasSameSPItems(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'checkEngineHasSameSPItems', data, { headers: this.getReqHeader() });
    }
    getPricesForEngNo(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getPricesForEngNo', data, { headers: this.getReqHeader() });
    }

    getServicePackageItems(): Observable<any> {
        return this.http.get(environment.base_url + 'ServicePackage/ServicePackageItemsMaster', { headers: this.getReqHeader() });
    }
    returnToSupervisor(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'returnToSupervisor', data, { headers: this.getReqHeader() });
    }

    getServicePackageByModelCode(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getServicePackageByModelCode', data, { headers: this.getReqHeader() });
    }

    getServicePkgModelcodelist(): Observable<any> {
        return this.http.get(environment.base_url + 'getServicePkgModelcodelist', { headers: this.getReqHeader() });
    }

    createGroup(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'ServicePackage/ServicePackageController/createGroup', data, { headers: this.getReqHeader() });
    }

    getItemGroup(): Observable<any> {
        return this.http.get(environment.base_url + 'getItemGroup', { headers: this.getReqHeader() });
    }
    getGroupsByPmId(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getGroupsByPmId', data, { headers: this.getReqHeader() });
    }
    getItemsBySpimIds(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getItemsBySpimIds', data, { headers: this.getReqHeader() });
    }
    deleteGroup(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'deleteGroup', data, { headers: this.getReqHeader() });
    }

    getAllEnginesList(): Observable<any> {
        return this.http.get(environment.base_url + 'ServicePackage/EngineListController', { headers: this.getReqHeader() });
    }

    createEnginesList(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'ServicePackage/EngineListController', data, { headers: this.getReqHeader() });
    }

    updateEnginelist(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'ServicePackage/EngineListController/update', data, { headers: this.getReqHeader() });
    }

    deleteEnginelist(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'ServicePackage/EngineListController/delete', data, { headers: this.getReqHeader() });
    }

    servicePkgPartsList(): Observable<any> {
        return this.http.get(environment.base_url + 'servicePkgPartsList', { headers: this.getReqHeader() });
    }

    getRequestedPrices(): Observable<any> {
        return this.http.get(environment.base_url + 'getRequestedPrices', { headers: this.getReqHeader() });
    }

    acceptPrice(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'acceptPrice', data, { headers: this.getReqHeader() });
    }
    cancelPrice(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'cancelPrice', data, { headers: this.getReqHeader() });
    }

    getPartcodeprice(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getPartcodeprice', data, { headers: this.getReqHeader() });
    }
    getLogsByModelCode(modelCodeId: string): Observable<any> {
        return this.http.post(environment.base_url + 'getLogsByModelCode', { spmc_id: modelCodeId }, { headers: this.getReqHeader() });
    }

    deleteServicePackageModelCode(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'deleteServicePackageModelCode', data, { headers: this.getReqHeader() });
    }

    getNewSRCReport(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getNewSRCReport', data, { headers: this.getReqHeader() });
    }

    getRetentionCustomers(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getRetentionCustomers', data, { headers: this.getReqHeader() });
    }
    removeSpmcLock(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'removeSpmcLock', data, { headers: this.getReqHeader() });
    }
    getIpList(): Observable<any> {
        return this.http.get(environment.base_url + 'permittedIP', { headers: this.getReqHeader() });
    }
    createIPAddress(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'permittedIP', data, { headers: this.getReqHeader() });
    }
    updateIPAddress(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'PermittedIP/update', data, { headers: this.getReqHeader() });
    }
    deleteIPAddress(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'deleteIPAddress', data, { headers: this.getReqHeader() });
    }

    updateWorkshopDays(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateWorkshopDays', data, { headers: this.getReqHeader() });
    }

    getWorksdaysTiming(): Observable<any> {
        return this.http.get(environment.base_url + 'getWorksdaysTiming', { headers: this.getReqHeader() });
    }

    saveOffDays(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'saveOffDays', data, { headers: this.getReqHeader() });
    }

    getOffDays(): Observable<any> {
        return this.http.get(environment.base_url + 'getOffDays', { headers: this.getReqHeader() });
    }

    saveAwayMessage(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'saveAwayMessage', data, { headers: this.getReqHeader() });
    }

    getAwayMessage(): Observable<any> {
        return this.http.get(environment.base_url + 'getAwayMessage', { headers: this.getReqHeader() });
    }

    updateModelCodeFromLaabs(): Observable<any> {
        return this.http.get(environment.base_url + 'updateModelCodeFromLaabs', { headers: this.getReqHeader() });
    }
    getServicePackageByRegNo(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getServicePackageByRegNo', data, { headers: this.getReqHeader() });
    }
    getCustomerRegNo(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getCustomerRegNo', data, { headers: this.getReqHeader() });
    }

    testMessageSend(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'testMessageSend', data, { headers: this.getReqHeader() });
    }

    updateModelCodeFacelift(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateModelCodeFacelift', data, { headers: this.getReqHeader() });
    }

    getServiceContractTiers(): Observable<any> {
        return this.http.get(environment.base_url + 'ServiceContract/ServiceContractController', { headers: this.getReqHeader() });
    }

    getVehicleDetailsByVinNo(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getVehicleDetailsByVinNo', data, { headers: this.getReqHeader() });
    }

    checkVehicleServiceContract(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'checkVehicleServiceContract', data, { headers: this.getReqHeader() });
    }

    deleteServiceContractCustomers(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'deleteServiceContractCustomers', data, { headers: this.getReqHeader() });
    }

    createServiceContract(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'ServiceContract/ServiceContractController', data, { headers: this.getReqHeader() });
    }

    getServiceContractCustomers(): Observable<any> {
        return this.http.get(environment.base_url + 'getServiceContractCustomers', { headers: this.getReqHeader() });
    }

    updateContractTierDetails(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateContractTierDetails', data, { headers: this.getReqHeader() });
    }

    createServiceContractTier(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'createServiceContractTier', data, { headers: this.getReqHeader() });
    }

    deleteServiceContractTier(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'deleteServiceContractTier', data, { headers: this.getReqHeader() });
    }

    getPartsLog(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getPartsLog', data, { headers: this.getReqHeader() });
    }

    getPartsPriceDetails(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'getPartsPriceDetails', data, { headers: this.getReqHeader() });
    }

    updateSelectedPrices(data: any): Observable<any> {
        return this.http.post(environment.base_url + 'updateSelectedPrices', data, { headers: this.getReqHeader() });
    }

    getPendingPriceRequestCount(): Observable<any> {
        return this.http.get(environment.base_url + 'getPendingPriceRequestCount', { headers: this.getReqHeader() });
    }
}
