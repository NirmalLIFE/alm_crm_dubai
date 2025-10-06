import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';
import { StaffPostAuthService } from 'src/app/service/staff-post-auth.service';
import { Server, Socket } from 'socket.io';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable, filter } from 'rxjs';
import Swal from 'sweetalert2';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { log } from 'console';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'app-whatsapp-chat',
    templateUrl: './whatsapp-chat.component.html',
    styleUrls: ['./whatsapp-chat.component.css'],
    animations: [
        trigger('toggleAnimation', [
            transition(':enter', [style({ opacity: 0, transform: 'scale(0.95)' }), animate('100ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))]),
            transition(':leave', [animate('75ms', style({ opacity: 0, transform: 'scale(0.95)' }))]),
        ]),
    ],
})
export class WhatsappChatComponent implements OnInit {
    @ViewChild('leadCreateModal') leadCreateModal: any;
    @ViewChild('newchat') newchatModal: any;
    @ViewChild('mediaModal') mediaModal: any;
    @ViewChild('imageModal') imageModal: any;
    @ViewChild('locationmodal') locationmodal: any;
    @ViewChild('appointment') appointmentModal: any;
    @ViewChild('labelmodal') labelmodal: any;
    @ViewChild('forward') forwardModal: any;
    @ViewChild('appointmentRemainder') appointmentRemainderModal: any;

    storeData: any;
    socket = io(environment.SOCKET_ENDPOINT);
    messages: any[] = [];
    public message$: BehaviorSubject<string> = new BehaviorSubject('');
    searchText: any;
    unreadmsgs = 0;
    showButtons: boolean = false;
    normalMessage: boolean = true;
    campaignMessage: boolean = false;

    //by Akhil
    currentUser: any = {
        wb_cus_id: 0,
        wb_cus_name: '',
        wb_cus_mobile: '',
        wb_cus_profile_pic: '',
        lead_id: 0,
        lead_code: '',
        lead_status: '',
        lead_details: null,
        wb_cus_category: 0,
        lead_category: 0,
    };
    allCustomersList: any[] = [];
    allCustomersListMaster: any[] = [];
    isShowUserChat = false;
    isShowChatMenu = false;
    searchUser = '';
    textMessage = '';
    currentUserMessages: any[] = [];
    newCustomers: any[] = [];
    selectedFollowUp: any = 'zero';
    followUpTimeExceededCustomers: any[] = [];
    @ViewChild('scrollable') scrollable!: NgScrollbar;
    @ViewChild('customersScrollable', { static: true }) customersScrollable!: NgScrollbar;
    zoom = 16;
    unreadCount: number = 0;

    newChatCustomer: any = {
        country_code: '971',
        mobile_number: '',
        message: '',
        customer_name: '',
    };
    isMessage: boolean = false;
    previewImage: any = '';
    audio = new Audio('assets/message_tone.mp3');
    selectedMedia: any = {
        media: null,
        type: 0,
        name: '',
        media_upload: '',
        message: '',
        timeExceed: false,
    };
    height: number = 40; // Initial height of textarea
    maxHeight: number = 150; // Maximum height of textarea
    set = 'twitter';
    showEmojiPicker = false;
    @Input() visible = false;
    position = { x: 0, y: 0 };

    appointmentData: any = {
        date: null,
        timeFrom: '',
        // timeTo: '',
        cust_id: '',
        cust_mobile: '',
    };
    appointmentRemainderData: any = {
        date: null,
        time: '',
        cust_id: '',
        cust_mobile: '',
    };
    chatCounts: any = {
        allCust: 0,
        potentialCust: 0,
        activeCust: 0,
        appointmentCust: 0,
        quotationCust: 0,
        irrelaventCust: 0,
        purposeNotCust: 0,
    };
    // isContextMenuVisible = false;
    contextMenuPosition = { x: 0, y: 0 };
    menu: any;
    selectedCustomers: any[] = [];
    // selectedCustomersId: any = [];
    forwardMessage: any;
    replyId: any = 0;
    replyMessage: any;
    msgId: any;
    potentialList: any = {
        awaiting30m: 0,
        awaiting1h: 0,
        awaiting3h: 0,
        awaiting6h: 0,
        awiating1d: 0,
        awaiting3d: 0,
        awaitingTempLost: 0,
    };
    limit: any;
    offset: any;
    hasMoredata: boolean | undefined;
    isLoading: boolean = false;
    selectedFilter: any = 0;
    isFollowUpSelected: boolean = false;
    fullcustomersLimit: any[] = [];
    // unreadMessagesFlag: boolean = false;
    numbers: any[] = [];

    //Purpost Not Selected Customers
    offsets: any = 0;
    limits: any = 10;

    public uiFilter: any = null; // 8, 9, or 10
    public apiFilter: any = null; // 1, 2, or 3

    onscroll = (ev: Event) => {
        if (
            (this.selectedFilter !== 0 && this.selectedFilter !== 7 && this.selectedFilter !== 8 && this.selectedFilter !== 10 && this.selectedFilter !== 9) ||
            this.isFollowUpSelected ||
            this.numbers.length > 0
        ) {
            return;
        }
        // Handle scroll event
        const element = ev.target as HTMLElement;
        //scrollheight=total height of the scrollable content,  scrolltop =0, clientHeight = viewport height
        const atBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 10;

        if (atBottom && !this.isLoading && (this.selectedFilter == 8 || this.selectedFilter == 9 || this.selectedFilter == 10)) {
            // console.log('filters>>>>>>uiFilter >>>>>>>>selectedFilter>>>>>>', this.uiFilter, this.selectedFilter);
            this.getCategoryCust(this.uiFilter, this.selectedFilter);
        }

        if (atBottom && !this.isLoading && this.selectedFilter == 0) {
            this.updateUsersChat();
        }

        if (atBottom && !this.isLoading && this.selectedFilter == 7 && (this.uiFilter != 8 || this.uiFilter != 9 || this.uiFilter != 10)) {
            this.getPurposeNotCust(7, 'seven');
        }
    };
    refreshFlag: boolean = false;
    followUpCounts: any = {
        firstFollowUp: [],
        secondFollowUp: [],
        thirdFollowUp: [],
        fourthFollowUp: [],
        fifthFollowUp: [],
        pendingReply: [],
        tempLost: [],
    };
    forwardType: any;
    inboundFollowUpTimes: any;
    outboundFollowUpTimes: any;
    searchTextChanged = new Subject<string>();

    leadOptions = [
        { value: '2', label: '🔥 Hot Lead', color: '#dc3545' }, // Red
        { value: '1', label: '🌤️ Warm Lead', color: '#ffc107' }, // Yellow
        { value: '0', label: '❄️ Cold Lead', color: '#17a2b8' }, // Blue
    ];

    LeadCategoryCounts: any = {
        hot: 0,
        warm: 0,
        cool: 0,
        notspecified: 0,
    };
    public user_role: any = atob(atob(localStorage.getItem('us_role_id') || '{}'));
    getFilter: any = 0;
    constructor(
        private userServices: StaffPostAuthService,
        public router: Router,
        private http: HttpClient,
        private datePipe: DatePipe,
        private activeRouter: ActivatedRoute
    ) {
        this.messages = [];
        this.limit = 20;
        this.offset = 0;

        //COMMENTED WHEN USING LEAD CATEGORY, HOT, WARM, COLD..
        this.userServices.getFollowUpAlertTime().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.inboundFollowUpTimes = rdata.followUpTimes.filter((msg: any) => msg.wb_msg_fut_type === '0');
                this.outboundFollowUpTimes = rdata.followUpTimes.filter((msg: any) => msg.wb_msg_fut_type === '1');

                // console.log('inbound follow up times >>>>>>>>>>>>>>>', this.inboundFollowUpTimes);
            }
        });

        this.getUnreadMessages(0);
    }

    ngOnInit(): void {
        this.isLoading = false;
        const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];

        if (navigationEntries.length > 0 && navigationEntries[0].type === 'reload') {
        }
        const storedNumbers = sessionStorage.getItem('chatNumbers');
        if (storedNumbers) {
            this.numbers = JSON.parse(storedNumbers);
            this.searchWhatsappCustomersByPhoneNumbers();
        } else {
            this.updateUsersChat();
            this.getNewMessage().subscribe((message: any) => {});
            this.getNewInActiveMessage().subscribe((message: any) => {});
            this.socket.emit('create_room', {
                room_id: 'crm_dxb_users',
                user: atob(atob(localStorage.getItem('us_id') || '{}')),
            });
        }

        this.searchTextChanged
            .pipe(
                debounceTime(1000), // Adjust this value to delay the API call (500ms is ideal)
                distinctUntilChanged()
            )
            .subscribe(() => {
                this.searchCustomers();
            });

        // this.activeRouter.queryParams.subscribe((params) => {
        //     if (params['numbers']) {
        //         this.numbers = JSON.parse(decodeURIComponent(params['numbers']));
        //         console.log('Entered in Whatsapp with numbers:', this.numbers);
        //         this.searchWhatsappCustomersByPhoneNumbers();
        //     } else {
        // this.updateUsersChat();
        // this.getNewMessage().subscribe((message: any) => {});
        // this.getNewInActiveMessage().subscribe((message: any) => {});
        // this.socket.emit('create_room', {
        //     room_id: 'crm_dxb_users',
        //     user: atob(atob(localStorage.getItem('us_id') || '{}')),
        // });
        //     }
        // });
    }

    ngAfterViewInit() {
        this.customersScrollable.scrolled.subscribe((event) => this.onscroll(event));
        // this.getFollowUpCustomers();  //--commented for follow up
        this.leadCategoryCount();
    }

    // ngOnInit(): void {
    //     // this.hasMoredata = true;
    //     this.isLoading = false;
    //     this.updateUsersChat();
    //     this.getNewMessage().subscribe((message: any) => {});
    //     this.getNewInActiveMessage().subscribe((message: any) => {});
    //     this.socket.emit('create_room', {
    //         room_id: 'crm_dxb_users',
    //         user: atob(atob(localStorage.getItem('us_id') || '{}')),
    //     });

    //     this.activeRouter.queryParams.subscribe((params) => {
    //         this.numbers = params['numbers'] ? JSON.parse(params['numbers']) : [];
    //         console.log('entered in  Whatsapp', this.numbers); // Array of numbers
    //         this.searchWhatsappCustomersByPhoneNumbers();
    //     });
    // }
    // ngAfterViewInit() {
    //     // Subscribe to the 'scrolled' observable
    //     this.customersScrollable.scrolled.subscribe((event) => this.onscroll(event));
    //     this.getFollowUpCustomers();
    // }

    leadCategoryCount() {
        this.userServices.getLeadCategoryCount().subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                this.LeadCategoryCounts = {
                    hot: rdata.data?.hot ?? 0,
                    warm: rdata.data?.warm ?? 0,
                    cool: rdata.data?.cool ?? 0,
                    notspecified: 0,
                };
            }
        });
    }

    getCategoryCust(type: number, num: any) {
        this.selectedFollowUp = '';
        if (this.isLoading) return;

        this.selectedFilter = num;
        const wasFilter = this.uiFilter;
        this.uiFilter = type;

        if (wasFilter !== this.selectedFilter || this.hasMoredata === undefined) {
            this.offsets = 0;
            this.hasMoredata = true;
            this.allCustomersList = [];
        }

        if (!this.hasMoredata) {
            return;
        }

        this.isLoading = true;

        const typeConversion: Record<number, number> = {
            8: 2,
            9: 1,
            10: 0,
        };

        const catData = {
            type: typeConversion[type] ?? type,
            limit: this.limits,
            offset: this.offsets,
        };

        this.userServices.getLeadCategoryCustomers(catData).subscribe((rdata: any) => {
            if (rdata.ret_data == 'success') {
                const fetched = rdata.wb_customers || [];
                if (this.offsets == 0) {
                    this.allCustomersList = fetched;
                } else {
                    this.allCustomersList = [...this.allCustomersList, ...fetched];
                }
                this.hasMoredata = fetched.length >= this.limits;
                if (this.hasMoredata) {
                    this.offsets += this.limits;
                }
                this.isLoading = false;
            }
        });
    }

    getFollowUpCustomers() {
        this.followUpCounts = {
            firstFollowUp: [],
            secondFollowUp: [],
            thirdFollowUp: [],
            fourthFollowUp: [],
            fifthFollowUp: [],
            pendingReply: [],
            tempLost: [],
        };

        this.userServices.getWhatsappCustomersFollowups().subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                // this.fullcustomersLimit = rdata.followupCustomers;
                let temp = Array.isArray(rdata.followupCustomers) ? rdata.followupCustomers : Object.values(rdata.followupCustomers);

                this.followUpTimeExceededCustomers = [];
                const uniqueCustomers = new Map<string, any>();
                const todayDateOnly = new Date(new Date().setHours(0, 0, 0, 0));
                temp.forEach((element: any) => {
                    element.forEach((element2: any) => {
                        if (element2.alm_wb_msg_created_on) {
                            const msgDateOnly = new Date(new Date(element2.alm_wb_msg_created_on).setHours(0, 0, 0, 0));
                            const diffInDays = (todayDateOnly.getTime() - msgDateOnly.getTime()) / (1000 * 3600 * 24);

                            element2['time'] =
                                diffInDays === 0
                                    ? this.datePipe.transform(element2.alm_wb_msg_created_on, 'h:mm a') || ''
                                    : diffInDays === 1
                                    ? 'Yesterday'
                                    : this.datePipe.transform(element2.alm_wb_msg_created_on, 'dd/MM/yy') || '';
                            element2.followUpTimeExceeded = this.checkTimeConditions(element2.wb_cus_follow_up, element2.wb_cus_follow_up_time);

                            if (element2.followUpTimeExceeded) {
                                this.followUpTimeExceededCustomers.push({
                                    wb_cus_id: element2.wb_cus_id,
                                    alm_wb_msg_id: element2.alm_wb_msg_id,
                                    name: element2.wb_cus_name,
                                    alm_wb_msg_staff_id: element2.alm_wb_msg_staff_id,
                                });
                            }
                        }

                        if (element2.alm_wb_msg_status == 2 && element2.alm_wb_msg_source == 1) {
                            element2.message_status_2_count = 1;
                        }

                        if (!uniqueCustomers.has(element2.wb_cus_id)) {
                            switch (element2.wb_cus_follow_up) {
                                case '1':
                                    this.followUpCounts.firstFollowUp.push(element2);
                                    this.followUpCounts.firstFollowUp.sort(
                                        (a: any, b: any) => new Date(b.alm_wb_msg_created_on).getTime() - new Date(a.alm_wb_msg_created_on).getTime()
                                    );
                                    break;
                                case '2':
                                    this.followUpCounts.secondFollowUp.push(element2);
                                    this.followUpCounts.secondFollowUp.sort(
                                        (a: any, b: any) => new Date(b.alm_wb_msg_created_on).getTime() - new Date(a.alm_wb_msg_created_on).getTime()
                                    );
                                    break;
                                case '3':
                                    this.followUpCounts.thirdFollowUp.push(element2);
                                    this.followUpCounts.thirdFollowUp.sort(
                                        (a: any, b: any) => new Date(b.alm_wb_msg_created_on).getTime() - new Date(a.alm_wb_msg_created_on).getTime()
                                    );
                                    break;
                                case '4':
                                    this.followUpCounts.fourthFollowUp.push(element2);
                                    this.followUpCounts.fourthFollowUp.sort(
                                        (a: any, b: any) => new Date(b.alm_wb_msg_created_on).getTime() - new Date(a.alm_wb_msg_created_on).getTime()
                                    );
                                    break;
                                case '5':
                                    this.followUpCounts.fifthFollowUp.push(element2);
                                    this.followUpCounts.fifthFollowUp.sort(
                                        (a: any, b: any) => new Date(b.alm_wb_msg_created_on).getTime() - new Date(a.alm_wb_msg_created_on).getTime()
                                    );
                                    break;
                                case '6':
                                    this.followUpCounts.pendingReply.push(element2);
                                    this.followUpCounts.pendingReply.sort(
                                        (a: any, b: any) => new Date(b.alm_wb_msg_created_on).getTime() - new Date(a.alm_wb_msg_created_on).getTime()
                                    );
                                    break;
                                case '7':
                                    this.followUpCounts.tempLost.push(element2);
                                    this.followUpCounts.tempLost.sort(
                                        (a: any, b: any) => new Date(b.alm_wb_msg_created_on).getTime() - new Date(a.alm_wb_msg_created_on).getTime()
                                    );
                                    break;
                            }
                            uniqueCustomers.set(element2.wb_cus_id, element2);
                        }
                    });
                });
            }
        });
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

    store: any;
    async initStore() {
        this.storeData
            .select((d: any) => d.index)
            .subscribe((d: any) => {
                this.store = d;
            });
    }

    searchUsers() {}

    selectUser(user: any) {
        this.socket.on('disconnect', () => {});
        this.isShowUserChat = true;
        this.isShowChatMenu = false;
        this.currentUser = user;
        this.currentUserMessages = [];
        this.userServices.getWhatsappCustomerMessages({ customerId: btoa(btoa(user.wb_cus_id)) }).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.currentUserMessages = rdata.wb_customer_messages;
                this.currentUser.lead_code = rdata.wb_lead_details.lead_id ? rdata.wb_lead_details.lead_code : 0;
                this.currentUser.lead_id = rdata.wb_lead_details.lead_id ? rdata.wb_lead_details.lead_id : 0;
                this.currentUser.lead_status = rdata.wb_lead_details.lead_id ? rdata.wb_lead_details.status_id : 0;
                this.currentUser.lead_details = rdata.wb_lead_details.lead_id ? rdata.wb_lead_details : null;
                this.currentUser.lead_category = rdata.wb_lead_details.lead_id ? rdata.wb_lead_details.lead_category : 0;

                // this.socket.emit('create_room', {
                //     room_id: 'crm_' + user.wb_cus_mobile,
                //     user: user.wb_cus_name,
                // });

                this.scrollToBottom();
            } else {
                this.coloredToast('danger', "Can't fetch whatsapp messages");
            }
        });
    }
    refresh() {
        if (this.isLoading) {
            return;
        }
        this.numbers = [];
        this.limit = 20;
        this.offset = 0;
        this.refreshFlag = true;
        this.selectedFollowUp = 'zero';
        this.allCustomersList = [];
        this.allCustomersListMaster = [];
        this.isShowUserChat = false;
        this.updateUsersChat();
        this.getUnreadMessages(0);
        // this.getFollowUpCustomers();
        window.scrollTo(0, 0);
    }

    // updateUsersChat() {
    //     if (this.isLoading) return;
    //     this.isLoading = true;
    //     this.unreadCount = 0;
    //     // this.allCustomersList= [];

    //     this.chatCounts = {
    //         allCust: 0,
    //     };
    //     if (this.hasMoredata === undefined) {
    //         this.hasMoredata = true;
    //     }
    //     console.log('offset and limit>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', this.offset, this.limit);
    //     let data = {
    //         limit: this.limit,
    //         offset: this.offset,
    //     };
    //     //vv ends
    //     if (this.hasMoredata) {
    //         console.log('data', this.hasMoredata);

    //         this.userServices.getWhatsappCustomers(data).subscribe((rdata: any) => {
    //             if (rdata.ret_data === 'success') {
    //                 this.followUpCounts = {
    //                     firstFollowUp: [],
    //                     secondFollowUp: [],
    //                     thirdFollowUp: [],
    //                     fourthFollowUp: [],
    //                     fifthFollowUp: [],
    //                     pendingReply: [],
    //                     tempLost: [],
    //                 };
    //                 this.newCustomers = rdata.wb_customers;
    //                 // this.allCustomersList = rdata.wb_customers;
    //                 if (this.refreshFlag) {
    //                     this.allCustomersList = [];
    //                     this.allCustomersList = this.newCustomers;
    //                     this.allCustomersListMaster = rdata.wb_customers;
    //                     this.refreshFlag = false;
    //                 } else if (this.limit == 20 && this.offset == 0) {
    //                     this.allCustomersList = [];
    //                     this.allCustomersList = this.newCustomers;
    //                     this.allCustomersListMaster = rdata.wb_customers;
    //                 } else {
    //                     this.allCustomersList = [...this.allCustomersList, ...this.newCustomers];
    //                     this.allCustomersListMaster = [...this.allCustomersList, ...this.newCustomers];
    //                 }

    //                 this.chatCounts.allCust = this.allCustomersList.length;
    //                 this.allCustomersList.forEach((element) => {
    //                     if (element.alm_wb_msg_created_on) {
    //                         const today = new Date();
    //                         const msgDate = new Date(element.alm_wb_msg_created_on);

    //                         const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    //                         const msgDateOnly = new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate());

    //                         const diffInDays = (todayDateOnly.getTime() - msgDateOnly.getTime()) / (1000 * 3600 * 24);

    //                         if (diffInDays === 0) {
    //                             // If it's today, show hour and minute
    //                             element['time'] = this.datePipe.transform(msgDate, 'h:mm a') || '';
    //                         } else if (diffInDays === 1) {
    //                             // If it's yesterday, show 'Yesterday'
    //                             element['time'] = 'Yesterday';
    //                         } else {
    //                             // Otherwise, show the date
    //                             element['time'] = this.datePipe.transform(msgDate, 'dd/MM/yy') || '';
    //                         }
    //                         // if (element.wb_cus_category == 1) {
    //                         //     this.chatCounts.potentialCust++;
    //                         // } else if (element.wb_cus_category == 2) {
    //                         //     this.chatCounts.activeCust++;
    //                         // } else if (element.wb_cus_category == 3) {
    //                         //     this.chatCounts.appointmentCust++;
    //                         // } else if (element.wb_cus_category == 4) {
    //                         //     this.chatCounts.quotationCust++;
    //                         // } else if (element.wb_cus_category == 5) {
    //                         //     this.chatCounts.irrelaventCust++;
    //                         // }

    //                         element.followUpTimeExceeded = this.checkTimeConditions(element.wb_cus_follow_up, element.wb_cus_follow_up_time);
    //                         console.log('element.followUpTimeExceeded>>>>>>>>>', element.followUpTimeExceeded);
    //                         if (element.followUpTimeExceeded) {
    //                             this.followUpTimeExceededCustomers.push({
    //                                 wb_cus_id: element.wb_cus_id,
    //                                 alm_wb_msg_id: element.alm_wb_msg_id,
    //                                 name: element.wb_cus_name,
    //                                 alm_wb_msg_staff_id: element.alm_wb_msg_staff_id,
    //                             });
    //                         }
    //                     }
    //                     if (element.message_status_2_count > 0) {
    //                         this.unreadCount++;
    //                     }
    //                 });

    //                 if (this.followUpTimeExceededCustomers.length > 0) {
    //                     let data = {
    //                         followUpTimeExceededCustomers: this.followUpTimeExceededCustomers,
    //                     };

    //                     this.userServices.whatsappMessageExpiredFollowupLogs(data).subscribe((rdata: any) => {
    //                         if (rdata.ret_data === 'success') {
    //                         }
    //                     });
    //                 }

    //                 if (this.newCustomers.length < this.limit) {
    //                     //no more customer datas
    //                     this.hasMoredata = false;
    //                 } else {
    //                     this.offset += this.limit;
    //                 }

    //                 const uniqueCustomers = new Map<string, any>();

    //                 this.allCustomersListMaster.forEach((customer: any) => {
    //                     if (!uniqueCustomers.has(customer.wb_cus_id) && customer.status_id == 8) {
    //                         // Filter customers based on their follow-up status
    //                         switch (customer.wb_cus_follow_up) {
    //                             case '1':
    //                                 this.followUpCounts.firstFollowUp.push(customer);
    //                                 break;
    //                             case '2':
    //                                 this.followUpCounts.secondFollowUp.push(customer);
    //                                 break;
    //                             case '3':
    //                                 this.followUpCounts.thirdFollowUp.push(customer);
    //                                 break;
    //                             case '4':
    //                                 this.followUpCounts.fourthFollowUp.push(customer);
    //                                 break;
    //                             case '5':
    //                                 this.followUpCounts.fifthFollowUp.push(customer);
    //                                 break;
    //                             case '6':
    //                                 this.followUpCounts.pendingReply.push(customer);
    //                                 break;
    //                             case '7':
    //                                 this.followUpCounts.tempLost.push(customer);
    //                                 break;
    //                             default:
    //                                 // Optional: handle cases where follow-up status does not match 1–5
    //                                 break;
    //                         }
    //                         // Mark this customer as processed by adding them to uniqueCustomers
    //                         uniqueCustomers.set(customer.wb_cus_id, customer);
    //                     }
    //                 });

    //                 console.log(
    //                     '>>>>>>>>>>>this.followUpCounts.firstFollowUp>>>>>>>>>>>this.followUpCounts.firstFollowUp>>>>>>>>>>>>',
    //                     this.followUpCounts.secondFollowUp
    //                 );

    //                 // this.categorizeActiveCustomers();
    //             } else {
    //                 this.coloredToast('danger', "Can't fetch whatsapp messages");
    //             }
    //             this.isLoading = false;
    //         });

    //         this.chatCounts = {
    //             allCust: 0,
    //             potentialCust: 0,
    //             activeCust: 0,
    //             appointmentCust: 0,
    //             quotationCust: 0,
    //             irrelaventCust: 0,
    //         };

    //         this.userServices.getWhatsappCustomerCategorizeCounts().subscribe((rdata: any) => {
    //             if (rdata.ret_data === 'success') {
    //                 this.chatCounts.potentialCust = rdata.wb_customers_count.potential_Customer;
    //                 this.chatCounts.activeCust = rdata.wb_customers_count.active_Customer;
    //                 this.chatCounts.appointmentCust = rdata.wb_customers_count.appointment;
    //                 this.chatCounts.quotationCust = rdata.wb_customers_count.quotation;
    //                 this.chatCounts.irrelaventCust = rdata.wb_customers_count.irrelevant;
    //             } else {
    //                 this.coloredToast('danger', "Can't fetch whatsapp messages");
    //             }
    //         });

    //         // this.potentialList={
    //         //     awaiting30m:0,
    //         //     awaiting1h:0,
    //         //     awaiting3h:0,
    //         //     awaiting6h:0,
    //         //     awiating1d:0,
    //         //     awaiting3d:0,
    //         //     awaitingTempLost:0,
    //         // }
    //         // this.userServices.getWhatsappCustomersCounts().subscribe((rdata: any) => {
    //         //     if (rdata.ret_data === 'success') {
    //         //         this.potentialList.awaiting30m = rdata.wb_customers_count.count_last_30_minutes;
    //         //         this.potentialList.awaiting1h = rdata.wb_customers_count.count_last_1_hour;
    //         //         this.potentialList.awaiting3h = rdata.wb_customers_count.count_last_3_hours;
    //         //         this.potentialList.awiating1d = rdata.wb_customers_count.count_last_1_day;
    //         //         this.potentialList.awaiting3d = rdata.wb_customers_count.count_last_3_days;
    //         //         const totalAwaiting =
    //         //             this.potentialList.awaiting30m +
    //         //             this.potentialList.awaiting1h +
    //         //             this.potentialList.awaiting3h +
    //         //             this.potentialList.awaiting1d +
    //         //             this.potentialList.awaiting3d;

    //         //             this.potentialList.awaitingTempLost =
    //         //                 Number(rdata.wb_customers_count.count_last_30_minutes) +
    //         //                 Number(rdata.wb_customers_count.count_last_1_hour) +
    //         //                 Number(rdata.wb_customers_count.count_last_3_hours) +
    //         //                 Number(rdata.wb_customers_count.count_last_1_day) +
    //         //                 Number(rdata.wb_customers_count.count_last_3_days);

    //         //     } else {
    //         //         this.coloredToast('danger', "Can't fetch whatsapp messages");
    //         //     }
    //         // });
    //     }
    // }

    // fetchCustomerData(interval: string,interval2: string): void {
    //     this.isLoading =true;
    //     this.allCustomersList = [];
    //     let data  = {
    //         timeInterval:interval,
    //         timeInterval2:interval2
    //     }
    //     this.userServices.getWhatsappCustomersByTime(data).subscribe((rdata: any) => {
    //         if (rdata.ret_data === 'success') {
    //             this.allCustomersList = rdata.wb_customers;
    //             this.isLoading =false;
    //         } else {
    //             this.coloredToast('danger', "Can't fetch Customers");
    //             this.isLoading =false;
    //         }
    //     });
    // }

    // fetchTempLostCustomerData() {
    //     this.isLoading = true;
    //     this.allCustomersList = [];
    //     this.userServices.getTemporaryLostWhatsappCustomers().subscribe((rdata: any) => {
    //         if (rdata.ret_data === 'success') {
    //             this.allCustomersList = rdata.wb_customers;
    //             this.isLoading = false;
    //         } else {
    //             this.coloredToast('danger', "Can't fetch Customers");
    //             this.isLoading = false;
    //         }
    //     });
    // }

    updateUsersChat() {
        if (this.isLoading) return;
        this.isLoading = true;
        // this.unreadCount = 0;
        // this.allCustomersList= [];

        // this.chatCounts = {
        //     allCust: 0,
        // };
        if (this.hasMoredata === undefined) {
            this.hasMoredata = true;
        }
        // console.log('offset and limit>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', this.offset, this.limit);
        let data = {
            limit: this.limit,
            offset: this.offset,
        };
        //vv ends
        if (this.hasMoredata) {
            // console.log('data', this.hasMoredata);

            this.userServices.getWhatsappCustomers(data).subscribe((rdata: any) => {
                if (rdata.ret_data === 'success') {
                    // this.followUpCounts = {
                    //     firstFollowUp: [],
                    //     secondFollowUp: [],
                    //     thirdFollowUp: [],
                    //     fourthFollowUp: [],
                    //     fifthFollowUp: [],
                    //     pendingReply: [],
                    //     tempLost: [],
                    // };

                    this.newCustomers = rdata.wb_customers;
                    if (this.refreshFlag || (this.limit == 20 && this.offset == 0)) {
                        this.allCustomersList = [...this.newCustomers];
                        this.allCustomersListMaster = [...this.newCustomers];
                        this.refreshFlag = false;
                    } else {
                        this.allCustomersList = [...this.allCustomersList, ...this.newCustomers];
                        this.allCustomersListMaster = [...this.allCustomersListMaster, ...this.newCustomers];
                    }

                    this.chatCounts.allCust = this.allCustomersList.length;
                    const todayDateOnly = new Date(new Date().setHours(0, 0, 0, 0));
                    // this.unreadCount = 0;
                    this.followUpTimeExceededCustomers = [];

                    this.isLoading = false;
                    const uniqueCustomers = new Map<string, any>();
                    this.allCustomersList.forEach((element) => {
                        if (element.alm_wb_msg_created_on) {
                            const msgDateOnly = new Date(new Date(element.alm_wb_msg_created_on).setHours(0, 0, 0, 0));
                            const diffInDays = (todayDateOnly.getTime() - msgDateOnly.getTime()) / (1000 * 3600 * 24);

                            element['time'] =
                                diffInDays === 0
                                    ? this.datePipe.transform(element.alm_wb_msg_created_on, 'h:mm a') || ''
                                    : diffInDays === 1
                                    ? 'Yesterday'
                                    : this.datePipe.transform(element.alm_wb_msg_created_on, 'dd/MM/yy') || '';

                            element.followUpTimeExceeded = this.checkTimeConditions(element.wb_cus_follow_up, element.wb_cus_follow_up_time);

                            if (element.followUpTimeExceeded) {
                                this.followUpTimeExceededCustomers.push({
                                    wb_cus_id: element.wb_cus_id,
                                    alm_wb_msg_id: element.alm_wb_msg_id,
                                    name: element.wb_cus_name,
                                    alm_wb_msg_staff_id: element.alm_wb_msg_staff_id,
                                });
                            }
                        }

                        // if (element.message_status_2_count > 0) {
                        //     this.unreadCount++;
                        // }

                        // if (!uniqueCustomers.has(element.wb_cus_id) && element.status_id === '8') {
                        //     switch (element.wb_cus_follow_up) {
                        //         case '1':
                        //             this.followUpCounts.firstFollowUp.push(element);
                        //             break;
                        //         case '2':
                        //             this.followUpCounts.secondFollowUp.push(element);
                        //             break;
                        //         case '3':
                        //             this.followUpCounts.thirdFollowUp.push(element);
                        //             break;
                        //         case '4':
                        //             this.followUpCounts.fourthFollowUp.push(element);
                        //             break;
                        //         case '5':
                        //             this.followUpCounts.fifthFollowUp.push(element);
                        //             break;
                        //         case '6':
                        //             this.followUpCounts.pendingReply.push(element);
                        //             break;
                        //         case '7':
                        //             this.followUpCounts.tempLost.push(element);
                        //             break;
                        //     }
                        //     uniqueCustomers.set(element.wb_cus_id, element);
                        // }
                    });

                    if (this.followUpTimeExceededCustomers.length > 0) {
                        const data = { followUpTimeExceededCustomers: this.followUpTimeExceededCustomers };
                        this.userServices.whatsappMessageExpiredFollowupLogs(data).subscribe((rdata: any) => {
                            if (rdata.ret_data === 'success') {
                                // Log follow-up time exceeded customers if necessary
                            }
                        });
                    }

                    this.hasMoredata = this.newCustomers.length >= this.limit;
                    if (this.hasMoredata) {
                        this.offset += this.limit;
                    }
                } else {
                    this.coloredToast('danger', "Can't fetch WhatsApp messages");
                }
            });

            if (this.refreshFlag || (this.limit == 20 && this.offset == 0)) {
                this.chatCounts = {
                    allCust: 0,
                    potentialCust: 0,
                    activeCust: 0,
                    appointmentCust: 0,
                    quotationCust: 0,
                    irrelaventCust: 0,
                    purposeNotCust: 0,
                };

                this.userServices.getWhatsappCustomerCategorizeCounts().subscribe((rdata: any) => {
                    if (rdata.ret_data === 'success') {
                        this.chatCounts.potentialCust = rdata.wb_customers_count.potential_Customer;
                        this.chatCounts.activeCust = rdata.wb_customers_count.active_Customer;
                        this.chatCounts.appointmentCust = rdata.wb_customers_count.appointment;
                        this.chatCounts.quotationCust = rdata.wb_customers_count.quotation;
                        this.chatCounts.irrelaventCust = rdata.wb_customers_count.irrelevant;
                        this.chatCounts.purposeNotCust = rdata.wb_customers_count.purpose_not_cust;
                    } else {
                        this.coloredToast('danger', "Can't fetch whatsapp messages");
                    }
                });
            }

            // this.potentialList={
            //     awaiting30m:0,
            //     awaiting1h:0,
            //     awaiting3h:0,
            //     awaiting6h:0,
            //     awiating1d:0,
            //     awaiting3d:0,
            //     awaitingTempLost:0,
            // }
            // this.userServices.getWhatsappCustomersCounts().subscribe((rdata: any) => {
            //     if (rdata.ret_data === 'success') {
            //         this.potentialList.awaiting30m = rdata.wb_customers_count.count_last_30_minutes;
            //         this.potentialList.awaiting1h = rdata.wb_customers_count.count_last_1_hour;
            //         this.potentialList.awaiting3h = rdata.wb_customers_count.count_last_3_hours;
            //         this.potentialList.awiating1d = rdata.wb_customers_count.count_last_1_day;
            //         this.potentialList.awaiting3d = rdata.wb_customers_count.count_last_3_days;
            //         const totalAwaiting =
            //             this.potentialList.awaiting30m +
            //             this.potentialList.awaiting1h +
            //             this.potentialList.awaiting3h +
            //             this.potentialList.awaiting1d +
            //             this.potentialList.awaiting3d;

            //             this.potentialList.awaitingTempLost =
            //                 Number(rdata.wb_customers_count.count_last_30_minutes) +
            //                 Number(rdata.wb_customers_count.count_last_1_hour) +
            //                 Number(rdata.wb_customers_count.count_last_3_hours) +
            //                 Number(rdata.wb_customers_count.count_last_1_day) +
            //                 Number(rdata.wb_customers_count.count_last_3_days);

            //     } else {
            //         this.coloredToast('danger', "Can't fetch whatsapp messages");
            //     }
            // });
        }
    }

    checkTimeConditions(wb_cus_follow_up: any, wb_cus_follow_up_time: any) {
        let isTimeExceeded = false; // Initialize the flag
        this.inboundFollowUpTimes.forEach((element: any) => {
            if (element.wb_msg_fut_seq === wb_cus_follow_up) {
                const followUpTime = new Date(wb_cus_follow_up_time);
                const currentTime = new Date();
                const timeDifference = currentTime.getTime() - followUpTime.getTime(); // Get the time difference in milliseconds
                // Check based on was_mfut_interval
                if (element.was_mfut_interval === '0') {
                    // Check in minutes
                    const timeInMinutes = timeDifference / (1000 * 60); // Convert milliseconds to minutes
                    if (timeInMinutes > element.wb_msg_fut_time) {
                        isTimeExceeded = true; // Set to true if exceeded
                    }
                } else if (element.was_mfut_interval === '1') {
                    // Check in hours
                    const timeInHours = timeDifference / (1000 * 60 * 60); // Convert milliseconds to hours
                    if (timeInHours > element.wb_msg_fut_time) {
                        isTimeExceeded = true; // Set to true if exceeded
                    }
                } else if (element.was_mfut_interval === '2') {
                    // Check in days
                    const timeInDays = timeDifference / (1000 * 60 * 60 * 24); // Convert milliseconds to days
                    if (timeInDays > element.wb_msg_fut_time) {
                        isTimeExceeded = true; // Set to true if exceeded
                    }
                }
            }
        });
        return isTimeExceeded; // Return the result
    }

    hasExceededFollowUps(followUpCounts: any) {
        return followUpCounts.some((item: any) => item.followUpTimeExceeded);
    }

    copytext(text: any) {
        navigator.clipboard.writeText(text);
        this.coloredToast('info', 'Phone Number Copied!');
    }

    categorizeActiveCustomers() {
        const currentTime = new Date();
        const messages = this.allCustomersListMaster.filter((item: any) => item.wb_cus_category == 1);
        let remainingMessages = [...messages];
        // Filter messages based on time differences
        // this.potentialList.awaiting30m = messages.filter((message) => this.isWithinTimeGap(message.alm_wb_msg_created_on, 30, 'minutes'));
        // remainingMessages = remainingMessages.filter((message) => !this.potentialList.awaiting30m.includes(message));
        // this.potentialList.awaiting1h= remainingMessages.filter((message) => this.isWithinTimeGap(message.alm_wb_msg_created_on, 1, 'hours'));
        // remainingMessages = remainingMessages.filter((message) => !this.potentialList.awaiting1h.includes(message));
        // this.potentialList.awaiting3h = remainingMessages.filter((message) => this.isWithinTimeGap(message.alm_wb_msg_created_on, 3, 'hours'));
        // remainingMessages = remainingMessages.filter((message) => !this.potentialList.awaiting3h.includes(message));
        // this.potentialList.awiating1d= remainingMessages.filter((message) => this.isWithinTimeGap(message.alm_wb_msg_created_on, 1, 'days'));
        // remainingMessages = remainingMessages.filter((message) => !this.potentialList.awiating1d.includes(message));
        // this.potentialList.awaiting3d = remainingMessages.filter((message) => this.isWithinTimeGap(message.alm_wb_msg_created_on, 3, 'days'));
        // this.potentialList.awaitingTempLost = remainingMessages.filter((message) => !this.potentialList.awaiting3d.includes(message));

        // Now you can use these filtered lists
    }
    getNewMessage = () => {
        this.socket.on('new_message_customer', (data: any) => {
            if (this.currentUser.wb_cus_mobile == data.fromUserId.wb_cus_mobile) {
                if (data.message_source == 2) {
                    let message = {
                        alm_wb_msg_source: data.message_source,
                        alm_wb_msg_staff_id: data.toUserId,
                        alm_wb_msg_type: data.message_type,
                        alm_wb_msg_content: data.message,
                        alm_wb_msg_status: 1,
                        alm_wb_msg_customer: this.currentUser.wb_cus_id,
                        alm_wb_msg_reply_id: '0',
                        alm_wb_msg_created_on: data.time,
                        alm_wb_msg_mobile: this.currentUser.wb_cus_mobile,
                        us_firstname: data.toUserId,
                    };
                    this.currentUserMessages.push(message);
                    this.scrollToBottom();
                } else {
                    let message = {
                        alm_wb_msg_source: data.message_source,
                        alm_wb_msg_staff_id: atob(atob(localStorage.getItem('us_id') || '{}')),
                        alm_wb_msg_type: data.message_type,
                        alm_wb_msg_content: data.message,
                        alm_wb_msg_status: 1,
                        alm_wb_msg_customer: this.currentUser.wb_cus_id,
                        alm_wb_msg_reply_id: '0',
                        alm_wb_msg_created_on: data.time,
                        alm_wb_msg_mobile: this.currentUser.wb_cus_mobile,
                    };

                    this.currentUserMessages.push(message);
                    this.scrollToBottom();
                }
            } else {
                this.limit = 20;
                this.offset = 0;
                this.updateUsersChat();
                this.getUnreadMessages(0);
            }
            this.playSound();
        });
        return this.message$.asObservable();
    };

    isWithinTimeGap(messageDateStr: string, timeGap: number, unit: 'minutes' | 'hours' | 'days'): boolean {
        const messageDate = new Date(messageDateStr); // convert the message timestamp to a Date object
        const currentTime = new Date();
        const timeDifference = currentTime.getTime() - messageDate.getTime(); // time difference in milliseconds
        switch (unit) {
            case 'minutes':
                return timeDifference <= timeGap * 60 * 1000;
            case 'hours':
                return timeDifference <= timeGap * 60 * 60 * 1000;
            case 'days':
                return timeDifference <= timeGap * 24 * 60 * 60 * 1000;
            default:
                return false;
        }
    }

    playSound() {
        this.audio.play();
    }

    getNewInActiveMessage = () => {
        this.socket.on('new_inactive_message_customer', (data: any) => {});
        return this.message$.asObservable();
    };

    getMessages(): Observable<string> {
        return new Observable((observer) => {
            this.socket.on('message', (message) => {
                observer.next(message);
            });
        });
    }
    sendMessage() {
        if (this.replyId != 0) {
            if (this.textMessage.trim()) {
                let socket_data = {
                    room_id: 'crm_dxb_users',
                    message_type: 4,
                    message_source: 2,
                    message: this.textMessage.trim(),
                    time: Date.now(),
                    toUserId: atob(atob(localStorage.getItem('us_firstname') || '{}')),
                    fromUserId: this.currentUser,
                };
                let data = {
                    alm_wb_msg_source: '2',
                    alm_wb_msg_staff_id: atob(atob(localStorage.getItem('us_id') || '{}')),
                    alm_wb_msg_type: '4',
                    alm_wb_msg_content: this.textMessage.trim(),
                    alm_wb_msg_status: 1,
                    alm_wb_msg_customer: this.currentUser.wb_cus_id,
                    alm_wb_msg_reply_id: this.replyId,
                    alm_wb_msg_created_on: Date.now(),
                    alm_wb_msg_mobile: this.currentUser.wb_cus_mobile,
                    alm_wb_msg_delete_flag: '0',
                    us_firstname: atob(atob(localStorage.getItem('us_firstname') || '{}')),
                    msgId: this.msgId,
                };

                this.userServices.replyMessageToCustomer(data).subscribe((rdata: any) => {
                    if (rdata.ret_data === 'success') {
                        this.currentUserMessages.push(data);
                        this.socket.emit('new_message_customer', socket_data);
                        this.scrollToBottom();
                        this.height = 40; // Initial height of textarea
                        this.maxHeight = 150;
                        this.replyId = 0;
                        this.replyMessage = '';
                    } else {
                        this.coloredToast('danger', "Can't fetch whatsapp messages");
                    }
                });
                this.textMessage = '';
            }
        } else {
            if (this.textMessage.trim()) {
                let socket_data = {
                    room_id: 'crm_dxb_users',
                    message_type: 4,
                    message_source: 2,
                    message: this.textMessage.trim(),
                    time: Date.now(),
                    toUserId: atob(atob(localStorage.getItem('us_firstname') || '{}')),
                    fromUserId: this.currentUser,
                };
                let data = {
                    alm_wb_msg_source: '2',
                    alm_wb_msg_staff_id: atob(atob(localStorage.getItem('us_id') || '{}')),
                    alm_wb_msg_type: '4',
                    alm_wb_msg_content: this.textMessage.trim(),
                    alm_wb_msg_status: 1,
                    alm_wb_msg_customer: this.currentUser.wb_cus_id,
                    alm_wb_msg_reply_id: '0',
                    alm_wb_msg_created_on: Date.now(),
                    alm_wb_msg_mobile: this.currentUser.wb_cus_mobile,
                    alm_wb_msg_delete_flag: '0',
                    us_firstname: atob(atob(localStorage.getItem('us_firstname') || '{}')),
                };

                this.userServices.sendMessageToCustomer(data).subscribe((rdata: any) => {
                    if (rdata.ret_data === 'success') {
                        this.currentUserMessages.push(data);
                        this.socket.emit('new_message_customer', socket_data);
                        this.scrollToBottom();
                        this.height = 40; // Initial height of textarea
                        this.maxHeight = 150;
                    } else {
                        if (rdata.blocked && rdata.blocked == 'true') {
                            this.coloredToast('danger', 'Customer is blocked. Unable to send message.');
                        } else {
                            this.coloredToast('danger', "Can't fetch whatsapp messages");
                        }
                    }
                });
                this.textMessage = '';
            }
        }
    }

    scrollToBottom() {
        if (this.isShowUserChat) {
            setTimeout(() => {
                this.scrollable.scrollTo({ bottom: 0 });
            });
        }
    }

    searchCustomers() {
        if (!this.searchText) {
            this.allCustomersList = this.allCustomersListMaster;
            return;
        } else {
            let data = {
                searchText: this.searchText,
            };

            this.userServices.searchWhatsappCustomer(data).subscribe((rdata: any) => {
                if (rdata.ret_data === 'success') {
                    this.allCustomersList = rdata.customers;
                    const todayDateOnly = new Date(new Date().setHours(0, 0, 0, 0));
                    this.allCustomersList.forEach((element) => {
                        if (element.alm_wb_msg_created_on) {
                            const msgDateOnly = new Date(new Date(element.alm_wb_msg_created_on).setHours(0, 0, 0, 0));
                            const diffInDays = (todayDateOnly.getTime() - msgDateOnly.getTime()) / (1000 * 3600 * 24);

                            element['time'] =
                                diffInDays === 0
                                    ? this.datePipe.transform(element.alm_wb_msg_created_on, 'h:mm a') || ''
                                    : diffInDays === 1
                                    ? 'Yesterday'
                                    : this.datePipe.transform(element.alm_wb_msg_created_on, 'dd/MM/yy') || '';
                        }
                    });
                } else {
                    this.coloredToast('danger', "Can't fetch whatsapp customers, please try again!");
                }
            });
        }
        // const lowercaseSearch = this.searchText.toLowerCase();
        // this.allCustomersList = this.fullcustomersLimit.filter((customer) => {
        //     const nameMatch = customer.wb_cus_name.toLowerCase().includes(lowercaseSearch);
        //     const phoneMatch = customer.wb_cus_mobile?.toLowerCase().includes(lowercaseSearch);
        //     return nameMatch || phoneMatch;
        // });
        // console.log('allCustomersList...............', this.allCustomersList);
    }

    openLeadDetails(lead_id: any) {
        if (this.currentUser.lead_status == '8') {
            this.leadCreateModal.open();
        } else {
            let item = this.currentUser.lead_details;
            if (item.apptm_id != null) {
                this.router.navigateByUrl('leads/appointment/appointment-details/' + btoa(item.apptm_id));
            } else if (item.purpose_id == '3') {
                this.router.navigateByUrl('leads/quotation/quotation-details/' + btoa(item.lead_id));
            } else if (item.purpose_id == '2' || item.purpose_id == '4') {
                this.router.navigateByUrl('lead_update/' + btoa(item.lead_id));
            }
        }
    }

    leadCreateModalClose() {
        this.leadCreateModal.close();
    }

    sendNewMessage(num: any) {
        this.isMessage = true;
        if (num == 1) {
            let mobile = this.newChatCustomer.mobile_number.replace(/\s+/g, '');
            if (this.newChatCustomer.mobile_number == '' || this.newChatCustomer.message == '') {
                this.coloredToast('danger', 'Mobile number & message mandatory');
                this.isMessage = false;
            } else if (this.newChatCustomer.country_code == '971' && mobile.length != 9) {
                this.coloredToast('danger', 'Incorrect Mobile Number');
                this.isMessage = false;
            } else {
                this.userServices.sendNewCustomerMessage(this.newChatCustomer).subscribe((rdata: any) => {
                    if (rdata.ret_data === 'success') {
                        this.limit = 20;
                        this.offset = 0;
                        this.updateUsersChat();
                        this.newchatModal.close();
                        this.isMessage = false;
                        this.newChatCustomer = {
                            country_code: '971',
                            mobile_number: '',
                            message: '',
                            customer_name: '',
                        };
                    } else {
                        this.coloredToast('danger', "Can't send whatsapp messages");
                        this.isMessage = false;
                    }
                });
            }
        } else {
            let mobile = this.newChatCustomer.mobile_number.replace(/\s+/g, '');
            if (this.newChatCustomer.mobile_number == '') {
                this.coloredToast('danger', 'Mobile number mandatory');
                this.isMessage = false;
            }
            // else if (this.newChatCustomer.country_code == '971' && mobile.length != 9) {
            //     this.coloredToast('danger', 'Incorrect Mobile Number');
            //     this.isMessage = false;
            // }
            else {
                this.userServices.sendNewCustomerCampaignNewMessage(this.newChatCustomer).subscribe((rdata: any) => {
                    if (rdata.ret_data === 'success') {
                        this.limit = 20;
                        this.offset = 0;
                        this.updateUsersChat();
                        this.newchatModal.close();
                        this.isMessage = false;
                        this.newChatCustomer = {
                            country_code: '971',
                            mobile_number: '',
                            message: '',
                            customer_name: '',
                        };
                    } else {
                        this.coloredToast('danger', "Can't send whatsapp messages");
                        this.isMessage = false;
                    }
                });
            }
        }
    }

    openImageModal(url: string) {
        this.previewImage = url;
        this.imageModal.open();
    }

    downloadImage() {
        this.http.get('https://autoversa-media.s3.me-central-1.amazonaws.com/' + this.previewImage, { responseType: 'blob' }).subscribe(
            (blob) => {
                const url = window.URL.createObjectURL(blob);
                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.download = 'whatsapp_img_' + Date.now() + '.jpg';
                anchor.click();
                window.URL.revokeObjectURL(url);
            },
            (error) => {
                console.error('Download error:', error);
            }
        );
    }

    onDocumentFileChanged(event: any): void {
        this.isMessage = true;
        // console.log('i am here', event.target.files[0]);
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            // console.log('i am here 2');
            reader.onload = () => {};
            reader.readAsDataURL(file);
            // console.log(file.type);
        }
        const formData = new FormData();
        formData.append('media', file);
        formData.append('name', file.name);
        formData.append('type', file.type);
        formData.append('customer_id', this.currentUser.wb_cus_id);
        formData.append('customer_number', this.currentUser.wb_cus_mobile);
        this.userServices.sendWhatsappDocument(formData).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.limit = 20;
                this.offset = 0;
                this.updateUsersChat();
                this.isMessage = false;
                this.selectUser(this.currentUser);
            } else {
                this.coloredToast('danger', "Can't send whatsapp messages");
                this.isMessage = false;
            }
        });
    }

    onFileChanged(event: any): void {
        // console.log('i am here', event.target.files[0]);
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            // console.log('i am here 2');
            reader.onload = () => {
                this.selectedMedia.media = reader.result;
            };
            reader.readAsDataURL(file);
            // console.log(file.type);
            if (['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
                this.selectedMedia.type = 1;
                this.selectedMedia.name = 'whatsapp_img_' + Date.now() + '.jpg';
            } else if (['video/mp4', 'image/gif'].includes(file.type)) {
                this.selectedMedia.type = 2;
                this.selectedMedia.name = 'whatsapp_img_' + Date.now() + '.mp4';
            }
            this.selectedMedia.media_upload = file;
            let filteredArray = this.currentUserMessages.filter((item: any) => item.alm_wb_msg_source == 1);
            if (filteredArray.length > 0) {
                let last_chat = filteredArray.pop();
                const startTime = new Date(last_chat.alm_wb_msg_created_on);
                const currentTime = new Date();
                const differenceInMilliseconds = currentTime.getTime() - startTime.getTime();
                const differenceInMinutes = differenceInMilliseconds / (1000 * 60);

                // console.log(differenceInMinutes);
                if (differenceInMinutes > 1440) {
                    this.selectedMedia.timeExceed = true;
                }
            } else {
                this.selectedMedia.timeExceed = true;
            }

            this.mediaModal.open();
        }
    }
    sendMessageWithMedia() {
        this.isMessage = true;
        if (this.selectedMedia.media != null) {
            this.selectedMedia.customer_id = this.currentUser.wb_cus_id;
            this.selectedMedia.customer_number = this.currentUser.wb_cus_mobile;
            const formData = new FormData();
            formData.append('media', this.selectedMedia.media_upload);
            formData.append('message', this.selectedMedia.message);
            formData.append('type', this.selectedMedia.type);
            formData.append('name', this.selectedMedia.name);
            formData.append('customer_id', this.currentUser.wb_cus_id);
            formData.append('customer_number', this.currentUser.wb_cus_mobile);
            this.userServices.sendMessageWithMedia(formData).subscribe((rdata: any) => {
                if (rdata.ret_data === 'success') {
                    this.limit = 20;
                    this.offset = 0;
                    this.updateUsersChat();
                    this.mediaModal.close();
                    this.isMessage = false;
                    this.selectUser(this.currentUser);
                } else {
                    this.coloredToast('danger', "Can't send whatsapp messages");
                    this.isMessage = false;
                }
            });
        }
    }
    adjustHeight(event: Event): void {
        const textarea = event.target as HTMLTextAreaElement;

        // Temporarily reset the height to auto to calculate the new height
        textarea.style.height = 'auto';

        // Calculate the new height
        const newHeight = textarea.scrollHeight;

        // Apply the new height if it is within the maximum height
        if (newHeight > this.maxHeight) {
            this.height = this.maxHeight;
        } else {
            this.height = newHeight;
        }

        // Reapply the calculated height to the textarea
        textarea.style.height = `${this.height}px`;
    }
    handleKeydown(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            if (event.shiftKey) {
                // Allow new line when Shift+Enter is pressed
                return;
            } else {
                // Prevent default Enter behavior and call a function
                event.preventDefault();
                this.sendMessage();
            }
        }
    }
    toggleEmojiPicker() {
        // console.log(this.showEmojiPicker);
        this.showEmojiPicker = !this.showEmojiPicker;
    }
    addEmoji(event: any) {
        this.textMessage = this.textMessage + event.emoji.native;
    }
    blockCustomer() {
        // console.log('i am here');
        Swal.fire({
            icon: 'warning',
            title: 'Block contact! Are you sure?',
            text: "You won't be able to send or receive message in future!",
            showCancelButton: true,
            confirmButtonText: 'Block',
            padding: '2em',
            customClass: 'sweet-alerts',
        }).then((result) => {
            if (result.value) {
                this.userServices.blockContactFromWhatsapp(this.currentUser).subscribe((rdata: any) => {
                    if (rdata.ret_data === 'success') {
                        this.currentUser = {
                            wb_cus_id: 0,
                            wb_cus_name: '',
                            wb_cus_mobile: '',
                            wb_cus_profile_pic: '',
                            lead_id: 0,
                            lead_code: '',
                            lead_status: '',
                            lead_details: null,
                        };
                        this.currentUserMessages = [];
                        this.updateUsersChat();
                        this.coloredToast('success', 'Contact blocked successfully');
                    } else {
                        this.coloredToast('danger', 'Some error occurred please try again later');
                    }
                });
            }
        });
    }

    onRightClick(event: MouseEvent) {
        event.preventDefault();
        this.showButtons = true;
    }

    // onForward(message: any) {
    //     this.forwardMessage = '';
    //     // this.isContextMenuVisible = false;
    //     this.forwardModal.open();
    //     this.forwardMessage = message.alm_wb_msg_content;
    //     console.log('Forward action triggered', message.alm_wb_msg_content);
    // }

    onForward(message: any, type: any) {
        this.forwardType = type;
        this.forwardMessage = message;
        this.forwardModal.open();
        // console.log('Forward action triggered', message);
    }

    onReply(message: any) {
        // this.isContextMenuVisible = false;
        // console.log('Reply action triggered', message);
        this.replyId = message.alm_wb_msg_id;
        this.replyMessage = message.alm_wb_msg_content;
        this.msgId = message.alm_wb_msg_master_id;
    }

    clearReply() {
        this.replyId = 0;
        this.replyMessage = '';
        this.msgId = '';
    }

    getRepliedMessage(replyId: number) {
        const message = this.currentUserMessages.find((message) => message.alm_wb_msg_id === replyId);
        if (message) {
            const content = message.alm_wb_msg_content;
            const type = message.alm_wb_msg_type;
            const truncatedContent = type === 4 && content.length > 40 ? content.substring(0, 40) + '...' : content;
            return {
                content: truncatedContent,
                type: type,
            };
        }
        return null;
    }

    // Hide the context menu when clicking outside
    onClickOutside() {
        this.showButtons = false;
    }

    openContextMenu(event: MouseEvent, message: any) {
        event.preventDefault();
        if (message && message.alm_wb_msg_delete_flag == '0')
            Swal.fire({
                title: 'You are about to delete a message?',
                text: "You won't be able to revert this!",
                showCancelButton: true,
                confirmButtonText: 'Delete',
                padding: '2em',
                customClass: 'sweet-alerts',
            }).then((result) => {
                if (result.value) {
                    this.userServices.deleteCustomerMessage(this.currentUser).subscribe((rdata: any) => {
                        if (rdata.ret_data === 'success') {
                            message.alm_wb_msg_delete_flag = true;
                            this.coloredToast('success', 'Message deleted successfully');
                        } else {
                            this.coloredToast('danger', 'Some error occurred please try again later');
                        }
                    });
                }
            });
    }
    getGoogleMapsLink(location: any) {
        let actLocation = JSON.parse(location);
        let url = 'https://www.google.com/maps/search/?api=1&query=' + actLocation.lat + ',' + actLocation.lng;
        window.open(url, '_blank');
    }

    sendLocation(type: number) {
        let location = '';
        this.isMessage = true;
        if (type == 2) {
            // https://g.co/kgs/955uodk
            location = 'https://maps.app.goo.gl/hzsm84mWj3eyGSjm9';
        } else {
            // 'https://g.co/kgs/kvFCbGz';
            location = 'https://g.co/kgs/kvFCbGz';
        }
        let socket_data = {
            room_id: 'crm_dxb_users',
            message_type: 4,
            message_source: 2,
            message: 'Location: ' + location,
            time: Date.now(),
            toUserId: atob(atob(localStorage.getItem('us_firstname') || '{}')),
            fromUserId: this.currentUser,
        };
        let data = {
            alm_wb_msg_source: '2',
            alm_wb_msg_staff_id: atob(atob(localStorage.getItem('us_id') || '{}')),
            alm_wb_msg_type: '4',
            alm_wb_msg_content: location,
            alm_wb_msg_status: 1,
            alm_wb_msg_customer: this.currentUser.wb_cus_id,
            alm_wb_msg_reply_id: '0',
            alm_wb_msg_created_on: Date.now(),
            alm_wb_msg_mobile: this.currentUser.wb_cus_mobile,
            alm_wb_msg_delete_flag: '0',
        };

        this.userServices.sendMessageToCustomer(data).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.currentUserMessages.push(data);
                this.socket.emit('new_message_customer', socket_data);
                this.scrollToBottom();
                this.height = 40; // Initial height of textarea
                this.maxHeight = 150;
                this.isMessage = false;

                this.locationmodal.close();
            } else {
                this.isMessage = false;
                this.coloredToast('danger', "Can't fetch whatsapp messages");
            }
        });
        this.textMessage = '';
    }
    // openContextMenu(event: MouseEvent) {
    //     event.preventDefault();
    //     console.log("right click",event.clientX)
    //     this.position = { x:event.clientX, y:event.clientY };
    //     this.visible = true;
    // }
    downloadFile(event: any) {
        const url = 'https://autoversa-media.s3.me-central-1.amazonaws.com/' + event;
        const filename = url.split('/').pop();
        // const link = document.createElement('a');
        // link.href = url;
        // link.download = "document.pdf";  // Specify the filename
        // link.click();

        this.http.get(url, { responseType: 'blob' }).subscribe(
            (blob) => {
                const a = document.createElement('a');
                const objectUrl = URL.createObjectURL(blob);
                a.href = objectUrl;
                a.download = filename ? filename : '';
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(objectUrl);
                document.body.removeChild(a);
            },
            (error) => {
                console.error('Download error:', error);
            }
        );
    }

    sendAppointmentMessage() {
        if (this.appointmentData.date == null || this.appointmentData.timeFrom == '') {
            this.coloredToast('danger', 'Please fill all fields');
        } else {
            this.isMessage = true;
            this.appointmentData.cust_id = this.currentUser.wb_cus_id;
            this.appointmentData.cust_mobile = this.currentUser.wb_cus_mobile;
            this.userServices.sendAppointmentMessage(this.appointmentData).subscribe((rdata: any) => {
                if (rdata.ret_data === 'success') {
                    this.limit = 20;
                    this.offset = 0;
                    this.updateUsersChat();
                    this.appointmentModal.close();
                    this.isMessage = false;
                    this.selectUser(this.currentUser);
                    this.appointmentData = {
                        date: null,
                        timeFrom: '',
                        // timeTo: '',
                        cust_id: '',
                        cust_mobile: '',
                    };
                } else {
                    this.isMessage = false;
                    this.coloredToast('danger', "Can't fetch whatsapp messages");
                }
            });
        }
    }

    updateCustomerCategory() {
        this.userServices.updateCustomerCategory(this.currentUser).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.labelmodal.close();
                // this.updateUsersChat();
                this.isMessage = false;
                if (this.numbers.length > 0) {
                    this.searchWhatsappCustomersByPhoneNumbers();
                } else {
                    this.updateUsersChat();
                }
            } else {
                this.isMessage = false;
                this.coloredToast('danger', "Can't fetch whatsapp messages");
            }
        });
    }

    filterLabels(type: any, num: any) {
        this.isLoading = true;
        this.selectedFilter = type;
        this.isFollowUpSelected = false;
        this.allCustomersList = [];
        this.selectedFollowUp = num;
        this.currentUser = {
            wb_cus_id: 0,
            wb_cus_name: '',
            wb_cus_mobile: '',
            wb_cus_profile_pic: '',
            lead_id: 0,
            lead_code: '',
            lead_status: '',
            lead_details: null,
        };
        this.currentUserMessages = [];
        this.isShowUserChat = false;

        if (type == 0) {
            this.allCustomersList = this.allCustomersListMaster;
            this.isLoading = false;
        } else {
            let indata = {
                categorizes: type,
            };

            this.userServices.getWhatsappCustomerCategorize(indata).subscribe((rdata: any) => {
                if (rdata.ret_data === 'success') {
                    this.allCustomersList = rdata.wb_customers;
                    this.isLoading = false;
                } else {
                    this.coloredToast('danger', "Can't fetch whatsapp messages");
                    this.isLoading = false;
                }
            });
        }

        // if (type == 0) {
        //     this.allCustomersList = this.allCustomersListMaster;
        // } else if (type == 1) {
        //     this.allCustomersList = this.allCustomersListMaster.filter((item: any) => item.wb_cus_category == 1);
        // } else if (type == 2) {
        //     this.allCustomersList = this.allCustomersListMaster.filter((item: any) => item.wb_cus_category == 2);
        // } else if (type == 3) {
        //     this.allCustomersList = this.allCustomersListMaster.filter((item: any) => item.wb_cus_category == 3);
        // } else if (type == 4) {
        //     this.allCustomersList = this.allCustomersListMaster.filter((item: any) => item.wb_cus_category == 4);
        // } else if (type == 5) {
        //     this.allCustomersList = this.allCustomersListMaster.filter((item: any) => item.wb_cus_category == 5);
        // }
    }

    sendMinorService() {
        this.userServices
            .sendMinorServiceMessage({ price: '950', cust_id: this.currentUser.wb_cus_id, cust_mobile: this.currentUser.wb_cus_mobile })
            .subscribe((rdata: any) => {
                if (rdata.ret_data === 'success') {
                    this.updateUsersChat();
                    this.appointmentModal.close();
                    this.isMessage = false;
                    this.selectUser(this.currentUser);
                    this.appointmentData = {
                        date: null,
                        timeFrom: '',
                        // timeTo: '',
                        cust_id: '',
                        cust_mobile: '',
                    };
                } else {
                    this.isMessage = false;
                    this.coloredToast('danger', "Can't fetch whatsapp messages");
                }
            });
    }

    sendGarageLocation() {
        this.userServices.sendLocationMessage({ cust_id: this.currentUser.wb_cus_id, cust_mobile: this.currentUser.wb_cus_mobile }).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.updateUsersChat();
                this.selectUser(this.currentUser);
            } else {
                this.isMessage = false;
                this.coloredToast('danger', "Can't fetch whatsapp messages");
            }
        });
    }

    sendCustomerReEngagement() {
        this.userServices
            .sendCustomerReEngMessage({ cust_id: this.currentUser.wb_cus_id, cust_mobile: this.currentUser.wb_cus_mobile })
            .subscribe((rdata: any) => {
                if (rdata.ret_data === 'success') {
                    this.updateUsersChat();
                    this.selectUser(this.currentUser);
                } else {
                    this.isMessage = false;
                    this.coloredToast('danger', "Can't fetch whatsapp messages");
                }
            });
    }

    sendCampaignMessage() {
        let data = {
            alm_wb_msg_source: '2',
            alm_wb_msg_staff_id: '18',
            alm_wb_msg_type: '5',
            alm_wb_msg_status: 1,
            alm_wb_msg_customer: '',
            alm_wb_msg_reply_id: '0',
            alm_wb_msg_created_on: 1748260342075,
            alm_wb_msg_mobile: [
                {
                    mobile: '971502326080',
                    lead_id: 'CAM_AUG25_364',
                },
                {
                    mobile: '971566661406',
                    lead_id: 'CAM_AUG25_365',
                },
                {
                    mobile: '971506841735',
                    lead_id: 'CAM_AUG25_366',
                },
                {
                    mobile: '971506424240',
                    lead_id: 'CAM_AUG25_367',
                },
            ],
            alm_wb_msg_delete_flag: '0',
            alm_wb_msg_camp_type: '6',
            us_firstname: 'Jithin',
            campaignName: 'AUG_2025_Campaign',
            campaignDateFrom: '2025-08-22',
            campaignDateTo: '2025-08-29',
        };

        this.userServices.sendBroadcastWhatsappCampaignMessage(data).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.updateUsersChat();
                this.selectUser(this.currentUser);
            } else {
                this.isMessage = false;
                this.coloredToast('danger', "Can't fetch whatsapp messages");
            }
        });

        // this.userServices.sendCampaignMessage({ cust_id: this.currentUser.wb_cus_id, cust_mobile: this.currentUser.wb_cus_mobile }).subscribe((rdata: any) => {
        //     if (rdata.ret_data === 'success') {
        //         this.updateUsersChat();
        //         this.selectUser(this.currentUser);
        //     } else {
        //         this.isMessage = false;
        //         this.coloredToast('danger', "Can't fetch whatsapp messages");
        //     }
        // });
    }

    sendServiceRemainderCampaignMessage(type: any) {
        let data = {
            type: type,
        };
        this.userServices.sendServiceRemainderCampaignMessages(data).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.updateUsersChat();
                this.selectUser(this.currentUser);
            } else {
                this.isMessage = false;
                this.coloredToast('danger', "Can't fetch whatsapp messages");
            }
        });
    }

    sendAppointmentReaminderMessage() {
        if (this.appointmentRemainderData.date == null || this.appointmentRemainderData.time == '') {
            this.coloredToast('danger', 'Please fill all fields');
        } else {
            this.isMessage = true;
            let data = {
                cust_id: this.currentUser.wb_cus_id,
                cust_mobile: this.currentUser.wb_cus_mobile,
                date: this.appointmentRemainderData.date,
                time: this.appointmentRemainderData.time,
            };

            this.userServices.sendAppointmentRemainderMessage(data).subscribe((rdata: any) => {
                if (rdata.ret_data === 'success') {
                    this.updateUsersChat();
                    this.appointmentRemainderModal.close();
                    this.isMessage = false;
                    this.selectUser(this.currentUser);
                    this.appointmentRemainderData = {
                        date: null,
                        time: '',
                        cust_id: '',
                        cust_mobile: '',
                    };
                } else {
                    this.isMessage = false;
                    this.coloredToast('danger', "Can't fetch whatsapp messages");
                }
            });
        }
    }

    forwardModalClose() {
        this.selectedCustomers = [];
        this.forwardMessage = '';
        this.forwardType = '';
        this.forwardModal.close();
    }

    isSelected(person: any): boolean {
        return this.selectedCustomers.some((customer: { mobile: string; id: string }) => customer.mobile === person.wb_cus_mobile);
    }
    toggleSelection(person: any): void {
        const mobile = person.wb_cus_mobile;
        const cus_id = person.wb_cus_id;
        const index = this.selectedCustomers.findIndex((customer: { mobile: string; id: string }) => customer.mobile === mobile);
        if (index === -1) {
            this.selectedCustomers.push({ mobile: mobile, cus_id: cus_id });
        } else {
            this.selectedCustomers.splice(index, 1);
        }
    }

    forwardMessages() {
        // console.log('message>>>>>>>>>>>>>', this.forwardMessage);
        if (this.forwardType == 1) {
            //text message forwarding
            let data = {
                alm_wb_msg_source: '2',
                alm_wb_msg_staff_id: atob(atob(localStorage.getItem('us_id') || '{}')),
                alm_wb_msg_type: '4',
                alm_wb_msg_content: this.forwardMessage.alm_wb_msg_content,
                alm_wb_msg_status: 1,
                alm_wb_msg_reply_id: '0',
                alm_wb_msg_created_on: Date.now(),
                alm_wb_msg_customers: this.selectedCustomers,
                alm_wb_msg_delete_flag: '0',
                messageId: this.forwardMessage.alm_wb_msg_master_id,
            };

            this.userServices.forwardWhatsappMessage(data).subscribe((rdata: any) => {
                if (rdata.ret_data === 'success') {
                    this.coloredToast('success', 'Message Send Successfully');
                    this.selectedCustomers = [];
                    this.forwardMessage = '';
                    this.forwardType = '';
                    this.forwardModal.close();
                } else {
                    // this.isMessage = false;
                    this.coloredToast('danger', "Can't Send whatsapp messages");
                }
            });
        } else if (this.forwardType == 2) {
            //Location message forwarding
            const parsedData = JSON.parse(this.forwardMessage.alm_wb_msg_content);
            const latitude = parsedData.lat;
            const longitude = parsedData.lng;
            let data = {
                alm_wb_msg_source: '2',
                alm_wb_msg_staff_id: atob(atob(localStorage.getItem('us_id') || '{}')),
                alm_wb_msg_type: '12',
                alm_wb_msg_content: this.forwardMessage.alm_wb_msg_content,
                alm_wb_msg_status: 1,
                alm_wb_msg_customer: this.currentUser.wb_cus_id,
                alm_wb_msg_reply_id: '0',
                alm_wb_msg_created_on: Date.now(),
                alm_wb_msg_customers: this.selectedCustomers,
                alm_wb_msg_delete_flag: '0',
                alm_wb_msg_latitude: latitude,
                alm_wb_msg_longitude: longitude,
                // alm_wb_msg_name:locationName,
                // alm_wb_msg_address:locationAddress
            };
            this.userServices.forwardLocationToCustomer(data).subscribe((rdata: any) => {
                if (rdata.ret_data === 'success') {
                    this.coloredToast('success', 'Message Send Successfully');
                    this.selectedCustomers = [];
                    this.forwardMessage = '';
                    this.forwardType = '';
                    this.forwardModal.close();
                } else {
                    this.coloredToast('danger', "Can't Send whatsapp messages");
                }
            });
        } else if (this.forwardType == 3) {
            //Image message forwarding
            let data = {
                alm_wb_msg_source: '2',
                alm_wb_msg_staff_id: atob(atob(localStorage.getItem('us_id') || '{}')),
                alm_wb_msg_type: '12',
                message: this.forwardMessage.alm_wb_msg_content,
                alm_wb_msg_status: 1,
                alm_wb_msg_reply_id: '0',
                alm_wb_msg_created_on: Date.now(),
                alm_wb_msg_customers: this.selectedCustomers,
                alm_wb_msg_delete_flag: '0',
                messageId: this.forwardMessage.alm_wb_msg_master_id,
            };
            this.userServices.forwardMessageWithMedia(data).subscribe((rdata: any) => {
                if (rdata.ret_data === 'success') {
                    this.coloredToast('success', 'Message Send Successfully');
                    this.selectedCustomers = [];
                    this.forwardMessage = '';
                    this.forwardType = '';
                    this.forwardModal.close();
                } else {
                    this.coloredToast('danger', "Can't send whatsapp messages");
                }
            });
        } else if (this.forwardType == 4) {
            //Audio Message Forwarding
            let data = {
                alm_wb_msg_source: '2',
                alm_wb_msg_staff_id: atob(atob(localStorage.getItem('us_id') || '{}')),
                alm_wb_msg_type: this.forwardMessage.type,
                alm_wb_msg_content: this.forwardMessage.alm_wb_msg_content,
                alm_wb_msg_status: 1,
                // alm_wb_msg_customer: this.currentUser.wb_cus_id,
                alm_wb_msg_reply_id: '0',
                alm_wb_msg_created_on: Date.now(),
                alm_wb_msg_customers: this.selectedCustomers,
                alm_wb_msg_delete_flag: '0',
                messageId: this.forwardMessage.alm_wb_msg_master_id,
            };
            this.userServices.forwardMessageWithAudio(data).subscribe((rdata: any) => {
                if (rdata.ret_data === 'success') {
                    this.coloredToast('success', 'Message Send Successfully');
                    this.selectedCustomers = [];
                    this.forwardMessage = '';
                    this.forwardType = '';
                    this.forwardModal.close();
                } else {
                    this.coloredToast('danger', "Can't Send whatsapp messages");
                }
            });
        }
    }

    isValidLatLng(content: string): boolean {
        try {
            const parsed = JSON.parse(content);
            // Check if lat and lng are present and convertible to numbers
            return !isNaN(parseFloat(parsed.lat)) && !isNaN(parseFloat(parsed.lng));
        } catch (e) {
            return false;
        }
    }

    parseLatLng(content: string): { lat: number; lng: number } {
        const parsed = JSON.parse(content);
        return {
            lat: parseFloat(parsed.lat),
            lng: parseFloat(parsed.lng),
        };
    }

    getUnreadMessages(num: any) {
        this.unreadCount = 0;
        if (num != 0) {
            this.isLoading = true;
            this.selectedFilter = 6;
            this.selectedFollowUp = 'six';
            this.allCustomersList = [];
        } else {
            // this.unreadMessagesFlag = false;
        }
        this.userServices.getUnreadMessages().subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                if (num != 0) {
                    this.allCustomersList = rdata.customers;
                    this.allCustomersList.forEach((element) => {
                        if (element.alm_wb_msg_created_on) {
                            const today = new Date();
                            const msgDate = new Date(element.alm_wb_msg_created_on);
                            const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                            const msgDateOnly = new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate());
                            const diffInDays = (todayDateOnly.getTime() - msgDateOnly.getTime()) / (1000 * 3600 * 24);
                            if (diffInDays === 0) {
                                // If it's today, show hour and minute
                                element['time'] = this.datePipe.transform(msgDate, 'h:mm a') || '';
                            } else if (diffInDays === 1) {
                                // If it's yesterday, show 'Yesterday'
                                element['time'] = 'Yesterday';
                            } else {
                                // Otherwise, show the date
                                element['time'] = this.datePipe.transform(msgDate, 'dd/MM/yy') || '';
                            }
                            element.followUpTimeExceeded = this.checkTimeConditions(element.wb_cus_follow_up, element.wb_cus_follow_up_time);
                        }
                        if (element.message_status_2_count > 0) {
                            this.unreadCount++;
                        }

                        this.isLoading = false;
                    });
                } else {
                    rdata.customers.forEach((element: any) => {
                        if (element.message_status_2_count > 0) {
                            this.unreadCount++;
                        }
                        this.isLoading = false;
                    });
                }
            } else {
                this.isLoading = false;
                // this.coloredToast('danger', 'No unread messages found!');
            }
        });
    }

    checkMessageType(num: any) {
        if (num == 1) {
            this.normalMessage = true;
            this.campaignMessage = false;
        } else {
            this.normalMessage = false;
            this.campaignMessage = true;
        }
    }

    onSearchTextChange(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        this.searchText = inputElement.value;
        this.searchTextChanged.next(this.searchText); // Emit the new search text
    }

    searchWhatsappCustomersByPhoneNumbers() {
        let data = {
            searchNumbers: this.numbers,
        };

        this.userServices.searchWhatsappCustomersByPhoneNumbers(data).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.allCustomersList = rdata.customers;
                const todayDateOnly = new Date(new Date().setHours(0, 0, 0, 0));
                this.allCustomersList.forEach((element) => {
                    if (element.alm_wb_msg_created_on) {
                        const msgDateOnly = new Date(new Date(element.alm_wb_msg_created_on).setHours(0, 0, 0, 0));
                        const diffInDays = (todayDateOnly.getTime() - msgDateOnly.getTime()) / (1000 * 3600 * 24);

                        element['time'] =
                            diffInDays === 0
                                ? this.datePipe.transform(element.alm_wb_msg_created_on, 'h:mm a') || ''
                                : diffInDays === 1
                                ? 'Yesterday'
                                : this.datePipe.transform(element.alm_wb_msg_created_on, 'dd/MM/yy') || '';
                    }
                });
            } else {
                this.coloredToast('danger', "Can't fetch whatsapp customers, please try again!");
            }
        });
    }

    getPurposeNotCust(type: any, num: any) {
        this.selectedFollowUp = num;
        if (this.isLoading) return;

        this.isLoading = true;

        // — capture old filter before we overwrite it —
        const wasFilter = this.selectedFilter;
        this.selectedFilter = type;

        // On filter change (or first run) reset paging
        if (this.hasMoredata === undefined || type !== wasFilter) {
            this.offsets = 0; // reset the *offsets* counter
            this.hasMoredata = true;
            this.allCustomersList = [];
        }

        const indata = {
            categorizes: type,
            limit: this.limits,
            offset: this.offsets, // now using offsets consistently
        };

        this.userServices.getPurposeNotselected(indata).subscribe((rdata: any) => {
            this.isLoading = false;

            if (rdata.ret_data !== 'success') {
                this.coloredToast('danger', "Can't fetch whatsapp messages");
                return;
            }
            if (rdata.ret_data == 'success') {
                // const fetched = rdata.wb_customers || [];
                const fetched = (rdata.wb_customers || []).map((customer: any) => {
                    const dateString = customer.alm_wb_msg_created_on;
                    if (!dateString) return { ...customer, time: 'N/A' };

                    // Create date objects for comparison
                    const now = new Date();
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);

                    // Parse API date
                    const apiDate = new Date(dateString);
                    const compareDate = new Date(apiDate.getFullYear(), apiDate.getMonth(), apiDate.getDate());

                    // Format time
                    // Use explicit type casting for time options
                    const timeOptions: Intl.DateTimeFormatOptions = {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                    };

                    const timeString = apiDate.toLocaleTimeString('en-US', timeOptions).replace(/^0/, '');

                    // Determine display format
                    let displayTime;
                    if (compareDate.getTime() === today.getTime()) {
                        displayTime = timeString; // Today - show time (e.g., 3:00 PM)
                    } else if (compareDate.getTime() === yesterday.getTime()) {
                        displayTime = 'Yesterday'; // Yesterday
                    } else {
                        // Format as DD/MM/YY
                        const day = String(apiDate.getDate()).padStart(2, '0');
                        const month = String(apiDate.getMonth() + 1).padStart(2, '0');
                        const year = String(apiDate.getFullYear()).slice(-2);
                        displayTime = `${day}/${month}/${year}`;
                    }

                    return {
                        ...customer,
                        time: displayTime,
                    };
                });
                // Use offsets here, not offset
                if (this.offsets === 0) {
                    this.allCustomersList = fetched;
                } else {
                    this.allCustomersList = [...this.allCustomersList, ...fetched];
                }

                // Decide if there is more data
                this.hasMoredata = fetched.length >= this.limits;

                // Advance offsets for next time
                if (this.hasMoredata) {
                    this.offsets += this.limits;
                }
            } else
                error: (e: any) => {
                    this.isLoading = false;
                    this.coloredToast('danger', 'Server error');
                };
        });
    }

    onLeadCategoryChange(newStatus: any, lead_id: any) {
        let data = {
            lead_id: lead_id,
            lead_category: newStatus,
        };

        this.userServices.updateLeadCategory(data).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                // this.updateUsersChat();
                // this.selectUser(this.currentUser);
            } else {
                this.isMessage = false;
                this.coloredToast('danger', "Can't fetch whatsapp messages");
            }
        });
    }

    // forwardMessages() {
    //     let data = {
    //         alm_wb_msg_source: '2',
    //         alm_wb_msg_staff_id: atob(atob(localStorage.getItem('us_id') || '{}')),
    //         alm_wb_msg_type: '4',
    //         alm_wb_msg_content: this.forwardMessage,
    //         alm_wb_msg_status: 1,
    //         alm_wb_msg_reply_id: '0',
    //         alm_wb_msg_created_on: Date.now(),
    //         alm_wb_msg_customers: this.selectedCustomers,
    //         alm_wb_msg_delete_flag: '0',
    //     };

    //     this.userServices.forwardWhatsappMessage(data).subscribe((rdata: any) => {
    //         if (rdata.ret_data === 'success') {
    //             this.coloredToast('success', 'Message Send Successfully');
    //             this.selectedCustomers = [];
    //             this.forwardMessage = '';
    //             this.forwardModal.close();
    //         } else {
    //             // this.isMessage = false;
    //             this.coloredToast('danger', "Can't Send whatsapp messages");
    //         }
    //     });
    // }
}
