import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router, NavigationEnd } from '@angular/router';
import { AppService } from '../service/app.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { StaffPostAuthService } from '../service/staff-post-auth.service';
import { webSocket } from 'rxjs/webSocket';
import { Subscription, takeWhile, tap, timer } from 'rxjs';
import { ThirdPartyApisService } from '../service/third-party-apis.service';
import { FormControl } from '@angular/forms';

@Component({
    moduleId: module.id,
    selector: 'header',
    templateUrl: './header.html',
    animations: [
        trigger('toggleAnimation', [
            transition(':enter', [style({ opacity: 0, transform: 'scale(0.95)' }), animate('100ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))]),
            transition(':leave', [animate('75ms', style({ opacity: 0, transform: 'scale(0.95)' }))]),
        ]),
    ],
})
export class HeaderComponent implements OnInit {
    user_name: string = atob(atob(localStorage.getItem('us_firstname') || '{}')).toString();
    user_email: string = atob(atob(localStorage.getItem('us_email') || '{}')).toString();
    @ViewChild('extensionSelect') extensionSelect: any;
    @ViewChild('inboundCall') inboundCall: any;

    userExtensions: any[] = [];
    public user_role = atob(atob(localStorage.getItem('us_role_id') || '{}'));
    selectedExtension: any = null;

    public call_data: any = {};

    keyData: any;
    subject: any;
    currentPhone: any;
    y_call: any;
    timeOut: any;

    temp_no: any;
    tempnumberControl: FormControl = new FormControl('');

    store: any;
    search = false;
    notifications = [
        {
            id: 1,
            profile: 'user-profile.jpeg',
            message: '<strong class="text-sm mr-1">John Doe</strong>invite you to <strong>Prototyping</strong>',
            time: '45 min ago',
        },
        {
            id: 2,
            profile: 'profile-34.jpeg',
            message: '<strong class="text-sm mr-1">Adam Nolan</strong>mentioned you to <strong>UX Basics</strong>',
            time: '9h Ago',
        },
        {
            id: 3,
            profile: 'profile-16.jpeg',
            message: '<strong class="text-sm mr-1">Anna Morgan</strong>Upload a file',
            time: '9h Ago',
        },
    ];
    messages = [
        {
            id: 1,
            image: this.sanitizer.bypassSecurityTrustHtml(
                `<span class="grid place-content-center w-9 h-9 rounded-full bg-success-light dark:bg-success text-success dark:text-success-light"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></span>`
            ),
            title: 'Congratulations!',
            message: 'Your OS has been updated.',
            time: '1hr',
        },
        {
            id: 2,
            image: this.sanitizer.bypassSecurityTrustHtml(
                `<span class="grid place-content-center w-9 h-9 rounded-full bg-info-light dark:bg-info text-info dark:text-info-light"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></span>`
            ),
            title: 'Did you know?',
            message: 'You can switch between artboards.',
            time: '2hr',
        },
        {
            id: 3,
            image: this.sanitizer.bypassSecurityTrustHtml(
                `<span class="grid place-content-center w-9 h-9 rounded-full bg-danger-light dark:bg-danger text-danger dark:text-danger-light"> <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>`
            ),
            title: 'Something went wrong!',
            message: 'Send Reposrt',
            time: '2days',
        },
        {
            id: 4,
            image: this.sanitizer.bypassSecurityTrustHtml(
                `<span class="grid place-content-center w-9 h-9 rounded-full bg-warning-light dark:bg-warning text-warning dark:text-warning-light"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">    <circle cx="12" cy="12" r="10"></circle>    <line x1="12" y1="8" x2="12" y2="12"></line>    <line x1="12" y1="16" x2="12.01" y2="16"></line></svg></span>`
            ),
            title: 'Warning',
            message: 'Your password strength is low.',
            time: '5days',
        },
    ];

    public commonNumbers: any = [];

    // private timerSubscription: Subscription;
    private shouldContinue = true;
    @ViewChild('session') session: any;

    constructor(
        public translate: TranslateService,
        public storeData: Store<any>,
        public router: Router,
        private appSetting: AppService,
        private sanitizer: DomSanitizer,
        private userServices: StaffPostAuthService,
        private third_party: ThirdPartyApisService
    ) {
        this.initStore();
        // const interval = 1 * 60 * 1000; // 2 minutes in milliseconds
        // const timer$ = timer(0, interval).pipe(takeWhile(() => this.shouldContinue));

        // this.timerSubscription = timer$.subscribe(() => {
        //     // Call your function here
        //     this.changeOfRoutes();
        // });
        // router.events.subscribe((val) => {
        //     // see also
        //     this.changeOfRoutes();
        // });

        this.userServices.getExcludedNumberList().subscribe((rData: any) => {
            this.commonNumbers = rData.numlist;
        });
    }
    async initStore() {
        this.storeData
            .select((d) => d.index)
            .subscribe((d) => {
                this.store = d;
            });
    }

    ngOnInit() {
        // this.setActiveDropdown();
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.setActiveDropdown();
            }
        });
        if (localStorage.getItem('token_time') != null) {
            var diffMs = +new Date() - +new Date(localStorage.getItem('token_time') || '{}');
            let diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
            if (diffMins < 1380) {
                this.createSocketConnection(atob(atob(atob(localStorage.getItem('yestar_token') || '{}'))));
            }
        }
        this.getYeastarData();
    }

    getYeastarData() {
        this.userServices.GetYeaStarKeys().subscribe((rData: any) => {
            if (rData.ret_data == 'success') {
                this.keyData = rData.yeastar_data;
                let timediff = new Date().getTime() - new Date(this.keyData.yeastar_token_time).getTime();
                let timeDiffMin = Math.floor(timediff / 60000);
                this.refreshingToken(this.keyData, timeDiffMin);
                localStorage.setItem('yestar_token', this.keyData.yeastar_token);
                this.createSocketConnection(atob(atob(atob(this.keyData.yeastar_token))));
                const us_ext_no = localStorage.getItem('us_ext_no');
                console.log(us_ext_no);
                if (!us_ext_no && (this.user_role == '11' || this.user_role == '9')) {
                    this.third_party.getExtensionList(atob(atob(atob(rData.yeastar_data.yeastar_token)))).subscribe((rDataN: any) => {
                        this.userExtensions = rDataN.data;
                        this.storeData.dispatch({ type: 'toggleSidebar' });
                        this.extensionSelect.open();
                    });
                }
            } else {
                this.coloredToast('danger', 'Cant establish connection with phone');
            }
        });
    }

    createSocketConnection(token: any) {
        const socketUrl = `wss://almaraghidxb.ras.yeastar.com/openapi/v1.0/subscribe?access_token=${token}`;
        this.subject = webSocket(socketUrl);

        this.subject.subscribe((err: any) => console.log('Socket Error:', err));
        this.subject.next({ topic_list: [30008, 30011, 30012] });

        setInterval(() => {
            this.subject.next('heartbeat');
        }, 50000);

        this.subject
            .pipe(
                tap((data: { [x: string]: number }) => {
                    if (data['type'] == 30011) {
                        this.handleType30011(data);
                    } else if (data['type'] == 30012) {
                        // this.handleType30012(data);
                    }
                })
            )
            .subscribe();
    }

    handleType30011(data: any) {
        const temp = JSON.parse(data['msg']);
        // console.log("temp>>>>>>>>>>>>>>>",temp)
        if (temp['members'].length === 2) {
            temp['members'].forEach((element: any) => {
                if (element['inbound']) {
                    this.handleInboundElement(element, temp);
                }
                if (element['outbound']) {
                    // Handle outbound element if needed
                }
            });
        }
    }

    handleInboundElement(element: any, temp: any) {
        console.log('element>>>>>>>>>>>>>>>', element);
        console.log('temp???????????????????????', temp);
        console.log('this.currentPhone?????????????', this.currentPhone);
        if (
            element['inbound']['from'] !== 'Unknown' &&
            element['inbound']['member_status'] == 'ANSWERED' &&
            temp['members'][1]['extension']['number'] == atob(atob(localStorage.getItem('us_ext_no') || '{}')) &&
            temp['members'][1]['extension']['member_status'] == 'ANSWER' && // this.currentPhone !== element['inbound']['from'] &&
            (element['inbound']['from'].substring(0, 5) === '97150' ||
                element['inbound']['from'].substring(0, 5) === '97105' ||
                element['inbound']['from'].substring(0, 2) === '05' ||
                element['inbound']['from'].substring(0, 2) === '02' ||
                element['inbound']['from'].substring(0, 2) === '04')
        ) {
            console.log('temp>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', temp);
            this.currentPhone = element['inbound']['from'];
            // this.y_call.push(temp['call_id']); //error on this line

            const data = {
                phone: element['inbound']['from'],
                call_to: atob(atob(localStorage.getItem('us_ext_no') || '{}')),
                call_id: temp['call_id'],
                lcl_call_type: '0',
                lcl_call_source: element['inbound']['trunk_name'] == '025503556' ? '1' : '0',
            };

            this.userServices.checkNumber(data).subscribe((rdata: any) => {
                if (rdata.ret_data === 'success') {
                    this.handleCheckNumberSuccess(element, temp, rdata);
                }
            });
        }
    }

    tempHandleInboundElement() {
        this.temp_no = this.generateRandomPhoneNumber();

        const data = {
            phone: this.temp_no, //0551651819
            call_to: '200',
            call_id: '1702040392.39006',
            lcl_call_type: '1',
            lcl_call_source: '1',
        };

        this.userServices.checkNumber(data).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.handleCheckNumberSuccess22(rdata);
            }
        });
    }

    generateRandomPhoneNumber(): string {
        let prefixOptions = ['02', '05', '9715', '97105'];
        let randomPrefix = prefixOptions[Math.floor(Math.random() * prefixOptions.length)];
        let maxLength = randomPrefix === '05' ? 10 : randomPrefix === '9715' ? 11 : randomPrefix === '02' ? 11 : 12;
        let phoneNumber = randomPrefix;

        for (let i = 0; i < maxLength - randomPrefix.length; i++) {
            phoneNumber += Math.floor(Math.random() * 10);
        }

        return phoneNumber;
    }

    searchexistingCust() {
        const tempnumber = this.tempnumberControl.value;
        this.temp_no = tempnumber;
        const data = {
            phone: this.temp_no, //0551651819
            call_to: '200',
            call_id: '1702040392.39006',
            lcl_call_type: '1',
            lcl_call_source: '1',
        };

        this.userServices.checkNumber(data).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                this.handleCheckNumberSuccess22(rdata);
            }
        });
    }

    handleCheckNumberSuccess22(rdata: any) {
        this.call_data = {
            title_type: 'Marketing Call',
            phone: this.temp_no, //0551651819
            leadId: rdata.pendId,
            rec_call_id: '1702040392.39006',
            call_log_id: rdata.call_log_id,
        };
        this.storeData.dispatch({ type: 'toggleSidebar' });
        console.log(this.call_data);
        this.inboundCall.open();
    }

    closeInboundCallModal() {
        this.storeData.dispatch({ type: 'toggleSidebar' });
        this.inboundCall.close();
    }

    handleCheckNumberSuccess(element: any, temp: any, rdata: any) {
        let titlee = 'Normal Call';
        if (element['inbound']['trunk_name'] === '025503556') {
            titlee = 'Marketing Call';
        }
        this.call_data = {
            title_type: titlee,
            phone: element['inbound']['from'],
            leadId: rdata.pendId,
            rec_call_id: temp['call_id'],
            call_log_id: rdata.call_log_id,
        };
        this.storeData.dispatch({ type: 'toggleSidebar' });
        console.log('this.call_data<>>>>>before opening modal>>>>>>>>>>>>>>>', this.call_data);
        this.inboundCall.open();
        // this.dialogService.open(CallPopupComponent, {
        //     hasBackdrop: true, closeOnBackdropClick: false,
        //     context: {
        //         title_type: titlee,
        //         phone: element['inbound']['from'],
        //         leadid: rdata.pendId,
        //         rec_call_id: temp['call_id'],
        //         call_log_id: rdata.call_log_id,
        //     },
        // }).onClose.subscribe((dataa) => {
        //     if (dataa) {
        //         this.leads.push(dataa);
        //     }
        // });
    }

    refreshingToken(keydata: any, timeDiff: any) {
        let count = 26 - timeDiff;
        if (count <= 26 && count > 0) {
            clearTimeout(this.timeOut);
            this.timeOut = setTimeout(() => {
                this.getYeastarData();
                this.refreshingToken(keydata, timeDiff);
            }, count * 60000);
        } else {
            clearTimeout(this.timeOut);
            this.timeOut = setTimeout(() => {
                this.getYeastarData();
                this.refreshingToken(keydata, timeDiff);
            }, 5 * 60000);
            //this.showToast("warning", "Token Error!!!", "An error occured in token sync");
        }
    }

    setActiveDropdown() {
        const selector = document.querySelector('ul.horizontal-menu a[routerLink="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const all: any = document.querySelectorAll('ul.horizontal-menu .nav-link.active');
            for (let i = 0; i < all.length; i++) {
                all[0]?.classList.remove('active');
            }
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link');
                if (ele) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele?.classList.add('active');
                    });
                }
            }
        }
    }

    removeNotification(value: number) {
        this.notifications = this.notifications.filter((d) => d.id !== value);
    }

    removeMessage(value: number) {
        this.messages = this.messages.filter((d) => d.id !== value);
    }

    changeLanguage(item: any) {
        this.translate.use(item.code);
        this.appSetting.toggleLanguage(item);
        if (this.store.locale?.toLowerCase() === 'ae') {
            this.storeData.dispatch({ type: 'toggleRTL', payload: 'rtl' });
        } else {
            this.storeData.dispatch({ type: 'toggleRTL', payload: 'ltr' });
        }
        window.location.reload();
    }

    userLogout() {
        localStorage.clear();
        this.coloredToast('warning', 'You are logged out successfully');
        this.router.navigate(['']).then(() => {
            window.location.reload();
        });
    }

    saveExtension() {
        let data = {
            name: this.user_name,
            role_id: this.user_role,
            us_id: atob(atob(localStorage.getItem('us_id') || '')),
            ext_no: this.selectedExtension,
            action: 'Login',
        };
        this.userServices.updateUserLoginLog(data).subscribe((rdata: any) => {
            if (rdata.ret_data === 'success') {
                localStorage.setItem('us_ext_no', btoa(btoa(this.selectedExtension)));
                localStorage.setItem('us_login_id', btoa(btoa(rdata.result != null ? rdata.result : '')));
                this.coloredToast('success', ' Your Extension Number Updated');
                this.storeData.dispatch({ type: 'toggleSidebar' });
                this.extensionSelect.close();
            } else {
                this.coloredToast('danger', ' Some error occurred please try again');
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

    changeOfRoutes() {
        this.userServices.userLoginValidity().subscribe(
            (rData: any) => {},
            (error) => {
                this.shouldContinue = false; //Error callback
                this.storeData.dispatch({ type: 'toggleSidebar' });
                this.session.open();
            }
        );
    }
}
